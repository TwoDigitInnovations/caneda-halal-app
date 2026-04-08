import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import React, { useContext, useState } from 'react';
import { BackIcon, CrossIcon } from '../../../../Theme';
import Constants from '../../../Assets/Helpers/constant';
import { goBack, navigate, reset } from '../../../../navigationRef';
import { LoadContext, ToastContext, UserContext } from '../../../../App';
import { Post } from '../../../Assets/Helpers/Service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FONTS } from '../../../Assets/Helpers/constant';
import { useTranslation } from 'react-i18next';

const PassengerDeatail = (props) => {
  const data = props?.route?.params
  const { t } = useTranslation();
  const [toast, setToast] = useContext(ToastContext);
  const [loading, setLoading] = useContext(LoadContext);
  const [user, setUser] = useContext(UserContext);
  const [submitted, setSubmitted] = useState(false);
  const [userDetail, setUserDetail] = useState({
    number: !data.bookfor ? user.phone : '',
    name: '',
  });

  const submit = async () => {
    if (userDetail.name === '' || userDetail.number === '') {
      setSubmitted(true);
      return;
    }
    const navigatedata = {
      name: userDetail.name,
      number: userDetail.number,
      data
    };
    if (data.bookfor) {
      navigate('SideMenu', { screen: 'SelectRide', params: navigatedata })

    } else {
      updateProfile()
    }
  };
  const updateProfile = () => {
    setLoading(true);
    Post('updateProfile/RIDEUSER', { username: userDetail.name }, {}).then(
      async res => {
        setLoading(false);
        console.log(res);
        navigate('SideMenu', {
          screen: 'SelectRide', params: {
            name: userDetail.name,
            number: userDetail.number,
            data
          }
        })
      },
      err => {
        setLoading(false);
        console.log(err);
      },
    );
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.toppart}>
        <BackIcon color={Constants.dark_green} height={30} width={30} onPress={() => goBack()} />
        <Text style={styles.headtxt}>{t("Passenger Details")}</Text>
      </View>

      <View style={[styles.inpucov, { backgroundColor: submitted && userDetail.name === '' ? Constants.light_red : Constants.customgrey4 }]}>
        <TextInput style={styles.inputfield} placeholder={t('Name')} placeholderTextColor={Constants.black} value={userDetail.name}
          onChangeText={name =>
            setUserDetail({ ...userDetail, name })
          }></TextInput>
      </View>
      {submitted && userDetail.name === '' && (
        <Text style={styles.require}>{t("Name is required")}</Text>
      )}
      <View style={[styles.inpucov, { backgroundColor: submitted && userDetail.number === '' ? Constants.light_red : Constants.customgrey4 }]}>
        <TextInput style={styles.inputfield} placeholder={t('Phone')} placeholderTextColor={Constants.black}
          keyboardType='number-pad' value={userDetail.number}
          onChangeText={number =>
            setUserDetail({ ...userDetail, number })
          }></TextInput>

      </View>
      {submitted && userDetail.number === '' && (
        <Text style={styles.require}>{t("Number is required")}</Text>
      )}
      <Text style={styles.logimbtn} onPress={() => submit()}>{t("Next")}</Text>
    </SafeAreaView>
  );
};

export default PassengerDeatail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.white,
    padding: 20,
  },
  toppart: {
    flexDirection: 'row',
    gap: 15,
    alignItems: 'center',
    marginBottom: 20
  },
  headtxt: {
    color: Constants.black,
    fontFamily: FONTS.Bold,
    fontSize: 18,
    // marginVertical:20
  },
  inputfield: {
    color: Constants.black,
    fontSize: 16,
    fontFamily: FONTS.SemiBold,
    flex: 1
  },
  inpucov: {
    backgroundColor: Constants.customgrey,
    marginVertical: 10,
    borderRadius: 15,
    height: 50,
    paddingHorizontal: 10,
    flexDirection: 'row'
  },
  iconView: {
    marginRight: 10,
    alignSelf: 'center',
    borderRightWidth: 4,
    borderRightColor: 'blue',
  },
  logimbtn: {
    color: Constants.white,
    backgroundColor: Constants.dark_green,
    fontSize: 16,
    fontFamily: FONTS.SemiBold,
    width: '90%',
    textAlign: 'center',
    paddingVertical: 10,
    borderRadius: 15,
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center'
  },
  require: {
    color: Constants.red,
    fontFamily: FONTS.Medium,
    marginLeft: 10,
    fontSize: 14
  },
})