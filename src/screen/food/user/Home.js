import {
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  Switch,
  ImageBackground,
  Pressable,
} from 'react-native';
import React, {useContext, useEffect, useRef, useState} from 'react';
import Constants, {Currency, FONTS} from '../../../Assets/Helpers/constant';
import {
  DownarrowIcon,
  Location2Icon,
  NotificationIcon,
  SearchIcon,
  StarIcon,
  ClockIcon,
  UnfavIcon,
  Notification2Icon,
} from '../../../../Theme';
import {navigate} from '../../../../navigationRef';
import {GetApi, Post} from '../../../Assets/Helpers/Service';
import {
  AddressContext,
  FoodUserContext,
  LoadContext,
  LocationDataContext,
  ToastContext,
  UserContext,
} from '../../../../App';
import {useTranslation} from 'react-i18next';
import TranslateHandled from '../../../Assets/Component/TranslateHandled';

const {width} = Dimensions.get('window');

// Filter chips matching the screenshot
const FILTERS = ['Near & Fast', 'New to you', 'Grofers', 'Veg'];

// ── ImageCarousel ────────────────────────────────────────────────────
// Plain ScrollView — owns all horizontal gestures natively.
// onTap is called only when the ScrollView did NOT claim the gesture
// (i.e. a real tap with no horizontal movement).
const ImageCarousel = ({images, hasDiscount, isFreeDelivery, item, onToggleFav, onTap}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imgWidth, setImgWidth] = useState(0);
  const tapCancelled = useRef(false);

  const onMomentumScrollEnd = e => {
    if (imgWidth === 0) return;
    const index = Math.round(e.nativeEvent.contentOffset.x / imgWidth);
    setCurrentIndex(index);
  };

  return (
    <View
      style={styles.cardImgWrap}
      onPress={()=>{onTap()}}
      onLayout={e => {
        const w = e.nativeEvent.layout.width;
        if (w > 0) setImgWidth(w);
      }}>
      {imgWidth > 0 && (
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onMomentumScrollEnd}
          decelerationRate="fast"
          bounces={false}
          disableIntervalMomentum
          scrollEventThrottle={16}>
          {images.map((uri, i) => (
            <Image
              key={i}
              source={uri ? {uri} : undefined}
              style={[styles.cardImg, {width: imgWidth}]}
              resizeMode="cover"
            />
          ))}
        </ScrollView>
      )}

      {hasDiscount ? (
        <View style={styles.offerBadge}>
          <Text style={styles.offerBadgeText}>{item.discount}% OFF</Text>
        </View>
      ) : isFreeDelivery ? (
        <View style={[styles.offerBadge, styles.freeBadge]}>
          <Text style={styles.offerBadgeText}>FREE{'\n'}DELIVERY</Text>
        </View>
      ) : null}

      <View style={styles.deliveryPill}>
        <Text style={styles.deliveryPillText}>
          ⚡ {item?.delivery_time || '35-40 mins'} | {item?.distance || '1 KM'}
        </Text>
      </View>

      {images.length > 1 && (
        <View style={styles.swiperDots}>
          {images.map((_, i) => (
            <View
              key={i}
              style={[
                styles.swiperDot,
                i === currentIndex && styles.swiperDotActive,
              ]}
            />
          ))}
        </View>
      )}

      {/* Fav button has its own responder — doesn't bubble to onTouchEnd */}
      <TouchableOpacity
        style={styles.favBtn}
        onPressIn={() => { tapCancelled.current = true; }}
        onPress={() => onToggleFav(item?._id)}>
        <UnfavIcon
          color={item?.isFavorite ? '#F14141' : 'rgba(0,0,0,0.35)'}
          width={16}
          height={16}
        />
      </TouchableOpacity>
    </View>
  );
};

