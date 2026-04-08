import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useContext, useEffect, useState} from 'react';
import Constants, {Currency, FONTS} from '../../../Assets/Helpers/constant';
import {PlusIcon, RightArrow, SearchIcon} from '../../../../Theme';
import LinearGradient from 'react-native-linear-gradient';
import {navigate} from '../../../../navigationRef';
import {GetApi, Post} from '../../../Assets/Helpers/Service';
import {ShoppingCartContext, LoadContext, ToastContext, ShoppingUserContext} from '../../../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SwiperFlatList from 'react-native-swiper-flatlist';
import ShoppingHeader from '../../../Assets/Component/ShoppingHeader';
import {useTranslation} from 'react-i18next';
import Scheliton from '../../../Assets/Component/Scheliton';
import TranslateHandled from '../../../Assets/Component/TranslateHandled';
import CuurentLocation from '../../../Assets/Component/CuurentLocation';

const Home = () => {
  const {t} = useTranslation();
  const [shoppingcartdetail, setshoppingcartdetail] =
    useContext(ShoppingCartContext);
  const [toast, setToast] = useContext(ToastContext);
  const [loading, setLoading] = useContext(LoadContext);
  const [imgLoading, setImgLoading] = useState(true);
  const [categorylist, setcategorylist] = useState();
  const [topsellinglist, settopsellinglist] = useState([]);
  const [carosalimg, setcarosalimg] = useState([]);
  const [storelist, setstorelist] = useState([]);
  const [shoppinguserProfile, setshoppinguserProfile] =useContext(ShoppingUserContext)
  useEffect(() => {
    getCategory();
    getTopSoldProduct();
    getSetting();
  }, []);
  useEffect(() => {
    getnearbyshops()
  }, [shoppinguserProfile]);

  const getCategory = () => {
    setLoading(true);
    GetApi(`getShoppingCategory?limit=8`, {}).then(
      async res => {
        setLoading(false);
        console.log(res);
        if (res.status) {
          setcategorylist(res.data);
        }
      },
      err => {
        setLoading(false);
        console.log(err);
      },
    );
  };
  const getTopSoldProduct = () => {
    setLoading(true);
    GetApi(`getTopSoldShopping?limit=5`, {}).then(
      async res => {
        setLoading(false);
        console.log(res);
        if (res.status) {
          settopsellinglist(res.data);
        }
      },
      err => {
        setLoading(false);
        console.log(err);
      },
    );
  };
  const getSetting = () => {
    // setLoading(true);
    GetApi(`getShoppingCarousel`, {}).then(
      async res => {
        setLoading(false);
        console.log(res);
        if (res.success) {
          setcarosalimg(res?.shoppingcarousel[0].carousel);
        }
      },
      err => {
        setLoading(false);
        console.log(err);
      },
    );
  };
  const getnearbyshops = () => {
    setLoading(true);
    if (shoppinguserProfile?.shipping_address?.location?.coordinates?.length > 0) {
    // Use saved location
    const data = {
      role: 'SHOPPINGSELLER',
      location: shoppinguserProfile.shipping_address.location,
    };

    Post(`getnearbystore`, data)
      .then(async res => {
        setLoading(false);
        console.log(res);
        if (res.status) {
          setstorelist(res.data);
        }
      })
      .catch(err => {
        setLoading(false);
        console.log(err);
      });
  } else {
    // Fetch current location
    CuurentLocation(res => {
      const data = {
        role: 'SHOPPINGSELLER',
        location: {
          type: 'Point',
          coordinates: [res.coords.longitude, res.coords.latitude],
        },
      };

      Post(`getnearbystore`, data)
        .then(async res => {
          setLoading(false);
          console.log(res);
          if (res.status) {
            setstorelist(res.data);
          }
        })
        .catch(err => {
          setLoading(false);
          console.log(err);
        });
    });
  }
  };

  const width = Dimensions.get('window').width;
  const width2 = Dimensions.get('window').width - 30;
  return (
    <SafeAreaView style={styles.container}>
      <ShoppingHeader />
      <View
        style={{backgroundColor: Constants.normal_green, paddingBottom: 15}}>
        <TouchableOpacity
          style={[styles.inpcov]}
          onPress={() => {
            console.log('enter'), navigate('ShoppingSearchpage');
          }}>
          <SearchIcon height={20} width={20} color={Constants.black} />
          <TextInput
            style={styles.input}
            editable={false}
            placeholder={t('Search')}
            onPress={() => navigate('ShoppingSearchpage')}
            placeholderTextColor={Constants.customgrey2}></TextInput>
        </TouchableOpacity>
      </View>
      <ScrollView
        style={{marginBottom: Platform.OS === 'android' ? 70 : 40}}
        showsVerticalScrollIndicator={false}>
        <LinearGradient
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          colors={['#216D3E', '#1B3826']}
          style={styles.btn}>
          <Text style={styles.btntxt}>
            {t('We provide you the instant delivery !')}
          </Text>
        </LinearGradient>
        {/* <View style={styles.shopcov}>
                  {storelist &&
                    storelist.length > 0 &&
                    storelist.map((item, index) =>{return(index + 1) < 3 && (
                          <TouchableOpacity style={{alignItems: 'center',width:'33%'}} key={index} onPress={()=>navigate("ShoppingShops")}>
                            <Image
                              source={{uri: item?.store_logo}}
                              style={{height: 80, width: 80, borderRadius: 70}}
                            />
                            <Text style={styles.shopname}>{item?.store_name}</Text>
                          </TouchableOpacity>
                        )
                    })}
                    {storelist?.length>1&&<Text style={styles.sealtxt} onPress={()=>navigate("ShoppingShops")}>See All</Text>}
                </View> */}
        <View style={{marginVertical: 20}}>
          {carosalimg && carosalimg?.length > 0 ? (
            <SwiperFlatList
              autoplay
              autoplayDelay={2}
              autoplayLoop
              // index={2}
              // showPagination
              // paginationActiveColor="red"
              data={carosalimg || []}
              // renderItem={({item}) => (
              //   <View style={[styles.child, {backgroundColor: item}]}>
              //     <Text style={styles.text}>{item}</Text>
              //   </View>
              // )}
              renderItem={({item, index}) => (
                <TouchableOpacity
                  style={{width: width, alignItems: 'center'}}
                  onPress={() => {
                    item.shopping_id &&
                      navigate('ShoppingPreview', item.shopping_id);
                  }}>
                  {imgLoading && (
                    <ActivityIndicator
                      size="small"
                      color="#999"
                      style={StyleSheet.absoluteFill}
                    />
                  )}
                  <Image
                    source={{uri: `${item.image}`}}
                    // source={item.images}
                    style={{
                      height: 180,
                      width: width2,
                      borderRadius: 20,
                      // marginLeft:-10,
                      // backgroundColor: 'red',
                      alignSelf: 'center',
                    }}
                    resizeMode="stretch"
                    onLoadStart={() => setImgLoading(true)}
                    onLoadEnd={() => setImgLoading(false)}
                    onError={() => setImgLoading(false)}
                    key={index}
                  />
                </TouchableOpacity>
              )}
            />
          ) : (
            <Scheliton />
          )}
        </View>

        <View style={styles.covline}>
          <Text style={styles.categorytxt}>{t('Top Selling Items')}</Text>
          <TouchableOpacity
            style={{flexDirection: 'row'}}
            onPress={() =>
              navigate('ShoppingProducts', {
                name: 'Top Selling Items',
                type: 'topselling',
              })
            }>
            <Text style={styles.seealltxt}>{t('See all')}</Text>
            <RightArrow
              height={14}
              width={14}
              style={{alignSelf: 'center'}}
              color={Constants.normal_green}
            />
          </TouchableOpacity>
        </View>
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
          {topsellinglist &&
            topsellinglist.length > 0 &&
            topsellinglist.map((item, i) => (
              <View
                style={[
                  styles.shadowWrapper,
                  {marginRight: topsellinglist.length === i + 1 ? 20 : 10},
                ]}
                key={i}>
                <TouchableOpacity
                  style={[styles.box]}
                  onPress={() => navigate('ShoppingPreview', item._id)}>
                  {/* <ImageBackground source={require('../../Assets/Images/start.png')} style={styles.star}></ImageBackground> */}
                  <Image
                    // source={require('../../Assets/Images/salt.png')}
                    source={{uri: item?.variants[0].image[0]}}
                    style={styles.cardimg}
                    resizeMode="stretch"
                  />
                  {item?.variants && item?.variants?.length > 0 && (
                    <ImageBackground
                      source={require('../../../Assets/Images/star.png')}
                      style={styles.cardimg2}>
                      <Text style={styles.offtxt}>
                        {(
                          ((Number(
                            item?.variants[0]?.selected[0]?.other_price,
                          ) -
                            Number(item?.variants[0]?.selected[0]?.our_price)) /
                            Number(
                              item?.variants[0]?.selected[0]?.other_price,
                            )) *
                          100
                        ).toFixed(0)}
                        %
                      </Text>
                      <Text style={styles.offtxt}>{t('off')}</Text>
                    </ImageBackground>
                  )}
                  {/* <View style={styles.watlogocov}> */}
                  <Text numberOfLines={2} style={styles.proname}>{item.name}</Text>
                  {/* <Image
                      source={{uri: item?.seller_profile?.store_logo}}
                      style={styles.logoimg}
                    />
                  </View> */}
                  {/* {item?.variants?.[0]?.selected && (
                    <Text style={styles.weight}>
                      {item?.variants?.[0]?.selected.map((it)=>{return(`${it?.value} ,`)})}
                    </Text>
                  )} */}
                  {/* <View style={{ flexDirection: 'row', flex: 1,  marginHorizontal: 15,marginBottom:10, }}> */}
                    
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      gap: 10,
                      alignItems: 'center',
                      marginHorizontal: 15,
                    }}>
                    {item?.variants && item?.variants?.length > 0 && (
                      <Text style={styles.disctxt}>
                        {Currency}
                        {item?.variants[0]?.selected[0]?.our_price}
                      </Text>
                    )}
                    {item?.variants && item?.variants?.length > 0 && (
                      <Text style={styles.maintxt}>
                        {Currency}
                        {item?.variants[0]?.selected[0]?.other_price}
                      </Text>
                    )}
                  </View>
                  
                  {/* <TouchableOpacity style={styles.pluscov} onPress={() => cartdata(item)}>
                  <PlusIcon height={20} width={20} />
                </TouchableOpacity> */}
                  {/* </View> */}
                </TouchableOpacity>
              </View>
            ))}
        </ScrollView>
        <View style={styles.covline}>
          <Text style={styles.categorytxt}>{t('Explore By Categories')}</Text>
          <TouchableOpacity
            style={{flexDirection: 'row'}}
            onPress={() =>
              navigate('ShoppingCategories')
            }>
            <Text style={styles.seealltxt}>{t('See all')}</Text>
            <RightArrow
              height={14}
              width={14}
              style={{alignSelf: 'center'}}
              color={Constants.normal_green}
            />
          </TouchableOpacity>
        </View>
        <FlatList
          data={categorylist}
          scrollEnabled={false}
          numColumns={4}
          style={{width: '100%', gap: 5, marginVertical: 10}}
          renderItem={({item}) => (
            <TouchableOpacity
              style={{flex: 1, marginVertical: 10}}
              onPress={() =>
                navigate('ShoppingProducts', {id: item._id, name: item.name})
              }>
              <View style={styles.categorycircle}>
                {item?.image && (
                  <Image
                    // source={item.img}
                    source={{uri: `${item?.image}`}}
                    style={styles.categoryimg}
                    resizeMode="stretch"
                  />
                )}
              </View>
              <View style={{flex: 1}}>
                <Text style={styles.categorytxt2}>
                  <TranslateHandled text={item?.name} />
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.white,
  },
  inpcov: {
    // borderWidth: 1,
    borderColor: Constants.customgrey,
    backgroundColor: Constants.white,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginHorizontal: 20,
  },
  input: {
    flex: 1,
    color: Constants.black,
    fontFamily: FONTS.Medium,
    fontSize: 16,
    textAlign: 'left',
    minHeight: 45,
    marginLeft: 10,
    // backgroundColor:Constants.red
  },
  btn: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btn2: {
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    borderRadius: 30,
    marginHorizontal: 10,
  },
  btntxt: {
    color: Constants.white,
    fontSize: 16,
    fontFamily: FONTS.Black,
    fontStyle: 'italic',
    fontWeight: '700',
  },
  caroimg: {
    width: '100%',
    // resizeMode:'contain',
    // backgroundColor:'red',
    marginVertical: 20,
  },
  // box: {
  //   width: 180,
  //   marginVertical: 20,
  //   paddingTop: 30,
  //   paddingBottom: 10,
  //   borderRadius: 20,
  //   marginHorizontal: 10,
  //   boxShadow: '0 0 6 0.5 grey',
  //   overflow: 'visible',
  //   zIndex: 10
  // },
  cardimg: {
    height: 175,
    width: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    resizeMode: 'contain',
    alignSelf: 'center',
    borderRadius: 5,
    // backgroundColor:'red'
  },
  // cardimg2: {
  //   height: 65,
  //   width: 65,
  //   position: 'absolute',
  //   right: -14,
  //   top: -20,
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   // zIndex: 10
  //   // backgroundColor:Constants.red
  // },
  shadowWrapper: {
    boxShadow: '0px 0px 6px 0.5px grey',
    borderRadius: 20,
    marginVertical: 20,
    marginHorizontal: 10,
    backgroundColor: Constants.light_green, // necessary for iOS shadows
  },
  box: {
    width: 170,
    // paddingTop: 10,
    paddingBottom: 5,
    borderRadius: 20,
    overflow: 'visible', // still needed if your child extends outside
    backgroundColor: 'transparent', // make sure this doesn't override shadow
  },
  cardimg2: {
    height: 50,
    width: 50,
    position: 'absolute',
    right: -14,
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999, // very high to force render on top
  },

  seealltxt: {
    fontSize: 16,
    color: Constants.normal_green,
    fontFamily: FONTS.SemiBold,
    marginHorizontal: 10,
  },
  categorytxt: {
    fontSize: 16,
    color: Constants.black,
    fontFamily: FONTS.SemiBold,
  },
  disctxt: {
    fontSize: 16,
    color: Constants.linearcolor,
    fontFamily: FONTS.SemiBold,
  },
  maintxt: {
    fontSize: 16,
    color: Constants.customgrey,
    fontFamily: FONTS.Medium,
    textDecorationLine: 'line-through',
  },
  covline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginVertical: 10,
    // backgroundColor:Constants.red
  },
  proname: {
    fontSize: 16,
    color: Constants.black,
    fontFamily: FONTS.Medium,
    marginLeft: 15,
    marginTop: 5,
    flex:1
  },
  weight: {
    fontSize: 12,
    color: Constants.customgrey,
    fontFamily: FONTS.Regular,
    marginLeft: 20,
    // marginTop: 10,
  },
  offtxt: {
    fontSize: 10,
    color: Constants.white,
    fontFamily: FONTS.SemiBold,
    lineHeight: 15,
    // marginLeft: 7,
  },
  pluscov: {
    // backgroundColor:Constants.blue,
    width: 40,
    height: 40,
    alignSelf: 'flex-end',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 0px 6px 0px grey',
    borderRadius: 10,
    // marginRight:20
  },
  categorycircle: {
    // height: 70,
    // width: 70,
    // borderRadius: 10,
    // backgroundColor: Constants.light_green,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  categoryimg: {
    height: 65,
    width: 65,
    resizeMode: 'contain',
    borderRadius: 20,
  },
  categorytxt2: {
    fontSize: 14,
    color: Constants.black,
    fontFamily: FONTS.Regular,
    fontWeight: '500',
    textAlign: 'center',
    marginVertical: 5,
    // flex:1,
    // height:100,
    // width:'100%',
    // backgroundColor: Constants.lightblue,
  },
  watlogocov: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 15,
    marginBottom:5
  },
  logoimg: {
    height: 20,
    width: 20,
    borderRadius: 40,
    resizeMode: 'stretch',
  },
  shopcov: {
    flexDirection: 'row',
    marginTop: 20,
    marginHorizontal: 20,
    alignItems: 'center',
    gap:10,
    // justifyContent: 'space-between',
  },
   sealtxt: {
    fontSize: 14,
    color: Constants.black,
    fontFamily: FONTS.Medium,
    textAlign: 'center',
    width:'28%'
  },
});
