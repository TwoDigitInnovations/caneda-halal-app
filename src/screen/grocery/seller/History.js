import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useContext, useEffect, useState} from 'react';
import Constants, {Currency, FONTS} from '../../../Assets/Helpers/constant';
import {BackIcon, CrossIcon, OrderIcon} from '../../../../Theme';
import {goBack, navigate} from '../../../../navigationRef';
import {useIsFocused} from '@react-navigation/native';
import {GetApi, Post} from '../../../Assets/Helpers/Service';
import {LoadContext, ToastContext, UserContext} from '../../../../App';
import moment from 'moment';
import StarRating, {StarRatingDisplay} from 'react-native-star-rating-widget';
import { useTranslation } from 'react-i18next';

const GrocerySellerOrder = () => {
  const { t } = useTranslation();
  const [orderlist, setorderlist] = useState();
  const [toast, setToast] = useContext(ToastContext);
  const [loading, setLoading] = useContext(LoadContext);
  const [user, setuser] = useContext(UserContext);
  const [page, setPage] = useState(1);
  const [curentData, setCurrentData] = useState([]);
  const IsFocused = useIsFocused();

  useEffect(() => {
    if (IsFocused) {
      getorders(1);
    }
  }, [IsFocused]);

  const getorders = p => {
    setPage(p);
    let url = `groceryorderhistoryforseller?page=${p}`;

    setLoading(true);
    GetApi(url, {}).then(
      async res => {
        setLoading(false);
        console.log(res);
        // setorderlist(res.data);
        setCurrentData(res.data);
        if (p === 1) {
          setorderlist(res.data);
        } else {
          setorderlist([...orderlist, ...res.data]);
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
      getorders(page + 1);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.rowbtn}>
        <TouchableOpacity style={styles.backcov} onPress={() => goBack()}>
          <BackIcon color={Constants.black}/>
        </TouchableOpacity>
        <Text style={styles.headtxt}>{t("My Orders")}</Text>
        <View></View>
      </View>
      <View style={{paddingHorizontal: 20, flex: 1}}>
        <FlatList
          data={orderlist}
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
                {!orderlist ? t('Loading...') : t('No order Place Yet')}
              </Text>
            </View>
          )}
          showsVerticalScrollIndicator={false}
          renderItem={({item}) => (
            <TouchableOpacity style={styles.card}>
              <View style={{flexDirection: 'row', marginBottom: 10}}>
                <View style={{flexDirection: 'row', flex: 1}}>
                  <View style={styles.ordiccov}>
                    <OrderIcon color={Constants.white} />
                  </View>
                  <View
                    style={{
                      marginLeft: 10,
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <Text style={styles.txt1}>{t("Date")}</Text>
                    <Text style={styles.txt1}>
                      :- {moment(item?.createdAt).format('DD MMM, hh:mm A')}
                    </Text>
                  </View>
                </View>
                <Text style={styles.delevered} >{item?.status}</Text>
              </View>
              <View style={[styles.covline, {marginTop: 10}]}>
                <Text style={styles.ordtxt}>{t("Order ID")}</Text>
                <Text style={styles.ordno}>{item.order_id}</Text>
              </View>
              {/* <View style={styles.horline}></View> */}
              {item?.productDetail &&
                item?.productDetail?.length > 0 &&
                item?.productDetail.map((prod, index) => (
                  <View
                    style={{flexDirection: 'row', marginVertical: 10}}
                    key={index}>
                    <Image
                      source={{uri: prod?.image}}
                      style={{height: 60, width: 60, borderRadius: 20}}
                    />
                    <View style={{marginLeft: 10, flex: 1}}>
                      <View style={styles.covline}>
                        <Text style={styles.ordtxt1} numberOfLines={2}>
                          {prod?.grocery_name}
                        </Text>
                      </View>
                      <View style={styles.covline}>
                        <Text style={styles.ordtxt2}>{Currency} {item.total}</Text>
                        <Text style={styles.ordtxt3}>
                          {item?.productDetail?.length} {t("items")}
                        </Text>
                      </View>
                      {/* {prod?.rating && prod?.rating > 0 && (
                        <StarRatingDisplay
                          rating={String(prod?.rating)}
                          starSize={12}
                          color={Constants.normal_green}
                        />
                      )} */}
                    </View>
                  </View>
                ))}

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  alignSelf: 'flex-end',
                }}>
                <Text style={styles.txt3}>{t("Total")}</Text>
                <Text style={styles.txt3}>
                  {''} {Currency} {item?.total}
                </Text>
              </View>
            </TouchableOpacity>
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

export default GrocerySellerOrder;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.white,
    // padding: 20,
  },
  backcov: {
    height: 30,
    width: 30,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Constants.customgrey4,
  },
  ordiccov: {
    height: 40,
    width: 40,
    backgroundColor: Constants.normal_green,
    borderRadius: 30,
    padding: 7,
    alignSelf: 'center',
  },
  txt1: {
    color: Constants.black,
    fontSize: 14,
    fontFamily: FONTS.Medium,
    // flex: 1,
    marginVertical: 5,
  },
  txt3: {
    color: Constants.black,
    fontSize: 16,
    fontFamily: FONTS.Medium,
    // alignSelf: 'center',
  },
  card: {
    // flexDirection: 'row',
    justifyContent: 'space-between',
    // flex:1,
    // height:75,
    borderBottomWidth: 2,
    borderColor: Constants.customgrey,
    paddingBottom: 10,
    width: '100%',
    marginVertical: 10,
  },
  ordtxt: {
    fontSize: 14,
    color: Constants.customgrey2,
    fontFamily: FONTS.Medium,
  },
  ordno: {
    fontSize: 14,
    color: Constants.black,
    fontFamily: FONTS.SemiBold,
  },
    delevered: {
    fontSize: 14,
    color: Constants.white,
    backgroundColor: Constants.normal_green,
    fontFamily: FONTS.Regular,
    paddingHorizontal: 10,
    paddingTop: 5,
    paddingVertical: 3,
    borderRadius: 20,
    alignSelf: 'center'
  },
  covline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ordtxt1: {
    fontSize: 14,
    color: Constants.black,
    fontFamily: FONTS.SemiBold,
    width: '70%',
  },
  ordtxt2: {
    fontSize: 14,
    color: Constants.normal_green,
    fontFamily: FONTS.SemiBold,
  },
  ordtxt3: {
    fontSize: 12,
    color: Constants.black,
    fontFamily: FONTS.Medium,
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
  
});
