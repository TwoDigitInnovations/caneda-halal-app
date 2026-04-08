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
import {
  GroceryCartContext,
  GroceryUserContext,
  LoadContext,
  ToastContext,
} from '../../../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SwiperFlatList from 'react-native-swiper-flatlist';
import Header from '../../../Assets/Component/Header';
import {useTranslation} from 'react-i18next';
import Scheliton from '../../../Assets/Component/Scheliton';
import TranslateHandled from '../../../Assets/Component/TranslateHandled';
import CuurentLocation from '../../../Assets/Component/CuurentLocation';

const Home = () => {
  const {t} = useTranslation();
  const [grocerycartdetail, setgrocerycartdetail] =
    useContext(GroceryCartContext);
  const [toast, setToast] = useContext(ToastContext);
  const [loading, setLoading] = useContext(LoadContext);
  const [imgLoading, setImgLoading] = useState(true);
  const [categorylist, setcategorylist] = useState();
  const [topsellinglist, settopsellinglist] = useState([]);
  const [carosalimg, setcarosalimg] = useState([]);
  const [storelist, setstorelist] = useState([]);
  const [groceryuserProfile, setgroceryuserProfile] =useContext(GroceryUserContext)
  useEffect(() => {
    getCategory();
    getTopSoldProduct();
    getSetting();
  }, []);
  useEffect(() => {
    getnearbyshops();
  }, [groceryuserProfile]);

  const getCategory = () => {
    setLoading(true);
    GetApi(`getGroceryCategory?limit=8`, {}).then(
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
  const getnearbyshops = () => {
    setLoading(true);
    if (groceryuserProfile?.shipping_address?.location?.coordinates?.length > 0) {
    // Use saved location
    const data = {
      role: 'GROCERYSELLER',
      location: groceryuserProfile.shipping_address.location,
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
        role: 'GROCERYSELLER',
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
  const getTopSoldProduct = () => {
    setLoading(true);
    GetApi(`getTopSoldGrocery?limit=5`, {}).then(
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
    GetApi(`getGroceryCarousel`, {}).then(
      async res => {
        setLoading(false);
        console.log(res);
        if (res.success) {
          setcarosalimg(res?.grocerycarousel[0].carousel);
        }
      },
      err => {
        setLoading(false);
        console.log(err);
      },
    );
  };
  const cartdata = async productdata => {
    const existingCart = Array.isArray(grocerycartdetail)
      ? grocerycartdetail
      : [];

    // Check if the exact product with selected price_slot exists
    const existingProduct = existingCart.find(
      f =>
        f.productid === productdata._id &&
        f.price_slot?.value === productdata?.price_slot[0]?.value,
    );
    if (existingCart.length > 0) {
      const currentSellerId = existingCart[0].seller_id;

      // If trying to add product from a different seller
      if (productdata.sellerid !== currentSellerId) {
        console.log('Different seller detected, clearing cart...');

        // 🧹 Clear old cart and add new item
        const newProduct = {
          productid: productdata._id,
          productname: productdata.name,
          price: productdata?.price_slot[0]?.other_price,
          offer: productdata?.price_slot[0]?.our_price,
          image: productdata.image[0],
          price_slot: productdata?.price_slot[0],
          qty: 1,
          seller_id: productdata.sellerid,
          seller_profile: productdata.seller_profile?._id,
          seller_location: productdata.seller_profile?.location,
        };

        const updatedCart = [newProduct];
        setgrocerycartdetail(updatedCart);
        await AsyncStorage.setItem(
          'grocerycartdata',
          JSON.stringify(updatedCart),
        );
        console.log('New product added after clearing cart:', newProduct);
        setToast('Successfully added to cart.');
        return;
      } else {
        console.log(
          'Product already in cart with this price slot:',
          existingProduct,
        );
        let stringdata = grocerycartdetail.map(_i => {
          if (_i?.productid == productdata._id) {
            console.log('enter');
            return {..._i, qty: _i?.qty + 1};
          } else {
            return _i;
          }
        });
        console.log(stringdata);
        setgrocerycartdetail(stringdata);
        await AsyncStorage.setItem(
          'grocerycartdata',
          JSON.stringify(stringdata),
        );
      }
    }
    if (!existingProduct) {
      const newProduct = {
        productid: productdata._id,
        productname: productdata.name,
        price: productdata?.price_slot[0]?.other_price,
        offer: productdata?.price_slot[0]?.our_price,
        image: productdata.image[0],
        price_slot: productdata?.price_slot[0],
        qty: 1,
        seller_id: productdata.sellerid,
        seller_profile: productdata.seller_profile?._id,
        seller_location: productdata.seller_profile?.location,
      };

      const updatedCart = [...existingCart, newProduct];
      setgrocerycartdetail(updatedCart);
      await AsyncStorage.setItem(
        'grocerycartdata',
        JSON.stringify(updatedCart),
      );
      console.log('Product added to cart:', newProduct);
    }
    setToast('Successfully added to cart.');
    // navigate('Cart');
  };
  const width = Dimensions.get('window').width;
  const width2 = Dimensions.get('window').width - 30;
  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <View
        style={{backgroundColor: Constants.normal_green, paddingBottom: 15}}>
        <TouchableOpacity
          style={[styles.inpcov]}
          onPress={() => {
            console.log('enter'), navigate('GrocerySearchpage');
          }}>
          <SearchIcon height={20} width={20} color={Constants.black} />
          <TextInput
            style={styles.input}
            editable={false}
            placeholder={t('Search')}
            onPress={() => navigate('GrocerySearchpage')}
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
                  <TouchableOpacity style={{alignItems: 'center',width:"33%"}} key={index} onPress={()=>navigate("GroceryShops")}>
                    <Image
                      source={{uri: item?.store_logo}}
                      style={{height: 80, width: 80, borderRadius: 70}}
                    />
                    <Text style={styles.shopname}>{item?.store_name}</Text>
                  </TouchableOpacity>
                )
            })}
            {storelist?.length>2&&<Text style={styles.sealtxt} onPress={()=>navigate("GroceryShops")}>See All</Text>}
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
                    item.grocery_id &&
                      navigate('GroceryPreview', item.grocery_id);
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
              navigate('GroceryProducts', {
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
                  onPress={() => navigate('GroceryPreview', item._id)}>
                  {/* <ImageBackground source={require('../../Assets/Images/start.png')} style={styles.star}></ImageBackground> */}
                  <Image
                    // source={require('../../Assets/Images/salt.png')}
                    source={{uri: item.image[0]}}
                    style={styles.cardimg}
                    resizeMode="stretch"
                  />
                  {item?.price_slot && item?.price_slot?.length > 0 && (
                    <ImageBackground
                      source={require('../../../Assets/Images/star.png')}
                      style={styles.cardimg2}>
                      <Text style={styles.offtxt}>
                        {(
                          ((item?.price_slot[0]?.other_price -
                            item?.price_slot[0]?.our_price) /
                            item?.price_slot[0]?.other_price) *
                          100
                        ).toFixed(0)}
                        %
                      </Text>
                      <Text style={styles.offtxt}>{t('off')}</Text>
                    </ImageBackground>
                  )}
                  <Text style={styles.proname}>{item.name}</Text>
                  {/* <View style={styles.watlogocov}> */}
                  {item?.price_slot?.[0]?.value && (
                    <Text style={styles.weight}>
                      {item.price_slot[0].value}
                      {item.price_slot[0].unit}
                    </Text>
                  )}
                  {/* <Image source={{uri:item?.seller_profile?.store_logo}} style={styles.logoimg}/>
                  </View> */}
                  <View
                    style={{
                      flexDirection: 'row',
                      flex: 1,
                      marginHorizontal: 15,
                      marginBottom: 10,
                    }}>
                    <View style={{flex: 1}}>
                      {item?.price_slot && item?.price_slot?.length > 0 && (
                        <Text style={styles.maintxt}>
                          {Currency}
                          {item?.price_slot[0]?.other_price}
                        </Text>
                      )}
                      {item?.price_slot && item?.price_slot?.length > 0 && (
                        <Text style={styles.disctxt}>
                          {Currency}
                          {item?.price_slot[0]?.our_price}
                        </Text>
                      )}
                    </View>
                    <TouchableOpacity
                      style={styles.pluscov}
                      onPress={() => cartdata(item)}>
                      <PlusIcon
                        height={20}
                        width={20}
                        color={Constants.black}
                      />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              </View>
            ))}
        </ScrollView>
        <View style={styles.covline}>
          <Text style={styles.categorytxt}>{t('Explore By Categories')}</Text>
          <TouchableOpacity
            style={{flexDirection: 'row'}}
            onPress={() =>
              navigate('ProductWithCategoryForSeller')
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
                navigate('GroceryProducts', {id: item._id, name: item.name})
              }>
              <View style={styles.categorycircle}>
                {item?.image && (
                  <Image
                    // source={item.img}
                    source={{uri: `${item?.image}`}}
                    style={styles.categoryimg}
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
    height: 110,
    width: '90%',
    resizeMode: 'contain',
    alignSelf: 'center',
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
    paddingTop: 10,
    paddingBottom: 10,
    borderRadius: 20,
    overflow: 'visible', // still needed if your child extends outside
    backgroundColor: 'transparent', // make sure this doesn't override shadow
  },
  cardimg2: {
    height: 55,
    width: 55,
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
    fontSize: 14,
    color: Constants.linearcolor,
    fontFamily: FONTS.SemiBold,
  },
  maintxt: {
    fontSize: 16,
    color: Constants.black,
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
    marginLeft: 20,
    marginTop: 5,
  },
  weight: {
    fontSize: 12,
    color: Constants.customgrey,
    fontFamily: FONTS.Regular,
    marginLeft: 20,
    // marginTop: 10,
  },
  offtxt: {
    fontSize: 12,
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
    height: 70,
    width: 70,
    borderRadius: 10,
    backgroundColor: Constants.light_green,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  categoryimg: {
    height: 55,
    width: 55,
    resizeMode: 'contain',
    borderRadius: 60,
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
  sealtxt: {
    fontSize: 14,
    color: Constants.black,
    fontFamily: FONTS.Medium,
    textAlign: 'center',
    width:'28%'
  },
  watlogocov: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
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
});
