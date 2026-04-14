import {
  // Animated,
  Dimensions,
  Easing,
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {
  createRef,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Constants, {
  Currency,
  FONTS,
  Googlekey,
} from '../../../Assets/Helpers/constant';
import MapView, {
  Callout,
  Marker,
  Polygon,
  Polyline,
  PROVIDER_GOOGLE,
} from 'react-native-maps';
import {navigate} from '../../../../navigationRef';
import {GetApi, Post} from '../../../Assets/Helpers/Service';
import {LoadContext, ToastContext, UserContext} from '../../../../App';
import {PERMISSIONS} from 'react-native-permissions';
import Geolocation from '@react-native-community/geolocation';
import MapViewDirections from 'react-native-maps-directions';
import LocationAutocomplete from '../../../Assets/Component/LocationAutocomplete';
import {
  CalenderIcon,
  ClockIcon,
  CrossIcon,
  MenuIcon,
  ProfileIcon,
  SearchIcon,
  ThunderIcon,
} from '../../../../Theme';
import GetCurrentAddressByLatLong from '../../../Assets/Component/GetCurrentAddressByLatLong';
import {mapStyle} from '../../../Assets/Helpers/mapStyle';
import axios from 'axios';
import {useIsFocused} from '@react-navigation/native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import moment from 'moment';
import ActionSheet from 'react-native-actions-sheet';
import {RadioButton} from 'react-native-paper';
import {useTranslation} from 'react-i18next';

const AnimatedMapContainer = Animated.createAnimatedComponent(View);

const SelectRide = props => {
  const {t} = useTranslation();
  const data = props?.route?.params;
  console.log(data);
  const mapRef = useRef(null);
  const rideRef = createRef();
  const refRBSheet = useRef();
  const [shops, setshops] = useState([]);
  const [locationshow, setlocationshow] = useState(false);
  const [destinationshow, setdestinationshow] = useState(false);
  const [toast, setToast] = useContext(ToastContext);
  const [loading, setLoading] = useContext(LoadContext);
  const [user, setuser] = useContext(UserContext);
  const [assignmodel, setassignmodel] = useState(false);
  const [km, setkm] = useState();
  const [tax, setTax] = useState();
  const [duration, setduration] = useState(null);
  const [vehiclelist, setvehiclelist] = useState([]);
  const [paymentopt, setpaymentopt] = useState();
  const [locationadd, setlocationadd] = useState();
  const [destinationadd, setdestinationadd] = useState();
  const [location, setlocation] = useState();
  const [destination, setdestination] = useState();
  const [selectvehicle, setselectvehicle] = useState();
  const [defvehicle, setDefvehicle] = useState();
  const [vehicleRatePerKm, setvehicleRatePerKm] = useState();
  const [jobtype, setjobtype] = useState('online');
  const isFocus = useIsFocused();
  const {height: screenHeight} = Dimensions.get('window');
  const sheetRef = useRef(null);
  // const [donation, setdonation] = useState(null);
  // const [seldonation, setseldonation] = useState('');
  // const inputRef = useRef(null);
  // useEffect(() => {
  //   if (seldonation === 'Other') {
  //     setTimeout(() => {
  //       if (inputRef.current) {
  //         inputRef.current.focus();
  //       }
  //     }, 200);
  //   }
  // }, [donation, seldonation]);

  const snapPoints = useMemo(() => ['50%', '60%', '70%', '80%'], []);

  const sheetPosition = useSharedValue(0);

  const animatedMapStyle = useAnimatedStyle(() => {
    const mapHeight = interpolate(
      sheetPosition.value,
      [0, 1], // 0 = collapsed, 1 = expanded
      [screenHeight * 0.9, screenHeight * 0.2],
      Extrapolation.CLAMP,
    );
    return {
      height: mapHeight,
    };
  });

  //  const IsFocused = useIsFocused();
  //   useEffect(() => {
  //     if (IsFocused) {
  //       {
  //         props?.route?.params?.data?.location &&
  //           props?.route?.params?.data?.destination &&
  //           calculateDistance();
  //       }
  //     }
  //     else{
  //       setlocation(null)
  //       setlocationadd(null)
  //       setdestination(null)
  //       setdestinationadd(null)
  //     }
  //   }, [IsFocused,data]);
  useEffect(() => {
    {
      props?.route?.params?.data?.location &&
        props?.route?.params?.data?.destination &&
        calculateDistance();
      }
      if (isFocus) {
      setlocationadd(data?.data?.locationadd);
      setdestinationadd(data?.data?.destinationadd);
      setlocation(data?.data?.location);
      setdestination(data?.data?.destination);
    }
  }, [data, isFocus]);
const stopwaypoint = data?.data?.stops
  ?.filter(item => item?.location?.latitude && item?.location?.longitude) // skip empty
  ?.map(item => ({
    latitude: item?.location?.latitude,
    longitude: item?.location?.longitude,
  }));

  useEffect(() => {
    if (isFocus) {
      getRidePaymentOption();
    }
  }, [isFocus]);

  useEffect(() => {
    getalltrucktype();
    getTax();
  }, []);

  const getalltrucktype = () => {
    setLoading(true);
    GetApi(`getalltrucktype`, {}).then(
      async res => {
        setLoading(false);
        console.log(res.data);
        setvehiclelist(res.data);
        if (res?.data.length > 0) {
          setselectvehicle(res?.data[0]._id);
          setDefvehicle(res?.data[0]._id);
          setvehicleRatePerKm(res?.data[0].ratePerKm);
        }
      },
      err => {
        setLoading(false);
        console.log(err);
      },
    );
  };
  const getRidePaymentOption = () => {
    setLoading(true);
    GetApi(`getRidePaymentOption`, {}).then(
      async res => {
        setLoading(false);
        console.log(res.data);
        if (
          res?.data?.ridePaymentOption &&
          res?.data?.ridePaymentOption?.length > 0
        ) {
          setpaymentopt(res?.data?.ridePaymentOption[0]);
          setjobtype(res?.data?.ridePaymentOption[0]?.cash ? 'cod' : 'online');
        }
      },
      err => {
        setLoading(false);
        console.log(err);
      },
    );
  };
  const getTax = () => {
    setLoading(true);
    GetApi(`getTax`).then(
      async res => {
        setLoading(false);
        console.log(res);
        if (res?.data && res?.data?.length > 0) {
          setTax(res?.data[0]);
        }
      },
      err => {
        setLoading(false);
        console.log(err);
      },
    );
  };

  const [routeCoordinates, setRouteCoordinates] = useState([]);
  // const animatedValue = new Animated.Value(0);
  // useEffect(() => {
  //   if (routeCoordinates.length > 0) {
  //     animateRoute();
  //   }
  // }, [routeCoordinates]);
  // const animateRoute = () => {
  //   Animated.timing(animatedValue, {
  //     toValue: 1,
  //     duration: 5000,
  //     easing: Easing.linear,
  //     useNativeDriver: false,
  //   }).start();
  // };

  const calculateDistance = async () => {
    const origin = `${props?.route?.params?.data?.location?.latitude},${props?.route?.params?.data?.location?.longitude}`;
    const destination2 = `${props?.route?.params?.data?.destination?.latitude},${props?.route?.params?.data?.destination?.longitude}`;

const stopsArray = data?.data?.stops || [];
  const waypoints = stopsArray.length
    ? `&waypoints=${stopsArray.map(item => `${item?.location?.latitude},${item?.location?.longitude}`).join('|')}`
    : '';

    // const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination2}&key=${Googlekey}`;
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination2}${waypoints}&key=${Googlekey}`;

    console.log('url', url);

    try {
      const response = await axios.get(url);
      const result = response.data;
      if (result.routes?.length) {
      const legs = result.routes[0].legs;

      // Sum up distances and durations
      const totalDistance = legs.reduce((sum, leg) => sum + (leg.distance?.value || 0), 0);
      const totalDuration = legs.reduce((sum, leg) => sum + (leg.duration?.value || 0), 0);

      setkm((totalDistance / 1000).toFixed(1)); // meters → km
      setduration(totalDuration); // seconds
    } else {
      console.warn('No routes found');
    }
    } catch (error) {
      console.error('Error fetching data: ', error);
    }
  };
  const submit = (price, fee) => {
    let ran_otp = Math.floor(1000 + Math.random() * 9000);
    // const selectedvehiclerateperkm = vehiclelist.find(
    //   item => item?._id === selectvehicle,
    // ).ratePerKm;
    const body = {
      source: locationadd,
      src: {
        type: 'Point',
        coordinates: [location?.longitude, location?.latitude],
      },
      dest: {
        type: 'Point',
        coordinates: [destination?.longitude, destination?.latitude],
      },
      destination: destinationadd,
      user: user._id,
      user_name: data?.name,
      user_number: data?.number,
      duration: duration,
      price: Number(price),
      otp: ran_otp,
      vehicle_type: selectvehicle === '' ? defvehicle : selectvehicle,
      payment_mode: jobtype,
    };
    // if (jobtype === 'online') {
    //   body.delivery_tip = Number(donation);
    // }
    if (data?.data?.stops?.length>0) {
      const formattedStops = (data?.data?.stops || []).map(stop => ({
  address: stop.address,
  location: {
    type: "Point",
    coordinates: [
      stop.location.longitude,
      stop.location.latitude,
    ],
  },
}));
      body.stops = formattedStops
    }
    if (fee) {
      body.service_fee = fee;
      body.final_price = Number(fee) + Number(price);
      // body.final_price = Number(fee) + Number(price)+(Number(donation) > 0 ? Number(donation) : 0);
    }
    if (selectvehicle === '') {
      body.ride_mode = 'pool';
    }
    if (data?.schedule) {
      const fullStartDateTime = moment(data?.schedule, 'YYYY-MM-DD h:mm A');
      const finalDateTime = fullStartDateTime.subtract(30, 'minutes');

      body.scheduleride = true;
      body.date = new Date(finalDateTime);
    } else {
      body.date = new Date();
    }
    setLoading(true);
    Post('createRide', body, {}).then(
      async res => {
        setLoading(false);
        console.log(res);
        if (res.status) {
          navigate('SideMenu', {
            screen: 'RideDetail',
            params: {ride_id: res.data._id},
          });
          console.log('enter');
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
      {/* <GestureHandlerRootView style={styles.container}> */}

      {/* <AnimatedMapContainer style={[styles.container, animatedMapStyle]}> */}

      <View style={{height: Dimensions.get('screen').height / 3}}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE} // remove if not using Google Maps
          style={styles.map}
          // customMapStyle={mapStyle}
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
              // coordinate={location}
              // ref={mapRef}
              draggable={true}
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
                latitude: destination?.latitude
                  ? Number(destination?.latitude)
                  : 0,
                longitude: destination?.longitude
                  ? Number(destination?.longitude)
                  : 0,
              }}
              title="End"
              description="End jouney here"
              tooltip={true}
              pinColor="#de2c1f"
              // image={require('../../Assets/Images/Start.png')}
            >
              {/* <View> */}
              {/* <Callout>
                <View style={{ padding: 10 }} tooltip={true}>
                  <Text style={{ fontWeight: 'bold' }}>Custom Tooltip</Text>
                  <Text>This is more detailed info</Text>
                </View>
              </Callout> */}
              {/* <View style={{ height: 35, width: 35, flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end' }}>
                <Text style={{ height: 20, width: 20, backgroundColor: '#de2c1f', borderRadius: 10 }}></Text>
              </View> */}
              {/* </View> */}
            </Marker>
          )}
          <Marker
            // coordinate={location}
            // ref={mapRef}
            draggable={true}
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
            title="Start"
            description="You can statrt from here!"
            tooltip={true}
            coordinate={{
              latitude: location?.latitude ? Number(location?.latitude) : 0,
              longitude: location?.longitude ? Number(location?.longitude) : 0,
            }}
            pinColor={'green'}
            // image={require('../../Assets/Images/start.png')}
          >
            {/* <View style={{ height: 35, width: 35, flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end' }}>
              <Text style={{ height: 20, width: 20, backgroundColor: 'green', borderRadius: 10 }}></Text>
            </View> */}
          </Marker>
{stopwaypoint?.length > 0 && stopwaypoint.map((item,index)=>(
              <Marker
                coordinate={item}
                anchor={{ x: 0.5, y: 0.5 }}
                key={index}
              >
                {/* <View style={styles.customMarker}>
                   <View style={styles.innerCircle} />
                 </View> */}
              </Marker>
            ))}
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
                // setTimeout(() => {
                //   if (sheetRef.current) {
                //     console.log(sheetRef.current)
                //     sheetRef.current?.snapToIndex(0);
                //   }
                // }, 1000);
              }}
              apikey={Googlekey}
              strokeWidth={4}
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
            borderRadius: 30,
            boxShadow: '0px 2px 5px 0.08px grey',
          }}
          onPress={() => {
            props.navigation.openDrawer();
          }}>
          <MenuIcon />
        </TouchableOpacity>
        {/* </AnimatedMapContainer> */}
      </View>
      <Text style={styles.maintxt}>{t('Select Ride')}</Text>
      <ScrollView style={styles.btmpart} showsVerticalScrollIndicator={false}>
        <View style={{paddingBottom: 50}}>
          {selectvehicle === '' ? (
            <View style={styles.box}>
              <Image
                source={require('../../../Assets/Images/car.png')}
                resizeMode="contain"
                style={{alignSelf: 'center', height: 100, width: 200}}
              />
              <View style={styles.boxbtm}>
                <View>
                  <View style={styles.toppart}>
                    <Text style={styles.vehicletxt}>{t('Chmp: Pool')}</Text>
                    <View style={{alignItems: 'center', flexDirection: 'row'}}>
                      <ProfileIcon color={Constants.black} />
                      <Text style={{fontSize: 10}}>1</Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.pricetxt}>{t('Cheapest')}</Text>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.box1sta}
              onPress={() => {
                setselectvehicle('');
                //, setvehicleRatePerKm(item.ratePerKm);
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  gap: 5,
                  alignItems: 'center',
                  width: '70%',
                }}>
                <Image
                  source={require('../../../Assets/Images/car.png')}
                  resizeMode="contain"
                  style={{alignSelf: 'center', width: 80, height: 60}}
                />
                <View style={[styles.boxbtm, {width: '65%'}]}>
                  <Text>
                    <Text style={styles.vehicletxt}>
                      {t('Chmp: Pool')} {'  '}
                    </Text>
                    <ProfileIcon color={Constants.black} />
                    <Text style={{fontSize: 10}}>1</Text>
                  </Text>
                </View>
              </View>
              <Text style={styles.pricetxt}>{t('Cheapest')}</Text>
            </TouchableOpacity>
          )}
          {vehiclelist.map((item, index) =>
            item._id === selectvehicle ? (
              <View style={styles.box} key={index}>
                <Image
                  source={{uri: item.vehicleimg}}
                  resizeMode="contain"
                  style={{alignSelf: 'center', height: 100, width: 200}}
                />
                <View style={styles.boxbtm}>
                  <View>
                    <View style={styles.toppart}>
                      <Text style={styles.vehicletxt}>{item.name}</Text>
                      <View
                        style={{alignItems: 'center', flexDirection: 'row'}}>
                        <ProfileIcon color={Constants.black} />
                        <Text style={{fontSize: 10}}>{item.maxPassengers}</Text>
                      </View>
                      {item.name === 'Bike' && (
                        <View style={styles.greenbox}>
                          <ThunderIcon color={Constants.white} />
                          <Text style={styles.greenboxtxt}>{t('Fastest')}</Text>
                        </View>
                      )}
                    </View>
                    {/* <Text style={styles.awaytxt}>5 min away</Text> */}
                    {/* <TouchableOpacity style={styles.greenbox2} onPress={() => setassignmodel()}>
                      <ClockIcon color={Constants.white} />
                      <Text style={styles.greenboxtxt}>Schedule Ride</Text>
                    </TouchableOpacity> */}
                  </View>
                  {km > 0 && (
                    <Text style={styles.pricetxt}>
                      {(km * item.ratePerKm).toFixed(0)}
                      {Currency}
                    </Text>
                  )}
                </View>
              </View>
            ) : (
              item._id != selectvehicle && (
                <TouchableOpacity
                  style={styles.box1sta}
                  key={index}
                  onPress={() => {
                    setselectvehicle(item._id),
                    setvehicleRatePerKm(item.ratePerKm);
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      gap: 5,
                      alignItems: 'center',
                      width: '70%',
                    }}>
                    <Image
                      source={{uri: item.vehicleimg}}
                      resizeMode="contain"
                      style={{alignSelf: 'center', width: 80, height: 60}}
                    />
                    <View style={[styles.boxbtm, {width: '65%'}]}>
                      {/* <View> */}
                      <Text>
                        <Text style={styles.vehicletxt}>
                          {item.name} {'  '}
                        </Text>
                        {/* <View
                            style={{
                              alignItems: 'center',
                              flexDirection: 'row',
                            }}> */}
                        <ProfileIcon color={Constants.black} />
                        <Text style={{fontSize: 10}}>{item.maxPassengers}</Text>
                        {/* </View> */}
                      </Text>
                      {/* <Text style={styles.awaytxt}>5 min away</Text> */}
                      {/* </View> */}
                    </View>
                  </View>
                  {km > 0 && (
                    <Text style={styles.pricetxt}>
                      {Currency}
                      {(km * item.ratePerKm).toFixed(0)}
                    </Text>
                  )}
                </TouchableOpacity>
              )
            ),
          )}
        </View>
      </ScrollView>
      <View style={{paddingHorizontal: 20, marginBottom: 5}}>
        <TouchableOpacity
          style={[styles.button, {marginBottom: 0, marginTop: 0}]}
          onPress={() => {
            selectvehicle === ''
              ? submit((vehicleRatePerKm * km).toFixed(0), null)
              : rideRef.current.show();
          }}>
          <Text style={styles.buttontxt}>
            {selectvehicle === '' ? t('Confirm Ride') : t('Continue')}
          </Text>
        </TouchableOpacity>
      </View>
      <ActionSheet
        ref={rideRef}
        closeOnTouchBackdrop={false}
        containerStyle={{backgroundColor: Constants.white}}>
        {/* <Modal
        animationType="none"
        transparent={true}
        visible={assignmodel}
        onRequestClose={() => {
          setassignmodel(!assignmodel);
        }}>
        <View style={styles.centeredView2}>
        <View style={styles.modalView2}> */}
        <View style={styles.shhetcov}>
          <CrossIcon
            style={styles.popupcross}
            height={16}
            width={16}
            onPress={() => rideRef.current.hide()}
          />
          <View>
            <RadioButton.Group
              onValueChange={type => {
                setjobtype(type);
              }}
              value={jobtype}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-evenly',
                }}>
                {paymentopt?.online && (
                  <RadioButton.Item
                    mode="android"
                    label={t('Pay Online')}
                    value="online"
                    position="leading"
                    style={[styles.box2]}
                    color={Constants.normal_green}
                    uncheckedColor={Constants.black}
                    labelStyle={{
                      color:
                        jobtype === 'online'
                          ? Constants.normal_green
                          : Constants.black,
                      fontSize: 16,
                      fontFamily: FONTS.Medium,
                    }}
                  />
                )}

                {paymentopt?.cash && (
                  <RadioButton.Item
                    mode="android"
                    label={t('Cash')}
                    value="cod"
                    position="leading"
                    style={[styles.box2]}
                    color={Constants.normal_green}
                    uncheckedColor={Constants.black}
                    labelStyle={{
                      color:
                        jobtype === 'cod'
                          ? Constants.normal_green
                          : Constants.black,
                      fontSize: 16,
                      fontFamily: FONTS.Medium,
                    }}
                  />
                )}
              </View>
            </RadioButton.Group>
            <View style={styles.btmbox}>
              <View style={styles.rowbetw2}>
                <Text style={styles.deltxt}>{t('Total')}</Text>
                <Text style={styles.deltxt2}>
                  {Currency}
                  {(vehicleRatePerKm * km).toFixed(2)}
                </Text>
              </View>

              <View style={styles.rowbetw2}>
                <Text style={styles.deltxt}>{t('Service Fee')}</Text>
                <Text style={styles.deltxt2}>
                  {Currency}
                  {jobtype === 'online'
                    ? (
                        (vehicleRatePerKm * km * tax?.rideOnlineTax) /
                        100
                      ).toFixed(2)
                    : 0}
                </Text>
              </View>
              {/* {Number(donation)>0&&<View style={styles.rowbetw2}>
                                    <Text style={styles.deltxt}>{t("Delivery Tip")}</Text>
                                    <Text style={styles.deltxt2}>{Currency}{donation}</Text>
                                  </View>} */}

              <View style={styles.rowbetw2}>
                <Text style={styles.deltxt}>{t('Final')}</Text>
                <Text style={styles.deltxt2}>
                  {Currency}
                  {jobtype === 'online'
                    ? (
                        vehicleRatePerKm * km +
                        (vehicleRatePerKm * km * tax?.rideOnlineTax) / 100
                      )
                        // +(Number(donation) > 0 ? Number(donation) : 0)
                        .toFixed(0)
                    : (vehicleRatePerKm * km).toFixed(0)}
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.button2}
            onPress={() =>
              submit(
                (vehicleRatePerKm * km).toFixed(0),
                jobtype === 'online'
                  ? (
                      (vehicleRatePerKm * km * tax?.rideOnlineTax) /
                      100
                    ).toFixed(0)
                  : null,
              )
            }>
            <Text style={styles.buttontxt}>{t('Confirm Ride')}</Text>
          </TouchableOpacity>
        </View>
      </ActionSheet>
      {/* </View>
            </View> */}
      {/* </ScrollView> */}
      {/* </View> */}
      {/* </Modal> */}
    </SafeAreaView>
  );
};

export default SelectRide;

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
    // marginTop:-20,
    // borderTopLeftRadius:25,
    // borderTopRightRadius:25,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  maintxt: {
    color: Constants.black,
    fontSize: 16,
    fontFamily: FONTS.SemiBold,
    textAlign: 'center',
    paddingTop: 10,
  },
  vehicletxt: {
    color: Constants.black,
    fontSize: 16,
    fontFamily: FONTS.Medium,
  },
  awaytxt: {
    color: Constants.black,
    fontSize: 12,
    fontFamily: FONTS.Medium,
    marginBottom: 5,
  },
  greenboxtxt: {
    color: Constants.white,
    fontSize: 10,
    fontFamily: FONTS.Medium,
  },
  pricetxt: {
    color: Constants.black,
    fontSize: 16,
    fontFamily: FONTS.SemiBold,
  },
  boxbtm: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // marginTop: 10,
  },
  box: {
    borderWidth: 2,
    borderColor: Constants.dark_green,
    padding: 10,
    borderRadius: 10,
  },
  toppart: {
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'space-between',
    // marginBottom: 10,
  },
  greenbox: {
    flexDirection: 'row',
    backgroundColor: Constants.dark_green,
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 20,
    paddingVertical: 1,
    borderRadius: 15,
  },
  greenbox2: {
    flexDirection: 'row',
    backgroundColor: Constants.dark_green,
    alignItems: 'center',
    gap: 5,
    paddingVertical: 2,
    borderRadius: 15,
    justifyContent: 'center',
    width: 120,
  },
  button: {
    backgroundColor: Constants.dark_green,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
    borderRadius: 10,
    marginBottom: 50,
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
    alignSelf: 'center',
    // marginTop:20,
    // position:'absolute',
    // bottom:0
  },
  buttontxt: {
    color: Constants.white,
    fontSize: 18,
    fontFamily: FONTS.SemiBold,
  },

  shhetcov: {
    padding: 15,
  },
  ///model
  centeredView2: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // marginTop: 22,
    backgroundColor: '#rgba(0, 0, 0, 0.5)',
    position: 'relative',
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
  headtxt: {
    color: Constants.black,
    fontFamily: FONTS.Medium,
    fontSize: 20,
    textAlign: 'center',
  },
  inputfield: {
    color: Constants.black,
    fontSize: 16,
    fontFamily: FONTS.Medium,
    flex: 1,
  },
  inpucov: {
    backgroundColor: Constants.customgrey4,
    marginVertical: 10,
    borderRadius: 15,
    height: 50,
    paddingHorizontal: 10,
    flexDirection: 'row',
    // justifyContent:'center',
    alignItems: 'center',
  },
  logimbtn: {
    color: Constants.white,
    backgroundColor: Constants.dark_green,
    fontSize: 16,
    fontFamily: FONTS.SemiBold,
    textAlign: 'center',
    paddingVertical: 10,
    borderRadius: 15,
    paddingHorizontal: 25,
    boxShadow: '0 3 10 0.08 grey',
  },
  popupcross: {
    alignSelf: 'flex-end',
    marginRight: 15,
    // marginTop: -5,
    // marginBottom: 20,
  },
  actionbg: {
    alignItems: 'center',
    marginVertical: 30,
    marginHorizontal: 20,
  },
  cros: {
    alignSelf: 'flex-end',
    height: 20,
    width: 20,
  },
  box2: {
    paddingHorizontal: 20,
    paddingVertical: 1,
    backgroundColor: Constants.white,
    alignItems: 'center',
  },
  rowbetw2: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  deltxt: {
    fontSize: 14,
    color: Constants.customgrey2,
    fontFamily: FONTS.SemiBold,
  },
  deltxt2: {
    fontSize: 14,
    color: Constants.black,
    fontFamily: FONTS.SemiBold,
  },
  btmbox: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 15,
    marginTop: 20,
    width: Dimensions.get('window').width - 40,
  },

  tiptxt1: {
    fontSize: 16,
    color: Constants.customgrey,
    fontFamily: FONTS.Medium,
  },
  tiptxt2: {
    fontSize: 14,
    color: Constants.customgrey,
    fontFamily: FONTS.Regular,
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
  tipamt2: {
    borderWidth: 1.5,
    borderColor: Constants.normal_green,
    borderRadius: 10,
    paddingHorizontal: 23,
    marginLeft: 10,
    flexDirection: 'row',
  },
  box1sta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
    borderWidth: 1,
    borderColor: Constants.customgrey2,
    borderRadius: 10,
    padding: 10,
  },
});
