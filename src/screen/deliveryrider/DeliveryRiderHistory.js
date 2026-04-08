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
import React, { useContext, useEffect, useState } from 'react';
import Constants, { Currency, FONTS } from '../../Assets/Helpers/constant';
import { navigate } from '../../../navigationRef';
import { LoadContext, ToastContext } from '../../../App';
import { GetApi } from '../../Assets/Helpers/Service';
import moment from 'moment';
import DriverHeader from '../../Assets/Component/DriverHeader';
import { useTranslation } from 'react-i18next';

const DeliveryRiderHistory = () => {
  const { t } = useTranslation();
  const [toast, setToast] = useContext(ToastContext);
  const [loading, setLoading] = useContext(LoadContext);
  const [orderlist, setorderlist] = useState([]);
  const [curentData, setCurrentData] = useState([]);
  const [page, setPage] = useState(1);
  // const IsFocused = useIsFocused();
  useEffect(() => {
    // if (IsFocused) {
    getorderhistory(1);
    // }
  }, []);

  const getorderhistory = (p) => {
    setPage(p)
    setLoading(true);
    GetApi(`foodorderhistoryfordriver?page=${p}`, {}).then(
      async res => {
        setLoading(false);
        console.log('$%#@^&**', res);
        // setorderlist(res?.data);
        setCurrentData(res.data);
        if (p === 1) {
          setorderlist(res.data);
        } else {
          setorderlist([...notification, ...res.data]);
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
      getorderhistory(page + 1);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <DriverHeader item={t('History')} showback={true}/>
      <View style={{ flex: 1,}}>
        <FlatList
          data={orderlist}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const typeChar = item.order_id?.charAt(4); // CHMPF or CHMPG → index 4
  const typeLabel = typeChar === "F" ? "Food" : typeChar === "G" ? "Grocery" :typeChar === "S" ? "Shopping" : "Unknown";
            return<TouchableOpacity
              style={styles.box}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}>
                <View style={{ flexDirection: 'row' }}>
                  <Image
                    source={
                      item?.user_profile?.image
                        ? {
                          uri: `${item.user_profile?.image}`,
                        }
                        : require('../../Assets/Images/profile.png')
                    }
                    style={styles.hi}
                  // onPress={()=>navigate('Account')}
                  />
                  <View>
                    <Text style={styles.name}>
                      {item?.user_profile?.username}
                    </Text>
                    <Text style={styles.redeembtn}>
                      {moment(item?.date).format('DD-MM-YYYY hh:mm A')}
                    </Text>
                  </View>
                </View>

              </View>
              <View style={styles.secendpart}>
                <Text>
                  <Text style={styles.secendboldtxt}>{t("Location from")}: </Text>
                  <Text style={styles.secendtxt2}>{item?.seller_profile?.address}</Text>
                </Text>
              </View>
              <View style={styles.secendpart}>
                <Text>
                  <Text style={styles.secendboldtxt}>{t("Location to")}: </Text>
                  <Text style={styles.secendtxt2}>{item?.shipping_address?.address}</Text>
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.food}>{typeLabel}</Text>
                <Text style={styles.amount}>{Currency}{item?.total_deliverd_amount}</Text>
              </View>

            </TouchableOpacity>
          }}
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
                {t("No History Available")}
              </Text>
            </View>
          )}
          onEndReached={() => {
            if (orderlist && orderlist.length > 0) {
              fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.05}
        />
      </View>
    </SafeAreaView>
  );
};

export default DeliveryRiderHistory;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'f2f2f2',
  },
  box: {
    backgroundColor: Constants.white,
    marginVertical: 5,
    padding: 20,
  },
  hi: {
    marginRight: 10,
    height: 50,
    width: 50,
    borderRadius: 50,
  },
  redeembtn: {
    color: Constants.normal_green,
    fontSize: 16,
    fontFamily: FONTS.Medium,
    // backgroundColor: Constants.violet,
    // paddingHorizontal: 10,
    // paddingVertical: 5,
    // marginVertical: 7,
    // borderRadius: 8,
  },
  name: {
    color: Constants.black,
    fontFamily: FONTS.Bold,
    fontSize: 16,
  },
  secendpart: {
    flexDirection: 'row',
    // flex: 1,
    // justifyContent: 'space-between',
    marginLeft: 10,
    marginVertical: 5,
    alignItems: 'center',
  },
  secendboldtxt: {
    color: Constants.black,
    fontSize: 14,
    fontFamily: FONTS.SemiBold,
    alignSelf: 'center',
    // textAlign:'left'
  },
  secendtxt: {
    color: Constants.black,
    fontSize: 15,
    textAlign: 'left',
    fontFamily: FONTS.Regular,
  },
  secendtxt2: {
    color: Constants.black,
    fontSize: 15,
    textAlign: 'left',
    flex: 1,
    fontFamily: FONTS.Regular,
  },
  txtcol: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // flex: 1,
  },
  amount: {
    color: Constants.violet,
    fontSize: 18,
    fontFamily: FONTS.Bold,
    alignSelf: 'flex-end',
  },
  food: {
    color: Constants.normal_green,
    fontSize: 18,
    fontFamily: FONTS.SemiBold,
  },
});
