import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  Keyboard,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import Constants, { Currency, FONTS, Googlekey } from '../../../Assets/Helpers/constant';
import { BackIcon, CrossIcon, DateIcon, InfoIcon, LocationIcon, MinusIcon, PlusIcon, Thik2Icon, WalkIcon } from '../../../../Theme';
import { AddressContext, GroceryCartContext, GroceryUserContext, LoadContext, ToastContext, UserContext } from '../../../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { goBack, navigate } from '../../../../navigationRef';
import { GetApi, Post } from '../../../Assets/Helpers/Service';
import { Dropdown } from 'react-native-element-dropdown';
import { useIsFocused } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import moment from 'moment';
import { Picker } from 'react-native-wheel-pick';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';
import {CardField, useStripe, CardForm} from '@stripe/stripe-react-native';
import LottieView from 'lottie-react-native';
import { useTranslation } from 'react-i18next';

const Cart = () => {
  const {initPaymentSheet, presentPaymentSheet, confirmPayment} = useStripe();
  const { t } = useTranslation();
  const dropdownRef = useRef();
  const inputRef2 = useRef(null);
  const inputRef = useRef(null);
  const bottomSheetRef = useRef(null);
  const [grocerycartdetail, setgrocerycartdetail] = useContext(GroceryCartContext)
  const [locationadd, setlocationadd] = useContext(AddressContext);
  const [user, setuser] = useContext(UserContext);
  const [groceryuserProfile, setgroceryuserProfile] =useContext(GroceryUserContext)
  const [loading, setLoading] = useContext(LoadContext);
  const [toast, setToast] = useContext(ToastContext);
  const [totalsum, settotalsum] = useState(null);
  const [totaloff, settotaloff] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalVisible2, setModalVisible2] = useState(false);
  const [modalVisible3, setModalVisible3] = useState(false);
  const [modalVisible4, setModalVisible4] = useState(false);
  const [image, setimage] = useState();
  const [tips, setTips] = useState([]);
  const [taxrate, settaxrate] = useState(null);
  const [servicefee, setservicefee] = useState(null);
  const [deliveryfee, setdeliveryfee] = useState(null);
  const [donation, setdonation] = useState(null);
  const [notes, setnotes] = useState('');
  const [instrution, setinstrution] = useState('');
  const [seldonation, setseldonation] = useState('');
  const [selfPickup, setSelfPickup] = useState(false);
  const [showtimeslot, setshowtimeslot] = useState();
  const [showbottomsheet, setshowbottomsheet] = useState(true);
  const shaloowarray = [...grocerycartdetail];
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
  console.log('deviceheight',deviceheight)
  useEffect(() => {
    if (seldonation === 'Other') {
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 200);
    }
  }, [donation, seldonation]);
   const IsFocused = useIsFocused();
     useEffect(() => {
       setTimeout(() => {
         setshowbottomsheet(false);
       }, 500);
     }, []);

  useEffect(() => {
    // getDeliveryCharge();
    // getTax();
    // getserviceFee();
  }, []);
  useEffect(() => {
      {
        IsFocused&&grocerycartdetail &&
          grocerycartdetail.length > 0 &&
          groceryuserProfile?.shipping_address?.location &&
          calculateDistance();
      }
    }, [IsFocused]);
  useEffect(() => {
    const sumdata =
      grocerycartdetail && grocerycartdetail.length > 0
        ? grocerycartdetail.reduce((a, item) => {
          return Number(a) + Number(item?.price) * Number(item?.qty);
        }, 0)
        : null;
    console.log(sumdata);
    settotaloff(sumdata);
    const offdata =
      grocerycartdetail && grocerycartdetail.length > 0
        ? grocerycartdetail.reduce((a, item) => {
          return Number(a) + Number(item?.offer) * Number(item?.qty);
        }, 0)
        : null;
    console.log(sumdata);
    settotalsum(offdata);
  }, [grocerycartdetail]);

  const calculateDistance = async () => {
    setLoading(true);
    const origin = `${groceryuserProfile?.shipping_address?.location?.coordinates[1]},${groceryuserProfile?.shipping_address?.location?.coordinates[0]}`;
    const destination2 = `${grocerycartdetail[0].seller_location?.coordinates[1]},${grocerycartdetail[0].seller_location?.coordinates[0]}`;

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

  const submit = (paymentid) => {
setLoading(true)
    let newarr = grocerycartdetail.map(item => {
      return {
        grocery_id: item.productid,
        grocery_name: item.productname,
        image: item.image,
        gocery_name: item.productname,
        price: item.offer,
        qty: item.qty,
        seller_id: item.seller_id,
        seller_profile: item.seller_profile,
      };
    });
    const data = {
      paymentid: paymentid,
      productDetail: newarr,
      shipping_address: groceryuserProfile?.shipping_address,
      location: groceryuserProfile?.shipping_address?.location,
      total: totalsum,
      paymentmode: 'cod',
      seller_id: newarr[0].seller_id,
      seller_profile: newarr[0].seller_profile,
      user_profile: groceryuserProfile?._id,
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
        (!selfPickup ? Number(donation || 0) : 0))
    };
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

    Post('creategroceryorder', data, {}).then(
      async res => {
        setLoading(false);
        setModalVisible4(true);
        console.log(res);
        await AsyncStorage.removeItem('grocerycartdata');
        setgrocerycartdetail([]);
        setinstrution('')
      },
      err => {
        setLoading(false);
        console.log(err);
      },
    );
  };

