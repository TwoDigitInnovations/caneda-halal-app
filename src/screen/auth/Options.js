import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import Constants, {FONTS} from '../../Assets/Helpers/constant';
import {navigate, reset} from '../../../navigationRef';
import {
  DeliveryRiderContext,
  DriverProfileContext,
  FoodCartContext,
  FoodSellerContext,
  FoodUserContext,
  GroceryCartContext,
  GroceryUserContext,
  LoadContext,
  ProfileContext,
  ShoppingCartContext,
  ShoppingUserContext,
} from '../../../App';
import {GetApi} from '../../Assets/Helpers/Service';
import {CrossIcon, DriverIcon, SellerIcon, UserIcon} from '../../../Theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTranslation} from 'react-i18next';
import SwiperFlatList from 'react-native-swiper-flatlist';
import {useFocusEffect} from '@react-navigation/native';
import Scheliton from '../../Assets/Component/Scheliton';

const Options = props => {
  const {t} = useTranslation();
  const [assignmodel, setassignmodel] = useState(false);
  const [loading, setLoading] = useContext(LoadContext);
  const [imgLoading, setImgLoading] = useState(true);
  // const [profile, setProfile] = useContext(ProfileContext);
  // const [foodsellerProfile, setfoodsellerProfile] = useContext(FoodSellerContext);
  // const [deliveryriderProfile, setdeliveryriderProfile] = useContext(DeliveryRiderContext);
  const [driverProfile, setdriverProfile] = useContext(DriverProfileContext);
  const [foodcartdetail, setfoodcartdetail] = useContext(FoodCartContext);
  const [fooduserProfile, setfooduserProfile] = useContext(FoodUserContext);
  const [groceryuserProfile, setgroceryuserProfile] =
    useContext(GroceryUserContext);
  const [shoppinguserProfile, setshoppinguserProfile] =
    useContext(ShoppingUserContext);
  const [grocerycartdetail, setgrocerycartdetail] =
    useContext(GroceryCartContext);
  const [shoppingcartdetail, setshoppingcartdetail] =
    useContext(ShoppingCartContext);
  const [carosalimg, setcarosalimg] = useState([]);
  const [carosalimg2, setcarosalimg2] = useState([]);

  const width = Dimensions.get('window').width;
  const width2 = Dimensions.get('window').width - 30;
  // useEffect(()=>{
  //   getcarosal1();
  //   getcarosal2()
  // },[])
  useFocusEffect(
    useCallback(() => {
      const timer = setTimeout(() => {
        getcarosal1();
        getcarosal2();
      }, 300); // delay in ms
      return () => clearTimeout(timer);
    }, []),
  );

  const getrideProfile = () => {
    // setLoading(true);
    // GetApi(`getProfile/RIDEDRIVER`, {}).then(
    //   async res => {
    //     setLoading(false);
    //     console.log(res);
    //     if (res?.data?.status === 'VERIFIED') {
    //       navigate('Drivertab');
    //       setdriverProfile(res?.data);
    //     } else {
    //       // navigate('SideMenu',{screen:'Home'});
          props?.navigation?.navigate('SideMenu');
    //     }
    //   },
    //   err => {
    //     setLoading(false);
    //     console.log(err);
    //   },
    // );
  };

  const getCombinedProfile = async () => {
    setLoading(true);
    try {
      const res = await GetApi('getProfile/FOODUSER');
      // const res = await GetApi('getCombinedProfile', {});
      setLoading(false);

      // const profiles = res?.data || {};

      // // Priority-based redirection
      // if (profiles?.DELIVERYRIDER?.status === 'VERIFIED') {
      //   setdeliveryriderProfile(profiles.DELIVERYRIDER);
      //   return navigate('Ridertab');
      // }

      // if (profiles?.FOODSELLER?.status === 'VERIFIED') {
      //   setfoodsellerProfile(profiles.FOODSELLER);
      //   return navigate('FoodSellerTab');
      // }

      // if (profiles?.FOODUSER) {
      //   setfooduserProfile(profiles.FOODUSER);
      // }
      setfooduserProfile(res?.data);

      const fdflow = await AsyncStorage.getItem('foodflow');
      const flow = JSON.parse(fdflow);
      if (flow === true) {
        navigate('Foodtab');
      } else {
        navigate('Onboarding');
      }

      const cart = await AsyncStorage.getItem('foodcartdata');
      if (cart) {
        setfoodcartdetail(JSON.parse(cart));
      }
    } catch (err) {
      setLoading(false);
      console.log(err);
    }
  };
  const getgroceryuserProfile = () => {
    setLoading(true);
    GetApi(`getProfile/GROCERYUSER`, {}).then(
      async res => {
        setLoading(false);
        console.log(res);
        setgroceryuserProfile(res?.data);
        navigate('Grocerytab');
        const cart = await AsyncStorage.getItem('grocerycartdata');
        if (cart) {
          setgrocerycartdetail(JSON.parse(cart));
        }
      },
      err => {
        setLoading(false);
        console.log(err);
      },
    );
  };
  const getshoppinguserProfile = () => {
    setLoading(true);
    GetApi(`getProfile/SHOPPINGUSER`, {}).then(
      async res => {
        setLoading(false);
        console.log(res);
        if (res?.data) {
          setshoppinguserProfile(res?.data);
        }
        navigate('Shoppingtab');
        const cart = await AsyncStorage.getItem('shoppingcartdata');
        if (cart) {
          setshoppingcartdetail(JSON.parse(cart));
        }
      },
      err => {
        setLoading(false);
        console.log(err);
      },
    );
  };
  const getcarosal1 = () => {
    // setLoading(true);
    GetApi(`getBookingCarousel1`, {}).then(
      async res => {
        setLoading(false);
        console.log(res);
        if (res.status) {
          setcarosalimg(res?.data?.bookingcarousel1[0].carousel);
        }
      },
      err => {
        setLoading(false);
        console.log(err);
      },
    );
  };
  const getcarosal2 = () => {
    // setLoading(true);
    GetApi(`getBookingCarousel2`, {}).then(
      async res => {
        setLoading(false);
        console.log(res);
        if (res.status) {
          setcarosalimg2(res?.data?.bookingcarousel2[0].carousel);
        }
      },
      err => {
        setLoading(false);
        console.log(err);
      },
    );
  };
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.headtxt1} onPress={()=>navigate('Shippingtab')}>{t('Select Category')}</Text>
        <View style={styles.boxcov}>
          <TouchableOpacity
            style={styles.box}
            onPress={() => getgroceryuserProfile()}>
            <Image
              source={require('../../Assets/Images/shopping-bag.png')}
              style={styles.img}
            />
            <Text style={styles.txt}>{t('Grocery')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.box}
            onPress={() => getshoppinguserProfile()}>
            <Image
              source={require('../../Assets/Images/online-shopping2.png')}
              style={[styles.img, {height: 80}]}
            />
            <Text style={styles.txt}>{t('Online Shopping')}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.boxcov}>
          <TouchableOpacity style={styles.box} onPress={() => getrideProfile()}>
            <Image
              source={require('../../Assets/Images/online-booking.png')}
              style={styles.img}
            />
            <Text style={styles.txt}>{t('CHMP RIDES BOOKING')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.box}
            onPress={() => getCombinedProfile()}>
            <Image
              source={require('../../Assets/Images/delivery.png')}
              style={styles.img}
            />
            <Text style={styles.txt}>{t('Food Delivery')}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.headtxt}>{t('Today’s Promotions')}</Text>
        {/* <Image
          source={require('../../Assets/Images/banner1.png')}
          resizeMode="contain"
          style={{ width: '92%', alignSelf: 'center', height: 120 }}
        /> */}
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
              <View style={{width: width, alignItems: 'center'}}>
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
                  onLoadStart={() => setImgLoading(true)}
                  onLoadEnd={() => setImgLoading(false)}
                  onError={() => setImgLoading(false)}
                  resizeMode="stretch"
                  key={index}
                />
              </View>
            )}
          />
        ) : (
          <Scheliton/>
        )}
        <Text style={[styles.headtxt, {marginTop: 10}]}>
          {t('Discover all the good eats on CHMP Food')}
        </Text>
        {/* <View style={{width:'100%',}}> */}
        {/* <Image
          source={require('../../Assets/Images/banner3.png')}
          style={{
            width: '92%',
            alignSelf: 'center',
            height: 180,
            borderRadius: 15,
          }}
        /> */}
        {carosalimg2 && carosalimg2?.length > 0 ? (
          <SwiperFlatList
            autoplay
            autoplayDelay={3}
            autoplayLoop
            // index={2}
            // showPagination
            // paginationActiveColor="red"
            data={carosalimg2 || []}
            // renderItem={({item}) => (
            //   <View style={[styles.child, {backgroundColor: item}]}>
            //     <Text style={styles.text}>{item}</Text>
            //   </View>
            // )}
            renderItem={({item, index}) => (
              <View
                style={{width: width, alignItems: 'center', marginBottom: 15}}>
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
              </View>
            )}
          />
        ) : (
          <Scheliton />
        )}
        {/* </View> */}
      </ScrollView>
      {/* <Modal
        animationType="none"
        transparent={true}
        visible={assignmodel}
      >
        <View style={styles.centeredView2}>
          <View style={styles.modalView2}>
            <CrossIcon style={styles.popupcross} height={16} width={16} onPress={() => setassignmodel(false)} />
            <View
              style={{
                backgroundColor: 'white',
                alignItems: 'center',
                // paddingHorizontal: 15,
                flexDirection: 'row',
                justifyContent: 'space-evenly',
                width: '100%'
              }}>
              <TouchableOpacity onPress={async () =>getfooduserProfile()}>
                <UserIcon height={40} width={40} color={Constants.normal_green} />
                <Text style={styles.poptxt}>User</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { getfoodProfile(), setassignmodel(false) }}>
                <SellerIcon height={40} width={40} color={Constants.normal_green} />
                <Text style={styles.poptxt}>Seller</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={()=>{getdeliveryrider(), setassignmodel(false)}}>
                <DriverIcon height={40} width={40} />
                <Text style={styles.poptxt}>Driver</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal> */}
    </SafeAreaView>
  );
};

