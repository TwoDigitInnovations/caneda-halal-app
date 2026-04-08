import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {createRef, useContext, useEffect, useRef, useState} from 'react';
import Constants, {FONTS} from '../../Assets/Helpers/constant';
import {goBack, navigate, reset} from '../../../navigationRef';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CameraGalleryPeacker from '../../Assets/Component/CameraGalleryPeacker';
import {DeliveryRiderContext, LoadContext, ToastContext, UserContext} from '../../../App';
import {ApiFormData, GetApi, Post} from '../../Assets/Helpers/Service';
import LocationDropdown from '../../Assets/Component/LocationDropdown';
import {BackIcon, EditIcon, UploadIcon} from '../../../Theme';
import { useTranslation } from 'react-i18next';
import { Dropdown } from 'react-native-element-dropdown';

const DeliveryRiderProfile = () => {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);
  const [edit, setEdit] = useState(false);
  const [vehiclelist, setvehiclelist] = useState([]);
  const [toast, setToast] = useContext(ToastContext);
  const [loading, setLoading] = useContext(LoadContext);
  const [user, setuser] = useContext(UserContext);
  const [deliveryriderProfile, setdeliveryriderProfile] = useContext(DeliveryRiderContext)
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
    vehicle_colour:'',
    vehicle_model:'',
    vehicle_company:'',
    vehicle_type:''
  });
