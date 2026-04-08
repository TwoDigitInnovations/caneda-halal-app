import {Image, Modal, Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import Constants, {FONTS} from '../../../Assets/Helpers/constant';
import {BackIcon, CrossIcon, DeleteIcon, HomeIcon, LogoutIcon, Work2Icon, WorkIcon} from '../../../../Theme';
import { goBack, navigate, reset } from '../../../../navigationRef';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoadContext, ProfileContext, ToastContext, UserContext } from '../../../../App';
import { GetApi } from '../../../Assets/Helpers/Service';
import { RadioButton } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

const RideAccount = () => {
  const { t } = useTranslation();
  const [user, setuser] = useContext(UserContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalVisible2, setModalVisible2] = useState(false);
  const [toast, setToast] = useContext(ToastContext);
  const [loading, setLoading] = useContext(LoadContext);
  const [profile, setProfile] = useContext(ProfileContext);
  const [profiledata, setprofiledata] = useState();
  const [jobtype, setjobtype] = useState('main');
//   const logout = async() => {
//     await AsyncStorage.removeItem('userDetail');
//     setuser({})
//     reset('Auth');
// };
// useEffect(() => {
//   getProfile();
// }, []);

// const getProfile = () => {
//   setLoading(true);
//   GetApi(`getProfile/RIDEUSER`, {}).then(
//     async res => {
//       setLoading(false);
//       console.log(res.data);
//       setprofiledata(res.data);
//     },
//     err => {
//       setLoading(false);
//       console.log(err);
//     },
//   );
// };
 const logout = async () => {
    if (jobtype==='main') {
    setuser({})
    reset('Options');
    } else {
    await AsyncStorage.removeItem('userDetail');
    reset('Auth');
    }}
  return (
    <SafeAreaView style={{flex:1}}>
    <View style={styles.container}>
      <View style={styles.topcov}>
        <BackIcon height={30} width={30} color={Constants.black} onPress={()=>goBack()}/>
        <Text style={styles.edittxt} onPress={()=>navigate('RideProfile')}>{t("Edit")}</Text>
      </View>
      <View style={styles.procov}>
        <Image
          source={
            // require('../../../Assets/Images/profile3.png')
              profile?.image
                ? {
                    uri: `${profile.image}`,
                  }
                : require('../../../Assets/Images/profile.png')
          }
          style={styles.proimg}
        />
        <View>
          <Text style={styles.nametxt}>{profile?.username}</Text>
          <Text style={styles.protxt2}>{profile?.phone}</Text>
        </View>
      </View>
      <View style={styles.horline}></View>
      <Text style={styles.favtxt}>{t("Favorite locations")}</Text>
      <TouchableOpacity style={styles.spacbet} onPress={()=>navigate('HomeLocation')}>
        <View style={styles.rowgap}>
          <HomeIcon height={30} width={30} />
          {profile?.home_address?.main_address?<View style={{width:'60%'}}>
          <Text style={styles.nametxt}>{profile?.home_address?.main_address}</Text>
          <Text style={styles.nametxt2}>{profile?.home_address?.secendary_address}</Text>
          </View>:<Text style={styles.nametxt}>{t("Home")}</Text>}
        </View>
        <View style={styles.addbtn}>
          <Text style={styles.addbtntxt}>{t("Add")}</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.spacbet2} onPress={()=>navigate('WorkLocation')}>
        <View style={styles.rowgap}>
          <Work2Icon height={30} width={30} />
          {profile?.work_address?.main_address?<View style={{width:'60%'}}>
          <Text style={styles.nametxt}>{profile?.work_address?.main_address}</Text>
          <Text style={styles.nametxt2}>{profile?.work_address?.secendary_address}</Text>
          </View>:<Text style={styles.nametxt}>{t("Work")}</Text>}
        </View>
        <View style={styles.addbtn}>
          <Text style={styles.addbtntxt}>{t("Add")}</Text>
        </View>
      </TouchableOpacity>
      <View style={styles.horline}></View>
      <TouchableOpacity style={styles.flexgap} onPress={()=>setModalVisible(true)}>
        <LogoutIcon color={Constants.red}/>
        <Text style={styles.redtxt}>{t("Log out")}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.flexgap} onPress={()=>setModalVisible2(true)}>
        <DeleteIcon color={Constants.red}/>
        <Text style={styles.redtxt}>{t("Delete account")}</Text>
      </TouchableOpacity>
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
            <View style={{backgroundColor: 'white', alignItems: 'center'}}>
              <View style={[styles.covline,{width:'100%'}]}>
                <View></View>
                <Text style={styles.textStyle5}>{t("Sign Out")} </Text>
                <TouchableOpacity style={styles.croscov} onPress={()=>setModalVisible(false)}>
                  <CrossIcon color={Constants.black}/>
                </TouchableOpacity>
              </View>
              <Text style={styles.textStyle4}>{t("Where do you want to go after logging out?")}</Text>
              <RadioButton.Group
            onValueChange={type => {
              setjobtype(type);
            }}
            value={jobtype}>
                        <View style={{flexDirection: 'row',marginTop:10}}>
            <RadioButton.Item
              mode="android"
              label={t("Main Menu")}
              value="main"
              position="leading"
              style={[styles.box2,]}
              color={Constants.normal_green}
              uncheckedColor={Constants.black}
              labelStyle={{
                color: jobtype === 'main' ? Constants.normal_green : Constants.black,
                fontSize: 16,
                fontFamily: FONTS.Medium,
              }}
            />

            <RadioButton.Item
              mode="android"
              label={t("Log In")}
              value="login"
              position="leading"
              style={[styles.box2, ]}
              color={Constants.normal_green}
              uncheckedColor={Constants.black}
              labelStyle={{
                color: jobtype === 'login' ? Constants.normal_green : Constants.black,
                fontSize: 16,
                fontFamily:FONTS.Medium,
              }}
            />
            </View>
          </RadioButton.Group>
              <View style={styles.cancelAndLogoutButtonWrapStyle}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => setModalVisible(!modalVisible)}
                  style={styles.cancelButtonStyle2}>
                  <Text style={[styles.modalText,{color:Constants.black}]}>{t("Cancel")}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={async () => {
                    setModalVisible(!modalVisible);
                    logout();
                  }}
                  style={styles.logOutButtonStyle2}>
                  <Text style={styles.modalText}>{t("Log Out")}</Text>
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
              <View style={{backgroundColor: 'white', alignItems: 'center'}}>
                <Text style={[styles.textStyle2,{color:Constants.red}]}>
                {t("WARNING: You are about to delete your account. This action is permanent and cannot be undone.")}
                </Text>
                <Text style={styles.textStyle3}>
                {t("• All your data, including personal information, and settings, will be permanently erased.")}
                </Text>
                <Text style={styles.textStyle3}>
                {t("• You will lose access to all services and benefits associated with your account.")}
                </Text>
                <Text style={styles.textStyle3}>
                {t("• You will no longer receive updates, support, or communications from us.")}
                </Text>
                <Text style={styles.textStyle}>
                  {t("Are you sure you want to delete your account?")}
                </Text>
                <View style={styles.cancelAndLogoutButtonWrapStyle}>
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => setModalVisible2(!modalVisible2)}
                    style={styles.cancelButtonStyle}>
                    <Text style={styles.modalText}>{t("Cancel")}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={async () => {
                      setModalVisible2(!modalVisible2);
                      await AsyncStorage.removeItem('userDetail');
                      // reset('Auth');
                      await AsyncStorage.removeItem('userDetail');
                    reset('Auth');
                    //  logout()
                    }}
                    style={styles.logOutButtonStyle}>
                    <Text style={styles.modalText}>{t("Delete Account")}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>
        </View>
    </SafeAreaView>
  );
};