const handleplayment = () => {
    const total=
        totalsum +
        (totalsum * 5) / 100 +
        (!selfPickup ? Number(deliveryfee || 0) : 0) +
        (!selfPickup ? Number(donation || 0) : 0)
      

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
  return (
    <SafeAreaView style={styles.container}>
      <GestureHandlerRootView style={{flex: 1}}>
      <View style={styles.toppart}>
          <Text style={styles.carttxt}>{t("Cart")} ({grocerycartdetail.length})</Text>
        {grocerycartdetail && grocerycartdetail.length > 0 && <Text style={styles.addbtn} onPress={() => setModalVisible(true)}>
          {t("Empty Cart")}
        </Text>}
      </View>
      {grocerycartdetail && grocerycartdetail.length > 0 ? <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ backgroundColor: Constants.white }}>
          {grocerycartdetail.map((item, i) => (
            <View
              style={[
                styles.box,
                grocerycartdetail.length === i + 1 ? null : { borderBottomWidth: 1 },
              ]}
              key={i}>
              <View style={styles.firstpart}>
                <View style={styles.firstleftpart}>
                  <TouchableOpacity onPress={() => {
                    setimage(item.image);
                    setModalVisible2(true);
                  }}>
                    <Image source={{ uri: item.image }} style={styles.cardimg} />
                  </TouchableOpacity>
                  <View>
                    <Text style={styles.productname}>{item.productname}</Text>
                    <View style={{ flexDirection: 'row' }}>
                      <Text style={styles.maintxt}> {Currency} {item.offer}</Text>
                      <Text style={styles.disctxt}> {Currency} {item.price}</Text>
                    </View>
                    <Text style={styles.qty}>{item?.price_slot?.value} {item?.price_slot?.unit}</Text>
                  </View>
                </View>
                <CrossIcon
                  onPress={async () => {
                    shaloowarray.splice(i, 1),
                      await AsyncStorage.setItem(
                        'grocerycartdata',
                        JSON.stringify(shaloowarray),
                      );
                    setgrocerycartdetail(shaloowarray);
                  }}
                />
              </View>
              <View style={styles.addcov}>
                <TouchableOpacity
                  style={styles.plus}
                  onPress={async () => {
                    const updatedCart = grocerycartdetail.map(cartItem => {
                      if (
                        cartItem.productid === item.productid &&
                        cartItem.price_slot?.value === item.price_slot?.value
                      ) {
                        // Decrease only if qty is more than 1
                        if (cartItem.qty > 1) {
                          return {
                            ...cartItem,
                            qty: cartItem.qty - 1,
                          };
                        }
                      }
                      return cartItem;
                    });

                    setgrocerycartdetail(updatedCart);
                    await AsyncStorage.setItem('grocerycartdata', JSON.stringify(updatedCart));

                  }}>
                  <MinusIcon color={Constants.white} height={20} width={20}/>
                </TouchableOpacity>
                <Text style={styles.plus2}>{item.qty}</Text>
                <TouchableOpacity
                  style={styles.plus3}
                  onPress={async () => {
                   
                    const updatedCart = grocerycartdetail.map(cartItem => {
                      if (
                        cartItem.productid === item.productid &&
                        cartItem.price_slot?.value === item.price_slot?.value
                      ) {
                        return {
                          ...cartItem,
                          qty: cartItem.qty + 1,
                        };
                      }
                      return cartItem;
                    });

                    setgrocerycartdetail(updatedCart);
                    await AsyncStorage.setItem('grocerycartdata', JSON.stringify(updatedCart));

                  }}>
                  <PlusIcon color={Constants.white} height={20} width={20} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
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
                    <WalkIcon height={20} width={20} />
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
                    <Text style={styles.nottxt1}>{t("Note for the groceries store")}</Text>
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
                        {t("Add a note for the groceries store")}
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
            {!selfPickup && (
              <View style={{backgroundColor:Constants.white}}>
                <ImageBackground
                  source={require('../../../Assets/Images/bgimg2.png')}
                  style={{
                    height: 100,
                    width: '120%',
                    borderRadius: 10,
                    justifyContent: 'space-between',
                    paddingLeft: 10,
                    flexDirection: 'row',
                    paddingRight: '22%',
                    alignItems: 'flex-end',
                    marginTop: 20,
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
                    source={require('../../../Assets/Images/bgtop.png')}
                    style={{height: 70, width: 70}}
                  />
                </ImageBackground>
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
                  <View style={{height: 40}}>
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
                        Other
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
        <View style={styles.btombg}>
          <View style={styles.totalcov}>
            <View style={styles.total}>
              <Text style={styles.boxtxt}>{t("Item Total")}</Text>
              <View style={styles.amount}>
                <Text style={styles.boxtxt2}>{Currency}{totaloff}</Text>
                <Text style={styles.boxtxt}>{Currency}{totalsum}</Text>
              </View>
            </View>
            <View style={styles.total}>
              <Text style={styles.boxtxt}>{t("Tax")}</Text>
              <View style={styles.amount}>
                <Text style={styles.boxtxt}>{Currency}{(totalsum * 5) / 100}</Text>
              </View>
            </View>
            {!selfPickup && Number(donation)>0&&<View style={styles.total}>
                            <Text style={styles.boxtxt}>{t("Delivery Tip")}</Text>
                            <Text style={styles.boxtxt}>{Currency}{donation}</Text>
                          </View>}
            {!selfPickup&&<View style={styles.total}>
              <Text style={[styles.boxtxt, ]}>
                {t("Delivery Fee")}
              </Text>
              <View style={styles.amount}>
                {deliveryfee === 0 && <Text style={styles.boxtxt2}>{Currency}5</Text>}
                <Text style={styles.boxtxt}>{deliveryfee && deliveryfee > 0
                      ? (Currency)+ (deliveryfee)
                      : t('FREE')}</Text>
              </View>
            </View>}
            
            <View style={styles.line}></View>
            <View style={styles.total}>
              <Text style={[styles.boxtxt, { fontFamily: FONTS.SemiBold }]}>
                {t("Total Payable")}
              </Text>
              <Text style={[styles.boxtxt, { fontFamily: FONTS.SemiBold }]}>
                {Currency}{Number(totalsum) + ((Number(totalsum) * 5) / 100)+ 
                  (!selfPickup ? Number(deliveryfee || 0) : 0) +
                    (!selfPickup ? Number(donation || 0) : 0)}
              </Text>
            </View>
          </View>
          <View style={styles.paycov}>
            <View style={styles.paycovtxt}>
              {groceryuserProfile?.shipping_address?.address ? <Text style={styles.locationtxt} numberOfLines={1}>
                {groceryuserProfile?.shipping_address?.house_no}, {groceryuserProfile?.shipping_address?.address}
              </Text> :
                <Text style={styles.locationtxt} numberOfLines={1}>
                  {locationadd}
                </Text>}
              <TouchableOpacity style={{ flexDirection: 'row', width: '40%',gap:2 }} onPress={() => navigate('GroceryShipping')}>
                <LocationIcon height={18} width={18}  onPress={() => navigate('GroceryShipping')}/>
                <Text style={styles.changadd} onPress={() => navigate('GroceryShipping')}>{t("CHANGE ADDRESS")}</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.cartbtn} onPress={() => groceryuserProfile?.shipping_address?.address ? handleplayment() : navigate('GroceryShipping')}>
              <Text style={styles.buttontxt}>
                {t("CONTINUE TO PAY")} {Currency}{Number(totalsum) + (Number(totalsum) * 5) / 100 +
                  (!selfPickup ? Number(deliveryfee || 0) : 0) +
                    (!selfPickup ? Number(donation || 0) : 0)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView> : <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          height: Dimensions.get('window').height - 200,
        }}>
        {/* <BucketIcon color={Constants.black} height={100} width={100} /> */}
        <Image source={require('../../../Assets/Images/empty.png')} style={{ height: 80, width: 80 }} />
        <Text style={styles.carttxt2}>{t("Your Cart is empty")}</Text>
        <Text style={styles.browsprod} onPress={() => navigate('ProductWithCategoryForSeller')}>{t("Browse Products")}</Text>
      </View>}
      {showbottomsheet &&
          !modalVisible &&
          !modalVisible2 &&
          !modalVisible3 &&
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
                    {t("Add a note for the groceries store")}
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
                    {t("The groceries store will try to follow your requests.However, refunds or cancellations in this regard won't be possible.")}
                  </Text>
                </BottomSheetView>
              )}
            </BottomSheet>
          )}
      </GestureHandlerRootView>
      {/* {modalVisible3 && (
        <Modal
          animationType="none"
          transparent={true}
          // visible={modalVisible}
          // onRequestClose={() => {
          //   setModalVisible(false);
          // }}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView2}>
              <View style={{backgroundColor: 'white', alignItems: 'center'}}>
                <Text style={styles.txt}>Your Order is Confirmed.</Text>
                <Text style={styles.txt2}>Thanks for your Order</Text>
                <View style={styles.cancelAndLogoutButtonWrapStyle}>
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={async () => {
                      setModalVisible3(!modalVisible3);
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
            <View style={styles.modalView2}>
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
     {modalVisible&& <Modal
        animationType="none"
        transparent={true}
        
        >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View
              style={{
                backgroundColor: 'white',
                alignItems: 'center',
                paddingHorizontal: 30,
              }}>
              <Text style={styles.textStyle}>
                {t("Are you sure of clearing your cart?")}
              </Text>
              <View style={styles.cancelAndLogoutButtonWrapStyle}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => setModalVisible(!modalVisible)}
                  style={styles.cancelButtonStyle}>
                  <Text style={[styles.modalText, { color: Constants.normal_green }]}>
                    {t("No")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.9}
                  style={styles.logOutButtonStyle}
                  onPress={async () => {
                    await AsyncStorage.removeItem('grocerycartdata'),
                      setgrocerycartdetail([]),
                      setModalVisible(false);
                  }}>
                  <Text style={styles.modalText}>{t("Yes, Clear")}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>}
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
      {modalVisible4&&<Modal
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
                setModalVisible4(false)
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
                  setModalVisible4(false);
                  // navigate('DriverApp')
                  goBack();
                }}>
                <Text style={styles.errorbtntxt}>{t("Done")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>}
    </SafeAreaView>
  );
};

export default Cart;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.white,
  },
  toppart: {
    backgroundColor: Constants.normal_green,
    paddingVertical: 5,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addbtn: {
    backgroundColor: Constants.normal_green,
    color: Constants.white,
    paddingHorizontal: 18,
    paddingVertical: 5,
    borderRadius: 10,
    fontSize: 14,
    fontFamily: FONTS.SemiBold,
    // marginTop: 5,
    borderWidth: 1,
    borderColor: Constants.white,
    marginVertical:3
  },
  box: {
    padding: 20,
    // borderBottomWidth: 1,
    borderColor: Constants.customgrey3,
    marginHorizontal: 10,
  },
  firstpart: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  firstleftpart: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  carttxt: {
    color: Constants.white,
    fontSize: 16,
    fontFamily: FONTS.SemiBold,
  },
  cardimg: {
    height: 75,
    width: 75,
    // resizeMode: 'stretch',,
  },
  disctxt: {
    fontSize: 12,
    color: Constants.normal_green,
    fontFamily: FONTS.Medium,
    textDecorationLine: 'line-through',
  },
  productname: {
    fontSize: 16,
    color: Constants.black,
    fontFamily: FONTS.SemiBold,
    marginBottom: 5,
  },
  qty: {
    fontSize: 14,
    color: Constants.customgrey,
    fontFamily: FONTS.SemiBold,
    // marginBottom: 5,
  },
  maintxt: {
    fontSize: 14,
    color: Constants.black,
    fontFamily: FONTS.SemiBold,
  },
  addcov: {
    flexDirection: 'row',
    width: 120,
    height: 40,
    alignSelf: 'flex-end',
    // borderRadius:10
  },
  plus: {
    backgroundColor: Constants.normal_green,
    flex: 1,
    height: '100%',
    alignSelf: 'center',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    justifyContent:'center',
    alignItems:'center'
  },
  plus2: {
    backgroundColor: '#F3F3F3',
    color: Constants.black,
    flex: 1,
    textAlign: 'center',
    height: '100%',
    paddingVertical: '5%',
    fontSize: 20,
    alignSelf: 'center',
    fontFamily: FONTS.Bold,
  },
  plus3: {
    backgroundColor: Constants.normal_green,
    flex: 1,
    height: '100%',
    alignSelf: 'center',
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    justifyContent:'center',
    alignItems:'center'
  },
  btombg: {
    backgroundColor: Constants.light_green,
    // flex: 1,
    paddingBottom: 70,
  },
  totalcov: {
    backgroundColor: Constants.white,
    marginVertical: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  paycov: {
    backgroundColor: Constants.white,
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  boxtxt: {
    color: Constants.black,
    fontSize: 16,
    // fontWeight: '500',
    fontFamily: FONTS.Medium,
  },
  boxtxt2: {
    color: Constants.customgrey,
    fontSize: 16,
    // fontWeight: '500',
    fontFamily: FONTS.Medium,
    textDecorationLine: 'line-through',
  },
  total: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
    alignItems: 'center',
  },
  amount: {
    flexDirection: 'row',
    gap: 10,
  },
  line: {
    height: 1,
    backgroundColor: Constants.customgrey,
    marginVertical: 10,
  },
  buttontxt: {
    color: Constants.white,
    fontSize: 16,
    fontFamily: FONTS.SemiBold,
  },
  cartbtn: {
    height: 60,
    // width: 370,
    borderRadius: 10,
    backgroundColor: Constants.normal_green,
    // marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    // width: '90%',
    // alignSelf: 'center',
    paddingHorizontal: 20,
  },
  locationtxt: {
    color: Constants.black,
    fontSize: 16,
    fontFamily: FONTS.SemiBold,
    marginRight: 5,
    width: '55%',
  },
  changadd: {
    fontSize: 14,
    color: Constants.normal_green,
    fontFamily: FONTS.Medium,
  },
  paycovtxt: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  //////model///
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
    paddingVertical: 20,
    alignItems: 'center',
    width: '90%',
    // shadowColor: '#000',
    // shadowOffset: {
    //   width: 0,
    //   height: 2,
    // },
    // shadowOpacity: 0.25,
    // shadowRadius: 4,
    // elevation: 5,
    // position: 'relative',
    boxShadow: '7 7 0 1 #FC0965',
  },
  modalView2: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    // width: '90%',
    // height: '70%',
    marginTop: 20
  },
  txt: {
    color: Constants.black,
    fontSize: 20,
    marginVertical: 10,
    fontFamily: FONTS.Medium,
  },
  txt2: {
    color: Constants.black,
    fontSize: 16,
    marginBottom: 10,
    fontFamily: FONTS.Medium,
  },
  textStyle: {
    color: Constants.black,
    textAlign: 'center',
    fontFamily: FONTS.SemiBold,
    fontSize: 16,
    margin: 20,
    marginBottom: 10,
  },
  cancelAndLogoutButtonWrapStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 15,
  },
  modalText: {
    color: Constants.white,
    textAlign: 'center',
    fontFamily: FONTS.Bold,
    fontSize: 14,
  },
  cancelButtonStyle: {
    flex: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    marginRight: 10,
    borderColor: Constants.normal_green,
    borderWidth: 1,
    borderRadius: 10,
  },
  logOutButtonStyle: {
    flex: 0.5,
    backgroundColor: Constants.normal_green,
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    // marginLeft: 10,
  },
    logOutButtonStyle2: {
    flex: 0.5,
    borderColor: Constants.normal_green,
    borderWidth: 1,
    borderRadius: 5,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    // marginLeft: 15,
  },
  ////model end/////
  carttxt2: {
    color: Constants.black,
    fontSize: 16,
    // fontWeight: '500',
    marginVertical: 10,
    fontFamily: FONTS.SemiBold,
  },
  browsprod: {
    // flex: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderColor: Constants.normal_green,
    borderWidth: 1.5,
    borderRadius: 10,
    color: Constants.normal_green,
    fontSize: 16,
    fontFamily: FONTS.SemiBold,
  },
  dropdown: {
    height: 40,
  },
  placeholder: {
    color: Constants.black,
    fontSize: 14,
    fontFamily: FONTS.Medium,
    // paddingVertical:12
  },
  selectedText: {
    color: Constants.black,
    fontSize: 16,
    fontFamily: FONTS.Medium,
    // paddingVertical:12,
  },
  itemText: {
    fontSize: 14,
    color: Constants.white,
    fontFamily: FONTS.Medium,
  },
  itemContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Constants.violet,
    
  },
  clear: {
    fontSize: 14,
    color: Constants.normal_green,
    fontFamily: FONTS.Medium,
    textAlign:'right',
    marginTop:-10
  },
   tipamt: {
    color: Constants.customgrey2,
    fontSize: 16,
    fontFamily: FONTS.Medium,
    borderWidth: 1.5,
    borderColor: Constants.customgrey2,
    borderRadius: 10,
    paddingHorizontal: 23,
    paddingTop: 7,
    paddingBottom: 3,
    marginLeft: 10,
  },
  tipcur: {
    color: Constants.normal_green,
    fontSize: 14,
    fontFamily: FONTS.Medium,
    alignSelf: 'center',
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
    fontSize: 16,
    // lineHeight: 10,
    fontFamily: FONTS.Medium,
    // borderBottomWidth:1.5,
    // borderColor: Constants.normal_green,
    height: 40,
    paddingVertical: 0,
    // marginBottom:7,
    // minWidth: 30,
  },
  tipamt2: {
    borderWidth: 1.5,
    borderColor: Constants.normal_green,
    borderRadius: 10,
    paddingHorizontal: 23,
    // paddingVertical:10,
    marginLeft: 10,
    flexDirection: 'row',
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
    backgroundColor: '#F5F5FF',
    borderRadius: 10,
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
    backgroundColor:Constants.white,
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
  tiptxt1: {
    fontSize: 16,
    color: Constants.customgrey,
    fontFamily: FONTS.Medium,
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
  btntxt: {
    fontSize: 16,
    color: Constants.white,
    fontFamily: FONTS.SemiBold,
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
