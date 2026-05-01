import {
  Dimensions,
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
import React, {createRef, useContext, useEffect, useState} from 'react';
import Constants, {Currency, FONTS} from '../../../Assets/Helpers/constant';
import {navigate, reset} from '../../../../navigationRef';
import {GetApi} from '../../../Assets/Helpers/Service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeliveryRiderContext, GrocerySellerContext, GroceryUserContext, LoadContext, ProfileStatusContext, ToastContext, TranslatorContext, UserContext} from '../../../../App';
import {
  CrossIcon,
  DeleteIcon,
  DriverIcon,
  FavborIcon,
  InfoIcon,
  LanguageIcon,
  LogoutIcon,
  Notification2Icon,
  NotificationIcon,
  OrderIcon,
  PrivacyIcon,
  ProfileIcon,
  RightArrow,
  SellerIcon,
  SupportIcon,
  TermIcon,
  UnfavIcon,
} from '../../../../Theme';
import { useIsFocused } from '@react-navigation/native';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import { RadioButton } from 'react-native-paper';
import LanguageChange from '../../../Assets/Component/LanguageChange';
import { useTranslation } from 'react-i18next';

const Profile = props => {
  const [toast, setToast] = useContext(ToastContext);
  const [loading, setLoading] = useContext(LoadContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalVisible2, setModalVisible2] = useState(false);
  const [groceryuserProfile, setgroceryuserProfile] = useContext(GroceryUserContext);
  const [deliveryriderProfile, setdeliveryriderProfile] = useContext(DeliveryRiderContext);
  const [grocerysellerProfile, setgrocerysellerProfile] =
          useContext(GrocerySellerContext)
  const [profileStatus, setProfileStatus] = useContext(ProfileStatusContext);
  const [user, setuser] = useContext(UserContext);
  const [language, setLanguage] = useContext(TranslatorContext);
  const [orderdata, setorderdata] = useState([]);
  const [jobtype, setjobtype] = useState('main');

  const IsFocused=useIsFocused()
  useEffect(() => {
    if (IsFocused) {
      getlastorder();
    }
  }, [IsFocused]);

const [selectLanguage, setSelectLanguage] = useState('English');
      const { t } = useTranslation();
      const langRef = createRef()
              useEffect(() => {
    checkLng();
  }, []);
  const checkLng = async () => {
    const x = await AsyncStorage.getItem('LANG');
    if (x != null) {
      let lng = x == 'en' ? 'English' : x == 'ar' ? 'العربية' :x == 'fr' ? 'Français' : x == 'pt' ? 'Português' : x == 'wo' ? 'Wolof' : x == 'zh' ? '中文 / 汉语' : 'English';
      setSelectLanguage(lng);
      let lng2 = x == 'zh' ? 'zh-CN' : x;
      setLanguage(lng2)
    }
  };


  const getlastorder = () => {
    setLoading(true);
    GetApi(`getgroceryorderforuser?limit=1`, {}).then(
      async res => {
        setLoading(false);
        console.log(res);
        if (res.status) {
            setorderdata(res.data);
        } else {
          // setToast(res.message);
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
      GetApi(`getProfile/GROCERYSELLER`, {}).then(
        async res => {
          setLoading(false);
          console.log(res);
          if (res?.data?.status === 'VERIFIED') {
            navigate('GrocerySellerTab');
            setgrocerysellerProfile(res?.data)
          } else {
           navigate('GrocerySellerForm');
          }
        },
        err => {
          setLoading(false);
          console.log(err);
        },
      );
    };
    const getDriverProfile = () => {
      setLoading(true);
      GetApi(`getProfile/DELIVERYRIDER`, {}).then(
        async res => {
          setLoading(false);
          console.log(res);
          if (res?.data?.status === 'VERIFIED') {
            navigate('Ridertab');
            setdeliveryriderProfile(res?.data)
          } else {
           navigate('RiderForm');
          }
        },
        err => {
          setLoading(false);
          console.log(err);
        },
      );
    };
 
  const logout = async () => {
    if (jobtype==='main') {
    setgroceryuserProfile({});
    reset('Options');
    } else {
    await AsyncStorage.removeItem('userDetail');
    setgroceryuserProfile({});
    reset('Auth');
    }
    
  };
  
  const Privacy=async()=>{
    try {
      if (await InAppBrowser.isAvailable()) {
        await InAppBrowser.open('https://www.chmp.world/Policy', {
          // Customization options
          dismissButtonStyle: 'cancel',
          preferredBarTintColor: Constants.normal_green,
          preferredControlTintColor: 'white',
          readerMode: false,
          animated: true,
          modalPresentationStyle: 'fullScreen',
          modalTransitionStyle: 'coverVertical',
          enableBarCollapsing: false,
        });
      } else {
        Linking.openURL('https://www.chmp.world/Policy');
      }
    } catch (error) {
      console.error(error);
    }
  }
    const Term=async()=>{
    try {
      if (await InAppBrowser.isAvailable()) {
        await InAppBrowser.open('https://www.chmp.world/termConditions', {
          // Customization options
          dismissButtonStyle: 'cancel',
          preferredBarTintColor: Constants.normal_green,
          preferredControlTintColor: 'white',
          readerMode: false,
          animated: true,
          modalPresentationStyle: 'fullScreen',
          modalTransitionStyle: 'coverVertical',
          enableBarCollapsing: false,
        });
      } else {
        Linking.openURL('https://www.chmp.world/termConditions');
      }
    } catch (error) {
      console.error(error);
    }
  }
    const Help=async()=>{
    try {
      if (await InAppBrowser.isAvailable()) {
        await InAppBrowser.open('https://tawk.to/chat/6849579fe7d8d619164a4469/1itf7shu9', {
          // Customization options
          dismissButtonStyle: 'cancel',
          preferredBarTintColor: Constants.normal_green,
          preferredControlTintColor: 'white',
          readerMode: false,
          animated: true,
          modalPresentationStyle: 'fullScreen',
          modalTransitionStyle: 'coverVertical',
          enableBarCollapsing: false,
        });
      } else {
        Linking.openURL('https://tawk.to/chat/6849579fe7d8d619164a4469/1itf7shu9');
      }
    } catch (error) {
      console.error(error);
    }
  }
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headtxt}>{t("Profile Settings")}</Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          style={styles.topcard}
          onPress={() => navigate('Groceryprofile')}>
          <Image
            // source={require('../../../Assets/Images/profile.png')}
            source={
              groceryuserProfile?.image
                ? {
                    uri: `${groceryuserProfile.image}`,
                  }
                : require('../../../Assets/Images/profile.png')
            }
            style={styles.proimg}
          />
          <View style={{marginTop: 5, alignItems: 'center'}}>
            <Text style={styles.protxt}>{groceryuserProfile?.username?groceryuserProfile?.username:user?.username}</Text>
            <Text style={styles.protxt2}>{groceryuserProfile?.phone?groceryuserProfile?.phone:user?.phone}</Text>
          </View>
        </TouchableOpacity>
        {/* <View style={styles.firstbox}>
          <View style={styles.covline}>
            <Text style={styles.categorytxt}>{t("My Orders")}</Text>
            <Text style={styles.seealltxt} onPress={()=>navigate('GroceryOrders')}>{t("See all")}</Text>
          </View>
         {orderdata&&orderdata.length>0? <View>
          <View style={[styles.covline, {marginTop: 10}]}>
            <Text style={styles.ordtxt}>
              {t("Order ID")} 
            </Text>
            <Text style={styles.ordno}>{orderdata[0].order_id}</Text>
          </View>
          <View style={styles.statuscov}>
            <Text style={styles.ordtxt}>
              {t("Status")}
            </Text>
            <Text style={styles.seealltxt2}>{orderdata[0].status}</Text>
            </View>
          <View style={styles.horline}></View>
          <View style={{flexDirection: 'row', marginVertical: 10}}>
            <Image
              source={{uri: orderdata[0].productDetail[0].image}}
              style={{height: 60, width: 60, borderRadius: 20}}
            />
            <View style={{marginLeft: 10, flex: 1}}>
              <Text style={styles.ordtxt1}>{orderdata[0].productDetail[0].grocery_name}</Text>
              <View style={styles.covline}>
                <Text style={styles.ordtxt2}>{Currency} {orderdata[0].total}</Text>
                <Text style={styles.ordtxt3}>{orderdata[0].productDetail?.length} {t("items")}</Text>
              </View>
            </View>
          </View>
          </View>:<Text style={styles.nrptxt}>{t("No order Place Yet")}</Text>}
        </View> */}
        <View style={[styles.horline, {marginHorizontal: 20}]}></View>
        <View
          style={{
            marginTop: 10,
            backgroundColor: Constants.white,
            marginBottom: 70,
          }}>
          <Text style={styles.partheadtxt}>{t("Profile")}</Text>
          <TouchableOpacity
            style={[styles.box]}
            onPress={() => navigate('Groceryprofile')}>
            <View style={styles.btmboxfirpart}>
              <View style={styles.iconcov}>
                <ProfileIcon height={20} width={20} color={Constants.normal_green}/>
              </View>
              <Text style={styles.protxt}>{t('Personal Data')}</Text>
            </View>
            <RightArrow
              color={Constants.normal_green}
              height={15}
              width={15}
              style={styles.aliself}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.box]}
            onPress={()=>navigate('GroceryOrders')}>
            <View style={styles.btmboxfirpart}>
              <View style={styles.iconcov}>
                <OrderIcon height={20} width={20} color={Constants.normal_green}/>
              </View>
              <Text style={styles.protxt}>{t('My Orders')}</Text>
            </View>
            <RightArrow
              color={Constants.normal_green}
              height={15}
              width={15}
              style={styles.aliself}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.box]}
            onPress={() => navigate('FavoriteGroceries')}>
            <View style={styles.btmboxfirpart}>
              <View style={styles.iconcov}>
                <FavborIcon height={20} width={20} color={Constants.normal_green}/>
              </View>
              <Text style={styles.protxt}>{t('Favourite Groceries')}</Text>
            </View>
            <RightArrow
              color={Constants.normal_green}
              height={15}
              width={15}
              style={styles.aliself}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.box]}
            onPress={() => getDriverProfile()}>
            <View style={styles.btmboxfirpart}>
              <View style={styles.iconcov}>
                <DriverIcon height={20} width={20} color={Constants.normal_green}/>
              </View>
              <Text style={styles.protxt}>{profileStatus?.DELIVERYRIDER?t('Go to Delivery Flow'):t('Become a Delivery Rider')}</Text>
            </View>
            <RightArrow
              color={Constants.normal_green}
              height={15}
              width={15}
              style={styles.aliself}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.box]}
            onPress={() => getProfile()}>
            <View style={styles.btmboxfirpart}>
              <View style={styles.iconcov}>
                <SellerIcon height={20} width={20} color={Constants.normal_green}/>
              </View>
              <Text style={styles.protxt}>{profileStatus?.GROCERYSELLER?t('Go to Seller Dashboard'):t('Become a Seller')}</Text>
            </View>
            <RightArrow
              color={Constants.normal_green}
              height={15}
              width={15}
              style={styles.aliself}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.box]}
            onPress={() => navigate('GroceryUserNotification')}>
            <View style={styles.btmboxfirpart}>
              <View style={styles.iconcov}>
                <Notification2Icon height={20} width={20} color={Constants.normal_green}/>
              </View>
              <Text style={styles.protxt}>{t("Notification")}</Text>
            </View>
            <RightArrow
              color={Constants.normal_green}
              height={15}
              width={15}
              style={styles.aliself}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.box]}
            onPress={() =>langRef.current.show()}>
            <View style={styles.btmboxfirpart}>
              <View style={styles.iconcov}>
                <LanguageIcon height={20} width={20} color={Constants.normal_green} />
              </View>
              <Text style={styles.protxt}>{t("Language")}</Text>
            </View>
            <View style={styles.btmboxfirpart}>
              <Text style={styles.protxt3}>{selectLanguage}</Text>
              <RightArrow
                color={Constants.normal_green}
                height={15}
                width={15}
                style={styles.aliself}
              />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.box]}
            onPress={() => Privacy()}>
            <View style={styles.btmboxfirpart}>
              <View style={styles.iconcov}>
                <PrivacyIcon height={20} width={20} color={Constants.normal_green}/>
              </View>
              <Text style={styles.protxt}>{t("Privacy Policy")}</Text>
            </View>
            <RightArrow
              color={Constants.normal_green}
              height={15}
              width={15}
              style={styles.aliself}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.box]}
            onPress={() => Term()}>
            <View style={styles.btmboxfirpart}>
              <View style={styles.iconcov}>
                <TermIcon height={20} width={20} color={Constants.normal_green}/>
              </View>
              <Text style={styles.protxt}>{t("Terms and Conditions")}</Text>
            </View>
            <RightArrow
              color={Constants.normal_green}
              height={15}
              width={15}
              style={styles.aliself}
            />
          </TouchableOpacity>
          <Text style={styles.partheadtxt}>{t("Support")}</Text>
          <TouchableOpacity
            style={[styles.box]}
            onPress={() => Help()}>
            <View style={styles.btmboxfirpart}>
              <View style={styles.iconcov}>
                <SupportIcon height={20} width={20} color={Constants.normal_green}/>
              </View>
              <Text style={styles.protxt}>{t("Help Center")}</Text>
            </View>
            <RightArrow
              color={Constants.normal_green}
              height={15}
              width={15}
              style={styles.aliself}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.box]}
            onPress={() => setModalVisible2(true)}>
            <View style={styles.btmboxfirpart}>
              <View style={styles.iconcov}>
                <DeleteIcon height={20} width={20} color={Constants.normal_green} />
              </View>
              <Text style={[styles.protxt,{width:'70%'}]}>{t("Request Account Deletion")}</Text>
            </View>
            <RightArrow
              color={Constants.normal_green}
              height={15}
              width={15}
              style={styles.aliself}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn]}
            onPress={async () => {
              setModalVisible(true);
            }}>
            <LogoutIcon color={Constants.red}/>
            <Text style={styles.btntxt}> {t("Log Out")}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
