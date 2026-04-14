import {
  Animated,
  Easing,
  FlatList,
  Image,
  ImageBackground,
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
import {PERMISSIONS, request} from 'react-native-permissions';
import Geolocation from '@react-native-community/geolocation';
import MapViewDirections from 'react-native-maps-directions';
import LocationAutocomplete from '../../../Assets/Component/LocationAutocomplete';
import {
  CancelrideIcon,
  Car5Icon,
  CrossIcon,
  InvoiceIcon,
  LocationIcon,
  MenuIcon,
  PaymentIcon,
  RightArrow,
  StarIcon,
  VerifiedIcon,
} from '../../../../Theme';
import GetCurrentAddressByLatLong from '../../../Assets/Component/GetCurrentAddressByLatLong';
import axios from 'axios';
import {useIsFocused} from '@react-navigation/native';
import {CardField, useStripe, CardForm} from '@stripe/stripe-react-native';
import LottieView from 'lottie-react-native';
import {useTranslation} from 'react-i18next';
import RNBlobUtil from 'react-native-blob-util';
import AsyncStorage from '@react-native-async-storage/async-storage';
import StarRating, { StarRatingDisplay } from 'react-native-star-rating-widget';
import LinearGradient from 'react-native-linear-gradient';
import moment from 'moment';
import { mapStyle } from '../../../Assets/Helpers/mapStyle';

const RideDetail = props => {
  const {ride_id} = props?.route?.params;
  const data = props?.route?.params;
  console.log(props?.route);
  const {t} = useTranslation();
  const {initPaymentSheet, presentPaymentSheet, confirmPayment} = useStripe();
  const mapRef = useRef(null);
  const [shops, setshops] = useState([]);
  const [locationshow, setlocationshow] = useState(false);
  const [destinationshow, setdestinationshow] = useState(false);
  const [duration, setduration] = useState(null);
  const [toast, setToast] = useContext(ToastContext);
  const [loading, setLoading] = useContext(LoadContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalVisible3, setModalVisible3] = useState(false);
  const [modalVisible2, setModalVisible2] = useState(false);
  const [modalVisible4, setModalVisible4] = useState(false);
  const [review, setreview] = useState('');
  const [rating, setrating] = useState('');
  const [alreadyrated, setalreadyrated] = useState(false);
  const [locationadd, setlocationadd] = useState(
    props?.route?.params?.data?.locationadd,
  );
  const [destinationadd, setdestinationadd] = useState(
    props?.route?.params?.data?.destinationadd,
  );
  const [selectvehicle, setselectvehicle] = useState(0);
  const [location, setlocation] = useState(
    props?.route?.params?.data?.location,
  );
  const [destination, setdestination] = useState(
    props?.route?.params?.data?.destination,
  );
const [bearing, setBearing] = useState(null);
const prevCoordsRef = useRef(null);
const distancecaled = useRef(false);
  const [ride, setRide] = useState({});

  useEffect(() => {
    CustomCurrentLocation();
  }, []);

  const IsFocused = useIsFocused();
  const [intervalId, setIntervalId] = useState(null);

  const [assignmodel, setassignmodel] = useState(false);
const [donation, setdonation] = useState(null);
  const [seldonation, setseldonation] = useState('');
  const inputRef = useRef(null);
  useEffect(() => {
    if (seldonation === 'Other') {
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 200);
    }
  }, [donation, seldonation]);
  // Get ride when component is focused or ride_id changes
  useEffect(() => {
    if (IsFocused) {
      getpostedRide();
      getridereview()
    } else {
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
    }
  }, [IsFocused, ride_id]);

  // Polling Effect: Run when ride changes or screen is focused
  useEffect(() => {
    // if (!ride?.driver_id && IsFocused) {
    if ( IsFocused) {
      const id = setInterval(() => {
        getpostedRide2();
      }, 10000);
      setIntervalId(id);
      return () => clearInterval(id);
    } else {
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
    }
  }, [ IsFocused]);

  const getpostedRide = async () => {
    setLoading(true);
    try {
      const res = await GetApi(`getRidebyid/${ride_id}`, '');
      if (res?.status) {
        console.log(res?.data);
        setRide(res.data);
        if (res?.data?.driver_profile?.location&&res?.data?.status==='pending') {
          calculateDistance(res.data);
        }
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const getpostedRide2 = async () => {
    try {
      const res = await GetApi(`getRidebyid/${ride_id}`, '');
      if (res?.status) {
        console.log('Polling ride', res);
        if (res?.data?.driver_profile?.current_location?.coordinates?.length>0) {
          const newLat = res.data.driver_profile.current_location.coordinates[1];
        const newLng = res.data.driver_profile.current_location.coordinates[0];

          if (prevCoordsRef.current) {
          const oldLat = prevCoordsRef.current[1];
          const oldLng = prevCoordsRef.current[0];

          const bear = getBearing(oldLat, oldLng, newLat, newLng);
          setBearing(bear);
          console.log("bear", bear);
        }
        // update ref for next cycle
        prevCoordsRef.current = res.data.driver_profile.current_location.coordinates;
      }
        setRide(res.data);
        if (res?.data?.driver_profile?.location&&res?.data?.status==='pending'&&!distancecaled?.current) {
          distancecaled.current=true
          calculateDistance(res.data);
        }
      } else {
        // Stop interval if something goes wrong
        if (intervalId) {
          clearInterval(intervalId);
          setIntervalId(null);
        }
      }
    } catch (err) {
      console.log(err);
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
    }
  };
const stopwaypoint = ride?.stops
  ?.filter(item => Array.isArray(item?.location?.coordinates) && item?.location?.coordinates.length === 2)
  ?.map(item => ({
    latitude: item.location.coordinates[1], // [lng, lat] → lat
    longitude: item.location.coordinates[0], // [lng, lat] → lng
  }));

  const cancelRide = async () => {
    GetApi(`cancelRide/${ride_id}`, '').then(
      async res => {
        console.log(res);
        if (res?.status) {
          goBack();
        }
      },
      err => {
        setLoading(false);
        console.log(err);
      },
    );
  };

  const calculateDistance = async ridedata => {
    const origin = `${ridedata?.src?.coordinates[1]},${ridedata?.src?.coordinates[0]}`;
    const destination2 = `${ridedata?.driver_profile?.current_location?.coordinates?.[1]??ridedata?.driver_profile?.location?.coordinates?.[1]},${ridedata?.driver_profile?.current_location?.coordinates?.[0]??ridedata?.driver_profile?.location?.coordinates?.[0]}`;

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination2}&key=${Googlekey}`;
    console.log('url', url);

    try {
      const response = await axios.get(url);
      const result = response.data;
      console.log(response);
      const seconds = result.rows[0].elements[0].duration?.value;
      const minutes = Math.round(seconds / 60);

      let timeText = '';

      if (!seconds) {
        timeText = t('Distance not found');
      } else {
        const minutes = Math.round(seconds / 60);

        if (minutes < 1) {
          timeText = t('Arriving shortly');
        } else if (minutes < 60) {
          timeText = t('arrivingMinutes', { count: minutes });
        } else {
          const hrs = Math.floor(minutes / 60);
          const mins = minutes % 60;
    if (mins > 0) {
      timeText = t('arrivingHoursMinutes', { hours: hrs, minutes: mins });
    } else {
      timeText = t('arrivingHours', { count: hrs });
    }
        }
      }

      console.log(timeText);
      setduration(timeText);
    } catch (error) {
      console.error('Error fetching data: ', error);
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
                // setlocation(position);
              },
              error => {
                console.log(error.code, error.message);
                //   return error;
              },
              {enableHighAccuracy: false, timeout: 30000, maximumAge: 60000},
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
              // setlocation({
              //   latitude: position.coords.latitude,
              //   longitude: position.coords.longitude,
              //   latitudeDelta: 0.05,
              //   longitudeDelta: 0.05,
              // });
            },
            error => {
              console.log(error.code, error.message);
              //   return error;
            },
            {enableHighAccuracy: false, timeout: 30000, maximumAge: 60000},
          );
        } else {
          console.log('location permission denied');
        }
      }
    } catch (err) {
      console.log('location err =====>', err);
    }
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
  const handleplayment = () => {
    const total = Math.round(ride?.final_price+(Number(donation) > 0 ? Number(donation) : 0));
    console.log('total', total);
    setLoading(true);
    Post(
      'poststripe',
      {price: Number(total), currency: 'cad', version: 1},
      {},
    ).then(
      async res => {
        console.log(res);
        setLoading(false);
        const {error} = await initPaymentSheet({
          merchantDisplayName: 'CHMP',
          // customerId: res.customer,
          // customerEphemeralKeySecret: res.ephemeralKey,
          paymentIntentClientSecret: res.clientSecret,
          allowsDelayedPaymentMethods: true,
        });
        if (error) {
          console.log(error);
          return;
        }

        const {error: paymentError} = await presentPaymentSheet();

        if (paymentError) {
          console.log(`Error code: ${paymentError.code}`, paymentError.message);
          setModalVisible3(true);
          return;
        } else {
          UpdatePayment(res.clientSecret);
          rating!==''&&addreview();
          console.log('res', res);
        }
      },
      err => {
        setLoading(false);
        console.log(err);
      },
    );
  };
  const UpdatePayment = paymentid => {
    const body = {
      paymentid: paymentid,
      id: ride?._id,
    };
    if (Number(donation) > 0) {
      body.delivery_tip=Number(donation)
    }
    console.log('body', body);
    setLoading(true);
    Post(`updatePayment`, body).then(
      async res => {
        setLoading(false);
        console.log(res);
        if (res?.status) {
          getpostedRide();
        }
        setModalVisible2(true);
      },
      err => {
        setLoading(false);
        console.log(err);
      },
    );
  };

  const getinvoice = async () => {
    setLoading(true);
const x = await AsyncStorage.getItem('LANG');
    const { DownloadDir, DocumentDir } = RNBlobUtil.fs.dirs;
  const filePath = `${
    Platform.OS === 'android' ? DownloadDir : DocumentDir
  }/invoice-${Date.now()}.pdf`;

  try {
    const res = await RNBlobUtil.config({
      fileCache: true,
      path: filePath,
      addAndroidDownloads: {
        useDownloadManager: true,
        notification: true,
        path: filePath,
        title: 'Invoice',
        description: 'Downloading invoice...',
        mime: 'application/pdf',
        mediaScannable: true,
      },
      }).fetch(
        'GET',
        `https://api.chmp.world/v1/api/generateRideInvoice?rideId=${ride_id}&lang=${x}`,
      );

      setLoading(false);
      setToast("Invoice downloaded successfully")
      console.log('Invoice downloaded:', res.path());
      
    } catch (error) {
      setLoading(false);
      console.error('Error downloading invoice:', error);
    }
  };
  const addreview = () => {
    let url = `adddriverreview`;
    const data = {
      ride: ride_id,
      rating: rating,
      comment: review,
      driverId: ride?.driver_id,
      userId: ride?.user,
      userProfile: ride?.user_profile,
      driverProfile: ride?.driver_profile,
    };
    console.log('data', data)
    setLoading(true);
    Post(url, data).then(
      async res => {
        setLoading(false);
        console.log(res);
        setModalVisible4(false);
        getridereview()
      },
      err => {
        setLoading(false);
        console.log(err);
      },
    );
  };
  const getridereview = async () => {
    GetApi(`getridereview/${ride_id}`, '').then(
      async res => {
        console.log(res);
        if (res?.status) {
          if (res?.data?.rating) {
            setalreadyrated(true);
            setrating(res?.data?.rating);
            setreview(res?.data?.comment);  
          }
        }
      },
      err => {
        setLoading(false);
        console.log(err);
      },
    );
  };
  const PackageIcon = () => {
    return (
      <View style={{ height: 40, width: 40,alignItems: "center", justifyContent: "center" }}>
        <Image source={require("../../../Assets/Images/car6.png")} style={{height:'100%',width:'100%',}} resizeMode='contain'/>
      </View>
    );
  };
  const getBearing = (startLat, startLng, endLat, endLng) => {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const toDeg = (rad) => (rad * 180) / Math.PI;

  const dLon = toRad(endLng - startLng);

  const y = Math.sin(dLon) * Math.cos(toRad(endLat));
  const x =
    Math.cos(toRad(startLat)) * Math.sin(toRad(endLat)) -
    Math.sin(toRad(startLat)) *
      Math.cos(toRad(endLat)) *
      Math.cos(dLon);

  let brng = toDeg(Math.atan2(y, x));
  return (brng + 360) % 360; // normalize 0–360
};
  console.log("driver loc",ride?.driver_profile?.current_location?.coordinates)
  return (
    <SafeAreaView style={styles.container}>
      <View style={{height: '50%'}}>
        {ride?.src?.coordinates.length > 0 && (
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
            region={{
              latitude: ride?.dest?.coordinates[1],
              longitude: ride?.dest?.coordinates[0],
              latitudeDelta: 0.015,
              longitudeDelta: 0.0121,
            }}
            // region={{
            //      latitude: 22.469336569603133,
            //      longitude: 87.56172506021942,
            //      latitudeDelta: 0.015,
            //      longitudeDelta: 0.0121,
            //    }
            //   }
            showsUserLocation={true}>
            {ride?.dest?.coordinates.length > 0 && (
              <Marker
                // coordinate={location}
                // ref={mapRef}
                // draggable={true}
                onDragEnd={e => {
                  setdestination({
                    latitude: e.nativeEvent.coordinate.latitude,
                    longitude: e.nativeEvent.coordinate.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                    // locationadd: add,
                  });
                  GetCurrentAddressByLatLong({
                    lat: e.nativeEvent.coordinate.latitude,
                    long: e.nativeEvent.coordinate.longitude,
                  }).then(res => {
                    console.log('res===>', res);
                    setdestinationadd(res.results[0].formatted_address);
                  });
                }}
                coordinate={{
                  latitude: ride?.dest?.coordinates[1],
                  longitude: ride?.dest?.coordinates[0],
                }}
                pinColor="#de2c1f"
                // image={require('../../Assets/Images/Start.png')}
                anchor={{ x: 0.5, y: 0.5 }}
              >
                <View style={styles.customMarker}>
            <View style={styles.innerCircle} />
          </View>
                </Marker>
            )}
            {ride?.src?.coordinates.length > 0 && (
              <Marker
                // coordinate={location}
                // ref={mapRef}
                // draggable={true}
                onDragEnd={e => {
                  setlocation({
                    latitude: e.nativeEvent.coordinate.latitude,
                    longitude: e.nativeEvent.coordinate.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                    // locationadd: add,
                  });
                  GetCurrentAddressByLatLong({
                    lat: e.nativeEvent.coordinate.latitude,
                    long: e.nativeEvent.coordinate.longitude,
                  }).then(res => {
                    console.log('res===>', res);
                    setlocationadd(res.results[0].formatted_address);
                  });
                }}
                coordinate={{
                  latitude: ride?.src?.coordinates[1],
                  longitude: ride?.src?.coordinates[0],
                }}
                pinColor={'green'}
                // image={require('../../Assets/Images/start.png')}
                anchor={{ x: 0.5, y: 0.5 }}
              >
                <View style={styles.customMarker}>
            <View style={styles.innerCircle} />
          </View>
              </Marker>
            )}
 {ride?.driver_profile?.current_location?.coordinates?.length>0 && (
              <Marker
                zIndex={8}
                draggable={false}
                coordinate={{
                  latitude: ride?.driver_profile?.current_location?.coordinates[1],
                  longitude: ride?.driver_profile?.current_location?.coordinates[0],
                }}
                anchor={{ x: 0.5, y: 0.5 }}
                flat={true} // makes rotation work properly
                rotation={bearing} // 👈 pass calculated angle here
              >
                <PackageIcon />
              </Marker>
            )}
            {stopwaypoint?.length > 0 && stopwaypoint.map((item,index)=>(
                          <Marker
                            coordinate={item}
                            anchor={{ x: 0.5, y: 0.5 }}
                            key={index}
                          >
                            <View style={styles.customMarker}>
                               <View style={styles.innerCircle} />
                             </View>
                          </Marker>
                        ))}
            {ride?.src && ride?.dest && (
              <MapViewDirections
                // waypoints={routeCoordinates.slice(0,25)}
                origin={{
                  latitude: ride?.src?.coordinates[1],
                  longitude: ride?.src?.coordinates[0],
                }}
                destination={{
                  latitude: ride?.dest?.coordinates[1],
                  longitude: ride?.dest?.coordinates[0],
                }}
                waypoints={stopwaypoint?.length > 0 ? stopwaypoint : []}
                onReady={result => {
                  const edgePadding = {
                    top: 50,
                    right: 50,
                    bottom: 50,
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
                strokeWidth={4}
                strokeColor="#00bfff"
                //  strokeColors={['#4782F8']}
                optimizeWaypoints={true}
              />
            )}
          </MapView>
        )}
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: 20,
            left: 20,
            borderRadius: 30,
            boxShadow: '0px 2px 5px 0.08px grey',
          }}
          onPress={() => props.navigation.openDrawer()}>
          <MenuIcon />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.btmpart} showsVerticalScrollIndicator={false}>
        {ride?.driver_id && (
          <View>
           {ride?.status==='pending'&& <View>
            <Text
              style={styles.timimgtxt}
              >
              {duration}
            </Text>
            <View style={styles.vehiclecov}>
              <Text style={styles.carname}>
                {ride?.driver_profile?.vehicle_company}{' '}
                {ride?.driver_profile?.vehicle_model}{' '}
                {ride?.driver_profile?.vehicle_colour}
              </Text>
              {/* {ride?.status==='complete'?<Text style={styles.comtxt}>{t("Completed")}</Text>:<View style={{flexDirection: 'row'}}> */}
              <View style={{flexDirection: 'row'}}>
                <Text style={styles.carname}>{t('Pin')} : </Text>
                <Text style={styles.pincov}>{ride?.otp} </Text>
              </View>
            </View>
            <View style={styles.horline3}></View>
            </View>}
            <View style={[styles.procov]}>
              <View
                style={{flexDirection: 'row', gap: 5, alignItems: 'center'}}>
                <View>
                  {/* <View style={styles.carcov}> */}
                    <Image
                      source={{uri: ride?.driver_profile?.vehicle_image?`${ride?.driver_profile?.vehicle_image}`:`${ride?.vehicle_type?.vehicleimg}`}}
                      style={styles.proimg2}
                      resizeMode="stretch"
                    />
                  {/* </View> */}
                  <View
                    style={[styles.proimg3, {position: 'absolute', top: 15}]}>
                    {ride?.driver_profile?.image && (
                      <Image
                        source={
                          // require('../../../Assets/Images/profile3.png')

                          {
                            uri: `${ride?.driver_profile?.image}`,
                          }
                        }
                        style={styles.proimg}
                      />
                    )}
                    {ride?.driver_profile?.status === 'VERIFIED' &&
                      ride?.driver_profile?.image && (
                        <View style={{position: 'absolute', right: 0}}>
                          <VerifiedIcon />
                        </View>
                      )}
                  </View>
                </View>
                <View style={styles.vehiclenumcov}>
                  <Text style={styles.vehiclenum}>
                    {ride?.driver_profile?.number_plate_no}
                  </Text>
                </View>

                <View>
                  <Text style={styles.nametxt}>
                    {ride?.driver_profile?.username}
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      gap: 5,
                      alignItems: 'center',
                    }}>
                    <Text style={styles.protxt2}>
                      {ride?.driver_profile?.vehicle_company}{' '}
                      {ride?.driver_profile?.vehicle_model}
                    </Text>
                    {/* <VerifiedIcon /> */}
                  </View>
                </View>
              </View>
              <View>
                <Text
                  style={[styles.pincov, {borderRadius: 5}]}
                  onPress={() =>{
                   ride?.status!='complete'&& Linking.openURL(`tel:${ride?.driver_profile?.phone}`)
                  }}>
                  {ride?.status==='complete'?t("Completed"):t('Contact')}{' '}
                </Text>
              </View>
            </View>
            <View style={styles.horline3}></View>
          </View>
        )}
        {!ride?.driver_id && (
          <View>
            <Text style={styles.headtxt}>{t('Waiting for driver')}</Text>
            <View
              style={{
                height: 170,
                width: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                alignSelf: 'center',
                marginBottom: 10,
              }}>
              <LottieView
                source={require('../../../Assets/Animation/drive3.json')}
                autoPlay
                loop={true}
                style={{height: 170, width: '100%', alignSelf: 'center'}}
              />
            </View>
          </View>
        )}

        <View style={styles.listcov}>
          <LocationIcon />
          <Text style={{fontFamily: Constants.font400, fontSize: 14,width:'85%'}}>
            {ride?.destination}
          </Text>
        </View>
        {ride?.scheduleride &&!ride?.driver_id && (
              <View>
                <LinearGradient
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  colors={['#DEE9FC', '#DBEFF0', '#D9F4E2']}
                  style={styles.btn}>
                  <View style={{width: '70%'}}>
                    <Text style={styles.tiptxt3}>
                      {t("This is a scheduled ride")}
                    </Text>
                    <Text style={styles.tiptxt4}>
                      {t("Your ride will be confirmed closer to your scheduled time")}
                    </Text>
                  </View>
                  <Image
                    source={require('../../../Assets/Images/bgtop2.png')}
                    style={{height: 70, width: 70}}
                  />
                </LinearGradient>
                <View style={styles.btmpart2}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                    {/* <DateIcon height={15} width={15} color={Constants.black} /> */}
                    <Text style={styles.shedtxt}>{t("Date")}</Text>
                    <Text style={styles.shedtxt2}>
                      {moment(ride?.date).format('YYYY-MM-DD HH:mm A')}
                    </Text>
                  </View>
                </View>
              </View>
            )}

        {
          <>
            <View>
              <Text style={styles.horline}></Text>
            </View>
            <View
              style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <View style={styles.listcov}>
                <PaymentIcon color={Constants.normal_green} height={23} width={23}/>
                <Text style={{fontFamily: Constants.font400, fontSize: 14}}>
                  {ride?.payment_mode === 'online' ? t('Online') : t('Cash')}
                </Text>
              </View>
              <Text style={{fontFamily: Constants.font400, fontSize: 14}}>
                {ride?.ride_mode==='pool'?t('Pool Ride'):`${ride?.final_price?ride?.final_price:ride?.price}${Currency}`}
              </Text>
            </View>
          </>
        }
        {ride?.status==='complete'&&
          <>
            <View>
              <Text style={styles.horline}></Text>
            </View>
            <TouchableOpacity
            onPress={()=>getinvoice()}
              style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <View style={styles.listcov}>
                <InvoiceIcon
                  height={23}
                  width={23}
                  color={Constants.customblue}
                />
                <Text style={{fontFamily: FONTS.Medium, fontSize: 14}}>
                  {t("Download Invoice")}
                </Text>
              </View>
              <RightArrow
                color={Constants.black}
                height={15}
                width={15}
                style={styles.aliself}
              />
            </TouchableOpacity>
          </>
        }
        {ride?.status==='complete'&&
          <>
            <View>
              <Text style={styles.horline}></Text>
            </View>
            <TouchableOpacity
            onPress={()=>setModalVisible4(true)}
              style={{flexDirection: 'row', justifyContent: 'space-between',marginBottom:50}}>
              <View style={styles.listcov}>
                <StarIcon
                  height={23}
                  width={23}
                  color={Constants.customblue}
                />
                <Text style={{fontFamily: FONTS.Medium, fontSize: 14}}>
                  {alreadyrated?t("Show Review"):t("Rate and review your driver")}
                </Text>
              </View>
              <RightArrow
                color={Constants.black}
                height={15}
                width={15}
                style={styles.aliself}
              />
            </TouchableOpacity>
          </>
        }

        <View style={styles.horline}></View>
        {ride?.status === 'pending' && (
          <TouchableOpacity
            style={{flexDirection: 'row', justifyContent: 'space-between'}}
            onPress={() => setModalVisible(true)}>
            <View style={styles.listcov}>
              <CancelrideIcon />
              <Text style={{fontFamily: Constants.font400, fontSize: 14}}>
                {t('Cancel ride')}
              </Text>
            </View>
            <RightArrow height={15} width={15} />
          </TouchableOpacity>
        )}
        {ride?.status === 'pending' && <View style={styles.horline}></View>}
      </ScrollView>
        {(ride?.status === 'started' || ride?.status === 'complete') &&
          !ride?.paymentid &&
          ride?.payment_mode === 'online' && (
            <TouchableOpacity
              style={styles.paybtn}
              onPress={() => setassignmodel(true)}>
              <Text style={styles.btntx}>{t('Pay')}</Text>
            </TouchableOpacity>
          )}
      <Modal
        animationType="none"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          // Alert.alert('Modal has been closed.');
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={{backgroundColor: 'white', alignItems: 'center'}}>
              <Text style={styles.textStyle}>
                {t('Are you sure you want to cancel this ride?')}
              </Text>
              <View style={styles.cancelAndLogoutButtonWrapStyle}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => setModalVisible(!modalVisible)}
                  style={styles.cancelButtonStyle}>
                  <Text style={styles.modalText}>{t('Cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={async () => {
                    setModalVisible(!modalVisible);
                    cancelRide();
                  }}
                  style={styles.logOutButtonStyle}>
                  <Text style={styles.modalText}>{t('Cancel Ride')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="none"
        transparent={true}
        visible={modalVisible3}
        onRequestClose={() => {
          // Alert.alert('Modal has been closed.');
          setModalVisible3(!modalVisible3);
        }}>
        <View style={styles.centeredView}>
          <View
            style={[
              styles.modalView,
              // {
              //   // backgroundColor: Constants.black,
              //   borderColor: Constants.custom_green,
              //   borderWidth: 1,
              // },
            ]}>
            <CrossIcon
              height={15}
              width={15}
              color={Constants.white}
              style={styles.cross}
              onPress={() => setModalVisible3(false)}
            />
            <View
              style={{
                backgroundColor: Constants.white,
                alignItems: 'center',
              }}>
              {/* <Image
                source={require('../../Assets/Images/remove.png')}
                style={styles.removeimg}
              /> */}
              <LottieView
                source={require('../../../Assets/Animation/failed.json')}
                autoPlay
                loop={false}
                style={{height: 100, width: 100}}
              />
              <Text style={[styles.textStyle]}>{t('Payment Failed')}</Text>
              <TouchableOpacity
                style={styles.errorbtn}
                onPress={() => {
                  setModalVisible3(false);
                }}>
                <Text style={styles.errorbtntxt}>{t('Try Again')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="none"
        transparent={true}
        visible={modalVisible2}
        onRequestClose={() => {
          // Alert.alert('Modal has been closed.');
          setModalVisible2(!modalVisible2);
        }}>
        <View style={styles.centeredView}>
          <View
            style={[
              styles.modalView,
              // {
              //   // backgroundColor: Constants.black,
              //   borderColor: Constants.custom_green,
              //   borderWidth: 1,
              // },
            ]}>
            <CrossIcon
              height={15}
              width={15}
              color={Constants.white}
              style={styles.cross}
              onPress={() => {
                setModalVisible2(false), goBack();
              }}
            />
            <View
              style={{
                backgroundColor: Constants.white,
                alignItems: 'center',
              }}>
              {/* <Image
                source={require('../../Assets/Images/remove.png')}
                style={styles.removeimg}
              /> */}
              <LottieView
                source={require('../../../Assets/Animation/payment.json')}
                autoPlay
                loop={false}
                style={{height: 100, width: 100}}
              />
              <Text style={[styles.textStyle, {color: Constants.custom_green}]}>
                {t('Payment Successfull')}
              </Text>
              <TouchableOpacity
                style={[
                  styles.errorbtn,
                  {backgroundColor: Constants.custom_green},
                ]}
                onPress={() => {
                  setModalVisible2(false);
                  // navigate('DriverApp')
                  // goBack();
                }}>
                <Text style={styles.errorbtntxt}>{t('Done')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
            <Modal
        animationType="none"
        transparent={true}
        visible={modalVisible4}
        onRequestClose={() => {
          setModalVisible4(!modalVisible4);
        }}>
        <View style={styles.centeredView}>
          <View style={[styles.modalView]}>
            <View
              style={{
                backgroundColor: Constants.white,
                alignItems: 'center',
                width: '100%'
              }}>
              <CrossIcon
                style={{
                  alignSelf: 'flex-end',
                  position: 'absolute',
                  top: -12,
                  right: -10,
                }}
                height={18}
                width={18}
                onPress={() => {
                  setModalVisible4(!modalVisible4);
                  // setuploadimg([]);
                }}
                color={Constants.black}
              />
              <Text style={[styles.textStyle, { color: Constants.black }]}>
                {t("Add Rating & Review")}
              </Text>
              <View style={{ marginVertical: 10 }}>
                {!alreadyrated?<StarRating
                  rating={rating || '0'}
                  enableHalfStar={false}
                  color={Constants.normal_green}
                  onChange={() => { }}
                  onRatingEnd={e => setrating(e)}
                />:
                <StarRatingDisplay
                  rating={rating || '0'}
                  color={Constants.normal_green}
                />}
              </View>
              <View
                style={styles.inpucov}>
                <TextInput
                  style={styles.inputfield}
                  placeholder={t('Review (Optional)')}
                  placeholderTextColor={Constants.customgrey2}
                  numberOfLines={5}
                  multiline={true}
                  editable={!alreadyrated}
                  value={review}
                  onChangeText={(e) =>
                    setreview(e)
                  }></TextInput>
              </View>
              {!alreadyrated && <View style={styles.cancelAndLogoutButtonWrapStyle}>
                <TouchableOpacity
                  style={styles.logOutButtonStyle2}
                  onPress={() => addreview()}>
                  <Text style={styles.modalText}>{t("Submit")}</Text>
                </TouchableOpacity>
              </View>}
            </View>
          </View>
        </View>
      </Modal>
      <Modal
              animationType="none"
              transparent={true}
              visible={assignmodel}
              onRequestClose={() => {
                setassignmodel(!assignmodel);
              }}>
              <View style={styles.centeredView2}>
                <View style={styles.modalView2}>
                  <CrossIcon
                    style={styles.popupcross}
                    height={16}
                    width={16}
                    onPress={() => setassignmodel(false)}
                  />
                     <View>
                        <ImageBackground
                          source={require('../../../Assets/Images/bgimg2.png')}
                          style={{
                            height: 100,
                            width: '120%',
                            borderRadius: 10,
                            justifyContent: 'space-between',
                            flexDirection: 'row',
                            paddingRight: 30,
                            paddingLeft: 40,
                            // paddingRight: '22%',
                            alignItems: 'flex-end',
                            marginTop: 20,
                          }}
                          resizeMode="cover">
                          <View >
                            <Text style={styles.tiptxt1}>
                              {t('Tip your driver')}
                            </Text>
                            <Text style={styles.tiptxt2}>
                              {t('Full tip sent after ride completion.')}
                            </Text>
                          </View>
                          <Image
                            source={require('../../../Assets/Images/driver.png')}
                            style={{height: 70, width: 70}}
                          />
                        </ImageBackground>
                        <View style={{height: 60, paddingHorizontal: 15}}>
                          <ScrollView
                            horizontal={true}
                            keyboardShouldPersistTaps="handled"
                            showsHorizontalScrollIndicator={false}
                            style={{marginTop: 5, paddingVertical: 10}}>
                            <Text
                              style={[
                                styles.tipamt,
                                {
                                  backgroundColor:
                                    donation === '2' ? '#ECFAF1' : null,
                                  borderColor:
                                    donation === '2'
                                      ? Constants.normal_green
                                      : Constants.customgrey2,
                                  color:
                                    donation === '2'
                                      ? Constants.black
                                      : Constants.customgrey2,
                                },
                              ]}
                              onPress={() => {
                                setdonation('2'), setseldonation('amount');
                              }}>
                              {Currency}2
                            </Text>
                            <Text
                              style={[
                                styles.tipamt,
                                {
                                  backgroundColor:
                                    donation === '5' ? '#ECFAF1' : null,
                                  borderColor:
                                    donation === '5'
                                      ? Constants.normal_green
                                      : Constants.customgrey2,
                                  color:
                                    donation === '5'
                                      ? Constants.black
                                      : Constants.customgrey2,
                                },
                              ]}
                              onPress={() => {
                                setdonation('5'), setseldonation('amount');
                              }}>
                              {Currency}5
                            </Text>
                            <Text
                              style={[
                                styles.tipamt,
                                {
                                  backgroundColor:
                                    donation === '10' ? '#ECFAF1' : null,
                                  borderColor:
                                    donation === '10'
                                      ? Constants.normal_green
                                      : Constants.customgrey2,
                                  color:
                                    donation === '10'
                                      ? Constants.black
                                      : Constants.customgrey2,
                                },
                              ]}
                              onPress={() => {
                                setdonation('10'), setseldonation('amount');
                              }}>
                              {Currency}10
                            </Text>
                            <View style={{height: 40,marginRight:20}}>
                              {seldonation === 'Other' ? (
                                <View style={styles.tipamt2}>
                                  <Text style={styles.tipcur}>{Currency}</Text>
                                  <TextInput
                                    ref={inputRef}
                                    style={styles.donationinp}
                                    maxLength={3}
                                    keyboardType="number-pad"
                                    value={donation}
                                    onChangeText={e => setdonation(e)}
                                    onSubmitEditing={() => {
                                      if (Number(donation.trim()) <= 0) {
                                        setdonation(''), setseldonation('');
                                      }
                                    }}
                                  />
                                </View>
                              ) : (
                                <Text
                                  style={styles.tipamt}
                                  onPress={() => {
                                    setdonation(''), setseldonation('Other');
                                  }}>
                                  {t('Other')}
                                </Text>
                              )}
                            </View>
                          </ScrollView>
                        </View>
                        {(seldonation != '' || Number(donation) > 99) && (
                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              marginTop: 10,
                              paddingHorizontal: 40,
                            }}>
                            <Text style={styles.wartxt}>
                              {Number(donation) > 99 &&
                                t(
                                  'Sorry! A tip over CA$99 is far to generous on this order. Feel free to tip more directly to the delivery partner.',
                                )}
                            </Text>
                            <Text
                              style={styles.clrtxt}
                              onPress={() => {
                                setdonation(''), setseldonation('');
                              }}>
                              {seldonation != '' && t('Clear')}
                            </Text>
                          </View>
                        )}
                      </View>
                      <View style={{height:6,width:'120%',backgroundColor:Constants.customgrey5,marginTop:25,marginBottom:10}}></View>
                      <Text style={[styles.textStyle, { color: Constants.black }]}>
                {t("Add Rating & Review")}
              </Text>
              <View style={{ marginVertical: 10 }}>
                {!alreadyrated?<StarRating
                  rating={rating || '0'}
                  enableHalfStar={false}
                  color={Constants.normal_green}
                  starSize={38}
                  onChange={() => { }}
                  onRatingEnd={e => setrating(e)}
                />:
                <StarRatingDisplay
                  rating={rating || '0'}
                  color={Constants.normal_green}
                />}
              </View>
              <View
                style={styles.inpucov}>
                <TextInput
                  style={styles.inputfield}
                  placeholder={t('Review (Optional)')}
                  placeholderTextColor={Constants.customgrey2}
                  numberOfLines={5}
                  multiline={true}
                  editable={!alreadyrated}
                  value={review}
                  onChangeText={(e) =>
                    setreview(e)
                  }></TextInput>
              </View>
                      <TouchableOpacity
                        style={styles.button2}
                        onPress={() =>{setassignmodel(false),handleplayment()} }>
                        <Text style={styles.buttontxt}>{t('Pay')}</Text>
                      </TouchableOpacity>
                  </View>
                  </View>
            </Modal>
    </SafeAreaView>
  );
};

