import {
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useContext, useEffect, useState} from 'react';
import Constants, {Currency, FONTS} from '../../../Assets/Helpers/constant';
import {
  BackIcon,
  Cart2Icon,
  MinusIcon,
  PlusIcon,
  StarIcon,
  TimeIcon,
  UnfavIcon,
} from '../../../../Theme';
import {SwiperFlatList} from 'react-native-swiper-flatlist';
import { goBack, navigate } from '../../../../navigationRef';
import { GetApi, Post } from '../../../Assets/Helpers/Service';
import { FoodCartContext, LoadContext, ToastContext, UserContext } from '../../../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

const PreView = (props) => {
  const { t } = useTranslation();
  const food_id = props?.route?.params;
  const {width} = Dimensions.get('window');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [toast, setToast] = useContext(ToastContext);
  const [loading, setLoading] = useContext(LoadContext);
  const [foodcartdetail, setfoodcartdetail] = useContext(FoodCartContext);
  const [user, setUser] = useContext(UserContext);
  const [productdata, setproductdata] = useState();

  const slides = [
    {id: 1, image: require('../../../Assets/Images/barger3.png')},
    {id: 2, image: require('../../../Assets/Images/barger4.jpg')},
    {id: 3, image: require('../../../Assets/Images/barger5.jpg')},
  ];
  useEffect(() => {
    {
      food_id && getProductById();
    }
  }, []);
  const getProductById = () => {
    setLoading(true);
    GetApi(`getFoodById/${food_id}?userId=${user?._id}`).then(
      async res => {
        setLoading(false);
        console.log(res);
        if (res.status) {
          setproductdata(res.data);
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
        getProductById();
      },
      err => {
        setLoading(false);
        console.log(err);
      },
    );
  };
  const [availableQty, setAvailableQty] = useState(0);
  useEffect(() => {
    if (foodcartdetail.length > 0) {
      const cartItem = foodcartdetail.find(
        (f) =>
          f.foodid=== productdata?._id
      );

      if (cartItem) {
        setAvailableQty(cartItem.qty);
      } else {
        setAvailableQty(0);
      }
    } else {
      setAvailableQty(0);
    }
  }, [foodcartdetail, productdata]);
  // const cartdata = async () => {
  //   const existingCart = Array.isArray(foodcartdetail)
  //   ? foodcartdetail
  //   : [];

  // const existingProduct = existingCart.find(
  //   (f) =>
  //     f.foodid === productdata._id
  // );

  // if (!existingProduct) {
  //   const newProduct = {
  //     foodid: productdata._id,
  //     foodname: productdata.name,
  //     price: productdata.price,
  //     image: productdata.image[0],
  //     qty: 1,
  //     seller_id: productdata.sellerid,
  //   };

  //   const updatedCart = [...existingCart, newProduct];
  //   setfoodcartdetail(updatedCart);
  //   await AsyncStorage.setItem('foodcartdata', JSON.stringify(updatedCart))
  //   console.log("Product added to cart:", newProduct);
  // } else {
  //   console.log(
  //     "Product already in cart with this price slot:",
  //     existingProduct
  //   );
  // }
  // };
  const cartdata = async () => {
  const existingCart = Array.isArray(foodcartdetail) ? foodcartdetail : [];

  const existingProduct = existingCart.find(
    (f) => f.foodid === productdata._id
  );

  // Check if the cart already has items
  if (existingCart.length > 0) {
    const currentSellerId = existingCart[0].seller_id;
    
    // If trying to add product from a different seller
    if (productdata.sellerid !== currentSellerId) {
      console.log("Different seller detected, clearing cart...");

      // 🧹 Clear old cart and add new item
      const newProduct = {
        foodid: productdata._id,
        foodname: productdata.name,
        price: productdata.price,
        image: productdata.image[0],
        qty: 1,
        seller_id: productdata.sellerid,
        seller_profile: productdata?.seller_profile?._id,
        seller_location:productdata?.seller_profile?.location
      };

      const updatedCart = [newProduct];
      setfoodcartdetail(updatedCart);
      await AsyncStorage.setItem('foodcartdata', JSON.stringify(updatedCart));
      setAvailableQty(1); // Update UI
      console.log("New product added after clearing cart:", newProduct);
      return;
    }
  }

  // Same seller or empty cart
  if (!existingProduct) {
    const newProduct = {
      foodid: productdata._id,
      foodname: productdata.name,
      price: productdata.price,
      image: productdata.image[0],
      qty: 1,
      seller_id: productdata.sellerid,
      seller_profile: productdata?.seller_profile?._id,
      seller_location:productdata?.seller_profile?.location
    };

    const updatedCart = [...existingCart, newProduct];
    setfoodcartdetail(updatedCart);
    await AsyncStorage.setItem('foodcartdata', JSON.stringify(updatedCart));
    setAvailableQty(1); // Update UI
    console.log("Product added to cart:", newProduct);
  } else {
    console.log("Product already in cart with this price slot:", existingProduct);
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
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.rowbtn}>
       <TouchableOpacity style={styles.backcov} onPress={() => goBack()}>
               <BackIcon  />
                 </TouchableOpacity>
        <Text style={styles.headtxt}>{t("About This Menu")}</Text>
        <View></View>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{marginTop: 15}}>
          <SwiperFlatList
            // data={productdata?.varients[0].image || []}
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
                        <UnfavIcon color={productdata?.isFavorite?'#F14141':null}/>
                      </TouchableOpacity>
          {productdata?.image&&productdata?.image.length>0&&<CustomPagination data={productdata?.image} index={currentIndex} />}
        </View>
        <View style={{marginHorizontal: 20, marginTop: 15}}>
          <Text style={styles.prodname}>{productdata?.name}</Text>
          <Text style={styles.prodprice}>{Currency} {productdata?.price}</Text>
          {/* <View style={styles.box}>
            <Text style={styles.boxtxt1}>
              $ <Text style={styles.boxtxt}> Free Delivery</Text>
            </Text>
            <View style={styles.ndrdpart}>
              <TimeIcon />
              <Text style={styles.boxtxt}>20 - 30</Text>
            </View>
            <View style={styles.ndrdpart}>
              <StarIcon />
              <Text style={styles.boxtxt}>4.5</Text>
            </View>
          </View> */}
          <View style={styles.horline}></View>
          <Text style={styles.dectxt}>{t("Description")}</Text>
          <Text style={styles.dectxt2}>
           {productdata?.description}
          </Text>
        </View>
      </ScrollView>
      <View style={styles.cartpart}>
        {availableQty>0 ? (
          <View style={styles.alrecartcov}>
            <View style={styles.cartpartfirst}>
              <TouchableOpacity style={styles.iconcov} onPress={async () => {
                  if (availableQty > 1) {
                    // Decrease quantity
                    const updatedCart = foodcartdetail.map(item => {
                      if (
                        item.foodid === productdata?._id
                      ) {
                        return {
                          ...item,
                          qty: item.qty - 1,
                        };
                      }
                      return item;
                    });
                  
                    setfoodcartdetail(updatedCart);
                    await AsyncStorage.setItem('foodcartdata', JSON.stringify(updatedCart));
              
                    setAvailableQty(availableQty - 1);
                  } else {

                    const updatedCart = foodcartdetail.filter(item => {
                      return !(
                        item.foodid === productdata?._id
                      );
                    });
                  
                    setfoodcartdetail(updatedCart);
                    await AsyncStorage.setItem('foodcartdata', JSON.stringify(updatedCart));
                    setAvailableQty(0);
                  }
                  
                }}>
                <MinusIcon color={Constants.black}/>
              </TouchableOpacity>
              <Text style={styles.qty}>{availableQty}</Text>
              <TouchableOpacity style={styles.iconcov}  onPress={async () => {
                  const updatedCart = foodcartdetail.map(item => {
                    if (
                      item.foodid === productdata?._id
                    ) {
                      return {
                        ...item,
                        qty: item.qty + 1,
                      };
                    }
                    return item;
                  });
                  
                  setfoodcartdetail(updatedCart);
                  await AsyncStorage.setItem('foodcartdata', JSON.stringify(updatedCart));
                }}>
                <PlusIcon color={Constants.black}/>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[styles.signInbtn, {width: '50%'}]}
              onPress={() => navigate('Foodtab',{screen:'Cart'})}>
              <Cart2Icon />
              <Text style={styles.buttontxt}>{t("Go to Cart")}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.signInbtn}
            onPress={() => cartdata()}>
            <Cart2Icon />
            <Text style={styles.buttontxt}>{t("Add to Cart")}</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

export default PreView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.white,
    paddingVertical: 20,
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
  prodname: {
    fontSize: 18,
    fontFamily: FONTS.SemiBold,
    color: Constants.black,
  },
  boxtxt: {
    fontSize: 14,
    fontFamily: FONTS.Medium,
    color: Constants.customgrey2,
  },
  boxtxt1: {
    fontSize: 14,
    fontFamily: FONTS.ExtraBold,
    color: Constants.normal_green,
  },
  dectxt: {
    fontSize: 16,
    fontFamily: FONTS.SemiBold,
    color: Constants.black,
  },
  dectxt2: {
    fontSize: 14,
    fontFamily: FONTS.Regular,
    color: Constants.customgrey2,
  },
  prodprice: {
    fontSize: 16,
    fontFamily: FONTS.SemiBold,
    color: Constants.normal_green,
    marginVertical: 5,
  },
  horline: {
    height: 1.5,
    backgroundColor: Constants.customgrey5,
    marginVertical: 15,
  },
  box: {
    backgroundColor: '#f7f9f7',
    padding: 10,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ndrdpart: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  buttontxt: {
    color: Constants.white,
    fontSize: 16,
    fontFamily: FONTS.Medium,
  },
  signInbtn: {
    height: 50,
    borderRadius: 30,
    backgroundColor: Constants.normal_green,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    flex: 1,
    alignSelf: 'center',
    width: '90%',
  },
  qty: {
    fontSize: 16,
    color: Constants.black,
    fontFamily: FONTS.SemiBold,
  },
  iconcov: {
    borderWidth: 1,
    borderColor: Constants.black,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    padding: 5,
    height: 30,
    width: 30,
  },
  cartpart: {
    position: 'absolute',
    bottom: 10,
    width: '100%',
  },
  cartpartfirst: {
    flexDirection: 'row',
    width: '50%',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  alrecartcov: {flexDirection: 'row', width: '90%', alignSelf: 'center'},
    faviconcov: {
    height: 30,
    width: 30,
    borderRadius:30,
    backgroundColor: Constants.white,
    position: 'absolute',
    top: 10,
    right: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
