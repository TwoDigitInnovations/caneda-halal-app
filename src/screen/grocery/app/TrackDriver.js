import {
  Animated,
  Easing,
  Image,
  Linking,
  Platform,
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
  useMemo,
  useRef,
  useState,
} from 'react';
import Constants, {Currency, FONTS, Googlekey} from '../../../Assets/Helpers/constant';
import MapView, {
  Circle,
  Marker,
  Polygon,
  Polyline,
  PROVIDER_GOOGLE,
} from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import {goBack, navigate} from '../../../../navigationRef';
import {useIsFocused} from '@react-navigation/native';
import {LoadContext, ToastContext} from '../../../../App';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';
import {mapStyle} from '../../../Assets/Helpers/mapStyle';
import {
  BackIcon,
  CallIcon,
  CookIcon,
  DeliveredIcon,
  DoneIcon,
  InvoiceIcon,
  OrderIcon,
  RightArrow,
  WorkIcon,
} from '../../../../Theme';
import {GetApi} from '../../../Assets/Helpers/Service';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import RNBlobUtil from 'react-native-blob-util';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TrackGrocery = props => {
  const data = props?.route?.params;
  const { t } = useTranslation();
  const [loading, setLoading] = useContext(LoadContext);
  const [toast, setToast] = useContext(ToastContext);
  const [location, setlocation] = useState(null);
  const [duration, setduration] = useState(null);
  const [driverlocation, setdriverlocation] = useState(null);
  const [destination, setdestination] = useState(null);
  const [orderdetail, setorderdetail] = useState();
  const mapRef = useRef(null);

  useEffect(() => {
    Orderbyid();
  }, []);

  const Orderbyid = () => {
    setLoading(true);
    GetApi(`getgroceryorderbyid/${data}`, {}).then(
      async res => {
        setLoading(false);
        console.log(res);
        setorderdetail(res.data);
        if (res?.data?.status === 'Assign') {
          setdriverlocation({
  latitude: Number(res?.data?.driver_profile?.current_location?.coordinates?.[1] 
                ?? res?.data?.driver_profile?.location?.coordinates?.[1]),
  longitude: Number(res?.data?.driver_profile?.current_location?.coordinates?.[0] 
                 ?? res?.data?.driver_profile?.location?.coordinates?.[0]),
  latitudeDelta: 0.015,
  longitudeDelta: 0.0121,
});
        }
        setdestination({
          latitude: Number(res?.data?.seller_profile?.location?.coordinates[1]),
          longitude: Number(
            res?.data?.seller_profile?.location?.coordinates[0],
          ),
          latitudeDelta: 0.015,
          longitudeDelta: 0.0121,
        });
        setlocation({
          latitude: Number(
            res?.data?.shipping_address?.location?.coordinates[1],
          ),
          longitude: Number(
            res?.data?.shipping_address?.location?.coordinates[0],
          ),
          latitudeDelta: 0.015,
          longitudeDelta: 0.0121,
        });
      },
      err => {
        setLoading(false);
        console.log(err);
      },
    );
  };
  function getEstimatedTimeRange(createdAt, minMinutes, maxMinutes) {
    const orderTime = moment(createdAt);
    const min = orderTime.clone().add(minMinutes, 'minutes');
    const max = orderTime.clone().add(maxMinutes, 'minutes');

    return `${min.format('h:mm A')} - ${max.format('h:mm A')}`;
  }
  const animatedValue = new Animated.Value(0);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
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
  const [directionsReady, setDirectionsReady] = useState(false);

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
      }).fetch('GET', `https://api.chmp.world/v1/api/generateInvoice?orderId=${data}&orderType=grocery&lang=${x}`);
  
      setLoading(false);
      setToast("Invoice downloaded successfully")
      console.log('Invoice downloaded:', res.path());
      
    } catch (error) {
      setLoading(false);
      console.error('Error downloading invoice:', error);
    }
  };

  useEffect(() => {
    if (
      location?.latitude &&
      location?.longitude &&
      destination?.latitude &&
      destination?.longitude
    ) {
      setDirectionsReady(true);
    }
  }, [location, destination]);
  const PackageIcon = () => {
    return (
      <TouchableOpacity style={{height: 30, width: 30, position: 'relative'}}>
        {/* <View style={[styles.startMarkerView, {borderColor: Constants.red}]}> */}
        <View
          style={[
            styles.startMarkerView,
            {overflow: 'hidden', borderColor: Constants.customblue},
          ]}>
          <Image
            // source={require('../../Assets/Images/proimg2.png')}
            source={require('../../../Assets/Images/marker1.png')}
            style={{height: 40, width: 40, objectFit: 'contain'}}
          />
        </View>
      </TouchableOpacity>
    );
  };
  const PackageIcon2 = () => {
    return (
      <TouchableOpacity style={{height: 30, width: 30, position: 'relative'}}>
        {/* <View style={[styles.startMarkerView, {borderColor: Constants.red}]}> */}
        <View
          style={[
            styles.startMarkerView,
            {overflow: 'hidden', borderColor: Constants.customblue},
          ]}>
          <Image
            // source={require('../../Assets/Images/proimg2.png')}
            source={require('../../../Assets/Images/marker2.png')}
            style={{height: 40, width: 40, objectFit: 'contain'}}
          />
        </View>
      </TouchableOpacity>
    );
  };
  const PackageIcon3 = () => {
    return (
      <TouchableOpacity style={{height: 30, width: 30, position: 'relative'}}>
        {/* <View style={[styles.startMarkerView, {borderColor: Constants.red}]}> */}
        <View
          style={[
            styles.startMarkerView,
            {overflow: 'hidden', borderColor: Constants.customblue},
          ]}>
          <Image
            // source={require('../../Assets/Images/proimg2.png')}
            source={require('../../../Assets/Images/bike3.png')}
            style={{height: 40, width: 40, objectFit: 'contain'}}
          />
        </View>
      </TouchableOpacity>
    );
  };

  console.log('lat', location?.latitude);
  console.log('long', location?.longitude);
  console.log('driverlat', driverlocation?.latitude);
  console.log('driverlong', driverlocation?.longitude);
  console.log('desti', destination?.latitude);
  console.log('desti', destination?.longitude);
  const Mapcom = useCallback(() => {
    return (
      <MapView
        ref={mapRef}
        // key={location}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        customMapStyle={mapStyle}
        // initialRegion={location}
        // region={location}
        showsUserLocation={true}>
        {location?.latitude && (
          <Marker
            zIndex={8}
            draggable={false}
            coordinate={{
              latitude: location?.latitude,
              longitude: location?.longitude,
            }}
            anchor={{x: 0.5, y: 0.5}}>
            <PackageIcon />
          </Marker>
        )}
        {destination?.latitude && (
          <Marker
            zIndex={8}
            draggable={false}
            coordinate={{
              latitude: destination?.latitude,
              longitude: destination?.longitude,
            }}
            anchor={{x: 0.5, y: 0.5}}>
            <PackageIcon2 />
          </Marker>
        )}
        {driverlocation?.latitude && (
          <Marker
            zIndex={8}
            draggable={false}
            coordinate={{
              latitude: driverlocation?.latitude,
              longitude: driverlocation?.longitude,
            }}
            anchor={{x: 0.5, y: 0.5}}>
            <PackageIcon3 />
          </Marker>
        )}
        {driverlocation?.latitude && (
          <MapViewDirections
            origin={{
              latitude: driverlocation.latitude,
              longitude: driverlocation.longitude,
            }}
            destination={{
              latitude: destination.latitude,
              longitude: destination.longitude,
            }}
            // onReady={result => {
            //   const edgePadding = {
            //     top: 100,
            //     right: 50,
            //     bottom: 100,
            //     left: 50,
            //   };
            //   console.log('result', result);

            //     mapRef.current.fitToCoordinates(result.coordinates, {
            //       edgePadding,
            //       animated: true,
            //     });
            //     setRouteCoordinates(result.coordinates);
            //   }
            // }
            onError={errorMessage => {
              console.log('GOT AN ERROR', errorMessage);
            }}
            apikey={Googlekey}
            strokeWidth={5}
            strokeColor={Constants?.normal_green}
            // strokeColors={Constants?.normal_green}
            optimizeWaypoints={true}
          />
        )}
        {directionsReady && (
          <MapViewDirections
            origin={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            destination={{
              latitude: driverlocation?.latitude
                ? driverlocation.latitude
                : destination.latitude,
              longitude: driverlocation?.longitude
                ? driverlocation.longitude
                : destination.longitude,
            }}
            onReady={result => {
              const edgePadding = {
                top: 100,
                right: 50,
                bottom: 100,
                left: 50,
              };
              console.log('result', result);

              mapRef.current.fitToCoordinates(result.coordinates, {
                edgePadding,
                animated: true,
              });
              setRouteCoordinates(result.coordinates);
            }}
            onError={errorMessage => {
              console.log('GOT AN ERROR', errorMessage);
            }}
            apikey={Googlekey}
            strokeWidth={5}
            strokeColor={
              driverlocation?.latitude
                ? Constants.customgrey2
                : Constants?.normal_green
            }
            // strokeColors={Constants?.normal_green}
            optimizeWaypoints={true}
          />
        )}
      </MapView>
    );
  }, [directionsReady]);
  const snapPoints = useMemo(() => ['30%', '35%', '45%', '40%', '50%'], []);
  return (
    <SafeAreaView style={styles.container}>
      <GestureHandlerRootView style={{flex: 1}}>
        <View style={styles.mapcov}>
          {location?.latitude && destination?.latitude && <Mapcom />}
          <TouchableOpacity
                    style={{
                      position: 'absolute',
                      top: 20,
                      left: 20,
                      height: 30,
                      width: 30,
                      justifyContent:'center',
                      alignItems: 'center',
                      backgroundColor:Constants.white,
                      borderRadius: 30,
                      boxShadow: '0px 2px 5px 0.08px grey',
                    }}
                    onPress={() => {
                      goBack()
                    }
                    }>
                    <BackIcon color={Constants.black}/>
                  </TouchableOpacity>
        </View>

        <BottomSheet
          // ref={bottomSheetRef}
          // style={{paddingHorizontal: 20}}
          snapPoints={snapPoints}
          index={0}
          backgroundStyle={{
            backgroundColor: Constants.black,
          }}
          handleIndicatorStyle={{
            width: 60,
            height: 4,
            backgroundColor: '#ccc',
            borderRadius: 4,
          }}
          onChange={e => console.log(e)}>
          <BottomSheetView style={styles.contentContainer}>
            {orderdetail?.status != 'Delivered' && (
              <View style={styles.toppart}>
                <View
                  style={{flexDirection: 'row', gap: 10, alignItems: 'center'}}>
                  {orderdetail?.driver_profile?._id ? (
                    <Image
                      source={
                        orderdetail?.driver_profile?.image
                          ? {
                              uri: `${orderdetail?.driver_profile?.image}`,
                            }
                          : require('../../../Assets/Images/profile4.png')
                      }
                      style={styles.imgst}
                    />
                  ) : (
                    <Image
                      source={
                        orderdetail?.seller_profile?.image
                          ? {
                              uri: `${orderdetail?.seller_profile?.image}`,
                            }
                          : require('../../../Assets/Images/profile4.png')
                      }
                      style={styles.imgst}
                    />
                  )}
                  <Text style={styles.nametxt}>
                    {orderdetail?.driver_id
                      ? orderdetail?.driver_profile?.username
                      : orderdetail?.seller_profile?.username}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.iconcov}
                  onPress={() =>
                    Linking.openURL(
                      `tel:${
                        orderdetail?.driver_profile?._id
                          ? orderdetail?.driver_profile?.phone
                          : orderdetail?.seller_profile?.phone
                      }`,
                    )
                  }>
                  <CallIcon color={Constants.white} height={20} width={20} />
                </TouchableOpacity>
              </View>
            )}
            <View style={styles.bottompart}>
              <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                <View>
                  <Text style={styles.btmheadtxt}>{t("Your Delivery Time")}</Text>
                  {orderdetail?.status != 'Delivered' && (
                    <Text style={styles.btmheadtxt2}>
                      {t("Estimated")}{' '}
                      {orderdetail?.scheduledelivery?orderdetail?.scheduletimeslot:getEstimatedTimeRange(orderdetail?.createdAt, 30, 45)}
                    </Text>
                  )}
                </View>
                {orderdetail?.selfpickup && orderdetail?.status !== 'Delivered' && (
                  <View style={{flexDirection: 'row', alignSelf: 'center'}}>
                    <Text style={styles.carname}>{t("Pin")} : </Text>
                    <Text style={styles.pincov}>{orderdetail?.pickupOTP} </Text>
                  </View>
                )}
              </View>
              <View style={styles.statuscov}>
                <WorkIcon height={25} width={25} color={Constants.dark_green} />
                <View
                  style={[
                    styles.line,
                    {
                      borderColor:
                        orderdetail?.status != 'Pending'
                          ? Constants.dark_green
                          : Constants.customgrey2,
                    },
                  ]}></View>
                <OrderIcon
                  height={25}
                  width={25}
                  color={
                    orderdetail?.status != 'Pending'
                      ? Constants.dark_green
                      : Constants.customgrey2
                  }
                />
                <View
                  style={[
                    styles.line,
                    {
                      borderColor: orderdetail?.driver_id
                        ? Constants.dark_green
                        : Constants.customgrey2,
                    },
                  ]}></View>
                <DeliveredIcon
                  height={25}
                  width={25}
                  color={
                    orderdetail?.driver_id
                      ? Constants.dark_green
                      : Constants.customgrey2
                  }
                />
                <View
                  style={[
                    styles.line,
                    {
                      borderColor:
                        orderdetail?.status === 'Delivered'
                          ? Constants.dark_green
                          : Constants.customgrey2,
                    },
                  ]}></View>
                <DoneIcon
                  height={25}
                  width={25}
                  color={
                    orderdetail?.status === 'Delivered'
                      ? Constants.dark_green
                      : Constants.customgrey2
                  }
                />
              </View>
              <Text style={styles.btmheadtxt}>{t("Order")}</Text>
              {orderdetail?.productDetail &&
                orderdetail?.productDetail?.length > 0 &&
                orderdetail?.productDetail.map((it, index) => (
                  <View
                    key={index}
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      marginVertical: 5,
                    }}>
                    <Text style={styles.foodtxt}>
                      {it?.qty} {it?.grocery_name}
                    </Text>
                    <Text style={styles.foodtxt}>{Currency}{it?.price}</Text>
                  </View>
                ))}
                {orderdetail?.status==='Delivered'&&<TouchableOpacity style={styles.invcov} onPress={()=>getinvoice()}>
                <View style={{flexDirection: 'row', gap: 15}}>
                  <InvoiceIcon
                    height={23}
                    width={23}
                    color={Constants.customblue}
                  />
                  <Text style={styles.invtxt}>{t("Download Invoice")}</Text>
                </View>
                <RightArrow
                  color={Constants.black}
                  height={15}
                  width={15}
                  style={styles.aliself}
                />
              </TouchableOpacity>}
            </View>
          </BottomSheetView>
        </BottomSheet>
      </GestureHandlerRootView>
    </SafeAreaView>
  );
};

