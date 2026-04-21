import {
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useContext, useEffect, useState} from 'react';
import Constants, {Currency, FONTS} from '../../../Assets/Helpers/constant';
import {ClockIcon, MinusIcon, PlusIcon, StarIcon, UnfavIcon} from '../../../../Theme';
import { GroceryCartContext, LoadContext, ToastContext} from '../../../../App';
import {GetApi, Post} from '../../../Assets/Helpers/Service';
import {navigate} from '../../../../navigationRef';
import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DriverHeader from '../../../Assets/Component/DriverHeader';
import { useTranslation } from 'react-i18next';
import TranslateHandled from '../../../Assets/Component/TranslateHandled';

const GroceryProducts = props => {
  const { t } = useTranslation();
  const [grocerycartdetail, setgrocerycartdetail] = useContext(GroceryCartContext);
  const [toast, setToast] = useContext(ToastContext);
  const [loading, setLoading] = useContext(LoadContext);
  const [productlist, setproductlist] = useState([]);
      const [page, setPage] = useState(1);
      const [curentData, setCurrentData] = useState([]);
  const [user, setuser] = useState();
  const IsFocused = useIsFocused();
  const data = props?.route?.params.id;
  const catname = props?.route?.params.name;
  const topsell = props?.route?.params.type;
  const store_id = props?.route?.params?.store_id;

  useEffect(() => {
    {
      data && getproduct(1);
    }
    {
      topsell==='topselling' && getTopSoldProduct(1);
    }
  }, []);

  
  useEffect(() => {
    if (IsFocused) {
      setInitialRoute()
    }
  }, [IsFocused]);

  const setInitialRoute = async () => {
    const user = await AsyncStorage.getItem('userDetail');
    setuser(JSON.parse(user));
  }

  const getproduct = (p) => {
    setPage(p)
    setLoading(true);
     let url=`getGrocerybycategory/${data}?page=${p}`
    if (store_id) {
      url=`getGrocerybycategory/${data}?page=${p}&store_id=${store_id}`
    }
    GetApi(url).then(
      async res => {
        setLoading(false);
        console.log(res);
        if (res.status) {
          setCurrentData(res.data);
          if (p === 1) {
            setproductlist(res.data);
          } else {
            setproductlist([...productlist, ...res.data]);
          }
          
        }
      },
      err => {
        setLoading(false);
        console.log(err);
      },
    );
  };

    const getTopSoldProduct = (p) => {
      setPage(p)
      setLoading(true);
      GetApi(`getTopSoldGrocery?page=${p}`,).then(
        async res => {
          setLoading(false);
          console.log(res);
          if (res.status) {
            setCurrentData(res.data);
            if (p === 1) {
              setproductlist(res.data);
            } else {
              setproductlist([...productlist, ...res.data]);
            }
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
      f.price_slot?.value ===  productdata?.price_slot[0]?.value
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
      image:productdata.image[0],
      price_slot:productdata?.price_slot[0],
      qty: 1,
      seller_id:productdata.sellerid,
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
  const decreaseQty = async productdata => {
    const existingCart = Array.isArray(grocerycartdetail) ? grocerycartdetail : [];
    const cartItem = existingCart.find(
      f => f.productid === productdata._id && f.price_slot?.value === productdata.price_slot?.[0]?.value,
    );
    if (!cartItem) return;
    const updatedCart =
      cartItem.qty <= 1
        ? existingCart.filter(
            f => !(f.productid === productdata._id && f.price_slot?.value === productdata.price_slot?.[0]?.value),
          )
        : existingCart.map(f =>
            f.productid === productdata._id && f.price_slot?.value === productdata.price_slot?.[0]?.value
              ? {...f, qty: f.qty - 1}
              : f,
          );
    setgrocerycartdetail(updatedCart);
    await AsyncStorage.setItem('grocerycartdata', JSON.stringify(updatedCart));
  };

  const fetchNextPage = () => {
    console.log('enter',curentData.length)
    if (curentData.length === 20) {
      console.log('enter1',topsell)
      if (topsell==='topselling') {
        console.log('enter2')
        getTopSoldProduct(page + 1);
      } else {
        getproduct(page + 1);
      }
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <DriverHeader item={t("Products")}showback={true} />
      <Text style={styles.headtxt}><TranslateHandled text={catname} /></Text>
      <View style={{width:'100%',flex:1}}>
      <FlatList
        data={productlist}
        numColumns={2}
        style={{flex: 1}}
        contentContainerStyle={{paddingHorizontal: 12, paddingTop: 10}}
        columnWrapperStyle={{gap: 8, marginBottom: 8}}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              height: Dimensions.get('window').height - 200,
            }}>
            <Text style={{color: Constants.black, fontSize: 20, fontFamily: FONTS.Medium}}>
              {t('No Products')}
            </Text>
          </View>
        )}
        renderItem={({item}) => {
          const avgRating =
            item.reviews?.length > 0
              ? (item.reviews.reduce((s, r) => s + (r.rating || 0), 0) / item.reviews.length).toFixed(1)
              : null;
          const reviewCount = item.reviews?.length || 0;
          const cartItem = grocerycartdetail?.find(
            f => f.productid === item._id && f.price_slot?.value === item.price_slot?.[0]?.value,
          );
          return (
            <TouchableOpacity
              style={styles.productCard}
              activeOpacity={0.85}
              onPress={() => navigate('GroceryPreview', item._id)}>
              <View style={styles.productImgContainer}>
                <Image
                  source={{uri: item.image?.[0]}}
                  style={styles.productCardImg}
                  resizeMode="contain"
                />
                <TouchableOpacity style={styles.heartBtn}>
                  <UnfavIcon height={16} width={16} color={Constants.white} />
                </TouchableOpacity>
                {cartItem?.qty > 0 ? (
                  <View style={styles.stepperBtn}>
                    <TouchableOpacity
                      style={styles.stepperTouch}
                      onPress={e => { e.stopPropagation?.(); decreaseQty(item); }}>
                      <MinusIcon color={Constants.normal_green} height={10} width={10} />
                    </TouchableOpacity>
                    <Text style={styles.stepperQty}>{cartItem.qty}</Text>
                    <TouchableOpacity
                      style={styles.stepperTouch}
                      onPress={e => { e.stopPropagation?.(); cartdata(item); }}>
                      <PlusIcon color={Constants.normal_green} height={10} width={10} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.addBtn}
                    onPress={e => { e.stopPropagation?.(); cartdata(item); }}>
                    <Text style={styles.addBtnTxt}>ADD+</Text>
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.productInfo}>
                <View style={styles.priceRow}>
                  <Text style={styles.productPriceTxt}>
                    {Currency}{item.price_slot?.[0]?.our_price}
                  </Text>
                  <Text style={styles.productWeightTxt}>
                    {' '}{item.price_slot?.[0]?.value}{item.price_slot?.[0]?.unit}
                  </Text>
                </View>
                <Text style={styles.productNameTxt} numberOfLines={2}>{item.name}</Text>
                <View style={styles.ratingRow}>
                  <StarIcon height={10} width={10} color="#F5A623" />
                  <Text style={styles.ratingTxt}> {avgRating ?? '4.9'}</Text>
                  <Text style={styles.reviewCountTxt}> ({reviewCount || 5840})</Text>
                </View>
                <View style={styles.deliveryRow}>
                  <ClockIcon height={10} width={10} color={Constants.customgrey} />
                  <Text style={styles.deliveryTxt}> 17 mins</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        onEndReached={() => {
          if (productlist && productlist.length > 0) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.05}
      />
      </View>
    </SafeAreaView>
  );
};

export default GroceryProducts;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.white,
    // paddingBottom: 20,
  },
 
  headtxt: {
    color: Constants.black,
    // fontWeight: '700',
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 10,
    fontFamily: FONTS.SemiBold,
    // marginVertical:10
  },
  productCard: {
    width: (Dimensions.get('window').width - 32) / 2,
    borderRadius: 12,
    backgroundColor: Constants.white,
  },
  productImgContainer: {
    paddingTop: 8,
    paddingBottom: 34,
    position: 'relative',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Constants.customgrey4,
  },
  productCardImg: {
    width: '100%',
    height: 110,
  },
  heartBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    padding: 2,
  },
  addBtn: {
    position: 'absolute',
    bottom: 0,
    right: -8,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: Constants.normal_green,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnTxt: {
    fontSize: 10,
    color: Constants.normal_green,
    fontFamily: FONTS.SemiBold,
    letterSpacing: 0.3,
  },
  stepperBtn: {
    position: 'absolute',
    bottom: 0,
    right: -8,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Constants.normal_green,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 3,
    gap: 4,
  },
  stepperTouch: {
    padding: 2,
  },
  stepperQty: {
    fontSize: 10,
    color: Constants.normal_green,
    fontFamily: FONTS.SemiBold,
    minWidth: 12,
    textAlign: 'center',
  },
  productInfo: {
    padding: 7,
    paddingTop: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
  },
  productPriceTxt: {
    fontSize: 13,
    color: Constants.black,
    fontFamily: FONTS.SemiBold,
  },
  productWeightTxt: {
    fontSize: 11,
    color: Constants.customgrey,
    fontFamily: FONTS.Regular,
  },
  productNameTxt: {
    fontSize: 11,
    color: Constants.black,
    fontFamily: FONTS.Regular,
    lineHeight: 15,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  ratingTxt: {
    fontSize: 10,
    color: Constants.black,
    fontFamily: FONTS.SemiBold,
  },
  reviewCountTxt: {
    fontSize: 10,
    color: Constants.customgrey,
    fontFamily: FONTS.Regular,
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  deliveryTxt: {
    fontSize: 10,
    color: Constants.customgrey,
    fontFamily: FONTS.Regular,
  },
});
