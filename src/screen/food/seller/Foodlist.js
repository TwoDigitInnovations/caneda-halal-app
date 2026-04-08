import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useContext, useEffect, useRef, useState} from 'react';
import Constants, {Currency, FONTS} from '../../../Assets/Helpers/constant';
import {DeleteIcon, EditIcon, StarIcon} from '../../../../Theme';
import {Delete, GetApi} from '../../../Assets/Helpers/Service';
import {LoadContext, ToastContext} from '../../../../App';
import {navigate} from '../../../../navigationRef';
import {useIsFocused} from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import TranslateHandled from '../../../Assets/Component/TranslateHandled';

const Foodlist = () => {
  const { t } = useTranslation();
  const [catlist, setcatlist] = useState([]);
  const [currentcategory, setcurrentcategory] = useState('all');
  const [page, setPage] = useState(1);
  const [curentData, setCurrentData] = useState([]);
  const [productlist, setproductlist] = useState();
  const [foodid, setfoodid] = useState();
  const [modelvsible, setmodelvsible] = useState(false);
  const [toast, setToast] = useContext(ToastContext);
  const [loading, setLoading] = useContext(LoadContext);
  useEffect(() => {
    getcategory();
  }, []);
  const IsFocused = useIsFocused();
  useEffect(() => {
    if (IsFocused) {
      getProduct(1);
    }
  }, [IsFocused]);
  const getcategory = () => {
    setLoading(true);
    GetApi(`getFoodCategory`).then(
      async res => {
        setLoading(false);
        console.log(res);
        setcatlist(res.data);
      },
      err => {
        setLoading(false);
        console.log(err);
      },
    );
  };
  const getProduct = (p, params) => {
    console.log('p', p);
    console.log('params', params);
    let url;
    if (params) {
      url = `getFoodforseller?page=${p}&category=${params}`;
    } else {
      url = `getFoodforseller?page=${p}`;
    }
    setPage(p);
    setLoading(true);
    GetApi(url, {}).then(
      async res => {
        setLoading(false);
        console.log(res);
        setCurrentData(res.data);
        if (p === 1) {
          setproductlist(res.data);
        } else {
          setproductlist([...productlist, ...res.data]);
        }

        // setRefreshing(false)
      },
      err => {
        setLoading(false);
        console.log(err);
      },
    );
  };
  const deleteFood = id => {
    setLoading(true);
    Delete(`deleteFood/${id}`).then(
      async res => {
        setLoading(false);
        // console.log(res);
        getProduct(1);
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
      <Text style={styles.headtxt}>{t("My Food List")}</Text>
      <View>
        <FlatList
          data={[{_id: 'all', name: 'All'}, ...catlist]}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.optv}
              onPress={() => {
                setcurrentcategory(item._id),
                  getProduct(1, item._id === 'all' ? null : item._id);
              }}>
              <Text style={styles.opt}><TranslateHandled text={item?.name} /></Text>
              {currentcategory === item._id && (
                <View style={styles.line}></View>
              )}
            </TouchableOpacity>
          )}
        />
      </View>
      <FlatList
        data={productlist}
        renderItem={({item}) => (
          <View style={{flexDirection: 'row', marginTop: 20}}>
            <View>
              <Image
                source={{uri: item?.image[0]}}
                style={{height: 100, width: 100, borderRadius: 20}}
              />
            </View>
            <View style={{marginLeft: 15}}>
              <Text style={styles.shtprodtxt2}>{item?.name}</Text>
              <View style={styles.frow}>
                <View style={styles.btn1}>
                  <Text style={styles.btntxt1}>{item?.categoryName}</Text>
                </View>
                <Text style={styles.shtprodtxt4}>{Currency}{item?.price}</Text>
              </View>
              <View style={styles.rowbtn}>
                <View style={styles.ratecov}>
                  <StarIcon height={15} width={15} />
                  <Text style={styles.rattxt}>
                    {item?.reviews?.length > 0
                      ? item?.reviews.reduce((sum, r) => sum + r.rating, 0) /
                        item?.reviews.length.toFixed(1)
                      : 0}
                  </Text>
                  <Text style={styles.totrev}>
                    ({item?.reviews?.length} {t("Review")})
                  </Text>
                </View>
                <View style={{flexDirection: 'row', gap: 15}}>
                  <EditIcon
                    height={18}
                    width={18}
                    onPress={() => navigate('CreateFood', {food_id: item?._id})}
                  />
                  <DeleteIcon
                    color={Constants.red}
                    height={18}
                    width={18}
                    onPress={() => {
                      setmodelvsible(true), setfoodid(item?._id);
                    }}
                  />
                </View>
              </View>
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
                        {!productlist ? t('Loading...') : t('No product avilable')}
                      </Text>
                    </View>
                  )}
      />
      <Modal
        animationType="none"
        transparent={true}
        visible={modelvsible}
        onRequestClose={() => {
          setmodelvsible(!modelvsible);
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
                {t("Are you sure you want to delete this food !")}
              </Text>
              <View style={styles.cancelAndLogoutButtonWrapStyle}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => {
                    setmodelvsible(false);
                  }}
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
                    deleteFood(foodid), setmodelvsible(false);
                  }}>
                  <Text style={styles.modalText}>{t("Yes")}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
      </View>
    </SafeAreaView>
  );
};

export default Foodlist;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.white,
    padding: 20,
  },
  headtxt: {
    fontSize: 16,
    color: Constants.black,
    fontFamily: FONTS.Medium,
    textAlign: 'center',
  },
  // tabRow: {
  //   flexDirection: 'row',
  //   justifyContent: 'space-around',
  //   position: 'relative',
  // },
  tabItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  tabText: {
    fontSize: 14,
    color: Constants.black,
    fontFamily: FONTS.Regular,
  },
  selectedTabText: {
    fontSize: 14,
    color: Constants.normal_green,
    fontFamily: FONTS.Medium,
  },
  indicator: {
    height: 3,
    width: 70,
    backgroundColor: Constants.normal_green,
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  horline: {
    height: 1,
    backgroundColor: Constants.customgrey4,
  },
  frow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginVertical: 10,
  },
  shtprodtxt2: {
    fontSize: 14,
    color: Constants.black,
    fontFamily: FONTS.Medium,
  },
  shtprodtxt4: {
    fontSize: 16,
    color: Constants.black,
    fontFamily: FONTS.Regular,
  },
  btn1: {
    backgroundColor: '#2C614033',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  btntxt1: {
    fontSize: 12,
    color: Constants.normal_green,
    fontFamily: FONTS.Regular,
  },
  totrev: {
    fontSize: 12,
    color: Constants.customgrey2,
    fontFamily: FONTS.Regular,
    marginLeft: 7,
  },
  ratecov: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  opt: {
    // backgroundColor: Constants.lightblue,
    color: Constants.black,
    fontFamily: FONTS.Regular,
    fontSize: 14,
    textAlign: 'center',
  },
  optv: {
    marginHorizontal: 10,
    marginTop: 10,
    marginBottom: 10,
    minWidth: 50,
    // alignItems:'center'
  },
  line: {
    height: 3,
    backgroundColor: Constants.normal_green,
    marginVertical: 4,
    borderRadius: 5,
  },
  rowbtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },
  //////Model////////

  textStyle: {
    color: Constants.black,
    // fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: FONTS.Regular,
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
    color: Constants.red,
    fontSize: 18,
    fontFamily: FONTS.Medium,
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
    backgroundColor: Constants.red,
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
});
