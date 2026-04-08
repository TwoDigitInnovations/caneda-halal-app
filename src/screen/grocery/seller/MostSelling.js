import {
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useContext, useEffect, useState} from 'react';
import Constants, {Currency, FONTS} from '../../../Assets/Helpers/constant';
import {BackIcon} from '../../../../Theme';
import {goBack} from '../../../../navigationRef';
import {LoadContext, ToastContext} from '../../../../App';
import {GetApi} from '../../../Assets/Helpers/Service';
import { useTranslation } from 'react-i18next';

const MostSellingGrocery = () => {
  const { t } = useTranslation();
  const [toast, setToast] = useContext(ToastContext);
  const [loading, setLoading] = useContext(LoadContext);
  const [productlist, setproductlist] = useState([]);
  //   const [page, setPage] = useState(1);
  //   const [curentData, setCurrentData] = useState([]);

  useEffect(() => {
    getproduct();
  }, []);

  const getproduct = () => {
    setLoading(true);
    GetApi(`sellermostsellinggroceryitems?limit=20`, {}).then(
      async res => {
        setLoading(false);
        console.log(res);
        if (res.status) {
          setproductlist(res.data);
        }
      },
      err => {
        setLoading(false);
        console.log(err);
      },
    );
  };
  //   const fetchNextPage = () => {
  //     if (curentData.length === 20) {
  //       getproduct(page + 1);
  //     }
  //   };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.rowbtn}>
        <BackIcon height={30} width={30} color={Constants.black} onPress={() => goBack()} />
        <Text style={styles.headtxt}>{t("Most Selling")}</Text>
        <View></View>
      </View>
      <FlatList
        data={productlist}
        style={{paddingRight:20,marginLeft:5,paddingTop:10}}
        numColumns={2}
        renderItem={({item}) => (
          <View style={styles.prodbox}>
            <Image
              source={{uri: item?.image}}
              style={{height: 126, width: '100%', borderRadius: 10}}
              resizeMode='stretch'
            />
            <Text style={styles.proname}>{item?.name}</Text>
            <View
              style={{
                marginBottom: 10,
                alignItems: 'center',
                flexDirection: 'row',
                width: '100%',
                gap: 10,
              }}>
              <Text style={styles.pricetxt}>
                {Currency} {item?.price_slot[0]?.other_price}
              </Text>
              <Text style={styles.pricetxt2}>
                {Currency} {item?.price_slot[0]?.our_price}
              </Text>
            </View>
          </View>
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
                        {!productlist ? t('Loading...') : t('No item avilable')}
                      </Text>
                    </View>
                  )}
        // onEndReached={() => {
        //   if (productlist && productlist.length > 0) {
        //     fetchNextPage();
        //   }
        // }}
        // onEndReachedThreshold={0.05}
      />
    </SafeAreaView>
  );
};

export default MostSellingGrocery;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.white,
    paddingVertical: 10,
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
  },
    pricetxt: {
    fontSize: 14,
    color: Constants.black,
    fontFamily: FONTS.Medium,
    textDecorationLine:'line-through'
  },
  pricetxt2: {
    fontSize: 14,
    color: Constants.dark_green,
    fontFamily: FONTS.SemiBold,
  },
  proname: {
    fontSize: 16,
    color: Constants.dark_green,
    fontFamily: FONTS.SemiBold,
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  prodbox: {
    marginHorizontal: 10,
    width: '47%',
    // flex: 1,
    // backgroundColor: Constants.red,
    padding: 10,
    borderRadius: 14,
    alignItems: 'center',
     boxShadow: '0px 1px 3px 0.2px #A4A4A4',
  },
});
