import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  Modal,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useContext, useEffect, useRef, useState} from 'react';
import Constants, {
  Currency,
  FONTS,
  Googlekey,
} from '../../../Assets/Helpers/constant';
import MapView, {
  Marker,
  Polygon,
  Polyline,
  PROVIDER_GOOGLE,
} from 'react-native-maps';
import {goBack, navigate} from '../../../../navigationRef';
import {GetApi, Post} from '../../../Assets/Helpers/Service';
import {LoadContext, ToastContext} from '../../../../App';
import {check, PERMISSIONS, request, RESULTS} from 'react-native-permissions';
import Geolocation from 'react-native-geolocation-service';
import MapViewDirections from 'react-native-maps-directions';
import LocationAutocomplete from '../../../Assets/Component/LocationAutocomplete';
import {
  BackIcon,
  CancelrideIcon,
  InfoIcon,
  LocationIcon,
  MenuIcon,
  PaymentIcon,
  RightArrow,
} from '../../../../Theme';
import GetCurrentAddressByLatLong from '../../../Assets/Component/GetCurrentAddressByLatLong';
import {mapStyle} from '../../../Assets/Helpers/mapStyle';
import moment from 'moment';
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import {useTranslation} from 'react-i18next';

const RideAction = props => {
  const {t} = useTranslation();
  const rideid = props?.route?.params?.rideid;
  const locationtpye = props?.route?.params?.type;
  const mapRef = useRef(null);
  const [showotp, setshowotp] = useState(false);
  const [toast, setToast] = useContext(ToastContext);
  const [loading, setLoading] = useContext(LoadContext);
  const [acceptmodel, setacceptmodel] = useState(false);
  const [location, setlocation] = useState();
  const [destination, setdestination] = useState();
  const [ridedetails, setridedetails] = useState();
  const ref = useBlurOnFulfill({value, cellCount: CELL_COUNT});
  const [value, setValue] = useState('');
  const [property, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });
  const CELL_COUNT = 4;

  useEffect(() => {
    CustomCurrentLocation();
    {
      rideid && getRidebyid(rideid);
    }
  }, []);

  const getRidebyid = id => {
    setLoading(true);
    GetApi(`getRidebyid/${id}`, {}).then(
      async res => {
        setLoading(false);
        console.log(res);
        setridedetails(res.data);
        if (locationtpye === 'src') {
          setdestination({
            latitude: res.data.src?.coordinates[1],
            longitude: res.data.src?.coordinates[0],
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          });
        } else {
          setdestination({
            latitude: res.data.dest?.coordinates[1],
            longitude: res.data.dest?.coordinates[0],
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          });
        }
      },
      err => {
        setLoading(false);
        console.log(err);
      },
    );
  };
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const animatedValue = new Animated.Value(0);
  useEffect(() => {
    if (routeCoordinates.length > 0) {
      animateRoute();
    }
  }, [routeCoordinates]);
  const animateRoute = () => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 5000,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  };

  const formatDate = date => {
    const today = moment().startOf('day');
    const tomorrow = moment().add(1, 'day').startOf('day');
    const inputDate = moment(date).startOf('day');

    if (inputDate.isSame(today, 'day')) {
      return t('Today');
    } else if (inputDate.isSame(tomorrow, 'day')) {
      return t('Tomorrow');
    } else {
      return moment(date).format('dddd, DD MMMM'); // Example: "Sat 24 Feb"
    }
  };
  function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours} h`;
    } else {
      return `${minutes}m`;
    }
  }

  const submit = () => {
    const body = {
      rideid: rideid,
      otp: Number(value),
    };
    setLoading(true);
    Post('startRide', body, {}).then(
      async res => {
        setLoading(false);
        if (res?.status) {
          console.log(res);
          getRidebyid(rideid);
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
  const finishride = () => {
    setLoading(true);
    GetApi(`completeRide/${rideid}`).then(
      async res => {
        setLoading(false);
        navigate('Drivertab');
        setToast(res?.message);
      },
      err => {
        setLoading(false);
        console.log(err);
      },
    );
  };

  const openAppSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:'); // Opens app settings on iOS
    } else {
      Linking.openSettings(); // Opens app settings on Android
    }
  };

  const CustomCurrentLocation = async () => {
    try {
      setLoading(true);
      if (Platform.OS === 'ios') {
        const permission = await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);

        if (permission === RESULTS.GRANTED) {
          Geolocation.getCurrentPosition(
            position => {
              setLoading(false);
              console.log(position);
              setlocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                latitudeDelta: 0.015,
                longitudeDelta: 0.0121,
              });
            },
            error => {
              setLoading(false);
              console.log(error.code, error.message);
            },
            {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
          );
        } else if (permission === RESULTS.DENIED) {
          const result = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
          if (result === RESULTS.GRANTED) {
            Geolocation.getCurrentPosition(
              position => {
                setLoading(false);
                console.log(position);
                setlocation({
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                  latitudeDelta: 0.015,
                  longitudeDelta: 0.0121,
                });
              },
              error => {
                setLoading(false);
                console.log(error.code, error.message);
              },
              {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
            );
          }
        } else if (permission === RESULTS.BLOCKED) {
          setLoading(false);
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
              setlocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                latitudeDelta: 0.015,
                longitudeDelta: 0.0121,
              });
            },
            error => {
              setLoading(false);
              console.log(error.code, error.message);
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
                setlocation({
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                  latitudeDelta: 0.015,
                  longitudeDelta: 0.0121,
                });
              },
              error => {
                setLoading(false);
                console.log(error.code, error.message);
              },
              {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
            );
          } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
            setLoading(false);
            Alert.alert(
              'Location Permission Required',
              'Location access is blocked. Please enable it in settings.',
              [
                {text: 'Cancel', style: 'cancel'},
                {text: 'Open Settings', onPress: openAppSettings},
              ],
            );
          } else {
            setLoading(false);
            console.log('Location permission denied');
          }
        }
      }
    } catch (err) {
      setLoading(false);
      console.log('Location error:', err);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={{height: '40%'}}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE} // remove if not using Google Maps
          style={styles.map}
          customMapStyle={mapStyle}
          //  initialRegion={{
          //    latitude: 37.78825,
          //    longitude: -122.4324,
          //    latitudeDelta: 0.015,
          //    longitudeDelta: 0.0121,
          //  }}
          // initialRegion={location}
          region={location}
          // region={{
          //      latitude: 22.469336569603133,
          //      longitude: 87.56172506021942,
          //      latitudeDelta: 0.015,
          //      longitudeDelta: 0.0121,
          //    }
          //   }
          showsUserLocation={true}>
          {destination && (
            <Marker
              coordinate={{
                latitude: destination?.latitude
                  ? Number(destination?.latitude)
                  : 0,
                longitude: destination?.longitude
                  ? Number(destination?.longitude)
                  : 0,
              }}
              pinColor="#de2c1f"
              // image={require('../../Assets/Images/Start.png')}
            />
          )}
          <Marker
            coordinate={{
              latitude: location?.latitude ? Number(location?.latitude) : 0,
              longitude: location?.longitude ? Number(location?.longitude) : 0,
            }}
            pinColor={'green'}
            // image={require('../../Assets/Images/start.png')}
          />

          {location && destination && (
            <MapViewDirections
              // waypoints={routeCoordinates.slice(0,25)}
              origin={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              destination={{
                latitude: destination.latitude,
                longitude: destination.longitude,
              }}
              onReady={result => {
                const edgePadding = {
                  top: 200,
                  right: 50,
                  bottom: 200,
                  left: 50,
                };
                console.log('result', result);
                mapRef.current.fitToCoordinates(result.coordinates, {
                  edgePadding,
                  animated: true,
                });
                //  mapRef.current.animateToRegion( result.coordinates, 1000)
                setRouteCoordinates(result.coordinates);
              }}
              apikey={Googlekey}
              strokeWidth={2}
              strokeColor="#4782F8"
              //  strokeColors={['#4782F8']}
              optimizeWaypoints={true}
            />
          )}
        </MapView>
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: 20,
            left: 20,
            height: 30,
            width: 30,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: Constants.white,
            borderRadius: 30,
            boxShadow: '0px 2px 5px 0.08px grey',
          }}
          onPress={() => {
            goBack();
          }}>
          <BackIcon color={Constants.black} />
        </TouchableOpacity>
      </View>
      <KeyboardAvoidingView 
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{flex:1}}
                  >
      <ScrollView style={styles.btmpart} showsVerticalScrollIndicator={false}>
        {ridedetails?.date && (
          <Text style={styles.datetxt}>{formatDate(ridedetails.date)}</Text>
        )}
        <View style={{flexDirection: 'row', gap: 10, marginHorizontal: 20}}>
          <View style={styles.row1cov}>
            <Text style={[styles.row1txt]}>
              {moment(ridedetails?.pickuptime).format('HH:mm')}
            </Text>
            <Text style={[styles.row1txtsmall]}>
              {formatDuration(ridedetails?.duration)}
            </Text>
            <Text style={[styles.row1txt]}>
              {moment(ridedetails?.pickuptime)
                .add(ridedetails?.duration, 'seconds')
                .format('HH:mm')}
            </Text>
          </View>
          <View style={{alignItems: 'center', paddingBottom: 10}}>
            <View style={[styles.round]}></View>
            <View style={styles.verticleline}></View>

            <View style={[styles.round]}></View>
          </View>
          <View style={{justifyContent: 'space-between', flex: 1}}>
            <Text style={[styles.row1txt]} numberOfLines={2}>
              {ridedetails?.source}
            </Text>
            <Text
              style={[styles.row1txt, {marginVertical: 10}]}
              numberOfLines={2}>
              {ridedetails?.destination}
            </Text>
          </View>
        </View>
        <View style={styles.horline}></View>
        <View style={styles.pricecov}>
          <Text style={styles.passengertxt}>{t('Amount')}</Text>

          <Text style={styles.passengertxt}>
            {ridedetails?.ride_mode === 'pool'
              ? t('Pool Ride')
              : `${Currency}${
                  ridedetails?.final_price
                    ? ridedetails?.final_price
                    : ridedetails?.price
                }`}
          </Text>
        </View>
        <View style={styles.horline}></View>

        {ridedetails?.status === 'pending' && showotp && (
          <CodeField
            ref={ref}
            {...property}
            value={value}
            onChangeText={setValue}
            cellCount={CELL_COUNT}
            rootStyle={styles.codeFieldRoot2}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            // onEndEditing={() => Keyboard.dismiss()} // Dismiss keyboard when OTP is entered
            onSubmitEditing={() => Keyboard.dismiss()}
            renderCell={({index, symbol, isFocused}) => (
              <Text
                key={index}
                style={[styles.cell, isFocused && styles.focusCell]}
                onLayout={getCellOnLayoutHandler(index)}>
                {symbol ||
                  (isFocused ? (
                    <Cursor />
                  ) : (
                    <Text style={{color: Constants.white}}>_</Text>
                  ))}
              </Text>
            )}
          />
        )}
        {location && destination && (
          <TouchableOpacity
            style={styles.contactopt}
            onPress={() => {
              let origin = `${location.latitude},${location.longitude}`;
              let destination2 = `${destination?.latitude},${destination?.longitude}`;
              const waypoints = ridedetails?.stops?.length
                ? ridedetails?.stops
                    .map(
                      s =>
                        `${s.location.coordinates[1]},${s.location.coordinates[0]}`,
                    )
                    .join('|')
                : null;
              Linking.openURL(
                `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination2}${
                  waypoints ? `&waypoints=${waypoints}` : ''
                }&travelmode=driving`,
              );
            }}>
            <LocationIcon color={Constants.dark_green} height={20} width={20} />
            <Text style={styles.othrttxt2}>Go to google map</Text>
          </TouchableOpacity>
        )}
        {ridedetails?.status === 'pending' && showotp && (
          <TouchableOpacity style={styles.signInbtn2} onPress={() => submit()}>
            <Text style={styles.buttontxt}>{t('Verify Pin')}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
      </KeyboardAvoidingView>
      {ridedetails?.status === 'pending' && !showotp && (
        <TouchableOpacity
          style={styles.signInbtn}
          onPress={() => setshowotp(true)}>
          <Text style={styles.buttontxt}>{t('Start Ride')}</Text>
        </TouchableOpacity>
      )}
      {ridedetails?.status === 'started' && (
        <TouchableOpacity
          style={styles.signInbtn}
          onPress={() => setacceptmodel(true)}>
          <Text style={styles.buttontxt}>{t('Finish Ride')}</Text>
        </TouchableOpacity>
      )}
      <Modal
        animationType="none"
        transparent={true}
        visible={acceptmodel}
        onRequestClose={() => {
          // Alert.alert('Modal has been closed.');
          setacceptmodel(!acceptmodel);
        }}>
        <View style={styles.centeredView2}>
          <View style={styles.modalView2}>
            <Text style={styles.alrt}>{t('Alert !')}</Text>
            <View
              style={{
                backgroundColor: 'white',
                alignItems: 'center',
                paddingHorizontal: 30,
              }}>
              <Text style={styles.textStyle}>
                {t('Are you sure you want to finish this ride !')}
              </Text>
              <View
                style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
                <InfoIcon color={Constants.red} />
                <Text style={styles.textStyle2}>{t('Reminder')}</Text>
              </View>
              <Text style={styles.textStyle3}>
                {ridedetails?.payment_mode === 'online'
                  ? t(
                      'Please check if the fare amount has been credited to your wallet.',
                    )
                  : t('Please collect cash from the passenger.')}
              </Text>
              <View style={styles.cancelAndLogoutButtonWrapStyle}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => setacceptmodel(!acceptmodel)}
                  style={styles.cancelButtonStyle}>
                  <Text
                    style={[
                      styles.modalText,
                      {color: Constants.custom_yellow},
                    ]}>
                    {t('No')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.9}
                  style={styles.logOutButtonStyle}
                  onPress={() => {
                    finishride(), setacceptmodel(false);
                  }}>
                  <Text style={styles.modalText}>{t('Yes')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default RideAction;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.white,
  },
  map: {
    flex: 1,
  },
  btmpart: {
    backgroundColor: Constants.custom_black,
    //   paddingHorizontal: 20,
    paddingVertical: 10,
  },
  datetxt: {
    fontSize: 24,
    color: Constants.black,
    fontFamily: FONTS.SemiBold,
    marginBottom: 10,
    marginHorizontal: 20,
  },
  passengertxt: {
    fontSize: 16,
    color: Constants.black,
    fontFamily: FONTS.SemiBold,
    textAlign: 'right',
    marginRight: 20,
  },
  round: {
    height: 15,
    width: 15,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: Constants.dark_green,
  },
  row1txt: {
    fontSize: 14,
    color: Constants.black,
    fontFamily: FONTS.SemiBold,
    // lineHeight: 14,
  },
  row1txtsmall: {
    fontSize: 12,
    color: Constants.customgrey,
    fontFamily: FONTS.Regular,
    // lineHeight: 14,
  },
  row1cov: {
    justifyContent: 'space-between',
    paddingBottom: 10,
  },
  verticleline: {
    width: 3,
    backgroundColor: Constants.dark_green,
    // minHeight: 28,
    flex: 1,
  },
  horline: {
    height: 5,
    backgroundColor: Constants.dark_green,
    // width: '120%',
    // marginLeft: -20,
    marginVertical: 15,
  },
  buttontxt: {
    color: Constants.white,
    fontSize: 18,
    fontFamily: FONTS.Medium,
  },
  signInbtn: {
    height: 50,
    width: '90%',
    alignSelf: 'center',
    borderRadius: 10,
    backgroundColor: Constants.dark_green,
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    position: 'absolute',
    bottom: 20,
  },
  signInbtn2: {
    height: 50,
    width: '90%',
    alignSelf: 'center',
    borderRadius: 10,
    backgroundColor: Constants.dark_green,
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  pricecov: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  ///////////code field//////////
  codeFieldRoot2: {
    width: Dimensions.get('window').width - 40,
    marginBottom: 20,
    alignSelf: 'center',
  },
  cell: {
    width: 60,
    height: 60,
    lineHeight: 68,
    fontSize: 30,
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 20,
    color: Constants.dark_green,
    borderColor: Constants.customgrey,
    borderWidth: 1,
    fontFamily: FONTS.SemiBold,
  },
  focusCell: {
    borderColor: Constants.dark_green,
  },
  /////end here///////////

  //////Model////////
  textStyle: {
    color: Constants.black,
    // fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: FONTS.Medium,
    fontSize: 16,
    margin: 20,
    marginBottom: 10,
  },
  textStyle2: {
    color: Constants.red,
    // fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: FONTS.Medium,
    fontSize: 16,
    // margin: 20,
    // marginBottom: 10,
  },
  textStyle3: {
    color: Constants.red,
    textAlign: 'center',
    fontFamily: FONTS.Medium,
    fontSize: 14,
    marginBottom: 10,
  },
  cancelAndLogoutButtonWrapStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 3,
  },
  alrt: {
    color: Constants.black,
    fontSize: 18,
    fontFamily: FONTS.Bold,
    // backgroundColor: 'red',
    width: '100%',
    textAlign: 'center',
    borderBottomWidth: 1.5,
    borderBottomColor: Constants.customgrey2,
    paddingBottom: 20,
  },
  modalText: {
    color: Constants.white,
    // fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: FONTS.Medium,
    fontSize: 14,
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
  cancelButtonStyle: {
    flex: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    marginRight: 10,
    borderColor: Constants.dark_green,
    borderWidth: 1,
    borderRadius: 10,
  },
  logOutButtonStyle: {
    flex: 0.5,
    backgroundColor: Constants.dark_green,
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  othrttxt2: {
    color: Constants.dark_green,
    fontSize: 16,
    fontFamily: FONTS.SemiBold,
  },
  contactopt: {
    borderWidth: 1,
    borderColor: Constants.dark_green,
    borderRadius: 40,
    flexDirection: 'row',
    height: 50,
    width: '65%',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 15,
  },
});
