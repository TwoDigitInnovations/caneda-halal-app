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
import {
  ApiFormData,
  GetApi,
  Post,
  Postwithimage,
} from '../../../Assets/Helpers/Service';
import CameraGalleryPeacker from '../../../Assets/Component/CameraGalleryPeacker';
import {BackIcon, EditIcon, Upload2Icon, UploadIcon} from '../../../../Theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {goBack, navigate, reset} from '../../../../navigationRef';
import {
  GrocerySellerContext,
  LoadContext,
  ProfileContext,
  ToastContext,
  UserContext,
} from '../../../../App';
import {useIsFocused} from '@react-navigation/native';
import LocationDropdown from '../../../Assets/Component/LocationDropdown';
import GetCurrentAddressByLatLong from '../../../Assets/Component/GetCurrentAddressByLatLong';
import Geolocation from '@react-native-community/geolocation';

import { PERMISSIONS, request } from 'react-native-permissions';
import { useTranslation } from 'react-i18next';
import { Dropdown } from 'react-native-element-dropdown';

const GrocerySellerForm = props => {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);
  const [toast, setToast] = useContext(ToastContext);
  const [loading, setLoading] = useContext(LoadContext);
  const [profile, setProfile] = useContext(ProfileContext);
  const [grocerysellerProfile, setgrocerysellerProfile] =
      useContext(GrocerySellerContext);
  const [user, setuser] = useContext(UserContext);
  const [status, setStatus] = useState();
  const [model, setmodel] = useState(false);
  const [alreadyusedmodel, setalreadyusedmodel] = useState(false);
  const [updateModel, setUpdateModel] = useState(false);
  const [userDetail, setUserDetail] = useState({
    username: '',
    store_name: '',
    address: '',
    country: '',
    phone: '',
    store_doc: '',
    national_id_no: '',
    national_id: '',
    tax_no:'',
    store_logo:'',
    store_cover_img:'',
  });

  const cameraRef = createRef();
  const cameraRef2 = createRef();
  const cameraRef3 = createRef();
  const cameraRef4 = createRef();

    const [selecteddays, setselecteddays] = useState([]);
    const [selstarthour, setselstarthour] = useState("");
    const [selendhour, setselendhour] = useState("");
    const [selstartmin, setselstartmin] = useState("");
    const [selendmin, setselendmin] = useState("");
    const [selendtype, setselendtype] = useState("");
    const [selstarttype, setselstarttype] = useState("");
      const dropdownRef = useRef();
      const dropdownRef2 = useRef();
      const dropdownRef3 = useRef();
      const dropdownRef4 = useRef();
      const dropdownRef5 = useRef();
      const dropdownRef6 = useRef();
