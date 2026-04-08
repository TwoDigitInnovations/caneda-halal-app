import {
  Linking,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { createRef, useContext, useEffect, useState } from 'react';
import Constants, {Currency, FONTS} from '../../../Assets/Helpers/constant';
import {navigate, reset} from '../../../../navigationRef';
import {
  CrossIcon,
  DeleteIcon,
  GridIcon,
  InfoIcon,
  LanguageIcon,
  LogoutIcon,
  PrivacyIcon,
  ProfileIcon,
  RightArrow,
  StarIcon,
  SupportIcon,
  TermIcon,
  TransactionIcon,
} from '../../../../Theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {  GrocerySellerContext, TranslatorContext } from '../../../../App';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import { RadioButton } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import LanguageChange from '../../../Assets/Component/LanguageChange';

const Account = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [modalVisible2, setModalVisible2] = useState(false);
    const [jobtype, setjobtype] = useState('main');
    const [language, setLanguage] = useContext(TranslatorContext);
    const [grocerysellerProfile, setgrocerysellerProfile] =
        useContext(GrocerySellerContext)
    const logout = async () => {
       if (jobtype==='main') {
    setgrocerysellerProfile({});
    reset('Options');
    } else {
    await AsyncStorage.removeItem('userDetail');
    setgrocerysellerProfile({});
    reset('Auth');
    }
    };

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
      <View style={styles.toppart}>
        <Text style={styles.headtxt1}>{t("My Profile")}</Text>
        <Text style={styles.headtxt2}>{t("Available Balance")}</Text>
        <Text style={styles.headtxt3}>{Currency}{grocerysellerProfile?.wallet?grocerysellerProfile?.wallet:0}</Text>
        <Text style={styles.headtxt4} onPress={()=>navigate('GroceryWithdraw')}>{t("Withdraw")}</Text>
      </View>
<ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.card}>
        <TouchableOpacity
          style={[styles.box]}
          onPress={() => navigate('GrocerySellerProfile')}>
          <View style={styles.btmboxfirpart}>
            <View style={styles.iconcov}>
              <ProfileIcon height={20} width={20} color={'#FB6F3D'} />
            </View>
            <Text style={styles.protxt}>{t('Personal Data')}</Text>
          </View>
          <RightArrow
            color={Constants.customgrey2}
            height={15}
            width={15}
            style={styles.aliself}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.box]}
          onPress={()=>langRef.current.show()}
          >
          <View style={styles.btmboxfirpart}>
            <View style={styles.iconcov}>
              <LanguageIcon height={20} width={20} color={'#413DFB'} />
            </View>
            <Text style={styles.protxt}>{t("Language")}</Text>
          </View>
          <View style={styles.btmboxfirpart}>
            <Text style={styles.protxt2}>{selectLanguage}</Text>
            <RightArrow
              color={Constants.customgrey2}
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
              <PrivacyIcon height={20} width={20} color={'#18CFE8'} />
            </View>
            <Text style={styles.protxt}>{t("Privacy Policy")}</Text>
          </View>
          <RightArrow
            color={Constants.customgrey2}
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
              <TermIcon height={20} width={20} color={'#18CFE8'} />
            </View>
            <Text style={styles.protxt}>{t("Terms and Conditions")}</Text>
          </View>
          <RightArrow
            color={Constants.customgrey2}
            height={15}
            width={15}
            style={styles.aliself}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.box]}
          onPress={() => Help()}>
          <View style={styles.btmboxfirpart}>
            <View style={styles.iconcov}>
              <SupportIcon height={20} width={20} color={'#26613d'} />
            </View>
            <Text style={styles.protxt}>{t("Help Center")}</Text>
          </View>
          <RightArrow
            color={Constants.customgrey2}
            height={15}
            width={15}
            style={styles.aliself}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.card}>
      <TouchableOpacity
          style={[styles.box]}
          onPress={() => navigate('GrocerySellerOrder')}>
          <View style={styles.btmboxfirpart}>
            <View style={styles.iconcov}>
              <GridIcon height={20} width={20} color={'#18CFE8'}/>
            </View>
            <Text style={styles.protxt}>{t("Number of Orders")}</Text>
          </View>
          <RightArrow
            color={Constants.customgrey2}
            height={15}
            width={15}
            style={styles.aliself}
          />
        </TouchableOpacity>
      <TouchableOpacity
          style={[styles.box]}
          onPress={() => navigate('GroceryTransaction')}>
          <View style={styles.btmboxfirpart}>
            <View style={styles.iconcov}>
              <TransactionIcon height={20} width={20} color={'#FB6F3D'}/>
            </View>
            <Text style={styles.protxt}>{t("Transaction History")}</Text>
          </View>
          <RightArrow
            color={Constants.customgrey2}
            height={15}
            width={15}
            style={styles.aliself}
          />
        </TouchableOpacity>
      </View>
      {/* <View style={styles.card}>
      <TouchableOpacity
          style={[styles.box]}
          onPress={() => navigate('Reviews')}>
          <View style={styles.btmboxfirpart}>
            <View style={styles.iconcov}>
              <StarIcon height={20} width={20} color={'#18CFE8'}/>
            </View>
            <Text style={styles.protxt}>User Reviews</Text>
          </View>
          <RightArrow
            color={Constants.customgrey2}
            height={15}
            width={15}
            style={styles.aliself}
          />
        </TouchableOpacity>
      </View> */}
      <View style={[styles.card,{marginBottom:80}]}>
      <TouchableOpacity
          style={[styles.box]}
          onPress={() => setModalVisible2(true)}>
          <View style={styles.btmboxfirpart}>
            <View style={styles.iconcov}>
              <DeleteIcon height={20} width={20} color={Constants.red}/>
            </View>
            <Text style={styles.protxt}>{t("Delete Account")}</Text>
          </View>
          <RightArrow
            color={Constants.customgrey2}
            height={15}
            width={15}
            style={styles.aliself}
          />
        </TouchableOpacity>
      <TouchableOpacity
          style={[styles.box]}
          onPress={() => setModalVisible(true)}>
          <View style={styles.btmboxfirpart}>
            <View style={styles.iconcov}>
              <LogoutIcon height={20} width={20} color={Constants.red}/>
            </View>
            <Text style={styles.protxt}>{t("Log Out")}</Text>
          </View>
          <RightArrow
            color={Constants.customgrey2}
            height={15}
            width={15}
            style={styles.aliself}
          />
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

