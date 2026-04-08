import {
  Dimensions,
  FlatList,
  ImageBackground,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useContext, useEffect, useState} from 'react';
import {GetApi} from '../../Assets/Helpers/Service';
import Constants, {FONTS} from '../../Assets/Helpers/constant';
import moment from 'moment';
import {DriverProfileContext, LoadContext, ToastContext} from '../../../App';
import DriverHeader from '../../Assets/Component/DriverHeader';
import {BackIcon, Notification2Icon} from '../../../Theme';
import {goBack} from '../../../navigationRef';
import { useTranslation } from 'react-i18next';
import TranslateHandled from '../../Assets/Component/TranslateHandled';

const DeliveryRiderNotification = props => {
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
  const getNotification = async p => {
    setPage(p);
    setLoading(true);
    GetApi(`getnotification?type=DELIVERYRIDER`, '').then(
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
      <View style={styles.rowbtn}>
        <TouchableOpacity style={styles.backcov} onPress={() => goBack()}>
          <BackIcon color={Constants.black}/>
        </TouchableOpacity>
        <Text style={styles.headtxt}>{t("Notification")}</Text>
        <View></View>
      </View>
      <View style={{flex: 1, paddingHorizontal: 20}}>
        <FlatList
          data={notification}
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
                {t("No Notification")}
              </Text>
            </View>
          )}
          showsVerticalScrollIndicator={false}
          renderItem={({item}) => (
            <View style={[styles.box]}>
              <View style={{justifyContent: 'center', alignItems: 'center'}}>
                <View style={styles.iconcov}>
                  <Notification2Icon
                    height={20}
                    width={20}
                    color={Constants.black}
                  />
                </View>
              </View>
              <View style={styles.notitxt}>
                <Text style={styles.toptxt1}><TranslateHandled text={item?.title} /></Text>
                <Text style={[styles.txtm2]}><TranslateHandled text={item?.description} /></Text>
                <Text style={styles.toptxt2}>
                  {moment(item.createdAt).format('DD MMM, hh:mm A')}
                </Text>
              </View>
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

export default DeliveryRiderNotification;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.white,
    // padding: 20,
  },
  headtxt: {
    color: Constants.black,
    fontSize: 16,
    fontFamily: FONTS.SemiBold,
  },
  rowbtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  backcov: {
    height: 30,
    width: 30,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Constants.customgrey4,
  },
  iconcov: {
    backgroundColor: '#F5F5FF',
    borderRadius: 20,
    padding: 10,
  },
  box: {
    flexDirection: 'row',
    paddingRight: 20,
    marginVertical: 10,
    // backgroundColor:'red'
  },
  toptxt1: {
    color: Constants.black,
    fontSize: 14,
    fontFamily: FONTS.SemiBold,
  },
  toptxt2: {
    color: Constants.black,
    fontSize: 12,
    fontFamily: FONTS.Regular,
    alignSelf: 'flex-end',
  },
  txtm2: {
    color: Constants.customgrey,
    fontSize: 14,
    fontFamily: FONTS.Regular,
  },
  notitxt: {
    marginLeft: 10,
    width: '90%',
  },
});
