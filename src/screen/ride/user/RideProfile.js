import {Image, Platform, Pressable, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import React, { createRef, useContext, useEffect, useState } from 'react';
import Constants, { FONTS } from '../../../Assets/Helpers/constant';
import { EditIcon } from '../../../../Theme';
import { goBack } from '../../../../navigationRef';
import { ApiFormData, GetApi, Post } from '../../../Assets/Helpers/Service';
import CameraGalleryPeacker from '../../../Assets/Component/CameraGalleryPeacker';
import { LoadContext, ProfileContext, ToastContext } from '../../../../App';
import { useTranslation } from 'react-i18next';

const RideProfile = () => {
  const { t } = useTranslation();
  const [edit, setEdit] = useState(true);
  const [submitted, setSubmitted] = useState(false);
    const [toast, setToast] = useContext(ToastContext);
    const [loading, setLoading] = useContext(LoadContext);
    const [profile, setProfile] = useContext(ProfileContext);
     const [userDetail, setUserDetail] = useState({
        phone: '',
        username: '',
      });

      const cameraRef = createRef();
      useEffect(() => {
        getProfile();
      }, []);
    
      const getProfile = () => {
        setLoading(true);
        GetApi(`getProfile/RIDEUSER`, {}).then(
          async res => {
            setLoading(false);
            console.log(res.data);
              setUserDetail(res?.data)
          },
          err => {
            setLoading(false);
            console.log(err);
          },
        );
      };
    
      const updateProfile = () => {
        if (userDetail?.username === '') {
          setSubmitted(true);
          return;
        }
          setLoading(true);
          Post('updateProfile/RIDEUSER', userDetail, {}).then(
            async res => {
              setLoading(false);
              console.log(res);
              setProfile(res?.data)
              goBack()
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
                setEdit(true);
                setUserDetail({
                  ...userDetail,
                  image: res.data.file,
                });
              }
            },
            err => {
              setEdit(false);
              console.log(err);
            },
          );
        };
        console.log('img', userDetail.img);
        const cancel = () => {
          // setEdit(false);
        };
  return (
    <SafeAreaView style={{flex:1}}>
    <View style={styles.container}>
      <View style={styles.topcov}>
        {/* <BackIcon height={30} width={30} /> */}
        <Text style={styles.cancletxt} onPress={()=>goBack()}>{t("Cancel")}</Text>
      </View>
      <Text style={styles.edittxt}>{t("Edit profile")}</Text>
      <View
          style={{
            height: 120,
            width: 120,
            alignSelf: 'center',
            position: 'relative',
            zIndex: 9,
            marginBottom: 20,
          }}>
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
        <View style={[styles.inpucov,{backgroundColor:submitted && userDetail.username === ''?Constants.light_red:Constants.customgrey4}]}>
          <Text style={styles.headtxt}>{t("Full Name")}</Text>
          <TextInput style={styles.inputfield} placeholderTextColor={Constants.black}value={userDetail.username}
              onChangeText={username =>
                setUserDetail({...userDetail, username})
              }></TextInput>
        </View>
        {submitted && userDetail.username === '' && (
            <Text style={styles.require}>{t("Name is required")}</Text>
          )}
        <View style={[styles.inpucov,{backgroundColor:submitted && userDetail.phone === ''?Constants.light_red:Constants.customgrey4}]}>
        <Text style={styles.headtxt}>{t("Phone Number")}</Text>
          <TextInput style={[styles.inputfield,{color:Constants.customgrey2}]} placeholderTextColor={Constants.black}
          keyboardType='number-pad' value={userDetail.phone}
          editable={false}
              onChangeText={phone =>
                setUserDetail({...userDetail, phone})
              }></TextInput>
          
        </View>
        {submitted && userDetail.phone === '' && (
            <Text style={styles.require}>{t("Number is required")}</Text>
          )}
          <Text style={styles.butomtxt}>{t("Your phone number can’t be changed. if you want to link your account to another phone number, please contact Customer Support")}</Text>
          <TouchableOpacity style={styles.signInbtn} onPress={updateProfile}>
          <Text style={styles.buttontxt}>{t("Save")}</Text>
        </TouchableOpacity>
          <CameraGalleryPeacker
          refs={cameraRef}
          getImageValue={getImageValue}
          base64={false}
          cancel={cancel}
        />
        </View>
    </SafeAreaView>
  );
};

export default RideProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.white,
    paddingHorizontal: 20,
    paddingVertical:Platform.OS==='ios'?10: 20,
  },
  topcov: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // marginVertical:20
  },
  cancletxt: {
    color: Constants.dark_green,
    fontFamily: FONTS.Regular,
    fontSize: 14,
  },
  edittxt: {
    color: Constants.black,
    fontFamily: FONTS.SemiBold,
    fontSize: 16,
    textAlign:'center'
  },
  logo: {
    height: 100,
    width: 100,
    alignSelf: 'center',
    borderRadius: 60,
    marginTop: 20,
  },
  inputfield:{
    color:Constants.black,
    fontSize:16,
    fontFamily:FONTS.Medium,
    // flex:1,
    // backgroundColor:'red',
    height:30,
    // lineHeight:20,
    padding:0
  },
  inpucov:{
    backgroundColor:Constants.customgrey,
    marginVertical:10,
    borderRadius:15,
    // height:70,
    paddingHorizontal:10,
    paddingTop:5,
    paddingBottom:5
    // flexDirection:'row'
  },
  require:{
    color:Constants.red,
    fontFamily:FONTS.Medium,
    marginLeft:10,
    fontSize:14
  },
  headtxt:{
    color:Constants.customgrey3,
    fontSize:14,
    fontFamily:FONTS.Regular
  },
  butomtxt:{
    color:Constants.customgrey3,
    fontSize:14,
    fontFamily:FONTS.Regular
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
  signInbtn: {
    height: 40,
    width: '70%',
    borderRadius: 10,
    backgroundColor: Constants.dark_green,
    marginTop: 40,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf:'center',
    marginBottom: 40,
  },
  buttontxt: {
    color: Constants.white,
    fontSize: 14,
    fontFamily: FONTS.SemiBold,
  },
});
