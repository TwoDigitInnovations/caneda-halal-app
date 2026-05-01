import {
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
import React, {
  createRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Cross2Icon,
  Cross3Icon,
  CrossIcon,
  DownarrowIcon,
  InfoIcon,
  StarIcon,
} from '../../../../Theme';
import Constants, {Currency, FONTS} from '../../../Assets/Helpers/constant';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import {useIsFocused} from '@react-navigation/native';
import {GetApi, Post} from '../../../Assets/Helpers/Service';
import { ShoppingSellerContext, LoadContext, ToastContext} from '../../../../App';
import {navigate} from '../../../../navigationRef';
import {Dropdown} from 'react-native-element-dropdown';
import {LineChart} from 'react-native-gifted-charts';
import { useTranslation } from 'react-i18next';

const Home = () => {
  const { t } = useTranslation();
  const [pendingorderlist, setpendingorderlist] = useState([]);
  const [runningorderlist, setrunningorderlist] = useState([]);
  const [populerlist, setpopulerlist] = useState([]);
  const [revenue, setrevenue] = useState();
  const [graphdata, setgraphdata] = useState([]);
  const [curentData, setCurrentData] = useState([]);
  const [curentData2, setCurrentData2] = useState([]);
  const [page, setPage] = useState(1);
  const [page2, setPage2] = useState(1);
  const [acceptmodel, setacceptmodel] = useState(false);
  const [avgrating, setavgrating] = useState();
  const [totalreview, settotalreview] = useState();
  const [orderid, setorderid] = useState();
  const [selectordertype, setselectordertype] = useState();
  const [orderstatus, setorderstatus] = useState();
  const [orderstatus2, setorderstatus2] = useState();
  const [selind, setselind] = useState(null);
  const [toast, setToast] = useContext(ToastContext);
  const [loading, setLoading] = useContext(LoadContext);
  const [shoppingsellerProfile, setshoppingsellerProfile] =
    useContext(ShoppingSellerContext);
  const bottomSheetRef = useRef(null);
  const dropdownRef = useRef();
  const revenuetype = [
    {lable: t('Daily'), value: 'day'},
    {lable: t('Week'), value: 'week'},
    {lable: t('Month'), value: 'month'},
    {lable: t('Year'), value: 'year'},
  ];
  const [selrevenue, setSelRevenue] = useState(revenuetype[0]);
  const snapPoints = useMemo(
    () => ['40%', '50%', '60%', '65%', '70%', '75%', '80%', '90%'],
    [],
  );
  const IsFocused = useIsFocused();
  useEffect(() => {
    if (IsFocused) {
      getpendingorders(1);
      getrunningorders(1);
      sellermostsellingitems();
      getSellerRevenue('day');
    }
  }, [IsFocused]);
  useEffect(() => {
    getreviewbyseller();
  }, []);

  const getpendingorders = p => {
    setPage(p);
    let url = `getpendingshoppingorderforseller?page=${p}`;

    setLoading(true);
    GetApi(url, {}).then(
      async res => {
        setLoading(false);
        console.log(res);
        // setorderlist(res.data);
        setCurrentData(res.data);
        if (p === 1) {
          setpendingorderlist(res.data);
        } else {
          setpendingorderlist([...orderlist, ...res.data]);
        }
      },
      err => {
        setLoading(false);
        console.log(err);
      },
    );
  };
  const getrunningorders = p => {
    setPage2(p);
    let url = `getrunningshoppingorderforseller?page=${p}`;

    setLoading(true);
    GetApi(url, {}).then(
      async res => {
        setLoading(false);
        console.log(res);
        // setorderlist(res.data);
        setCurrentData2(res.data);
        if (p === 1) {
          setrunningorderlist(res.data);
        } else {
          setrunningorderlist([...orderlist, ...res.data]);
        }
      },
      err => {
        setLoading(false);
        console.log(err);
      },
    );
  };
  const getreviewbyseller = () => {
    setLoading(true);
    GetApi(`shoppinggetreviewbyseller?onlyreviewno=true`).then(
      async res => {
        setLoading(false);
        console.log(res);
        if (res?.status) {
          setavgrating(res?.data?.averageRating);
          settotalreview(res?.data?.totalReviews);
        }
      },
      err => {
        setLoading(false);
        console.log(err);
      },
    );
  };
  const sellermostsellingitems = () => {
    setLoading(true);
    GetApi(`sellermostsellingshoppingitems?limit=5`).then(
      async res => {
        setLoading(false);
        console.log('mostselling',res);
        if (res?.status) {
          setpopulerlist(res?.data);
        }
      },
      err => {
        setLoading(false);
        console.log(err);
      },
    );
  };
  const getSellerRevenue = type => {
    setLoading(true);
    GetApi(`getSellerRevenue?type=${type}&usertype=shopping_seller`).then(
      async res => {
        setLoading(false);
        console.log('week', res);
        // if (res?.status) {
        setrevenue(res?.data);
        // }
        const data = [];
        res?.data.map(item =>
          data.push({
            label: item?._id,
            value: item?.total,
            dataPointText: item?.total,
          }),
        );
        console.log('ghdata', data);
        setgraphdata(data);
      },
      err => {
        setLoading(false);
        console.log(err);
      },
    );
  };
  const changeorderstatus = (id, status) => {
    console.log(id, status);
    const body = {
      id: id,
      status: status,
    };
    setLoading(true);
    Post(`changeshoppingorderstatus`, body).then(
      async res => {
        setLoading(false);
        console.log(res);
        if (res.status) {
          getpendingorders(1);
          getrunningorders(1);
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
      getpendingorders(page + 1);
    }
  };
  const fetchNextPage2 = () => {
    if (curentData2.length === 20) {
      getrunningorders(page2 + 1);
    }
  };
  const renderBackdrop = useCallback(
    props => (
      <BottomSheetBackdrop
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        {...props}
      />
    ),
    [],
  );
console.log('selind',selind)
  return (
    <SafeAreaView style={styles.container}>
      <GestureHandlerRootView style={{flex: 1}}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{flex: 1, marginBottom: 80}}>
          <View style={{paddingHorizontal: 20}}>
            <View style={styles.toppart}>
              <View style={{width: '60%'}}>
                <Text style={styles.locopttxt}>{t("Location")}</Text>
                <View style={styles.ndline}>
                  <Text style={styles.locopttxt2} numberOfLines={1}>
                    {shoppingsellerProfile?.address}
                  </Text>
                  {/* <DownarrowIcon color={Constants.black} /> */}
                </View>
              </View>
              <TouchableOpacity onPress={() => navigate('ShoppingSellerProfile')}>
                <Image
                  source={shoppingsellerProfile?.image?{uri:shoppingsellerProfile?.image}:require('../../../Assets/Images/profile.png')}
                  style={styles.proimg}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.boxcov}>
              <TouchableOpacity
                style={styles.box}
                onPress={() => {
                  bottomSheetRef.current.snapToIndex(1),
                    setselectordertype('running');
                }}>
                <Text style={styles.num}>{runningorderlist?.length}</Text>
                <Text style={styles.boxtxt}>{t("Running Orders")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.box}
                onPress={() => {
                  bottomSheetRef.current.snapToIndex(1),
                    setselectordertype('pending');
                }}>
                <Text style={styles.num}>{pendingorderlist?.length}</Text>
                <Text style={styles.boxtxt}>{t("Order Request")}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.box2}>
              <View
                style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <View>
                  <Text style={styles.gratxt1}>{t("Total Revenue")}</Text>
                  <Text style={styles.gratxt2}>
                    {Currency}
                    {revenue && revenue?.length > 0
                      ? revenue.reduce((sum, r) => sum + r.total, 0)
                      : 0}
                  </Text>
                </View>
                {/* <View style={styles.filcov}>
                <Text style={styles.gratxt3}>Daily</Text>
                <DownarrowIcon height={12} width={12} />
                </View> */}
                <View style={styles.dropcov}>
                  <Dropdown
                    ref={dropdownRef}
                    data={revenuetype}
                    labelField="lable"
                    valueField="value"
                    value={selrevenue?.value}
                    onChange={item => {}}
                    renderItem={item => (
                      <TouchableOpacity
                        style={styles.itemContainer}
                        onPress={() => {
                          setSelRevenue(item);
                          getSellerRevenue(item?.value);
                          dropdownRef.current?.close();
                        }}>
                        <Text style={styles.itemText}>{item.lable}</Text>
                      </TouchableOpacity>
                    )}
                    style={styles.dropdown}
                    selectedTextStyle={styles.selectedText}
                  />
                </View>
                <Text
                  style={styles.gratxt4}
                  onPress={() => navigate('ShoppingTransaction')}>
                  {t("See Details")}
                </Text>
              </View>
              {graphdata && graphdata.length > 0 && (
                <View
                  style={{
                    backgroundColor: '#fff',
                    marginLeft: -10,
                    marginVertical: 10,
                  }}>
                  <LineChart
                    data={graphdata}
                    curved
                    areaChart
                    thickness={2}
                    color="#174e2f"
                    startFillColor="#174e2f"
                    endFillColor="#174e2f"
                    startOpacity={0.2}
                    endOpacity={0.01}
                    hideAxesAndRules
                    hideDataPoints={false}
                    initialSpacing={20}
                    spacing={50}
                    yAxisTextStyle={{display: 'none'}}
                    xAxisLabelTextStyle={{color: '#888', fontSize: 12}}
                    showVerticalLines={false}
                    showStripOnPress
                    dataPointsColor="#174e2f"
                  />
                </View>
              )}
            </View>
            <View style={styles.box3}>
              <View style={styles.frow}>
                <Text style={styles.gratxt1}>Reviews</Text>
                <Text
                  style={[
                    styles.gratxt4,
                    {
                      color:
                        totalreview && totalreview > 0
                          ? Constants.normal_green
                          : '#819987',
                    },
                  ]}
                  onPress={() =>
                    totalreview && totalreview > 0 && navigate('ShoppingSellerReviews')
                  }>
                  See All Reviews
                </Text>
              </View>
              {totalreview && totalreview > 0 ? (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: 10,
                  }}>
                  <StarIcon height={20} width={20} />
                  <Text style={styles.rattxt}>{avgrating}</Text>
                  <Text style={styles.gratxt1}>
                    Total {totalreview} Reviews
                  </Text>
                </View>
              ) : (
                <Text style={styles.norev}>No review available</Text>
              )}
            </View>
            <View style={styles.box4}>
              <View style={styles.frow}>
                <Text style={styles.gratxt1}>{t("Populer Items This Weeks")}</Text>
                <Text
                  style={styles.gratxt4}
                  onPress={() => navigate('MostSellingShopping')}>
                  {t("See All")}
                </Text>
              </View>
              <FlatList
                data={populerlist}
                style={{marginTop: 5, paddingVertical: 10}}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                renderItem={({item}) => (
                  <TouchableOpacity style={styles.prodbox}>
                    <Image
                      source={{uri: item?.variants[0]?.image[0]}}
                      style={{height: 156, width: '100%', borderRadius: 10}}
                      resizeMode='stretch'
                    />
                    <View
                      style={{
                        alignItems: 'flex-start',
                        width: '100%',
                      }}>
                      <Text style={styles.proname} numberOfLines={2}>
                        {item?.name}
                      </Text>
                    </View>
                    <View
                      style={{
                        // marginBottom: 10,
                        alignItems: 'center',
                        flexDirection:'row',
                        width: '100%',
                        gap:10
                      }}>
                      <Text style={styles.pricetxt2}>{Currency} {item?.variants[0]?.selected[0]?.our_price}</Text>
                      <Text style={styles.pricetxt}>{Currency} {item?.variants[0]?.selected[0]?.other_price}</Text>
                    </View>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={()=><Text style={styles.norev}>{t("No Product available")}</Text>}
              />
            </View>
          </View>
        </ScrollView>
        {!acceptmodel && (
          <BottomSheet
            ref={bottomSheetRef}
            style={{paddingHorizontal: 20}}
            snapPoints={snapPoints}
            enablePanDownToClose={true}
            backdropComponent={renderBackdrop}
            index={-1}
            backgroundStyle={{backgroundColor: Constants.white}}
            handleIndicatorStyle={{
              width: 60,
              height: 4,
              backgroundColor: '#ccc',
              borderRadius: 4,
            }}
            onChange={e => console.log(e)}>
            <BottomSheetView style={styles.contentContainer}>
              <Text style={styles.shttxt}>
                {selectordertype === 'running'
                  ? `${runningorderlist?.length} Running`
                  : `${pendingorderlist?.length} Pending`}{' '}
                {t("Orders")}
              </Text>
            </BottomSheetView>
            <BottomSheetFlatList
              data={
                selectordertype === 'pending'
                  ? pendingorderlist
                  : runningorderlist
              }
              style={{marginBottom: 70}}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={() => (
                <View
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 40,
                  }}>
                  <Text
                    style={{
                      color: Constants.black,
                      fontSize: 18,
                      fontFamily: FONTS.Medium,
                    }}>
                    {t("No order Available")}
                  </Text>
                </View>
              )}
              // keyExtractor={(i) => i}
              renderItem={({item,index}) => (
                <View
                  key={index}
                  style={[
                    item?.productDetail &&
                      item?.productDetail?.length > 1 &&
                      styles.ordbox,
                  ]}>
                  {item?.productDetail &&
                    item?.productDetail?.length > 0 &&
                    item?.productDetail.map((it, i) => (
                      <View
                        style={{flexDirection: 'row', marginTop: 20}}
                        key={i}>
                        <View>
                          <Image
                            source={{uri: it?.image}}
                            style={{height: 100, width: 100, borderRadius: 20}}
                          />
                        </View>
                        <View style={{marginLeft: 10}}>
                          {selind === index ? (
                            <View
                              style={{
                                width: '75%',
                                flexDirection: 'row',
                                marginVertical: 5,
                              }}>
                              <Text style={styles.instuctxt}>
                                {item?.instruction}
                              </Text>
                              <Cross2Icon
                                height={20}
                                width={20}
                                onPress={() => setselind(null)}
                              />
                            </View>
                          ) : (
                            <View>
                              <View
                                style={styles.frowwi}>
                                <Text style={styles.shtprodtxt1}>
                                  #{it?.shopping_id?.categoryName}
                                </Text>
                                {item?.instruction&&item?.productDetail?.length <= 1&&<InfoIcon
                                  height={17}
                                  width={17}
                                  color={Constants.red}
                                  onPress={() => setselind(index)}
                                />}
                              </View>
                              <View
                                style={styles.frowwi}>
                                <Text style={styles.shtprodtxt2}>
                                {it?.shopping_name}
                              </Text>
                              {/* <View style={styles.sizecov}> */}
                                <Text style={styles.size}>
                                {it?.selected_size?.value}
                              </Text>
                                {/* </View> */}
                              </View>
                              

                              <Text style={styles.shtprodtxt3}>
                                {item?.order_id}
                              </Text>
                            </View>
                          )}
                          <View
                            style={[
                              styles.frow,
                              {width: '80%', alignItems: 'center'},
                            ]}>
                            <Text style={styles.shtprodtxt4}>{Currency}{it?.price}</Text>
                            {item?.productDetail?.length <= 1 && (
                              <View style={{flexDirection: 'row', gap: 10}}>
                                <TouchableOpacity
                                  style={[
                                    styles.btn1,
                                    {
                                      flex: item?.status != 'Pending' && 0.7,
                                      marginLeft:
                                        item?.status != 'Pending' && 20,
                                    },
                                  ]}
                                  onPress={() => {
                                    let nextStatus = '';
                                    const {status, selfpickup, _id} = item;

                                    if (status === 'Pending') {
                                      nextStatus = 'Preparing';
                                      setacceptmodel(true);
                                      setorderstatus(nextStatus);
                                      setorderstatus2(t(nextStatus));
                                      setorderid(_id);
                                    } else if (status === 'Preparing') {
                                      nextStatus = selfpickup
                                        ? 'Ready'
                                        : 'Assign';
                                      setacceptmodel(true);
                                      setorderstatus(nextStatus);
                                      setorderstatus2(t(nextStatus));
                                      setorderid(_id);
                                    } else if (status === 'Assign') {
                                      nextStatus = selfpickup
                                        ? 'Ready'
                                        : 'Ready';
                                      setacceptmodel(true);
                                      setorderstatus(nextStatus);
                                      setorderstatus2(t(nextStatus));
                                      setorderid(_id);
                                    } else if (status === 'Ready') {
                                      if (selfpickup) {
                                        navigate('VerifyDeliveryShopping', _id);
                                      } else {
                                        nextStatus = 'Delivery';
                                        setacceptmodel(true);
                                        setorderstatus(nextStatus);
                                        setorderstatus2(t(nextStatus));
                                        setorderid(_id);
                                      }
                                    }
                                  }}>
                                  <Text style={styles.btntxt1}>
                                    {item?.status === 'Pending'
                                      ? t('Preparing')
                                      : item?.status === 'Preparing'
                                      ? item?.selfpickup
                                        ? t('Ready')
                                        : t('Assign')
                                      : item?.status === 'Assign'
                                      ? t('Ready')
                                      : item?.selfpickup
                                      ? t('Delivery')
                                      : t('Delivery')}
                                  </Text>
                                </TouchableOpacity>
                                {item?.status === 'Pending' && (
                                  <TouchableOpacity
                                    style={styles.btn2}
                                    onPress={() => {
                                      // bottomSheetRef.current?.close(),
                                      // setsheetvisibla(false),
                                      setorderid(item?._id);
                                      // setTimeout(() => {
                                      setacceptmodel(true);
                                      setorderstatus('Rejected');
                                      // }, 100);
                                    }}>
                                    <Text style={styles.btntxt2}>{t("Cancel")}</Text>
                                  </TouchableOpacity>
                                )}
                              </View>
                            )}
                          </View>
                        </View>
                      </View>
                    ))}
                  {item?.productDetail?.length > 1 && (
                    <View>
                      {item?.instruction&&<Text style={styles.instuctxt}>{item?.instruction}</Text>}
                      <View style={styles.horline}></View>
                      <View
                        style={{
                          flexDirection: 'row',
                          gap: 20,
                          justifyContent: 'space-evenly',
                        }}>
                        <TouchableOpacity
                          style={[styles.btn1, {flex: 1}]}
                          onPress={() => {
                            let nextStatus = '';
                            const {status, selfpickup, _id} = item;

                            if (status === 'Pending') {
                              nextStatus = 'Preparing';
                              setacceptmodel(true);
                              setorderstatus(nextStatus);
                              setorderstatus2(t(nextStatus));
                              setorderid(_id);
                            } else if (status === 'Preparing') {
                              nextStatus = selfpickup ? 'Ready' : 'Assign';
                              setacceptmodel(true);
                              setorderstatus(nextStatus);
                              setorderstatus2(t(nextStatus));
                              setorderid(_id);
                            } else if (status === 'Assign') {
                              nextStatus = selfpickup ? 'Ready' : 'Ready';
                              setacceptmodel(true);
                              setorderstatus(nextStatus);
                              setorderstatus2(t(nextStatus));
                              setorderid(_id);
                            } else if (status === 'Ready') {
                              if (selfpickup) {
                                navigate('VerifyDeliveryShopping', _id);
                              } else {
                                nextStatus = 'Delivery';
                                setacceptmodel(true);
                                setorderstatus(nextStatus);
                                setorderstatus2(t(nextStatus));
                                setorderid(_id);
                              }
                            }
                          }}>
                          <Text style={styles.btntxt1}>
                            {item?.status === 'Pending'
                              ? t('Preparing')
                              : item?.status === 'Preparing'
                              ? item?.selfpickup
                                ? t('Ready')
                                : t('Assign')
                              : item?.status === 'Assign'
                              ? t('Ready')
                              : item?.selfpickup
                              ? t('Delivery')
                              : t('Delivery')}
                          </Text>
                        </TouchableOpacity>
                        {item?.status === 'Pending' && (
                          <TouchableOpacity
                            style={[styles.btn2, {flex: 1}]}
                            onPress={() => {
                              setacceptmodel(true),
                                setorderstatus('Rejected'),
                                setorderid(item?._id);
                            }}>
                            <Text style={styles.btntxt2}>{t("Cancel")}</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  )}
                </View>
              )}
              onEndReached={() => {
                if (
                  pendingorderlist &&
                  pendingorderlist.length > 0 &&
                  selectordertype === 'pending'
                ) {
                  fetchNextPage();
                }
                if (
                  runningorderlist &&
                  runningorderlist.length > 0 &&
                  selectordertype === 'running'
                ) {
                  fetchNextPage2();
                }
              }}
              onEndReachedThreshold={0.05}
            />
          </BottomSheet>
        )}
      </GestureHandlerRootView>
      {acceptmodel && (
        <Modal
          animationType="none"
          transparent={true}
          // visible={acceptmodel}
          // onRequestClose={() => {
          //   setacceptmodel(!acceptmodel);
          // }}
        >
          <View style={styles.centeredView2}>
            <View style={styles.modalView2}>
              <Text style={styles.alrt}>Alert !</Text>
              <View
                style={{
                  backgroundColor: 'white',
                  alignItems: 'center',
                  paddingHorizontal: 30,
                }}>
                <Text style={styles.textStyle}>
                  {t("Are you sure you",{orderstatus:orderstatus2})}
                </Text>
                <View style={styles.cancelAndLogoutButtonWrapStyle}>
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => {
                      setacceptmodel(false);
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
                      changeorderstatus(orderid, orderstatus),
                        setacceptmodel(false);
                    }}>
                    <Text style={styles.modalText}>{t("Yes")}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8F9',
    // paddingVertical: 20,
  },
  locopttxt: {
    fontSize: 14,
    color: Constants.normal_green,
    fontFamily: FONTS.SemiBold,
  },
  locopttxt2: {
    fontSize: 14,
    color: Constants.customgrey2,
    fontFamily: FONTS.Medium,
    marginRight: 5,
  },
  proimg: {
    height: 30,
    width: 30,
    borderRadius: 50,
  },
  toppart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 15,
  },
  ndline: {
    flexDirection: 'row',
    width: '100%',
  },
  box: {
    width: '48%',
    backgroundColor: Constants.white,
    borderRadius: 15,
    justifyContent: 'center',
    // alignItems:'center',
    paddingTop: 25,
    paddingHorizontal: 15,
    paddingBottom: 15,
    boxShadow: '0px 1px 4px 0px #dedede',
  },
  num: {
    fontSize: 24,
    color: Constants.black,
    fontFamily: FONTS.Bold,
  },
  boxtxt: {
    fontSize: 14,
    color: Constants.customgrey2,
    fontFamily: FONTS.SemiBold,
  },
  boxcov: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  box2: {
    backgroundColor: Constants.white,
    borderRadius: 15,
    padding: 10,
    marginVertical: 20,
    boxShadow: '0px 1px 4px 0px #dedede',
  },
  box3: {
    backgroundColor: Constants.white,
    borderRadius: 15,
    padding: 20,
    boxShadow: '0px 1px 4px 0px #dedede',
  },
  box4: {
    backgroundColor: Constants.white,
    borderRadius: 15,
    padding: 15,
    marginTop: 15,
  },
  gratxt1: {
    fontSize: 14,
    color: Constants.black,
    fontFamily: FONTS.Regular,
  },
  norev: {
    fontSize: 14,
    color: Constants.customgrey2,
    fontFamily: FONTS.Regular,
    textAlign: 'center',
    marginTop: 10,
  },
  gratxt2: {
    fontSize: 16,
    color: Constants.black,
    fontFamily: FONTS.SemiBold,
  },
  gratxt3: {
    fontSize: 12,
    color: Constants.customgrey2,
    fontFamily: FONTS.Medium,
  },
  gratxt4: {
    fontSize: 14,
    color: Constants.normal_green,
    fontFamily: FONTS.Medium,
    textDecorationLine: 'underline',
  },
  filcov: {
    borderWidth: 1,
    borderColor: Constants.customgrey2,
    borderRadius: 10,
    flexDirection: 'row',
    paddingHorizontal: 10,
    height: 30,
    gap: 5,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  frow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rattxt: {
    fontSize: 20,
    color: Constants.normal_green,
    fontFamily: FONTS.SemiBold,
    marginLeft: 5,
    marginRight: 15,
  },
  shttxt: {
    fontSize: 16,
    color: Constants.dark_green,
    fontFamily: FONTS.Regular,
    marginTop: 10,
  },
  shtprodtxt1: {
    fontSize: 14,
    color: Constants.normal_green,
    fontFamily: FONTS.Regular,
    width:'80%'
  },
  shtprodtxt2: {
    fontSize: 14,
    color: Constants.black,
    fontFamily: FONTS.Medium,
    width:'80%'
  },
  size: {
    fontSize: 14,
    color: Constants.normal_green,
    fontFamily: FONTS.Medium,
    textDecorationLine:'underline'
  },
  sizecov:{
    borderWidth:1,
    borderColor:Constants.black,
    borderRadius:30,
    paddingHorizontal:5,
    paddingVertical:3,
    justifyContent:'center',
    alignItems:'center',
    height:40,
    alignSelf:'center',
    width:40,
  },
  shtprodtxt3: {
    fontSize: 11,
    color: Constants.customgrey2,
    fontFamily: FONTS.Regular,
  },
  shtprodtxt4: {
    fontSize: 16,
    color: Constants.black,
    fontFamily: FONTS.Regular,
  },
  btn1: {
    backgroundColor: Constants.normal_green,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  btn2: {
    borderColor: Constants.normal_green,
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  btntxt1: {
    fontSize: 14,
    color: Constants.white,
    fontFamily: FONTS.Regular,
  },
  btntxt2: {
    fontSize: 14,
    color: Constants.normal_green,
    fontFamily: FONTS.Regular,
  },

  prodbox: {
    marginHorizontal: 7,
    flex: 1,
    padding: 10,
    borderRadius: 15,
    alignItems: 'center',
    width: 170,
    boxShadow: '0px 1px 3px 0.2px #A4A4A4',
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
    fontSize: 14,
    color: Constants.dark_green,
    fontFamily: FONTS.SemiBold,
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  ordbox: {
    borderWidth: 1,
    borderColor: Constants.normal_green,
    paddingHorizontal: 10,
    paddingBottom: 10,
    borderRadius: 15,
    //  marginBottom: 10 ,
    marginTop: 20,
  },
  horline: {
    height: 1,
    backgroundColor: Constants.customgrey2,
    marginVertical: 10,
  },
  //////Model////////

  textStyle: {
    color: Constants.black,
    // fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: FONTS.Medium,
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
    color: Constants.black,
    fontSize: 18,
    fontFamily: FONTS.Bold,
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
  acceptButtonStyle: {
    flex: 1,
    backgroundColor: Constants.dark_green,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    // marginLeft: 10,
    boxShadow: '0 3 10 0.05 grey',
  },

  ////model
  centeredView2: {
    height: Dimensions.get('window').height,
    width: Dimensions.get('window').width,
    // flex: 1,
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
    backgroundColor: Constants.dark_green,
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  dropdown: {
    height: 30,
    width: 85,
    borderWidth: 1,
    borderColor: Constants.customgrey2,
    borderRadius: 10,
    paddingHorizontal: 7,
  },
  selectedText: {
    color: Constants.black,
    fontSize: 14,
    fontFamily: FONTS.Medium,
    paddingVertical: 0,
  },
  itemText: {
    fontSize: 14,
    color: Constants.white,
    fontFamily: FONTS.Medium,
    // lineHeight: 15,
    // backgroundColor:'red'
  },
  itemContainer: {
    paddingVertical: 7,
    paddingHorizontal: 16,
    // width: '100%',
    backgroundColor: Constants.dark_green,
    borderTopWidth: 1,
    borderColor: Constants.white,
  },
  instuctxt: {
    color: Constants.normal_green,
    fontSize: 12,
    fontFamily: FONTS.Medium,
    marginTop: 5,
  },
  frowwi:{
                                  flexDirection: 'row',
                                  justifyContent: 'space-between',
                                  width: '80%',
                                }
});
