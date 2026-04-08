import {
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useContext, useEffect, useState} from 'react';
import Constants, {Currency, FONTS} from '../../../Assets/Helpers/constant';
import {
  DownarrowIcon,
  FavIcon,
  Location2Icon,
  NotificationIcon,
  Search2Icon,
  SearchIcon,
  UnfavIcon,
} from '../../../../Theme';
import {navigate} from '../../../../navigationRef';
import {GetApi, Post} from '../../../Assets/Helpers/Service';
import {
  AddressContext,
  FoodUserContext,
  LoadContext,
  ToastContext,
  UserContext,
} from '../../../../App';
import { isDate } from 'moment';
import { useTranslation } from 'react-i18next';
import TranslateHandled from '../../../Assets/Component/TranslateHandled';

const Home = () => {
  const { t } = useTranslation();
  const [selectcat, setSelectcat] = useState();
  const [toast, setToast] = useContext(ToastContext);
  const [loading, setLoading] = useContext(LoadContext);
  const [locationadd, setlocationadd] = useContext(AddressContext);
  const [fooduserProfile, setfooduserProfile] = useContext(FoodUserContext);
  const [user, setUser] = useContext(UserContext);
  const [page, setPage] = useState(1);
  const [curentData, setCurrentData] = useState([]);
  const [productlist, setproductlist] = useState();
  const [catlist, setcatlist] = useState([]);

  useEffect(() => {
    getcategory();
  }, []);
  const getcategory = () => {
    setLoading(true);
    GetApi(`getFoodCategory`).then(
      async res => {
        setLoading(false);
        console.log(res);
        setcatlist(res.data);
        if (res.data && res.data.length > 0) {
          setSelectcat(res.data[0]._id);
          getProduct(1, res.data[0]._id);
        }
      },
      err => {
        setLoading(false);
        console.log(err);
      },
    );
  };
  const togglefav = (id) => {
    setLoading(true);
    const data = {
      foodid:id
    }
    Post(`togglefavorite`,data).then(
      async res => {
        setLoading(false);
        getProduct(page, selectcat)
      },
      err => {
        setLoading(false);
        console.log(err);
      },
    );
  };
  const getProduct = (p, params) => {
    setPage(p);
    setLoading(true);
    GetApi(`getFoodbycategory/${params}?page=${p}&userId=${user?._id}`).then(
      async res => {
        setLoading(false);
        console.log(res);
        setCurrentData(res.data);
        if (p === 1) {
          setproductlist(res.data);
        } else {
          setproductlist([...productlist, ...res.data]);
        }

        // setRefreshing(false)
      },
      err => {
        setLoading(false);
        console.log(err);
      },
    );
  };
  const fetchNextPage = () => {
    if (curentData.length === 20) {
      getProduct(page + 1, selectcat);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={{height: '25%'}}>
        <ImageBackground
          source={require('../../../Assets/Images/foodbaner.png')}
          style={{height: '110%', padding: 20}}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <TouchableOpacity onPress={() => navigate('Shipping')}>
              <View style={{flexDirection: 'row'}}>
                <Text style={styles.locopttxt}>{t("Your Location")}</Text>
                <DownarrowIcon color={Constants.white} />
              </View>
              <View style={{flexDirection: 'row'}}>
                <Location2Icon color={Constants.white}/>
                {/* <Text style={styles.locopttxt2} numberOfLines={1}>
                  New York City
                </Text> */}
                {fooduserProfile?.shipping_address?.address ? (
                  <Text style={styles.locopttxt2} numberOfLines={1}>
                    {fooduserProfile?.shipping_address?.house_no},{' '}
                    {fooduserProfile?.shipping_address?.address}
                  </Text>
                ) : (
                  <Text style={styles.locopttxt2} numberOfLines={1}>
                    {locationadd}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
            <View style={{flexDirection: 'row', gap: 10}}>
              <Search2Icon onPress={() => navigate('SearchPage')} />
              <NotificationIcon onPress={() => navigate('FoodUserNotification')}/>
            </View>
          </View>
          <Text style={styles.boldtxt}>
            {t("Provide the best food for you")}
          </Text>
        </ImageBackground>
      </View>
      <View style={styles.covline}>
        <Text style={styles.categorytxt}>{t("Find by Category")}</Text>
        <Text
          style={styles.seealltxt}
          onPress={() => navigate('FoodCategories')}>
          {t("See all")}
        </Text>
      </View>
      <View>
      <FlatList
              data={catlist}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{marginHorizontal:20}}
              renderItem={({item, index}) =>
            <TouchableOpacity
              key={index}
              style={[
                styles.box,
                {
                  backgroundColor:
                    selectcat === item._id
                      ? Constants.dark_green
                      : Constants.white,
                },
              ]}
              onPress={() => {
                setSelectcat(item._id), getProduct(1, item._id);
              }}>
              {/* <Image source={require('../../../Assets/Images/barger.png')} /> */}
              <Image
                source={{uri: item?.image}}
                style={styles.catimg}
                resizeMode="contain"
              />
              <Text
              numberOfLines={1}
                style={[
                  styles.cattxt,
                  {
                    color:
                      selectcat === item._id
                        ? Constants.white
                        : Constants.customgrey2,
                  },
                ]}>
                {/* {item?.name} */}
                <TranslateHandled text={item?.name} />
              </Text>
            </TouchableOpacity>
          }/>
          </View>
      <FlatList
        data={productlist}
        style={{marginTop: 15, marginRight: 15,marginBottom:70}}
        numColumns={2}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.prodbox}
            onPress={() => navigate('PreView', item?._id)}>
            <Image
              source={{uri: item?.image[0]}}
              style={{height: 106, width: '100%', borderRadius: 10}}
            />
            <Text style={styles.proname}>{item?.name}</Text>
            {/* <View style={styles.watlogocov}> */}
            <Text style={styles.pricetxt}>{Currency} {item?.price}</Text>
            {/* <Image source={{uri:item?.seller_profile?.store_logo}} style={styles.logoimg}/>
                              </View> */}
            <TouchableOpacity style={styles.iconcov} onPress={() => togglefav(item?._id)}>
              <UnfavIcon color={item?.isFavorite?'#F14141':Constants.white}/>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        onEndReached={() => {
          if (productlist && productlist.length > 0) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.05}
      />
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.white,
  },
  locopttxt: {
    fontSize: 14,
    color: Constants.white,
    fontFamily: FONTS.Regular,
  },
  locopttxt2: {
    fontSize: 14,
    color: Constants.white,
    fontFamily: FONTS.Medium,
    marginLeft: 5,
    width: '60%',
  },
  boldtxt: {
    fontSize: 22,
    color: Constants.white,
    fontFamily: FONTS.Medium,
    marginTop: 15,
    width:'80%',
    // position:'absolute',
    // bottom:40,
    // left:20
  },
  covline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginVertical: 10,
    // backgroundColor:Constants.red
  },
  seealltxt: {
    fontSize: 14,
    color: Constants.dark_green,
    fontFamily: FONTS.Medium,
    marginHorizontal: 10,
  },
  cattxt: {
    fontSize: 14,
    color: Constants.customgrey2,
    fontFamily: FONTS.Medium,
    // marginTop: 5,
  },
  categorytxt: {
    fontSize: 16,
    color: Constants.black,
    fontFamily: FONTS.SemiBold,
  },
  pricetxt: {
    fontSize: 14,
    color: Constants.dark_green,
    fontFamily: FONTS.SemiBold,
    alignSelf: 'flex-start',
  },
  proname: {
    fontSize: 14,
    color: Constants.dark_green,
    fontFamily: FONTS.SemiBold,
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  box: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    // height: 80,
    padding: 8,
    // paddingHorizontal: 20,
    borderRadius: 10,
    boxShadow: '2 5 6 0 grey',
  },
  prodbox: {
    marginHorizontal: 10,
    width: '47%',
    // flex: 1,
    // backgroundColor: Constants.red,
    padding: 10,
    borderRadius: 15,
    // justifyContent:'center',
    alignItems: 'center',
    boxShadow: '0 0 6 0.5 grey',
    // shadowOpacity: 0.2,
    // shadowColor: 'grey',
    // elevation:1,
    // height: 180,
  },
  catimg: {
    height: 30,
    width: 30,
  },
  iconcov: {
    height: 30,
    width: 30,
    borderRadius:30,
    backgroundColor: Constants.white,
    position: 'absolute',
    top: 15,
    right: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  watlogocov:{
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
    marginHorizontal:20,
    // backgroundColor:'red',
    width:'100%',
  },
  logoimg:{
    height:20,
    width:20,
    borderRadius:40,
    resizeMode:'stretch'
  },
});
