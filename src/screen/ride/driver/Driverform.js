import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  Modal,
  Keyboard,
  Platform,
  PermissionsAndroid,
  KeyboardAvoidingView,
} from 'react-native';
import React, {createRef, useContext, useEffect, useRef, useState} from 'react';
import Constants, {FONTS} from '../../../Assets/Helpers/constant';
import {ApiFormData, GetApi, Post} from '../../../Assets/Helpers/Service';
import CameraGalleryPeacker from '../../../Assets/Component/CameraGalleryPeacker';
import {BackIcon, UploadIcon} from '../../../../Theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {goBack, navigate, reset} from '../../../../navigationRef';
import {
  DriverProfileContext,
  LoadContext,
  ProfileContext,
  ToastContext,
  UserContext,
} from '../../../../App';
import {useIsFocused} from '@react-navigation/native';
import LocationDropdown from '../../../Assets/Component/LocationDropdown';
import Geolocation from '@react-native-community/geolocation';
import GetCurrentAddressByLatLong from '../../../Assets/Component/GetCurrentAddressByLatLong';
import {Dropdown} from 'react-native-element-dropdown';
import { PERMISSIONS, request } from 'react-native-permissions';
import { useTranslation } from 'react-i18next';

const Driverform = props => {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);
  const [toast, setToast] = useContext(ToastContext);
  const [loading, setLoading] = useContext(LoadContext);
  const [user, setuser] = useContext(UserContext);
  const [profile, setProfile] = useContext(ProfileContext);
  const [driverProfile, setdriverProfile] = useContext(DriverProfileContext);
  const [status, setStatus] = useState('');
  const [model, setmodel] = useState(false);
  const [alreadyusedmodel, setalreadyusedmodel] = useState(false);
  const [updateModel, setUpdateModel] = useState(false);
  const [vehiclelist, setvehiclelist] = useState([]);
  // const [vehicletype, setvehicletype] = useState('Car');
  const [userDetail, setUserDetail] = useState({
    username: '',
    dl_number: '',
    address: '',
    country: '',
    number_plate_no: '',
    phone: '',
    dl_image: '',
    number_plate_image: '',
    address_support_letter: '',
    sin_number: '',
    national_id_no: '',
    national_id: '',
    background_check_document: '',
    vehicle_colour: '',
    vehicle_model: '',
    vehicle_year: '',
    vehicle_company: '',
    vehicle_type: '',
    vehicle_image: '',
  });
  console.log(userDetail?.vehicle_type)
  console.log(typeof userDetail?.vehicle_type)
  const dropdownRef = useRef();
  const cameraRef = createRef();
  const cameraRef2 = createRef();
  const cameraRef3 = createRef();
  const cameraRef4 = createRef();
  const cameraRef5 = createRef();
  const cameraRef6 = createRef();
  const cameraRef7 = createRef();

  const IsFocused = useIsFocused();
  useEffect(() => {
    if (IsFocused) {
      getProfile();
      // setmodel(true);
    }
  }, [IsFocused]);
  useEffect(() => {
    getalltrucktype();
  }, []);

  const getImageValue = async img => {
    ApiFormData(img.assets[0]).then(
      res => {
        console.log(res);

        if (res.status) {
          setUserDetail({
            ...userDetail,
            dl_image: res.data.file,
          });
        }
      },
      err => {
        console.log(err);
      },
    );
  };
  const getalltrucktype = () => {
    setLoading(true);
    GetApi(`getalltrucktype`, {}).then(
      async res => {
        setLoading(false);
        console.log(res.data);
        setvehiclelist(res.data);
      },
      err => {
        setLoading(false);
        console.log(err);
      },
    );
  };

  const cancel = () => {};
  const getImageValue2 = async img => {
    ApiFormData(img.assets[0]).then(
      res => {
        console.log(res);

        if (res.status) {
          setUserDetail({
            ...userDetail,
            number_plate_image: res.data.file,
          });
        }
      },
      err => {
        console.log(err);
      },
    );
  };
  const getImageValue3 = async img => {
    ApiFormData(img.assets[0]).then(
      res => {
        console.log(res);

        if (res.status) {
          setUserDetail({
            ...userDetail,
            national_id: res.data.file,
          });
        }
      },
      err => {
        console.log(err);
      },
    );
  };
  const getImageValue4 = async img => {
    ApiFormData(img.assets[0]).then(
      res => {
        console.log(res);

        if (res.status) {
          setUserDetail({
            ...userDetail,
            background_check_document: res.data.file,
          });
        }
      },
      err => {
        console.log(err);
      },
    );
  };
  const getImageValue5 = async img => {
    ApiFormData(img.assets[0]).then(
      res => {
        console.log(res);

        if (res.status) {
          setUserDetail({
            ...userDetail,
            image: res.data.file,
          });
        }
      },
      err => {
        console.log(err);
      },
    );
  };
  const getImageValue6 = async img => {
    ApiFormData(img.assets[0]).then(
      res => {
        console.log(res);

        if (res.status) {
          setUserDetail({
            ...userDetail,
            address_support_letter: res.data.file,
          });
        }
      },
      err => {
        console.log(err);
      },
    );
  };
  const getImageValue7 = async img => {
    ApiFormData(img.assets[0]).then(
      res => {
        console.log(res);

        if (res.status) {
          setUserDetail({
            ...userDetail,
            vehicle_image: res.data.file,
          });
        }
      },
      err => {
        console.log(err);
      },
    );
  };

  const getProfile = () => {
    setLoading(true);
    GetApi(`getProfile/RIDEDRIVER`, {}).then(
      async res => {
        setLoading(false);
        console.log(res);
        // setUserDetail(res.driver);
        console.log(user);
        console.log(user.phone);
        console.log(res.data);
        if (res?.data?.status === 'VERIFIED') {
          navigate('Drivertab');
        } else {
          if (!alreadyusedmodel) {
            setTimeout(()=>{
              setmodel(true);
              setalreadyusedmodel(true);
            },500)
          }
          setStatus(res?.data?.status);
          setUserDetail({
            ...res?.data,
            phone: res?.data?.phone ?? user?.phone ?? '',
            username: res?.data?.username ?? profile?.username ?? '',
          });
          if (res.data?.address === '' || !res.data?.address) {
            CustomCurrentLocation();
          }
          // setUserDetail({
          //   username: res?.data?.username || '',
          //   store_name: res?.data?.store_name || '',
          //   address: res?.data?.address || '',
          //   country: res?.data?.country || '',
          //   number: res?.data?.number || '',
          //   store_doc: res?.data?.store_doc || '',
          //   national_id_no: res?.data?.national_id_no || '',
          //   national_id: res?.data?.national_id || '',
          // });
        }
      },
      err => {
        setLoading(false);
        console.log(err);
      },
    );
  };
  const submit = async () => {
    if (
      userDetail.username === '' ||
      !userDetail.username ||
      userDetail.image === '' ||
      !userDetail.image ||
      userDetail.address === '' ||
      !userDetail.address ||
      userDetail.country === '' ||
      !userDetail.country ||
      userDetail.dl_image === '' ||
      !userDetail.dl_image ||
      userDetail.dl_number === '' ||
      !userDetail.dl_number ||
      userDetail.number_plate_image === '' ||
      !userDetail.number_plate_image ||
      userDetail.vehicle_image === '' ||
      !userDetail.vehicle_image ||
      userDetail.number_plate_no === '' ||
      !userDetail.number_plate_no ||
      userDetail.phone === '' ||
      !userDetail.phone ||
      // userDetail.address_support_letter === '' ||
      // !userDetail.address_support_letter ||
      // userDetail.sin_number === '' ||
      // !userDetail.sin_number ||
      userDetail.national_id_no === '' ||
      !userDetail.national_id_no ||
      userDetail.national_id === '' ||
      !userDetail.national_id ||
      userDetail.vehicle_type === '' ||
      !userDetail.vehicle_type ||
      userDetail.background_check_document === '' ||
      !userDetail.background_check_document
    ) {
      setSubmitted(true);
      return;
    }
    userDetail.role = 'RIDEDRIVER';
    delete userDetail._id;
    console.log(userDetail);
    setLoading(true);
    Post('updateProfile/RIDEDRIVER', userDetail, {}).then(
      async res => {
        setLoading(false);
        console.log(res);
        setdriverProfile(res?.data)
        if (res.status) {
          // setToast(res.data.message);
          setUpdateModel(true)
          getProfile();
        } else {
          setToast(res?.message);
        }
      },
      err => {
        setLoading(false);
        console.log(err);
        // setToast(res?.message);
        setToast([{error: true, message: res.message}]);
      },
    );
  };
  const getLocationVaue = (lat, add, set) => {
    console.log('lat=======>', lat);
    console.log('add=======>', add);
    // setUserDetail({
    //   ...userDetail,
    //   address: add,
    //   // shop_lat: lat.lat,
    //   // shop_long: lat.lng,
    // });
    setUserDetail(pervdata => ({
      ...pervdata,
      address: add,
      location: {
        type: 'Point',
        coordinates: [lat.lng, lat.lat],
      },
    }));
  };
  const CustomCurrentLocation = async () => {
    try {
      if (Platform.OS === 'ios') {
        request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE).then(result => {
          console.log(result);
          if (result === 'granted') {
            Geolocation.getCurrentPosition(
              position => {
                 GetCurrentAddressByLatLong({
                lat: position.coords.latitude,
                long: position.coords.longitude,
              }).then(res => {
                console.log('res===>', res);
                // setlocationadd(res.results[0].formatted_address);
                setUserDetail(pervdata => ({
                  ...pervdata,
                  address: res.results[0].formatted_address,
                  location: {
                    type: 'Point',
                    coordinates: [
                      position.coords.longitude,
                      position.coords.latitude,
                    ],
                  },
                }));
              });
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
              GetCurrentAddressByLatLong({
                lat: position.coords.latitude,
                long: position.coords.longitude,
              }).then(res => {
                console.log('res===>', res);
                // setlocationadd(res.results[0].formatted_address);
                setUserDetail(pervdata => ({
                  ...pervdata,
                  address: res.results[0].formatted_address,
                  location: {
                    type: 'Point',
                    coordinates: [
                      position.coords.longitude,
                      position.coords.latitude,
                    ],
                  },
                }));
              });
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
  return (
    <SafeAreaView style={{flex:1}}>
      <KeyboardAvoidingView 
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={{flex:1}}
            >
    <ScrollView
      style={[styles.container]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="always">
      <View style={{flexDirection: 'row', alignItems: 'center', gap: 50}}>
                <TouchableOpacity style={styles.backcov} onPress={() => goBack()}>
                  <BackIcon color={Constants.black}/>
                </TouchableOpacity>
                <Text style={styles.headtxt}>{t("Driver Account")}</Text>
              </View>
      {status && (
        <View style={{flexDirection: 'row', marginTop: 10}}>
          <Text style={styles.statustxt} >
            {t("Verification Status")} -
          </Text>
          <Text style={[styles.statustxt, {color: '#fab905', marginLeft: 3}]}>
            {status}
          </Text>
        </View>
      )}
      <View style={[styles.textInput]}>
        <TextInput
          style={[styles.input]}
          placeholder={t("Enter Name")}
          value={userDetail?.username}
          onChangeText={username => setUserDetail({...userDetail, username})}
          placeholderTextColor={Constants.customgrey2}
        />
        <View style={[styles.mylivejobtitle]}>
          <Text style={[styles.jobtitle]}>{t("Full Name")}</Text>
        </View>
      </View>
      {submitted && (userDetail.username === '' || !userDetail.username) && (
        <Text style={styles.require}>{t("Name is required")}</Text>
      )}
      <View
        style={{
          flexDirection: 'row',
          height: 100,
          marginTop: 20,
          marginBottom: 10,
          justifyContent: 'center',
        }}>
        <TouchableOpacity
          style={styles.uploadbox}
          onPress={() => {
            Keyboard.dismiss();
            setTimeout(() => {
              if (cameraRef5.current) {
                cameraRef5.current.show();
              }
            }, 100);
          }}>
          <UploadIcon
            color={Constants.dark_green}
            height={'80%'}
            width={'100%'}
          />
          <Text style={styles.uploadtxt}>{t("Upload Your Photo")}</Text>
        </TouchableOpacity>
        <View style={styles.uploadimgbox}>
          {userDetail?.image && (
            <Image
              source={{
                uri: userDetail?.image,
              }}
              style={styles.imgstyle2}
            />
          )}
        </View>
      </View>
      {submitted && !userDetail?.image && (
        <Text style={styles.require}>{t("Profile image is required")}</Text>
      )}
      <View style={[styles.textInput]}>
        <TextInput
          style={[styles.input]}
          placeholderTextColor={Constants.customgrey2}
          value={userDetail?.dl_number}
          onChangeText={dl_number =>
            setUserDetail({...userDetail, dl_number: dl_number})
          }
        />
        <View style={[styles.mylivejobtitle]}>
          <Text style={[styles.jobtitle]}>{t("DL Number")}</Text>
        </View>
      </View>
      {submitted && (userDetail.dl_number === '' || !userDetail.dl_number) && (
        <Text style={styles.require}>{t("Dl number is required")}</Text>
      )}
      <View
        style={{
          flexDirection: 'row',
          height: 100,
          marginTop: 20,
          marginBottom: 10,
          justifyContent: 'center',
        }}>
        <TouchableOpacity
          style={styles.uploadbox}
          onPress={() => {
            Keyboard.dismiss();
            setTimeout(() => {
              if (cameraRef.current) {
                cameraRef.current.show();
              }
            }, 100);
          }}>
          {/* <Image
            source={require('../../Assets/Images/upload.png')}
            style={styles.imgstyle}
          /> */}
          <UploadIcon
            color={Constants.dark_green}
            height={'80%'}
            width={'100%'}
          />
          <Text style={styles.uploadtxt}>{t("Upload License")}</Text>
        </TouchableOpacity>
        <View style={styles.uploadimgbox}>
          {userDetail?.dl_image && (
            <Image
              source={{
                uri: userDetail?.dl_image,
              }}
              style={styles.imgstyle2}
            />
          )}
        </View>
      </View>
      {submitted && !userDetail?.dl_image && (
        <Text style={styles.require}>{t("License image is required")}</Text>
      )}
      <View style={[styles.textInput]}>
        <TextInput
          style={[styles.input]}
          placeholderTextColor={Constants.customgrey2}
          value={userDetail?.country}
          onChangeText={country => setUserDetail({...userDetail, country})}
        />
        <View style={[styles.mylivejobtitle]}>
          <Text style={[styles.jobtitle]}>{t("Country")}</Text>
        </View>
      </View>
      {submitted && (userDetail.country === '' || !userDetail.country) && (
        <Text style={styles.require}>{t("Country is required")}</Text>
      )}
      <View style={[styles.textInput]}>
        {/* <TextInput
          style={[styles.input]}
          //   placeholder="Enter Name"
          placeholderTextColor={Constants.customgrey2}
          value={userDetail?.address}
          onChangeText={address => setUserDetail({...userDetail, address})}
        /> */}
        <LocationDropdown
          value={userDetail?.address || ''}
          // focus={from === 'location'}
          // setIsFocus={setFrom}
          // from="location"
          getLocationVaue={(lat, add) => getLocationVaue(lat, add)}
        />
        <View style={[styles.mylivejobtitle]}>
          <Text style={[styles.jobtitle]}>{t("Address")}</Text>
        </View>
      </View>
      {submitted && (userDetail.address === '' || !userDetail.address) && (
        <Text style={styles.require}>{t("Address is required")}</Text>
      )}

      {/* <View style={[styles.textInput]}>
        <TextInput
          style={[styles.input]}
          value={userDetail?.address_support_letter}
          onChangeText={address_support_letter =>
            setUserDetail({...userDetail, address_support_letter})
          }
        />
        <View style={[styles.mylivejobtitle]}>
          <Text style={[styles.jobtitle]}>{t("Address support letter")}</Text>
        </View>
      </View>
      {submitted &&
        (userDetail.address_support_letter === '' ||
          !userDetail.address_support_letter) && (
          <Text style={styles.require}>{t("Address support letter is required")}</Text>
        )} */}
        <View
        style={{
          flexDirection: 'row',
          height: 100,
          marginTop: 20,
          marginBottom: 10,
        }}>
        <TouchableOpacity
          style={styles.uploadbox}
          onPress={() => {
            Keyboard.dismiss();
            setTimeout(() => {
              if (cameraRef6.current) {
                cameraRef6.current.show();
              }
            }, 100);
          }}>
          <UploadIcon
            color={Constants.dark_green}
            height={'80%'}
            width={'100%'}
          />
          <Text style={styles.uploadtxt}>{t("Address support letter")}</Text>
        </TouchableOpacity>
        <View style={styles.uploadimgbox}>
          {userDetail?.address_support_letter && (
            <Image
              source={{
                uri: `${userDetail.address_support_letter}`,
              }}
              style={styles.imgstyle2}
            />
          )}
        </View>
      </View>
      {user?.countryCode==='1'&&<View style={[styles.textInput]}>
        <TextInput
          style={[styles.input]}
          value={userDetail?.sin_number}
          onChangeText={sin_number =>
            setUserDetail({...userDetail, sin_number})
          }
        />
        <View style={[styles.mylivejobtitle]}>
          <Text style={[styles.jobtitle]}>{t("SIN Number")}</Text>
        </View>
      </View>}
      {submitted &&
        (userDetail.sin_number === '' || !userDetail.sin_number) &&user?.countryCode==='1'&& (
          <Text style={styles.require}>{t("SIN Number is required")}</Text>
        )}
      <View style={[styles.textInput]}>
        <TextInput
          style={[styles.input, {color: Constants.customgrey2}]}
          //   placeholder="Enter Name"
          maxLength={10}
          placeholderTextColor={Constants.customgrey2}
          keyboardType="number-pad"
          editable={false}
          value={userDetail?.phone}
          onChangeText={phone => setUserDetail({...userDetail, phone})}
        />
        <View style={[styles.mylivejobtitle]}>
          <Text style={[styles.jobtitle]}>{t("Phone Number")}</Text>
        </View>
      </View>
      {submitted && (userDetail.phone === '' || !userDetail.phone) && (
        <Text style={styles.require}>{t("Number is required")}</Text>
      )}
      <View style={[styles.textInput]}>
        <TextInput
          style={[styles.input]}
          value={userDetail?.number_plate_no}
          onChangeText={number_plate_no => {
            setUserDetail({
              ...userDetail,
              number_plate_no: number_plate_no,
            });
            console.log(userDetail.number_plate_no);
          }}
        />

        <View style={[styles.mylivejobtitle]}>
          <Text style={[styles.jobtitle]}>{t("Number Plate")}</Text>
        </View>
      </View>
      {submitted &&
        (userDetail.number_plate_no === '' || !userDetail.number_plate_no) && (
          <Text style={styles.require}>{t("Number plate is required")}</Text>
        )}
      <View style={styles.textInput}>
        <Dropdown
          ref={dropdownRef}
          data={vehiclelist}
          labelField="name"
          valueField="_id"
          placeholder="Select Vehicle Type"
          value={userDetail?.vehicle_type}
          onChange={item => {}}
          renderItem={item => (
            <TouchableOpacity
              style={styles.itemContainer}
              onPress={() => {
                setUserDetail({...userDetail, vehicle_type: item?._id});
                dropdownRef.current?.close();
              }}>
              <Text style={styles.itemText}>{item.name}</Text>
            </TouchableOpacity>
          )}
          style={styles.dropdown}
          // containerStyle={styles.dropdownContainer}
          placeholderStyle={styles.placeholder}
          selectedTextStyle={styles.selectedText}
          // itemTextStyle={styles.itemText}
          // itemContainerStyle={styles.itemContainerStyle}
          // selectedItemStyle={styles.selectedStyle}
        />
        <View style={[styles.mylivejobtitle]}>
          <Text style={styles.jobtitle}>{t("Vehicle Type")}</Text>
        </View>
      </View>
      {submitted &&
        (userDetail?.vehicle_type == '' || !userDetail?.vehicle_type) && (
          <Text style={styles.require}>{t("Vehicle type is required")}</Text>
        )}
      {/* <RadioButton.Group
          onValueChange={type => {
            setvehicletype(type);
          }}
          value={vehicletype}>
          <View style={{flexDirection: 'row',marginTop:10}}>
            <RadioButton.Item
              mode="android"
              label={"Car"} 
              value="Car"
              position="leading"
              color={Constants.black}
              uncheckedColor={Constants.customgrey2}
              labelStyle={{
                color:
                  vehicletype === 'Car'
                    ? Constants.black
                    : Constants.customgrey2,
                fontSize: 16,
                fontWeight:'700'
              }}
              // labelVariant="displayLarge"
            />
            <RadioButton.Item
              mode="android"
              // style={{fontSize: 12}}
              label={"Motor Bike"}
              value="Bike"
              position="leading"
              color={Constants.black}
              uncheckedColor={Constants.customgrey2}
              labelStyle={{
                color:
                  vehicletype === 'Bike'
                    ? Constants.black
                    : Constants.customgrey2,
                fontSize: 16,
                fontWeight:'700'
              }}
            />
          </View>
        </RadioButton.Group> */}
      <View style={[styles.textInput]}>
        <TextInput
          style={[styles.input]}
          value={userDetail?.vehicle_company}
          onChangeText={vehicle_company =>
            setUserDetail({...userDetail, vehicle_company})
          }
        />
        <View style={[styles.mylivejobtitle]}>
          <Text style={[styles.jobtitle]}>{t("Vehicle Mark")}</Text>
        </View>
      </View>
      {submitted &&
        (userDetail.vehicle_company === '' || !userDetail.vehicle_company) && (
          <Text style={styles.require}>{t("Vehicle Company is required")}</Text>
        )}
      <View style={[styles.textInput]}>
        <TextInput
          style={[styles.input]}
          value={userDetail?.vehicle_model}
          onChangeText={vehicle_model =>
            setUserDetail({...userDetail, vehicle_model})
          }
        />
        <View style={[styles.mylivejobtitle]}>
          <Text style={[styles.jobtitle]}>{t("Vehicle Model")}</Text>
        </View>
      </View>
      {submitted &&
        (userDetail.vehicle_model === '' || !userDetail.vehicle_model) && (
          <Text style={styles.require}>{t("Vehicle Model is required")}</Text>
        )}
      <View style={[styles.textInput]}>
        <TextInput
          style={[styles.input]}
          value={userDetail?.vehicle_year}
          onChangeText={vehicle_year =>
            setUserDetail({...userDetail, vehicle_year})
          }
        />
        <View style={[styles.mylivejobtitle]}>
          <Text style={[styles.jobtitle]}>{t("Vehicle Year")}</Text>
        </View>
      </View>
      {submitted &&
        (userDetail.vehicle_year === '' || !userDetail.vehicle_year) && (
          <Text style={styles.require}>{t("Vehicle Year is required")}</Text>
        )}
      <View style={[styles.textInput]}>
        <TextInput
          style={[styles.input]}
          value={userDetail?.vehicle_colour}
          onChangeText={vehicle_colour =>
            setUserDetail({...userDetail, vehicle_colour})
          }
        />
        <View style={[styles.mylivejobtitle]}>
          <Text style={[styles.jobtitle]}>{t("Vehicle Colour")}</Text>
        </View>
      </View>
      {submitted &&
        (userDetail.vehicle_colour === '' || !userDetail.vehicle_colour) && (
          <Text style={styles.require}>{t("Vehicle Colour is required")}</Text>
        )}
      <View
        style={{
          flexDirection: 'row',
          height: 100,
          marginTop: 20,
          marginBottom: 10,
        }}>
        <TouchableOpacity
          style={styles.uploadbox}
          onPress={() => {
            Keyboard.dismiss();
            setTimeout(() => {
              if (cameraRef7.current) {
                cameraRef7.current.show();
              }
            }, 100);
          }}>
          <UploadIcon
            color={Constants.dark_green}
            height={'80%'}
            width={'100%'}
          />
          <Text style={styles.uploadtxt}>{t("Vehicle Image")}</Text>
        </TouchableOpacity>
        <View style={styles.uploadimgbox}>
          {userDetail?.vehicle_image && (
            <Image
              source={{
                uri: `${userDetail.vehicle_image}`,
              }}
              style={styles.imgstyle2}
            />
          )}
        </View>
      </View>

      {submitted && !userDetail?.vehicle_image && (
        <Text style={styles.require}>{t("Vehicle Image is required")}</Text>
      )}
      <View
        style={{
          flexDirection: 'row',
          height: 100,
          marginTop: 20,
          marginBottom: 10,
        }}>
        <TouchableOpacity
          style={styles.uploadbox}
          onPress={() => {
            Keyboard.dismiss();
            setTimeout(() => {
              if (cameraRef2.current) {
                cameraRef2.current.show();
              }
            }, 100);
          }}>
          <UploadIcon
            color={Constants.dark_green}
            height={'80%'}
            width={'100%'}
          />
          <Text style={styles.uploadtxt}>{t("Number plate image")}</Text>
        </TouchableOpacity>
        <View style={styles.uploadimgbox}>
          {userDetail?.number_plate_image && (
            <Image
              source={{
                uri: `${userDetail.number_plate_image}`,
              }}
              style={styles.imgstyle2}
            />
          )}
        </View>
      </View>

      {submitted && !userDetail?.number_plate_image && (
        <Text style={styles.require}>{t("Number plate image is required")}</Text>
      )}

      <View style={[styles.textInput]}>
        <TextInput
          style={[styles.input]}
          placeholderTextColor={Constants.customgrey2}
          value={userDetail?.national_id_no}
          onChangeText={national_id_no => {
            setUserDetail({
              ...userDetail,
              national_id_no: national_id_no,
            });
            console.log(userDetail.national_id_no);
          }}
        />

        <View style={[styles.mylivejobtitle]}>
          <Text style={[styles.jobtitle]}>{t("ID Number")}</Text>
        </View>
      </View>
      {submitted &&
        (userDetail.national_id_no === '' || !userDetail.national_id_no) && (
          <Text style={styles.require}>
            {t("ID number is required")}
          </Text>
        )}

      <View
        style={{
          flexDirection: 'row',
          height: 100,
          marginTop: 20,
          marginBottom: 10,
        }}>
        <TouchableOpacity
          style={styles.uploadbox}
          onPress={() => {
            Keyboard.dismiss();
            setTimeout(() => {
              if (cameraRef3.current) {
                cameraRef3.current.show();
              }
            }, 100);
          }}>
          <UploadIcon
            color={Constants.dark_green}
            height={'80%'}
            width={'100%'}
          />
          <Text style={styles.uploadtxt}>{t("Vehicle Image")}</Text>
        </TouchableOpacity>
        <View style={styles.uploadimgbox}>
          {userDetail?.national_id && (
            <Image
              source={{
                uri: `${userDetail.national_id}`,
              }}
              style={styles.imgstyle2}
            />
          )}
        </View>
      </View>

      {submitted && !userDetail?.national_id && (
        <Text style={styles.require}>{t("Vehicle Image is required")}</Text>
      )}
      <View
        style={{
          flexDirection: 'row',
          height: 100,
          marginTop: 20,
          marginBottom: 10,
        }}>
        <TouchableOpacity
          style={styles.uploadbox}
          onPress={() => {
            Keyboard.dismiss();
            setTimeout(() => {
              if (cameraRef3.current) {
                  cameraRef3.current.show();
              }
            }, 100);
          }}>
          <UploadIcon
            color={Constants.dark_green}
            height={'80%'}
            width={'100%'}
          />
          <Text style={styles.uploadtxt}>{t("ID Image")}</Text>
        </TouchableOpacity>
        <View style={styles.uploadimgbox}>
          {userDetail?.national_id && (
            <Image
              source={{
                uri: `${userDetail.national_id}`,
              }}
              style={styles.imgstyle2}
            />
          )}
        </View>
      </View>

      {submitted && !userDetail?.national_id && (
        <Text style={styles.require}>{t("ID image is required")}</Text>
      )}
      <View
        style={{
          flexDirection: 'row',
          height: 100,
          marginTop: 20,
          marginBottom: 10,
        }}>
        <TouchableOpacity
          style={styles.uploadbox}
          onPress={() => {
            Keyboard.dismiss();
            setTimeout(() => {
              if (cameraRef4.current) {
                cameraRef4.current.show();
              }
            }, 100);
          }}>
          <UploadIcon
            color={Constants.dark_green}
            height={'80%'}
            width={'100%'}
          />
          <Text style={styles.uploadtxt}>{t("Background check document image")}</Text>
        </TouchableOpacity>
        <View style={styles.uploadimgbox}>
          {userDetail?.background_check_document && (
            <Image
              source={{
                uri: `${userDetail.background_check_document}`,
              }}
              style={styles.imgstyle2}
            />
          )}
        </View>
      </View>

      {submitted && !userDetail?.background_check_document && (
        <Text style={styles.require}>
          {t("Background check document image is required")}
        </Text>
      )}

      <TouchableOpacity
        style={styles.signInbtn}
        onPress={() => submit()}
        // onPress={() => navigate('Drivertab')}
      >
        <Text style={styles.buttontxt}>{t("Submit")}</Text>
      </TouchableOpacity>

    </ScrollView>
    </KeyboardAvoidingView>
      <CameraGalleryPeacker
        refs={cameraRef}
        getImageValue={getImageValue}
        base64={false}
        cancel={cancel}
      />
      <CameraGalleryPeacker
        refs={cameraRef2}
        getImageValue={getImageValue2}
        base64={false}
        cancel={cancel}
      />
      <CameraGalleryPeacker
        refs={cameraRef3}
        getImageValue={getImageValue3}
        base64={false}
        cancel={cancel}
      />
      <CameraGalleryPeacker
        refs={cameraRef4}
        getImageValue={getImageValue4}
        base64={false}
        cancel={cancel}
      />
      <CameraGalleryPeacker
        refs={cameraRef5}
        getImageValue={getImageValue5}
        base64={false}
        cancel={cancel}
      />
      <CameraGalleryPeacker
        refs={cameraRef6}
        getImageValue={getImageValue6}
        base64={false}
        cancel={cancel}
      />
      <CameraGalleryPeacker
        refs={cameraRef7}
        getImageValue={getImageValue7}
        base64={false}
        cancel={cancel}
      />
     <Modal transparent={true} visible={model} animationType="slide">
        <View
          style={{
            justifyContent: 'center',
            flex: 1,
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}>
          <View style={styles.modal}>
            <View style={styles.box2}>
              <Text style={styles.modtxt}>
                {t("Please fill all the details. We will verify them within 3 to 5 business days. Kindly wait until the verification process is complete. Thank you for your patience.")}
              </Text>
              <TouchableOpacity
                style={styles.button2}
                onPress={() => {
                  setmodel(false);
                }}>
                <Text style={styles.buttontxt2}>{t("Ok")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
     <Modal transparent={true} visible={updateModel} animationType="slide">
        <View
          style={{
            justifyContent: 'center',
            flex: 1,
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}>
          <View style={styles.modal}>
            <View style={styles.box2}>
              <Text style={styles.modtxt}>
                {t("Details updated. Please wait until verification.")}
              </Text>
              <TouchableOpacity
                style={styles.button2}
                onPress={() => {
                  setUpdateModel(false);
                  goBack()
                }}>
                <Text style={styles.buttontxt2}>{t("Ok")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Driverform;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.white,
    paddingHorizontal: 20,
    paddingVertical: Platform.OS === 'ios' ? 10 : 20,
  },
  textInput: {
    borderColor: Constants.customgrey,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 7,
    // width: 370,
    height: 55,
    marginTop: 20,
    // flexDirection: 'row',
  },
  input: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '400',
    fontFamily: FONTS.Medium,
    color: Constants.black,
    flex: 1,
  },
  signInbtn: {
    height: 60,
    // width: 370,
    borderRadius: 30,
    backgroundColor: Constants.dark_green,
    marginTop: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  mylivejobtitle: {
    position: 'absolute',
    backgroundColor: Constants.white,
    paddingHorizontal: 5,
    top: -10,
    left: 30,
  },
  jobtitle: {
    color: Constants.black,
    fontSize: 13,
    fontFamily: FONTS.Medium,
    textAlign: 'center',
    fontWeight: '500',
  },
  buttontxt: {
    color: Constants.white,
    fontSize: 16,
    fontFamily: FONTS.Medium,
  },
  headtxt: {
    color: Constants.black,
    fontSize: 18,
    fontFamily: FONTS.SemiBold,
  },
  statustxt: {
    color: Constants.black,
    fontSize: 16,
    fontFamily: FONTS.Medium,
  },
  aliself: {
    alignSelf: 'center',
  },
  require: {
    color: Constants.red,
    fontFamily: FONTS.Medium,
    marginLeft: 10,
    fontSize: 14,
    marginTop: 10,
  },
  imgstyle: {
    height: '80%',
    width: '80%',
    // flex:1,
    resizeMode: 'contain',
  },
  imgstyle2: {
    height: '100%',
    width: '100%',
    // flex:1,
    resizeMode: 'contain',
  },
  uploadbox: {
    flex: 1,
    alignItems: 'center',
    // backgroundColor:Constants.red
  },
  uploadimgbox: {
    flex: 1,
    alignItems: 'center',
    // backgroundColor:Constants.red
  },
  uploadtxt: {
    color: Constants.black,
    fontSize: 14,
    fontFamily: FONTS.Medium,
    textAlign: 'center',
    lineHeight:17
  },

  ///model///
  modal: {
    // height: '40%',
    width: '85%',
    backgroundColor: Constants.white,
    borderRadius: 5,
  },
  box2: {
    padding: 20,
    // alignItems:'center',
    // justifyContent:'center'
  },
  modtxt: {
    fontSize: 16,
    color: Constants.black,
    fontFamily:FONTS.Medium,
    textAlign: 'center',
  },
  button2: {
    backgroundColor: Constants.dark_green,
    height: 45,
    width: '70%',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    // marginBottom: 10,
    borderRadius: 10,
  },
  buttontxt2: {
    color: Constants.white,
    fontSize: 16,
  },
  dropdown: {
    // marginVertical: 10,
    // borderWidth: 1,
    // borderRadius: 5,
    // paddingHorizontal: 10,
    // backgroundColor:'red',
    height: 60,
  },
  dropdownContainer: {
    borderRadius: 8,
    backgroundColor: Constants.dark_green,
  },
  placeholder: {
    color: Constants.customgrey,
    fontSize: 14,
    fontFamily: FONTS.Medium,
    paddingVertical: 12,
  },
  selectedText: {
    color: Constants.black,
    fontSize: 14,
    fontFamily: FONTS.Medium,
    paddingVertical: 12,
  },
  selectedStyle: {
    backgroundColor: Constants.dark_green,
  },
  itemText: {
    fontSize: 14,
    color: Constants.white,
    fontFamily: FONTS.Medium,
    // lineHeight: 15,
    // backgroundColor:'red'
  },
  itemContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    // width: '100%',
    backgroundColor: Constants.dark_green,
  },
});
