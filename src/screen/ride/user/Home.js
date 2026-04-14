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
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useContext, useEffect, useRef, useState } from 'react';
import Constants, { FONTS, Googlekey } from '../../../Assets/Helpers/constant';
import MapView, {
  Marker,
  Polygon,
  Polyline,
  PROVIDER_GOOGLE,
} from 'react-native-maps';
import { navigate } from '../../../../navigationRef';
import { GetApi, Post } from '../../../Assets/Helpers/Service';
import {
  LoadContext,
  ProfileContext,
  ToastContext,
  UserContext,
} from '../../../../App';
import { PERMISSIONS, request } from 'react-native-permissions';
import Geolocation from '@react-native-community/geolocation';
import MapViewDirections from 'react-native-maps-directions';
import LocationAutocomplete from '../../../Assets/Component/LocationAutocomplete';
import {
  CalenderIcon,
  CheckboxactiveIcon,
  CheckboxIcon,
  ClockIcon,
  CrossIcon,
  DateIcon,
  EditIcon,
  HomeIcon,
  LocationIcon,
  MappinIcon,
  MenuIcon,
  Plus2Icon,
  RightArrow,
  SearchIcon,
} from '../../../../Theme';
import GetCurrentAddressByLatLong from '../../../Assets/Component/GetCurrentAddressByLatLong';
import { mapStyle } from '../../../Assets/Helpers/mapStyle';
import { DrawerActions, useIsFocused, useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
let locationFetched = false;

const Home = props => {
  const mapRef = useRef(null);
  const data = props?.route?.params;
  const { t } = useTranslation();
  // const navigation = useNavigation();
  const [profiledata, setprofiledata] = useState();
  const [locationshow, setlocationshow] = useState(false);
  const [destinationshow, setdestinationshow] = useState(false);
  const [toast, setToast] = useContext(ToastContext);
  const [loading, setLoading] = useContext(LoadContext);
  const [user, setUser] = useContext(UserContext);
  const [profile, setProfile] = useContext(ProfileContext);
  const [locationadd, setlocationadd] = useState('');
  const [destinationadd, setdestinationadd] = useState('');
  const [bookfor, setbookfor] = useState(0);
  const [location, setlocation] = useState(null);
  const [firstlocation, setfirstlocation] = useState(false);
  const [destination, setdestination] = useState(null);
  const [stops, setStops] = useState([]);
  const [showlocationlist, setshowlocationlist] = useState(false);
  const [assignmodel, setassignmodel] = useState(false);
  const [showsrcadd, setshowsrcadd] = useState(false);
  const refInput = useRef(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedDate, setSelectedDate] = useState();
  const [selectedTime, setSelectedTime] = useState();
  const [finalshedule, setfinalshedule] = useState(null);
  const [isDatePickerVisible2, setDatePickerVisibility2] = useState(false);

  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowMap(true); // Show map after drawer has mounted
    }, 500); // Adjust delay if needed

    return () => clearTimeout(timeout);
  }, []);

  const isFocused = useIsFocused();

  useEffect(() => {
    if (!isFocused) {
      setDatePickerVisibility(false);
      setDatePickerVisibility2(false);
    }
  }, [isFocused]);

   useEffect(() => {
    if (!locationFetched||!location?.latitude) {
      console.log('enter');
      CustomCurrentLocation();
      locationFetched = true;
    }
  }, []);
  useEffect(() => {
      setlocationadd(data?.locationadd);
      setlocation(data?.location);
      setdestinationadd(data?.destinationadd);
      setdestination(data?.destination);
      setStops(data?.stops)
    }, [data]);
