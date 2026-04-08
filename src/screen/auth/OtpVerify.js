import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Image,
  Keyboard,
  Animated,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import React, {useContext, useEffect, useRef, useState} from 'react';
import styles from './styles';
import {CrossIcon} from '../../../Theme';
import Constants from '../../Assets/Helpers/constant';
import {navigate, reset} from '../../../navigationRef';
import {LoadContext, LocationUpdateContext, ToastContext, UserContext} from '../../../App';
import {Post} from '../../Assets/Helpers/Service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DriverHeader from '../../Assets/Component/DriverHeader';
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import { checkEmail } from '../../Assets/Helpers/InputsNullChecker';
import { OneSignal } from 'react-native-onesignal';
import { useTranslation } from 'react-i18next';

const OtpVerify = props => {
  const { t } = useTranslation();
  const [name, setname] = useState('');
  const ref = useBlurOnFulfill({value, cellCount: CELL_COUNT});
  const [value, setValue] = useState('');
  const [property, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });
  const CELL_COUNT = 4;
  const number = props?.route?.params?.number;
  const countrycode = props?.route?.params?.countrycode;
  const newuser = props?.route?.params?.newuser;

  const [taxNumber, setTaxNumber] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [toast, setToast] = useContext(ToastContext);
  const [loading, setLoading] = useContext(LoadContext);
  const [user, setUser] = useContext(UserContext);
  const [updateLogin, setUpdateLogin] = useContext(LocationUpdateContext);
  const [submitted, setSubmitted] = useState(false);

  const submit = async () => {
    if (value === '') {
      setSubmitted(true);
      return;
    }
    if (newuser && name === ''&&tabopt === 0) {
      setSubmitted(true);
      return;
    }
    if (
      newuser &&
      tabopt === 1 &&
      (companyName === '' || taxNumber === '' || email === '')
    ) {
      setSubmitted(true);
      return;
    }
    
    const player_id = await OneSignal.User.pushSubscription.getIdAsync()
    const device_token = await OneSignal.User.pushSubscription.getTokenAsync()
    const data = {
      phone: number,
      otp: value,
      name: name,
      countryCode: countrycode,
      player_id,
      device_token
    };
    if (newuser&&tabopt===1) {
       const emailcheck = checkEmail(email.trim());
    if (!emailcheck) {
      setToast('Your email id is invalid');
      return;
    }
      data.name=companyName,
      data.email=email,
      data.tax_number=taxNumber
    }
    console.log('enter1');
    setLoading(true);
    Post('verifyOTP', data).then(
      async res => {
        console.log('enter1');
        setLoading(false);
        console.log(res);
        setSubmitted(false);
        if (res.success) {
          setLoading(false);
          await AsyncStorage.setItem('userDetail', JSON.stringify(res.data));
          setUser(res.data);
          setUpdateLogin(res.data);
          reset('Options');
          setToast('Login Successfully');
        } else {
          setLoading(false);
          console.log('error------>', res);
          if (res.message !== undefined) {
            setToast(res.message);
          }
        }
      },
      err => {
        setLoading(false);
        console.log(err);
        setSubmitted(false);
      },
    );
  };

  const [tabopt, settabopt] = useState(0);
  const toggleAnim = useRef(new Animated.Value(tabopt)).current;

  useEffect(() => {
    Animated.timing(toggleAnim, {
      toValue: tabopt,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [tabopt]);

  const translateX = toggleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });
  return (
    <SafeAreaView style={styles.container}>
      <DriverHeader item={t('Login or Register')} hideprofile={true} />
      <KeyboardAvoidingView 
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={{flex:1}}
            >
      <ScrollView showsVerticalScrollIndicator={false}>
      <View style={{paddingHorizontal: 20}}>
        <Text style={styles.headtxt}>
          {t("OTP code has been sent to")} +{countrycode}
          {number} {t("enter the code below to continue.")}
        </Text>

        <CodeField
          ref={ref}
          {...property}
          // Use `caretHidden={false}` when users can't paste a text value, because context menu doesn't appear
          value={value}
          onChangeText={setValue}
          cellCount={CELL_COUNT}
          rootStyle={styles.codeFieldRoot2}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          // onEndEditing={() => Keyboard.dismiss()} // Dismiss keyboard when OTP is entered
          onSubmitEditing={() => Keyboard.dismiss()}
          renderCell={({index, symbol, isFocused}) => (
            <Text
              key={index}
              style={[styles.cell, isFocused && styles.focusCell]}
              onLayout={getCellOnLayoutHandler(index)}>
              {symbol ||
                (isFocused ? (
                  <Cursor />
                ) : (
                  <Text style={{color: Constants.white}}>_</Text>
                ))}
            </Text>
          )}
        />
        {submitted && value === '' && (
          <Text style={styles.require}>{t("OTP is required")}</Text>
        )}
      </View>

      {newuser && (
        <View style={styles.btnCov}>
          {/* Animated sliding background */}
          <Animated.View style={[styles.slider, {transform: [{translateX}]}]} />

          <TouchableOpacity
            style={styles.cencelBtn}
            onPress={() => settabopt(0)}
            activeOpacity={0.8}>
            <Text
              style={[
                styles.btntxt,
                tabopt === 0 ? styles.activeText : styles.inactiveText,
              ]}>
              {t("Individual")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cencelBtn2}
            onPress={() => settabopt(1)}
            activeOpacity={0.8}>
            <Text
              style={[
                styles.btntxt,
                tabopt === 1 ? styles.activeText : styles.inactiveText,
              ]}>
              {t("Company")}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {tabopt === 0 ? (
        newuser&&<View style={{marginBottom:100}}>
          <Text style={styles.jobtitle}>{t("Full Name")}</Text>
          <View style={styles.inpucov}>
            <TextInput
              style={styles.inputfield2}
              // placeholder="Name"
              // placeholderTextColor={Constants.customgrey2}
              value={name}
              onChangeText={name => setname(name)}></TextInput>
          </View>
          {submitted && name === '' && (
            <Text style={[styles.require,{marginLeft:25}]}>{t("Name is required")}</Text>
          )}
        </View>
      ) : (
        <View style={{marginBottom:100}}>
          <Text style={styles.jobtitle}>{t("Company Name")}</Text>
          <View style={[styles.inpucov]}>
            <TextInput
              style={styles.inputfield2}
              value={companyName}
              onChangeText={e => setCompanyName(e)}></TextInput>
          </View>
          {submitted && companyName === '' && (
            <Text style={[styles.require,{marginLeft:25}]}>{t("Company Name is required")}</Text>
          )}
          <Text style={styles.jobtitle}>E-Mail Address</Text>
          <View style={[styles.inpucov]}>
            <TextInput
              style={styles.inputfield2}
              value={email}
              onChangeText={e => setEmail(e)}></TextInput>
          </View>
          {submitted && email === '' && (
            <Text style={[styles.require,{marginLeft:25}]}>{t("Email is required")}</Text>
          )}
          <Text style={styles.jobtitle}>Tax Number</Text>
          <View style={[styles.inpucov]}>
            <TextInput
              style={styles.inputfield2}
              value={taxNumber}
              onChangeText={e => setTaxNumber(e)}></TextInput>
          </View>
          {submitted && taxNumber === '' && (
            <Text style={[styles.require,{marginLeft:25}]}>{t("Tax Number is required")}</Text>
          )}
        </View>
      )}
      </ScrollView>
      </KeyboardAvoidingView>
      <Text
        style={[
          styles.logimbtn,
          {
            position: 'absolute',
            bottom: 10,
            left: 20,
            width: '90%',
            alignSelf: 'center',
          },
        ]}
        onPress={() => submit()}>
        {t("Verify OTP")}
      </Text>
    </SafeAreaView>
  );
};

export default OtpVerify;
