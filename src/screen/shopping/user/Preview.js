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
import { ShoppingCartContext, LoadContext, ToastContext} from '../../../../App';
import {BackIcon, CartIcon, MinusIcon, Plus2Icon} from '../../../../Theme';
import {goBack, navigate} from '../../../../navigationRef';
import {GetApi} from '../../../Assets/Helpers/Service';
import moment from 'moment';
import DriverHeader from '../../../Assets/Component/DriverHeader';
import { useTranslation } from 'react-i18next';

const ShoppingPreview = props => {
  const productid = props?.route?.params;
  console.log(productid);
  const { t } = useTranslation();
  const [isalreadyadd, setisalreadyadd] = useState(false);
  const [currentproduct, setcurrentproduct] = useState({});
  const [shoppingcartdetail, setshoppingcartdetail] = useContext(ShoppingCartContext);
  const [toast, setToast] = useContext(ToastContext);
  const [loading, setLoading] = useContext(LoadContext);
  const [selectedslot, setsselectedslot] = useState();
  const [productdata, setproductdata] = useState();
  const [isInCart, setIsInCart] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [availableQty, setAvailableQty] = useState(0);
  const [selsctSizeSlot, setSelsctSizeSlot] = useState();
  const [selsctSize, setSelsctSize] = useState();

  const sumdata =
    shoppingcartdetail && shoppingcartdetail.length > 0
      ? shoppingcartdetail.reduce((a, item) => {
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
    const currentproduct = shoppingcartdetail.find(
      item => item?.productid === productdata?._id,
    );
    setcurrentproduct(currentproduct);
  }, [shoppingcartdetail]);

  useEffect(() => {
    if (shoppingcartdetail.length > 0) {
      const cartItem = shoppingcartdetail.find(
        (f) =>
          f.productid=== productdata?._id &&
          f.variant_color === selectedslot?.color &&
f.selected_size?.value === selsctSizeSlot?.value

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
  }, [shoppingcartdetail, productdata, selectedslot,selsctSizeSlot]);


  const getProductById = () => {
    setLoading(true);
    GetApi(`getShoppingById/${productid}`).then(
      async res => {
        setLoading(false);
        console.log(res);
        if (res.status) {
          setproductdata(res.data);
          if (res?.data?.variants&&res?.data?.variants?.length>0) {
            setsselectedslot(res?.data?.variants[0])
            if (res?.data?.variants[0]?.selected&&res?.data?.variants[0].selected?.length>0) {
              setSelsctSizeSlot(res?.data?.variants[0]?.selected[0])
            }
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
    if (!selsctSize) {
      setToast('Please select size');
      return;
    }
    
    const existingCart = Array.isArray(shoppingcartdetail)
    ? shoppingcartdetail
    : [];

  // Check if the exact product with selected varients exists
  const existingProduct = existingCart.find(
    (f) =>
      f.productid === productdata._id &&
      f.variant_color === selectedslot?.color &&
f.selected_size?.value === selsctSizeSlot?.value

  );

  if (existingCart.length > 0) {
    const currentSellerId = existingCart[0].seller_id;
    
    // If trying to add product from a different seller
    if (productdata.sellerid !== currentSellerId) {
      console.log("Different seller detected, clearing cart...");

      // 🧹 Clear old cart and add new item
      const newProduct = {
      //   productid: productdata._id,
      // productname: productdata.name,
      // price: selectedslot.other_price,
      // offer: selectedslot.our_price,
      // price_slot:selectedslot,
      // image: productdata.image[0],
      // qty: 1,
      // seller_id: productdata.sellerid,
      // seller_profile: productdata.seller_profile?._id,
      // seller_location: productdata.seller_profile?.location,
  productid: productdata._id,
  productname: productdata.name,
  price: Number(selsctSizeSlot.other_price),
  offer: Number(selsctSizeSlot.our_price),
  variant_color: selectedslot?.color,
  variant_images: selectedslot?.image,
  selected_size: selsctSizeSlot,
  image: selectedslot?.image?.[0] || productdata.image?.[0],
  qty: 1,
  seller_id: productdata.sellerid,
  seller_profile: productdata.seller_profile?._id,
  seller_location: productdata.seller_profile?.location,
      };

      const updatedCart = [newProduct];
      setshoppingcartdetail(updatedCart);
      await AsyncStorage.setItem('shoppingcartdata', JSON.stringify(updatedCart));
      setAvailableQty(1); // Update UI
      console.log("New product added after clearing cart:", newProduct);
      return;
    }
  }

  if (!existingProduct) {
    const newProduct = {
      // productid: productdata._id,
      // productname: productdata.name,
      // price: selectedslot.other_price,
      // offer: selectedslot.our_price,
      // price_slot:selectedslot,
      // image: productdata.image[0],
      // qty: 1,
      // seller_id: productdata.sellerid,
      // seller_profile: productdata.seller_profile?._id,
      // seller_location: productdata.seller_profile?.location,
        productid: productdata._id,
  productname: productdata.name,
  price: Number(selsctSizeSlot.other_price),
  offer: Number(selsctSizeSlot.our_price),
  variant_color: selectedslot?.color,
  variant_images: selectedslot?.image,
  selected_size: selsctSizeSlot,
  image: selectedslot?.image?.[0] || productdata.image?.[0],
  qty: 1,
  seller_id: productdata.sellerid,
  seller_profile: productdata.seller_profile?._id,
  seller_location: productdata.seller_profile?.location,
    };

    const updatedCart = [...existingCart, newProduct];
    setshoppingcartdetail(updatedCart);
    await AsyncStorage.setItem('shoppingcartdata', JSON.stringify(updatedCart))
    console.log("Product added to cart:", newProduct);
  } else {
    console.log(
      "Product already in cart with this price slot:",
      existingProduct
    );
  }
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
                     <BackIcon  color={Constants.black}/>
                       </TouchableOpacity>
              <Text style={styles.headtxt}>{t("Product detail")}</Text>
              <View></View>
            </View>
      <ScrollView showsVerticalScrollIndicator={false} style={{padding:20}}>
        <View style={{marginTop: 5}}>
                  <SwiperFlatList
                    data={selectedslot?.image || []}
                    onChangeIndex={({index}) => setCurrentIndex(index)}
                    renderItem={({item, index}) => (
                      <View
                        style={{paddingBottom: 5, width: width, alignItems: 'center'}}>
                        <Image
                            source={{uri: `${item}`}}
                          // source={item.image}
                          style={{
                            height: 350,
                            width: '95%',
                            borderRadius: 20,
                          }}
                          resizeMode="stretch"
                          key={index}
                        />
                      </View>
                    )}
                  />
                   {/* <TouchableOpacity style={styles.faviconcov} onPress={() => togglefav(productdata?._id)}>
                                <UnfavIcon color={productdata?.isFavorite?'#F14141':null}/>
                              </TouchableOpacity> */}
                  {selectedslot?.image&&selectedslot?.image.length>0&&<CustomPagination data={selectedslot?.image} index={currentIndex} />}
                </View>
        <Text style={styles.proname}>{productdata?.name}</Text>
        <Text style={[styles.dectitle,{marginLeft:10}]}>{productdata?.short_description}</Text>
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
         
          {productdata?.variants &&
            productdata?.variants.length > 0 &&
            productdata.variants.map((item,i) => (
              <TouchableOpacity style={[styles.box,{marginRight:productdata?.variants.length===i+1?20:10,borderColor:selectedslot?.color===item.color?Constants.black:Constants.customgrey5}]} key={i} onPress={()=>{setsselectedslot(item),setSelsctSizeSlot(item?.selected[0]),setSelsctSize('')}}>
                <Image source={{uri:item?.image[0]}} style={{width:'100%',height:60,borderRadius:7}} resizeMode='stretch'/>
              </TouchableOpacity>
            ))}
        </ScrollView>
        <View style={styles.pricecov}>
          <View style={{flexDirection: 'row', gap: 10}}>
            <Text style={styles.maintxt2}>{Currency} {selsctSizeSlot?.our_price}</Text>
            {selsctSizeSlot?.our_price && (
              <Text
                style={[styles.weight, {textDecorationLine: 'line-through'}]}>
                {Currency} {selsctSizeSlot?.other_price}
              </Text>
            )}
            {selsctSizeSlot?.our_price && (
              <Text style={styles.disctxt2}>
                {(
                  ((selsctSizeSlot?.other_price - selsctSizeSlot?.our_price) /
                    selsctSizeSlot?.other_price) *
                  100
                ).toFixed(0)}
                % {t("off")}
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
                    const updatedCart = shoppingcartdetail.map(item => {
                      if (
                        item.productid === currentproduct?.productid &&
                        item.variant_color === selectedslot?.color &&
                        item.selected_size?.value === selsctSizeSlot?.value
                      ) {
                        return {
                          ...item,
                          qty: item.qty - 1,
//                           price: selectedslot.other_price,
//                           offer: selectedslot.our_price,
//                           variant_color: selectedslot?.color,
// variant_images: selectedslot?.image,
// selected_size: selsctSizeSlot,

                        };
                      }
                      return item;
                    });
                  
                    setshoppingcartdetail(updatedCart);
                    await AsyncStorage.setItem('shoppingcartdata', JSON.stringify(updatedCart));
                    console.log('Product quantity decreased:', currentproduct?.productname);
              
                    setAvailableQty(availableQty - 1);
                  } else {
                    // Remove product from cart if qty is 1
                    const updatedCart = shoppingcartdetail.filter(item => {
                      return !(
                        item.productid === currentproduct?.productid &&
                        item.variant_color === selectedslot?.color &&
                        item.selected_size?.value === selsctSizeSlot?.value
                      );
                    });
                  
                    setshoppingcartdetail(updatedCart);
                    await AsyncStorage.setItem('shoppingcartdata', JSON.stringify(updatedCart));
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
                  const updatedCart = shoppingcartdetail.map(item => {
                    if (
                      item.productid === currentproduct?.productid &&
                      item.variant_color === selectedslot?.color &&
item.selected_size?.value === selsctSizeSlot?.value
                    ) {
                      return {
                        ...item,
                        qty: item.qty + 1,
//                         price: selectedslot.other_price,
//                         offer: selectedslot.our_price,
//                         variant_color: selectedslot?.color,
// variant_images: selectedslot?.image,
// selected_size: selsctSizeSlot,
                      };
                    }
                    return item;
                  });
                  
                  setshoppingcartdetail(updatedCart);
                  await AsyncStorage.setItem('shoppingcartdata', JSON.stringify(updatedCart));
                  console.log('Product quantity increased:', currentproduct?.productname);
                }}>
                <Plus2Icon color={Constants.white} height={20} width={20} />
              </TouchableOpacity>
            </View>
          :<Text style={styles.addbtn} onPress={() => cartdata()}>
          {t("ADD")}
        </Text>}
        </View>
        <Text style={[styles.siztxt,{color:Constants.black}]}>{t("Size")}</Text>
        <ScrollView showsHorizontalScrollIndicator={false} horizontal={true} style={{marginBottom:10}}>
          {selectedslot?.selected&&selectedslot?.selected?.length>0&&selectedslot?.selected.map((it,ind)=><TouchableOpacity style={[styles.sizecov,{backgroundColor:selsctSize===it?.value?Constants.normal_green:null}]} key={ind} onPress={()=>{setSelsctSizeSlot(it),setSelsctSize(it?.value)}}><Text style={[styles.siztxt,{color:selsctSize===it?.value?Constants.white:Constants.normal_green}]}>{it?.value}</Text></TouchableOpacity>)}
        </ScrollView>
        <View style={styles.line}></View>
        <View style={styles.productinfocov}>
          <Text style={styles.proddec}>{t("Product Information")}</Text>
          {/* <View style={styles.expirycard}>
            <Text style={styles.exptxt}>EXPIRY DATE</Text>
            <Text style={styles.exptxt2}>{moment(productdata?.expirydate).format('DD MMM yyyy')}</Text>
          </View> */}
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
          onPress={() => navigate('Shoppingtab',{screen:'Cart'})}>
          <Text style={styles.buttontxt}>
            {' '}
            {shoppingcartdetail.length} {t("items")} | {Currency}{sumdata}
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

export default ShoppingPreview;

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
    marginTop:Platform.OS==='ios'?10:0,
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
    // backgroundColor: Constants.white,
    width: 60,
    padding: 2,
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
  sizecov:{
    height:40,
    width:40,
    borderRadius:25,
    borderWidth:1,
    borderColor:Constants.normal_green,
    justifyContent:'center',
    alignItems:'center',
    marginRight:10
  },
  siztxt:{
    fontSize:16,
    fontFamily:FONTS.SemiBold,
    color:Constants.normal_green
  }
});