const hours = [
    {label:"01",value:"01"},{label:"02",value:"02"},{label:"03",value:"03"},{label:"04",value:"04"},{label:"05",value:"05"},{label:"06",value:"06"},{label:"07",value:"07"},{label:"08",value:"08"},{label:"09",value:"09"},{label:"10",value:"10"},{label:"11",value:"11"},{label:"12",value:"12"}
  ];
  const minutes = [
   {label:"00",value:"00"},{label:"05",value:"05"},{label:"10",value:"10"},{label:"15",value:"15"},{label:"20",value:"20"},{label:"25",value:"25"},{label:"30",value:"30"},{label:"35",value:"35"},{label:"40",value:"40"},{label:"45",value:"45"},{label:"50",value:"50"},{label:"55",value:"55"}
  ];
  const hours_type = [{label:"AM",value:"AM"},{label:"PM",value:"PM"}];
  const days = [
    {label: 'Monday', value: 'Mon'},
    {label: 'Tuesday', value: 'Tue'},
    {label: 'Wednesday', value: 'Wed'},
    {label: 'Thursday', value: 'Thu'},
    {label: 'Friday', value: 'Fri'},
    {label: 'Saturday', value: 'Sat'},
    {label: 'Sunday', value: 'Sun'},
  ];
  const IsFocused = useIsFocused();
  useEffect(() => {
    if (IsFocused) {
      getProfile();
    }
  }, [IsFocused]);

  const getImageValue = async img => {
    ApiFormData(img.assets[0]).then(
      res => {
        console.log(res);

        if (res.status) {
          setUserDetail({
            ...userDetail,
            store_doc: res.data.file,
          });
        }
      },
      err => {
        console.log(err);
      },
    );
  };
  console.log('img', userDetail);
  const cancel = () => {};
  const getImageValue2 = async img => {
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
  const getImageValue3 = async img => {
    ApiFormData(img.assets[0]).then(
      res => {
        console.log(res);

        if (res.status) {
          setUserDetail({
            ...userDetail,
            store_logo: res.data.file,
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
            store_cover_img: res.data.file,
          });
        }
      },
      err => {
        console.log(err);
      },
    );
  };
  // console.log('img', userDetail.img);
  const cancel2 = () => {};

  const getProfile = () => {
    setLoading(true);
    GetApi(`getProfile/GROCERYSELLER`, {}).then(
      async res => {
        setLoading(false);
        console.log(res);
        if (res?.data?.status === 'VERIFIED') {
          navigate('GrocerySellerTab');
          setgrocerysellerProfile(res?.data)
        } else {
          if (!alreadyusedmodel) {
            setTimeout(()=>{
              setmodel(true);
              setalreadyusedmodel(true);
            },500)
          }
          setStatus(res?.data?.status ? res?.data?.status : 'Pending');
          setUserDetail({
            ...res?.data,
            phone: res?.data?.phone ?? user?.phone ?? '',
            username: res?.data?.username ?? user?.username ?? '',
          });
          if (res.data?.address === '' || !res.data?.address) {
            CustomCurrentLocation();
          }
          if (res?.data?.available_days) {
          setselecteddays(res?.data?.available_days);
        }
        if (res?.data?.opeing_time||res?.data?.close_time) {
          setselstarthour(res?.data?.opeing_time.split(":")[0])
          setselstartmin(res?.data?.opeing_time.split(":")[1].split(" ")[0])
          setselstarttype(res?.data?.opeing_time.split(":")[1].split(" ")[1])
          setselendhour(res?.data?.close_time.split(":")[0])
          setselendmin(res?.data?.close_time.split(":")[1].split(" ")[0])
          setselendtype(res?.data?.close_time.split(":")[1].split(" ")[1])
        }
        }
      },
      err => {
        setLoading(false);
        console.log(err);
      },
    );
  };
  const submit = async () => {
    console.log(userDetail);
    if (
      userDetail.username === '' ||
      !userDetail.username ||
      userDetail.address === '' ||
      !userDetail.address ||
      userDetail.country === '' ||
      !userDetail.country ||
      userDetail.store_name === '' ||
      !userDetail.store_name||
      !userDetail.phone ||
      userDetail.store_doc === '' ||
      !userDetail.store_doc||
      userDetail.national_id_no === '' ||
      !userDetail.national_id_no ||
      userDetail.national_id === ''||
      !userDetail.national_id ||
      userDetail.tax_no === ''||
      !userDetail.tax_no ||
      userDetail.store_logo === ''||
      !userDetail.store_logo ||
      userDetail.store_cover_img === ''||
      !userDetail.store_cover_img 
    ) {
      setSubmitted(true);
      return;
    }
if (selecteddays.length==0){ 
  setToast("Please select availability days");
  return;
}
if (selstarthour===""||selstartmin===""||selstarttype===""){ 
  setToast("Please select shop opening time");
  return;
}
if (selendhour===""||selendmin===""||selendtype===""){ 
  setToast("Please select shop closing time");
  return;
}
    userDetail.available_days=selecteddays,
    userDetail.opeing_time=`${selstarthour}:${selstartmin} ${selstarttype}`,
    userDetail.close_time=`${selendhour}:${selendmin} ${selendtype}`
    // const regex2 = /^[1-9]\d{9}$/;

    // if (regex2.test(userDetail.number)) {
    //   console.log('Valid mobile number');
    // } else {
    //   setToast([{error: true, message: 'Please enter a valid mobile number'}]);
    //   return;
    // }
    setLoading(true);
    Post('updateProfile/GROCERYSELLER', userDetail, {}).then(
      async res => {
        setLoading(false);
        console.log(res);

        if (res.status) {
          setToast(res.data.message);
          setUpdateModel(true)
          getProfile();
        } else {
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
    setUserDetail({
      ...userDetail,
      address: add,
      location: {
        type: 'Point',
        coordinates: [lat.lng, lat.lat],
      },
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
    <SafeAreaView style={{flex: 1}}>
      <KeyboardAvoidingView 
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={{flex:1}}
            >
    <ScrollView
      style={[styles.container]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="always">
      <View style={{flexDirection: 'row', gap: 20, alignItems: 'center'}}>
        <BackIcon height={25} width={25} color={Constants.black} onPress={() => goBack()} />
        <Text style={styles.headtxt}>{t("Create store")}</Text>
      </View>
      <View style={{flexDirection: 'row', marginTop: 10}}>
        <Text style={styles.statustxt}>{t("Verification Status")} -</Text>
        <Text style={[styles.statustxt, {color: '#fab905', marginLeft: 3}]}>
          {status}
        </Text>
      </View>
      <View style={styles.avilbox}>
        <Text style={[styles.jobtitle,{marginTop:0}]}>{t('Availability')}</Text>
        <View style={{flexWrap: 'wrap', flexDirection: 'row', gap: 10}}>
          {days.map((item, index) => (
            <TouchableOpacity key={index} style={selecteddays.includes(item.value)?styles.seldaysbox:styles.daysbox} onPress={() => {
              const alreadyinit = selecteddays.includes(item.value);
                  if (alreadyinit) {
                    setselecteddays(prevItems =>
                      prevItems.filter(it => it !== item.value),
                    );
                  } else {
                    setselecteddays(prevItems => [...prevItems, item.value]);
                  }
            }}>
              <Text style={[styles.seldaytxt,{color:selecteddays.includes(item.value)?Constants.white:Constants.black}]}>{t(item?.label)}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View>
        <Text style={[styles.jobtitle2]}>{t('Shop opening time')}</Text>
        <View style={{flexDirection:'row'}}>
        <Dropdown
          ref={dropdownRef}
          data={hours}
          labelField="label"
          valueField="label"
          placeholder="00"
          value={selstarthour}
          onChange={item => {}}
          renderItem={dditem => (
            <TouchableOpacity
              style={styles.itemContainer}
              onPress={() => {
                setselstarthour(dditem?.value);
                dropdownRef.current?.close();
              }}
            >
              <Text style={styles.itemText}>{dditem.label}</Text>
            </TouchableOpacity>
          )}
          style={styles.dropdown}
          containerStyle={styles.dropdownContainer}
          // iconColor={}
          placeholderStyle={styles.placeholder}
          selectedTextStyle={styles.selectedText}
          itemTextStyle={styles.itemText}
          itemContainerStyle={styles.itemContainerStyle}
          selectedItemStyle={styles.selectedStyle}
        />
        <Dropdown
          ref={dropdownRef2}
          data={minutes}
          labelField="label"
          valueField="label"
          placeholder="00"
          value={selstartmin}
          onChange={item => {}}
          renderItem={dditem => (
            <TouchableOpacity
              style={styles.itemContainer}
              onPress={() => {
                setselstartmin(dditem?.value);
                dropdownRef2.current?.close();
              }}
            >
              <Text style={styles.itemText}>{dditem.label}</Text>
            </TouchableOpacity>
          )}
          style={styles.dropdown}
          containerStyle={styles.dropdownContainer}
          // iconColor={}
          placeholderStyle={styles.placeholder}
          selectedTextStyle={styles.selectedText}
          itemTextStyle={styles.itemText}
          itemContainerStyle={styles.itemContainerStyle}
          selectedItemStyle={styles.selectedStyle}
        />
        <Dropdown
          ref={dropdownRef3}
          data={hours_type}
          labelField="label"
          valueField="label"
          placeholder="AM"
          value={selstarttype}
          onChange={item => {}}
          renderItem={dditem => (
            <TouchableOpacity
              style={styles.itemContainer}
              onPress={() => {
                setselstarttype(dditem?.value);
                dropdownRef3.current?.close();
              }}
            >
              <Text style={styles.itemText}>{dditem.label}</Text>
            </TouchableOpacity>
          )}
          style={styles.dropdown}
          containerStyle={styles.dropdownContainer}
          // iconColor={}
          placeholderStyle={styles.placeholder}
          selectedTextStyle={styles.selectedText}
          itemTextStyle={styles.itemText}
          itemContainerStyle={styles.itemContainerStyle}
          selectedItemStyle={styles.selectedStyle}
        />
        </View>
        </View>
        <View>
        <Text style={[styles.jobtitle2]}>{t('Shop closeing time')}</Text>
        <View style={{flexDirection:'row'}}>
        <Dropdown
          ref={dropdownRef4}
          data={hours}
          labelField="label"
          valueField="label"
          placeholder="00"
          value={selendhour}
          onChange={item => {}}
          renderItem={dditem => (
            <TouchableOpacity
              style={styles.itemContainer}
              onPress={() => {
                setselendhour(dditem.value);
                dropdownRef4.current?.close();
              }}
            >
              <Text style={styles.itemText}>{dditem.label}</Text>
            </TouchableOpacity>
          )}
          style={styles.dropdown}
          containerStyle={styles.dropdownContainer}
          // iconColor={}
          placeholderStyle={styles.placeholder}
          selectedTextStyle={styles.selectedText}
          itemTextStyle={styles.itemText}
          itemContainerStyle={styles.itemContainerStyle}
          selectedItemStyle={styles.selectedStyle}
        />
        <Dropdown
          ref={dropdownRef5}
          data={minutes}
          labelField="label"
          valueField="label"
          placeholder="00"
          value={selendmin}
          onChange={item => {}}
          renderItem={dditem => (
            <TouchableOpacity
              style={styles.itemContainer}
              onPress={() => {
                setselendmin(dditem?.value);
                dropdownRef5.current?.close();
              }}
            >
              <Text style={styles.itemText}>{dditem.label}</Text>
            </TouchableOpacity>
          )}
          style={styles.dropdown}
          containerStyle={styles.dropdownContainer}
          // iconColor={}
          placeholderStyle={styles.placeholder}
          selectedTextStyle={styles.selectedText}
          itemTextStyle={styles.itemText}
          itemContainerStyle={styles.itemContainerStyle}
          selectedItemStyle={styles.selectedStyle}
        />
        <Dropdown
          ref={dropdownRef6}
          data={hours_type}
          labelField="label"
          valueField="label"
          placeholder="AM"
          value={selendtype}
          onChange={item => {}}
          renderItem={dditem => (
            <TouchableOpacity
              style={styles.itemContainer}
              onPress={() => {
                setselendtype(dditem?.value);
                dropdownRef6.current?.close();
              }}
            >
              <Text style={styles.itemText}>{dditem.label}</Text>
            </TouchableOpacity>
          )}
          style={styles.dropdown}
          containerStyle={styles.dropdownContainer}
          // iconColor={}
          placeholderStyle={styles.placeholder}
          selectedTextStyle={styles.selectedText}
          itemTextStyle={styles.itemText}
          itemContainerStyle={styles.itemContainerStyle}
          selectedItemStyle={styles.selectedStyle}
        />
        </View>
        </View>
        </View>
      <View>
        <Text style={[styles.jobtitle]}>{t("Full Name")}</Text>
        <TextInput
          style={[styles.input]}
          placeholder={t("Enter Name")}
          value={userDetail?.username}
          onChangeText={username => setUserDetail({...userDetail, username})}
          placeholderTextColor={Constants.customgrey2}
        />
      </View>
      {submitted && (userDetail.username === '' || !userDetail.username) && (
        <Text style={styles.require}>{t("Name is required")}</Text>
      )}
      <View>
        <Text style={[styles.jobtitle]}>{t("Store Name")}</Text>
        <TextInput
          style={[styles.input]}
          // autoCapitalize="characters"
          //   placeholder="Enter Name"
          placeholderTextColor={Constants.customgrey2}
          value={userDetail?.store_name}
          onChangeText={store_name =>
            setUserDetail({...userDetail, store_name: store_name})
          }
        />
      </View>
      {submitted &&
        (userDetail.store_name === '' || !userDetail.store_name) && (
          <Text style={styles.require}>{t("Store Name is required")}</Text>
        )}

      <View>
        <Text style={[styles.jobtitle]}>{t("Country")}</Text>
        <TextInput
          style={[styles.input]}
          // placeholder="Enter Country"
          placeholderTextColor={Constants.customgrey2}
          value={userDetail?.country}
          onChangeText={country => setUserDetail({...userDetail, country})}
        />
      </View>
      {submitted && (userDetail.country === '' || !userDetail.country) && (
        <Text style={styles.require}>{t("Country is required")}</Text>
      )}
      <Text style={[styles.jobtitle]}>{t("Address")}</Text>
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
      </View>
      {submitted && (userDetail.address === '' || !userDetail.address) && (
        <Text style={styles.require}>{t("Address is required")}</Text>
      )}
      <View>
        <Text style={[styles.jobtitle]}>{t("Phone Number")}</Text>
        <TextInput
          style={[styles.input]}
          //   placeholder="Enter Name"
          // maxLength={10}
          placeholderTextColor={Constants.customgrey2}
          keyboardType="number-pad"
          value={userDetail?.phone}
          onChangeText={phone => setUserDetail({...userDetail, phone})}
        />
      </View>
      {submitted && (userDetail.phone === '' || !userDetail.phone) && (
        <Text style={styles.require}>{t("Number is required")}</Text>
      )}
      <View style={[styles.twoimgcov,{marginVertical:10}]}>
        <View style={{width:"35%"}}>
        <Text style={styles.jobtitle}>{t("Store Logo (1:1)")}</Text>
        </View>
        <View style={{width:"55%"}}>
        <Text style={styles.jobtitle}>{t("Store Cover (3:1)")}</Text>
        </View>
        </View>
      <View
        style={styles.twoimgcov}>
          {userDetail?.store_logo?<TouchableOpacity style={{width: '35%'}} onPress={() => {
            Keyboard.dismiss();
            setTimeout(() => {
              cameraRef3.current.show();
            }, 100)}}><Image source={{uri:userDetail?.store_logo}} style={styles.imagest}/></TouchableOpacity>:
        <TouchableOpacity
          style={styles.uploadbox2}
          onPress={async() => {
            Keyboard.dismiss();
            setTimeout(() => {
              cameraRef3.current.show();
            }, 100);
            // try {
            //   const res = await pick();
            //   console.log(res);
            //   const [copyResult] = await keepLocalCopy({
            //     files: [
            //       {
            //         uri: res[0].uri,
            //         fileName: res[0].name ?? 'fallback-name',
            //       },
            //     ],
            //     destination: 'documentDirectory',
            //   });
            //   if (copyResult.status === 'success') {
            //     // do something with the local copy:
            //     console.log(copyResult.localUri);
            //     //need to upload
            //     const data = {
            //       fileName: res[0].name,
            //       type: res[0].nativeType,
            //       uri: copyResult.localUri,
            //     };
            //     setLoading(true)
            //     ApiFormData(data).then(
            //       res => {
            //         setLoading(false)
            //         console.log(res);

            //         if (res.status) {
            //           setUserDetail({
            //             ...userDetail,
            //             store_logo: res.data.file,
            //           });
            //         }
            //       },
            //       err => {
            //         console.log(err);
            //       },
            //     );
            //   }
            // } catch (err) {}
          }}>
          <View style={styles.uplodiconcov}>
            <Upload2Icon
              color={Constants.normal_green}
              height={20}
              width={20}
            />
          </View>
          <Text style={styles.uploadtxt2}>Upload Store Logo</Text>
        </TouchableOpacity>}
        {userDetail?.store_cover_img?<TouchableOpacity style={{width: '55%'}} onPress={() => {
            Keyboard.dismiss();
            setTimeout(() => {
              cameraRef4.current.show();
            }, 100)}}><Image source={{uri:userDetail?.store_cover_img}} style={styles.imagest2}/></TouchableOpacity>:
        <TouchableOpacity
          style={styles.uploadbox3}
          onPress={async() => {
            Keyboard.dismiss();
            setTimeout(() => {
              cameraRef4.current.show();
            }, 100);
            //  try {
            //   const res = await pick();
            //   console.log(res);
            //   const [copyResult] = await keepLocalCopy({
            //     files: [
            //       {
            //         uri: res[0].uri,
            //         fileName: res[0].name ?? 'fallback-name',
            //       },
            //     ],
            //     destination: 'documentDirectory',
            //   });
            //   if (copyResult.status === 'success') {
            //     // do something with the local copy:
            //     console.log(copyResult.localUri);
            //     //need to upload
            //     const data = {
            //       fileName: res[0].name,
            //       type: res[0].nativeType,
            //       uri: copyResult.localUri,
            //     };
            //     setLoading(true)
            //     ApiFormData(data).then(
            //       res => {
            //         console.log(res);
            //         setLoading(false)
                    
            //         if (res.status) {
            //           setUserDetail({
            //             ...userDetail,
            //             store_cover_img: res.data.file,
            //           });
            //         }
            //       },
            //       err => {
            //         console.log(err);
            //       },
            //     );
            //   }
            // } catch (err) {}
          }}>
          <View style={styles.uplodiconcov}>
            <Upload2Icon
              color={Constants.normal_green}
              height={20}
              width={20}
            />
          </View>
          <Text style={styles.uploadtxt3}>{t("Upload Store Cover")}</Text>
          <Text style={styles.uploadtxt4}>
            {t("Upload jpg, png, jpeg maximum 2 MB")}
          </Text>
        </TouchableOpacity>}
      </View>
      <View style={styles.twoimgcov}>
        <View style={{width:"35%"}}>
        {submitted && !userDetail?.store_logo && (
        <Text style={styles.require}>{t("Store logo is required")}</Text>
      )} 
        </View>
        <View style={{width:"55%"}}>
        {submitted && !userDetail?.store_cover_img && (
        <Text style={styles.require}>{t("Store Cover  is required")}</Text>
      )} 
        </View>
      </View>
         <View >
          <Text style={[styles.jobtitle]}>{t("Tax Number")}</Text>
          <TextInput
            style={[styles.input]}
            placeholderTextColor={Constants.customgrey2}
            value={userDetail?.tax_no}
            onChangeText={tax_no => {
              setUserDetail({
                ...userDetail,
                tax_no: tax_no,
              });
              console.log(userDetail.tax_no);
            }}
          />
  
        </View>
        {submitted && !userDetail?.tax_no && (
        <Text style={styles.require}>{t("Tax Number is required")}</Text>
      )}
      <View
        style={{
          flexDirection: 'row',
          height: 100,
          marginVertical: 15,
          justifyContent: 'center',
        }}>
        <TouchableOpacity
          style={styles.uploadbox}
          onPress={() => {
            Keyboard.dismiss();
            setTimeout(() => {
              cameraRef.current.show();
            }, 100);
          }}>
          <UploadIcon
            color={Constants.normal_green}
            height={'90%'}
            width={'100%'}
          />
          <Text style={styles.uploadtxt}>{t("Store Document")}</Text>
        </TouchableOpacity>
        <View style={styles.uploadimgbox}>
          {/* <Image
                source={require('../../Assets/Images/loginlogo.png')}
                style={styles.imgstyle2}
              /> */}
          {/* {userDetail?.dl_image?.uri && (
              <Image
                source={{
                  uri: userDetail?.dl_image?.uri,
                }}
                style={styles.imgstyle2}
              />
            )} */}
          {userDetail?.store_doc && (
            <Image
              source={{
                uri: userDetail?.store_doc,
              }}
              style={styles.imgstyle2}
            />
          )}
        </View>
      </View>
      {submitted && !userDetail?.store_doc && (
        <Text style={styles.require}>{t("Store Document is required")}</Text>
      )}
      <View>
        <Text style={[styles.jobtitle]}>{t("ID Number")}</Text>
        <TextInput
          style={[styles.input]}
          // autoCapitalize="characters"
          // placeholder="MH12AB1234"
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
      </View>
      {submitted &&
        (userDetail.national_id_no === '' || !userDetail.national_id_no) && (
          <Text style={styles.require}>{t("ID number is required")}</Text>
        )}

      <View style={{flexDirection: 'row', height: 100, marginVertical: 15}}>
        <TouchableOpacity
          style={styles.uploadbox}
          onPress={() => {
            Keyboard.dismiss();
            setTimeout(() => {
              cameraRef2.current.show();
            }, 100);
          }}>
          {/* <Image
              source={require('../../Assets/Images/upload.png')}
              style={styles.imgstyle}
            /> */}
          <UploadIcon
            color={Constants.normal_green}
            height={'90%'}
            width={'100%'}
          />
          <Text style={styles.uploadtxt}>{t("ID Image")}</Text>
        </TouchableOpacity>
        <View style={styles.uploadimgbox}>
          {/* {userDetail?.number_plate_image?.uri && (
              <Image
                source={{
                  uri: `${userDetail.number_plate_image.uri}`,
                }}
                style={styles.imgstyle2}
              />
            )} */}
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

      {/* {userDetail?.number_plate_image?.uri&&  <Image source=
        {{
          uri: `${userDetail.number_plate_image.uri}`,
        }}
        style={{height:50,width:50}}
      // : require('../../Assets/Images/profile.png')
      />} */}

      <TouchableOpacity style={styles.signInbtn} onPress={() => submit()}>
        <Text style={styles.buttontxt}>{t("Submit")}</Text>
      </TouchableOpacity>

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
        cancel={cancel2}
      />
      <CameraGalleryPeacker
        refs={cameraRef3}
        getImageValue={getImageValue3}
        base64={false}
        cancel={cancel2}
      />
      <CameraGalleryPeacker
        refs={cameraRef4}
        getImageValue={getImageValue4}
        base64={false}
        cancel={cancel2}
      />
    </ScrollView>
    </KeyboardAvoidingView>
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

export default GrocerySellerForm;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.white,
    paddingHorizontal: 20,
    paddingVertical: Platform.OS==='ios'?10:20,
  },
  textInput: {
    borderColor: Constants.customgrey5,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 7,
    height: 55,
    // flexDirection: 'row',
  },
  input: {
    color: Constants.black,
    fontSize: 14,
    fontFamily: FONTS.Medium,
    borderRadius: 10,
    // backgroundColor:'red',
    height: 55,
    lineHeight: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: Constants.customgrey5,
  },
  signInbtn: {
    height: 60,
    // width: 370,
    borderRadius: 30,
    backgroundColor: Constants.normal_green,
    marginTop: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  jobtitle: {
    color: Constants.black,
    fontSize: 14,
    fontFamily: FONTS.Medium,
    marginTop: 10,
    marginBottom: 5,
  },
  buttontxt: {
    color: Constants.white,
    fontSize: 18,
    fontFamily: FONTS.Bold,
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
  uploadtxt2: {
    color: Constants.customgrey2,
    fontSize: 14,
    fontFamily: FONTS.Medium,
    textAlign: 'center',
  },
  uploadtxt3: {
    color: Constants.customgrey2,
    fontSize: 12,
    fontFamily: FONTS.Medium,
    textAlign: 'center',
  },
  uploadtxt4: {
    color: Constants.customgrey5,
    fontSize: 10,
    marginHorizontal: 10,
    fontFamily: FONTS.Medium,
    textAlign: 'center',
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
    fontFamily: FONTS.Medium,
    textAlign: 'center',
  },
  button2: {
    backgroundColor: Constants.normal_green,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    // marginBottom: 10,
    borderRadius: 10,
  },
  buttontxt2: {
    color: Constants.white,
    fontSize: 16,
    fontFamily: FONTS.SemiBold,
  },
  imagest: {
    width: '100%',
    height: 130,
    borderRadius: 20,
    resizeMode: 'stretch',
    // marginTop: 30,
  },
  imagest2: {
    width: '100%',
    height: 130,
    borderRadius: 20,
    resizeMode: 'stretch',
    // marginTop: 30,
  },
  uploadbox2: {
    alignItems: 'center',
    width: '35%',
    height: 130,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Constants.normal_green,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    // marginTop: 30,
  },
  uploadbox3: {
    alignItems: 'center',
    width: '55%',
    height: 130,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Constants.normal_green,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    // marginTop: 30,
  },
  uplodiconcov: {
    height: 40,
    width: 40,
    borderRadius: 20,
    backgroundColor: Constants.customgrey5,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  twoimgcov:{
          flexDirection: 'row',
          justifyContent: 'space-evenly',
          width: '100%',
  },
  seldaytxt: {
    color: Constants.white,
    fontSize: 14,
    fontFamily: FONTS.Medium,
  },
  daysbox: {
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 5,
    borderWidth: 1,
    borderColor: Constants.normal_green,
    padding: 10,
    borderRadius: 5,
  },
  seldaysbox: {
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 5,
    borderWidth: 1,
    borderColor: Constants.normal_green,
    padding: 10,
    borderRadius: 5,
    backgroundColor: Constants.normal_green,
  },

  itemContainer: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    // width: '100%',
    backgroundColor: Constants.dark_green,
    borderBottomWidth: 1,
    borderColor: Constants.white,
  },
  dropdownContainer: {
    borderRadius: 12,
    backgroundColor: Constants.dark_green,
  },
  selectedStyle: {
    backgroundColor: Constants.dark_green,
  },
  itemContainerStyle: {
    // borderBottomWidth: 1,
    borderColor: Constants.customgrey,
    backgroundColor: Constants.dark_green,
  },
  placeholder: {
    color: Constants.customgrey2,
    fontSize: 14,
    fontFamily: FONTS.Medium,
    // paddingVertical: 12,
  },
  selectedText: {
    color: Constants.black,
    fontSize: 14,
    fontFamily: FONTS.Medium,
    // paddingVertical: 12,
  },
  itemText: {
    fontSize: 14,
    color: Constants.white,
    fontFamily: FONTS.Medium,
  },
  dropdown: {
    height: 50,
    width: 65,
    // borderWidth: 1,
    // borderColor: Constants.dark_green,
    borderRadius: 10,
    paddingHorizontal: 7,
    backgroundColor: Constants.light_blue3,
  },
  avilbox:{
    borderWidth:1,
    borderColor:Constants.normal_green,
    padding:10,
    borderRadius:10
  },
  jobtitle2: {
    color: Constants.black,
    fontSize: 14,
    fontFamily: FONTS.Medium,
    marginTop: 10,
  },
});
