import {
  Dimensions,
  FlatList,
  Image,
  Linking,
  Modal,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import Constants, { Currency, FONTS } from '../../../Assets/Helpers/constant';
import { BackIcon, CrossIcon, InvoiceIcon, OrderIcon, RightArrow } from '../../../../Theme';
import { goBack, navigate } from '../../../../navigationRef';
import { useIsFocused } from '@react-navigation/native';
import { GetApi, Post } from '../../../Assets/Helpers/Service';
import { FoodUserContext, GroceryUserContext, LoadContext, ToastContext, UserContext } from '../../../../App';
import moment from 'moment';
import StarRating, { StarRatingDisplay } from 'react-native-star-rating-widget';
import { useTranslation } from 'react-i18next';
import RNBlobUtil from 'react-native-blob-util';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GroceryOrders = () => {
  const { t } = useTranslation();
  const [orderlist, setorderlist] = useState();
  const [toast, setToast] = useContext(ToastContext);
  const [loading, setLoading] = useContext(LoadContext);
  const [user, setuser] = useContext(UserContext);
  const [groceryuserProfile, setgroceryuserProfile] = useContext(GroceryUserContext);
  const [page, setPage] = useState(1);
  const [alredyfavorite, setalredyfavorite] = useState(false);
  const [curentData, setCurrentData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [review, setreview] = useState('');
  const [rating, setrating] = useState('');
  const [selfoodid, setselfoodid] = useState('');
  const [alreadyrated, setalreadyrated] = useState(false);
  const IsFocused = useIsFocused();
  const dumydata = [1, 2, 3];
  useEffect(() => {
    if (IsFocused) {
      getorders(1);
    }
  }, [IsFocused]);

  const getorders = (p, text, favorite) => {
    setPage(p);
    let url = `getgroceryorderforuser?page=${p}`;

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

  const addreview = () => {
    let url = `groceryaddreview`;
    const data = {
      groceryid: selfoodid,
      rating: rating,
      comment: review,
      userProfile: groceryuserProfile._id,
    };
    console.log('data', data)
    setLoading(true);
    Post(url, data).then(
      async res => {
        setLoading(false);
        console.log(res);
        setModalVisible(false);
        getorders(page)
      },
      err => {
        setLoading(false);
        console.log(err);
      },
    );
  };
  const getinvoice = async (id) => {
    setLoading(true);
  const x = await AsyncStorage.getItem('LANG');
    const { DownloadDir, DocumentDir } = RNBlobUtil.fs.dirs;
      const filePath = `${
        Platform.OS === 'android' ? DownloadDir : DocumentDir
      }/invoice-${Date.now()}.pdf`;
    
      try {
        const res = await RNBlobUtil.config({
          fileCache: true,
          path: filePath,
          addAndroidDownloads: {
            useDownloadManager: true,
            notification: true,
            path: filePath,
            title: 'Invoice',
            description: 'Downloading invoice...',
            mime: 'application/pdf',
            mediaScannable: true,
          },
      }).fetch('GET', `https://api.chmp.world/v1/api/generateInvoice?orderId=${id}&orderType=grocery&lang=${x}`);
  
      setLoading(false);
      setToast("Invoice downloaded successfully")
      console.log('Invoice downloaded:', res.path());
      
    } catch (error) {
      setLoading(false);
      console.error('Error downloading invoice:', error);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.rowbtn}>
        <TouchableOpacity style={styles.backcov} onPress={() => goBack()}>
        <BackIcon  />
          </TouchableOpacity>
        <Text style={styles.headtxt}>{t("My Orders")}</Text>
        <View></View>
      </View>
      <View style={{ paddingHorizontal: 20, flex: 1 }}>
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
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
            onPress={()=>navigate('TrackGrocery',item?._id)}
            >
              <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                <View style={{ flexDirection: 'row', flex: 1 }}>
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
                {/* <View> */}
                {/* {item?.is_favorite == 0 ? (
                      <TouchableOpacity onPress={() => setfavorite(item?.id)}>
                        <Image
                          source={require('../../Assets/Images/love.png')}
                          style={{height: 20, width: 20, alignSelf: 'center'}}
                        />
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity onPress={() => setfavorite(item?.id)}>
                        <Image
                          source={require('../../Assets/Images/favorite.png')}
                          style={{height: 20, width: 20, alignSelf: 'center'}}
                        />
                      </TouchableOpacity>
                    )} */}
                <Text style={styles.delevered} >{item?.status}</Text>
                {/* </View> */}
              </View>
              <View style={[styles.covline, { marginTop: 10 }]}>
                <Text style={styles.ordtxt}>
                  {t("Order ID")}
                </Text>
                <Text style={styles.ordno}>{item.order_id}</Text>
              </View>
            {item?.selfpickup&&item?.status!=='Delivered'&&  <View style={{flexDirection: 'row',alignSelf:'flex-end'}}>
                              <Text style={styles.carname}>{t("Pin")} : </Text>
                              <Text style={styles.pincov}>{item?.pickupOTP} </Text>
                            </View>}
              {/* <View style={styles.horline}></View> */}
              {item?.productDetail && item?.productDetail?.length > 0 && item?.productDetail.map((prod, index) => (
                <View style={{ flexDirection: 'row', marginVertical: 10 }} key={index}>
                  <Image
                    source={{ uri: prod?.image }}
                    style={{ height: 60, width: 60, borderRadius: 20 }}
                  />
                  <View style={{ marginLeft: 10, flex: 1 }}>
                    <View style={styles.covline}>
                      <Text style={styles.ordtxt1} numberOfLines={2}>{prod?.grocery_name}</Text>
                      {item?.status === 'Delivered' && <Text style={styles.revtxt} onPress={() => {
                        setModalVisible(true); setselfoodid(prod?.grocery_id?._id);
                        if (prod?.grocery_id?.reviews?.some(r => String(r.userId) === String(user._id))) {
                          setrating(prod?.grocery_id?.reviews.find(r => String(r.userId) === String(user._id))?.rating);
                          setreview(prod?.grocery_id?.reviews.find(r => String(r.userId) === String(user._id))?.comment);
                          setalreadyrated(true);
                        } else {
                          setalreadyrated(false); setrating(''); setreview('');
                        }
                      }}>{prod?.grocery_id?.reviews?.some(r => String(r.userId) === String(user._id)) ? t('Show review') : t('Add review')}</Text>}
                    </View>
                    <View style={styles.covline}>
                      <Text style={styles.ordtxt2}>{Currency} {item.total}</Text>
                      <Text style={styles.ordtxt3}>{item?.productDetail?.length} {t("items")}</Text>
                    </View>
                  </View>
                </View>
              ))}
              <View
                style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.track} onPress={()=>navigate('TrackGrocery',item?._id)}>{t("Track")}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.txt3}>
                    {t("Total")}
                  </Text>
                  <Text style={styles.txt3}>
                    {''} {Currency} {item?.final_amount}
                  </Text>
                </View>
              </View>
              {item?.status==='Delivered'&&<TouchableOpacity style={styles.invcov} onPress={()=>getinvoice(item?._id)}>
                <View style={{flexDirection: 'row', gap: 15}}>
                  <InvoiceIcon
                    height={23}
                    width={23}
                    color={Constants.customblue}
                  />
                  <Text style={styles.invtxt}>{t("Download Invoice")}</Text>
                </View>
                <RightArrow
                  color={Constants.black}
                  height={15}
                  width={15}
                  style={styles.aliself}
                />
              </TouchableOpacity>}
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
      <Modal
        animationType="none"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.centeredView}>
          <View style={[styles.modalView]}>
            <View
              style={{
                backgroundColor: Constants.white,
                alignItems: 'center',
                width: '100%'
              }}>
              <CrossIcon
                style={{
                  alignSelf: 'flex-end',
                  position: 'absolute',
                  top: -12,
                  right: -10,
                }}
                height={18}
                width={18}
                onPress={() => {
                  setModalVisible(!modalVisible);
                  // setuploadimg([]);
                }}
                color={Constants.black}
              />
              <Text style={[styles.textStyle, { color: Constants.black }]}>
                {t("Add Rating & Review")}
              </Text>
              <View style={{ marginVertical: 10 }}>
                {!alreadyrated?<StarRating
                  rating={rating || '0'}
                  enableHalfStar={false}
                  color={Constants.normal_green}
                  onChange={() => { }}
                  onRatingEnd={e => setrating(e)}
                />:
                <StarRatingDisplay
                  rating={rating || '0'}
                  color={Constants.normal_green}
                />}
              </View>
              <View
                style={styles.inpucov}>
                <TextInput
                  style={styles.inputfield}
                  placeholder={t('Review (Optional)')}
                  placeholderTextColor={Constants.customgrey2}
                  numberOfLines={5}
                  multiline={true}
                  value={review}
                  onChangeText={(e) =>
                    setreview(e)
                  }></TextInput>
              </View>
              {!alreadyrated && <View style={styles.cancelAndLogoutButtonWrapStyle}>
                <TouchableOpacity
                  style={styles.logOutButtonStyle}
                  onPress={() => addreview()}>
                  <Text style={styles.modalText}>{t("Submit")}</Text>
                </TouchableOpacity>
              </View>}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default GroceryOrders;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.white,
    // padding: 20,
  },
  inputfield: {
    color: Constants.black,
    fontSize: 14,
    fontFamily: FONTS.Medium,
    flex: 1,
    textAlignVertical: 'top'
  },
   backcov: {
    height: 30,
    width: 30,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Constants.customgrey4,
  },
  inpucov: {
    backgroundColor: Constants.customgrey4,
    marginVertical: 10,
    borderRadius: 15,
    height: 50,
    paddingHorizontal: 10,
    flexDirection: 'row',
    height: 80
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
  track: {
    fontSize: 14,
    color: Constants.white,
    backgroundColor: Constants.normal_green,
    fontFamily: FONTS.Regular,
    paddingHorizontal: 30,
    paddingTop: 5,
    paddingVertical: 3,
    borderRadius:5,
    alignSelf: 'center'
  },
  revtxt: {
    fontSize: 13,
    color: Constants.normal_green,
    // backgroundColor: Constants.normal_green,
    fontFamily: FONTS.SemiBold,
    // paddingHorizontal: 10,
    // paddingTop: 5,
    // paddingVertical: 3,
    // borderRadius: 5,
    // alignSelf: 'center'
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
    marginBottom:10
  },
  horline: {
    height: 1,
    backgroundColor: Constants.customgrey2,
    marginVertical: 10,
  },
  ////model//
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // marginTop: 22,
    backgroundColor: '#rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    position: 'relative',
    width: '85%'
  },

  textStyle: {
    color: Constants.black,
    // fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: FONTS.SemiBold,
    fontSize: 16,
    marginVertical: 10
  },
  modalText: {
    color: Constants.white,
    // fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: FONTS.Bold,
    fontSize: 14,
  },
  cancelAndLogoutButtonWrapStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 5,
  },
  logOutButtonStyle: {
    flex: 0.5,
    backgroundColor: Constants.normal_green,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 15,
  },
  carname: {
    color: Constants.black,
    fontFamily: Constants.font300,
    fontSize: 14,
  },
  pincov: {
    backgroundColor: Constants.normal_green,
    color: Constants.white,
    fontFamily: Constants.SemiBold,
    fontSize: 12,
    paddingHorizontal: 12,
    borderRadius:3,
    paddingVertical: 3,
    textAlign: 'center',
    alignSelf: 'center',
  },
  invcov: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // boxShadow: '0px 2px 5px 0.03px grey',
    padding: 5,
    borderRadius: 6,
    marginTop: 10,
  },
  invtxt: {
    color: Constants.black,
    fontFamily: FONTS.Medium,
    fontSize: 14,
  },
});
