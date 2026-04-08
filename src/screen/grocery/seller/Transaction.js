import {
  Dimensions,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useContext, useEffect, useState} from 'react';
import Constants, {Currency, FONTS} from '../../../Assets/Helpers/constant';
import {BackIcon, DownleftIcon, GlassIcon, ToprightIcon, WalletIcon} from '../../../../Theme';
import {goBack} from '../../../../navigationRef';
import { GrocerySellerContext, LoadContext} from '../../../../App';
import {GetApi} from '../../../Assets/Helpers/Service';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

const GroceryTransaction = () => {
  const { t } = useTranslation();
  const [grocerysellerProfile, setgrocerysellerProfile] =
      useContext(GrocerySellerContext)
  const [transactionlist, settransactionlist] = useState();
  const [loading, setLoading] = useContext(LoadContext);
  useEffect(() => {
    getProfile()
    getTransaction();
  }, []);
  const getTransaction = () => {
    setLoading(true);
    GetApi(`getTransaction/${grocerysellerProfile?._id}`).then(
      async res => {
        setLoading(false);
        console.log(res.data);
        settransactionlist(res?.data);
      },
      err => {
        setLoading(false);
        console.log(err);
      },
    );
  };
   const getProfile = () => {
      setLoading(true);
      GetApi(`getProfile/GROCERYSELLER`, {}).then(
        async res => {
          setLoading(false);
          setgrocerysellerProfile(res.data);
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
      <View style={styles.frowbtn}>
        <TouchableOpacity style={styles.backcov} onPress={() => goBack()}>
          <BackIcon color={Constants.black}/>
        </TouchableOpacity>
        <Text style={styles.headtxt1}>{t("Transaction History")}</Text>
        <View></View>
      </View>
      <View style={styles.amtline}>
        <Text style={styles.amttxt}>{t("Available balance")}</Text>
        <Text style={styles.amttxt2}>{Currency}{grocerysellerProfile?.wallet}</Text>
      </View>
      <FlatList
        data={transactionlist}
        style={{marginTop:20}}
        showsVerticalScrollIndicator={false}
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
              {t("No Transaction Available")}
            </Text>
          </View>
        )}
        renderItem={({item}) => (
          <View style={styles.card}>
            <View style={{flexDirection:'row',gap:10}}>
              <View style={styles.glascov}>
                {item?.type==='WITHDRAWAL'&&item?.status==='Pending'?<GlassIcon height={25} width={25} color={Constants.black}/>:<WalletIcon height={25} width={25} color={Constants.black}/>}
              </View>
              <View>
                <Text style={styles.crdtxt1}>{item?.type==='WITHDRAWAL'?t('Withdrawal Amount'):t('Cash collected')}</Text>
                {item?.type==='WITHDRAWAL'&&item?.status==='Pending'&&<Text style={styles.crdtxt2}>{t("Payment processing")}</Text>}
                <Text style={styles.crdtxt3}>{moment(item?.createdAt).format('DD-MM-YYYY hh:mm A')}</Text>
              </View>
            </View>
            <View style={{flexDirection:'row',gap:5,marginTop:10}}>
              <Text style={styles.crdtxt1}>{Currency}{item?.amount}</Text>
             {item?.type==='WITHDRAWAL'? <ToprightIcon color={Constants.red} height={30} width={30} />:<DownleftIcon color={Constants.normal_green} height={30} width={30} />}
            </View>
          </View>
        )}
      />
      </View>
    </SafeAreaView>
  );
};

export default GroceryTransaction;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.white,
    padding: 20,
  },
  backcov: {
    height: 30,
    width: 30,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Constants.white,
  },
  frowbtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // paddingHorizontal: 20,
  },
  headtxt1: {
    fontSize: 16,
    color: Constants.black,
    fontFamily: FONTS.Medium,
    marginLeft: -20,
  },
  amtline: {
    flexDirection: 'row',
    // backgroundColor: Constants.customgrey5,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 5,
    marginTop: 20,
    justifyContent: 'space-between',
    boxShadow: '0px 1px 2px 0.05px grey',
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
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // alignItems:'center',
    marginTop:15,
    borderBottomWidth:1,
    borderColor:Constants.customgrey4,
    paddingBottom:10
  },
  glascov:{
    backgroundColor:Constants.customgrey4,
    height:40,
    width:40,
    borderRadius:20,
    justifyContent:'center',
    alignItems:'center',
    alignSelf:'center'
  },
  crdtxt1: {
    fontSize: 14,
    color: Constants.black,
    fontFamily: FONTS.Medium,
  },
  crdtxt2: {
    fontSize: 13,
    color: '#e07d36',
    fontFamily: FONTS.Regular,
  },
  crdtxt3: {
    fontSize: 12,
    color: Constants.customgrey2,
    fontFamily: FONTS.Medium,
  },
});