export default Account;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.white,
  },
  toppart: {
    backgroundColor: Constants.normal_green,
    padding: 20,
    minHeight: '27%',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headtxt1: {
    fontSize: 16,
    color: Constants.white,
    fontFamily: FONTS.Medium,
    textAlign: 'center',
  },
  headtxt2: {
    fontSize: 14,
    color: Constants.customgrey4,
    fontFamily: FONTS.Light,
    textAlign: 'center',
    marginTop: 20,
  },
  headtxt3: {
    fontSize: 24,
    color: Constants.white,
    fontFamily: FONTS.SemiBold,
    textAlign: 'center',
    marginBottom: 15,
  },
  headtxt4: {
    fontSize: 14,
    color: Constants.customgrey4,
    fontFamily: FONTS.Regular,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: Constants.customgrey4,
    padding: 10,
    width: '30%',
    borderRadius: 15,
    alignSelf: 'center',
  },
  iconcov: {
    backgroundColor: Constants.white,
    borderRadius: 18,
    padding: 10,
  },
  btmboxfirpart: {flexDirection: 'row', alignItems: 'center', gap: 15},
  croscov: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Constants.customgrey5,
  },
  box: {
    // paddingHorizontal: 15,
    marginVertical: 10,
    width: '90%',
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  aliself: {
    alignSelf: 'center',
  },
  protxt: {
    color: '#333333',
    fontSize: 14,
    fontFamily: FONTS.Medium,
  },
  protxt2: {
    color: Constants.customgrey3,
    fontSize: 12,
    fontFamily: FONTS.Medium,
  },
  card: {
    backgroundColor: '#F6F6F6',
    borderRadius: 15,
    padding: 15,
    marginTop: 20,
    marginHorizontal: 20,
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
      fontSize: 14,
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
      box2: {
    paddingHorizontal: 10,
    paddingVertical: 1,
    backgroundColor: Constants.white,
    alignItems: 'center',
  },
});
