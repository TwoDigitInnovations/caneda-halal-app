import {
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  RefreshControl,
} from 'react-native';
import React, {useCallback, useContext, useEffect, useState} from 'react';
import DriverHeader from '../../../Assets/Component/DriverHeader';
import Constants, {Currency, FONTS} from '../../../Assets/Helpers/constant';
import {navigate} from '../../../../navigationRef';
import {useIsFocused} from '@react-navigation/native';
import {DriverProfileContext, LoadContext, ToastContext, UserContext} from '../../../../App';
import {GetApi, Post} from '../../../Assets/Helpers/Service';
import moment from 'moment';
import CuurentLocation from '../../../Assets/Component/CuurentLocation';
import {StatusIcon, ThreedotIcon, ViewIcon} from '../../../../Theme';
import { useTranslation } from 'react-i18next';

const Work = () => {
  const { t } = useTranslation();
  const dumydata = [1, 2, 3, 4, 5];
  const IsFocused = useIsFocused();
  const [toast, setToast] = useContext(ToastContext);
  const [loading, setLoading] = useContext(LoadContext);
  const [driverProfile, setdriverProfile] = useContext(DriverProfileContext);
  const [user, setuser] = useContext(UserContext);
  const [productlist, setproductlist] = useState([]);
  const [currentTab, setCurrentTab] = useState('pending');
  const [acceptmodel, setacceptmodel] = useState(false);
  const [subscription, setsubscription] = useState(false);
  const [modalVisible, setModalVisible] = useState(null);
  const [ridetype, setridetype] = useState();
  const [orderid, setorderid] = useState('');

  useEffect(() => {
    if (IsFocused) {
      setproductlist([]);
      nearbylocation();
      setCurrentTab('pending');
      getsubscriptionplan()
    }
  }, [IsFocused]);

  const nearbylocation = () => {
    CuurentLocation(res => {
      const data2 = {
        location: [Number(res.coords.longitude), Number(res.coords.latitude)],
        vehicle_type:driverProfile?.vehicle_type
      };
      console.log('data==========>', data2);
      setLoading(true);
      Post('nearbyrides', data2, {}).then(
        async res => {
          setLoading(false);
          setRefreshing(false)
          console.log('$%#@^&**', res);
          setproductlist(res?.data);
        },
        err => {
          setLoading(false);
          setRefreshing(false)
          setproductlist([]);
          console.log(err);
        },
      );
    });
  };

  const Acceptride = id => {
    setLoading(true);
    GetApi(`acceptRide/${id}`, {}).then(
      async res => {
        setLoading(false);
        console.log(res);
        if (res?.status) {
          nearbylocation();
        } else {
          if (res?.message) {
            setToast(res?.message);
          }
        }
      },
      err => {
        setLoading(false);
        console.log(err);
      },
    );
  };
  const Rejectride = id => {
    setLoading(true);
    GetApi(`rejectRide/${id}`, {}).then(
      async res => {
        setLoading(false);
        console.log(res);
        if (res?.status) {
          nearbylocation();
        } else {
          if (res?.message) {
            setToast(res?.message);
          }
        }
      },
      err => {
        setLoading(false);
        console.log(err);
      },
    );
  };
  
    const getsubscriptionplan = () => {
      setLoading(true);
      GetApi(`getActiveSubscription`, {}).then(
        async res => {
          setLoading(false);
          console.log(res);
          if (res?.status&&res?.data&&res?.data?.length>0) {
            setsubscription(true)
          }
          // setsubcripdata(res?.data);
        },
        err => {
          setLoading(false);
          console.log(err);
        },
      );
    };
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    nearbylocation();
    // setPage(1);
  }, []);
  return (
    <SafeAreaView style={styles.container}>
      <DriverHeader item={t('My Rides')} hideprofile={true}/>
      <FlatList
        data={productlist}
        showsVerticalScrollIndicator={false}
        style={{marginBottom: 70}}
        renderItem={({item}) => (
          <View>
            <TouchableOpacity
              style={styles.box}
              onPress={()=>navigate('DriverRideDetail', item?._id)}
              >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}>
                <View style={{flexDirection: 'row'}}>
                  <Image
                    source={
                      item?.user_profile?.image
                        ? {
                            uri: `${item.user_profile?.image}`,
                          }
                        : require('../../../Assets/Images/profile.png')
                    }
                    style={styles.hi}
                    // onPress={()=>navigate('Account')}
                  />
                  <View>
                    <Text style={styles.name}>
                      {item?.user_profile?.username}
                    </Text>
                    <Text style={styles.redeembtn}>
                      {moment(item?.date).format('DD-MM-YYYY')}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setModalVisible(item._id), console.log(item.index);
                  }}
                  style={{height: 30, width: 30, alignItems: 'flex-end'}}>
                  <ThreedotIcon />
                </TouchableOpacity>
              </View>
              <View style={styles.secendpart}>
                <Text>
                <Text style={styles.secendboldtxt}>{t("Location from")}: </Text>
                <Text style={styles.secendtxt2}>{item?.source}</Text>
                </Text>
              </View>
              {item?.stops?.length>0&&item?.stops.map((it,index)=><View style={styles.secendpart} key={index}>
                <Text>
                <Text style={styles.secendboldtxt}>{t("Stop")} {index+1}: </Text>
                <Text style={styles.secendtxt2}>{it?.address}</Text>
                </Text>
              </View>)}
              <View style={styles.secendpart}>
                <Text>
                <Text style={styles.secendboldtxt}>{t("Location to")}: </Text>
                <Text style={styles.secendtxt2}>{item?.destination}</Text>
                </Text>
              </View>
              <View style={{flexDirection:'row',gap:10,alignItems:'center'}}>
              <Text style={styles.amount}>{item?.ride_mode==='pool'?t('Pool Ride'):`${Currency}${item?.final_price?item?.final_price:item?.price}`}</Text>
              {item?.req_join_driver===user?._id&&<Text style={styles.passtxt}>{t("This passenger wants to join you")}</Text>}
              </View>
              <View style={{flexDirection:'row',gap:15}}>
                <TouchableOpacity
                  style={styles.acceptButtonStyle}
                  onPress={() => {
                    setacceptmodel(true), setorderid(item?._id),setridetype('reject');
                  }}>
                  <Text style={styles.modalText}>{t("Reject Ride")}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.acceptButtonStyle}
                  onPress={() => {
                    if (new Date(driverProfile?.planExp)>new Date()||!subscription) {
                      setacceptmodel(true), setorderid(item?._id),setridetype('accept');
                    }
                    else(
                      navigate('Subscription')
                    )
                  }}>
                  <Text style={styles.modalText}>{t("Accept Ride")}</Text>
                </TouchableOpacity>
                <View style={{flex:0.5}}></View>
              </View>
            </TouchableOpacity>
            {modalVisible === item._id && (
              <TouchableOpacity
                style={styles.backdrop}
                onPress={() => setModalVisible(null)}>
                <View style={styles.centeredView}>
                  <View style={styles.modalView}>
                    <TouchableOpacity
                      // style={styles.popuplistcov}
                      onPress={() => {
                        setModalVisible(null),
                        navigate('DriverRideDetail', item?._id)
                      }}>
                      <View style={styles.popuplistcov2}>
                        <ViewIcon />
                        <Text>{t("View Details")}</Text>
                      </View>
                    </TouchableOpacity>
                    
                  </View>
                </View>
                <View></View>
              </TouchableOpacity>
            )}
          </View>
        )}
        ListEmptyComponent={() => (
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              height: Dimensions.get('window').height - 200,
            }}>
            <Text
              style={{
                color: Constants.black,
                fontSize: 18,
                fontFamily: FONTS.Medium,
              }}>
              {t("No Rides Available")}
            </Text>
          </View>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
      {/* </View> */}
      <Modal
        animationType="none"
        transparent={true}
        visible={acceptmodel}
        onRequestClose={() => {
          // Alert.alert('Modal has been closed.');
          setacceptmodel(!acceptmodel);
        }}>
        <View style={styles.centeredView2}>
          <View style={styles.modalView2}>
            <Text style={styles.alrt}>{t("Alert !")}</Text>
            <View
              style={{
                backgroundColor: 'white',
                alignItems: 'center',
                paddingHorizontal: 30,
              }}>
              <Text style={styles.textStyle}>
                {t('confirmRideAction', {
                  action: ridetype === 'accept' ? t('Accept') : t('Reject'),
                })}
              </Text>
              <View style={styles.cancelAndLogoutButtonWrapStyle}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => setacceptmodel(!acceptmodel)}
                  style={styles.cancelButtonStyle}>
                  <Text
                    style={[
                      styles.modalText,
                      {color: Constants.custom_yellow},
                    ]}>
                    {t("No")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.9}
                  style={styles.logOutButtonStyle}
                  onPress={() => {
                    ridetype==='accept'?Acceptride(orderid):Rejectride(orderid), setacceptmodel(false);
                  }}>
                  <Text style={styles.modalText}>{t("Yes")}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Work;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.lightgrey,
  },
  box: {
    backgroundColor: Constants.white,
    marginVertical: 10,
    padding: 20,
  },
  hi: {
    marginRight: 10,
    height: 50,
    width: 50,
    borderRadius: 50,
  },
  redeembtn: {
    color: Constants.white,
    fontSize: 16,
    fontFamily: FONTS.Medium,
    backgroundColor: Constants.dark_green,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginVertical: 7,
    borderRadius: 8,
  },
  name: {
    color: Constants.black,
    fontFamily: FONTS.Bold,
    fontSize: 14,
  },
  secendpart: {
    flexDirection: 'row',
    // flex: 1,
    // justifyContent: 'space-between',
    marginLeft: 10,
    marginVertical: 5,
  },
  secendboldtxt: {
    color: Constants.customgrey3,
    fontSize: 15,
    fontFamily: FONTS.Light,
    alignSelf: 'center',
  },
  secendtxt: {
    color: Constants.black,
    fontSize: 15,
    textAlign: 'left',
  },
  secendtxt2: {
    color: Constants.black,
    fontFamily:FONTS.Regular,
    fontSize: 15,
    textAlign: 'left',
    flex: 1,
  },
  txtcol: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // flex: 1,
  },
  amount: {
    color: Constants.dark_green,
    fontSize: 24,
    fontFamily: FONTS.Bold,
    // alignSelf: 'flex-end',
  },
  cancelAndLogoutButtonWrapStyle2: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 3,
  },
  cancelButtonStyle: {
    flex: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    marginRight: 10,
    borderColor: Constants.dark_green,
    borderWidth: 1,
    borderRadius: 10,
  },
  logOutButtonStyle: {
    flex: 0.5,
    backgroundColor: Constants.dark_green,
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  //////Model////////

  textStyle: {
    color: Constants.black,
    // fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: FONTS.Medium,
    fontSize: 16,
    margin: 20,
    marginBottom: 10,
  },
  cancelAndLogoutButtonWrapStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 3,
  },
  alrt: {
    color: Constants.black,
    fontSize: 18,
    fontFamily: FONTS.Bold,
    // backgroundColor: 'red',
    width: '100%',
    textAlign: 'center',
    borderBottomWidth: 1.5,
    borderBottomColor: Constants.customgrey2,
    paddingBottom: 20,
  },
  modalText: {
    color: Constants.white,
    // fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: FONTS.Medium,
    fontSize: 14,
  },
  passtxt: {
    color: Constants.normal_green,
    textAlign: 'center',
    fontFamily: FONTS.SemiBold,
    fontSize: 14,
  },
  acceptButtonStyle: {
    flex: 1,
    backgroundColor: Constants.dark_green,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    // marginLeft: 10,
    boxShadow: '0px 3px 10px 0.05px grey'
  },

  ////model
  centeredView2: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // marginTop: 22,
    backgroundColor: '#rgba(0, 0, 0, 0.5)',
  },
  modalView2: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    paddingVertical: 20,
    alignItems: 'center',
    width: '90%',
  },
  ///////Pop up model////
  centeredView: {
    position: 'absolute',
    right: 20,
    top: 60,
    // flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center',
    // backgroundColor: '#rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    // margin: 20,
    backgroundColor: 'white',
    borderRadius: 5,
    // paddingVertical: 20,
    // alignItems: 'center',
    boxShadow: '0px 5px 8px 0.05px grey',
    // paddingHorizontal:10
    minWidth:150
  },
  popuplistcov: {
    // marginVertical:10,
    borderBottomWidth: 1,
    borderColor: Constants.customgrey,
  },
  popuplistcov2: {
    flexDirection: 'row',
    gap: 10,
    margin: 10,
    // borderBottomWidth:1,
    // borderColor:Constants.customgrey
  },
  backdrop: {
    // flex:1,
    // backgroundColor:Constants.red,
    height: '100%',
    width: '100%',
    position: 'absolute',
    top: 0,
  },
});