export default RideAccount;

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
  edittxt: {
    color: Constants.black,
    fontFamily: FONTS.Regular,
    fontSize: 16,
  },
  procov: {
    flexDirection: 'row',
    gap: 15,
    marginVertical: 15,
  },
  protxt2: {
    color: Constants.black,
    fontFamily: FONTS.Light,
    fontSize: 14,
  },
  nametxt: {
    color: Constants.black,
    fontFamily: FONTS.SemiBold,
    fontSize: 16,
  },
  nametxt2: {
    color: Constants.customgrey3,
    fontFamily: FONTS.Medium,
    fontSize: 14,
  },
  horline: {
    height: 8,
    backgroundColor: Constants.customgrey4,
    width: '120%',
    marginLeft: -20,
    marginVertical: 20,
  },
  favtxt: {
    color: Constants.black,
    fontSize: 18,
    fontFamily: FONTS.SemiBold,
  },
  spacbet: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 2,
    borderColor: Constants.customgrey4,
    paddingBottom: 10,
    alignItems:'center'
  },
  spacbet2: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    alignItems:'center'
  },
  rowgap: {
    flexDirection: 'row',
    gap: 20,
    alignItems:'center',
    width:'65%'
  },
  flexgap: {
    flexDirection: 'row',
    gap: 20,
    marginVertical:10
  },
  addbtntxt: {
    color: Constants.white,
    fontSize: 16,
    fontFamily: FONTS.Medium,
  },
  addbtn: {
    backgroundColor: Constants.dark_green,
    paddingHorizontal: 20,
    // paddingVertical: 5,
    height:35,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  redtxt: {
    color: Constants.red,
    fontFamily: FONTS.Medium,
    fontSize: 16,
  },

  //////log out ///
   centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // marginTop: 22,
    backgroundColor: '#rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 17,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
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
    textAlign: 'center',
    fontFamily: FONTS.Bold,
    fontSize: 16,
  },
  textStyle5: {
    color: Constants.black,
    textAlign: 'center',
    fontFamily: FONTS.Bold,
    fontSize: 18,
  },
  textStyle4: {
    color: Constants.customgrey2,
    textAlign: 'center',
    fontFamily: FONTS.Medium,
    fontSize: 14,
    marginTop:10
  },
  textStyle2: {
    color: Constants.black,
    // fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: FONTS.Medium,
    fontSize: 16,
  },
  textStyle3: {
    color: Constants.black,
    // fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: FONTS.Medium,
    fontSize: 16,
  },
  modalText: {
    color: Constants.white,
    // fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: FONTS.Bold,
    fontSize: 14,
  },
  cancelAndLogoutButtonWrapStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 3,
  },
  cancelButtonStyle: {
    flex: 0.5,
    backgroundColor: Constants.black,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginRight: 10,
  },
  logOutButtonStyle: {
    flex: 0.5,
    backgroundColor: Constants.red,
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  cancelButtonStyle2: {
    flex: 0.5,
    borderColor: Constants.customgrey2,
    borderWidth:1,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    marginRight: 10,
  },
  logOutButtonStyle2: {
    flex: 0.5,
    backgroundColor: Constants.normal_green,
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  redeembtn: {
    color: Constants.white,
    fontSize: 18,
    fontFamily: FONTS.Medium,
    backgroundColor: Constants.custom_green,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginVertical: 20,
  },
  covline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seealltxt: {
    fontSize: 14,
    color: Constants.normal_green,
    fontFamily: FONTS.SemiBold,
    marginHorizontal: 10,
  },
  seealltxt2: {
    fontSize: 14,
    color: Constants.white,
    backgroundColor: Constants.normal_green,
    fontFamily: FONTS.Regular,
    paddingHorizontal: 13,
    paddingVertical: 5,
    borderRadius: 20,
  },
  categorytxt: {
    fontSize: 16,
    color: Constants.black,
    fontFamily: FONTS.SemiBold,
  },
  ordtxt: {
    fontSize: 14,
    color: Constants.customgrey2,
    fontFamily: FONTS.Medium,
  },
  ordno: {
    fontSize: 12,
    color: Constants.black,
    fontFamily: FONTS.SemiBold,
  },
  firstbox: {
    backgroundColor: Constants.white,
    padding: 15,
    marginHorizontal: 20,
    borderRadius: 10,
    marginVertical: 10,
  },
  horline: {
    height: 1,
    backgroundColor: Constants.customgrey2,
    marginVertical: 10,
  },
  ordtxt1: {
    fontSize: 14,
    color: Constants.black,
    fontFamily: FONTS.SemiBold,
  },
  ordtxt2: {
    fontSize: 14,
    color: Constants.dark_green,
    fontFamily: FONTS.SemiBold,
  },
  ordtxt3: {
    fontSize: 12,
    color: Constants.black,
    fontFamily: FONTS.Medium,
  },
  partheadtxt: {
    fontSize: 14,
    color: Constants.customgrey2,
    fontFamily: FONTS.Medium,
    marginTop: 20,
    marginLeft: 20,
  },
  iconcov: {
    backgroundColor: '#F5F5FF',
    borderRadius: 8,
    padding: 10,
  },
  btmboxfirpart: {flexDirection: 'row', alignItems: 'center', gap: 15},
  croscov:{
    padding:10,
    borderRadius:8,
    borderWidth:1,
    borderColor:Constants.customgrey5
  },
  nrptxt:{
    fontSize: 14,
    color: Constants.customgrey2,
    fontFamily: FONTS.Medium,
    textAlign:'center',
    marginTop:20
  },
  statuscov:{
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems:'center',
    marginTop:5,
  },
    box2: {
    paddingHorizontal: 10,
    paddingVertical: 1,
    backgroundColor: Constants.white,
    alignItems: 'center',
  },
  proimg:{
    height:50,
    width:50,
    borderRadius:50
  }
});
