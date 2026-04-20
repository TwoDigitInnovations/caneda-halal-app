import {
  Animated,
  Dimensions,
  Image,
  ImageBackground,
  Keyboard,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Constants, {Currency, FONTS, Googlekey} from '../../../Assets/Helpers/constant';
import {
  BackIcon,
  CartIcon,
  CrossIcon,
  DateIcon,
  DeleteIcon,
  DiscountIcon,
  DownarrowIcon,
  InfoIcon,
  Location2Icon,
  MinusIcon,
  PlusIcon,
  Thik2Icon,
  WalkIcon,
  WorkIcon,
} from '../../../../Theme';
import {
  AddressContext,
  FoodCartContext,
  FoodUserContext,
  LoadContext,
  ProfileContext,
  ToastContext,
  UserContext,
} from '../../../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {goBack, navigate} from '../../../../navigationRef';
import {GetApi, Post} from '../../../Assets/Helpers/Service';
import axios from 'axios';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import moment from 'moment';
import {Picker} from 'react-native-wheel-pick';
import LinearGradient from 'react-native-linear-gradient';
import {CardField, useStripe, CardForm} from '@stripe/stripe-react-native';
import LottieView from 'lottie-react-native';
import { useTranslation } from 'react-i18next';

const Cart = () => {
  const { t } = useTranslation();
  const {initPaymentSheet, presentPaymentSheet, confirmPayment} = useStripe();
  const inputRef = useRef(null);
  const inputRef2 = useRef(null);
  const bottomSheetRef = useRef(null);
  const bottomSheetRef2 = useRef(null);
  const [loading, setLoading] = useContext(LoadContext);
  const [profile, setProfile] = useContext(ProfileContext);
  const [foodcartdetail, setfoodcartdetail] = useContext(FoodCartContext);
  const [fooduserProfile, setfooduserProfile] = useContext(FoodUserContext);
  const [locationadd, setlocationadd] = useContext(AddressContext);
  const [toast, setToast] = useContext(ToastContext);
  const [user, setuser] = useContext(UserContext);
  const [couponList, setCouponList] = useState([]);
  const [appliedCoupon, setappliedCoupon] = useState();
  const [applyCoupon, setApplyCoupon] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalVisible2, setModalVisible2] = useState(false);
  const [modalVisible3, setModalVisible3] = useState(false);
  const [selfPickup, setSelfPickup] = useState(false);
  const [totalsum, settotalsum] = useState(null);
  const [donation, setdonation] = useState(null);
  const [deliveryfee, setdeliveryfee] = useState(null);
  const [notes, setnotes] = useState('');
  const [instrution, setinstrution] = useState('');
  const [seldonation, setseldonation] = useState('');
  const [showtimeslot, setshowtimeslot] = useState();
  const [showbottomsheet, setshowbottomsheet] = useState(true);
  const [completeYourMeal, setCompleteYourMeal] = useState([]);
  const shaloowarray = [...foodcartdetail];
  const snapPoints = useMemo(() => ['75%','80%','85%','95%'], []);
  const renderBackdrop = useCallback(
    props => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        // pressBehavior="none"
        onPress={() => {
          console.log('Backdrop pressed');
          Keyboard.dismiss();
          setTimeout(() => {
            if (bottomSheetRef.current) {
              bottomSheetRef.current.close();
              setshowbottomsheet(false);
            }
          }, 100);
        }}
      />
    ),
    [],
  );
  const deviceheight=Dimensions.get('window').height
  useEffect(() => {
    const sumdata =
      foodcartdetail && foodcartdetail.length > 0
        ? foodcartdetail.reduce((a, item) => {
            return Number(a) + Number(item?.price) * Number(item?.qty);
          }, 0)
        : null;
    console.log(sumdata);
    settotalsum(sumdata);
  }, [foodcartdetail]);
  useEffect(() => {
    setTimeout(() => {
      setshowbottomsheet(false);
    }, 500);
  }, []);

  useEffect(() => {
    if (foodcartdetail?.length > 0 && fooduserProfile?.shipping_address?.location) {
      calculateDistance();
    }
    getallcoupon();
    fetchCompleteYourMeal();
  }, []);

  const fetchCompleteYourMeal = () => {
    const sellerId = foodcartdetail?.[0]?.seller_id;
    if (!sellerId) return;
    // Exclude all food IDs already in the cart
    const excludeIds = foodcartdetail.map(i => i.foodid).filter(Boolean).join(',');
    GetApi(
      `getTopFoodBySeller/${sellerId}?excludeIds=${excludeIds}&limit=10&userId=${user?._id}`,
    ).then(
      res => { if (res.status) setCompleteYourMeal(res.data); },
      err => console.log('completeYourMeal err', err),
    );
  };

  const submit = (paymentid) => {
    setLoading(true);
    let newarr = foodcartdetail.map(item => {
      return {
        food_id: item.foodid,
        image: item.image,
        food_name: item.foodname,
        price: item.price,
        qty: item.qty,
        seller_id: item.seller_id,
        seller_profile: item.seller_profile,
      };
    });

    const data = {
      paymentid: paymentid,
      productDetail: newarr,
      shipping_address: fooduserProfile?.shipping_address,
      location: fooduserProfile?.shipping_address?.location,
      total: totalsum,
      paymentmode: 'cod',
      seller_id: newarr[0].seller_id,
      seller_profile: newarr[0].seller_profile,
      user_profile: fooduserProfile?._id,
      delivery_fee:
        deliveryfee && deliveryfee > 0 && !selfPickup ? deliveryfee : 0,
      delivery_tip: !selfPickup ? Number(donation || 0) : 0,
      tax: (totalsum * 5) / 100,
      total_deliverd_amount: !selfPickup
        ? Number(deliveryfee || 0) + Number(donation || 0)
        : 0,
      final_amount: (
        totalsum +
        (totalsum * 5) / 100 +
        (!selfPickup ? Number(deliveryfee || 0) : 0) +
        (!selfPickup ? Number(donation || 0) : 0) -
        (appliedCoupon?.discount ? appliedCoupon?.discount : 0)
      ).toFixed(2),
    };
    if (appliedCoupon?.discount) {
      data.discount = appliedCoupon?.discount;
    }
    if (user?._id) {
      data.user = user._id;
    }
    if (selfPickup) {
      data.selfpickup = true;
      data.pickupOTP = Math.floor(1000 + Math.random() * 9000);
    }
    if (instrution) {
      data.instruction = instrution;
    }

    if (selecteddate) {
      let [startStr, endStr] = selectedTime.split(' - '); // e.g., ["11:00", "11:30 AM"]

      // If startStr doesn't include AM/PM, take it from endStr
      if (!/AM|PM/.test(startStr)) {
        const period = endStr.includes('AM') ? 'AM' : 'PM';
        startStr = `${startStr} ${period}`;
      }
      const fullStartDateTime = moment(
        `${selecteddate.format('YYYY-MM-DD')} ${startStr}`,
        'YYYY-MM-DD h:mm A',
      );

      const finalDateTime = fullStartDateTime.subtract(30, 'minutes');

      data.scheduledelivery = true;
      data.scheduledate = new Date(finalDateTime);
      data.scheduletimeslot = selectedTime;
    }
    console.log('data', data);

    Post('createfoodorder', data, {}).then(
      async res => {
        setLoading(false);
        setModalVisible(true);
        console.log(res);
        await AsyncStorage.removeItem('foodcartdata');
        setfoodcartdetail([]);
        setinstrution('')
      },
      err => {
        setLoading(false);
        console.log(err);
      },
    );
  };
  useEffect(() => {
    if (seldonation === 'Other') {
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 200);
    }
  }, [donation, seldonation]);

  const calculateDistance = async () => {
    setLoading(true);
    const origin = `${fooduserProfile?.shipping_address?.location?.coordinates[1]},${fooduserProfile?.shipping_address?.location?.coordinates[0]}`;
    const destination2 = `${foodcartdetail[0].seller_location?.coordinates[1]},${foodcartdetail[0].seller_location?.coordinates[0]}`;

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination2}&key=${Googlekey}`;
    console.log('url', url);

    try {
      const response = await axios.get(url);
      const result = response.data;
      setLoading(false);
      console.log(response);
      const distance = result.rows[0].elements[0].distance?.value;
      setdeliveryfee(distance ? (distance / 1000).toFixed(0) : 0);
    } catch (error) {
      console.error('Error fetching data: ', error);
    }
  };
  const screenWidth = Dimensions.get('window').width;
  const itemWidth = screenWidth / 3; // since we have 3 items

  const [selecteddate, setSelecteddate] = useState();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const handlePress = index => {
    setSelectedIndex(index);
    Animated.timing(slideAnim, {
      toValue: index * itemWidth,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const days = [
    {label: t('Today'), date: moment()},
    {label: t('Tomorrow'), date: moment().add(1, 'day')},
    {
      label: t(moment().add(2, 'day').format('dddd')),
      date: moment().add(2, 'day'),
    },
  ];
  const [selectedTime, setSelectedTime] = useState();
  const [times, setTimes] = useState();
  useEffect(() => {
    const selectedDay = days[selectedIndex];
    const isToday = selectedDay.label === 'Today';
    const generatedSlots = generateTimeSlots(isToday);
    setTimes(generatedSlots);
    setSelectedTime(generatedSlots[0]);
  }, [selectedIndex]);

  const generateTimeSlots = (isToday = false) => {
    const slots = [];
    const now = moment();
    const startTime = isToday
      ? moment().add(2, 'hour').startOf('hour')
      : moment().hour(11).minute(0);

    const endTime = moment().hour(24).minute(0);

    while (startTime.isBefore(endTime)) {
      const nextTime = moment(startTime).add(30, 'minutes');

      const samePeriod = startTime.format('A') === nextTime.format('A');

      const formatStart = startTime.format(samePeriod ? 'h:mm' : 'h:mm A');
      const formatEnd = nextTime.format('h:mm A');

      slots.push(`${formatStart} - ${formatEnd}`);

      startTime.add(30, 'minutes');
    }

    return slots;
  };
  const getallcoupon = () => {
    GetApi('getallcoupon').then(
      async res => {
        console.log('get all coupon ::', res?.data);
        setCouponList(res?.data);
      },
      error => {
        console.log({type: false, message: error?.message});
      },
    );
  };

  const applyCouponCode = () => {
    const foundCoupon = couponList.find(
      c => c.code.toLowerCase() === applyCoupon.toLowerCase(),
    );
    console.log('foundCoupon', foundCoupon);

    if (foundCoupon) {
      setappliedCoupon(foundCoupon);
      setToast('Coupon applied successfully!');
    } else {
      setToast('Invalid coupon code!');
    }
  };

   const handleplayment = () => {
    const total=Math.round(
        totalsum +
        (totalsum * 5) / 100 +
        // (!selfPickup ? Number(deliveryfee || 0) : 0) +
        (!selfPickup ? Number(donation || 0) : 0) -
        (appliedCoupon?.discount ? appliedCoupon?.discount : 0)
      )

    setLoading(true);
    Post(
      'poststripe',
      {price: Number(total), currency: 'cad', version: 1},
      {},
    ).then(
      async res => {
        console.log(res);
        setLoading(false);
        const {error} = await initPaymentSheet({
          merchantDisplayName: 'CHMP',
          // customerId: res.customer,
          // customerEphemeralKeySecret: res.ephemeralKey,
          paymentIntentClientSecret: res.clientSecret,
          allowsDelayedPaymentMethods: true,
        });
        if (error) {
          console.log(error);
          return;
        }

        const {error: paymentError} = await presentPaymentSheet();

        if (paymentError) {
          console.log(`Error code: ${paymentError.code}`, paymentError.message);
          setModalVisible3(true);
          return;
        } else {
          submit(res.clientSecret);
          console.log('res', res);
        }
      },
      err => {
        setLoading(false);
        console.log(err);
      },
    );
  };

  const restaurantName = foodcartdetail?.[0]?.seller_name || '';

  const locationLabel = fooduserProfile?.shipping_address?.address
    ? `${fooduserProfile?.shipping_address?.house_no
        ? fooduserProfile.shipping_address.house_no + ' • '
        : ''}${fooduserProfile.shipping_address.address}`
    : locationadd || t('Set location');

  // Haversine delivery time — same formula as backend
  const deliveryTime = (() => {
    const coords = foodcartdetail?.[0]?.seller_location?.coordinates;
    const uCoords = fooduserProfile?.shipping_address?.location?.coordinates;
    if (!coords || !uCoords || coords.length < 2 || uCoords.length < 2) return null;
    const [sLng, sLat] = coords;
    const [uLng, uLat] = uCoords;
    const R = 6371;
    const dLat = ((sLat - uLat) * Math.PI) / 180;
    const dLng = ((sLng - uLng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((uLat * Math.PI) / 180) *
        Math.cos((sLat * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    const distKm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const raw = 15 + Math.round(distKm * 5);
    const lo = Math.ceil(raw / 5) * 5;
    return `${lo - 5}-${lo} MINS`;
  })();

  return (
    <View style={styles.container}>
      <GestureHandlerRootView style={{flex: 1}}>

        {/* ── Header — only when cart has items ── */}
        {foodcartdetail?.length > 0 && (
          <View style={styles.cartHeader}>
            <TouchableOpacity style={styles.cartBackBtn} onPress={() => goBack()}>
              <BackIcon color={Constants.dark_green} width={20} height={20} />
            </TouchableOpacity>

            <View style={styles.cartHeaderCenter}>
              <Text style={styles.cartRestaurantName} numberOfLines={1}>
                {restaurantName}
              </Text>
              <TouchableOpacity
                style={styles.cartLocationRow}
                onPress={() => navigate('Shipping')}>
                {deliveryTime && (
                  <Text style={styles.cartDeliveryTime}>{deliveryTime} • </Text>
                )}
                <Location2Icon color={Constants.customgrey3} width={12} height={12} />
                <Text style={styles.cartLocationText} numberOfLines={1}>
                  {' '}{locationLabel}
                </Text>
                <DownarrowIcon color={Constants.dark_green} width={12} height={12} />
              </TouchableOpacity>
            </View>

            {/* <TouchableOpacity style={styles.cartInfoBtn}>
              <InfoIcon color={Constants.dark_green} width={20} height={20} />
            </TouchableOpacity> */}
          </View>
        )}
        {foodcartdetail && foodcartdetail.length > 0 ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="always"
            style={{padding: 20}}>
            {/* <View style={styles.rowbetw}>
              <View style={{width: '50%'}}>
                <Text
                  style={styles.deltxt}>
                  {t("Delivery Location")}
                </Text>
                <Text style={styles.deltxt2} numberOfLines={2}>
                  {fooduserProfile?.shipping_address?.address
                    ? `${fooduserProfile?.shipping_address?.house_no} ${fooduserProfile?.shipping_address?.address}`
                    : locationadd}
                </Text>
              </View>
              <Text style={styles.cngtxt} onPress={() => navigate('Shipping')}>
                {t("Change Location")}
              </Text>
            </View> */}
            
            <View >
              {foodcartdetail.map((item, i) => (
                <View
                  key={i}
                  style={{flexDirection: 'row', marginVertical: 10}}>
                  <Image
                    source={{uri: item?.image}}
                    style={{height: 80, width: 80, borderRadius: 20}}
                  />
                  {/* <View style={{marginLeft: 10, flex: 1}}> */}
                    
                    <View style={styles.rowbetw}>
                      <View style={{width:'75%'}}>
                    <Text style={styles.deltxt2} numberOfLines={2}>{item?.foodname}</Text>
                      <View style={styles.qtycov}>
                        <TouchableOpacity
                          style={[
                            styles.iconcov,
                            {
                              borderColor:
                                item?.qty === 1
                                  ? Constants.customgrey2
                                  : Constants.black,
                            },
                          ]}
                          onPress={async () => {
                            const updatedCart = foodcartdetail.map(cartItem => {
                              if (cartItem.foodid === item.foodid) {
                                if (cartItem.qty > 1) {
                                  return {
                                    ...cartItem,
                                    qty: cartItem.qty - 1,
                                  };
                                }
                              }
                              return cartItem;
                            });

                            setfoodcartdetail(updatedCart);
                            await AsyncStorage.setItem(
                              'foodcartdata',
                              JSON.stringify(updatedCart),
                            );
                          }}>
                          <MinusIcon
                            color={
                              item?.qty === 1
                                ? Constants.customgrey2
                                : Constants.black
                            }
                          height={12} width={12}/>
                        </TouchableOpacity>
                        <Text style={styles.qty}>{item?.qty}</Text>
                        <TouchableOpacity
                          style={styles.iconcov}
                          onPress={async () => {
                            const updatedCart = foodcartdetail.map(cartItem => {
                              if (cartItem.foodid === item.foodid) {
                                return {
                                  ...cartItem,
                                  qty: cartItem.qty + 1,
                                };
                              }
                              return cartItem;
                            });

                            setfoodcartdetail(updatedCart);
                            await AsyncStorage.setItem(
                              'foodcartdata',
                              JSON.stringify(updatedCart),
                            );
                          }}>
                          <PlusIcon height={12} width={12}/>
                        </TouchableOpacity>
                      </View>
                      </View>
                      <View style={{alignItems:'flex-end',justifyContent:'space-between'}}>
                      <Text style={styles.deltxt2}>{Currency} {item?.price}</Text>
                      <DeleteIcon
                        color={Constants.red}
                        onPress={async () => {
                          shaloowarray.splice(i, 1),
                            await AsyncStorage.setItem(
                              'foodcartdata',
                              JSON.stringify(shaloowarray),
                            );
                          setfoodcartdetail(shaloowarray);
                          setSelecteddate(null);
                        }}
                      />
                      </View>
                    </View>
                  {/* </View> */}
                </View>
              ))}
            </View>

            {completeYourMeal?.length > 0 && (
              <View style={styles.completeSection}>
                <Text style={styles.completeSectionTitle}>{t('Complete your meal with')}</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.completeSectionScroll}>
                  {completeYourMeal.map((meal, idx) => {
                    const mealQty = foodcartdetail.find(f => f.foodid === meal._id)?.qty || 0;
                    return (
                      <View key={idx} style={styles.mealCard}>
                        <Image
                          source={{uri: meal?.image?.[0]}}
                          style={styles.mealCardImage}
                        />
                        <Text style={styles.mealCardName} numberOfLines={2}>{meal?.name}</Text>
                        <View style={styles.mealCardBottom}>
                          <Text style={styles.mealCardPrice}>{Currency}{meal?.price}</Text>
                          {mealQty > 0 ? (
                            <View style={styles.mealStepper}>
                              <TouchableOpacity
                                style={styles.mealStepBtn}
                                onPress={async () => {
                                  let updated;
                                  if (mealQty === 1) {
                                    updated = foodcartdetail.filter(f => f.foodid !== meal._id);
                                  } else {
                                    updated = foodcartdetail.map(f =>
                                      f.foodid === meal._id ? {...f, qty: f.qty - 1} : f
                                    );
                                  }
                                  setfoodcartdetail(updated);
                                  await AsyncStorage.setItem('foodcartdata', JSON.stringify(updated));
                                }}>
                                <MinusIcon color={Constants.normal_green} width={10} height={10} />
                              </TouchableOpacity>
                              <Text style={styles.mealStepQty}>{mealQty}</Text>
                              <TouchableOpacity
                                style={styles.mealStepBtn}
                                onPress={async () => {
                                  const updated = foodcartdetail.map(f =>
                                    f.foodid === meal._id ? {...f, qty: f.qty + 1} : f
                                  );
                                  setfoodcartdetail(updated);
                                  await AsyncStorage.setItem('foodcartdata', JSON.stringify(updated));
                                }}>
                                <PlusIcon color={Constants.normal_green} width={10} height={10} />
                              </TouchableOpacity>
                            </View>
                          ) : (
                            <TouchableOpacity
                              style={styles.mealAddBtn}
                              onPress={async () => {
                                const newItem = {
                                  foodid: meal._id,
                                  foodname: meal.name,
                                  price: meal.price,
                                  image: meal.image?.[0],
                                  qty: 1,
                                  seller_id: meal.sellerid,
                                  seller_name: meal.seller_profile?.store_name || '',
                                  seller_profile: meal.seller_profile?._id || meal.seller_profile,
                                  seller_location: meal.seller_profile?.location,
                                };
                                const updated = [...foodcartdetail, newItem];
                                setfoodcartdetail(updated);
                                await AsyncStorage.setItem('foodcartdata', JSON.stringify(updated));
                              }}>
                              <PlusIcon color={Constants.normal_green} width={12} height={12} />
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {!appliedCoupon?.discount && (
              <View style={styles.aplcov}>
                <DiscountIcon
                  height={25}
                  width={25}
                  style={{alignSelf: 'center'}}
                  color={Constants.normal_green}
                />
                <TextInput
                  placeholder={t("Promo Code ...")}
                  placeholderTextColor={Constants.customgrey2}
                  style={styles.protxtinp}
                  value={applyCoupon}
                  onChangeText={e => setApplyCoupon(e)}
                />
                <TouchableOpacity
                  style={styles.aplbtn}
                  onPress={() => applyCouponCode()}>
                  <Text style={styles.apltxt}>{t("Apply")}</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.aftprobg}>
              <TouchableOpacity
                style={styles.accoptcov}
                onPress={async () => {
                  // setSelfPickup(!selfPickup);
                  setModalVisible2(true);
                }}>
                <View
                  style={{flexDirection: 'row', gap: 10, alignItems: 'center'}}>
                  <View style={styles.iconcov2}>
                    <WalkIcon height={20} width={20} color={Constants.normal_green}/>
                  </View>
                  <Text style={styles.acctxt}>{t("Pickup by self")}</Text>
                </View>
                {selfPickup ? (
                  <Image
                    source={require('../../../Assets/Images/on.png')}
                    resizeMode="contain"
                    style={{width: 40, height: 20}}
                  />
                ) : (
                  <Image
                    source={require('../../../Assets/Images/off2.png')}
                    resizeMode="contain"
                    style={{width: 43, height: 23}}
                  />
                )}
              </TouchableOpacity>
              {appliedCoupon?.discount && (
                <View style={styles.promocov}>
                  <View style={{flexDirection: 'row', gap: 10}}>
                    <Thik2Icon color="#27AE60"/>
                    <Text style={[styles.nottxt1,{width:'70%'}]}>
                      {t("YouSAVED", { Currency:Currency,discount:appliedCoupon?.discount,code:appliedCoupon?.code })}
                    </Text>
                  </View>
                  <Text
                    style={[styles.nottxt1, {color: Constants.red}]}
                    onPress={() => {
                      setappliedCoupon(null), setApplyCoupon('');
                    }}>
                    {t("Remove")}
                  </Text>
                </View>
              )}
              {instrution?.length > 0 && (
                <TouchableOpacity
                  style={{marginTop: 10}}
                  onPress={() => {
                    setshowbottomsheet(true);
                    setshowtimeslot(false);
                    setTimeout(() => {
                      deviceheight>700? bottomSheetRef.current.snapToIndex(0):bottomSheetRef.current.snapToIndex(3);
                    }, 200);
                    setTimeout(() => {
                      if (inputRef2.current) {
                        inputRef2.current.focus();
                      }
                    }, 300);
                  }}>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <InfoIcon
                      height={17}
                      width={17}
                      color={Constants.customgrey2}
                      style={{marginRight: 5}}
                    />
                    <Text style={styles.nottxt1}>{t("Note for the restaurant")}</Text>
                  </View>
                  <Text style={styles.nottxt2}>{instrution}</Text>
                </TouchableOpacity>
              )}
              {(!selecteddate || !instrution?.length > 0) && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.horizontal}>
                  {!selecteddate && (
                    <TouchableOpacity
                      style={styles.opt}
                      onPress={() => {
                        setshowbottomsheet(true);
                        setTimeout(() => {
                          bottomSheetRef.current.snapToIndex(0);
                        }, 300);
                        setshowtimeslot(true);
                      }}>
                      <DateIcon
                        height={15}
                        width={15}
                        style={{marginRight: 5}}
                      />
                      <Text style={styles.shedord}>
                        {t("Want this later? Schedule it")}
                      </Text>
                    </TouchableOpacity>
                  )}
                  {!instrution?.length > 0 && (
                    <TouchableOpacity
                      style={styles.opt}
                      onPress={() => {
                        setshowbottomsheet(true);
                        setTimeout(() => {
                          deviceheight>700? bottomSheetRef.current.snapToIndex(0):bottomSheetRef.current.snapToIndex(3);
                        }, 300);
                        setshowtimeslot(false);
                        setTimeout(() => {
                          if (inputRef2.current) {
                            inputRef2.current.focus();
                          }
                        }, 450);
                      }}>
                      <InfoIcon
                        height={17}
                        width={17}
                        color={Constants.customgrey2}
                        style={{marginRight: 5}}
                      />
                      <Text style={styles.shedord}>
                        {t("Add a note for the restaurant")}
                      </Text>
                    </TouchableOpacity>
                  )}
                </ScrollView>
              )}
            </View>

            {selecteddate && (
              <View>
                <LinearGradient
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  colors={['#DEE9FC', '#DBEFF0', '#D9F4E2']}
                  style={styles.btn}>
                  <View style={{width: '70%'}}>
                    <Text style={styles.tiptxt3}>
                      {t("This is a scheduled delivery")}
                    </Text>
                    <Text style={styles.tiptxt4}>
                      {t("Your order will be prepared closer to your delivery time")}
                    </Text>
                  </View>
                  <Image
                    source={require('../../../Assets/Images/bgtop2.png')}
                    style={{height: 70, width: 70}}
                  />
                </LinearGradient>
                <View style={styles.btmpart}>
                  <View
                    style={{
                      flexDirection: 'row',
                      gap: 5,
                      alignItems: 'center',
                    }}>
                    <DateIcon height={15} width={15} color={Constants.black} />
                    <Text style={styles.shedtxt}>{t("Delivering")}</Text>
                    <Text style={styles.shedtxt2}>
                      {moment(selecteddate).format('DD MMM')}, {selectedTime}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={{alignSelf: 'flex-start', marginLeft: 20}}
                    onPress={() => {
                      setshowbottomsheet(true);
                      setTimeout(() => {
                        bottomSheetRef.current.snapToIndex(0);
                      }, 200);
                      setshowtimeslot(true);
                    }}>
                    <Text style={[styles.shedord, {fontSize: 12}]}>
                      {t("Change slot")}
                    </Text>
                    <View style={styles.underline}></View>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            <View style={styles.btmbox}>
                <Text style={styles.paysumtxt}>{t("Bill Summary")}</Text>
              <View style={styles.rowbetw2}>
                <Text style={styles.deltxt}>{t("Total")}</Text>
                <Text style={styles.deltxt2}>{Currency}{totalsum}</Text>
              </View>
              <View style={styles.rowbetw2}>
                <Text style={styles.deltxt}>{t("Tax")}</Text>
                <Text style={styles.deltxt2}>{Currency}{(totalsum * 5) / 100}</Text>
              </View>
              {!selfPickup && Number(donation)>0&&<View style={styles.rowbetw2}>
                <Text style={styles.deltxt}>{t("Delivery Tip")}</Text>
                <Text style={styles.deltxt2}>{Currency}{donation}</Text>
              </View>}
              {!selfPickup && (
                <View style={styles.rowbetw2}>
                  <Text style={styles.deltxt}>{t("Delivery Fee")}</Text>
                  <Text style={styles.deltxt2}>
                    {deliveryfee && deliveryfee > 0
                      ? (Currency)+ (deliveryfee)
                      : t('FREE')}
                  </Text>
                </View>
              )}
              {appliedCoupon?.discount && (
                <View style={styles.rowbetw2}>
                  <Text style={styles.deltxt}>{t("Discount")}</Text>
                  <Text
                    style={[styles.deltxt2, {color: Constants.normal_green}]}>
                    -{Currency}{appliedCoupon?.discount}
                  </Text>
                </View>
              )}
              <View style={styles.rowbetw2}>
                <Text style={styles.deltxt}>{t("Grand Total")}</Text>
                <Text style={styles.deltxt2}>
                  {Currency}
                  {(
                    totalsum +
                    (totalsum * 5) / 100 +
                    (!selfPickup ? Number(deliveryfee || 0) : 0) +
                    (!selfPickup ? Number(donation || 0) : 0) -
                    (appliedCoupon?.discount ? appliedCoupon?.discount : 0)
                  ).toFixed(2)}
                </Text>
              </View>
            </View>
            {!selfPickup && (
              <View style={styles.tipcov}>
                <View
                  // source={require('../../../Assets/Images/bgimg2.png')}
                  style={{
                    // height: 100,
                    // width: '120%',
                    borderRadius: 10,
                    justifyContent: 'space-between',
                    paddingLeft: 15,
                    flexDirection: 'row',
                    // paddingRight: '7%',
                    // alignItems: 'flex-end',
                    // marginTop: 20,
                    // marginLeft:-20,
                    // paddingHorizontal:15
                  }}
                  resizeMode="cover">
                  <View>
                    <Text
                      style={styles.tiptxt1}
                      >
                      {t("Tip your delivery partner")}
                    </Text>
                    <Text style={styles.tiptxt2}>
                      {t("The full tip will be sent after delivery")}
                    </Text>
                  </View>
                  <Image
                    source={require('../../../Assets/Images/bgtop3.png')}
                    style={{ width: 160,position:'absolute',right:-20,top:0}}
                  />
                </View>
                <ScrollView
                  horizontal={true}
                  keyboardShouldPersistTaps="handled"
                  showsHorizontalScrollIndicator={false}
                  style={{marginTop: 5, paddingVertical: 10}}>
                  <Text
                    style={[
                      styles.tipamt,
                      {
                        backgroundColor: donation === '2' ? '#ECFAF1' : null,
                        borderColor:
                          donation === '2'
                            ? Constants.normal_green
                            : Constants.customgrey2,
                        color:
                          donation === '2'
                            ? Constants.black
                            : Constants.customgrey2,
                      },
                    ]}
                    onPress={() => {
                      setdonation('2'), setseldonation('amount');
                    }}>
                    {Currency}2
                  </Text>
                  <Text
                    style={[
                      styles.tipamt,
                      {
                        backgroundColor: donation === '5' ? '#ECFAF1' : null,
                        borderColor:
                          donation === '5'
                            ? Constants.normal_green
                            : Constants.customgrey2,
                        color:
                          donation === '5'
                            ? Constants.black
                            : Constants.customgrey2,
                      },
                    ]}
                    onPress={() => {
                      setdonation('5'), setseldonation('amount');
                    }}>
                    {Currency}5
                  </Text>
                  <Text
                    style={[
                      styles.tipamt,
                      {
                        backgroundColor: donation === '10' ? '#ECFAF1' : null,
                        borderColor:
                          donation === '10'
                            ? Constants.normal_green
                            : Constants.customgrey2,
                        color:
                          donation === '10'
                            ? Constants.black
                            : Constants.customgrey2,
                      },
                    ]}
                    onPress={() => {
                      setdonation('10'), setseldonation('amount');
                    }}>
                    {Currency}10
                  </Text>
                  <View >
                    {seldonation === 'Other' ? (
                      <View style={styles.tipamt2}>
                        <Text style={styles.tipcur}>{Currency}</Text>
                        <TextInput
                          ref={inputRef}
                          style={styles.donationinp}
                          maxLength={3}
                          keyboardType="number-pad"
                          value={donation}
                          onChangeText={e => setdonation(e)}
                          onSubmitEditing={() => {
                            if (Number(donation.trim()) <= 0) {
                              setdonation(''), setseldonation('');
                            }
                          }}
                        />
                      </View>
                    ) : (
                      <Text
                        style={styles.tipamt}
                        onPress={() => {
                          setdonation(''), setseldonation('Other');
                        }}>
                        {t("Other")}
                      </Text>
                    )}
                  </View>
                </ScrollView>
                {(seldonation != '' || Number(donation) > 99) && (
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      marginTop: 10,
                      marginHorizontal:10
                    }}>
                    <Text style={styles.wartxt}>
                      {Number(donation) > 99 &&
                        t('Sorry! A tip over CA$99 is far to generous on this order. Feel free to tip more directly to the delivery partner.')}
                    </Text>
                    <Text
                      style={styles.clrtxt}
                      onPress={() => {
                        setdonation(''), setseldonation('');
                      }}>
                      {seldonation != '' && t('Clear')}
                    </Text>
                  </View>
                )}
              </View>
            )}
            <TouchableOpacity
              style={[
                styles.btncov,
                {
                  backgroundColor:
                    Number(donation) && Number(donation) > 99
                      ? '#ECFAF1'
                      : Constants.normal_green,
                },
              ]}
              onPress={() => {
                if (Number(donation) <= 99) {
                  fooduserProfile?.shipping_address?.address
                    ? handleplayment()
                    : navigate('Shipping');
                }
              }}>
                <CartIcon color={Constants.white} height={18} width={18} />
              <Text style={[styles.btntxt,{lineHeight:18}]}>{t("Place Order • ")} {Currency}{(
                    totalsum +
                    (totalsum * 5) / 100 +
                    (!selfPickup ? Number(deliveryfee || 0) : 0) +
                    (!selfPickup ? Number(donation || 0) : 0) -
                    (appliedCoupon?.discount ? appliedCoupon?.discount : 0)
                  ).toFixed(2)}</Text>
            </TouchableOpacity>
          </ScrollView>
        ) : (
          <View style={{paddingHorizontal: 20}}>
            <Image
              source={require('../../../Assets/Images/cart.png')}
              style={{alignSelf: 'center', marginVertical: 70}}
            />
            <Text style={styles.empttxt}>{t("Ouch! Hungry")}</Text>
            <Text style={styles.empttxt2}>
              {t("Seems like you have not ordered any food yet")}
            </Text>
            <TouchableOpacity
              style={styles.btncov}
              onPress={() => navigate('SearchPage')}>
              <Text style={styles.btntxt}>{t("Find Foods")}</Text>
            </TouchableOpacity>
          </View>
        )}

        {showbottomsheet &&
          !modalVisible &&
          !modalVisible2 &&
          !loading &&
          !toast && (
            <BottomSheet
              ref={bottomSheetRef}
              // style={{paddingHorizontal: 20}}
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
              }}>
              {showtimeslot ? (
                <BottomSheetView style={styles.contentContainer}>
                  <Text style={styles.sheetheadtxt}>
                    {t("Select you delivery time")}
                  </Text>
                  <View style={styles.horline}></View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-evenly',
                      marginVertical: 10,
                    }}>
                    {days.map((item, index) => (
                      <TouchableOpacity
                        key={index}
                        style={{width: itemWidth, alignItems: 'center'}}
                        onPress={() => handlePress(index)}
                        activeOpacity={0.7}>
                        <Text
                          style={[
                            styles.datetxt,
                            {
                              color:
                                selectedIndex === index
                                  ? Constants.black
                                  : Constants.customgrey2,
                            },
                          ]}>
                          {item.date.format('DD MMM')}
                        </Text>
                        <Text
                          style={[
                            styles.datetxt2,
                            {
                              color:
                                selectedIndex === index
                                  ? Constants.black
                                  : Constants.customgrey2,
                            },
                          ]}>
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <Animated.View
                    style={{
                      height: 2,
                      width: itemWidth,
                      backgroundColor: Constants.normal_green,
                      transform: [{translateX: slideAnim}],
                    }}
                  />
                  <View style={styles.horline}></View>
                  <View style={styles.timePickerView}>
                    {times && times?.length > 0 && (
                      <Picker
                        textSize={20}
                        textColor="#888"
                        selectTextColor="#000000"
                        isShowSelectLine={true}
                        selectLineColor="#F3F4F8"
                        selectLineSize={20}
                        style={styles.timePickerStyle}
                        selectedValue={selectedTime}
                        pickerData={times}
                        onValueChange={value => {
                          setSelectedTime(value);
                        }}
                      />
                    )}
                  </View>
                  <View style={styles.horline}></View>
                  <TouchableOpacity
                    style={styles.btncov2}
                    onPress={() => {
                      setSelecteddate(days[selectedIndex].date),
                        bottomSheetRef.current.close();
                      setshowbottomsheet(false);
                    }}>
                    <Text style={styles.btntxt}>{t("Confirm")}</Text>
                  </TouchableOpacity>
                </BottomSheetView>
              ) : (
                <BottomSheetView style={styles.contentContainer}>
                  <Text style={styles.sheetheadtxt}>
                    {t("Add a note for the restaurant")}
                  </Text>
                  <View style={styles.horline}></View>
                  <View style={styles.inpucov}>
                    <TextInput
                      ref={inputRef2}
                      style={styles.inputfield}
                      placeholder={t("Note for the entire order")}
                      placeholderTextColor={Constants.customgrey2}
                      numberOfLines={5}
                      maxLength={100}
                      multiline={true}
                      value={notes}
                      onChangeText={e => setnotes(e)}></TextInput>
                  </View>
                  <Text style={styles.txtlim}>{100 - notes?.length}</Text>
                  <View style={styles.horline}></View>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginTop: 20,
                      paddingHorizontal: 20,
                    }}>
                    <Text
                      style={[
                        styles.cleartxt,
                        {
                          color:
                            notes && notes.trim()
                              ? Constants.normal_green
                              : Constants.customgrey2,
                        },
                      ]}
                      onPress={() => {
                        notes && notes.trim() && setinstrution(''),
                          setnotes('');
                      }}>
                      {t("Clear")}
                    </Text>
                    <TouchableOpacity
                      disabled={!notes.trim()}
                      style={[
                        styles.btncov3,
                        {
                          backgroundColor:
                            notes && notes.trim()
                              ? Constants.normal_green
                              : Constants.customgrey2,
                        },
                      ]}
                      onPress={() => {
                        setinstrution(notes), Keyboard.dismiss();
                        setTimeout(() => {
                          bottomSheetRef.current.close();
                          setshowbottomsheet(false);
                        }, 200);
                      }}>
                      <Text style={styles.btntxt}>{t("Save")}</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.descrtxt}>
                    {t("The restaurant will try to follow your requests.However, refunds or cancellations in this regard won't be possible.")}
                  </Text>
                </BottomSheetView>
              )}
            </BottomSheet>
          )}
      </GestureHandlerRootView>
      {/* {modalVisible && (
        <Modal
          animationType="none"
          transparent={true}
          // visible={modalVisible}
          // onRequestClose={() => {
          //   setModalVisible(false);
          // }}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <View style={{backgroundColor: 'white', alignItems: 'center'}}>
                <Text style={styles.txt}>Your Order is Confirmed.</Text>
                <Text style={styles.txt2}>Thanks for your Order</Text>
                <View style={styles.cancelAndLogoutButtonWrapStyle}>
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={async () => {
                      setModalVisible(!modalVisible);
                      // navigate('App');
                    }}
                    style={styles.logOutButtonStyle}>
                    <Text style={styles.modalText}>OK</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      )} */}
      {modalVisible2 && (
        <Modal
          animationType="none"
          transparent={true}
          // visible={modalVisible2}
          // onRequestClose={() => {
          //   setModalVisible2(false);
          // }}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <View style={{backgroundColor: 'white', alignItems: 'center'}}>
                <Text style={[styles.txt2, {textAlign: 'center'}]}>
                  {t(selfPickup ? "confirmSelfPickupNo" : "confirmSelfPickupYes")}
                </Text>
                <View style={styles.cancelAndLogoutButtonWrapStyle}>
                  <TouchableOpacity
                    activeOpacity={0.5}
                    onPress={async () => {
                      setModalVisible2(!modalVisible2);
                    }}
                    style={styles.logOutButtonStyle2}>
                    <Text
                      style={[styles.modalText, {color: Constants.dark_green}]}>
                      {t("Cencel")}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.5}
                    onPress={async () => {
                      setModalVisible2(!modalVisible2);
                      setSelfPickup(!selfPickup);
                    }}
                    style={styles.logOutButtonStyle}>
                    <Text style={styles.modalText}>{t("Confirm")}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      )}
      {modalVisible3&&<Modal
        animationType="none"
        transparent={true}
        // visible={modalVisible}
        // onRequestClose={() => {
        //   // Alert.alert('Modal has been closed.');
        //   setModalVisible(!modalVisible);
        // }}
        >
        <View style={styles.centeredView}>
          <View
            style={[
              styles.modalView,
              // {
              //   backgroundColor: dark ? Constants.black : Constants.white,
              //   borderColor: dark ? Constants.customblue : Constants.white,
              //   borderWidth: dark ? 1 : 0,
              // },
            ]}>
            <CrossIcon
              height={15}
              width={15}
              color={Constants.black}
              style={styles.cross}
              onPress={() => setModalVisible3(false)}
            />
            <View
              style={{
                backgroundColor: Constants.white,
                alignItems: 'center',
              }}>
              
               <LottieView
                source={require('../../../Assets/Animation/failed.json')}
                autoPlay
                loop={false}
                style={{height: 100, width: 100}}
              />
              <Text
                style={[
                  styles.textStyle,
                  {color: Constants.black},
                ]}>
                {t("Payment Failed")}
              </Text>
              <TouchableOpacity
                style={styles.errorbtn}
                onPress={() => {
                  setModalVisible3(false);
                }}>
                <Text style={styles.errorbtntxt}>{t("Try Again")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>}
      {modalVisible&&<Modal
        animationType="none"
        transparent={true}
        // visible={modalVisible2}
        // onRequestClose={() => {
        //   // Alert.alert('Modal has been closed.');
        //   setModalVisible2(!modalVisible2);
        // }}
        >
        <View style={styles.centeredView}>
          <View
            style={[
              styles.modalView,
              // {
              //   backgroundColor: dark ? Constants.black : Constants.white,
              //   borderColor: dark ? Constants.customblue : Constants.white,
              //   borderWidth: dark ? 1 : 0,
              // },
            ]}>
            <CrossIcon
              height={15}
              width={15}
              color={Constants.black}
              style={styles.cross}
              onPress={() => {
                setModalVisible(false)
              }}
            />
            <View
              style={{
                backgroundColor: Constants.white,
                alignItems: 'center',
              }}>
              {/* <Image
                source={require('../../Assets/Images/remove.png')}
                style={styles.removeimg}
              /> */}
              <LottieView
                source={require('../../../Assets/Animation/payment.json')}
                autoPlay
                loop={false}
                style={{height: 100, width: 100}}
              />
              <Text style={[styles.textStyle, {color: Constants.custom_green}]}>
                {t("Payment Successfull")}
              </Text>
              <Text style={styles.txt}>{t("Your Order is Confirmed.")}</Text>
              <TouchableOpacity
                style={[
                  styles.errorbtn,
                  {backgroundColor: Constants.custom_green},
                ]}
                onPress={() => {
                  setModalVisible(false);
                  // navigate('DriverApp')
                  goBack();
                }}>
                <Text style={styles.errorbtntxt}>{t("Done")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>}
    </View>
  );
};

export default Cart;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.white,
    // padding: 20,
  },
  headtxt: {
    fontSize: 16,
    color: Constants.black,
    fontFamily: FONTS.SemiBold,
    textAlign: 'center',
  },

  /* ── Cart header ── */
  cartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    // paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 10 : 10,
    paddingVertical:10,
    paddingBottom: 12,
    backgroundColor: Constants.white,
    borderBottomWidth: 1,
    borderBottomColor: Constants.customgrey5,
  },
  cartBackBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Constants.customgrey4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartHeaderCenter: {
    flex: 1,
    // alignItems: 'center',
    paddingHorizontal: 8,
  },
  cartRestaurantName: {
    fontSize: 17,
    fontFamily: FONTS.Bold,
    color: Constants.dark_green,
    marginBottom: 2,
  },
  cartLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cartLocationText: {
    fontSize: 11,
    fontFamily: FONTS.Regular,
    color: Constants.customgrey3,
    maxWidth: '60%',
  },
  cartInfoBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Constants.customgrey4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  /* ── Complete your meal with ── */
  completeSection: {
    marginTop: 20,
    marginBottom: 8,
  },
  completeSectionTitle: {
    fontSize: 15,
    fontFamily: FONTS.SemiBold,
    color: Constants.black,
    marginBottom: 12,
  },
  completeSectionScroll: {
    paddingBottom: 4,
    gap: 12,
  },
  mealCard: {
    width: 130,
    borderRadius: 14,
    backgroundColor: Constants.white,
    borderWidth: 1,
    borderColor: Constants.customgrey5 || '#EFEFEF',
    overflow: 'hidden',
    paddingBottom: 10,
  },
  mealCardImage: {
    width: '100%',
    height: 90,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  mealCardName: {
    fontSize: 12,
    fontFamily: FONTS.SemiBold,
    color: Constants.black,
    marginHorizontal: 8,
    marginTop: 6,
    marginBottom: 6,
    lineHeight: 16,
  },
  mealCardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  mealCardPrice: {
    fontSize: 12,
    fontFamily: FONTS.Bold,
    color: Constants.dark_green,
  },
  mealAddBtn: {
    backgroundColor: '#2C61401A',
    borderRadius: 7,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C61400D',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2C61401A',
    paddingHorizontal: 4,
    height: 28,
    gap: 4,
  },
  mealStepBtn: {
    padding: 2,
  },
  mealStepQty: {
    fontSize: 11,
    fontFamily: FONTS.Bold,
    color: Constants.black,
    minWidth: 14,
    textAlign: 'center',
  },
  cartDeliveryTime: {
    fontSize: 11,
    fontFamily: FONTS.SemiBold,
    color: Constants.customgrey3,
  },
  qtycov:{
    borderWidth: 1,
    borderColor: '#2C61401A',
    backgroundColor:'#2C61400D',
    borderRadius: 5,
    flexDirection:'row',
    padding:4,
    alignItems:'center',
    justifyContent:'center',
    height:35,
    width:80,
  },
  empttxt: {
    fontSize: 16,
    color: Constants.black,
    fontFamily: FONTS.Bold,
    textAlign: 'center',
    marginVertical: 10,
  },
  empttxt2: {
    fontSize: 16,
    color: Constants.customgrey2,
    fontFamily: FONTS.Medium,
    textAlign: 'center',
    width:'80%',
    alignSelf:'center'
  },
  btntxt: {
    fontSize: 16,
    color: Constants.white,
    fontFamily: FONTS.SemiBold,
  },
  deltxt: {
    fontSize: 14,
    color: Constants.customgrey,
    fontFamily: FONTS.Medium,
  },
  deltxt2: {
    fontSize: 14,
    color: Constants.black,
    fontFamily: FONTS.SemiBold,
  },
  tiptxt1: {
    fontSize: 16,
    color: Constants.customgrey,
    fontFamily: FONTS.Medium,
    marginTop:10
  },
  tiptxt2: {
    fontSize: 14,
    color: Constants.customgrey,
    fontFamily: FONTS.Regular,
  },
  tiptxt3: {
    fontSize: 14,
    color: Constants.customgrey,
    fontFamily: FONTS.SemiBold,
  },
  tiptxt4: {
    fontSize: 12,
    color: Constants.customgrey,
    fontFamily: FONTS.Medium,
  },
  apltxt: {
    fontSize: 14,
    color: Constants.normal_green,
    fontFamily: FONTS.SemiBold,
  },
  cngtxt: {
    fontSize: 14,
    color: Constants.normal_green,
    fontFamily: FONTS.Medium,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Constants.normal_green,
    borderRadius: 25,
    alignSelf: 'center',
  },
  btncov: {
    height: 55,
    backgroundColor: Constants.normal_green,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
    marginBottom: 120,
    flexDirection:'row',
    gap:10
  },
  btncov2: {
    height: 55,
    backgroundColor: Constants.normal_green,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
    marginBottom: 120,
    width: '90%',
    alignSelf: 'center',
  },
  btncov3: {
    height: 50,
    backgroundColor: Constants.normal_green,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    // marginTop: 25,
    // marginBottom: 120,
    width: '50%',
    // alignSelf: 'center',
  },
  aplbtn: {
    // backgroundColor: Constants.normal_green,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  aplcov: {
    flexDirection: 'row',
    // borderWidth: 1,
    // borderColor: Constants.customgrey2,
    borderRadius: 30,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginTop: 10,
    height:55,
    boxShadow: '0px 1px 4px 0px #dedede',
  },
  protxtinp: {
    flex: 1,
    paddingHorizontal: 10,
  },
  rowbetw: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: 10,
    // backgroundColor:'red',
    width: '75%'
  },
  rowbetw2: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  iconcov: {
    // borderWidth: 1,
    // borderColor: Constants.black,
    justifyContent: 'center',
    alignItems: 'center',
    // borderRadius: 30,
    padding: 5,
  },
  qty: {
    fontSize: 14,
    color: Constants.black,
    fontFamily: FONTS.SemiBold,
    marginHorizontal: 10,
  },
  paysumtxt: {
    fontSize: 16,
    color: Constants.customgrey3,
    fontFamily: FONTS.SemiBold,
  },
  btmbox: {
    borderWidth: 1,
    borderColor: Constants.customgrey4,
    padding: 10,
    borderRadius: 15,
    marginTop: 20,
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
  logOutButtonStyle2: {
    flex: 0.5,
    borderColor: Constants.normal_green,
    borderWidth: 1,
    borderRadius: 5,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 15,
  },
  logOutButtonStyle: {
    flex: 0.5,
    backgroundColor: Constants.normal_green,
    borderRadius: 5,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 15,
  },
  centeredView: {
    // flex: 1,
    height: Dimensions.get('window').height,
    width: Dimensions.get('window').width,
    justifyContent: 'center',
    alignItems: 'center',
    // marginTop: 22,
    backgroundColor: '#rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 35,
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
  },
  txt: {
    color: Constants.black,
    fontSize: 16,
    marginBottom: 5,
    fontFamily: FONTS.SemiBold,
  },
  txt2: {
    color: Constants.black,
    fontSize: 16,
    marginBottom: 10,
    fontFamily: FONTS.Medium,
  },
  tipamt: {
    color: Constants.customgrey2,
    fontSize: 14,
    fontFamily: FONTS.Medium,
    borderWidth: 1.5,
    borderColor: Constants.customgrey2,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 9,
    lineHeight: 14,
    marginLeft: 10,
    alignSelf:'center'
  },
  tipcur: {
    color: Constants.normal_green,
    fontSize: 14,
    fontFamily: FONTS.Medium,
    alignSelf: 'center',
    lineHeight: 14,
  },
  wartxt: {
    color: Constants.red,
    fontSize: 14,
    fontFamily: FONTS.Regular,
    width: '85%',
  },
  clrtxt: {
    color: Constants.normal_green,
    fontSize: 14,
    fontFamily: FONTS.Medium,
  },
  donationinp: {
    color: Constants.normal_green,
    fontSize: 14,
    lineHeight: 14,
    fontFamily: FONTS.Medium,
    // borderBottomWidth:1.5,
    // borderColor: Constants.normal_green,
    // height: 40,
    paddingVertical: 2,
    // marginBottom:7,
    // minWidth: 30,
    alignSelf:'center',
    maxHeight: 20,
  },
  tipamt2: {
    borderWidth: 1.5,
    borderColor: Constants.normal_green,
    borderRadius: 10,
    paddingHorizontal: 23,
    paddingVertical:7,
    marginLeft: 10,
    flexDirection: 'row',
    alignItems:'center'
  },
  tipcov: {
    borderWidth:1,
    borderColor: Constants.customgrey4,
    marginTop:10,
    borderRadius:15,
    overflow:'hidden',
  },
  accoptcov: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  acctxt: {
    fontSize: 14,
    color: Constants.black,
    fontFamily: FONTS.Medium,
  },
  shedord: {
    fontSize: 14,
    color: Constants.black,
    fontFamily: FONTS.Medium,
  },
  underline: {
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: Constants.customgrey3,
  },
  iconcov2: {
    backgroundColor: '#16A34A1A',
    borderRadius: 30,
    padding: 10,
  },
  sheetheadtxt: {
    fontSize: 16,
    color: Constants.black,
    fontFamily: FONTS.SemiBold,
    marginVertical: 5,
    marginLeft: 20,
  },
  descrtxt: {
    fontSize: 14,
    color: Constants.customgrey2,
    fontFamily: FONTS.Regular,
    marginBottom:260,
    marginHorizontal: 20,
    marginTop: 20,
  },
  horline: {
    borderTopWidth: 1,
    borderColor: Constants.customgrey5,
  },
  datetxt: {
    fontSize: 16,
    fontFamily: FONTS.Medium,
  },
  datetxt2: {
    fontSize: 14,
    fontFamily: FONTS.Regular,
  },
  deliveloctxt: {
    fontSize: 16,
    color: Constants.black,
    fontFamily: FONTS.Bold,
    marginLeft: 20,
    marginBottom: 10,
  },
  timePickerStyle: {
    backgroundColor: Constants.white,
    width: '90%',
    height: 170,
    alignSelf: 'center',
    fontFamily: FONTS.Medium,

    // borderRadius: 10,
    // borderWidth: 2,
    // borderColor: Constants.normal_green,
  },
  timePickerView: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 10,
    paddingVertical: 20,
  },
  btn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    padding: 10,
  },
  btmpart: {
    padding: 10,
    backgroundColor: Constants.customgrey4,
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 10,
  },
  shedtxt: {
    fontSize: 14,
    color: Constants.customgrey,
    fontFamily: FONTS.Regular,
  },
  shedtxt2: {
    fontSize: 14,
    color: Constants.black,
    fontFamily: FONTS.SemiBold,
  },
  horizontal: {
    padding: 5,
    // backgroundColor:Constants.customgrey4,
    marginTop: 10,
    borderRadius: 8,
  },
  opt: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Constants.customgrey3,
    padding: 5,
    marginRight: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  aftprobg: {
    padding: 10,
    // backgroundColor:Constants.customgrey4,
    marginVertical: 10,
    borderRadius: 10,
    boxShadow: '0px 1px 4px 0px #dedede',
  },
  inputfield: {
    color: Constants.black,
    fontSize: 14,
    fontFamily: FONTS.Medium,
    flex: 1,
    textAlignVertical: 'top',
  },
  inpucov: {
    // borderWidth: 1,
    // borderColor: Constants.customgrey5,
    borderRadius: 15,
    height: 100,
    paddingHorizontal: 10,
    marginHorizontal: 20,
    marginVertical: 10,
  },
  txtlim: {
    color: Constants.black,
    fontSize: 14,
    fontFamily: FONTS.Medium,
    alignSelf: 'flex-end',
    marginRight: 20,
  },
  cleartxt: {
    color: Constants.normal_green,
    fontSize: 16,
    fontFamily: FONTS.SemiBold,
    width: '50%',
    textAlign: 'center',
  },
  nottxt1: {
    color: Constants.black,
    fontSize: 14,
    fontFamily: FONTS.Medium,
  },
  nottxt2: {
    color: Constants.customgrey2,
    fontSize: 12,
    fontFamily: FONTS.Regular,
    marginLeft: 20,
    // borderWidth:1,
    // borderColor:Constants.customgrey2,
    // padding:5,
    // borderRadius:10,
    // borderStyle:'dashed'
  },
  promocov: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  textStyle: {
    fontFamily: FONTS.Bold,
    color: Constants.black,
    fontSize: 16,
    marginVertical: 10,
  },
  errorbtn: {
    width: 200,
    backgroundColor: '#F44336',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 10,
    marginTop: 10,
    borderRadius: 10,
  },
  errorbtntxt: {
    fontSize: 18,
    color: Constants.white,
    fontFamily: FONTS.Bold,
  },
  cross: {
    position: 'absolute',
    right: 15,
    top: 15,
  },
});
