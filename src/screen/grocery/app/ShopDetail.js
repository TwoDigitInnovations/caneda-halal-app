import {
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useContext, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import Constants, {Currency, FONTS} from '../../../Assets/Helpers/constant';
import {BackIcon, Clock2Icon, PlusIcon} from '../../../../Theme';
import {goBack, navigate} from '../../../../navigationRef';
import {GroceryCartContext, LoadContext, ToastContext} from '../../../../App';
import {GetApi} from '../../../Assets/Helpers/Service';
import TranslateHandled from '../../../Assets/Component/TranslateHandled';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GroceryShopDetail = props => {
  const {t} = useTranslation();
  const data = props.route.params;
  const [toast, setToast] = useContext(ToastContext);
  const [loading, setLoading] = useContext(LoadContext);
  const [grocerycartdetail, setgrocerycartdetail] =
    useContext(GroceryCartContext);
  const [selectcat, setSelectcat] = useState();
  const [productList, setproductList] = useState();
  const [categoryList, setcategoryList] = useState([]);
  useEffect(() => {
    getCategoryWithGrocery();
  }, []);

  const getCategoryWithGrocery = () => {
    setLoading(true);
    GetApi(`getSellerCategoryWithGrocerys?seller_id=${data?.store_id}`).then(
      async res => {
        setLoading(false);
        console.log('cef', res);
        if (res.status) {
          setcategoryList(res.data);
          if (res.data && res.data?.length > 0) {
            setproductList(res.data[0].groceries);
            setSelectcat(res.data[0]._id);
          }
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
        console.log('Different seller detected, categoryListearing cart...');

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
        console.log(
          'New product added after categoryListearing cart:',
          newProduct,
        );
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
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* <FlatList
        data={productList}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={()=><View> */}
      <ImageBackground
        source={
          data?.store_cover_img
            ? {uri: data?.store_cover_img}
            : require('../../../Assets/Images/foodbaner.png')
        }
        style={{height: 170}}
        resizeMode="stretch">
        <TouchableOpacity style={styles.backcov} onPress={() => goBack()}>
          <BackIcon />
        </TouchableOpacity>
      </ImageBackground>
      <View style={styles.stodata}>
        <Image source={{uri: data?.store_logo}} style={styles.stologo} />
        <Text style={styles.storename}>{data?.store_name}</Text>
      </View>
      <View style={styles.stodata}>
        <View style={styles.icontxtcov}>
          <Clock2Icon height={15} width={15} color='#5C5C5C'/>
          {data?.status === 'open' ? (
            <Text style={[styles.opntxt, {color: Constants.black}]}>
              {t('Open Now')}
            </Text>
          ) : (
            <Text style={[styles.opntxt, {color: Constants.red}]}>
              {t('Store Closed')}
            </Text>
          )}
        </View>
        {data?.status === 'open' ? (
          <Text style={styles.clostxt}>
            {data?.distance ? (data?.distance / 1000).toFixed(1) : 0}km
          </Text>
        ) : (
          <Text style={styles.clostxt}>{data?.nextOpen}</Text>
        )}
      </View>
      <View style={styles.covline}>
        <Text style={styles.categorytxt}>{t('Find by Category')}</Text>
        <Text
          style={styles.seealltxt}
          onPress={() =>
            navigate('ProductWithCategoryForSeller', data?.store_id)
          }>
          {t('See all')}
        </Text>
      </View>
      <FlatList
        data={categoryList}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{marginHorizontal: 20}}
        renderItem={({item, index}) => (
          <TouchableOpacity
            key={index}
            style={{width:80,marginLeft:10}}
            onPress={() => {
              setSelectcat(item._id), setproductList(item?.groceries);
            }}>
            <View
              style={[
                styles.categorycircle,
                {
                  backgroundColor:
                    selectcat === item._id ? Constants.light_green : null,
                },
              ]}>
              {item?.image && (
                <Image
                  source={{uri: `${item?.image}`}}
                  style={styles.categoryimg}
                />
              )}
            </View>
            <View>
              <Text
                style={[
                  styles.categorytxt2,
                  {
                    color:
                      selectcat === item._id
                        ? Constants.normal_green
                        : Constants.black,
                  },
                ]}>
                <TranslateHandled text={item?.name} />
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
      {productList?.length > 0 ? (
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            marginHorizontal: 15,
            marginTop: 10,
          }}>
          {productList.map((item, index) => (
            <View style={[styles.shadowWrapper]} key={index}>
              <TouchableOpacity
                style={[styles.box]}
                onPress={() => navigate('GroceryPreview', item._id)}>
                <Image
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
                {item?.price_slot?.[0]?.value && (
                  <Text style={styles.weight}>
                    {item.price_slot[0].value}
                    {item.price_slot[0].unit}
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
                    <PlusIcon height={20} width={20} color={Constants.black} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      ) : (
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            height: Dimensions.get('window').height - 450,
          }}>
          <Text
            style={{
              color: Constants.black,
              fontSize: 18,
              fontFamily: FONTS.Medium,
            }}>
            {!categoryList ? t('Loading...') : t('No item avilable')}
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

export default GroceryShopDetail;

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
  backcov: {
    height: 30,
    width: 30,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Constants.white,
    marginTop: 20,
    marginLeft: 20,
  },
  stologo: {
    height: 60,
    width: 60,
    borderRadius: 50,
  },
  storename: {
    fontSize: 16,
    fontFamily: FONTS.SemiBold,
    color: Constants.black,
  },
  stodata: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 15,
    gap: 15,
  },
  opntxt: {
    fontSize: 14,
    color: Constants.black,
    fontFamily: FONTS.Medium,
    textAlign: 'center',
  },
  clostxt: {
    fontSize: 14,
    color: '#94712e',
    fontFamily: FONTS.Medium,
    textAlign: 'center',
  },
  icontxtcov: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
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
    // marginHorizontal: 10,
    backgroundColor: Constants.light_green, // necessary for iOS shadows
    width: '47%',
  },
  box: {
    width: '100%',
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
  categorycircle: {
    height: 70,
    width: 70,
    borderRadius: 10,
    backgroundColor: Constants.light_green,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: Constants.normal_green,
  },
  categoryimg: {
    height: 55,
    width: 55,
    resizeMode: 'contain',
    borderRadius: 60,
  },
  categorytxt2: {
    fontSize: 12,
    color: Constants.black,
    fontFamily: FONTS.Regular,
    textAlign: 'center',
    marginVertical: 5,
  },
});