const dropdownRef = useRef();
  const cameraRef = createRef();
  const cameraRef2 = createRef();
  const cameraRef3 = createRef();
  const cameraRef4 = createRef();
  const cameraRef5 = createRef();
  const cameraRef6 = createRef();

  useEffect(() => {
    getProfile();
  }, []);
  //  useEffect(() => {
  //     getalltrucktype();
  //   }, []);

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
    

  const getProfile = () => {
    setLoading(true);
    GetApi(`getProfile/DELIVERYRIDER`, {}).then(
      async res => {
        setLoading(false);
        console.log(res);
        setUserDetail(res.data);
        setdeliveryriderProfile(res?.data)
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
      // userDetail.image === '' ||!userDetail.image||
      // userDetail.vehicle_type === '' ||!userDetail.vehicle_type||
      userDetail.dl_image === '' ||
      !userDetail.dl_image ||
      userDetail.dl_number === '' ||
      !userDetail.dl_number ||
      userDetail.number_plate_image === '' ||
      !userDetail.number_plate_image ||
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
      userDetail.background_check_document === '' ||
      !userDetail.background_check_document
    ) {
      setSubmitted(true);
      return;
    }

    // const regex2 = /^[1-9]\d{9}$/;

    // if (regex2.test(userDetail.number)) {
    //   console.log('Valid mobile number');
    // } else {
    //   setToast([{error: true, message: 'Please enter a valid mobile number'}]);
    //   return;
    // }
    setLoading(true);
    Post('updateProfile/DELIVERYRIDER', userDetail, {}).then(
      async res => {
        setLoading(false);
        console.log(res);

        if (res.status) {
          setToast(res.data.message);
          setdeliveryriderProfile(res.data);
          // getProfile();
          goBack()
          setEdit(false)
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
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.toppart}>
        <View style={styles.frowbtn}>
          <TouchableOpacity style={styles.backcov} onPress={()=>goBack()}>
            <BackIcon color={Constants.black}/>
          </TouchableOpacity>
          <Text style={styles.headtxt1}>{t("Personal details")}</Text>
          <View></View>
        </View>
        <View style={styles.imgpart}>
        {edit && (
          <Pressable
            style={styles.editiconcov}
            onPress={() => cameraRef5.current.show()}>
            <EditIcon height={15} color={Constants.white} />
          </Pressable>
        )}
        <Image
          // source={require('../../../Assets/Images/profile4.png')}
          source={
            userDetail?.image
              ? {
                  uri: `${userDetail.image}`,
                }
              : require('../../Assets/Images/profile2.png')
          }
          style={styles.logo}
          onError={()=>require('../../Assets/Images/profile2.png')}
        />
      </View>
      </View>
      <KeyboardAvoidingView 
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={{flex:1}}
            >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
        style={{marginHorizontal: 20, marginTop: 20}}>
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
       <View >
           <Text style={[styles.jobtitle]}>{t("DL Number")}</Text>
        <TextInput
          style={[styles.input]}
          placeholderTextColor={Constants.customgrey2}
          value={userDetail?.dl_number}
          onChangeText={dl_number =>
            setUserDetail({...userDetail, dl_number: dl_number})
          }
        />
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
              cameraRef.current.show();
            }, 100);
          }}>
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
      <View >
          <Text style={[styles.jobtitle]}>{t("Country")}</Text>
        <TextInput
          style={[styles.input]}
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
        <LocationDropdown
          value={userDetail?.address || ''}
          // focus={from === 'location'}
          // setIsFocus={setFrom}
          // from="location"
          getLocationVaue={(lat, add) => getLocationVaue(lat, add)}
        />
        <View style={[styles.mylivejobtitle]}>
        </View>
      </View>
      {submitted && (userDetail.address === '' || !userDetail.address) && (
        <Text style={styles.require}>{t("Address is required")}</Text>
      )}

      {/* <View >
          <Text style={[styles.jobtitle]}>{t("Address support letter")}</Text>
        <TextInput
          style={[styles.input]}
          value={userDetail?.address_support_letter}
          onChangeText={address_support_letter =>
            setUserDetail({...userDetail, address_support_letter})
          }
        />
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
          justifyContent: 'center',
          
        }}>
        <TouchableOpacity
          style={styles.uploadbox}
          onPress={() => {
            Keyboard.dismiss();
            setTimeout(() => {
              cameraRef6.current.show();
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
                uri: userDetail?.address_support_letter,
              }}
              style={styles.imgstyle2}
            />
          )}
        </View>
      </View>
      {user?.countryCode==='1'&&<View >
          <Text style={[styles.jobtitle]}>{t("SIN Number")}</Text>
        <TextInput
          style={[styles.input]}
          value={userDetail?.sin_number}
          onChangeText={sin_number =>
            setUserDetail({...userDetail, sin_number})
          }
        />
      </View>}
      {submitted &&
        (userDetail.sin_number === '' || !userDetail.sin_number) && user?.countryCode==='1'&&(
          <Text style={styles.require}>{t("SIN Number is required")}</Text>
        )}
      <View >
          <Text style={[styles.jobtitle]}>{t("Phone Number")}</Text>
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
      </View>
      {submitted && (userDetail.phone === '' || !userDetail.phone) && (
        <Text style={styles.require}>{t("Number is required")}</Text>
      )}

{/* <View >
  <Text style={styles.jobtitle}>{t("Vehicle Type")}</Text>
        <Dropdown
          ref={dropdownRef}
          data={vehiclelist}
          labelField="name"
          valueField="_id"
          placeholder={t("Select Vehicle Type")}
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
          placeholderStyle={styles.placeholder}
          selectedTextStyle={styles.selectedText}
        />
      </View>
      {submitted &&
        (userDetail?.vehicle_type == '' || !userDetail?.vehicle_type) && (
          <Text style={styles.require}>{t("Vehicle type is required")}</Text>
        )}
          <View >
          <Text style={[styles.jobtitle]}>{t("Vehicle Company")}</Text>
          <TextInput
            style={[styles.input]}
            value={userDetail?.vehicle_company}
            onChangeText={vehicle_company =>
              setUserDetail({...userDetail, vehicle_company})
            }
          />
        </View>
        {submitted &&
          (userDetail.vehicle_company === '' ||
            !userDetail.vehicle_company) && (
            <Text style={styles.require}>{t("Vehicle Company is required")}</Text>
          )}
          <View >
          <Text style={[styles.jobtitle]}>{t("Vehicle Model")}</Text>
          <TextInput
            style={[styles.input]}
            value={userDetail?.vehicle_model}
            onChangeText={vehicle_model =>
              setUserDetail({...userDetail, vehicle_model})
            }
          />
        </View>
        {submitted &&
          (userDetail.vehicle_model === '' ||
            !userDetail.vehicle_model) && (
            <Text style={styles.require}>{t("Vehicle Model is required")}</Text>
          )}
          <View >
          <Text style={[styles.jobtitle]}>{t("Vehicle Colour")}</Text>
          <TextInput
            style={[styles.input]}
            value={userDetail?.vehicle_colour}
            onChangeText={vehicle_colour =>
              setUserDetail({...userDetail, vehicle_colour})
            }
          />
        </View>
        {submitted &&
          (userDetail.vehicle_colour === '' ||
            !userDetail.vehicle_colour) && (
            <Text style={styles.require}>{t("Vehicle Colour is required")}</Text>
          )} */}

      <View >
          <Text style={[styles.jobtitle]}>{t("Number Plate")}</Text>
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
      </View>
      {submitted &&
        (userDetail.number_plate_no === '' || !userDetail.number_plate_no) && (
          <Text style={styles.require}>{t("Number plate is required")}</Text>
        )}
      <View
        style={{
          flexDirection: 'row',
          height: 120,
          marginTop: 20,
          marginBottom: 10,
        }}>
        <TouchableOpacity
          style={styles.uploadbox}
          onPress={() => {
            Keyboard.dismiss();
            setTimeout(() => {
              cameraRef2.current.show();
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

      <View >
          <Text style={[styles.jobtitle]}>{t("ID Number")}</Text>
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
              cameraRef3.current.show();
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
              cameraRef4.current.show();
            }, 100);
          }}>
          <UploadIcon
            color={Constants.dark_green}
            height={'80%'}
            width={'100%'}
          />
          <View>
          <Text style={styles.uploadtxt}>{t("Background check document image")}</Text>
          </View>
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

       {edit? <TouchableOpacity style={styles.signInbtn} onPress={() => submit()}>
          <Text style={styles.buttontxt}>{t("Submit")}</Text>
        </TouchableOpacity>:
        <TouchableOpacity style={styles.signInbtn} onPress={() =>setEdit(true)}>
          <Text style={styles.buttontxt}>{t("Edit")}</Text>
        </TouchableOpacity>}
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
    </SafeAreaView>
  );
};

