import {
  Dimensions,
  FlatList,
  Image,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { BackIcon } from '../../../../Theme';
import Constants, { Currency, FONTS } from '../../../Assets/Helpers/constant';
import { goBack, navigate } from '../../../../navigationRef';
import { LoadContext, ToastContext, UserContext } from '../../../../App';
import { GetApi } from '../../../Assets/Helpers/Service';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

const MyRides = () => {
  const dumydata = [1, 2, 3, 4];
  const { t } = useTranslation();
  const [ridelist, setridelist] = useState([]);
  const [toast, setToast] = useContext(ToastContext);
  const [loading, setLoading] = useContext(LoadContext);
  const [user, setuser] = useContext(UserContext);

  useEffect(() => {
    getpostedRide();
  }, []);
  const getpostedRide = async () => {
    setLoading(true);
    GetApi(`getpostedRide`, '').then(
      async res => {
        setLoading(false);
        console.log(res);
        setridelist(res.data);
      },
      err => {
        setLoading(false);
        console.log(err);
      },
    );
  };
  return (
    <SafeAreaView style={{flex:1}}>
    <View style={styles.container}>
      <View style={styles.topcov}>
        <BackIcon height={30} width={30} color={Constants.black} onPress={() => goBack()} />
      </View>
      <Text style={styles.edittxt}>{t("My rides")}</Text>
      <FlatList
        data={ridelist}
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
              {t("No bookings available")}
            </Text>
          </View>
        )}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.box} onPress={() => {
            navigate('SideMenu', { screen: 'RideDetail', params: { ride_id: item?._id } });
          }}>
            <View style={{ flexDirection: 'row', gap: 15 }}>
              <View style={styles.carcov}>
                <Image source={item?.vehicle_type?.vehicleimg?{uri:item?.vehicle_type?.vehicleimg} :require('../../../Assets/Images/car2.png')} style={{
                  height: 50,
                  width: 50,
                }} resizeMode='contain' />
              </View>
              <View style={{ width: '55%' }}>
                <Text style={styles.txt} numberOfLines={1}>
                  {item.destination}
                </Text>
                <Text style={styles.datetxt}>{moment(item.date).format('DD MMM, hh:mm A')}</Text>
              </View>
            </View>
            <Text style={styles.ratetxt}>{item?.ride_mode==='pool'?t('Pool Ride'):`${item?.final_price?item?.final_price:item?.price}${Currency}`}</Text>
          </TouchableOpacity>
        )}
      />
      </View>
    </SafeAreaView>
  );
};

export default MyRides;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.white,
    paddingHorizontal: 20,
    paddingVertical:Platform.OS==='ios'?10: 20,
  },
  topcov: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // marginVertical:20
  },
  edittxt: {
    color: Constants.black,
    fontFamily: FONTS.SemiBold,
    fontSize: 16,
    marginVertical: 10,
  },
  box: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 15,
    borderBottomWidth: 1,
    borderColor: Constants.customgrey2,
    paddingBottom: 15,
  },
  carcov: {
    // backgroundColor: Constants.customgrey2,
    height: 50,
    width: 50,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txt: {
    color: Constants.black,
    fontSize: 16,
    fontFamily: FONTS.Medium,
    // width:'60%',
    // backgroundColor:'red'
  },
  datetxt: {
    color: Constants.black,
    fontSize: 14,
    fontFamily: FONTS.Light,
  },
  ratetxt: {
    color: Constants.black,
    fontSize: 16,
    fontFamily: FONTS.SemiBold,
  },
});
