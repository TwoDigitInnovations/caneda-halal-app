import {
  Image,
  Modal,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useContext, useEffect, useRef, useState} from 'react';
import {BackIcon,} from '../../../Theme';
import {goBack} from '../../../navigationRef';
import Constants, {Currency, FONTS} from '../../Assets/Helpers/constant';
import {DeliveryRiderContext, LoadContext, UserContext} from '../../../App';
import {GetApi, Post} from '../../Assets/Helpers/Service';
import { useTranslation } from 'react-i18next';

const DeliveryRiderWithdraw = () => {
  const { t } = useTranslation();
  const [deliveryriderProfile, setdeliveryriderProfile] = useContext(DeliveryRiderContext);;
  const [user, setUser] = useContext(UserContext);
  const [loading, setLoading] = useContext(LoadContext);
  const [model, setmodel] = useState(false);
  const [amount, setamount] = useState();
  const [reqamount, setreqamount] = useState();
  const [notes, setnotes] = useState('');
  const inputRef = useRef(null);
  useEffect(() => {
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 200);
  }, []);
  const submit = async () => {
    const data = {
      req_user: user?._id,
      req_profile: deliveryriderProfile?._id,
      amount: Number(amount),
      type: 'WITHDRAWAL',
      req_user_type:"delivery_rider"
    };
    if (notes !== '' || !notes) {
      data.note = notes;
    }
    setLoading(true);
    Post('createTransaction', data).then(
      async res => {
        setLoading(false);
        console.log(res);
        if (res.status) {
          setreqamount(Number(amount))
          setamount(null);
          setnotes('');
          getfoodProfile()
          setmodel(true);
        } else {
        }
      },
      err => {
        setLoading(false);
        console.log(err);
      },
    );
  };
   const getfoodProfile = () => {
          GetApi(`getProfile/DELIVERYRIDER`, {}).then(
            async res => {
              console.log(res.data);
                setdeliveryriderProfile(res?.data);
            },
            err => {
              console.log(err);
            },
          );
        };
  return (
    <SafeAreaView style={{flex:1}}>
    <View style={styles.container}>
      <View style={styles.frowbtn}>
        <TouchableOpacity style={styles.backcov} onPress={() => goBack()}>
          <BackIcon color={Constants.black}/>
        </TouchableOpacity>
        <Text style={styles.headtxt1}>{t("Withdraw")}</Text>
        <View></View>
      </View>
      <View style={styles.amtline}>
        <Text style={styles.amttxt}>{t("Withdrawable amount")}</Text>
        <Text style={styles.amttxt2}>{Currency}{deliveryriderProfile?.wallet}</Text>
      </View>
      <Text style={styles.headamt}>{t("Enter Amount")}</Text>
      <View style={styles.inpcov}>
        <Text
          style={[
            styles.curtxt,
            {
              color:
                Number(amount) > 0 ? Constants.black : Constants.customgrey2,
            },
          ]}>
          {Currency}
        </Text>
        <TextInput
          ref={inputRef}
          placeholder="0"
          placeholderTextColor={Constants.customgrey2}
          keyboardType="number-pad"
          style={[styles.textinp,Platform.OS === 'ios' && {lineHeight: 30}]}
          value={amount}
          onChangeText={e => setamount(e)}
        />
      </View>
      {Number(amount) > deliveryriderProfile?.wallet && (
        <Text style={styles.require}>
          {t("Your entered value is more than the withdrawable amount")}
        </Text>
      )}
      <Text style={styles.nottxt}>{t("Notes")}</Text>
      <View style={styles.inpucov}>
        <TextInput
          style={styles.inputfield}
          placeholder={t("Optional")}
          placeholderTextColor={Constants.customgrey2}
          numberOfLines={5}
          multiline={true}
          value={notes}
          onChangeText={e => setnotes(e)}></TextInput>
      </View>
      <TouchableOpacity
        style={[
          styles.btncov,
          {
            backgroundColor:
              Number(amount) > 0 &&
              Number(amount) <= deliveryriderProfile?.wallet &&
              amount
                ? Constants.normal_green
                : Constants.customgrey4,
          },
        ]}
        onPress={() => {
          if (Number(amount) > 0 &&Number(amount) <= deliveryriderProfile?.wallet &&amount) {
              submit();
          }
        }}>
        <Text
          style={[
            styles.btntxt,
            {
              color:
                Number(amount) > 0 &&
                Number(amount) <= deliveryriderProfile?.wallet &&
                amount
                  ? Constants.white
                  : Constants.customgrey2,
            },
          ]}>
          {t("Withdraw Amount")}
        </Text>
      </TouchableOpacity>
      <Modal transparent={true} visible={model} animationType="none">
        <View
          style={{
            justifyContent: 'center',
            flex: 1,
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}>
          <View style={styles.modal}>
            <View style={styles.box2}>
              <Image
                source={require('../../Assets/Images/correct.png')}
                style={styles.img}
              />
              <Text style={styles.modtxt}>
                {t("withdrawalSuccess", { reqamount,currency:Currency })}
              </Text>
              <Text style={styles.modtxt2}>
                {t("It will reflect in your bank account within 2 days")}
              </Text>
              <TouchableOpacity
                style={styles.button2}
                onPress={() => {
                  setmodel(false);
                  goBack()
                }}>
                <Text style={styles.buttontxt2}>{t("Okay")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      </View>
    </SafeAreaView>
  );
};

export default DeliveryRiderWithdraw;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.white,
    paddingVertical: 20,
  },
  backcov: {
    height: 30,
    width: 30,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Constants.customgrey4,
  },
  frowbtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  headtxt1: {
    fontSize: 16,
    color: Constants.black,
    fontFamily: FONTS.Medium,
    marginLeft: -20,
  },
  amtline: {
    flexDirection: 'row',
    backgroundColor: Constants.customgrey5,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 5,
    marginTop: 20,
    justifyContent: 'space-between',
  },
  amttxt: {
    fontSize: 15,
    fontFamily: FONTS.Medium,
    color: Constants.black,
  },
  amttxt2: {
    fontSize: 16,
    fontFamily: FONTS.SemiBold,
    color: Constants.normal_green,
  },
  headamt: {
    fontSize: 16,
    fontFamily: FONTS.SemiBold,
    color: Constants.customgrey3,
    textAlign: 'center',
    marginTop: 15,
  },
  nottxt: {
    fontSize: 16,
    fontFamily: FONTS.SemiBold,
    color: Constants.customgrey3,
    marginLeft: 20,
    marginTop: 25,
  },
  textinp: {
    color: Constants.black,
    fontSize: 24,
    fontFamily: FONTS.SemiBold,
  },
  curtxt: {
    color: Constants.black,
    fontSize: 24,
    fontFamily: FONTS.Medium,
  },
  inpcov: {
    borderBottomWidth: 2,
    borderColor: Constants.customgrey5,
    width: '70%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputfield: {
    color: Constants.black,
    fontSize: 14,
    fontFamily: FONTS.Medium,
    flex: 1,
    textAlignVertical: 'top',
  },
  inpucov: {
    borderWidth: 1,
    borderColor: Constants.customgrey5,
    borderRadius: 15,
    height: 100,
    paddingHorizontal: 10,
    marginHorizontal: 20,
  },
  btncov: {
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    height: 55,
    position: 'absolute',
    bottom: 10,
    width: '90%',
    alignSelf: 'center',
  },
  btntxt: {
    fontSize: 14,
    fontFamily: FONTS.SemiBold,
  },
  require: {
    color: Constants.red,
    fontFamily: FONTS.Regular,
    textAlign: 'center',
    fontSize: 14,
    marginTop: 10,
    width:'80%',
    alignSelf:'center'
  },
  ///model///
  modal: {
    // height: '40%',
    width: '85%',
    backgroundColor: Constants.white,
    borderRadius: 5,
  },
  box2: {
    padding: 20,
    // alignItems:'center',
    // justifyContent:'center'
  },
  modtxt: {
    fontSize: 16,
    color: Constants.black,
    fontFamily: FONTS.Medium,
    textAlign: 'center',
  },
  modtxt2: {
    fontSize: 14,
    color: Constants.customgrey2,
    fontFamily: FONTS.Medium,
    textAlign: 'center',
    width:'80%',
    alignSelf:'center'
  },
  button2: {
    backgroundColor: '#4BAE50',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    // marginBottom: 10,
    borderRadius: 7,
  },
  buttontxt2: {
    color: Constants.white,
    fontSize: 16,
    fontFamily: FONTS.SemiBold,
  },
  img: {height: 80, width: 80, alignSelf: 'center', marginBottom: 15},
});