const stopwaypoint = stops
  ?.filter(item => item?.location?.latitude && item?.location?.longitude) // skip empty
  ?.map(item => ({
    latitude: item?.location?.latitude,
    longitude: item?.location?.longitude,
  }));


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
        setProfile(res?.data);
        // if (!res?.data?.username) {
        //   setModalVisible(true);
        // } else {
        // }
      },
      err => {
        setLoading(false);
        console.log(err);
      },
    );
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
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
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
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
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
  const getLocationValue = (lat, add, set) => {
    console.log('lat=======>', lat);
    console.log('add=======>', add);
    if (set === 'start') {
      setlocationadd(add);
      // setlocation([lat.lng, lat.lat]);
      // setlocation({
      //   latitude: lat.lat,
      //   longitude: lat.lng,
      // });
      setlocation({
        latitude: lat.lat,
        longitude: lat.lng,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
      setshowsrcadd(true)
    }
    if (set === 'end') {
      setdestinationadd(add);
      setdestination({
        latitude: lat.lat,
        longitude: lat.lng,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    }
  };
  const handleConfirm = date => {
    setSelectedDate(date);
    setDatePickerVisibility(false);
    setTimeout(() => setassignmodel(true), 400);
  };
  const handleConfirm2 = date => {
    setSelectedTime(date);
    setDatePickerVisibility2(false);
    setTimeout(() => setassignmodel(true), 400)
  };

  const mergeDateAndTime = () => {
    const datePart = moment(selectedDate).format('YYYY-MM-DD');
    const timePart = moment(selectedTime).format('HH:mm:ss');

    const finalshedule = moment(`${datePart} ${timePart}`, 'YYYY-MM-DD HH:mm:ss').toDate();
    setfinalshedule(finalshedule)
    setassignmodel(false)
  };

  const currentLocation = 'Berlin Central Station';
  const currentLocationDetail = 'Europaplatz 1, Berlin';
  const destinationLocation = 'Terminal 1 Berlin Brandenburg Airport';
  const destinationLocationDetail = 'Melli-Beese-Ring 1, Schönefeld';



  return (
    <SafeAreaView style={styles.container}>
      <ScrollView keyboardShouldPersistTaps="always">
        {/* <View style={{height: location && destination ? '65%' : '65%'}}> */}
        {/* <View style={{height:'65%'}}>
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
              // coordinate={{
              //   latitude: 37.78825,
              //   longitude: -122.4324,
              //   // latitudeDelta: 0.015,
              //   // longitudeDelta: 0.0121,
              // }}
              // title={'Destination'}
              pinColor="#de2c1f"
              // image={require('../../Assets/Images/Start.png')}
            />
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
            coordinate={{
              latitude: location?.latitude ? Number(location?.latitude) : 0,
              longitude: location?.longitude ? Number(location?.longitude) : 0,
            }}
            // coordinate={{
            //   latitude: 37.78825,
            //   longitude: -122.4324,
            //   // latitudeDelta: 0.015,
            //   // longitudeDelta: 0.0121,
            // }}
            // title={'Pick Up'}
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
            borderRadius: 30,
            boxShadow: '0 5 10 0.08 grey',
          }}
          onPress={() => props.navigation.openDrawer()}>
          <MenuIcon />
        </TouchableOpacity>
      </View> */}

        <LinearGradient
          start={{ x: 0, y: 0 }}
          colors={['#1B3826', '#99D028']}
          style={styles.header}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => props.navigation.openDrawer()}>
            <MenuIcon />
          </TouchableOpacity>
          <View style={styles.logoContainer}>
            <Image
              resizeMode="contain"
              source={require('../../../Assets/Images/caricon.png')}
              style={styles.carIcon}
            />
          </View>
        </LinearGradient>

        {/* <ScrollView style={styles.btmpart}>
        <TouchableOpacity
          style={styles.part}
          onPress={() => setdestinationshow(true)}>
          <View style={styles.round}>
            <SearchIcon height={20} width={20} />
          </View>
          <Text style={styles.locationtxt} numberOfLines={2}>
            {destinationadd ? destinationadd : 'Where are you going ?'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.part, {marginTop: 10}]}
          onPress={() => setlocationshow(true)}
          
        >
          <View style={styles.round}>
            <SearchIcon height={20} width={20} />
          </View>
          <Text style={styles.locationtxt} numberOfLines={2}>
            {locationadd ? locationadd : 'Pick up locations'}
          </Text>
        </TouchableOpacity>

        <View style={{flexDirection:'row',justifyContent:'space-between',marginTop: 10,alignItems:'center',marginBottom:30}}>
        <View style={styles.checkcov}>
          {bookfor ? (
            <CheckboxactiveIcon
              height={20}
              width={20}
              color={Constants.dark_green}
              onPress={() => setbookfor(0)}
            />
          ) : (
            <CheckboxIcon
              height={20}
              width={20}
              color={Constants.dark_green}
              onPress={() => setbookfor(1)}
            />
          )}
          <Text style={styles.anotherplace}>Book for someone else !</Text>
        </View>
        {location && destination &&<TouchableOpacity
            style={styles.btncov}
            onPress={() =>{
             profiledata.username&&!bookfor?
              navigate('SideMenu',{screen:'SelectRide',params:{
                name:profiledata.username,
                number:user.phone,
                data:{location,
                locationadd,
                destination,
                destinationadd}
              }}):
              navigate('PassengerDeatail', {
                location,
                locationadd,
                destination,
                destinationadd,
                bookfor
              })
            }
            }>
            <RightArrow
              color={Constants.white}
              height={17}
              width={17}
              style={{marginRight: -3}}
            />
          </TouchableOpacity>}
          </View>
      
      </ScrollView> */}

        <View style={styles.searchContainer}>
          <TouchableOpacity style={styles.searchBar} onPress={()=>navigate('StopPage',{location,locationadd,destination,destinationadd,stops})}>
            <SearchIcon height={20} width={20} color={Constants.black} />
            <TextInput
              // ref={refInput}
              style={styles.searchInput}
              editable={false}
              placeholder={t("Where are you going?")}
              placeholderTextColor="#777"
              onPress={()=>navigate('StopPage',{location,locationadd,destination,destinationadd,stops})}
              // onFocus={() => {
              //   setdestinationshow(true);
              //   refInput.current?.blur();
              // }}
              value={destinationadd}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={() => setassignmodel(true)}>
            <DateIcon />
            <Text style={styles.actionText}>{finalshedule ? moment(finalshedule).format('DD MMM hh:mm A') : t('Schedule')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => profiledata?.work_address || profiledata?.home_address ? setshowlocationlist(true) : navigate('RideAccount')}>
            <RightArrow />
            <Text style={styles.actionText}>{t("Add Shortcut")}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.currentLocationContainer}>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems:'center',
              alignItems: 'center',
              marginVertical: 15,
            }}>
              {/* <TouchableOpacity style={styles.actionButton2} onPress={() => navigate('StopPage',{location,locationadd,destination,destinationadd,stops})}>
                {stops?.length>0?<EditIcon height={20} width={20}/>:<Plus2Icon height={18} width={18}/>}
              </TouchableOpacity> */}
            <Text style={styles.currentText} >{t("You are here")}</Text>
            <TouchableOpacity
              style={[styles.actionButton, { width: '60%' }]}
              onPress={() => setlocationshow(true)}>
              <Text
                style={[
                  styles.actionText,
                  { color: Constants.dark_green, fontFamily: Constants.font700 },
                ]} numberOfLines={1}>
                {showsrcadd && locationadd ? locationadd : t('Choose Your Location')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* CHANGED: Map thumbnail */}
          <View style={styles.mapThumbnail}>
            {showMap && <MapView
              style={styles.mapThumbnailView}
              provider={PROVIDER_GOOGLE}
              ref={mapRef}
              // customMapStyle={mapStyle}
              region={location}
              scrollEnabled={false}
              zoomEnabled={false}
              rotateEnabled={false}
              pitchEnabled={false}>
              {location && (
                <Marker
                  coordinate={{
                    latitude: location?.latitude
                      ? Number(location?.latitude)
                      : 0,
                    longitude: location?.longitude
                      ? Number(location?.longitude)
                      : 0,
                  }}
                  pinColor={'blue'}
                />
              )}
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
                  pinColor={'red'}
                />
              )}
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
                  }}
                  apikey={Googlekey}
                  strokeWidth={2}
                  strokeColor="#4782F8"
                  //  strokeColors={['#4782F8']}
                  optimizeWaypoints={true}
                />
              )}
            </MapView>}
          </View>
        </View>

        {/* <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 15, }}>
        <Text style={styles.currentText}>You are here</Text>
        <TouchableOpacity style={styles.actionButton} onPress={() => setlocationshow(true)} ><Text style={[styles.actionText, { color: Constants.dark_green, fontFamily: Constants.font700 }]}>Choose Custom location</Text></TouchableOpacity>
      </View> */}

        {/* CHANGED: Location details */}
        {showlocationlist && <View style={styles.locationDetails}>
          {profiledata?.home_address && (
            <TouchableOpacity style={styles.locationItem} onPress={() => {
              setdestinationadd(`${profiledata?.home_address?.main_address}, ${profiledata?.home_address?.secendary_address}`);
              setdestination({
                latitude: profiledata?.home_address?.location[1],
                longitude: profiledata?.home_address?.location[0],
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              })
            }}>
              {/* <View style={styles.locationDot}> */}
              {/* <LocationIcon /> */}
              <MappinIcon height={35} width={35} />
              {/* </View> */}
              <View style={styles.locationText}>
                <Text style={styles.locationTitle}>
                  {profiledata?.home_address?.main_address}
                </Text>
                <Text style={styles.locationSubtitle}>
                  {profiledata?.home_address?.secendary_address}
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {profiledata?.work_address && (
            <TouchableOpacity style={styles.locationItem} onPress={() => {
              setdestinationadd(`${profiledata?.work_address?.main_address}, ${profiledata?.work_address?.secendary_address}`);
              setdestination({
                latitude: profiledata?.work_address?.location[1],
                longitude: profiledata?.work_address?.location[0],
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              })
            }}>
              {/* <View style={styles.locationDot}> */}
              {/* <LocationIcon /> */}
              <MappinIcon height={35} width={35} />
              {/* </View> */}
              <View style={styles.locationText}>
                <Text style={styles.locationTitle}>
                  {profiledata?.work_address?.main_address}
                </Text>
                <Text style={styles.locationSubtitle}>
                  {profiledata?.work_address?.secendary_address}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>}

      </ScrollView>
       
      <LinearGradient
        start={{ x: 0, y: 0 }}
        colors={['#1B3826', '#99D028']}
        style={styles.footer}>
        <View style={styles.submitbuttonContiner}>
          <View style={styles.checkcov}>
            {bookfor ? (
              <CheckboxactiveIcon
                height={20}
                width={20}
                color={Constants.white}
                onPress={() => setbookfor(0)}
              />
            ) : (
              <CheckboxIcon
                height={20}
                width={20}
                color={Constants.white}
                onPress={() => setbookfor(1)}
              />
            )}
            <Text style={styles.anotherplace}>{t("Book for someone else !")}</Text>
          </View>
          {location && destination && (
            <TouchableOpacity
              style={styles.btncov}
              onPress={() => {
                profiledata?.username && !bookfor
                  ? navigate('SideMenu', {
                    screen: 'SelectRide',
                    params: {
                      name: profiledata.username,
                      number: user.phone,
                      schedule: finalshedule ? finalshedule : null,
                      data: {
                        location,
                        locationadd,
                        destination,
                        destinationadd,
                        stops,
                      },
                    },
                  })
                  : navigate('PassengerDeatail', {
                    location,
                    locationadd,
                    destination,
                    destinationadd,
                    stops,
                    bookfor,
                  });
              }}>
              <RightArrow
                color={Constants.dark_green}
                height={17}
                width={17}
                style={{ marginRight: -3 }}
              />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
      {/* <Modal
        animationType="none"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          // Alert.alert('Modal has been closed.');
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={{ backgroundColor: 'white', alignItems: 'center' }}>
              <Text style={styles.textStyle}>What is your name?</Text>
              <View
                style={[
                  styles.inpucov,
                ]}>
                <TextInput
                  style={styles.inputfield}
                  placeholder="Enter Name"
                  placeholderTextColor={Constants.black}
                  value={name}
                  onChangeText={name => setname(name)}></TextInput>
              </View>
              {submitted && name === '' && (
                <Text style={styles.require}>Name is required</Text>
              )}
              <TouchableOpacity
                // activeOpacity={0.9}
                onPress={() => updateProfile()}
                style={styles.cancelButtonStyle}>
                <Text style={styles.modalText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal> */}
       <LocationAutocomplete
          value={locationadd}
          visible={locationshow}
          setVisible={setlocationshow}
          onClose={() => {
            setlocationshow(!locationshow);
          }}
          placeholder={t("Pick up Location")}
          backgroundColor={Constants.black}
          getLocationValue={(lat, add) => getLocationValue(lat, add, 'start')}
        />
        <LocationAutocomplete
          value={destinationadd}
          visible={destinationshow}
          setVisible={setdestinationshow}
          onClose={() => {
            setdestinationshow(!destinationshow);
          }}
          placeholder={t("Where are you going?")}
          backgroundColor={Constants.black}
          getLocationValue={(lat, add) => getLocationValue(lat, add, 'end')}
        />
      <Modal
        animationType="none"
        transparent={true}
        visible={assignmodel}
      // onRequestClose={() => {
      //   setassignmodel(!assignmodel);
      // }}
      >
        <View style={styles.centeredView2}>
          <View style={styles.modalView2}>
            <CrossIcon style={styles.popupcross} height={16} width={16} onPress={() => setassignmodel(false)} />
            <View
              style={{
                backgroundColor: 'white',
                alignItems: 'center',
                paddingHorizontal: 30,
              }}>
              <Text style={styles.headtxt}>
                {t("You want to schedule the ride ?")}
              </Text>
              <TouchableOpacity style={styles.inpucov} onPress={() => {
                setassignmodel(false);
                setTimeout(() => setDatePickerVisibility(true), 300); // Wait for modal to close
              }}>
                <Text
                  style={styles.inputfield}
                >{selectedDate ? moment(selectedDate).format('DD-MM-YYYY') : t('Select Date')}</Text>
                <CalenderIcon height={20} width={20} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.inpucov} onPress={() => { setassignmodel(false), setTimeout(() => setDatePickerVisibility2(true), 300) }}>
                <Text
                  style={styles.inputfield}
                >{selectedTime ? moment(selectedTime).format('hh:mm A') : t('Select Time')}</Text>
                <ClockIcon height={20} width={20} color={Constants.customgrey} />
              </TouchableOpacity>
              <Text style={styles.logimbtn} onPress={() => mergeDateAndTime()}>{t("Confirm")}</Text>
            </View>
          </View>
        </View>
      </Modal>
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        minimumDate={new Date()}
        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
        date={selectedDate}
        onConfirm={handleConfirm}
        onCancel={() => setDatePickerVisibility(false)}
      />
      <DateTimePickerModal
        isVisible={isDatePickerVisible2}
        mode="time"
        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
        date={selectedTime}
        onConfirm={handleConfirm2}
        onCancel={() => setDatePickerVisibility2(false)}
      />
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.white,
  },
  header: {
    backgroundColor: '#7cb342',
    height: 230,
    paddingHorizontal: Platform.OS === 'ios' ? 0 : 20,
    paddingTop: Platform.OS === 'ios' ? 0 : 5,
  },
  carIcon: {
    width: 120,
    height: 200,
  },
  currentLocationContainer: {
    // flex: 1,
    padding: 15,
  },
  mapThumbnailView: {
    height: '100%',
    width: '100%',
  },
  locationDetails: {
    backgroundColor: '#fff',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 60,
  },

  footer: {
    // backgroundColor: '#7cb342',
    height: 60,
    borderTopRightRadius: 60,
    borderTopLeftRadius: 60,
    // paddingHorizontal: 20,
    paddingTop: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  submitbuttonContiner: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
    height: 60,
    // backgroundColor: Constants.dark_green,
  },
  currentText: {
    fontSize: 16,
    color: Constants.customgrey,
    // marginBottom: 10,
  },
  mapThumbnail: {
    height: 220,
    borderRadius: 10,
    overflow: 'hidden',
    // marginBottom: 15,
    // elevation: 2,
    borderColor: Constants.black,
    borderWidth: 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEEEEE',
    borderRadius: 20,
    paddingHorizontal: 25,
    paddingVertical: 8,
    // marginRight: 10,
  },

  locationItem: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
    gap: 5,
  },

  locationDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  locationText: {
    flex: 1,
  },
  locationTitle: {
    fontSize: 16,
    fontFamily: Constants.font700,
    color: '#333',
  },
  locationSubtitle: {
    fontSize: 14,
    color: '#777',
    fontFamily: Constants.font600,
  },
  actionText: {
    marginLeft: 5,
    color: '#666',
    fontSize: 14,
  },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 30,
    paddingHorizontal: 25,
    paddingVertical: Platform.OS==='ios'?20:10,

    position: 'absolute',
    zIndex: 10,
    bottom: -10,
    // shadowColor: '#000000',
    // shadowOffset: {
    //   width: -2,
    //   height: -2,
    // },
    // shadowOpacity: 0.25,
    // shadowRadius: 20.0,
    // elevation: 20,
    overflow: 'hidden',
    boxShadow: '2px 2px 15px 0.4px grey'
  },
  searchInput: {
    flex: 1,
    marginLeft: 20,
    fontSize: 16,
    color: '#333',
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 30,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
    marginHorizontal: 10
  },
  actionButton2: {
    alignItems: 'center',
    backgroundColor: '#EEEEEE',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },

  searchContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'white',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    // marginTop: 15,
  },
  menuButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 10,
    boxShadow: '0px 2px 5px 0.08px grey',
    borderRadius:30
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
  titleimg: {
    height: 30,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 15,
  },
  // shadowProp: {
  //   boxShadow: '0 0 8 0.05 grey',
  // },
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
  buttontxt: {
    color: Constants.white,
    fontSize: 18,
    fontFamily: FONTS.SemiBold,
  },
  txt: {
    color: Constants.white,
    fontSize: 16,
    fontFamily: FONTS.Regular,
    textAlign: 'center',
  },
  stmtxt: {
    color: Constants.white,
    fontSize: 22,
    fontFamily: FONTS.ExtraBold,
    textAlign: 'center',
    marginBottom: 10,
  },
  round: {
    height: 30,
    width: 30,
    backgroundColor: Constants.white,
    borderRadius: 30,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  part: {
    flexDirection: 'row',
    backgroundColor: Constants.customgrey4,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 5,
  },
  locationtxt: {
    marginLeft: 10,
    fontSize: 16,
    fontFamily: FONTS.Medium,
    color: Constants.black,
    width: '85%',
  },
  anotherplace: {
    color: Constants.white,
    fontSize: 16,
    fontFamily: FONTS.SemiBold,
    marginTop: 3,
    width:'75%'
  },
  checkcov: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  btncov: {
    backgroundColor: Constants.white,
    height: 50,
    width: 50,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    // position:'absolute',
    // bottom:100,
    // right:50,
    // marginTop: 20,
    // marginBottom: 40,
    // alignSelf: 'flex-end',
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
    padding: 25,
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

  textStyle: {
    color: Constants.black,
    // fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: FONTS.Bold,
    fontSize: 16,
  },
  modalText: {
    color: Constants.white,
    textAlign: 'center',
    fontFamily: FONTS.Bold,
    fontSize: 14,
  },
  cancelButtonStyle: {
    backgroundColor: Constants.dark_green,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginRight: 10,
    paddingHorizontal: '20%',
    marginTop: 10,
  },
  inputfield: {
    color: Constants.black,
    fontSize: 16,
    fontFamily: FONTS.Regular,
    flex: 1,
  },
  require: {
    color: Constants.red,
    fontFamily: FONTS.Medium,
    marginLeft: 10,
    fontSize: 14,
  },
  ///model
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
  headtxt: {
    color: Constants.black,
    fontFamily: FONTS.Medium,
    fontSize: 20,
    textAlign: 'center'
  },
  inpucov: {
    backgroundColor: Constants.customgrey4,
    marginVertical: 10,
    borderRadius: 15,
    height: 50,
    paddingHorizontal: 10,
    flexDirection: 'row',
    // justifyContent:'center',
    alignItems: 'center'
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
    boxShadow: '0px 3px 10px 0.08px grey'
  },
  popupcross: {
    alignSelf: 'flex-end',
    marginRight: 15,
    marginTop: -5,
    marginBottom: 20
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
