import {
  Dimensions,
  Image,
  InteractionManager,
  Linking,
  Modal,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useContext, useEffect, useRef, useState} from 'react';
import Constants, {FONTS, Googlekey} from '../../../Assets/Helpers/constant';
import {
  CrossIcon,
  HomeIcon,
  MappinIcon,
  RightArrow,
  SearchIcon,
  ThikIcon,
} from '../../../../Theme';
import axios from 'axios';
import {fromAddress, setKey} from 'react-geocode';
import ActionSheet from 'react-native-actions-sheet';
import {BackIcon, Currentlocation} from '../../../../Theme';
import {goBack, navigate} from '../../../../navigationRef';
import GetCurrentAddressByLatLong from '../../../Assets/Component/GetCurrentAddressByLatLong';
import Geolocation from 'react-native-geolocation-service';
import {check, PERMISSIONS, request, RESULTS} from 'react-native-permissions';
import { LoadContext, ProfileContext, ToastContext, UserContext } from '../../../../App';
import { GetApi, Post } from '../../../Assets/Helpers/Service';
import { useTranslation } from 'react-i18next';

const HomeLocation = () => {
  const { t } = useTranslation();
  const [showList, setShowList] = useState(false);
  const [prediction, setPredictions] = useState([]);
  const [searchaddress, setsearchAddress] = useState('');
  const [location, setLocation] = useState({});
  const [profiledata, setprofiledata] = useState();
  const [toast, setToast] = useContext(ToastContext);
    const [loading, setLoading] = useContext(LoadContext);
    const [user, setUser] = useContext(UserContext);
    const [profile, setProfile] = useContext(ProfileContext);
  const openAppSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:'); // Opens app settings on iOS
    } else {
      Linking.openSettings(); // Opens app settings on Android
    }
  };
  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = () => {
    setLoading(true);
    GetApi(`getProfile/RIDEUSER`, {}).then(
      async res => {
        setLoading(false);
        console.log(res.data);
        setprofiledata(res.data);
      },
      err => {
        setLoading(false);
        console.log(err);
      },
    );
  };

  const CustomCurrentLocation = async () => {
    try {
      setLoading(true)
      if (Platform.OS === 'ios') {
        const permission = await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);

        if (permission === RESULTS.GRANTED) {
          Geolocation.getCurrentPosition(
            position => {
              setLoading(false)
              console.log(position);
                GetCurrentAddressByLatLong({
                lat: position.coords.latitude,
                long: position.coords.longitude,
              }).then(res => {
                setLoading(false)
                console.log('res===>', res);
                const [mainText, ...rest] = res.results[0].formatted_address.split(',');
                const secondaryText = rest.join(',').trim();
                const body= {
                  location: {
                    type: 'Point',
                    coordinates: [
                      position.coords.longitude,
                      position.coords.latitude,
                    ],
                  },
                  main_address: mainText,
                  secendary_address: secondaryText,
                }
                updateProfile(body)
              });
            },
            error => {
              console.log(error.code, error.message);
            },
            {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
          );
        } else if (permission === RESULTS.DENIED) {
          const result = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
          if (result === RESULTS.GRANTED) {
            Geolocation.getCurrentPosition(
              position => {
                setLoading(false)
                console.log(position);
                  GetCurrentAddressByLatLong({
                lat: position.coords.latitude,
                long: position.coords.longitude,
              }).then(res => {
                setLoading(false)
                console.log('res===>', res);
                const [mainText, ...rest] = res.results[0].formatted_address.split(',');
                const secondaryText = rest.join(',').trim();
                const body= {
                  location: {
                    type: 'Point',
                    coordinates: [
                      position.coords.longitude,
                      position.coords.latitude,
                    ],
                  },
                  main_address: mainText,
                  secendary_address: secondaryText,
                }
                updateProfile(body)
              });
              },
              error => {
                console.log(error.code, error.message);
              },
              {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
            );
          }
        } else if (permission === RESULTS.BLOCKED) {
          setLoading(false)
          Alert.alert(
            'Location Permission Required',
            'Location access is blocked. Please enable it in settings.',
            [
              {text: 'Cancel', style: 'cancel'},
              {text: 'Open Settings', onPress: openAppSettings},
            ],
          );
        }
      } else {
        const permission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );

        if (permission) {
          Geolocation.getCurrentPosition(
            position => {
              console.log(position);
              GetCurrentAddressByLatLong({
                lat: position.coords.latitude,
                long: position.coords.longitude,
              }).then(res => {
                setLoading(false)
                console.log('res===>', res);
                const [mainText, ...rest] = res.results[0].formatted_address.split(',');
                const secondaryText = rest.join(',').trim();
                const body= {
                  location: {
                    type: 'Point',
                    coordinates: [
                      position.coords.longitude,
                      position.coords.latitude,
                    ],
                  },
                  main_address: mainText,
                  secendary_address: secondaryText,
                }
                updateProfile(body)
              });
            },
            error => {
              console.log(error.code, error.message);
              setLoading(false)
            },
            {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
          );
        } else {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          );

          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            Geolocation.getCurrentPosition(
              position => {
                GetCurrentAddressByLatLong({
                  lat: position.coords.latitude,
                  long: position.coords.longitude,
                }).then(res => {
                  setLoading(false)
                  console.log('res===>', res);
                  const [mainText, ...rest] = res.results[0].formatted_address.split(',');
                  const secondaryText = rest.join(',').trim();
                  const body= {
                    location: {
                      type: 'Point',
                      coordinates: [
                        position.coords.longitude,
                        position.coords.latitude,
                      ],
                    },
                    main_address: mainText,
                    secendary_address: secondaryText,
                  }
                  updateProfile(body)
                });
              },
              error => {
                setLoading(false)
                console.log(error.code, error.message);
              },
              {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
            );
          } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
            setLoading(false)
            Alert.alert(
              'Location Permission Required',
              'Location access is blocked. Please enable it in settings.',
              [
                {text: 'Cancel', style: 'cancel'},
                {text: 'Open Settings', onPress: openAppSettings},
              ],
            );
          } else {
            setLoading(false)
            console.log('Location permission denied');
          }
        }
      }
    } catch (err) {
      setLoading(false)
      console.log('Location error:', err);
    }
  };

  const updateProfile = (body) => {
    setLoading(true);
    Post('updateProfile/RIDEUSER', {home_address:body}).then(
      async res => {
        setLoading(false);
        console.log(res);
       setToast('Address Updated Successfully')
       setprofiledata(res?.data)
       setProfile(res?.data)
       getProfile()
      },
      err => {
        setLoading(false);
        console.log(err);
      },
    );
  };

  const GOOGLE_PACES_API_BASE_URL =
    'https://maps.googleapis.com/maps/api/place';

  const GooglePlacesInput = async text => {
    if (!text) {
      setPredictions([]);
      return;
    }
    const apiUrl = `${GOOGLE_PACES_API_BASE_URL}/autocomplete/json?key=${Googlekey}&input=${text}`;
    //&components=country:ec
    try {
      const result = await axios.request({
        method: 'post',
        url: apiUrl,
      });
      if (result) {
        const {
          data: {predictions},
        } = result;
        console.log(result);
        setPredictions(predictions);
        setShowList(true);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const checkLocation = async (add,main,sec) => {
    console.log('add===>', add);
    try {
      setKey(Googlekey);
      if (add) {
        fromAddress(add).then(
          response => {
            console.log('response==>', response);
            const lat = response.results[0].geometry.location;
            setLocation(lat);
            const body= {
              location: {
                type: 'Point',
                coordinates: [
                  lat.lng,
                  lat.lat,
                ],
              },
              main_address: main,
              secendary_address: sec,
            }
            updateProfile(body)
          },
          error => {
            console.error(error);
          },
        );
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <SafeAreaView style={{flex:1}}>
      <View style={styles.container}>
      <BackIcon
        color={Constants.black}
        height={25}
        width={25}
        onPress={() => goBack()}
      />
      <View style={styles.inpucov}>
        <View style={styles.round}>
          <SearchIcon height={20} width={20} color={Constants.black}/>
        </View>
        <TextInput
          style={styles.inputfield}
          placeholder={t("Add Home Address")}
          placeholderTextColor={Constants.black}
          value={searchaddress}
          onChangeText={e => {
            setsearchAddress(e), GooglePlacesInput(e);
          }}></TextInput>
        {prediction && prediction.length > 0 && (
          <CrossIcon
            color={Constants.customgrey2}
            height={15}
            width={15}
            style={{alignSelf: 'center', marginRight: 5}}
            onPress={() => {
              setsearchAddress(''), GooglePlacesInput('');
            }}
          />
        )}
      </View>
      {profiledata?.home_address&&<View
        style={{
          flexDirection: 'row',
          gap: 15,
          alignItems: 'center',
          marginVertical: 10,
          width:'95%'
        }}>
        <HomeIcon height={30} width={30} />
        <View style={{width:'97%'}}>
          <Text style={styles.suggesttxt1}>{profiledata?.home_address?.main_address}</Text>
          <Text style={styles.suggesttxt2}>{profiledata?.home_address?.secendary_address}</Text>
        </View>
      </View>}

      {(!prediction || prediction.length <= 0) && (
        <TouchableOpacity
          style={styles.listcov}
          onPress={CustomCurrentLocation}>
          <Currentlocation color={Constants.dark_green} />
          <Text style={styles.txt}>{t("use Current location")}</Text>
          <RightArrow color={Constants.dark_green} height={15} width={15} />
        </TouchableOpacity>
      )}
      <View style={styles.horline}></View>
      <View style={{flex: 1}}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always">
          {prediction &&
            prediction.length > 0 &&
            prediction.map((item, index) => (
              <TouchableOpacity
                style={[
                  styles.listcov2,
                  {marginBottom: prediction.length === index + 1 ? 55 : 0},
                ]}
                key={index}
                onPress={() => {
                  checkLocation(item.description,item?.structured_formatting?.main_text,item?.structured_formatting?.secondary_text),
                    setsearchAddress(item.description),
                    GooglePlacesInput('');
                }}>
                <View
                  style={{flexDirection: 'row', gap: 10, alignItems: 'center'}}>
                  <MappinIcon height={30} width={30} />
                  <View>
                    <Text style={styles.suggesttxt1}>
                      {item?.structured_formatting?.main_text}
                    </Text>
                    {item?.structured_formatting?.secondary_text && (
                      <Text style={styles.suggesttxt2}>
                        {item?.structured_formatting?.secondary_text}
                      </Text>
                    )}
                  </View>
                </View>
                <ThikIcon
                  color={Constants.black}
                  height={20}
                  width={20}
                  style={{alignSelf: 'center'}}
                />
              </TouchableOpacity>
            ))}
        </ScrollView>
      </View>
      </View>
    </SafeAreaView>
  );
};

export default HomeLocation;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Constants.white,
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical:Platform.OS==='ios'?10: 20,
  },
  headtxt: {
    color: Constants.black,
    fontFamily: FONTS.Bold,
    fontSize: 28,
    marginVertical: 20,
  },
  inputfield: {
    color: Constants.black,
    fontSize: 16,
    fontFamily: FONTS.Medium,
    flex: 1,
    // lineHeight:20
    // backgroundColor:'red'
  },
  inpucov: {
    backgroundColor: Constants.customgrey4,
    marginVertical: 15,
    borderRadius: 15,
    height: 55,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  listcov: {
    flexDirection: 'row',
    marginBottom: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    paddingVertical: 15,
  },
  txt: {
    color: Constants.black,
    fontSize: 16,
    fontFamily: FONTS.Regular,
    flex: 1,
    marginHorizontal: 10,
  },
  horline: {
    height: 3,
    backgroundColor: Constants.customgrey4,
    width: '120%',
    marginLeft: -20,
  },
  suggesttxt1: {
    color: Constants.black,
    fontSize: 18,
    fontFamily: FONTS.SemiBold,
    // marginVertical: 5,
  },
  suggesttxt2: {
    color: Constants.customgrey2,
    fontSize: 16,
    fontFamily: FONTS.Medium,
  },
  listcov2: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 15,
    borderBottomWidth: 1,
    borderColor: Constants.customgrey2,
    paddingBottom: 15,
  },
  round: {
    height: 30,
    width: 30,
    backgroundColor: Constants.white,
    borderRadius: 30,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight:10
  },
});
