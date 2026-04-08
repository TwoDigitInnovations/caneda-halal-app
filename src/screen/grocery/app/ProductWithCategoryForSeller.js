import {
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useContext, useEffect, useState} from 'react';
import Constants, {Currency, FONTS} from '../../../Assets/Helpers/constant';
import LinearGradient from 'react-native-linear-gradient';
import {goBack, navigate} from '../../../../navigationRef';
import {GetApi} from '../../../Assets/Helpers/Service';
import {GroceryCartContext, LoadContext, ToastContext} from '../../../../App';
import {BackIcon, PlusIcon} from '../../../../Theme';
import Header from '../../../Assets/Component/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import TranslateHandled from '../../../Assets/Component/TranslateHandled'

const ProductWithCategoryForSeller = (props) => {
  const { t } = useTranslation();
  const seller_id = props.route.params;
  const [toast, setToast] = useContext(ToastContext);
  const [loading, setLoading] = useContext(LoadContext);
  const [grocerycartdetail, setgrocerycartdetail] = useContext(GroceryCartContext);
  const [categorylist, setcategorylist] = useState();
  useEffect(() => {
    getCategoryWithGrocery();
  }, []);

  const getCategoryWithGrocery = () => {
    setLoading(true);
    let url =`getCategoryWithGrocerys`
    if (seller_id) {
       url =`getSellerCategoryWithGrocerys?seller_id=${seller_id}`
    }
    GetApi(url).then(
      async res => {
        setLoading(false);
        console.log('cef', res);
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

   const cartdata = async (productdata) => {
     
     const existingCart = Array.isArray(grocerycartdetail)
     ? grocerycartdetail
     : [];
     
     // Check if the exact product with selected price_slot exists
     const existingProduct = existingCart.find(
       (f) =>
        f.productid === productdata._id &&
       f.price_slot?.value === productdata?.price_slot[0]?.value
      );
      
if (existingCart.length > 0) {
    const currentSellerId = existingCart[0].seller_id;
    
    // If trying to add product from a different seller
    if (productdata.sellerid !== currentSellerId) {
      console.log("Different seller detected, clearing cart...");

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
      await AsyncStorage.setItem('grocerycartdata', JSON.stringify(updatedCart));
      console.log("New product added after clearing cart:", newProduct);
      setToast("Successfully added to cart.")
      return;
    } else{
       console.log(
        "Product already in cart with this price slot:",
        existingProduct
      );
      let stringdata = grocerycartdetail.map(_i => {
        if (_i?.productid == productdata._id) {
          console.log('enter')
          return { ..._i, qty: _i?.qty + 1 };
        } else {
          return _i;
        }
      });
      console.log(stringdata)
      setgrocerycartdetail(stringdata);
      await AsyncStorage.setItem('grocerycartdata', JSON.stringify(stringdata))
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
      await AsyncStorage.setItem('grocerycartdata', JSON.stringify(updatedCart))
      console.log("Product added to cart:", newProduct);
    } 
    setToast("Successfully added to cart.")
    // navigate('Cart');
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.rowbtn}>
        <BackIcon height={30} width={30} color={Constants.black} onPress={() => goBack()} />
        <Text style={styles.headtxt}>{t("Category")}</Text>
        <View style={{width:40}}></View>
      </View>
<View style={{marginBottom:10,flex:1}}>
      <FlatList
        data={categorylist}
        showsVerticalScrollIndicator={false}
        renderItem={
          ({item, index}) =>
            item?.groceries &&
            item?.groceries?.length > 0 && (
              <View style={{marginTop: 5}}>
                <View style={styles.covline}>
                  <Text style={styles.cattxt}><TranslateHandled text={item.name} /></Text>
                  <Text
                    style={styles.seealltxt}
                    onPress={() =>
                      navigate('GroceryProducts', {id: item?._id, name: item?.name,store_id:seller_id})
                    }>
                    {t("See all")}
                  </Text>
                </View>
                <ScrollView
                  horizontal={true}
                  showsHorizontalScrollIndicator={false}>
                  {item.groceries.map((proditm, ind) => (
                    <View
                      style={[
                        styles.shadowWrapper,
                        {
                          marginRight:
                            item?.groceries.length === ind + 1 ? 20 : 10,
                        },
                      ]}
                      key={ind}>
                      <TouchableOpacity
                        style={[styles.box]}
                        onPress={() => navigate('GroceryPreview', proditm._id)}>
                        {/* <ImageBackground source={require('../../Assets/Images/start.png')} style={styles.star}></ImageBackground> */}
                        <Image
                          // source={require('../../Assets/Images/salt.png')}
                          source={{uri: proditm.image[0]}}
                          style={styles.cardimg}
                          resizeMode="stretch"
                        />
                        {proditm?.price_slot &&
                          proditm?.price_slot?.length > 0 && (
                            <ImageBackground
                              source={require('../../../Assets/Images/star.png')}
                              style={styles.cardimg2}>
                              <Text style={styles.offtxt}>
                                {(
                                  ((proditm?.price_slot[0]?.other_price -
                                    proditm?.price_slot[0]?.our_price) /
                                    proditm?.price_slot[0]?.other_price) *
                                  100
                                ).toFixed(0)}
                                %
                              </Text>
                              <Text style={styles.offtxt}>{t("off")}</Text>
                            </ImageBackground>
                          )}
                        <Text style={styles.proname}>{proditm.name}</Text>
                        {proditm?.price_slot?.[0]?.value && (
                          <Text style={styles.weight}>
                            {proditm.price_slot[0].value}
                            {proditm.price_slot[0].unit}
                          </Text>
                        )}
                        <View
                          style={{
                            flexDirection: 'row',
                            flex: 1,
                            marginHorizontal: 15,
                            marginBottom: 10,
                            marginTop: 5,
                          }}>
                          <View style={{flex: 1}}>
                            {proditm?.price_slot &&
                              proditm?.price_slot?.length > 0 && (
                                <Text style={styles.maintxt}>
                                  {Currency}
                                  {proditm?.price_slot[0]?.other_price}
                                </Text>
                              )}
                            {proditm?.price_slot &&
                              proditm?.price_slot?.length > 0 && (
                                <Text style={styles.disctxt}>
                                  {Currency}
                                  {proditm?.price_slot[0]?.our_price}
                                </Text>
                              )}
                          </View>
                          <TouchableOpacity
                            style={styles.pluscov}
                            onPress={() => cartdata(proditm)}>
                            <PlusIcon height={20} width={20} color={Constants.black}/>
                          </TouchableOpacity>
                        </View>
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )

          // )}
        }
        ListEmptyComponent={() => (
                    <View
                      style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: Dimensions.get('window').height - 200,
                      }}>
                      <Text
                        style={{
                          color: Constants.black,
                          fontSize: 18,
                          fontFamily: FONTS.Medium,
                        }}>
                        {!categorylist ? t('Loading...' ):t( 'No category avilable')}
                      </Text>
                    </View>
                  )}
      />
      </View>
    </SafeAreaView>
  );
};

export default ProductWithCategoryForSeller;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.white,
    // padding: 10,
  },
  seealltxt: {
    fontSize: 14,
    color: Constants.dark_green,
    fontFamily: FONTS.Medium,
    marginHorizontal: 10,
  },
  cattxt: {
    fontSize: 16,
    color: Constants.black,
    fontFamily: FONTS.SemiBold,
  },
  cardimg: {
    height: 110,
    width: '90%',
    resizeMode: 'contain',
    alignSelf: 'center',
    // backgroundColor:'red'
  },
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
    fontFamily: FONTS.SemiBold,
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
  star: {
    height: 30,
    width: 30,
    position: 'absolute',
  },
  headtxt: {
    color: Constants.black,
    fontSize: 16,
    fontFamily: FONTS.SemiBold,
  },
  rowbtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
});
