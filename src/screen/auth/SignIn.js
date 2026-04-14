import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Image,
  Linking,
} from 'react-native';
import React, {createRef, useContext, useEffect, useState} from 'react';
import styles from './styles';
import {CrossIcon, DownarrowIcon} from '../../../Theme';
import Constants, {countryDialingCodes} from '../../Assets/Helpers/constant';
import {navigate, reset} from '../../../navigationRef';
import {LoadContext, ToastContext, TranslatorContext, UserContext} from '../../../App';
import {Post} from '../../Assets/Helpers/Service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DriverHeader from '../../Assets/Component/DriverHeader';
import axios from 'axios';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import CountryPicker from '../../Assets/Component/CountryPickerModal';
import { useTranslation } from 'react-i18next';
import LanguageChange from '../../Assets/Component/LanguageChange';

const SignIn = () => {
  const [showPass, setShowPass] = useState(true);
  const [toast, setToast] = useContext(ToastContext);
  const [loading, setLoading] = useContext(LoadContext);
  const [user, setUser] = useContext(UserContext);
  const [submitted, setSubmitted] = useState(false);
  const [number, setnumber] = useState('');
  const [countryCode, setCountryCode] = useState('CA');
  const [country, setCountry] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);
  const [language, setLanguage] = useContext(TranslatorContext);

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

  const submit = async () => {
    if (number === '') {
      setSubmitted(true);
      return;
    }
    setLoading(true);
    Post('sendotp', {phone: number,countrycode: country,}, {}).then(
      async res => {
        setLoading(false);
        console.log(res);
        setSubmitted(false);
        if (res.status) {
          setnumber('');
          setLoading(false);
          navigate('OtpVerify', {
            number: number,
            countrycode: country,
            newuser: res?.data?.newuser,
          });
          // setToast('Login Successfully');
        } else {
          setLoading(false);
          {res?.message&&setToast(res?.message)}
        }
      },
      err => {
        setLoading(false);
        console.log(err);
        setSubmitted(false);
      },
    );
  };
  useEffect(() => {
    // getmycountry();
  }, []);
  const getmycountry = async () => {
    // setLoading(true);
    const newres = await axios.get('https://ipinfo.io/?format=jsonp');
    setCountryCode(newres.data.country);
    // console.log('>>>>', newres);
    // const dialingCode = countryDialingCodes[newres.data.country] || "Unknown";
    // setLoading(false);
    // setCountry(dialingCode)
    // console.log(`Dialing Code for ${newres.data.country}:`, dialingCode);
  };
  const Privacy = async () => {
    try {
      if (await InAppBrowser.isAvailable()) {
        await InAppBrowser.open(
          'https://www.chmp.world/Policy',
          {
            // Customization options
            dismissButtonStyle: 'cancel',
            preferredBarTintColor: Constants.normal_green,
            preferredControlTintColor: 'white',
            readerMode: false,
            animated: true,
            modalPresentationStyle: 'fullScreen',
            modalTransitionStyle: 'coverVertical',
            enableBarCollapsing: false,
          },
        );
      } else {
        Linking.openURL('https://www.chmp.world/Policy');
      }
    } catch (error) {
      console.error(error);
    }
  };
  const Term = async () => {
    try {
      if (await InAppBrowser.isAvailable()) {
        await InAppBrowser.open(
          'https://www.chmp.world/termConditions',
          {
            // Customization options
            dismissButtonStyle: 'cancel',
            preferredBarTintColor: Constants.normal_green,
            preferredControlTintColor: 'white',
            readerMode: false,
            animated: true,
            modalPresentationStyle: 'fullScreen',
            modalTransitionStyle: 'coverVertical',
            enableBarCollapsing: false,
          },
        );
      } else {
        Linking.openURL('https://www.chmp.world/termConditions');
      }
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <DriverHeader item={t('Login or Register')} hideprofile={true} />
      <TouchableOpacity
          style={[styles.langView, ]}
          onPress={() => langRef.current.show()}>
          <Text style={[styles.lang,]}>{selectLanguage}</Text>
          <DownarrowIcon height={15} width={15} color={Constants.white} />
        </TouchableOpacity>
      <View style={{paddingHorizontal: 20}}>
        <Text style={styles.headtxt}>
          {t("Just need phone number to login or created a new account")}
        </Text>

        <View style={styles.inpcov}>
          {/* <Text style={styles.code}>{countrycode||'+1'}</Text> */}
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 6,
            }} onPress={() => setModalVisible(true)}>
            <View style={{width: 32}}>
              <CountryPicker
                countryCode={countryCode}
                withFilter
                withFlag
                withAlphaFilter
                withCallingCode
                // withCountryNameButton
                // withCallingCodeButton
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSelect={country => {
                  setCountryCode(country.cca2);
                  setCountry(country.callingCode[0]);
                  setModalVisible(false);
                }}
              />
            </View>
            <DownarrowIcon height={15} width={15} color={Constants.white}/>
          </TouchableOpacity>
          <View style={styles.inputfieldcov}>
            {country && <Text style={styles.code}>+{country}</Text>}
            <View style={{width:2,backgroundColor:Constants.customgrey3,height:28,marginHorizontal:3}}></View>
          <TextInput
            style={styles.inputfield}
            keyboardType="number-pad"
            placeholder={t("Enter Number")}
            placeholderTextColor={Constants.customgrey2}
            value={number}
            onChangeText={e => setnumber(e)}
          />
          </View>
        </View>
        {submitted && number === '' && (
          <Text style={styles.require}>{t("Number is required")}</Text>
        )}
      </View>
      <View
        style={{
          position: 'absolute',
          bottom: 30,
          width: '90%',
          alignSelf: 'center',
        }}>
        <View style={styles.pp}>
          <Text style={styles.pp2}>
            {t("With Login or Register, you accept of the")}
          </Text>
          <View style={styles.pt}>
            <Text style={styles.pp3} onPress={() => Term()}>
              {t("term of use")}
            </Text>
            <Text style={styles.pp2}> {t("and our")} </Text>
            <Text style={styles.pp3} onPress={() => Privacy()}>
              {t("privacy policy.")}
            </Text>
          </View>
        </View>
        <Text style={styles.logimbtn} onPress={() => submit()}>
          {t("Send OTP")}
        </Text>
      </View>
      <LanguageChange refs={langRef} selLang={(item)=>{setSelectLanguage(item)}}/>
    </SafeAreaView>
  );
};

export default SignIn;
