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
import {goBack, navigate} from '../../../../navigationRef';
import {LoadContext, ToastContext} from '../../../../App';
import {GetApi} from '../../../Assets/Helpers/Service';
import { useTranslation } from 'react-i18next';
import TranslateHandled from '../../../Assets/Component/TranslateHandled';

const Foods = props => {
  const catid = props?.route?.params?.id;
  const catname = props?.route?.params?.name;
  const store_id = props?.route?.params?.store_id;
  const { t } = useTranslation();
  const [toast, setToast] = useContext(ToastContext);
  const [loading, setLoading] = useContext(LoadContext);
  const [productlist, setproductlist] = useState([]);
  const [page, setPage] = useState(1);
  const [curentData, setCurrentData] = useState([]);

  useEffect(() => {
    {
      catid && getproduct(1);
    }
  }, []);

  const getproduct = p => {
    setPage(p);
    setLoading(true);
    let url=`getFoodbycategory/${catid}?page=${p}`
    if (store_id) {
      url=`getFoodbycategory/${catid}?page=${p}&store_id=${store_id}`
    }
    GetApi(url).then(
      async res => {
        setLoading(false);
        console.log(res);
        if (res.status) {
          setCurrentData(res.data);
          if (p === 1) {
            setproductlist(res.data);
          } else {
            setproductlist([...productlist, ...res.data]);
          }
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
      getproduct(page + 1);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.rowbtn}>
        <BackIcon height={30} width={30} color={Constants.black} onPress={() => goBack()} />
        <Text style={styles.headtxt}><TranslateHandled text={catname} /></Text>
        <View></View>
      </View>
      <FlatList
        data={productlist}
        style={{marginTop: 15, marginRight: 15}}
        numColumns={2}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.prodbox}
            onPress={() => navigate('PreView', item?._id)}>
            <Image
              source={{uri: item?.image[0]}}
              style={{height: 106, width: '100%', borderRadius: 10}}
            />
            <Text style={styles.proname}>{item?.name}</Text>
            <Text style={styles.pricetxt}>{Currency} {item?.price}</Text>
          </TouchableOpacity>
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
                        {!productlist ? t('Loading...') : t('No product avilable')}
                      </Text>
                    </View>
                  )}
        onEndReached={() => {
          if (productlist && productlist.length > 0) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.05}
      />
    </SafeAreaView>
  );
};

export default Foods;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.white,
    padding: 10,
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
    color: Constants.dark_green,
    fontFamily: FONTS.SemiBold,
    alignSelf: 'flex-start',
  },
  proname: {
    fontSize: 14,
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
    borderRadius: 15,
    alignItems: 'center',
    boxShadow: '0 0 6 0.5 grey',
  },
});
