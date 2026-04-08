import {
  Animated,
  Easing,
  Image,
  Linking,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useContext, useEffect, useRef, useState} from 'react';
import Constants, {Currency, FONTS, Googlekey} from '../../../Assets/Helpers/constant';
import {LoadContext, ToastContext, UserContext} from '../../../../App';
import {GetApi, Post} from '../../../Assets/Helpers/Service';
import moment from 'moment';
import {goBack, navigate} from '../../../../navigationRef';
import {CallIcon} from '../../../../Theme';
import DriverHeader from '../../../Assets/Component/DriverHeader';
import { useTranslation } from 'react-i18next';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { mapStyle } from '../../../Assets/Helpers/mapStyle';
import MapViewDirections from 'react-native-maps-directions';

const DriverRideDetail = props => {
  const rideid = props.route.params;
  const { t } = useTranslation();
  console.log(rideid);
  const mapRef = useRef(null);
  const [loading, setLoading] = useContext(LoadContext);
  const [toast, setToast] = useContext(ToastContext);
  const [user, setUser] = useContext(UserContext);
  const [ridedetails, setridedetails] = useState();
  const [acceptmodel, setacceptmodel] = useState(false);
  const [ridetype, setridetype] = useState();
  const [orderid, setorderid] = useState('');

  useEffect(() => {
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
      },
      err => {
        setLoading(false);
        console.log(err);
      },
    );
  };
