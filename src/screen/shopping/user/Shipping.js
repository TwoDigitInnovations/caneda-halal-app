import {
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Dimensions,
  Modal,
  Platform,
  PermissionsAndroid,
  KeyboardAvoidingView,
} from 'react-native';
import React, {useContext, useEffect, useState} from 'react';
import Constants, {FONTS} from '../../../Assets/Helpers/constant';
import {goBack, navigate} from '../../../../navigationRef';
import {GetApi, Post} from '../../../Assets/Helpers/Service';
import {
  ShoppingUserContext,
  LoadContext,
  ToastContext,
  UserContext,
} from '../../../../App';
import LocationDropdown from '../../../Assets/Component/LocationDropdown';
import {
  request,
  PERMISSIONS,
  requestLocationAccuracy,
} from 'react-native-permissions';
import Geolocation from 'react-native-geolocation-service';
import GetCurrentAddressByLatLong from '../../../Assets/Component/GetCurrentAddressByLatLong';
import {BackIcon, LocationIcon} from '../../../../Theme';
import { useTranslation } from 'react-i18next';

const ShoppingShipping = () => {
  const { t } = useTranslation();
  const [user, setuser] = useContext(UserContext);
  const [shoppinguserProfile, setshoppinguserProfile] =useContext(ShoppingUserContext)
  const [from, setFrom] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [toast, setToast] = useContext(ToastContext);
  const [loading, setLoading] = useContext(LoadContext);
  const [location, setlocation] = useState();
  const [locationadd, setlocationadd] = useState('');
  const [addressdata, setaddressdata] = useState({
    username: '',
    address: '',
    house_no: '',
    pincode: '',
    phone: '',
    city: '',
    country: '',
  });
console.log('location',location)
  useEffect(() => {
    data();
  }, []);

  const data = () => {
    setLoading(true),
      GetApi(`getProfile/SHOPPINGUSER`, {}).then(
         res => {
          setLoading(false);
          console.log(res);
          if (res.status) {
            // setaddressdata(res.data);
            setaddressdata({
              username:
                res?.data?.shipping_address?.username ||
                user?.username ||
                '',
              address: res?.data?.shipping_address?.address || '',
              house_no: res?.data?.shipping_address?.house_no || '',
              pincode: res?.data?.shipping_address?.pincode || '',
              phone:
                res?.data?.shipping_address?.phone || user?.phone || '',
              city: res?.data?.shipping_address?.city || '',
              country: res?.data?.shipping_address?.country || '',
            });
            setlocation({
              latitude: res?.data?.shipping_address?.location?.coordinates[1],
              longitude: res?.data?.shipping_address?.location?.coordinates[0],
            })
            if (!res?.data?.shipping_address) {
              CustomCurrentLocation();
            }
          } else {
            // setToast(res.message);
          }
        },
        err => {
          setLoading(false);
          console.log(err);
        },
      );
  };
  console.log('addressdata', addressdata.address);
  // const sumdata =
  //   cartdetail && cartdetail.length > 0
  //     ? cartdetail.reduce((a, item) => {
  //         return phone(a) + phone(item?.price) * phone(item?.qty);
  //       }, 0)
  //     : null;
  // console.log(sumdata);

  const submit = () => {
    if (
      addressdata.username === '' ||
      addressdata.address === '' ||
      addressdata.house_no === '' ||
      // addressdata.pincode === '' ||
      addressdata.phone === '' ||
      addressdata.city === '' ||
      addressdata.country === ''
    ) {
      setSubmitted(true);
      return;
    }
    console.log('addressdata', addressdata);

    addressdata.location = {
      type: 'Point',
      coordinates: [location.longitude, location.latitude],
    };

    const userdata = {
      shipping_address: addressdata,
      userId: shoppinguserProfile?.user,
    };

    console.log('userdata', userdata);
    
    setLoading(true),
      Post('updateprofile/SHOPPINGUSER', userdata, {}).then(
        async res => {
          setLoading(false);
          console.log(res);

          if (res.status) {
            setshoppinguserProfile(res.data);
              goBack();
          } else {
            setToast(res?.message);
          }
        },
        err => {
          setLoading(false);
          console.log(err);
        },
      );
  };
  const getLocationVaue = (lat, add, set) => {
    console.log('lat=======>', lat);
    console.log('add=======>', add);
    setaddressdata({
      ...addressdata,
      address: add,
      lat: lat.lat,
      long: lat.lng,
    });
    setlocation({
      latitude: lat.lat,
      longitude: lat.lng,
    });
  };
  const CustomCurrentLocation = async () => {
    try {
      if (Platform.OS === 'ios') {
        request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE).then(result => {
          console.log(result);
          if (result === 'granted') {
            Geolocation.getCurrentPosition(
              position => {
                setlocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                // latitudeDelta: 0.05,
                // longitudeDelta: 0.05,
              });
              // setper(granted);
              GetCurrentAddressByLatLong({
                lat: position.coords.latitude,
                long: position.coords.longitude,
              }).then(res => {
                console.log('res===>', res);
                // setlocationadd(res.results[0].formatted_address);
                setaddressdata(prevstate => ({
                  ...prevstate,
                  address: res.results[0].formatted_address,
                  lat: JSON.stringify(position.coords.latitude),
                  long: JSON.stringify(position.coords.longitude),
                }));
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
              // setlocation(position);
              setlocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                // latitudeDelta: 0.05,
                // longitudeDelta: 0.05,
              });
              // setper(granted);
              GetCurrentAddressByLatLong({
                lat: position.coords.latitude,
                long: position.coords.longitude,
              }).then(res => {
                console.log('res===>', res);
                // setlocationadd(res.results[0].formatted_address);
                setaddressdata(prevstate => ({
                  ...prevstate,
                  address: res.results[0].formatted_address,
                  lat: JSON.stringify(position.coords.latitude),
                  long: JSON.stringify(position.coords.longitude),
                }));
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
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.toppart}>
      <BackIcon color={Constants.white} onPress={() => goBack()}/>
        <Text style={styles.carttxt}>{t("Shipping Address")}</Text>
      </View>
      <KeyboardAvoidingView 
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={{flex:1}}
            >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        style={{marginTop: 20, marginHorizontal: 20}}>
        {/* <Text style={styles.headtxt}>Shipping</Text> */}
        <Text style={styles.name}>{t("Name")}</Text>
        <View style={[styles.inpucov,{backgroundColor:submitted && addressdata?.username === ''?Constants.light_red:'#DAFFE8'}]}>
          <TextInput
            style={styles.inputfield}
            placeholder={t("Name")}
            placeholderTextColor={Constants.customgrey2}
            value={addressdata?.username}
            onChangeText={username =>
              setaddressdata({...addressdata, username})
            }></TextInput>
        </View>
        {submitted && addressdata.username === '' && (
          <Text style={styles.require}>{t("Name is required")}</Text>
        )}
        {/* <View style={styles.box2}> */}
            <Text style={styles.name}>{t("Address")}</Text>
          <View style={styles.box2}>
            {/* <TextInput
            style={styles.input}
            placeholder="Address"
            placeholderTextColor={Constants.customgrey2}
            value={addressdata?.address}
            onChangeText={address =>
              setaddressdata({...addressdata, address})
            }></TextInput> */}
            <LocationDropdown 
              value={addressdata?.address}
              focus={from === 'location'}
              setIsFocus={setFrom}
              from="location"
              getLocationVaue={(lat, add) => getLocationVaue(lat, add)}
            />
          </View>
          {/* <TouchableOpacity
            style={styles.locatcov}
            onPress={() =>
              navigate('MapAddress', {
                lat: location?.latitude,
                long: location?.longitude,
              })
            }>
            <LocationIcon />
          </TouchableOpacity> */}
        {/* </View> */}
        {submitted && addressdata.address === '' && (
          <Text style={styles.require}>{t("Address is required")}</Text>
        )}
          <Text style={styles.name}>{t("House /Building No")}</Text>
        <View style={[styles.inpucov,{backgroundColor:submitted && addressdata.username === ''?Constants.light_red:'#DAFFE8'}]}>
          <TextInput
            style={styles.inputfield}
            placeholder={t("House No /Building No / Streat Name")}
            placeholderTextColor={Constants.customgrey2}
            value={addressdata?.house_no}
            onChangeText={house_no =>
              setaddressdata({...addressdata, house_no})
            }></TextInput>
        </View>
        {submitted && addressdata.house_no === '' && (
          <Text style={styles.require}>{t("House /Building No is required")}</Text>
        )}
        <Text style={styles.name}>{t("Zip / Post Code")}</Text>
        <View style={[styles.inpucov,{backgroundColor:submitted && addressdata.username === ''?Constants.light_red:'#DAFFE8'}]}>
          <TextInput
            style={styles.inputfield}
            placeholder={t("Zip / Post Code")}
            // keyboardType="number-pad"
            placeholderTextColor={Constants.customgrey2}
            value={addressdata?.pincode}
            onChangeText={pincode =>
              setaddressdata({...addressdata, pincode})
            }></TextInput>
        </View>
        {/* {submitted && addressdata.pincode === '' && (
          <Text style={styles.require}>Zip/Post code is required</Text>
        )} */}
          <Text style={styles.name}>{t("Mobile Number")}</Text>
        <View style={[styles.inpucov,{backgroundColor:submitted && addressdata.username === ''?Constants.light_red:'#DAFFE8'}]}>
          <TextInput
            style={styles.inputfield}
            placeholder={t("Number")}
            keyboardType="number-pad"
            placeholderTextColor={Constants.customgrey2}
            value={addressdata?.phone}
            onChangeText={phone =>
              setaddressdata({...addressdata, phone})
            }></TextInput>
        </View>
        {submitted && addressdata.phone === '' && (
          <Text style={styles.require}>{t("Number is required")}</Text>
        )}
          <Text style={styles.name}>{t("City")}</Text>
        <View style={[styles.inpucov,{backgroundColor:submitted && addressdata.username === ''?Constants.light_red:'#DAFFE8'}]}>
          <TextInput
            style={styles.inputfield}
            placeholder={t("City")}
            placeholderTextColor={Constants.customgrey2}
            value={addressdata?.city}
            onChangeText={city =>
              setaddressdata({...addressdata, city})
            }></TextInput>
        </View>
        {submitted && addressdata.city === '' && (
          <Text style={styles.require}>{t("City is required")}</Text>
        )}
          <Text style={styles.name}>{t("Country")}</Text>
        <View style={[styles.inpucov,{backgroundColor:submitted && addressdata.username === ''?Constants.light_red:'#DAFFE8'}]}>
          <TextInput
            style={styles.inputfield}
            placeholder={t("Country")}
            placeholderTextColor={Constants.customgrey2}
            value={addressdata?.country}
            onChangeText={country =>
              setaddressdata({...addressdata, country})
            }></TextInput>
        </View>
        {submitted && addressdata.country === '' && (
          <Text style={styles.require}>{t("Country is required")}</Text>
        )}
        <TouchableOpacity style={styles.btn} onPress={() => submit()}>
          <Text style={styles.btntxt}>
            {/* {propdata?.type === 'checkout' ? 'Continue' : 'Update Address'} */}
            {t("Update Address")}
          </Text>
        </TouchableOpacity>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ShoppingShipping;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.white,
    // padding: 20,
  },
  toppart: {
    backgroundColor: Constants.normal_green,
    // paddingTop: 5,
    // paddingBottom: 20,
    flexDirection: 'row',
    // justifyContent: 'space-between',
    gap:10,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  carttxt: {
    color: Constants.white,
    fontSize: 16,
    fontFamily: FONTS.SemiBold,
    marginLeft: 10,
  },
  image: {
    height: 100,
    width: 100,
    position: 'absolute',
    opacity: 0.1,
    display: 'flex',
    alignSelf: 'center',
    top: Dimensions.get('screen').height / 2 - 50,
  },
  headtxt: {
    fontSize: 24,
    // fontWeight: '700',
    color: Constants.black,
    fontFamily: FONTS.Bold,
  },
  input: {
    // flex:1,
    borderBottomWidth: 2,
    borderColor: Constants.black,
    color: Constants.black,
    fontWeight: '500',
    //    backgroundColor:Constants.lightblue,
    paddingVertical: -10,
    //    height:100
  },
  name: {
    color: Constants.black,
    fontSize: 13,
    fontFamily: FONTS.Medium,
  },
  box: {
    marginVertical: 20,
  },
  box2: {
    backgroundColor:'#DAFFE8',
    marginVertical:10,
    borderRadius:15,
    height:50,
    paddingHorizontal:10,
  },
  btntxt: {
    fontSize: 20,
    color: Constants.white,
    // fontWeight:'700'
    fontFamily: FONTS.Medium,
  },
  btn: {
    height: 50,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 30,
    backgroundColor: Constants.normal_green,
    width: '100%',
    alignSelf: 'center',
    marginBottom: 40,
  },
  require: {
    color: Constants.red,
    fontFamily: FONTS.Medium,
    marginLeft: 10,
    fontSize: 14,
  },
  
  locatcov: {
    height: 30,
    width: 30,
    backgroundColor: Constants.normal_green,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    marginBottom: 10,
    borderRadius: 5,
  },

  inputfield:{
    color:Constants.black,
    fontSize:14,
    fontFamily:FONTS.Regular,
    flex:1
  },
  inpucov:{
    backgroundColor:Constants.customgrey,
    marginVertical:10,
    borderRadius:15,
    height:50,
    paddingHorizontal:10,
    flexDirection:'row'
  },
});
