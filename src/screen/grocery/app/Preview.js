import {
  Dimensions,
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
import {SwiperFlatList} from 'react-native-swiper-flatlist';
import Constants, {Currency, FONTS} from '../../../Assets/Helpers/constant';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GroceryCartContext, LoadContext, ToastContext, UserContext} from '../../../../App';
import {BackIcon, CartIcon, MinusIcon, Plus2Icon, StarIcon, UnfavIcon} from '../../../../Theme';
import {goBack, navigate} from '../../../../navigationRef';
import {GetApi, Post} from '../../../Assets/Helpers/Service';
import moment from 'moment';
import DriverHeader from '../../../Assets/Component/DriverHeader';
import { useTranslation } from 'react-i18next';

const GroceryPreview = props => {
  const productid = props?.route?.params;
  console.log(productid);
  const { t } = useTranslation();
  const [isalreadyadd, setisalreadyadd] = useState(false);
  const [currentproduct, setcurrentproduct] = useState({});
  const [grocerycartdetail, setgrocerycartdetail] = useContext(GroceryCartContext);
  const [toast, setToast] = useContext(ToastContext);
  const [loading, setLoading] = useContext(LoadContext);
  const [user] = useContext(UserContext);
  const [selectedslot, setsselectedslot] = useState();
  const [productdata, setproductdata] = useState();
  const [isInCart, setIsInCart] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [availableQty, setAvailableQty] = useState(0);

  const sumdata =
    grocerycartdetail && grocerycartdetail.length > 0
      ? grocerycartdetail.reduce((a, item) => {
          return Number(a) + Number(item?.offer) * Number(item?.qty);
        }, 0)
      : null;
  console.log(sumdata);
  
  useEffect(() => {
    {
      productid && getProductById();
    }
  }, []);
  useEffect(() => {
    const currentproduct = grocerycartdetail.find(
      item => item?.productid === productdata?._id,
    );
    setcurrentproduct(currentproduct);
  }, [grocerycartdetail]);

  useEffect(() => {
    if (grocerycartdetail.length > 0) {
      const cartItem = grocerycartdetail.find(
        (f) =>
          f.productid=== productdata?._id &&
          f.price_slot?.value === selectedslot?.value
      );

      if (cartItem) {
        console.log('enter')
        setIsInCart(true);
        setAvailableQty(cartItem.qty);
      } else {
        setIsInCart(false);
        setAvailableQty(0);
      }
    } else {
      setIsInCart(false);
      setAvailableQty(0);
    }
  }, [grocerycartdetail, productdata, selectedslot]);


  const togglefav = (id) => {
    Post(`grocerytogglefavorite`, { groceryid: id }).then(
      async res => {
        if (res.status) {
          setproductdata(prev => ({ ...prev, isFavorite: !prev?.isFavorite }));
        }
      },
      err => console.log(err),
    );
  };

  const getProductById = () => {
    setLoading(true);
    GetApi(`getGroceryById/${productid}${user?._id ? `?userId=${user._id}` : ''}`).then(
      async res => {
        setLoading(false);
        console.log(res);
        if (res.status) {
          setproductdata(res.data);
          if (res?.data?.price_slot&&res?.data?.price_slot?.length>0) {
            setsselectedslot(res?.data?.price_slot[0])
          }
        }
      },
      err => {
        setLoading(false);
        console.log(err);
      },
    );
  };


  const cartdata = async () => {
    
    const existingCart = Array.isArray(grocerycartdetail)
    ? grocerycartdetail
    : [];

  // Check if the exact product with selected price_slot exists
  const existingProduct = existingCart.find(
    (f) =>
      f.productid === productdata._id &&
      f.price_slot?.value === selectedslot?.value
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
      price: selectedslot.other_price,
      offer: selectedslot.our_price,
      price_slot:selectedslot,
      image: productdata.image[0],
      qty: 1,
      seller_id: productdata.sellerid,
      seller_profile: productdata.seller_profile?._id,
      seller_location: productdata.seller_profile?.location,
      };

      const updatedCart = [newProduct];
      setgrocerycartdetail(updatedCart);
      await AsyncStorage.setItem('grocerycartdata', JSON.stringify(updatedCart));
      setAvailableQty(1); // Update UI
      console.log("New product added after clearing cart:", newProduct);
      return;
    }
  }

  if (!existingProduct) {
    const newProduct = {
      // ...productdata,
      // qty: availableQty || 1,
      // price: selectedslot.our_price,
      // price_slot: selectedslot,
      productid: productdata._id,
      productname: productdata.name,
      price: selectedslot.other_price,
      offer: selectedslot.our_price,
      price_slot:selectedslot,
      image: productdata.image[0],
      qty: 1,
      seller_id: productdata.sellerid,
      seller_profile: productdata.seller_profile?._id,
      seller_location: productdata.seller_profile?.location,
    };

    const updatedCart = [...existingCart, newProduct];
    setgrocerycartdetail(updatedCart);
    await AsyncStorage.setItem('grocerycartdata', JSON.stringify(updatedCart))
    console.log("Product added to cart:", newProduct);
  } else {
    console.log(
      "Product already in cart with this price slot:",
      existingProduct
    );
  }
  };

  const formatPricePerUnit = (price, quantity, unit) => {
    let unitText = "";
    let factor = 1;
  
    switch (unit?.toLowerCase()) {
      case "kg":
        unitText = "1 kg";
        factor = 1; // 1 kg = 1000 g → 100 g = 1/10 of the price
        break;
      case "gm":
        unitText = "100 gms";
        factor = 100; // Convert the given grams into 100 gms equivalent
        break;
      case "litre":
        unitText = "1 liter";
        factor = 1; // 1 litre = 1000 ml → 100 ml = 1/10 of the price
        break;
      case "ml":
        unitText = "100 ml";
        factor = 100; // Convert the given ml into 100 ml equivalent
        break;
      case "piece":
        unitText = "per piece";
        factor = 1; // Price remains the same
        break;
      case "pack":
        unitText = "per pack";
        factor = 1; // Price remains the same
        break;
      default:
        return "Invalid unit";
    }
  
    const calculatedPrice = (price / quantity) * factor;
    return `${Currency} ${calculatedPrice.toFixed(2)} / ${unitText}`;
  };
  
    const CustomPagination = ({data, index}) => {
      return (
        <View style={styles.paginationContainer}>
          {data.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === index ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>
      );
    };

  const width = Dimensions.get('window').width - 40;
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.rowbtn}>
             <TouchableOpacity style={styles.backcov} onPress={() => goBack()}>
                     <BackIcon  />
                       </TouchableOpacity>
              <Text style={styles.headtxt}>{t("Product detail")}</Text>
              <View></View>
            </View>
      <ScrollView showsVerticalScrollIndicator={false} style={{padding:20}}>
        <View style={{marginTop: 15}}>
                  <SwiperFlatList
                    data={productdata?.image || []}
                    onChangeIndex={({index}) => setCurrentIndex(index)}
                    renderItem={({item, index}) => (
                      <View
                        style={{paddingBottom: 5, width: width, alignItems: 'center'}}>
                        <Image
                            source={{uri: `${item}`}}
                          // source={item.image}
                          style={{
                            height: 250,
                            width: '93%',
                            borderRadius: 20,
                          }}
                          resizeMode="stretch"
                          key={index}
                        />
                      </View>
                    )}
                  />
                  <TouchableOpacity style={styles.faviconcov} onPress={() => togglefav(productdata?._id)}>
                    <UnfavIcon color={productdata?.isFavorite ? '#F14141' : null}/>
                  </TouchableOpacity>
                  {productdata?.image&&productdata?.image.length>0&&<CustomPagination data={productdata?.image} index={currentIndex} />}
                </View>
        <Text style={styles.proname}>{productdata?.name}</Text>
        <View style={{flexDirection: 'row', alignItems: 'center', marginLeft: 10, marginBottom: 6, gap: 8}}>
          {productdata?.averageRating && (
            <View style={styles.ratingBadge}>
              <StarIcon color={'#fff'} width={12} height={12} />
              <Text style={styles.ratingText}>{Number(productdata.averageRating).toFixed(1)}</Text>
            </View>
          )}
          {productdata?.totalReviews > 0 && (
            <Text style={styles.reviewCount}>{t('By')} {productdata.totalReviews}+ {t('people')}</Text>
          )}
        </View>
        <Text style={[styles.dectitle,{marginLeft:10}]}>{productdata?.short_description}</Text>
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
          {productdata?.price_slot &&
            productdata?.price_slot.length > 0 &&
            productdata?.price_slot[0].unit&&
            productdata.price_slot.map((item,i) => (
              <TouchableOpacity style={[styles.box,{marginRight:productdata?.price_slot.length===i+1?20:10,backgroundColor:selectedslot?.value===item.value?Constants.light_green:null,borderColor:selectedslot?.value===item.value?Constants.linearcolor:Constants.customgrey5}]} key={i} onPress={()=>setsselectedslot(item)}>
                <ImageBackground
                  source={require('../../../Assets/Images/star.png')}
                  style={styles.cardimg2}>
                  <Text style={styles.offtxt}>{(
                  ((item?.other_price - item?.our_price) /
                    item?.other_price) *
                  100
                ).toFixed(0)}%</Text>
                  <Text style={styles.offtxt}>{t("off")}</Text>
                </ImageBackground>
                <Text style={styles.weight}>{item?.value}{item.unit}</Text>
                <View style={{}}>
                  <Text style={styles.maintxt}>{Currency}{item.our_price}</Text>
                  <Text style={styles.disctxt}>{formatPricePerUnit(item.our_price, item?.value, item.unit)}</Text>
                </View>
              </TouchableOpacity>
            ))}
        </ScrollView>
        <View style={styles.pricecov}>
          <View style={{flexDirection: 'row', gap: 10}}>
            <Text style={styles.maintxt2}>{Currency} {selectedslot?.our_price}</Text>
            {selectedslot?.our_price && (
              <Text
                style={[styles.weight, {textDecorationLine: 'line-through'}]}>
                {Currency} {selectedslot?.other_price}
              </Text>
            )}
            {selectedslot?.our_price && (
              <Text style={styles.disctxt2}>
                {(
                  ((selectedslot?.other_price - selectedslot?.our_price) /
                    selectedslot?.other_price) *
                  100
                ).toFixed(0)}
                % off
              </Text>
            )}
          </View>
          {isInCart ? 
            <View style={styles.addcov}>
              <TouchableOpacity
                style={styles.plus}
                onPress={async () => {
                  if (availableQty > 1) {
                    // Decrease quantity
                    const updatedCart = grocerycartdetail.map(item => {
                      if (
                        item.productid === currentproduct?.productid &&
                        item.price_slot?.value === selectedslot?.value
                      ) {
                        return {
                          ...item,
                          qty: item.qty - 1,
                          price: selectedslot.other_price,
                          offer: selectedslot.our_price,
                          price_slot: selectedslot,
                        };
                      }
                      return item;
                    });
                  
                    setgrocerycartdetail(updatedCart);
                    await AsyncStorage.setItem('grocerycartdata', JSON.stringify(updatedCart));
                    console.log('Product quantity decreased:', currentproduct?.productname);
              
                    setAvailableQty(availableQty - 1);
                  } else {
                    // Remove product from cart if qty is 1
                    const updatedCart = grocerycartdetail.filter(item => {
                      return !(
                        item.productid === currentproduct?.productid &&
                        item.price_slot?.value === selectedslot?.value
                      );
                    });
                  
                    setgrocerycartdetail(updatedCart);
                    await AsyncStorage.setItem('grocerycartdata', JSON.stringify(updatedCart));
                    console.log('Product removed from cart:', currentproduct?.productname);
                  
                    setIsInCart(false);
                    setAvailableQty(0);
                  }
                  
                }}>
                <MinusIcon color={Constants.white} height={20} width={20}/>
              </TouchableOpacity>
              <Text style={styles.plus2}>{availableQty}</Text>
              <TouchableOpacity
                style={styles.plus3}
                onPress={async () => {
                  const updatedCart = grocerycartdetail.map(item => {
                    if (
                      item.productid === currentproduct?.productid &&
                      item.price_slot?.value === selectedslot?.value
                    ) {
                      return {
                        ...item,
                        qty: item.qty + 1,
                        price: selectedslot.other_price,
                        offer: selectedslot.our_price,
                        price_slot: selectedslot,
                      };
                    }
                    return item;
                  });
                  
                  setgrocerycartdetail(updatedCart);
                  await AsyncStorage.setItem('grocerycartdata', JSON.stringify(updatedCart));
                  console.log('Product quantity increased:', currentproduct?.productname);
                }}>
                <Plus2Icon color={Constants.white} height={20} width={20} />
              </TouchableOpacity>
            </View>
          :<Text style={styles.addbtn} onPress={() => cartdata()}>
          {t("ADD")}
        </Text>}
        </View>
        <View style={styles.line}></View>
        <View style={styles.productinfocov}>
          <Text style={styles.proddec}>{t("Product Information")}</Text>
          <View style={styles.expirycard}>
            <Text style={styles.exptxt}>{t("EXPIRY DATE")}</Text>
            <Text style={styles.exptxt2}>{moment(productdata?.expirydate).format('DD MMM yyyy')}</Text>
          </View>
        </View>
          <Text style={styles.dectitle}>{productdata?.long_description}</Text>
        <View style={{marginVertical: 10}}>
          <Text style={styles.dechead}>{t("MANUFACTURER NAME")}</Text>
          <Text style={styles.dectitle}>{productdata?.manufacturername}</Text>
        </View>
        <View style={{marginVertical: 10, marginBottom: 120}}>
          <Text style={styles.dechead}>{t("MANUFACTURER ADDRESS")}</Text>
          <Text style={styles.dectitle}>
            {productdata?.manufactureradd}
          </Text>
        </View>
      </ScrollView>
      {currentproduct && (
        <TouchableOpacity
          style={styles.cartbtn}
          onPress={() => navigate('Grocerytab',{screen:'Cart'})}>
          <Text style={styles.buttontxt}>
            {' '}
            {grocerycartdetail.length} items | {Currency}{sumdata}
          </Text>
          <View style={{flexDirection: 'row'}}>
            <CartIcon color={Constants.white} style={{marginRight: 5}} />
            <Text style={styles.buttontxt}>{t("View Cart")}</Text>
          </View>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

export default GroceryPreview;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.white,
    paddingVertical: 10,
  },
   headtxt: {
    color: Constants.black,
    fontSize: 16,
    fontFamily: FONTS.SemiBold,
  },
   backcov: {
    height: 30,
    width: 30,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Constants.customgrey4,
  },
  rowbtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop:Platform.OS === 'ios' ? 10 : 0,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    // marginTop: 10,
  },
  dot: {
    height: 5,
    borderRadius: 3,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 30,
    backgroundColor: Constants.normal_green,
  },
  inactiveDot: {
    width: 30,
    backgroundColor: Constants.white,
  },
  proname: {
    fontSize: 16,
    color: Constants.black,
    fontFamily: FONTS.SemiBold,
    marginBottom: 10,
    marginLeft: 10,
    marginTop:10
  },
  weight: {
    fontSize: 14,
    color: Constants.black,
    fontFamily: FONTS.Regular,
    marginVertical: 5,
  },
  disctxt: {
    fontSize: 14,
    color: Constants.linearcolor,
    fontFamily: FONTS.Regular,
  },
  disctxt2: {
    fontSize: 16,
    color: Constants.normal_green,
    fontFamily: FONTS.Medium,
    alignSelf: 'center',
  },
  maintxt: {
    fontSize: 16,
    color: Constants.black,
    fontFamily: FONTS.SemiBold,
    // textDecorationLine: 'line-through',
  },
  maintxt2: {
    fontSize: 18,
    color: Constants.linearcolor,
    fontFamily: FONTS.SemiBold,
    // textDecorationLine: 'line-through',
  },
  box: {
    backgroundColor: Constants.light_green,
    width: 150,
    padding: 10,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: Constants.linearcolor,
    marginLeft:10,
    marginTop:10
  },
  cardimg2: {
    height: 45,
    width: 45,
    position: 'absolute',
    right: -7,
    top: -10,
    justifyContent: 'center',
    alignItems: 'center',
    // zIndex:99
    // backgroundColor:Constants.red
  },
  offtxt: {
    fontSize: 12,
    color: Constants.white,
    fontFamily: FONTS.Black,
    marginLeft: 2,
  },
  addbtn: {
    backgroundColor: Constants.normal_green,
    color: Constants.white,
    paddingHorizontal: 25,
    paddingVertical: 7,
    borderRadius: 5,
    fontSize: 16,
    fontFamily: FONTS.SemiBold,
    // position: 'absolute',
    // right: 0,
  },
  line: {
    height: 4,
    backgroundColor: Constants.customgrey3,
    width: '120%',
    marginLeft: -20,
  },
  pricecov: {
    flexDirection: 'row',
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  proddec: {
    fontSize: 16,
    color: Constants.black,
    fontFamily: FONTS.SemiBold,
    width: '50%',
    // marginTop:20
  },
  dechead: {
    fontSize: 14,
    color: Constants.black,
    fontFamily: FONTS.SemiBold,
    // marginTop:20
  },
  dectitle: {
    fontSize: 14,
    color: Constants.customgrey,
    fontFamily: FONTS.Regular,
    // marginTop:20
  },
  productinfocov: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  expirycard: {
    backgroundColor: '#EDEDED',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 10,
  },
  exptxt: {
    fontSize: 12,
    color: Constants.black,
    fontFamily: FONTS.SemiBold,
  },
  exptxt2: {
    fontSize: 14,
    color: Constants.linearcolor,
    fontFamily: FONTS.Medium,
  },
  faviconcov: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 20,
    padding: 6,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Constants.normal_green,
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 3,
  },
  ratingText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: FONTS.SemiBold,
  },
  reviewCount: {
    fontSize: 12,
    color: Constants.customgrey,
    fontFamily: FONTS.Regular,
  },
  addcov: {
    flexDirection: 'row',
    width: 120,
    height: 40,
    // borderRadius:10
  },
  plus: {
    backgroundColor: Constants.normal_green,
    // color: Constants.white,
    flex: 1,
    // textAlign: 'center',
    height: '100%',
    // paddingVertical: '5%',
    // fontSize: 30,
    alignSelf: 'center',
    // fontFamily: FONTS.SemiBold,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    justifyContent:'center',
    alignItems:'center'
  },
  plus2: {
    backgroundColor: '#F3F3F3',
    color: Constants.black,
    flex: 1,
    textAlign: 'center',
    height: '100%',
    paddingVertical: '5%',
    fontSize: 20,
    alignSelf: 'center',
    fontFamily: FONTS.Black,
  },
  plus3: {
    backgroundColor: Constants.normal_green,
    // color: Constants.white,
    flex: 1,
    // textAlign: 'center',
    height: '100%',
    // paddingVertical: '2%',
    // fontSize: 30,
    alignSelf: 'center',
    // fontFamily: FONTS.SemiBold,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    justifyContent:'center',
    alignItems:'center'
  },
  buttontxt: {
    color: Constants.white,
    fontSize: 16,
    fontFamily: FONTS.SemiBold,
  },
  cartbtn: {
    height: 60,
    // width: 370,
    borderRadius: 10,
    backgroundColor: Constants.normal_green,
    // marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    width: '90%',
    alignSelf: 'center',
    paddingHorizontal: 20,
  },
});
