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
  Pressable,
  KeyboardAvoidingView,
} from 'react-native';
import React, {createRef, useContext, useEffect, useRef, useState} from 'react';
import Constants, {FONTS} from '../../../Assets/Helpers/constant';
import {ApiFormData, GetApi, Post} from '../../../Assets/Helpers/Service';
import CameraGalleryPeacker from '../../../Assets/Component/CameraGalleryPeacker';
import {BackIcon, EditIcon} from '../../../../Theme';
import {goBack, navigate} from '../../../../navigationRef';
import {GroceryUserContext, LoadContext, ToastContext, UserContext} from '../../../../App';
import {Dropdown} from 'react-native-element-dropdown';
import { checkEmail } from '../../../Assets/Helpers/InputsNullChecker';
import { useTranslation } from 'react-i18next';

const Groceryprofile = props => {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);
  const [toast, setToast] = useContext(ToastContext);
  const [loading, setLoading] = useContext(LoadContext);
  const [groceryuserProfile, setgroceryuserProfile] = useContext(GroceryUserContext);
  const [user, setuser] = useContext(UserContext);
  const [edit, setEdit] = useState(false);
  const [userDetail, setUserDetail] = useState({
    username: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    getProfile();
  }, []);
  const dropdownRef = useRef();
  const cameraRef = createRef();

  const getImageValue = async img => {
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

  const cancel = () => {};

  const getProfile = () => {
    setLoading(true);
    GetApi(`getProfile/GROCERYUSER`, {}).then(
      async res => {
        setLoading(false);
         setUserDetail({
                 ...res?.data,
                 phone: res?.data?.phone ?? user?.phone ?? '',
                 username: res?.data?.username ?? user?.username ?? '',
               });
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
      userDetail.phone === '' ||
      !userDetail.phone
    ) {
      setSubmitted(true);
      return;
    }
    if (userDetail?.email) {
     const emailcheck = checkEmail(userDetail.email.trim());
    if (!emailcheck) {
      setToast('Your email id is invalid');
      return;
    }
  }
    setLoading(true);
    Post('updateProfile/GROCERYUSER', userDetail, {}).then(
      async res => {
        setLoading(false);
        console.log(res);
        if (res.status) {
          setgroceryuserProfile(res?.data);
          setEdit(false)
          goBack();
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
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
       <TouchableOpacity style={styles.backcov} onPress={() => goBack()}>
               <BackIcon  />
                 </TouchableOpacity>
        <Text style={styles.headtxt}>{t("Personal Data")}</Text>
        <View></View>
      </View>

      <View style={styles.imgpart}>
        {edit && (
          <Pressable
            style={styles.editiconcov}
            onPress={() => cameraRef.current.show()}>
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
              : require('../../../Assets/Images/profile.png')
          }
          style={styles.logo}
        />
      </View>

        <Text style={[styles.jobtitle]}>{t("Full Name")}</Text>
        <TextInput
          style={[styles.input]}
          placeholder={t("Enter Name")}
          value={userDetail?.username}
          onChangeText={username => setUserDetail({...userDetail, username})}
          placeholderTextColor={Constants.customgrey2}
        />
      {submitted && (userDetail.username === '' || !userDetail.username) && (
        <Text style={styles.require}>{t("Name is required")}</Text>
      )}
        {/* <Text style={[styles.jobtitle]}>Date of birth</Text>
        <TextInput
          style={[styles.input]}
          placeholder="Enter dob"
          value={userDetail?.dob}
          onChangeText={dob => setUserDetail({...userDetail, dob})}
          placeholderTextColor={Constants.customgrey2}
        />
      {submitted && (userDetail.dob === '' || !userDetail.dob) && (
        <Text style={styles.require}>Number is required</Text>
      )} */}
        <Text style={[styles.jobtitle]}>{t("Phone")}</Text>
        <TextInput
          style={[styles.input]}
          placeholder={t("Enter Number")}
          value={userDetail?.phone}
          onChangeText={phone => setUserDetail({...userDetail, phone})}
          placeholderTextColor={Constants.customgrey2}
        />
      {submitted && (userDetail.phone === '' || !userDetail.phone) && (
        <Text style={styles.require}>{t("Number is required")}</Text>
      )}
      {/* <View style={styles.textInput}>
      <Text style={styles.jobtitle}>Gender</Text>
        <Dropdown
          ref={dropdownRef}
          data={genderlist}
          labelField="name"
          valueField="value"
          placeholder="Select Gender"
          value={userDetail?.gender}
          onChange={item => {}}
          renderItem={item => (
            <TouchableOpacity
              style={styles.itemContainer}
              onPress={() => {
                setUserDetail({...userDetail, gender: item?.value});
                dropdownRef.current?.close();
              }}>
              <Text style={styles.itemText}>{item.name}</Text>
            </TouchableOpacity>
          )}
          style={styles.dropdown}
          placeholderStyle={styles.placeholder}
          selectedTextStyle={styles.selectedText}
        />
      </View> */}
           <Text style={[styles.jobtitle]}>{t("Email")}</Text>
        <TextInput
          style={[styles.input]}
          placeholder={t("Enter email")}
          value={userDetail?.email}
          onChangeText={email => setUserDetail({...userDetail, email})}
          placeholderTextColor={Constants.customgrey2}
        />

      {edit?<TouchableOpacity style={styles.signInbtn} onPress={() => submit()}>
        <Text style={styles.buttontxt}>{t("Save")}</Text>
      </TouchableOpacity>:
      <TouchableOpacity style={styles.signInbtn} onPress={() => setEdit(true)}>
        <Text style={styles.buttontxt}>{t("Edit")}</Text>
      </TouchableOpacity>}

      <CameraGalleryPeacker
        refs={cameraRef}
        getImageValue={getImageValue}
        base64={false}
        cancel={cancel}
      />
    </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Groceryprofile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.white,
    padding: 20,
  },
  imgpart: {
    height: 120,
    width: 120,
    alignSelf: 'center',
    position: 'relative',
    zIndex: 9,
    marginBottom: 20,
  },
   backcov: {
    height: 30,
    width: 30,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Constants.customgrey4,
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
  input: {
    color: Constants.black,
    fontSize: 14,
    fontFamily: FONTS.Medium,
    borderRadius:10,
    // backgroundColor:'red',
    height: 55,
    lineHeight: 14,
    padding: 10,
    borderWidth:1,
    borderColor:Constants.customgrey5
  },
  signInbtn: {
    height: 50,
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
    marginTop:10,
    marginBottom:5
  },
  buttontxt: {
    color: Constants.white,
    fontSize: 16,
    fontFamily: FONTS.Medium,
  },
  headtxt: {
    color: Constants.black,
    fontSize: 16,
    fontFamily: FONTS.SemiBold,
  },
  require: {
    color: Constants.red,
    fontFamily: FONTS.Medium,
    marginLeft: 10,
    fontSize: 14,
    marginTop: 10,
  },
  dropdown: {
    height: 55,
    borderWidth:1,
    borderColor:Constants.customgrey5,
    borderRadius:10,
    paddingHorizontal:10
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
