import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useContext, useEffect, useState} from 'react';
import Constants, {Currency, FONTS} from '../../../Assets/Helpers/constant';
import {CardField, useStripe, CardForm} from '@stripe/stripe-react-native';
import {GetApi, Post, Put} from '../../../Assets/Helpers/Service';
import {goBack, navigate} from '../../../../navigationRef';
import LottieView from 'lottie-react-native';
import { DriverProfileContext, LoadContext, ToastContext } from '../../../../App';
import { CrossIcon } from '../../../../Theme';
import { useTranslation } from 'react-i18next';

const Subscription = () => {
  const {initPaymentSheet, presentPaymentSheet, confirmPayment} = useStripe();
  const { t } = useTranslation();
  // const [dark, setdark] = useContext(ThemeContext);
  const [toast, setToast] = useContext(ToastContext);
  const [loading, setLoading] = useContext(LoadContext);
  const [driverProfile, setdriverProfile] = useContext(DriverProfileContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalVisible2, setModalVisible2] = useState(false);
  const [driverdata, setdriverdata] = useState();
  const [subcripdata, setsubcripdata] = useState();
  const [selectsub, setselectsub] = useState({});

  useEffect(() => {
    getsubscriptionplan();
    // getProfile();
  }, []);

  const getsubscriptionplan = () => {
    setLoading(true);
    GetApi(`getActiveSubscription`, {}).then(
      async res => {
        setLoading(false);
        console.log(res);
        setsubcripdata(res?.data);
      },
      err => {
        setLoading(false);
        console.log(err);
      },
    );
  };
  //  const getProfile = () => {
  //      setLoading(true);
  //      GetApi(`getProfile/RIDEDRIVER`, {}).then(
  //        async res => {
  //          setLoading(false);
  //          setdriverProfile(res?.data)
  //        },
  //        err => {
  //          setLoading(false);
  //          console.log(err);
  //        },
  //      );
  //    };

  const handleplayment = total => {
    setLoading(true);
    Post(
      'poststripe',
      {price: Number(total), currency: 'cad', version: 1},
      {},
    ).then(
      async res => {
        console.log(res);
        setLoading(false);
        const {error} = await initPaymentSheet({
          merchantDisplayName: 'CHMP',
          // customerId: res.customer,
          // customerEphemeralKeySecret: res.ephemeralKey,
          paymentIntentClientSecret: res.clientSecret,
          allowsDelayedPaymentMethods: true,
        });
        if (error) {
          console.log(error);
          return;
        }

        const {error: paymentError} = await presentPaymentSheet();

        if (paymentError) {
          console.log(`Error code: ${paymentError.code}`, paymentError.message);
          setModalVisible(true);
          return;
        } else {
          Updateuser(res.clientSecret);
          console.log('res', res);
        }
      },
      err => {
        setLoading(false);
        console.log(err);
      },
    );
  };

  const Updateuser = paymentid => {
    const date = new Date(); // Now
    date.setMonth(date.getMonth() + Number(selectsub.period));
    const body = {
      paymentid: paymentid,
      planExp: date,
      subscriptiondata: selectsub,
      subscription: selectsub._id,
    };
    console.log('body', body);
    setLoading(true);
    Put(`updateSubscriptionPlanin/${driverProfile?._id}`, body).then(
      async res => {
        setLoading(false);
        console.log(res);
        if (res?.status) {
          setdriverProfile(res?.data?.data)
        }
        setModalVisible2(true);
      },
      err => {
        setLoading(false);
        console.log(err);
      },
    );
  };
  // const Updateuserfreeplain = paymentid => {
  //   const date = new Date(); // Now
  //   date.setMonth(date.getMonth() + 1);
  //   const body = {
  //     planExp: date,
  //     firstsubscription: true,
  //   };
  //   console.log('body', body);
  //   setLoading(true);
  //   Put(`updateplaninuser`, body).then(
  //     async res => {
  //       setLoading(false);
  //       console.log(res);
  //       setModalVisible2(true);
  //       // if (res?.success) {
  //       // }
  //     },
  //     err => {
  //       setLoading(false);
  //       console.log(err);
  //     },
  //   );
  // };

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={{
          //   height: '100%',
          flex: 1,
          paddingVertical: 10,
          backgroundColor: Constants.white,
        }}>
        {/* <Header item={'Subscription'}  /> */}
        {/* <CrossIcon
          height={20}
          width={20}
          color={dark ? Constants.white : Constants.black}
          style={{marginTop: 20, marginHorizontal: 25, alignSelf: 'flex-end'}}
          onPress={() => goBack()}
        /> */}
        <Image
          source={require('../../../Assets/Images/sub1.png')}
          style={styles.subpopimg}
        />
        <Text style={styles.headtxt}>{t("Get Subscription")}</Text>
        <View style={{flex: 1}}>
          <FlatList
            data={subcripdata}
            showsVerticalScrollIndicator={false}
            numColumns={2}
            // style={{backgroundColor:'red'}}
            renderItem={({item}) => (
              <TouchableOpacity
                style={[
                  styles.subcbox,
                  {
                    backgroundColor:
                      selectsub?._id === item?._id
                        ? Constants.custom_green
                        : null,
                  },
                ]}
                onPress={() => setselectsub(item)}>
                <View>
                  <Text
                    style={[
                      // !driverdata?.firstsubscription &&
                      // !driverdata?.paymentid &&
                      // item.period === 1
                      //   ? styles.free: 
                        styles.subname,
                        {
                          color:
                            selectsub?._id === item?._id
                              ? Constants.white
                              : Constants.custom_green,
                        },
                    ]}>
                    {
                    // !driverdata?.firstsubscription &&
                    // !driverdata?.paymentid &&
                    // item.period === 1
                    //   ? `Free`: 
                      item?.type}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.suboffer,
                    {
                      color:
                        selectsub?._id === item?._id
                          ? Constants.white
                          : Constants.custom_green,
                    },
                  ]}>
                  {Currency}
                  {
                  // !driverdata?.firstsubscription &&
                  // !driverdata?.paymentid &&
                  // item.period === 1
                  //   ? 0: 
                    item?.offer}
                  /{item?.type}
                </Text>
                <Text
                  style={[
                    styles.subprice,
                    {
                      color:
                        selectsub?._id === item?._id
                          ? Constants.white
                          : Constants.custom_green,
                    },
                  ]}>
                  {Currency}{item?.plan}/{item?.type}
                </Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={() => (
                    <View
                      style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: Dimensions.get('window').height - 300,
                      }}>
                      <Text
                        style={{
                          color: Constants.black,
                          fontSize: 18,
                          fontFamily: FONTS.Medium,
                        }}>
                        {!subcripdata ? t('Loading...') : t('No plan avilable')}
                      </Text>
                    </View>
                  )}
          />
          <TouchableOpacity
            style={[
              styles.subbtn,
              {
                backgroundColor: selectsub?._id
                  ? Constants.custom_green
                  : '#7d8a84',
              },
            ]}
            // onPress={() => selectsub?._id &&!driverdata?.firstsubscription&&!driverdata?.paymentid&&selectsub.period===1?Updateuserfreeplain(): selectsub?._id &&handleplayment(selectsub?.offer)}
            onPress={() => selectsub?._id &&handleplayment(selectsub?.offer)}
          >
            <Text style={styles.subbtntxt}>{t("Subscribe Now")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.skipbtn}
            onPress={() => {
              goBack(), setselectsub({});
            }}>
            <Text style={[styles.subbtntxt, {color: Constants.custom_green}]}>
              {t("Skip")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <Modal
        animationType="none"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          // Alert.alert('Modal has been closed.');
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.centeredView}>
          <View
            style={[
              styles.modalView,
              // {
              //   // backgroundColor: Constants.black,
              //   borderColor: Constants.custom_green,
              //   borderWidth: 1,
              // },
            ]}>
            <CrossIcon
              height={15}
              width={15}
              color={Constants.white}
              style={styles.cross}
              onPress={() => setModalVisible(false)}
            />
            <View
              style={{
                backgroundColor: Constants.white,
                alignItems: 'center',
              }}>
              {/* <Image
                source={require('../../Assets/Images/remove.png')}
                style={styles.removeimg}
              /> */}
              <LottieView
                source={require('../../../Assets/Animation/failed.json')}
                autoPlay
                loop={false}
                style={{height: 100, width: 100}}
              />
              <Text style={[styles.textStyle, {color: Constants.white}]}>
                {t("Payment Failed")}
              </Text>
              <TouchableOpacity
                style={styles.errorbtn}
                onPress={() => {
                  setModalVisible(false);
                }}>
                <Text style={styles.errorbtntxt}>{t("Try Again")}</Text>
              </TouchableOpacity>
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
          <View
            style={[
              styles.modalView,
              // {
              //   // backgroundColor: Constants.black,
              //   borderColor: Constants.custom_green,
              //   borderWidth: 1,
              // },
            ]}>
            <CrossIcon
              height={15}
              width={15}
              color={Constants.white}
              style={styles.cross}
              onPress={() => {
                setModalVisible2(false), goBack();
              }}
            />
            <View
              style={{
                backgroundColor: Constants.white,
                alignItems: 'center',
              }}>
              {/* <Image
                source={require('../../Assets/Images/remove.png')}
                style={styles.removeimg}
              /> */}
              <LottieView
                source={require('../../../Assets/Animation/payment.json')}
                autoPlay
                loop={false}
                style={{height: 100, width: 100}}
              />
              <Text style={[styles.textStyle, {color: Constants.custom_green}]}>
                {t("Payment Successfull")}
              </Text>
              <TouchableOpacity
                style={[
                  styles.errorbtn,
                  {backgroundColor: Constants.custom_green},
                ]}
                onPress={() => {
                  setModalVisible2(false);
                  // navigate('DriverApp')
                  goBack();
                }}>
                <Text style={styles.errorbtntxt}>{t("Done")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Subscription;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.white,
    // paddingVertical: 20,
  },
  subpopimg: {
    height: '30%',
    width: '100%',
    // resizeMode: 'contain',
    // backgroundColor:'red'
  },
  headtxt: {
    color: Constants.custom_green,
    fontSize: 24,
    fontFamily: FONTS.SemiBold,
    textAlign: 'center',
    marginBottom: 10,
    marginTop:10
  },
  free: {
    color: Constants.custom_green,
    fontSize: 20,
    fontFamily: FONTS.Bold,
  },
  subname: {
    color: Constants.custom_green,
    fontSize: 18,
    fontFamily: FONTS.SemiBold,
  },
  suboffer: {
    color: Constants.custom_green,
    fontSize: 16,
    fontFamily: FONTS.SemiBold,
  },
  subbtntxt: {
    color: Constants.white,
    fontSize: 18,
    fontFamily: FONTS.SemiBold,
  },
  subprice: {
    color: Constants.custom_green,
    fontSize: 16,
    fontFamily: FONTS.SemiBold,
    textDecorationLine: 'line-through',
  },
  subcbox: {
    borderColor: Constants.custom_green,
    borderWidth: 2,
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 15,
    margin: 10,
    width: '45%',
  },
  subbtn: {
    backgroundColor: Constants.custom_green,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    width: '90%',
    alignSelf: 'center',
    height: 50,
    marginVertical: 10,
    // position:'absolute',
    // bottom:30
  },
  skipbtn: {
    borderColor: Constants.custom_green,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    width: '90%',
    alignSelf: 'center',
    height: 50,
    marginBottom: 20,
    // position:'absolute',
    // bottom:30
  },

  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // marginTop: 22,
    backgroundColor: '#rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 35,
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
  removeimg: {
    height: 60,
    width: 60,
  },
  textStyle: {
    fontFamily: FONTS.Bold,
    color: Constants.black,
    fontSize: 16,
    marginVertical: 10,
  },
  errorbtn: {
    width: 200,
    backgroundColor: '#F44336',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 10,
    marginTop: 10,
    borderRadius: 10,
  },
  errorbtntxt: {
    fontSize: 18,
    color: Constants.white,
    fontFamily: FONTS.Bold,
  },
  cross: {
    position: 'absolute',
    right: 15,
    top: 15,
  },
});
