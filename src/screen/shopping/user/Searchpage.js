import {
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {createRef, useContext, useEffect, useRef, useState} from 'react';
import Constants, {Currency, FONTS} from '../../../Assets/Helpers/constant';
import {
  BackIcon,
  PlusIcon,
  SearchIcon,
} from '../../../../Theme';
import {
  ShoppingCartContext,
  LoadContext,
  ToastContext,
  UserContext,
} from '../../../../App';
import {GetApi, Post} from '../../../Assets/Helpers/Service';
import {goBack, navigate} from '../../../../navigationRef';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

const ShoppingSearchpage = () => {
  const { t } = useTranslation();
  const inputRef = useRef(null);
  const [toast, setToast] = useContext(ToastContext);
  const [loading, setLoading] = useContext(LoadContext);
  const [user, setuser] = useContext(UserContext);
  const [shoppingcartdetail, setshoppingcartdetail] = useContext(ShoppingCartContext);
  const [productlist, setproductlist] = useState([]);
  const [searchkey, setsearchkey] = useState('');
  const [jobtype, setjobtype] = useState('');
  const [page, setPage] = useState(1);
  const [curentData, setCurrentData] = useState([]);
  const sortRef = createRef();

  useEffect(() => {
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 200);
  }, []);

  const getsearchproducts = (p, text, sort) => {
    setPage(p);
    // setLoading(true);
    console.log(p);
    GetApi(`shoppingSearch?page=${p}&key=${text}`).then(
      async res => {
        // setLoading(false);
        console.log(res);
        // setproductlist(res);
        setCurrentData(res.data);
        if (p === 1) {
          setproductlist(res.data);
        } else {
          setproductlist([...productlist, ...res.data]);
        }
      },
      err => {
        setLoading(false);
        console.log(err);
      },
    );
  };

  const cartdata = async productdata => {
    const existingCart = Array.isArray(shoppingcartdetail) ? shoppingcartdetail : [];

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
      setshoppingcartdetail(updatedCart);
      await AsyncStorage.setItem('shoppingcartdata', JSON.stringify(updatedCart));
      console.log("New product added after clearing cart:", newProduct);
      setToast("Successfully added to cart.")
      return;
    } else{
       console.log(
        "Product already in cart with this price slot:",
        existingProduct
      );
      let stringdata = shoppingcartdetail.map(_i => {
        if (_i?.productid == productdata._id) {
          console.log('enter')
          return { ..._i, qty: _i?.qty + 1 };
        } else {
          return _i;
        }
      });
      console.log(stringdata)
      setshoppingcartdetail(stringdata);
      await AsyncStorage.setItem('shoppingcartdata', JSON.stringify(stringdata))
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
      setshoppingcartdetail(updatedCart);
      await AsyncStorage.setItem('shoppingcartdata', JSON.stringify(updatedCart));
      console.log('Product added to cart:', newProduct);
    }
    setToast('Successfully added to cart.');
    // navigate('Cart');
  };

  const mixedStyle = {
    body: {
      whiteSpace: 'normal',
      color: '#000000',
      fontSize: '14px',
      fontWeight: 'bold',
    },
    p: {
      color: '#000000',
      fontSize: '14px',
      fontWeight: 'bold',
      whiteSpace: 'normal',
      fontFamily: FONTS.Bold,
    },
  };
  const fetchNextPage = () => {
    if (curentData.length === 20) {
      // if (jobtype) {
      //   getsearchproducts(page + 1, searchkey,jobtype);
      // } else {
      getsearchproducts(page + 1, searchkey);
      // }
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchcov}>
        <BackIcon
          color={Constants.white}
          width={25}
          height={25}
          style={{alignSelf: 'center'}}
          onPress={() => goBack()}
        />
        <View style={[styles.inpcov]}>
          <SearchIcon height={20} width={20} color={Constants.black}/>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder={t("What are u looking for ?")}
            placeholderTextColor={Constants.customgrey2}
            onChangeText={name => {
              getsearchproducts(1, name), setsearchkey(name);
            }}></TextInput>
        </View>
        
      </View>
      
      <FlatList
        data={productlist}
        numColumns={2}
        style={{paddingRight: 20, marginLeft: 5, paddingTop: 10, flex: 1}}
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
            <TouchableOpacity
              style={styles.box}
              onPress={() => navigate('ShoppingPreview', item._id)}>
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
                               <Text style={styles.offtxt}>{(((Number(item?.variants[0]?.selected[0]?.other_price) - Number(item?.variants[0]?.selected[0]?.our_price)) / Number(item?.variants[0]?.selected[0]?.other_price)) * 100).toFixed(0)}%</Text>
                               <Text style={styles.offtxt}>{t("off")}</Text>
                             </ImageBackground>
                           )}
              <Text style={styles.proname}>{item.name}</Text>
              {/* {item?.variants?.[0]?.selected && (
                                  <Text style={styles.weight}>
                                    {item?.variants?.[0]?.selected.map((it)=>{return(`${it?.value} ,`)})}
                                  </Text>
                                )} */}
              {/* <View style={{flexDirection: 'row', flex: 1, marginHorizontal: 15,marginBottom:10,}}> */}
                <View style={{flex: 1,flexDirection:'row',gap:10,alignItems:'center',marginHorizontal: 15,}}>
                                    {item?.variants && item?.variants?.length > 0 && <Text style={styles.disctxt}>{Currency}{item?.variants[0]?.selected[0]?.our_price}</Text>}
                  {item?.variants && item?.variants?.length > 0 && <Text style={styles.maintxt}>{Currency}{item?.variants[0]?.selected[0]?.other_price}</Text>}
                </View>
                {/* <TouchableOpacity
                  style={styles.pluscov}
                  onPress={() => cartdata(item)}>
                  <PlusIcon height={25} width={25} />
                </TouchableOpacity> */}
              {/* </View> */}
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

export default ShoppingSearchpage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.white,
    // padding: 20,
  },
  inpcov: {
    borderWidth: 1,
    borderColor: Constants.customgrey,
    backgroundColor: Constants.white,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginHorizontal: 15,
    flex: 1,
  },
  input: {
    flex: 1,
    color: Constants.black,
    fontFamily: FONTS.Regular,
    fontSize: 16,
    marginLeft: 10,
    textAlign: 'left',
    minHeight: 45,
    // backgroundColor:Constants.red
  },
  searchcov: {
    backgroundColor: Constants.normal_green,
    padding: 20,
    flexDirection: 'row',
  },
  cardimg: {
    height: 175,
    width: '100%',
    borderTopLeftRadius:20,
    borderTopRightRadius:20,
    resizeMode: 'contain',
    alignSelf: 'center',
    borderRadius:5
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
    width: '100%',
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
});