export default RideDetail;

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
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  timimgtxt: {
    color: Constants.black,
    fontFamily: Constants.font700,
    fontSize: 22,
  },
  carname: {
    color: Constants.black,
    fontFamily: Constants.font300,
    fontSize: 14,
  },
  vehiclecov: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pincov: {
    backgroundColor: Constants.dark_green,
    color: Constants.white,
    fontFamily: Constants.font700,
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 2,
    textAlign: 'center',
    alignSelf: 'center',
    borderRadius:3,
    lineHeight:18
  },
  proimg: {
    height: 45,
    width: 45,
    borderRadius: 50,
    borderWidth:2,
    borderColor:Constants.normal_green
  },
  proimg3: {
    height: 45,
    width: 45,
    borderRadius: 50,
  },
  proimg2: {
    height: 70,
    width: 100,
    marginLeft:20,
    borderRadius: 10,
  },
  procov: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // marginTop: 25,
    gap: 15,
    alignItems: 'center',
    paddingBottom: 5,
    // width: '90%',
    // alignSelf: 'center',
    // backgroundColor: Constants.red,
    // padding: 10,
    // borderRadius: 7,
  },
  horline: {
    height: 2,
    backgroundColor: Constants.customgrey4,
    marginVertical: 20,
  },
  horline3: {
    height: 2,
    backgroundColor: Constants.customgrey4,
    marginVertical: 10,
  },
  horline2: {
    height: 6,
    backgroundColor: Constants.customgrey4,
    width: '120%',
    marginLeft: -20,
    marginVertical: 20,
  },
  listcov: {
    flexDirection: 'row',
    // justifyContent:'space-between'
    gap: 20,
  },
  nametxt: {
    color: Constants.black,
    fontFamily: Constants.font300,
    fontSize: 12,
  },
  protxt2: {
    color: Constants.black,
    fontFamily: Constants.font700,
    fontSize: 14,
  },
  headtxt: {
    color: Constants.black,
    fontFamily: FONTS.SemiBold,
    fontSize: 16,
  },
  carcov: {
    borderColor: Constants.black,
    borderWidth: 1,
    borderRadius: 50,
    padding: 5,
  },
  vehiclenum: {
    color: Constants.black,
    fontSize: 12,
    fontFamily: FONTS.Medium,
  },
  vehiclenumcov: {
    backgroundColor: Constants.white,
    borderRadius: 5,
    paddingHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 1 2 0.08 grey',
    position: 'absolute',
    left: 45,
    bottom: -10,
  },
  //////log out ///
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // marginTop: 22,
    backgroundColor: '#rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    position: 'relative',
  },
