import React, {useEffect, useState, createContext, useRef} from 'react';
import {
  AppState,
  Modal,
  PermissionsAndroid,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Navigation from './src/navigation';
// import CustomToaster from './src/Assets/Component/CustomToaster';
import Constants, {FONTS} from './src/Assets/Helpers/constant';
import {OneSignal} from 'react-native-onesignal';
import {PERMISSIONS, request} from 'react-native-permissions';
import Geolocation from 'react-native-geolocation-service';
import Spinner from './src/Assets/Component/Spinner';
import 'react-native-gesture-handler';
import GetCurrentAddressByLatLong from './src/Assets/Component/GetCurrentAddressByLatLong';
// import ToastManager, {Toast} from 'toastify-react-native';
import Toast from 'react-native-toast-message';
import i18n from './i18n';
import {StripeProvider} from '@stripe/stripe-react-native';
import SplashScreen from 'react-native-splash-screen';
import {GetApi, Post} from './src/Assets/Helpers/Service';
import CuurentLocation from './src/Assets/Component/CuurentLocation';

export const Context = React.createContext('');
export const ToastContext = React.createContext('');
export const countryContext = React.createContext({});
export const UserContext = React.createContext();
export const ProfileContext = React.createContext();
export const DriverProfileContext = React.createContext();
export const LoadContext = React.createContext('');
export const FoodSellerContext = React.createContext('');
export const FoodUserContext = React.createContext('');
export const GrocerySellerContext = React.createContext('');
export const GroceryUserContext = React.createContext('');
export const ShoppingSellerContext = React.createContext('');
export const ShoppingUserContext = React.createContext('');
export const FoodCartContext = React.createContext('');
export const GroceryCartContext = React.createContext('');
export const ShoppingCartContext = React.createContext('');
export const AddressContext = React.createContext('');
export const DeliveryRiderContext = React.createContext('');
export const TranslatorContext = React.createContext('');
export const LocationUpdateContext = React.createContext('');
export const LocationDataContext = React.createContext('');
export const ProfileStatusContext = React.createContext('');
export const ShippingDataContext = React.createContext('');

const App = () => {
  const [initial, setInitial] = useState('');
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(false);
  const [startupdateloc, setstartupdateloc] = useState(false);
  const [interval, setinter] = useState();
  const [user, setUser] = useState({});
  const [profileStatus, setProfileStatus] = useState({});
  const [updateLogin, setUpdateLogin] = useState({});
  const [profile, setProfile] = useState({});
  const [driverProfile, setdriverProfile] = useState({});
  const [foodsellerProfile, setfoodsellerProfile] = useState({});
  const [fooduserProfile, setfooduserProfile] = useState({});
  const [grocerysellerProfile, setgrocerysellerProfile] = useState({});
  const [groceryuserProfile, setgroceryuserProfile] = useState({});
  const [shoppingsellerProfile, setshoppingsellerProfile] = useState({});
  const [shoppinguserProfile, setshoppinguserProfile] = useState({});
  const [foodcartdetail, setfoodcartdetail] = useState([]);
  const [grocerycartdetail, setgrocerycartdetail] = useState([]);
  const [shoppingcartdetail, setshoppingcartdetail] = useState([]);
  const [locationadd, setlocationadd] = useState('');
  const [latlong, setlatlong] = useState({});
  const [deliveryriderProfile, setdeliveryriderProfile] = useState('');
  const [shippingdata, setshippingdata] = useState('');
  const [language, setLanguage] = useState('en');

  const APP_ID = 'bbbe5e58-a216-4d80-ab22-09fc127aef1e';
  useEffect(() => {
    OneSignal.initialize(APP_ID);
    OneSignal.Notifications.requestPermission(true);
  }, [OneSignal]);

  useEffect(() => {
    SplashScreen.hide();
    setInitialRoute();
    checkLng();
    CustomCurrentLocation();
  }, []);
  useEffect(() => {
    {updateLogin?.phone&&getCombinedProfile(),getProfileStatus()}
  }, [updateLogin]);

  const setInitialRoute = async () => {
    const user = await AsyncStorage.getItem('userDetail');
    const userDetail = JSON.parse(user);
    console.log('userDetail', userDetail);
    console.log('userDetailid', userDetail?._id);
    if (userDetail?.phone) {
      setInitial('Options');
      setUser(userDetail);
      setUpdateLogin(userDetail);
    } else {
      setInitial('Auth');
    }
  };
  const CustomCurrentLocation = async () => {
    try {
      if (Platform.OS === 'ios') {
        request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE).then(result => {
          console.log(result);
          if (result === 'granted') {
            Geolocation.getCurrentPosition(
              position => {
                console.log(position);
                setlatlong({
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                });
                GetCurrentAddressByLatLong({
                  lat: position.coords.latitude,
                  long: position.coords.longitude,
                }).then(res => {
                  console.log('res===>', res);
                  setlocationadd(res.results[0].formatted_address);
                });
              },
              error => {
                console.log(error.code, error.message);
                //   return error;
              },
              {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
            );
          }
        });
      } else {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          Geolocation.getCurrentPosition(
            position => {
              console.log(position);
              setlatlong({
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                });
              GetCurrentAddressByLatLong({
                lat: position.coords.latitude,
                long: position.coords.longitude,
              }).then(res => {
                console.log('res===>', res);
                setlocationadd(res.results[0].formatted_address);
              });
            },
            error => {
              console.log(error.code, error.message);
              //   return error;
            },
            {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
          );
        } else {
          console.log('location permission denied');
        }
      }
    } catch (err) {
      console.log('location err =====>', err);
    }
  };
  useEffect(() => {
    if (toast) {
      Toast.show({
        type: 'success',
        text1: toast,
        position: 'top',
        visibilityTime: 2500,
        autoHide: true,
        onHide: () => {
          setToast('');
        },
      });
    }
  }, [toast]);
  const PUBLISH_KEY =
    'pk_test_51RKWdqKOvMMwEP0bOX2kKyDqX4f9XDFSfE2boU3tgDYrtWEdz4J9QfbAWQBs4tRwDYDPDrfV3KGCAi7aq661g0Vs00ozsbwIAT';
  // const PUBLISH_KEY='pk_live_51RKWdqKOvMMwEP0bPwvr5ht1uZsZHau6NGUU4mB2jsE1AADab8kmknFLfaY8sJWguQmWJboBXBRwCDUIefw99MR800HSHk5zX6'

  const checkLng = async () => {
    const x = await AsyncStorage.getItem('LANG');
    if (x != null) {
      i18n.changeLanguage(x);
      let lng2 = x == 'zh' ? 'zh-CN' : x;
      setLanguage(lng2);
    }
  };
  const getCombinedProfile = async () => {
    setLoading(true);
    try {
      const res = await GetApi('getCombinedProfile', {});
      setLoading(false);
      console.log('res', res);
      const profiles = res?.data || {};
      if (
        profiles?.DELIVERYRIDER?.status === 'VERIFIED' ||
        profiles?.RIDEDRIVER?.status === 'VERIFIED'
      ) {
        setstartupdateloc(true);
      }
    } catch (err) {
      setLoading(false)
      console.log(err);
    }
  };
  const getProfileStatus = async () => {
    setLoading(true);
    try {
      const res = await GetApi('getProfileStatus', {});
      setLoading(false);
      console.log('res', res);
      setProfileStatus(res?.data || {});

    } catch (err) {
      setLoading(false)
      console.log(err);
    }
  };
  useEffect(() => {
    console.log('enter=====?>')
    clearInterval(interval);
    let int;
    if (startupdateloc) {
      int = setInterval(() => {
        updateTrackLocation(int);
      }, 30000);
      setinter(int);
    } else {
      clearInterval(int);
    }
    return () => {
      clearInterval(int);
    };
  }, [startupdateloc]);

  const updateTrackLocation = (inter) => {
    CuurentLocation(res => {
      const data = {
        track: {
          type: 'Point',
          coordinates: [res.coords.longitude, res.coords.latitude],
        },

      };
      Post('driverupdatelocation', data,  ).then(
        async res => {
          // setLoading(false);
          // console.log(res)
          if (res.status) {
          } else {
            clearInterval(inter);
            console.log('stop')
          }
        },
        err => {
           clearInterval(inter);
          // setLoading(false);
          console.log(err);
        },
      );
    });
  };
  return (
    <StripeProvider
      publishableKey={PUBLISH_KEY}
      // urlScheme="your-url-scheme" // required for 3D Secure and bank redirects
      // merchantIdentifier="merchant.com.adnuser" // required for Apple pay
    >
      <Context.Provider value={[initial, setInitial]}>
      <ProfileStatusContext.Provider value={[profileStatus, setProfileStatus]}>
        <TranslatorContext.Provider value={[language, setLanguage]}>
          <ToastContext.Provider value={[toast, setToast]}>
            <LoadContext.Provider value={[loading, setLoading]}>
              <UserContext.Provider value={[user, setUser]}>
              <LocationUpdateContext.Provider value={[updateLogin, setUpdateLogin]}>
                <ProfileContext.Provider value={[profile, setProfile]}>
                  <DriverProfileContext.Provider
                    value={[driverProfile, setdriverProfile]}>
                    <DeliveryRiderContext.Provider
                      value={[deliveryriderProfile, setdeliveryriderProfile]}>
                      <FoodUserContext.Provider
                        value={[fooduserProfile, setfooduserProfile]}>
                      <ShippingDataContext.Provider
                        value={[shippingdata, setshippingdata]}>
                        <FoodSellerContext.Provider
                          value={[foodsellerProfile, setfoodsellerProfile]}>
                          <GroceryUserContext.Provider
                            value={[groceryuserProfile, setgroceryuserProfile]}>
                            <ShoppingUserContext.Provider
                              value={[
                                shoppinguserProfile,
                                setshoppinguserProfile,
                              ]}>
                              <ShoppingSellerContext.Provider
                                value={[
                                  shoppingsellerProfile,
                                  setshoppingsellerProfile,
                                ]}>
                                <GrocerySellerContext.Provider
                                  value={[
                                    grocerysellerProfile,
                                    setgrocerysellerProfile,
                                  ]}>
                                  <FoodCartContext.Provider
                                    value={[foodcartdetail, setfoodcartdetail]}>
                                    <GroceryCartContext.Provider
                                      value={[
                                        grocerycartdetail,
                                        setgrocerycartdetail,
                                      ]}>
                                      <ShoppingCartContext.Provider
                                        value={[
                                          shoppingcartdetail,
                                          setshoppingcartdetail,
                                        ]}>
                                        <AddressContext.Provider
                                          value={[locationadd, setlocationadd]}>
                                        <LocationDataContext.Provider
                                          value={[latlong, setlatlong]}>
                                          <SafeAreaView
                                            style={styles.container}>
                                            <Spinner
                                              color={'#fff'}
                                              visible={loading}
                                            />
                                            {/* <CustomToaster
                                    color={Constants.white}
                                    backgroundColor={Constants.dark_green}
                                    timeout={4000}
                                    toast={toast}
                                    setToast={setToast}
                                  /> */}
                                            <StatusBar
                                              barStyle="dark-content"
                                              backgroundColor={'white'}
                                            />
                                            {initial !== '' && (
                                              <Navigation initial={initial} />
                                            )}
                                            {/* <Navigation /> */}
                                            {/* <ToastManager /> */}
                                            <Toast />
                                          </SafeAreaView>
                                          </LocationDataContext.Provider>
                                        </AddressContext.Provider>
                                      </ShoppingCartContext.Provider>
                                    </GroceryCartContext.Provider>
                                  </FoodCartContext.Provider>
                                </GrocerySellerContext.Provider>
                              </ShoppingSellerContext.Provider>
                            </ShoppingUserContext.Provider>
                          </GroceryUserContext.Provider>
                        </FoodSellerContext.Provider>
                      </ShippingDataContext.Provider>
                      </FoodUserContext.Provider>
                    </DeliveryRiderContext.Provider>
                  </DriverProfileContext.Provider>
                </ProfileContext.Provider>
              </LocationUpdateContext.Provider>
              </UserContext.Provider>
            </LoadContext.Provider>
          </ToastContext.Provider>
        </TranslatorContext.Provider>
      </ProfileStatusContext.Provider>
      </Context.Provider>
    </StripeProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.white,
  },
});

export default App;