export default Options;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.white,
    // padding: 20,
  },
  boxcov: {
    flexDirection: 'row',
    width: '90%',
    marginVertical: 15,
    gap: 10,
    alignSelf: 'center',
  },
  img: {
    width: '90%',
    resizeMode: 'contain',
  },
  box: {
    alignItems: 'center',
    paddingVertical: 10,
    width: '25%',
    backgroundColor: Constants.white,
    borderRadius: 10,
    flex: 1,

    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,

    // Shadow for Android
    elevation: 5,
  },
  txt: {
    fontSize: 12,
    fontFamily: FONTS.SemiBold,
    color: Constants.black,
    textAlign: 'center',
    marginTop: 5,
  },
  headtxt: {
    fontSize: 14,
    fontFamily: FONTS.SemiBold,
    color: Constants.black,
    marginBottom: 10,
    marginHorizontal: 10,
  },
  headtxt1: {
    fontSize: 16,
    fontFamily: FONTS.SemiBold,
    color: Constants.black,
    textAlign: 'center',
    marginTop: 10,
  },
  centeredView2: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // marginTop: 22,
    backgroundColor: '#rgba(0, 0, 0, 0.5)',
  },
  modalView2: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    paddingVertical: 20,
    alignItems: 'center',
    width: '90%',
  },
  popupcross: {
    alignSelf: 'flex-end',
    marginRight: 15,
    marginTop: -5,
    marginBottom: 20,
  },
  poptxt: {
    fontSize: 14,
    fontFamily: FONTS.SemiBold,
    color: Constants.normal_green,
    textAlign: 'center',
    marginTop: 5,
  },
});
