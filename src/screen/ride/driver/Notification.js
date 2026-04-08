import {
  Dimensions,
  FlatList,
  ImageBackground,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useContext, useEffect, useState} from 'react';
import {GetApi} from '../../../Assets/Helpers/Service';
import Constants, {FONTS} from '../../../Assets/Helpers/constant';
// import {
//   NotificationIcon,
// } from '../../../../Theme';
import moment from 'moment';
import {DriverProfileContext, LoadContext, ToastContext} from '../../../../App';
import DriverHeader from '../../../Assets/Component/DriverHeader';
import { useTranslation } from 'react-i18next';
import TranslateHandled from '../../../Assets/Component/TranslateHandled';

const Notification = props => {
  const { t } = useTranslation();
  const [toast, setToast] = useContext(ToastContext);
  const [loading, setLoading] = useContext(LoadContext);
   const [driverProfile, setdriverProfile] = useContext(DriverProfileContext);
  const [notification, setnotification] = useState([]);
  const [page, setPage] = useState(1);
  const [curentData, setCurrentData] = useState([]);

  useEffect(() => {
        getNotification(1);
  }, []);
  const getNotification = async (p) => {
    setPage(p);
    setLoading(true);
    GetApi(`getnotification?type=RIDE`).then(
      async res => {
        setLoading(false);
        console.log(res);
        setCurrentData(res.data);
        if (p === 1) {
          setnotification(res.data);
        } else {
          setnotification([...notification, ...res.data]);
        }
      },
      err => {
        setLoading(false);
        console.log(err);
      },
    );
  };
  const fetchNextPage = () => {
    if (curentData.length === 20) {
      getNotification(page + 1);
    }
  };
  return (
    <SafeAreaView style={[styles.container]}>
      <View style={{}}>
        <DriverHeader showback={true} item={t("My Notification")} />
      </View>
      {/* <Text style={styles.titleTxt}>My Notification</Text> */}
      <View style={{flex:1,paddingHorizontal:20}}>
        <FlatList
          data={notification}
          style={{marginBottom:Platform.OS==='ios'?55: 70}}
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
                  fontFamily: FONTS.Medium,
                }}>
                {t("No Notification")}
              </Text>
            </View>
          )}
          showsVerticalScrollIndicator={false}
          renderItem={({item}) => (
            <View style={[styles.box]}>
              <View style={styles.firstrowcov}>
                <View
                  style={styles.circle}></View>
                <Text style={styles.toptxt1}><TranslateHandled text={item?.title} /></Text>
                <Text style={styles.txtm}>•</Text>
                <Text style={styles.toptxt2}>
                  {moment(item.createdAt).format('DD MMM, hh:mm A')}
                  {/* 12 Mar 12:12 pm */}
                </Text>
              </View>

              <View style={styles.notitxt}>
                <Text style={[styles.txtm]}>{t("Hi")} {driverProfile?.username}!</Text>
                <Text style={[styles.txtm2]}><TranslateHandled text={item?.description} /></Text>
              </View>

              {/* <Text style={styles.date}>
                
              </Text> */}
            </View>
          )}
          onEndReached={() => {
            if (notification && notification.length > 0) {
              fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.05}
        />
      </View>
    </SafeAreaView>
  );
};

export default Notification;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    // padding: 20,
  },
  image: {
    height: 100,
    width: 100,
    position: 'absolute',
    opacity: 0.1,
    display: 'flex',
    alignSelf: 'center',
    top: Dimensions.get('screen').height / 2 - 50,
  },
  rootView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // width: wp(90),
    alignSelf: 'center',
    width: '100%',
    marginBottom: 20,
  },
  box: {
    // height: 80,
    backgroundColor: Constants.white,
    borderRadius: 20,
    // flexDirection: 'row',
    // alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical:10,
    marginVertical: 8,
    // borderWidth: 1,
    // borderColor: Constants.violet,
  },
  editiconcov: {
    height: 30,
    width: 30,
    borderRadius: 25,
    backgroundColor: Constants.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txtm: {
    fontWeight: '500',
    // marginVertical:10,
    color: Constants.black,
    fontSize: 16,
    fontFamily: FONTS.Medium,
  },
  toptxt1: {
    color: Constants.black,
    fontSize: 14,
    fontFamily: FONTS.Regular,
  },
  toptxt2: {
    color: Constants.black,
    fontSize: 14,
    fontFamily: FONTS.Light,
  },
  txtm2: {
    // fontWeight:'500',
    // marginVertical:10,
    color: Constants.customgrey,
    fontSize: 14,
    fontFamily: FONTS.Regular,
    // backgroundColor:'red',
    // flex:1,
    // width:'100%'
  },
  notitxt: {
    // marginLeft: 20,
    marginRight: 10,
    // paddingTop: 10,
    // backgroundColor:Constants.red
  },
  backcov: {
    width: 30,
    height: 25,
  },
  titleTxt: {
    color: Constants.black,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  date: {
    color: Constants.black,
    fontSize: 12,
    // fontWeight: '500',
    fontFamily: FONTS.Medium,
    alignSelf: 'flex-end',
    marginBottom: 5,
  },
  circle:{
    height: 20,
    width: 20,
    borderWidth: 5,
    borderColor: Constants.dark_green,
    borderRadius: 50,
  },
  firstrowcov:{flexDirection: 'row', gap: 10}
});