export default TrackGrocery;

const styles = StyleSheet.create({
  mapcov: {
    // flex: 1,
    // position: 'absolute',
    // top: 0,
    // left: 0,
    // right: 0,
    height: '70%', // only 70% height visible
    // zIndex: 0,
  },
  map: {
    // flex: 1,
    // position: 'absolute',
    // top: 0,
    // left: 0,
    // right: 0,
    height: '100%', // only 70% height visible
    // zIndex: 0,
  },
  container: {
    flex: 1,
    backgroundColor: Constants.white,
  },
  btncov: {
    backgroundColor: Constants.custom_green,
    height: 50,
    width: 50,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    // position:'absolute',
    // bottom:100,
    // right:50,
    marginTop: 10,
    marginBottom: 20,
    alignSelf: 'flex-end',
  },
  toppart: {
    backgroundColor: Constants.white,
    height: 60,
    borderRadius: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    marginBottom: 10,
    marginHorizontal: 15,
  },
  imgst: {
    height: 40,
    width: 40,
    borderRadius: 40,
  },
  iconcov: {
    height: 40,
    width: 40,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Constants.normal_green,
  },
  nametxt: {
    color: Constants.black,
    fontFamily: FONTS.Medium,
    fontSize: 16,
  },
  bottompart: {
    backgroundColor: Constants.white,
    padding: 20,
    // height: '100%',
  },
  btmheadtxt: {
    color: Constants.black,
    fontFamily: FONTS.SemiBold,
    fontSize: 14,
  },
  btmheadtxt2: {
    color: Constants.customgrey2,
    fontFamily: FONTS.Medium,
    fontSize: 12,
  },
  line: {
    borderTopWidth: 1,
    borderColor: Constants.normal_green,
    width: '18%',
    borderStyle: 'dashed',
    marginHorizontal: 5,
  },
  statuscov: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: 10,
  },
  foodtxt: {
    color: Constants.customgrey2,
    fontFamily: FONTS.Medium,
    fontSize: 14,
  },
  carname: {
    color: Constants.black,
    fontFamily: Constants.font300,
    fontSize: 14,
  },
  pincov: {
    backgroundColor: Constants.normal_green,
    color: Constants.white,
    fontFamily: Constants.SemiBold,
    fontSize: 12,
    paddingHorizontal: 12,
    borderRadius: 3,
    paddingVertical: 3,
    textAlign: 'center',
    alignSelf: 'center',
  },
  invcov: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    boxShadow: '0px 2px 5px 0.03px grey',
    padding: 15,
    borderRadius: 6,
    marginTop: 10,
  },
  invtxt: {
    color: Constants.black,
    fontFamily: FONTS.Medium,
    fontSize: 14,
  },
});