centeredView2: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // marginTop: 22,
    backgroundColor: '#rgba(0, 0, 0, 0.5)',
    position:'relative'
  },
  modalView2: {
    // margin: 20,
    backgroundColor: 'white',
    // borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    width: '100%',
    height: '100%',
    // height: Dimensions.get('window').height,
  },
  textStyle: {
    color: Constants.black,
    // fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: FONTS.SemiBold,
    fontSize: 16,
  },
  modalText: {
    color: Constants.white,
    // fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: FONTS.SemiBold,
    fontSize: 14,
  },
  cancelAndLogoutButtonWrapStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 3,
  },
  cancelButtonStyle: {
    flex: 0.5,
    backgroundColor: Constants.black,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginRight: 10,
  },
  logOutButtonStyle: {
    flex: 0.5,
    backgroundColor: Constants.red,
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  logOutButtonStyle2: {
      flex: 0.5,
      backgroundColor: Constants.normal_green,
      borderRadius: 10,
      paddingVertical: 10,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 15,
    },
  paybtn: {
    backgroundColor: Constants.dark_green,
    height: 45,
    width: '85%',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    // marginBottom: 40,
    position:'absolute',
    bottom:5
  },
  btntx: {
    color: Constants.white,
    fontSize: 16,
    fontFamilyL: FONTS.SemiBold,
  },

  textStyle: {
    fontFamily: FONTS.Bold,
    color: Constants.black,
    fontSize: 16,
    marginVertical: 10,
  },
  errorbtn: {
    width: 200,
    backgroundColor: '#F44336',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 10,
    marginTop: 10,
    borderRadius: 10,
  },
  errorbtntxt: {
    fontSize: 18,
    color: Constants.white,
    fontFamily: FONTS.Bold,
  },
  cross: {
    position: 'absolute',
    right: 15,
    top: 15,
  },
  inputfield: {
      color: Constants.black,
      fontSize: 14,
      fontFamily: FONTS.Medium,
      flex: 1,
      textAlignVertical: 'top'
    },
    inpucov: {
      backgroundColor: Constants.customgrey4,
      marginVertical: 10,
      borderRadius: 15,
      height: 50,
      paddingHorizontal: 10,
      flexDirection: 'row',
      height: 80
    },
    popupcross: {
    alignSelf: 'flex-end',
    marginRight: 15,
  },
  tipamt: {
    color: Constants.customgrey2,
    fontSize: 16,
    fontFamily: FONTS.Medium,
    borderWidth: 1.5,
    borderColor: Constants.customgrey2,
    borderRadius: 10,
    paddingHorizontal: 23,
    paddingTop: 7,
    paddingBottom: 3,
    marginLeft: 10,
    height: 40,
  },
  tipamt2: {
      borderWidth: 1.5,
      borderColor: Constants.normal_green,
      borderRadius: 10,
      paddingHorizontal: 23,
      marginLeft: 10,
      flexDirection: 'row',
    },
    button2: {
        backgroundColor: Constants.dark_green,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        borderRadius: 10,
        marginBottom: 20,
        width: '100%',
        alignSelf:'center',
        // marginTop:20,
        position:'absolute',
        bottom:0
      },
      buttontxt: {
    color: Constants.white,
    fontSize: 18,
    fontFamily: FONTS.SemiBold,
  },
  tiptxt1: {
      fontSize: 16,
      color: Constants.customgrey,
      fontFamily: FONTS.SemiBold,
    },
    tiptxt2: {
      fontSize: 14,
      color: Constants.customgrey,
      fontFamily: FONTS.Regular,
    },
    tipcur: {
    color: Constants.normal_green,
    fontSize: 14,
    fontFamily: FONTS.Medium,
    alignSelf: 'center',
  },
  wartxt: {
    color: Constants.red,
    fontSize: 14,
    fontFamily: FONTS.Regular,
    width: '85%',
  },
  clrtxt: {
    color: Constants.normal_green,
    fontSize: 14,
    fontFamily: FONTS.Medium,
  },
  donationinp: {
    color: Constants.normal_green,
    fontSize: 16,
    fontFamily: FONTS.Medium,
    height: 40,
    paddingVertical: 0,
  },
  comtxt:{
    color: Constants.white,
    fontSize: 14,
    fontFamily: FONTS.Medium,
    backgroundColor:Constants.dark_green,
    paddingHorizontal:10,
    paddingVertical:5,
    borderRadius:10
  },

  btn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    padding: 10,
    marginTop:10
  },
  btmpart2: {
    padding: 10,
    backgroundColor: Constants.customgrey4,
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 10,
  },
  shedtxt: {
    fontSize: 14,
    color: Constants.customgrey,
    fontFamily: FONTS.Regular,
  },
  shedtxt2: {
    fontSize: 14,
    color: Constants.black,
    fontFamily: FONTS.Medium,
  },
  tiptxt3: {
    fontSize: 14,
    color: Constants.customgrey,
    fontFamily: FONTS.SemiBold,
  },
  tiptxt4: {
    fontSize: 12,
    color: Constants.customgrey,
    fontFamily: FONTS.Medium,
  },
  customMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'white',
    borderWidth: 4,
    borderColor: '#00bfff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'white',
  },
});