<LanguageChange refs={langRef} selLang={(item)=>{setSelectLanguage(item)}}/>
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
                <Text style={styles.textStyle5}>{t("Sign Out")}</Text>
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
              <Text style={[styles.textStyle2, {color: Constants.red}]}>
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
                    // logout();
                    await AsyncStorage.removeItem('userDetail');
                    reset('Auth');
                  }}
                  style={styles.logOutButtonStyle}>
                  <Text style={styles.modalText}>{t("Delete Account")}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    // paddingVertical: 20,
  },
  headtxt: {
    fontSize: 16,
    color: Constants.normal_green,
    fontFamily: FONTS.SemiBold,
    textAlign: 'center',
    marginTop: 10,
  },
  topcard: {
    marginHorizontal: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 15,
  },
  protxt: {
    color: Constants.black,
    fontSize: 14,
    fontFamily: FONTS.SemiBold,
  },
  protxt2: {
    color: Constants.customgrey2,
    fontSize: 12,
    fontFamily: FONTS.Regular,
  },
  protxt3: {
    color: Constants.black,
    fontSize: 12,
    fontFamily: FONTS.Medium,
  },
  box: {
    paddingHorizontal: 15,
    // paddingVertical: 5,
    // borderRadius: 20,
    marginVertical: 10,
    backgroundColor: Constants.white,
    width: '90%',
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  aliself: {
    alignSelf: 'center',
  },
  btntxt: {
    fontSize: 16,
    color: Constants.red,
    fontFamily: FONTS.SemiBold,
  },
  btn: {
    height: 55,
    borderRadius: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 30,
    borderColor: Constants.customgrey2,
    borderWidth: 1,
    marginHorizontal: 20,
    // width: '80%',
    // alignSelf: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  proimg: {
    // marginRight: 10,
    height: 70,
    width: 70,
    borderRadius: 70,
  },
  /////////logout model //////
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
});