// ── RestaurantCard ───────────────────────────────────────────────────
// Outer wrapper is a plain View — no touch handler competes with the
// ScrollView inside ImageCarousel.
const RestaurantCard = ({item, onToggleFav}) => {
  const images = Array.isArray(item?.image)
    ? item.image.filter(Boolean)
    : [item?.image].filter(Boolean);

  const goToPreview = () => navigate('PreView', item?._id);

  return (
    <Pressable style={styles.card} onPress={goToPreview}>
      <ImageCarousel
        images={images.length > 0 ? images : ['']}
        hasDiscount={item?.discount}
        isFreeDelivery={item?.free_delivery}
        item={item}
        onToggleFav={onToggleFav}
        onTap={goToPreview}
      />

      {/* Tapping the info section also navigates */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={goToPreview}
        style={styles.cardInfo}>
        <View style={styles.cardRow}>
          <Text style={styles.cardName} numberOfLines={1}>
            {item?.name}
          </Text>
          <View style={styles.ratingBadge}>
            <StarIcon color="#fff" width={12} height={12} />
            <Text style={styles.ratingText}>
              {item?.rating ? Number(item.rating).toFixed(1) : '4.0'}
            </Text>
          </View>
        </View>

        <Text style={styles.cardCategory} numberOfLines={1}>
          {[
            item?.category?.name,
            item?.seller_profile?.store_name,
            item?.price ? `${Currency} ${item.price}` : null,
          ]
            .filter(Boolean)
            .join(' • ')}
        </Text>

        {item?.promo_text && (
          <View style={styles.promoRow}>
            <Text style={styles.promoIcon}>✅</Text>
            <Text style={styles.promoText} numberOfLines={1}>
              {item.promo_text}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </Pressable>
  );
};

// ── Home ─────────────────────────────────────────────────────────────
const Home = () => {
  const {t} = useTranslation();
  const [selectcat, setSelectcat] = useState();
  const [toast, setToast] = useContext(ToastContext);
  const [loading, setLoading] = useContext(LoadContext);
  const [locationadd, setlocationadd] = useContext(AddressContext);
  const [fooduserProfile, setfooduserProfile] = useContext(FoodUserContext);
  const [user, setUser] = useContext(UserContext);
  const [latlong] = useContext(LocationDataContext);
  const [page, setPage] = useState(1);
  const [curentData, setCurrentData] = useState([]);
  const [productlist, setproductlist] = useState();
  const [catlist, setcatlist] = useState([]);
  const [vegMode, setVegMode] = useState(false);

  useEffect(() => {
    getcategory();
  }, []);

  const getcategory = () => {
    setLoading(true);
    GetApi(`getFoodCategory`).then(
      async res => {
        setLoading(false);
        setcatlist(res.data);
        if (res.data && res.data.length > 0) {
          setSelectcat(res.data[0]._id);
          getProduct(1, res.data[0]._id);
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
    const data = {foodid: id};
    Post(`togglefavorite`, data).then(
      async res => {
        setLoading(false);
        getProduct(page, selectcat);
      },
      err => {
        setLoading(false);
        console.log(err);
      },
    );
  };

  const getProduct = (p, params) => {
    setPage(p);
    setLoading(true);
    const coords =
      fooduserProfile?.shipping_address?.location?.coordinates?.length === 2
        ? {
            lat: fooduserProfile.shipping_address.location.coordinates[1],
            lng: fooduserProfile.shipping_address.location.coordinates[0],
          }
        : latlong?.latitude
        ? {lat: latlong.latitude, lng: latlong.longitude}
        : {};
    const locationQuery =
      coords.lat != null ? `&lat=${coords.lat}&lng=${coords.lng}` : '';
    GetApi(
      `getFoodbycategory/${params}?page=${p}&userId=${user?._id}${locationQuery}`,
    ).then(
      async res => {
        setLoading(false);
        console.log("res.data", res.data);
        setCurrentData(res.data);
        if (p === 1) {
          setproductlist(res.data);
        } else {
          setproductlist([...productlist, ...res.data]);
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
      getProduct(page + 1, selectcat);
    }
  };

  const locationLabel = fooduserProfile?.shipping_address?.address
    ? `${fooduserProfile?.shipping_address?.house_no}, ${fooduserProfile?.shipping_address?.address}`
    : locationadd || 'Home';

  // ── Header ──────────────────────────────────────────────────────
  const renderHeader = () => (
    <View>

      {/* ── Top Bar ── */}
      <ImageBackground source={require('../../../Assets/Images/foodbaner.png')}
          style={styles.bannerImg}>
            <View style={{backgroundColor:'rgba(100, 116, 139, 0.24)',paddingTop:15}}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.locationRow}
          onPress={() => navigate('Shipping')}>
          <View style={styles.locationTextWrap}>
            <View style={styles.locationNameRow}>
          <Location2Icon color="#fff" width={18} height={18} />
              <Text style={styles.locationName} numberOfLines={1}>
                {fooduserProfile?.shipping_address?.address
                  ? fooduserProfile?.shipping_address?.house_no?.split(' ')[0] ||
                    'Home'
                  : 'Home'}
              </Text>
              <DownarrowIcon color="#fff" width={14} height={14} />
            </View>
            <Text style={styles.locationSub} numberOfLines={1}>
              {locationLabel}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Right icons */}
        <View style={styles.topRightIcons}>
          <TouchableOpacity
            style={styles.iconCircle}
            onPress={() => navigate('FoodUserNotification')}>
            <Notification2Icon color="#3D3D3D" width={20} height={20} />
          </TouchableOpacity>
          {/* Profile avatar / placeholder */}
          <TouchableOpacity
            style={styles.avatarCircle}
            onPress={() => navigate('Profile')}>
            <Text style={styles.avatarText}>P</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Search Bar + Veg Mode ── */}
      <View style={styles.searchRow}>
        <TouchableOpacity
          style={styles.searchBar}
          activeOpacity={0.8}
          onPress={() => navigate('SearchPage')}>
          <SearchIcon color={Constants.customgrey} width={18} height={18} />
          <Text style={styles.searchPlaceholder}>
            {t('Search \'thali\'')}
          </Text>

        </TouchableOpacity>

        {/* Veg Mode toggle */}
        <View style={styles.vegModeBox}>
          <Text style={styles.vegModeLabel}>VEG{'\n'}MODE</Text>
          <Switch
            value={vegMode}
            onValueChange={setVegMode}
            trackColor={{false: '#ddd', true: '#2e7d32'}}
            thumbColor={vegMode ? '#fff' : '#fff'}
            style={{transform: [{scaleX: 0.7}, {scaleY: 0.7}]}}
          />
        </View>
      </View>
      </View>
       <View style={styles.bannerOverlay}>
          <Text style={styles.bannerTitle}>{t('MEALS UNDER $250')}</Text>
          <View style={styles.bannerBadge}>
            <Text style={styles.bannerBadgeText}>
              {t('FINAL PRICE, BEST OFFER APPLIED')}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.bannerBtn}
            onPress={() => navigate('FoodCategories')}>
            <Text style={styles.bannerBtnText}>{t('Order now')} →</Text>
          </TouchableOpacity>
        </View>
        </ImageBackground>


      {/* ── Category Tabs ── */}
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>{t('Find by Category')}</Text>
        <Text style={styles.seeAll} onPress={() => navigate('FoodCategories')}>
          {t('See all')}
        </Text>
      </View>

      <FlatList
        data={catlist}
        horizontal
        keyExtractor={(item, index) => index.toString()}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.catList}
        renderItem={({item}) => {
          // if (item.isExplore) {
          //   return (
          //     <TouchableOpacity
          //       style={styles.exploreTab}
          //       onPress={() => navigate('FoodCategories')}>
          //       <View style={styles.exploreImgWrap}>
          //         <Text style={styles.exploreEmoji}>🍽️</Text>
          //       </View>
          //       <Text style={styles.exploreLabel}>Explore {'>'}</Text>
          //     </TouchableOpacity>
          //   );
          // }
          const isActive = selectcat === item._id;
          return (
            <TouchableOpacity
              style={[styles.catTab, isActive && styles.catTabActive]}
              onPress={() => {
                setSelectcat(item._id);
                getProduct(1, item._id);
              }}>
              <Image
                source={{uri: item?.image}}
                style={styles.catIcon}
                resizeMode="contain"
              />
              <Text
                style={[styles.catLabel, isActive && styles.catLabelActive]}
                numberOfLines={1}>
                <TranslateHandled text={item?.name} />
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* ── Filter Chips ── */}
      {/* <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterList}>
        <TouchableOpacity style={styles.filterIconBtn}>
          <Text style={styles.filterIconText}>▼ Filters</Text>
        </TouchableOpacity>
        {FILTERS.map(filter => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterChip,
              activeFilter === filter && styles.filterChipActive,
            ]}
            onPress={() => setActiveFilter(filter)}>
            {activeFilter === filter && (
              <Text style={styles.filterChipDot}>+ </Text>
            )}
            <Text
              style={[
                styles.filterChipText,
                activeFilter === filter && styles.filterChipTextActive,
              ]}>
              {t(filter)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView> */}

      {/* ── Recommended Section Header ── */}
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>{t('RECOMMENDED FOR YOU')}</Text>
      </View>
    </View>
  );

  // ── Restaurant Card ──────────────────────────────────────────────
  const renderRestaurantCard = ({item}) => (
    <RestaurantCard item={item} onToggleFav={togglefav} />
  );

  // ── Main Render ──────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={productlist}
        keyExtractor={(item, index) => index.toString()}
        ListHeaderComponent={renderHeader}
        renderItem={renderRestaurantCard}
        contentContainerStyle={styles.listContent}
        onEndReached={() => {
          if (productlist && productlist.length > 0) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.05}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default Home;

// ── Styles ─────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.white,
  },
  listContent: {
    paddingBottom: 20,
  },

  /* ── Top Bar ── */
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
    // backgroundColor: '#fff',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 6,
  },
  locationTextWrap: {
    flex: 1,
  },
  locationNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationName: {
    fontSize: 16,
    fontFamily: FONTS.SemiBold,
    color: Constants.white,
  },
  locationSub: {
    fontSize: 11,
    fontFamily: FONTS.Regular,
    color: Constants.white,
    maxWidth: width * 0.5,
  },
  topRightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9CC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9CC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#3D3D3D',
    fontSize: 15,
    fontFamily: FONTS.Bold,
  },

  /* ── Search Row ── */
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    // paddingVertical: 10,
    // backgroundColor: '#fff',
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFFDE',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    gap: 8,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.Regular,
    color: Constants.customgrey,
  },
  micIcon: {
    paddingLeft: 4,
  },
  vegModeBox: {
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
    minWidth: 58,
  },
  vegModeLabel: {
    fontSize: 9,
    fontFamily: FONTS.Bold,
    color: Constants.black,
    textAlign: 'center',
    letterSpacing: 0.5,
  },

  /* ── Banner ── */
  bannerWrap: {
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    height: 160,
  },
  bannerImg: {
    width: '100%',
    paddingBottom:15,
    // height: 300,
  },
  bannerOverlay: {
    flex: 1,
    paddingLeft: 18,
    // justifyContent: 'center',
    // backgroundColor: 'rgba(0,0,0,0.32)',
  },
  bannerTitle: {
    fontSize: 20,
    fontFamily: FONTS.SemiBold,
    color: '#fff',
    lineHeight: 20,
    marginBottom: 8,
  },
  bannerBadge: {
    backgroundColor: '#2e7d32',
    alignSelf: 'flex-start',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 10,
  },
  bannerBadgeText: {
    fontSize: 9,
    fontFamily: FONTS.SemiBold,
    color: '#fff',
    letterSpacing: 0.4,
    lineHeight: 16
  },
  bannerBtn: {
    backgroundColor: '#FFFFFF54',
    alignSelf: 'flex-start',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  bannerBtnText: {
    fontSize: 13,
    fontFamily: FONTS.SemiBold,
    color: Constants.white,
  },
  bannerDots: {
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 4,
    left: 0,
    right: 0,
    justifyContent: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotActive: {
    backgroundColor: '#fff',
    width: 18,
  },

  /* ── Section Row ── */
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: FONTS.Bold,
    color: '#111',
    letterSpacing: 0.2,
  },
  seeAll: {
    fontSize: 13,
    fontFamily: FONTS.Medium,
    color: '#2e7d32',
  },

  /* ── Category Tabs ── */
  catList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  exploreTab: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  exploreImgWrap: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#e8f5e9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  exploreEmoji: {
    fontSize: 24,
  },
  exploreLabel: {
    fontSize: 11,
    fontFamily: FONTS.Medium,
    color: '#2e7d32',
  },
  catTab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    // borderRadius: 30,
    // backgroundColor: '#fff',
    // flexDirection: 'row',
    gap: 6,
    // elevation: 1,
    // shadowColor: '#000',
    // shadowOpacity: 0.06,
    // shadowRadius: 4,
    // shadowOffset: {width: 0, height: 1},
    marginRight: 8,
    borderBottomWidth: 2,
    borderColor: 'transparent',
  },
  catTabActive: {
    borderColor: Constants.normal_green,
    // backgroundColor: '#fff',
  },
  catIcon: {
    height: 22,
    width: 22,
  },
  catLabel: {
    fontSize: 13,
    fontFamily: FONTS.Medium,
    color: '#555',
    maxWidth: 80,
  },
  catLabelActive: {
    color: '#111',
    fontFamily: FONTS.Bold,
  },

  /* ── Filter Chips ── */
  filterList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
    alignItems: 'center',
  },
  filterIconBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterIconText: {
    fontSize: 13,
    fontFamily: FONTS.Medium,
    color: '#444',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#E8F5E9',
    borderColor: '#2e7d32',
  },
  filterChipDot: {
    fontSize: 12,
    color: '#2e7d32',
    fontFamily: FONTS.Bold,
  },
  filterChipText: {
    fontSize: 13,
    fontFamily: FONTS.Medium,
    color: '#555',
  },
  filterChipTextActive: {
    color: '#2e7d32',
    fontFamily: FONTS.SemiBold,
  },

  /* ── Restaurant Card ── */
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.09,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 3},
  },
  cardImgWrap: {
    position: 'relative',
    width: '100%',
    height: 210,
    overflow: 'hidden',
  },
  cardImg: {
    width: width - 32,
    height: 210,
  },
  offerBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#D32F2F',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  freeBadge: {
    backgroundColor: '#1565C0',
  },
  offerBadgeText: {
    fontSize: 11,
    fontFamily: FONTS.Bold,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 15,
  },
  deliveryPill: {
    position: 'absolute',
    bottom: 30,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  deliveryPillText: {
    fontSize: 11,
    fontFamily: FONTS.SemiBold,
    color: '#fff',
  },
  swiperDots: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  swiperDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  swiperDotActive: {
    backgroundColor: '#fff',
    width: 16,
  },
  favBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 20,
    padding: 7,
  },
  cardInfo: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 14,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  cardName: {
    fontSize: 17,
    fontFamily: FONTS.SemiBold,
    color: Constants.black,
    flex: 1,
    marginRight: 8,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2e7d32',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 3,
  },
  ratingText: {
    fontSize: 12,
    fontFamily: FONTS.Bold,
    color: '#fff',
  },
  cardCategory: {
    fontSize: 13,
    fontFamily: FONTS.Regular,
    color: '#777',
    marginBottom: 6,
  },
  promoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  promoIcon: {
    fontSize: 12,
  },
  promoText: {
    fontSize: 12,
    fontFamily: FONTS.Regular,
    color: '#444',
    flex: 1,
  },
});