export default DeliveryRiderProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.white,
  },
  backcov: {
    height: 30,
    width: 30,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Constants.white,
  },
  frowbtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    // justifyContent:'space-between'
  },
  toppart: {
    backgroundColor: Constants.normal_green,
    padding: 20,
    minHeight: '18%',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headtxt1: {
    fontSize: 16,
    color: Constants.white,
    fontFamily: FONTS.Medium,
    // textAlign: 'center',
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
  require: {
    color: Constants.red,
    fontFamily: FONTS.Medium,
    marginLeft: 10,
    fontSize: 14,
    marginTop: 10,
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
    // backgroundColor:'red'
  },
  uploadimgbox: {
    flex: 1,
    alignItems: 'center',
  },
  uploadtxt: {
    color: Constants.black,
    fontSize: 14,
    fontFamily: FONTS.Medium,
    textAlign: 'center',
    lineHeight:17
  },
  imgpart: {
    height: 120,
    width: 120,
    alignSelf: 'center',
    position: 'relative',
    zIndex: 9,
    marginBottom: 20,
  },
  editiconcov: {
    height: 30,
    width: 30,
    borderRadius: 15,
    backgroundColor: Constants.dark_green,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    // marginTop: 115,
    right: -5,
    bottom: 0,
    zIndex: 9,
  },
  logo: {
    height: 100,
    width: 100,
    alignSelf: 'center',
    borderRadius: 60,
    marginTop: 20,
  },
  dropdown: {
     borderColor: Constants.customgrey5,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 7,
    height: 60,
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
