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
  } from 'react-native';
  import React, {useContext, useEffect, useState} from 'react';
  import DriverHeader from '../../../Assets/Component/DriverHeader';
  import Constants, {Currency, FONTS} from '../../../Assets/Helpers/constant';
  import {navigate} from '../../../../navigationRef';
  import {useIsFocused} from '@react-navigation/native';
  import {LoadContext, ToastContext} from '../../../../App';
  import {GetApi, Post} from '../../../Assets/Helpers/Service';
  import moment from 'moment';
  import CuurentLocation from '../../../Assets/Component/CuurentLocation';
  import {StatusIcon, ThreedotIcon, ViewIcon} from '../../../../Theme';
import { useTranslation } from 'react-i18next';
  
  const DriverRides = () => {
    const { t } = useTranslation();
    const dumydata = [1, 2, 3, 4, 5];
    const IsFocused = useIsFocused();
    const [toast, setToast] = useContext(ToastContext);
    const [loading, setLoading] = useContext(LoadContext);
    const [productlist, setproductlist] = useState([]);
    const [currentTab, setCurrentTab] = useState('pending');
    const [acceptmodel, setacceptmodel] = useState(false);
    const [modalVisible, setModalVisible] = useState(null);
    const [ridetype, setridetype] = useState();
    const [orderid, setorderid] = useState('');
  
    useEffect(() => {
      if (IsFocused) {
        setproductlist([]);
        getacceptedRide();
        setCurrentTab('pending');
      }
    }, [IsFocused]);
  
    const getacceptedRide = () => {
        setLoading(true);
        GetApi('getacceptedRide').then(
          async res => {
            setLoading(false);
            console.log('$%#@^&**', res);
            setproductlist(res?.data);
          },
          err => {
            setLoading(false);
            setproductlist([]);
            console.log(err);
          },
        );
    };
  
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
                onPress={() => navigate('RideAction', {rideid:item?._id,type:item?.status==='started'?'dest':'src'})}>
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
                <Text style={styles.amount}>{item?.ride_mode==='pool'?t('Pool Ride'):`${Currency}${item?.final_price?item?.final_price:item?.price}`}</Text>
                
              </TouchableOpacity>
              {modalVisible === item._id && (
                <TouchableOpacity
                  style={styles.backdrop}
                  onPress={() => setModalVisible(null)}>
                  <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                      <TouchableOpacity
                        style={styles.popuplistcov}
                        onPress={() => {
                          navigate('DriverRideDetail', item?._id),
                          console.log(item?._id)
                            setModalVisible(null);
                        }}>
                        <View style={styles.popuplistcov2}>
                          <ViewIcon />
                          <Text>{t("View Details")}</Text>
                        </View>
                      </TouchableOpacity>
                      {/* {item?.status != 'Collected' && ( */}
                        <TouchableOpacity
                          style={styles.popuplistcov}
                          onPress={() => {
                            navigate('RideAction', {rideid:item?._id,type:'src'}),
                              setModalVisible(null);
                          }}>
                          <View style={styles.popuplistcov2}>
                            <StatusIcon />
                            <Text>{t("View Passanger Location")}</Text>
                          </View>
                        </TouchableOpacity>
                      {/* )} */}
                      <TouchableOpacity
                        style={[styles.popuplistcov,{borderBottomWidth:0}]}
                        onPress={() => {
                          navigate('RideAction', {
                            rideid: item._id,
                            type: 'dest',
                          }),
                            setModalVisible(null);
                        }}>
                        <View style={styles.popuplistcov2}>
                          <StatusIcon />
                          <Text>{t("View Destination Location")}</Text>
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
                  fontSize: 20,
                  fontFamily: FONTS.SemiBold,
                }}>
                {t("No Rides Available")}
              </Text>
            </View>
          )}
        />
        {/* </View> */}
        
      </SafeAreaView>
    );
  };
  
  export default DriverRides;
  
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
      boxShadow: '0px 0px 8px 0.05px grey',
      // paddingHorizontal:10
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
  