const stopwaypoint = ridedetails?.stops
  ?.filter(item => Array.isArray(item?.location?.coordinates) && item?.location?.coordinates.length === 2)
  ?.map(item => ({
    latitude: item.location.coordinates[1], // [lng, lat] → lat
    longitude: item.location.coordinates[0], // [lng, lat] → lng
  }));

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
  const Acceptride = id => {
    setLoading(true);
    GetApi(`acceptRide/${id}`, {}).then(
      async res => {
        setLoading(false);
        console.log(res);
        if (res?.status) {
          goBack();
        } else {
          if (res?.message) {
            setToast(res?.message);
          }
        }
      },
      err => {
        setLoading(false);
        console.log(err);
      },
    );
  };
  const Rejectride = id => {
    setLoading(true);
    GetApi(`rejectRide/${id}`, {}).then(
      async res => {
        setLoading(false);
        console.log(res);
        if (res?.status) {
          goBack();
        } else {
          if (res?.message) {
            setToast(res?.message);
          }
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
  return (
    <SafeAreaView style={styles.container}>
      <DriverHeader item={t('Ride Detail')} showback={true} />
      <View style={{height: '45%'}}>
       {ridedetails?.src?.coordinates.length > 0 &&  <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE} // remove if not using Google Maps
          style={styles.map}
          customMapStyle={mapStyle}
          region={{
              latitude: ridedetails?.src?.coordinates[1],
              longitude: ridedetails?.src?.coordinates[0],
              latitudeDelta: 0.015,
              longitudeDelta: 0.0121,
            }}
          showsUserLocation={true}>
          {ridedetails?.dest?.coordinates.length > 0 && (
            <Marker
              coordinate={{
                latitude: ridedetails?.dest?.coordinates[1],
                longitude: ridedetails?.dest?.coordinates[0],
              }}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View style={styles.customMarker}>
                <View style={styles.innerCircle} />
              </View>
            </Marker>
          )}
          {ridedetails?.src?.coordinates.length > 0 && <Marker
            coordinate={{
              latitude: ridedetails?.src?.coordinates[1],
              longitude: ridedetails?.src?.coordinates[0],
            }}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.customMarker}>
                <View style={styles.innerCircle} />
              </View>
              </Marker>}
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
          {ridedetails?.src?.coordinates.length > 0 && ridedetails?.dest?.coordinates.length > 0 && (
            <MapViewDirections
            origin={{
              latitude: ridedetails?.src?.coordinates[1],
              longitude: ridedetails?.src?.coordinates[0],
            }}
            destination={{
              latitude: ridedetails?.dest?.coordinates[1],
              longitude: ridedetails?.dest?.coordinates[0],
            }}
            waypoints={stopwaypoint?.length > 0 ? stopwaypoint : []}
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
              strokeWidth={4}
              strokeColor="#00bfff"
              optimizeWaypoints={true}
            />
          )}
        </MapView>}
      </View>
      {ridedetails&&
        <View>
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

          <View style={styles.drivercov}>
            <View style={styles.pasdetail}>
              <Image
                source={
                  ridedetails?.user_profile?.image
                    ? {
                        uri: `${ridedetails?.user_profile?.image}`,
                      }
                    : require('../../../Assets/Images/profile.png')
                }
                style={{height: 50, width: 50, borderRadius: 50}}
              />
              <View>
                <Text style={styles.drivername}>
                  {ridedetails?.user_profile?.username}
                </Text>
              </View>
            </View>
            <Text style={styles.passengertxt}>{ridedetails?.ride_mode==='pool'?t('Pool Ride'):`${Currency}${ridedetails?.final_price?ridedetails?.final_price:ridedetails?.price}`}</Text>
          </View>
          </View>
      }
          {ridedetails?.driver_id ? (
            <TouchableOpacity
              style={styles.contactopt}
              onPress={() =>
                Linking.openURL(`tel:${ridedetails?.user?.phone}`)
              }>
              <CallIcon color={Constants.dark_green} height={20} width={20} />
              <Text style={styles.othrttxt2}>
                {t("Contact")} {ridedetails?.user_profile?.username}
              </Text>
            </TouchableOpacity>
          ) : (
            <View
              style={{
                flexDirection: 'row',
                gap: 15,
                marginHorizontal: 20,
                marginVertical:20
              }}>
              <TouchableOpacity
                style={styles.acceptButtonStyle}
                onPress={() => {
                  setacceptmodel(true),
                    setorderid(ridedetails?._id),
                    setridetype('reject');
                }}>
                <Text style={styles.modalText}>{t("Reject Ride")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.acceptButtonStyle}
                onPress={() => {
                  setacceptmodel(true),
                    setorderid(ridedetails?._id),
                    setridetype('accept');
                }}>
                <Text style={styles.modalText}>{t("Accept Ride")}</Text>
              </TouchableOpacity>
            </View>
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
            <Text style={styles.alrt}>{t("Alert !")}</Text>
            <View
              style={{
                backgroundColor: 'white',
                alignItems: 'center',
                paddingHorizontal: 30,
              }}>
              <Text style={styles.textStyle}>
                {t('confirmRideAction', {
                  action: ridetype === 'accept' ? t('Accept') : t('Reject'),
                })}
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
                    {t("No")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.9}
                  style={styles.logOutButtonStyle}
                  onPress={() => {
                    ridetype === 'accept'
                      ? Acceptride(orderid)
                      : Rejectride(orderid),
                      setacceptmodel(false);
                  }}>
                  <Text style={styles.modalText}>{t("Yes")}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default DriverRideDetail;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Constants.white,
    flex: 1,
    // padding: 20,
  },
  map: {
    flex: 1,
  },
  datetxt: {
    fontSize: 24,
    color: Constants.black,
    fontFamily: FONTS.SemiBold,
    marginVertical: 10,
    marginHorizontal: 20,
  },
  passengertxt: {
    fontSize: 16,
    color: Constants.black,
    fontFamily: FONTS.SemiBold,
    // marginVertical: 10,
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
    height: 6,
    backgroundColor: Constants.dark_green,
    // width: '120%',
    // marginLeft: -20,
    marginVertical: 20,
  },
  pricecov: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  drivername: {
    color: Constants.black,
    fontSize: 16,
    fontFamily: FONTS.Medium,
  },
  srcdest: {
    color: Constants.black,
    fontSize: 16,
    fontFamily: FONTS.Medium,
    width: '37%',
  },
  startcov: {
    flexDirection: 'row',
    // justifyContent: 'space-between',
    gap: 10,
    alignItems: 'center',
  },
  drivercov: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  passengerscov: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20,
    // marginRight:10
  },
  pasdetail: {
    flexDirection: 'row',
    gap: 15,
    alignItems: 'center',
  },
  pasdetail2: {
    flexDirection: 'row',
    // gap: 15,
    width: '95%',
  },
  othercov: {
    flexDirection: 'row',
    marginVertical: 12,
    gap: 20,
    alignItems: 'center',
  },
  othrttxt: {
    color: Constants.black,
    fontSize: 16,
    fontFamily: FONTS.Medium,
    flex: 1,
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
    height: 60,
    width: '70%',
    justifyContent: 'center',
    // flex:1,
    alignItems: 'center',
    alignSelf: 'center',
    gap: 15,
    // marginTop:100
    position: 'absolute',
    bottom: 100,
  },
  ////model
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
  acceptButtonStyle: {
    flex: 1,
    backgroundColor: Constants.dark_green,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    // marginLeft: 10,
    boxShadow: '0 3 10 0.05 grey',
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
