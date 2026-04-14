import {
  Animated,
  Easing,
  Image,
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
import React, { useContext, useEffect, useRef, useState } from 'react';
import MapView, {
  Marker,
  Polygon,
  Polyline,
  PROVIDER_GOOGLE,
} from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import {
  request,
  PERMISSIONS,
  requestLocationAccuracy,
} from 'react-native-permissions';
import MapViewDirections from 'react-native-maps-directions';
import Constants, { Currency, FONTS, Googlekey } from '../../Assets/Helpers/constant';
import moment from 'moment';
import { goBack, navigate } from '../../../navigationRef';
import { DeliveryRiderContext, LoadContext, ToastContext } from '../../../App';
import { GetApi, Post } from '../../Assets/Helpers/Service';
import { CheckboxactiveIcon } from '../../../Theme';
import DriverHeader from '../../Assets/Component/DriverHeader';
import { useTranslation } from 'react-i18next';

const Map = props => {
  const { t } = useTranslation();
  const data = props?.route?.params?.orderid;
  const locationtpye = props?.route?.params?.type;
  const orderType = props?.route?.params?.orderType;
  console.log('orderType', orderType,data,locationtpye);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalVisible2, setModalVisible2] = useState(false);
  const [modalVisible5, setModalVisible5] = useState(false);
  const [modalVisible4, setModalVisible4] = useState(false);
  const [modalVisible3, setModalVisible3] = useState(false);
  const [toast, setToast] = useContext(ToastContext);
  const [loading, setLoading] = useContext(LoadContext);
  const [deliveryriderProfile, setdeliveryriderProfile] = useContext(DeliveryRiderContext)
  const [from, setFrom] = useState('');
  const [location, setlocation] = useState(null);
  const [destination, setdestination] = useState(null);
  const [locationadd, setlocationadd] = useState(null);
  const [destinationadd, setdestinationadd] = useState(null);
  const [per, setper] = useState(null);
  const [orderdetail, setorderdetail] = useState();

  const mapRef = useRef(null);
  const animatedValue = new Animated.Value(0);
  const [routeCoordinates, setRouteCoordinates] = useState([]);

  useEffect(() => {
    {
      data && MyOrders();
    }
    CustomCurrentLocation();
  }, [data]);

  const CustomCurrentLocation = async () => {
    try {
      if (Platform.OS === 'ios') {
        request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE).then(result => {
          console.log(result);
          if (result === 'granted') {
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
                console.log(error.code, error.message);
                //   return error;
              },
              { enableHighAccuracy: false, timeout: 30000, maximumAge: 60000 },
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
              setlocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                latitudeDelta: 0.015,
                longitudeDelta: 0.0121,
              });
            },
            error => {
              console.log(error.code, error.message);
              //   return error;
            },
            { enableHighAccuracy: false, timeout: 30000, maximumAge: 60000 },
          );
        } else {
          console.log('location permission denied');
        }
      }
    } catch (err) {
      console.log('location err =====>', err);
    }
  };

  console.log(destination);
  const MyOrders = () => {
    let url;
    if (orderType==='Food') {
      url=`getfoodorderbyid/${data}`
    }
     else if (orderType==='Shopping') {
      url=`getshoppingorderbyid/${data}`
    } else {
      url=`getgroceryorderbyid/${data}`
    }
    setLoading(true);
    GetApi(url,).then(
      async res => {
        setLoading(false);
        console.log(res);
        setorderdetail(res.data);
        if (locationtpye === 'shop') {
          setdestination({
            latitude: Number(res?.data?.seller_profile?.location?.coordinates[1]),
            longitude: Number(res?.data?.seller_profile?.location?.coordinates[0]),
            latitudeDelta: 0.015,
            longitudeDelta: 0.0121,
          });
        } else {
          setdestination({
            latitude: Number(res?.data?.shipping_address?.location?.coordinates[1]),
            longitude: Number(res?.data?.shipping_address?.location?.coordinates[0]),
            latitudeDelta: 0.015,
            longitudeDelta: 0.0121,
          });
        }
      },
      err => {
        setLoading(false);
        console.log(err);
      },
    );
  };
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
  const collectorder = id => {
    const body = {
      id: id,
      status: 'Collected',
    };
    let url;
    if (orderType==='Food') {
      url=`changefoodorderstatus`
    }
    else if (orderType==='Shopping') {
      url=`changeshoppingorderstatus`
    }
     else {
      url=`changegroceryorderstatus`
    }
    setLoading(true);
    Post(url, body).then(
      async res => {
        setLoading(false);
        console.log(res);
        if (res.status) {
          MyOrders();
        }
      },
      err => {
        setLoading(false);
        console.log(err);
      },
    );
  };

  const collectcash = id => {
    const body = {
      id: id,
    };
    setLoading(true);
    Post(`cashcollected`, body).then(
      async res => {
        setLoading(false);
        console.log(res);
        if (res.status) {
          MyOrders();
        }
      },
      err => {
        setLoading(false);
        console.log(err);
      },
    );
  };

  const deliverorder = id => {
    const body = {
      id: id,
      status: 'Delivered',
    };
     let url;
    if (orderType==='Food') {
      url=`changefoodorderstatus`
    } 
    else if (orderType==='Shopping') {
      url=`changeshoppingorderstatus`
    }else {
      url=`changegroceryorderstatus`
    }
    setLoading(true);
    Post(url, body).then(
      async res => {
        setLoading(false);
        console.log(res);
        if (res.status) {
          MyOrders();
          getProfile()
        }
      },
      err => {
        setLoading(false);
        console.log(err);
      },
    );
  };
  const getProfile = () => {
      setLoading(true);
      GetApi(`getProfile/DELIVERYRIDER`, {}).then(
        async res => {
          setLoading(false);
          setdeliveryriderProfile(res?.data)
        },
        err => {
          setLoading(false);
          console.log(err);
        },
      );
    };
  const onthewaytodelivery = id => {
    setLoading(true);
    GetApi(`onthewaytodelivery/${id}`).then(
      async res => {
        setLoading(false);
        console.log(res);
        if (res.status) {
          MyOrders();
        }
      },
      err => {
        setLoading(false);
        console.log(err);
      },
    );
  };

  const Acceptorder = id => {
     let url;
    if (orderType==='Food') {
      url=`acceptfoodorder/${id}`
    }
    else if (orderType==='Shopping') {
      url=`acceptshoppingorder/${id}`
    } else {
      url=`acceptgroceryorder/${id}`
    }
    setLoading(true);
    GetApi(url,).then(
      async res => {
        setLoading(false);
        console.log(res);
        if (res?.status) {
          MyOrders();
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
  // console.log('locationadd', locationadd);
  return (
    <SafeAreaView style={styles.container}>
      <DriverHeader item='Order Details' showback={true} />
      {/* <Image
        source={require('../../Assets/Images/mapimg.png')}
        style={[styles.map, {width: '100%'}]}
      /> */}
      <View style={{ flex: 1 }}>
        {location?.latitude && (
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE} // remove if not using Google Maps
            style={styles.map}
            //  initialRegion={{
            //    latitude: 37.78825,
            //    longitude: -122.4324,
            //    latitudeDelta: 0.015,
            //    longitudeDelta: 0.0121,
            //  }}
            initialRegion={location}
            region={location}
            showsUserLocation={true}>
            {destination?.latitude && (
              <Marker
                coordinate={destination}
                title={'Destination'}
                pinColor="red"
              // image={require('../../Assets/Images/Start.png')}
              />
            )}
            <Marker
              coordinate={location}
              title={'Sourse'}
              pinColor={'#C68E27'}
            />
            {location && destination && (
              <MapViewDirections
                origin={location}
                destination={destination}
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
                  setRouteCoordinates(result.coordinates);
                }}
                apikey={Googlekey}
                strokeWidth={3}
                strokeColor={Constants.customblue}
                optimizeWaypoints={true}
              />
            )}
          </MapView>
        )}
      </View>
      <ScrollView
        style={{ flex: 1, }}
        showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.box}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row' }}>
              <Image
                // source={require('../../Assets/Images/profile4.png')}
                source={
                  orderdetail?.user_profile?.image
                    ? {
                      uri: `${orderdetail?.user_profile?.image}`,
                    }
                    : require('../../Assets/Images/profile.png')
                }
                style={styles.hi}
              // onPress={()=>navigate('Account')}
              />
              <View>
                <Text style={styles.name}>
                  {locationtpye === 'shop'
                    ? orderdetail?.seller_profile.username
                    : orderdetail?.user_profile?.username}
                </Text>
                <Text style={styles.redeembtn}>
                  {moment(orderdetail?.created_at).format('DD-MM-YYYY hh:mm A')}
                </Text>
              </View>

              {/* <View style={styles.statuscov}>
                <Text style={styles.status}>Delivered</Text>
                </View> */}
            </View>
            {locationtpye === 'shop' && <Text style={styles.redeembtn2}>{t("Seller")}</Text>}
          </View>
          
          <View style={styles.secendpart}>

            <Text style={styles.secendboldtxt} >{t("Location")} : </Text>
            <Text style={styles.secendtxt2}>
              {locationtpye === 'shop'
                ? orderdetail?.seller_profile?.address
                : orderdetail?.shipping_address?.address}
            </Text>
          </View>
          {/* <View style={styles.txtcol}>
            <View style={styles.secendpart}>
              <Text style={styles.secendboldtxt}>QTY : </Text>
              <Text style={styles.secendtxt}>{orderdetail?.qty}</Text>
            </View>
          </View> */}
          <View style={styles.txtcol}>
              <View style={styles.secendpart}>

                <Text Style={styles.secendboldtxt} >{t("Qty")} : </Text>
                <Text style={styles.secendtxt}>
                  {orderdetail?.productDetail?.length}
                </Text>
              </View>
            <Text style={styles.amount}>{Currency} {orderdetail?.total_deliverd_amount}</Text>
          </View>
        </TouchableOpacity>
        {orderdetail?.productDetail &&
          orderdetail?.productDetail.length > 0 &&
          orderdetail.productDetail.map((item, index) => (
            <TouchableOpacity style={[styles.inputbox, { marginBottom: index + 1 === orderdetail.productDetail.length && orderdetail?.status != 'Delivered' ? 60 : 10 }]} key={index}>
              <View
                style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row' }}>
                  {item?.image && item.image.length > 0 && (
                    <Image
                      source={{ uri: `${item.image}` }}
                      style={styles.hi2}
                    />
                  )}
                  <View>
                    <Text style={styles.name2}>{item?.food_name?item?.food_name:item?.shopping_name?item?.shopping_name:item?.grocery_name}</Text>
                    {/* <Text style={styles.qty}>{item?.price_slot?.value} {item?.price_slot?.unit}</Text> */}
                  </View>
                </View>
                <CheckboxactiveIcon style={{}} height={20} width={20} />
              </View>
              <View style={[styles.txtcol, { marginVertical: 10 }]}>
                <View style={styles.secendpart}>

                  <Text Style={[styles.secendboldtxt, { color: Constants.dark_green }]} >{t("Qty")} : </Text>
                  <Text style={[styles.secendtxt]}>{item?.qty}</Text>
                </View>
                <Text style={styles.amount}>{Currency} {item?.price}</Text>
              </View>
            </TouchableOpacity>
          ))}
      </ScrollView>
      {/* {orderdetail?.status === 'Collected' && orderdetail?.paymentmode === 'cod' && orderdetail.cashcollected === 'No' && orderdetail?.onthewaytodelivery && (
        <TouchableOpacity
          style={styles.signInbtn}
          onPress={() => setModalVisible3(true)}>
          <Text style={styles.buttontxt}>Cash collected</Text>
        </TouchableOpacity>
      )} */}
      {orderdetail?.status === 'Collected'&& (
        <TouchableOpacity
          style={styles.signInbtn}
          onPress={() => setModalVisible2(true)}>
          <Text style={styles.buttontxt}>{t("Finish Ride")}</Text>
        </TouchableOpacity>
      )}
      {/* {orderdetail?.status === 'Collected' && !orderdetail?.onthewaytodelivery && (
        <TouchableOpacity
          style={styles.signInbtn}
          onPress={() => setModalVisible5(true)}>
          <Text style={styles.buttontxt}>On the way to delivery</Text>
        </TouchableOpacity>
      )} */}
      {orderdetail?.status === 'Ready' && orderdetail.driver_id && (
        <TouchableOpacity
          style={styles.signInbtn}
          onPress={() => setModalVisible(true)}>
          <Text style={styles.buttontxt}>{t("Order Collected")}</Text>
        </TouchableOpacity>
      )}
      {orderdetail?.status === 'Ready' && !orderdetail.driver_id && (
        <TouchableOpacity
          style={styles.signInbtn}
          onPress={() => setModalVisible4(true)}>
          <Text style={styles.buttontxt}>{t("Accept Ride")}</Text>
        </TouchableOpacity>
      )}
      {/* </View> */}
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
            <Text style={styles.alrt}>{t("Alert !")}</Text>
            <View
              style={{
                backgroundColor: 'white',
                alignItems: 'center',
                paddingHorizontal: 30,
              }}>
              <Text style={styles.textStyle}>
                {t("Are you sure you have collected the order !")}
              </Text>
              <View style={styles.cancelAndLogoutButtonWrapStyle}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => setModalVisible(!modalVisible)}
                  style={styles.cancelButtonStyle}>
                  <Text style={[styles.modalText, { color: Constants.normal_green }]}>
                    {t("No")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.9}
                  style={styles.logOutButtonStyle}
                  onPress={() => {
                    collectorder(orderdetail._id), setModalVisible(false);
                  }}>
                  <Text style={styles.modalText}>{t("Yes")}</Text>
                </TouchableOpacity>
              </View>
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
          <View style={styles.modalView}>
            <Text style={styles.alrt}>{t("Alert !")}</Text>
            <View
              style={{
                backgroundColor: 'white',
                alignItems: 'center',
                paddingHorizontal: 30,
              }}>
              <Text style={styles.textStyle}>
                {t("Are you sure you want to finish the ride?")}
              </Text>
              <View style={styles.cancelAndLogoutButtonWrapStyle}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => setModalVisible2(!modalVisible2)}
                  style={styles.cancelButtonStyle}>
                  <Text style={[styles.modalText, { color: Constants.normal_green }]}>
                    {t("No")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.9}
                  style={styles.logOutButtonStyle}
                  onPress={() => {
                    deliverorder(orderdetail._id), setModalVisible2(false);
                  }}>
                  <Text style={styles.modalText}>{t("Yes")}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
      {/* <Modal
        animationType="none"
        transparent={true}
        visible={modalVisible3}
        onRequestClose={() => {
          // Alert.alert('Modal has been closed.');
          setModalVisible3(!modalVisible3);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.alrt}>Alert !</Text>
            <View
              style={{
                backgroundColor: 'white',
                alignItems: 'center',
                paddingHorizontal: 30,
              }}>
              <Text style={styles.textStyle}>
                Are you sure you collected the cash?
              </Text>
              <View style={styles.cancelAndLogoutButtonWrapStyle}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => setModalVisible3(!modalVisible3)}
                  style={styles.cancelButtonStyle}>
                  <Text style={[styles.modalText, { color: Constants.normal_green }]}>
                    No
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.9}
                  style={styles.logOutButtonStyle}
                  onPress={() => {
                    collectcash(orderdetail._id), setModalVisible3(false);
                  }}>
                  <Text style={styles.modalText}>Yes</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal> */}

      <Modal
        animationType="none"
        transparent={true}
        visible={modalVisible4}
        onRequestClose={() => {
          // Alert.alert('Modal has been closed.');
          setModalVisible4(!modalVisible4);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.alrt}>Alert !</Text>
            <View
              style={{
                backgroundColor: 'white',
                alignItems: 'center',
                paddingHorizontal: 30,
              }}>
              <Text style={styles.textStyle}>
                {t("Are you sure you want to Accept this ride to delivery !")}
              </Text>
              <View style={styles.cancelAndLogoutButtonWrapStyle}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => setModalVisible4(!modalVisible4)}
                  style={styles.cancelButtonStyle}>
                  <Text style={[styles.modalText, { color: Constants.normal_green }]}>
                    {t("No")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.9}
                  style={styles.logOutButtonStyle}
                  onPress={() => {
                    setModalVisible4(false);
                    Acceptorder(orderdetail._id);
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

export default Map;

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'f2f2f2',
  },
  box: {
    backgroundColor: Constants.white,
    marginVertical: 5,
    padding: 20,
  },
  hi: {
    marginRight: 10,
    height: 50,
    width: 50,
    borderRadius: 50,
  },
  hi2: {
    marginRight: 10,
    height: 50,
    width: 50,
    // borderRadius: 50,
  },
  redeembtn: {
    color: Constants.normal_green,
    fontSize: 14,
    fontFamily: FONTS.Medium,
    // backgroundColor: Constants.normal_green,
    // paddingHorizontal: 10,
    // paddingVertical: 5,
    // marginVertical: 7,
    // borderRadius: 8,
  },
  redeembtn2: {
    color: Constants.white,
    fontSize: 16,
    fontFamily: FONTS.Medium,
    backgroundColor: Constants.dark_green,
    paddingHorizontal: 10,
    // paddingVertical: 5,
    marginVertical: 7,
    borderRadius: 8,
    height: 25,
    textAlign: 'center',
  },
  name: {
    color: Constants.black,
    fontFamily: FONTS.SemiBold,
    fontSize: 16,
  },
  secendpart: {
    flexDirection: 'row',
    // flex: 1,
    // justifyContent: 'space-between',
    marginLeft: 10,
    // marginVertical: 5,
    alignItems: 'center',
  },
  secendboldtxt: {
    color: Constants.black,
    fontSize: 14,
    fontFamily: FONTS.Bold,
    // alignSelf: 'center',
  },
  secendtxt: {
    color: Constants.black,
    fontSize: 14,
    // textAlign: 'left',
    fontFamily: FONTS.Regular,
    marginTop: 5,
  },
  secendtxt2: {
    color: Constants.black,
    fontSize: 14,
    // textAlign: 'left',
    flex: 1,
    fontFamily: FONTS.Regular,
  },
  txtcol: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // flex: 1,
  },
  amount: {
    color: Constants.normal_green,
    fontSize: 18,
    fontFamily: FONTS.Bold,
    alignSelf: 'flex-end',
  },
  signInbtn: {
    height: 50,
    width: '90%',
    borderRadius: 10,
    backgroundColor: Constants.normal_green,
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
    // marginBottom: 20,
    alignSelf: 'center',
    position: 'absolute',
    bottom: 20
  },
  buttontxt: {
    color: Constants.white,
    fontSize: 16,
    fontFamily: FONTS.SemiBold,
  },
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
    paddingVertical: 20,
    alignItems: 'center',
    width: '90%',
  },

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
    fontFamily: FONTS.Bold,
    fontSize: 14,
  },
  cancelButtonStyle: {
    flex: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    marginRight: 10,
    borderColor: Constants.normal_green,
    borderWidth: 1,
    borderRadius: 10,
  },
  logOutButtonStyle: {
    flex: 0.5,
    backgroundColor: Constants.normal_green,
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  name2: {
    color: Constants.black,
    fontFamily: FONTS.SemiBold,
    fontSize: 14,
    alignSelf: 'center',
  },
  inputbox: {
    backgroundColor: '#F5E9FF',
    color: Constants.custom_black,
    borderRadius: 15,
    marginVertical: 5,
    padding: 15,
  },
});
