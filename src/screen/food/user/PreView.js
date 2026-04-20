import {
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useContext, useEffect, useState} from 'react';
import Constants, {Currency, FONTS} from '../../../Assets/Helpers/constant';
import {
  BackIcon,
  Cart2Icon,
  Clock2Icon,
  Location2Icon,
  MinusIcon,
  PlusIcon,
  RightArrow,
  StarIcon,
  UnfavIcon,
} from '../../../../Theme';
import {goBack, navigate} from '../../../../navigationRef';
import {GetApi, Post} from '../../../Assets/Helpers/Service';
import {
  FoodCartContext,
  LoadContext,
  UserContext,
} from '../../../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTranslation} from 'react-i18next';
import {SwiperFlatList} from 'react-native-swiper-flatlist';

const {width, height} = Dimensions.get('window');
const IMG_HEIGHT = height * 0.32;

/* ── MostOrderedCard ───────────────────────────────────────────────── */
// qty is derived from foodcartdetail on every render — no local state needed
// so that updates from the parent context are always reflected immediately.
const MostOrderedCard = ({item, foodcartdetail, setfoodcartdetail, Currency, t}) => {
  // Always derive from the live prop, never local state
  const qty = foodcartdetail.find(f => f.foodid === item._id)?.qty || 0;

  const buildNewCartItem = () => ({
    foodid: item._id,
    foodname: item.name,
    price: item.price,
    image: item.image?.[0],
    qty: 1,
    seller_id: item.sellerid,
    seller_name: item.seller_profile?.store_name || '',
    seller_profile: item.seller_profile?._id || item.seller_profile,
    seller_location: item.seller_profile?.location,
  });

  const add = async () => {
    const existing = foodcartdetail.find(f => f.foodid === item._id);
    let updated;
    if (existing) {
      updated = foodcartdetail.map(f =>
        f.foodid === item._id ? {...f, qty: f.qty + 1} : f,
      );
    } else {
      updated = [...foodcartdetail, buildNewCartItem()];
    }
    setfoodcartdetail(updated);
    await AsyncStorage.setItem('foodcartdata', JSON.stringify(updated));
  };

  const decrease = async () => {
    let updated;
    if (qty > 1) {
      updated = foodcartdetail.map(f =>
        f.foodid === item._id ? {...f, qty: f.qty - 1} : f,
      );
    } else {
      updated = foodcartdetail.filter(f => f.foodid !== item._id);
    }
    setfoodcartdetail(updated);
    await AsyncStorage.setItem('foodcartdata', JSON.stringify(updated));
  };

  return (
    <TouchableOpacity
      style={styles.productCard}
      activeOpacity={0.8}
      onPress={() => navigate('PreView', item._id)}>
      <View style={styles.productLeft}>
        {/* <View style={[styles.vegIndicator, {borderColor: '#2ECC71'}]}>
          <View style={[styles.vegDot, {backgroundColor: '#2ECC71'}]} />
        </View> */}
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.discountedPrice}>{Currency} {item.price}</Text>
          {item.original_price ? (
            <Text style={styles.originalPrice}>{Currency} {item.original_price}</Text>
          ) : null}
        </View>
        {item.averageRating ? (
          <View style={styles.miniRatingRow}>
            <StarIcon color={Constants.normal_green} width={11} height={11} />
            <Text style={styles.miniRatingText}>{item.averageRating}</Text>
            {item.totalReviews > 0 && (
              <Text style={styles.miniRatingCount}>({item.totalReviews})</Text>
            )}
          </View>
        ) : null}
        <Text style={styles.productDesc} numberOfLines={2}>{item.description}</Text>
        
      </View>
      <View style={styles.productRight}>
        {item.discount ? (
          <View style={styles.discountBadge}>
            <Text style={styles.discountBadgeText}>{item.discount}% OFF</Text>
          </View>
        ) : null}
        <Image
          source={item.image?.[0] ? {uri: item.image[0]} : require('../../../Assets/Images/barger3.png')}
          style={styles.productImg}
          resizeMode="cover"
        />
        <View style={styles.addbtn}>
          {qty > 0 ? (
          <View style={styles.stepper}>
            <TouchableOpacity style={styles.stepperBtn} onPress={decrease}>
              <MinusIcon color={Constants.normal_green} width={14} height={14} />
            </TouchableOpacity>
            <Text style={styles.stepperQty}>{qty}</Text>
            <TouchableOpacity style={styles.stepperBtn} onPress={add}>
              <PlusIcon color={Constants.normal_green} width={14} height={14} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.addBtn} onPress={add}>
            <Text style={styles.addBtnText}>+ {t('ADD')}</Text>
          </TouchableOpacity>
        )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const PreView = props => {
  const {t} = useTranslation();
  const food_id = props?.route?.params;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [, setLoading] = useContext(LoadContext);
  const [foodcartdetail, setfoodcartdetail] = useContext(FoodCartContext);
  const [user] = useContext(UserContext);
  const [productdata, setproductdata] = useState();
  const [mostOrdered, setMostOrdered] = useState([]);

  // Derived — always in sync with the live cart context, no useEffect needed
  const availableQty =
    foodcartdetail.find(f => f.foodid === productdata?._id)?.qty || 0;

  useEffect(() => {
    if (food_id) getProductById();
  }, []);

  const getProductById = () => {
    setLoading(true);
    GetApi(`getFoodById/${food_id}?userId=${user?._id}`).then(
      async res => {
        setLoading(false);
        console.log('food by id', res);
        if (res.status) {
          setproductdata(res.data);
          // fetch most ordered items from same seller once we have seller id
          const sellerId = res.data?.sellerid;
          if (sellerId) {
            GetApi(
              `getTopFoodBySeller/${sellerId}?excludeIds=${food_id}&limit=10&userId=${user?._id}`,
            ).then(
              r => { if (r.status) setMostOrdered(r.data);console.log('most ordered', r); },
              err => console.log('mostOrdered err', err),
            );
          }
        }
      },
      err => {
        setLoading(false);
        console.log(err);
      },
    );
  };

  const togglefav = id => {
    setLoading(true);
    Post(`togglefavorite`, {foodid: id}).then(
      () => {
        setLoading(false);
        getProductById();
      },
      err => {
        setLoading(false);
        console.log(err);
      },
    );
  };

  /* ── Cart helpers ── */
  // availableQty is derived from foodcartdetail, so just updating
  // the context is enough — no setAvailableQty calls needed anywhere.

  const buildCartItem = qty => ({
    foodid: productdata._id,
    foodname: productdata.name,
    price: productdata.price,
    image: productdata.image?.[0],
    qty,
    seller_id: productdata.sellerid,
    seller_name: productdata?.seller_profile?.store_name || '',
    seller_profile: productdata?.seller_profile?._id,
    seller_location: productdata?.seller_profile?.location,
  });

  const cartdata = async () => {
    const existingCart = Array.isArray(foodcartdetail) ? foodcartdetail : [];
    const existingProduct = existingCart.find(f => f.foodid === productdata._id);
    // Different seller → clear cart and add this item
    if (existingCart.length > 0 && productdata.sellerid !== existingCart[0].seller_id) {
      const updatedCart = [buildCartItem(1)];
      setfoodcartdetail(updatedCart);
      await AsyncStorage.setItem('foodcartdata', JSON.stringify(updatedCart));
      return;
    }
    // New item from same seller
    if (!existingProduct) {
      const updatedCart = [...existingCart, buildCartItem(1)];
      setfoodcartdetail(updatedCart);
      await AsyncStorage.setItem('foodcartdata', JSON.stringify(updatedCart));
    }
  };

  const decreaseQty = async () => {
    let updatedCart;
    if (availableQty > 1) {
      updatedCart = foodcartdetail.map(item =>
        item.foodid === productdata?._id ? {...item, qty: item.qty - 1} : item,
      );
    } else {
      updatedCart = foodcartdetail.filter(item => item.foodid !== productdata?._id);
    }
    setfoodcartdetail(updatedCart);
    await AsyncStorage.setItem('foodcartdata', JSON.stringify(updatedCart));
  };

  const increaseQty = async () => {
    const updatedCart = foodcartdetail.map(item =>
      item.foodid === productdata?._id ? {...item, qty: item.qty + 1} : item,
    );
    setfoodcartdetail(updatedCart);
    await AsyncStorage.setItem('foodcartdata', JSON.stringify(updatedCart));
  };

  /* ── Dot pagination ── */
  const Dots = ({count, active}) => (
    <View style={styles.dotsRow}>
      {Array.from({length: count}).map((_, i) => (
        <View
          key={i}
          style={[styles.dot, i === active && styles.dotActive]}
        />
      ))}
    </View>
  );

  const totalCartItems = foodcartdetail.reduce(
    (sum, item) => sum + (item.qty || 0),
    0,
  );

  const images = productdata?.image || [];
  const rating = productdata?.averageRating
    ? Number(productdata.averageRating).toFixed(1)
    : null;
  const totalReviews = productdata?.totalReviews || 0;
  const sellerName =
    productdata?.seller_profile?.store_name || productdata?.name || '';
  const distance = '3 km';
  const area = productdata?.seller_profile?.address || 'Nearby';
  const deliveryTime = '25-30 mins';

  return (
    <View style={styles.root}>

      {/* ── Hero Image ── */}
      <View style={styles.imgContainer}>
        {images.length > 0 ? (
          <>
            <SwiperFlatList
              data={images}
              onChangeIndex={({index}) => setCurrentIndex(index)}
              renderItem={({item}) => (
                <Image
                  source={{uri: item}}
                  style={styles.heroImg}
                  resizeMode="cover"
                />
              )}
            />
            {images.length > 1 && (
              <Dots count={images.length} active={currentIndex} />
            )}
          </>
        ) : (
          <View style={[styles.heroImg, styles.imgPlaceholder]} />
        )}

        {/* Floating back button */}
        <View style={styles.headerOverlay}>
          <TouchableOpacity style={styles.backBtn} onPress={() => goBack()}>
            <BackIcon color={Constants.white} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.favBtnHero}
            onPress={() => togglefav(productdata?._id)}>
            <UnfavIcon
              color={productdata?.isFavorite ? '#F14141' : 'rgba(0,0,0,0.35)'}
              width={20}
              height={20}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── White Info Panel ── */}
      <ScrollView
        style={styles.panel}
        contentContainerStyle={styles.panelContent}
        showsVerticalScrollIndicator={false}
        bounces={false}>

        {/* Restaurant name row */}
          <Text style={styles.restaurantName} numberOfLines={1}>
            {productdata?.name}
          </Text>
          <Text style={styles.restaurantName2} numberOfLines={1}>
            {sellerName}
          </Text>

        <View style={styles.nameRow}>
          {rating && (
            <View style={styles.ratingBadge}>
              <StarIcon color={Constants.white} width={12} height={12} />
              <Text style={styles.ratingText}>{rating}</Text>
            </View>
          )}
        {totalReviews > 0 && (
          <Text style={styles.reviewCount}>
            {t('By')} {totalReviews}+ {t('people')}
          </Text>
        )}
        </View>

        {/* Info row */}
        <View style={styles.infoRow}>
         
          <View style={styles.iconCov}>
          <Location2Icon
            color={Constants.black}
            width={14}
            height={14}
          />
          </View>
          <Text style={[styles.infoText,{width: '95%',}]}>
            {distance} · {area}
          </Text>
        </View>

           <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
            <View style={styles.infoRow}>
          <View style={styles.iconCov}>
          <Clock2Icon color={Constants.black} width={14} height={14} />
          </View>
          <Text style={styles.infoText}>{deliveryTime}</Text>
          </View>
          <TouchableOpacity style={styles.scheduleBtn}>
            <Text style={styles.scheduleTxt}>{t('Schedule for later')}</Text>
          </TouchableOpacity>
          </View>

        {/* Price + offer row */}
        <View style={styles.offerRow}>
          <Text style={styles.startingPrice}>
          {Currency}{' '}
            {productdata?.price}
          </Text>
          {/* <TouchableOpacity style={styles.offerChip}>
            <Text style={styles.offerChipText}>
              {productdata?.offers || '7'} {t('Offer')} ▾
            </Text>
          </TouchableOpacity> */}
        </View>


          <Text style={styles.dectxt}>
            {productdata?.description}
          </Text>

        {/* ── Add to cart / Qty stepper for the main product ── */}
        <View style={styles.addCartRow}>
          {availableQty > 0 ? (
            <View style={styles.stepper}>
              <TouchableOpacity style={styles.stepperBtn} onPress={decreaseQty}>
                <MinusIcon color={Constants.normal_green} width={16} height={16} />
              </TouchableOpacity>
              <Text style={styles.stepperQty}>{availableQty}</Text>
              <TouchableOpacity style={styles.stepperBtn} onPress={increaseQty}>
                <PlusIcon color={Constants.normal_green} width={16} height={16} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.addCartBtn} onPress={cartdata}>
              <Cart2Icon color={Constants.white} width={16} height={16} />
              <Text style={styles.addCartBtnText}>{t('Add to Cart')}</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.divider} />

        {/* Most ordered together section — only shown when there are items */}
        {mostOrdered.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('Most ordered together')}</Text>
            </View>
            {mostOrdered.map(item => (
              <MostOrderedCard
                key={item._id}
                item={item}
                foodcartdetail={foodcartdetail}
                setfoodcartdetail={setfoodcartdetail}
                Currency={Currency}
                t={t}
              />
            ))}
          </>
        )}


        {/* Bottom spacer for sticky bar */}
        <View style={{height: 90}} />
      </ScrollView>

      {/* ── Sticky Cart Bar ── */}
      {totalCartItems > 0 && (
        <View style={styles.cartBar}>
          <View style={styles.cartBarLeft}>
            <Cart2Icon color={Constants.white} width={18} height={18} />
            <Text style={styles.cartBarItemCount}>
              {totalCartItems} {totalCartItems === 1 ? t('item') : t('items')}{' '}
              {t('added')}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.viewtxt}
            onPress={() => navigate('Foodtab', {screen: 'Cart'})}>
            <Text style={styles.viewCartTxt}>{t('View Cart')} </Text>
            <RightArrow color='#fff'  />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default PreView;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Constants.white,
  },

  /* ── Hero image ── */
  imgContainer: {
    height: IMG_HEIGHT,
    width: '100%',
    backgroundColor: Constants.customgrey4,
  },
  heroImg: {
    width,
    height: IMG_HEIGHT,
  },
  imgPlaceholder: {
    backgroundColor: Constants.customgrey5,
  },
  dotsRow: {
    position: 'absolute',
    bottom: 14,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  iconCov:{
    padding:4,
    borderRadius:12,
    backgroundColor:Constants.customgrey5,
     justifyContent:'center',
     alignItems:'center'
  },
  dotActive: {
    backgroundColor: Constants.white,
    width: 18,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favBtnHero: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* ── White info panel ── */
  panel: {
    flex: 1,
    backgroundColor: Constants.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -32,
  },
  panelContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  /* ── Restaurant header ── */
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  restaurantName: {
    fontSize: 18,
    fontFamily: FONTS.Bold,
    color: Constants.dark_green,
    flex: 1,
    marginRight: 10,
  },
  restaurantName2: {
    fontSize: 14,
    fontFamily: FONTS.SemiBold,
    color: Constants.customgrey,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Constants.normal_green,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontFamily: FONTS.SemiBold,
    color: Constants.white,
  },
  reviewCount: {
    fontSize: 12,
    fontFamily: FONTS.Regular,
    color: Constants.customgrey3,
    // marginBottom: 12,
  },

  /* ── Info row ── */
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 12,
    fontFamily: FONTS.Regular,
    color: Constants.customgrey,
  },
  scheduleBtn: {
    marginLeft: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: Constants.light_green,
  },
  scheduleTxt: {
    fontSize: 11,
    fontFamily: FONTS.SemiBold,
    color: Constants.normal_green,
  },
  dectxt: {
    fontSize: 12,
    fontFamily: FONTS.Medium,
    color: Constants.black,
  },

  /* ── Offer row ── */
  offerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  startingPrice: {
    fontSize: 16,
    fontFamily: FONTS.Bold,
    color: Constants.normal_green,
  },
  offerChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: '#FFF3E0',
  },
  offerChipText: {
    fontSize: 12,
    fontFamily: FONTS.SemiBold,
    color: '#E67E22',
  },

  divider: {
    height: 1,
    backgroundColor: Constants.customgrey5,
    marginVertical: 12,
  },

  /* ── Filters ── */
  filterRow: {
    gap: 8,
    paddingVertical: 4,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Constants.customgrey5,
    backgroundColor: Constants.white,
    marginRight: 8,
  },
  filterChipActive: {
    borderColor: Constants.dark_green,
    backgroundColor: Constants.light_green,
  },
  filterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  filterChipText: {
    fontSize: 13,
    fontFamily: FONTS.Medium,
    color: Constants.customgrey2,
  },
  filterChipTextActive: {
    color: Constants.dark_green,
  },

  /* ── Section header ── */
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: FONTS.SemiBold,
    color: Constants.dark_green,
  },
  offerTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: '#E8F8EF',
  },
  offerTagText: {
    fontSize: 11,
    fontFamily: FONTS.SemiBold,
    color: Constants.normal_green,
  },

  /* ── Product card ── */
  productCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 14,
    // borderTopWidth: 1,
    // borderTopColor: Constants.customgrey5,
    paddingBottom: 24,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
    boxShadow: '0px 0px 5px 0.2px rgba(0,0,0,0.1)',
  },
  productLeft: {
    flex: 1,
  },
  vegIndicator: {
    width: 16,
    height: 16,
    borderRadius: 2,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  vegDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  productName: {
    fontSize: 17,
    fontFamily: FONTS.SemiBold,
    color: Constants.dark_green,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 5,
  },
  discountedPrice: {
    fontSize: 16,
    fontFamily: FONTS.SemiBold,
    color: Constants.black,
  },
  originalPrice: {
    fontSize: 13,
    fontFamily: FONTS.Regular,
    color: Constants.customgrey2,
    textDecorationLine: 'line-through',
  },
  productDesc: {
    fontSize: 12,
    fontFamily: FONTS.Regular,
    color: Constants.customgrey2,
    lineHeight: 18,
    marginBottom: 12,
  },
  addBtn: {
    borderWidth: 1,
    borderColor: '#2C61401A',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    backgroundColor: Constants.white,
    boxShadow : '0px 1px 3px 0.2px rgba(0,0,0,0.1)',
  },
  addBtnText: {
    fontSize: 14,
    fontFamily: FONTS.Bold,
    color: Constants.normal_green,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    alignSelf: 'flex-start',
    overflow: 'hidden',
    backgroundColor: Constants.white,
    borderWidth: 1,
    borderColor: '#2C61401A',
    boxShadow: '0px 0px 2px 0.2px rgba(0,0,0,0.1)',
  },
  stepperBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  stepperQty: {
    fontSize: 14,
    fontFamily: FONTS.SemiBold,
    color: Constants.normal_green,
    // minWidth: 28,
    textAlign: 'center',
  },
  addbtn:{
    position:'absolute',
    bottom: -12,
    zIndex: 99,
  },
  productRight: {
    width: 110,
    alignItems: 'center',
  },
  discountBadge: {
    backgroundColor: Constants.normal_green,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 6,
    alignSelf: 'center',
  },
  discountBadgeText: {
    fontSize: 11,
    fontFamily: FONTS.Bold,
    color: Constants.white,
  },
  productImg: {
    width: 110,
    height: 100,
    borderRadius: 12,
  },

  /* ── Sticky cart bar ── */
  cartBar: {
    position: 'absolute',
    bottom: 10,
    backgroundColor: Constants.dark_green,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    // paddingBottom: Platform.OS === 'ios' ? 28 : 14,
    width: '90%',
    alignSelf:'center',
    borderRadius: 30,
  },
  cartBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cartBarItemCount: {
    fontSize: 14,
    fontFamily: FONTS.Medium,
    color: Constants.white,
  },
  // viewCartBtn: {
  //   backgroundColor: Constants.normal_green,
  //   paddingHorizontal: 18,
  //   paddingVertical: 8,
  //   borderRadius: 20,
  // },
  viewCartTxt: {
    fontSize: 14,
    fontFamily: FONTS.SemiBold,
    color: Constants.white,
  },
  addCartRow: {
    marginTop: 16,
    marginBottom: 4,
    alignItems: 'flex-start',
  },
  addCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Constants.normal_green,
    paddingHorizontal: 24,
    paddingVertical: 11,
    borderRadius: 10,
  },
  addCartBtnText: {
    fontSize: 15,
    fontFamily: FONTS.SemiBold,
    color: Constants.white,
  },
  miniRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 4,
  },
  miniRatingText: {
    fontSize: 12,
    fontFamily: FONTS.SemiBold,
    color: Constants.normal_green,
  },
  miniRatingCount: {
    fontSize: 11,
    fontFamily: FONTS.Regular,
    color: Constants.customgrey2,
  },
  viewtxt:{
    alignItems:'center',
    gap:5,
    flexDirection:'row',
    // backgroundColor: Constants.normal_green,
  },
  
});
