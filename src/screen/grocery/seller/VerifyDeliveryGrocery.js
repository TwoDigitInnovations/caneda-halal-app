import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Image,
  Keyboard,
  Animated,
  Dimensions,
  StyleSheet,
} from 'react-native';
import React, {useContext, useEffect, useRef, useState} from 'react';
import Constants, { FONTS } from '../../../Assets/Helpers/constant';
import {goBack, navigate, reset} from '../../../../navigationRef';
import {LoadContext, ToastContext, UserContext} from '../../../../App';
import {Post} from '../../../Assets/Helpers/Service';
import DriverHeader from '../../../Assets/Component/DriverHeader';
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import { useTranslation } from 'react-i18next';

const VerifyDeliveryGrocery = (props) => {
  const { t } = useTranslation();
   const orderid = props?.route?.params;
  const ref = useBlurOnFulfill({value, cellCount: CELL_COUNT});
  const [value, setValue] = useState('');
  const [property, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });
  const CELL_COUNT = 4;

  useEffect(() => {
  const timer = setTimeout(() => {
    ref?.current?.focus?.();
  }, 300);

  return () => clearTimeout(timer);
}, []);

  const [toast, setToast] = useContext(ToastContext);
  const [loading, setLoading] = useContext(LoadContext);
  const [user, setUser] = useContext(UserContext);
  const [submitted, setSubmitted] = useState(false);

  const submit = async () => {
    if (value === '') {
      setSubmitted(true);
      return;
    }
    const data = {
      otp: Number(value),
      id:orderid
    };
    
    setLoading(true);
    Post('deliverybygroceryseller', data).then(
      async res => {
        console.log('enter1');
        setLoading(false);
        console.log(res);
        setSubmitted(false);
        if (res.status) {
          goBack()
        } else {
         setToast(res?.message)
        }
      },
      err => {
        setLoading(false);
        console.log(err);
        setSubmitted(false);
      },
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <DriverHeader item={t('Verify OTP')} showback={true} />
      <View style={{paddingHorizontal: 20}}>
        <Text style={styles.headtxt}>
          {t("Enter OTP to delivery order.")}
        </Text>

        <CodeField
          ref={ref}
          {...property}
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

      <Text
        style={[
          styles.logimbtn,
          {
            position: 'absolute',
            bottom: 30,
            left: 20,
            width: '90%',
            alignSelf: 'center',
          },
        ]}
        onPress={() => submit()}>
        {t("Confirm")}
      </Text>
    </SafeAreaView>
  );
};

export default VerifyDeliveryGrocery;

const styles = StyleSheet.create({
    container: {
    flex: 1,
    backgroundColor: Constants.white,
    // padding: 20,
  },
  headtxt: {
    color: Constants.black,
    fontFamily: FONTS.Medium,
    fontSize: 18,
    marginVertical: 20,
  },
    codeFieldRoot2: {
    width: Dimensions.get('window').width - 40,
    marginTop: -30,
    marginBottom: 10,
  },
  cell: {
    width: 70,
    height: 70,
    lineHeight: 68,
    fontSize: 30,
    fontWeight: '700',
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 50,
    color: Constants.dark_green,
    backgroundColor: '#dddedf',
    borderColor: Constants.customgrey,
    // borderWidth: 1,
  },
  focusCell: {
    borderColor: Constants.dark_green,
  },
    logimbtn:{
    color:Constants.white,
    backgroundColor:Constants.dark_green,
    fontSize:16,
    fontFamily:FONTS.SemiBold,
    textAlign:'center',
    paddingVertical:10,
    borderRadius:10,
    // position:'absolute',
    // bottom:20,
    // width:'90%',
    // alignSelf:'center'
  },
})