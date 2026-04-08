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
import {PlusIcon} from '../../../../Theme';
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
      <FlatList
        data={productlist}
        numColumns={2}
        style={{paddingRight:20,marginLeft:5,paddingTop:10}}
        showsVerticalScrollIndicator={false}
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
                fontSize: 20,
                fontFamily: FONTS.Medium,
              }}>
              {t("No Products")}
            </Text>
          </View>
        )}
        // style={{gap:'2%'}}
        renderItem={({item}, i) => (
          <View style={styles.shadowWrapper} key={i}>
          <TouchableOpacity style={styles.box} onPress={()=>navigate('GroceryPreview',item._id)}>
          {/* <ImageBackground source={require('../../Assets/Images/start.png')} style={styles.star}></ImageBackground> */}
          <Image
            // source={require('../../Assets/Images/salt.png')}
            source={{uri: item.image[0]}}
            style={styles.cardimg}
            resizeMode='stretch'
          />
         {item?.price_slot&&item?.price_slot?.length>0 && <ImageBackground
            source={require('../../../Assets/Images/star.png')}
            style={styles.cardimg2}
          >
            <Text style={styles.offtxt}>{(((item?.price_slot[0]?.other_price-item?.price_slot[0]?.our_price)/item?.price_slot[0]?.other_price)*100).toFixed(0)}%</Text>
            <Text style={styles.offtxt}>{t("off")}</Text>
          </ImageBackground>}
          <Text style={styles.proname}>{item.name}</Text>
          {item?.price_slot?.[0]?.value && (
                              <Text style={styles.weight}>
                                {item.price_slot[0].value}
                                {item.price_slot[0].unit}
                              </Text>
                            )}
          <View style={{flexDirection: 'row', flex: 1, marginHorizontal: 15,marginBottom:10,}}>
            <View style={{flex: 1}}>
              {item?.price_slot&&item?.price_slot?.length>0 &&<Text style={styles.maintxt}>{Currency}{item?.price_slot[0]?.other_price}</Text>}
              {item?.price_slot&&item?.price_slot?.length>0 &&<Text style={styles.disctxt}>{Currency}{item?.price_slot[0]?.our_price}</Text>}
            </View>
            <TouchableOpacity style={styles.pluscov} onPress={()=>cartdata(item)}>
              <PlusIcon height={20} width={20} color={Constants.black}/>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
        </View>
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
  width: '47%',
},
box: {
  width:'100%',
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
    lineHeight:15
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
 
});
