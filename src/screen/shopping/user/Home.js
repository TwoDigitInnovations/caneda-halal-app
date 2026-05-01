import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useContext, useEffect, useState} from 'react';
import Constants, {Currency, FONTS} from '../../../Assets/Helpers/constant';
import {Category2Icon, EcoIcon, PlusIcon, PrivacyIcon, Profile3Icon, SearchIcon, StarIcon, TruckIcon, UnfavIcon} from '../../../../Theme';
import LinearGradient from 'react-native-linear-gradient';
import {navigate} from '../../../../navigationRef';
import {GetApi, Post} from '../../../Assets/Helpers/Service';
import {
  ShoppingCartContext,
  LoadContext,
  ToastContext,
  ShoppingUserContext,
  UserContext,
} from '../../../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SwiperFlatList from 'react-native-swiper-flatlist';
import ShoppingHeader from '../../../Assets/Component/ShoppingHeader';
import {useTranslation} from 'react-i18next';
import Scheliton from '../../../Assets/Component/Scheliton';
import TranslateHandled from '../../../Assets/Component/TranslateHandled';
import CuurentLocation from '../../../Assets/Component/CuurentLocation';
import { StarRatingDisplay } from 'react-native-star-rating-widget';

// ─── Countdown Timer Hook ────────────────────────────────────────────────────
const useCountdown = initialSeconds => {
  const [seconds, setSeconds] = useState(initialSeconds);
  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return {h, m, s};
};

// ─── Promo Badges ────────────────────────────────────────────────────────────
const PROMO_BADGES = [
  {label: 'Free Shipping', color: '#FFC6A14D', border: '#733700',icon:<TruckIcon height={20} width={20}/>},
  {label: 'Delivery Guarantee', color: '#FDD4004D', border: '#594A00',icon:<PrivacyIcon height={20} width={20} color="#6D5A00"/>},
  {label: 'Eco Choice', color: '#FF775B4D', border: '#4B0700',icon:<EcoIcon height={20} width={20}/>},
];

const Home = () => {
  const {t} = useTranslation();
  const [shoppingcartdetail, setshoppingcartdetail] =
    useContext(ShoppingCartContext);
  const [toast, setToast] = useContext(ToastContext);
  const [loading, setLoading] = useContext(LoadContext);
  const [imgLoading, setImgLoading] = useState(true);
  const [categorylist, setcategorylist] = useState([]);
  const [topsellinglist, settopsellinglist] = useState([]);
  const [carosalimg, setcarosalimg] = useState([]);
  const [storelist, setstorelist] = useState([]);
  const [user] = useContext(UserContext);
  const [shoppinguserProfile, setshoppinguserProfile] =
    useContext(ShoppingUserContext);

  const countdown = useCountdown(9912); // ~2h 45m 12s

  useEffect(() => {
    getCategory();
    getTopSoldProduct();
    getSetting();
  }, []);

  useEffect(() => {
    getnearbyshops();
  }, [shoppinguserProfile]);

  const getCategory = () => {
    setLoading(true);
    GetApi(`getShoppingCategory?limit=8`, {}).then(
      async res => {
        setLoading(false);
        if (res.status) setcategorylist(res.data);
      },
      err => {
        setLoading(false);
        console.log(err);
      },
    );
  };

  const getTopSoldProduct = () => {
    setLoading(true);
    const uid = user?._id || '';
    GetApi(`getTopSoldShopping?limit=6&userId=${uid}`, {}).then(
      async res => {
        setLoading(false);
        if (res.status) settopsellinglist(res.data);
      },
      err => {
        setLoading(false);
        console.log(err);
      },
    );
  };

  const toggleFav = id => {
    settopsellinglist(prev =>
      prev.map(p => p._id === id ? {...p, isFavorite: !p.isFavorite} : p),
    );
    Post('shoppingtogglefavorite', {shoppingid: id}).then(
      () => {},
      () => {
        settopsellinglist(prev =>
          prev.map(p => p._id === id ? {...p, isFavorite: !p.isFavorite} : p),
        );
      },
    );
  };

  const getSetting = () => {
    GetApi(`getShoppingCarousel`, {}).then(
      async res => {
        setLoading(false);
        if (res.success)
          setcarosalimg(res?.shoppingcarousel[0].carousel);
      },
      err => {
        setLoading(false);
        console.log(err);
      },
    );
  };

  const getnearbyshops = () => {
    setLoading(true);
    if (
      shoppinguserProfile?.shipping_address?.location?.coordinates?.length > 0
    ) {
      const data = {
        role: 'SHOPPINGSELLER',
        location: shoppinguserProfile.shipping_address.location,
      };
      Post(`getnearbystore`, data)
        .then(async res => {
          setLoading(false);
          if (res.status) setstorelist(res.data);
        })
        .catch(err => {
          setLoading(false);
          console.log(err);
        });
    } else {
      CuurentLocation(res => {
        const data = {
          role: 'SHOPPINGSELLER',
          location: {
            type: 'Point',
            coordinates: [res.coords.longitude, res.coords.latitude],
          },
        };
        Post(`getnearbystore`, data)
          .then(async res => {
            setLoading(false);
            if (res.status) setstorelist(res.data);
          })
          .catch(err => {
            setLoading(false);
            console.log(err);
          });
      });
    }
  };

  const width = Dimensions.get('window').width;
  const width2 = Dimensions.get('window').width - 30;
  const cardWidth = (width - 48) / 2;

  // ─── Render: Deal Card ─────────────────────────────────────────────────────
  const renderDealCard = (item, index) => {
    const discountPct =
      item?.variants?.[0]?.selected?.[0]
        ? (
            ((Number(item.variants[0].selected[0].other_price) -
              Number(item.variants[0].selected[0].our_price)) /
              Number(item.variants[0].selected[0].other_price)) *
            100
          ).toFixed(0)
        : 0;

    return (
      <TouchableOpacity
        key={index}
        style={styles.dealCard}
        onPress={() => navigate('ShoppingPreview', item._id)}>
        <View style={styles.dealBadge}>
          <Text style={styles.dealBadgeTxt}>-{discountPct}% limited time</Text>
        </View>
        <Image
          source={{uri: item?.variants?.[0]?.image?.[0]}}
          style={styles.dealImg}
          resizeMode="contain"
        />
        <Text style={styles.dealPrice}>
          {Currency}{item?.variants?.[0]?.selected?.[0]?.our_price}
        </Text>
        <View style={styles.soldBarBg}>
          <View
            style={[styles.soldBarFill, {width: `${Math.min(discountPct * 1.5, 90)}%`}]}
          />
        </View>
        <Text style={styles.soldTxt}>{Math.floor(discountPct * 1.5)}% sold</Text>
      </TouchableOpacity>
    );
  };

  // ─── Render: Curated Product Card ─────────────────────────────────────────
  const renderCuratedCard = (item, index) => {
    const discountPct =
      item?.variants?.[0]?.selected?.[0]
        ? (
            ((Number(item.variants[0].selected[0].other_price) -
              Number(item.variants[0].selected[0].our_price)) /
              Number(item.variants[0].selected[0].other_price)) *
            100
          ).toFixed(0)
        : null;

    return (
      <TouchableOpacity
        key={item._id}
        style={[styles.curatedCard, {width: cardWidth}]}
        onPress={() => navigate('ShoppingPreview', item._id)}>
        <TouchableOpacity
          style={styles.heartBtn}
          onPress={e => { e.stopPropagation?.(); toggleFav(item._id); }}>
          <UnfavIcon height={16} width={16} color={item.isFavorite ? '#E53935' : null} />
        </TouchableOpacity>

        {discountPct && (
          <View
            style={styles.curatedBadge}>
              <Text style={styles.curatedBadgeTxt}>
                -{discountPct}%
              </Text>
          </View>
            )}

        <Image
          source={{uri: item?.variants?.[0]?.image?.[0]}}
          style={styles.curatedImg}
          resizeMode="contain"
        />

        <View style={styles.curatedInfo}>
          <Text numberOfLines={2} style={styles.curatedName}>
            {item.name}
          </Text>
          <View style={styles.priceRow}>
            <Text style={styles.curatedPrice}>
              {Currency}{item?.variants?.[0]?.selected?.[0]?.our_price}
            </Text>
            {item?.variants?.[0]?.selected?.[0]?.other_price && (
              <Text style={styles.curatedOldPrice}>
                {Currency}{item?.variants?.[0]?.selected?.[0]?.other_price}
              </Text>
            )}
          </View>
          {item?.averageRating&& item?.averageRating > 0 ? (
            <View style={styles.ratingRow}>
              {/* <StarIcon height={11} width={11} color="#F4A03A" />
              <Text style={styles.starTxt}> {Number(item.averageRating).toFixed(1)}</Text> */}
              <StarRatingDisplay
                rating={String(item?.averageRating)}
                starStyle={{ marginHorizontal: 0 }}
                starSize={12}
                color="#6D5A00"
              />
              {item?.totalReviews > 0 && <Text style={styles.reviewTxt}>({item.totalReviews})</Text>}
            </View>
          ) : null}
          {/* <TouchableOpacity
            style={styles.addBtn}>
            <PlusIcon />
          </TouchableOpacity> */}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ── Top Search Bar ── */}
      <View style={styles.searchBarWrap}>
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => navigate('ShoppingSearchpage')}>
          <SearchIcon height={20} width={20} color={Constants.normal_green} />
          <TextInput
            style={styles.searchInput}
            editable={false}
            placeholder={t('What are you looking for?')}
            placeholderTextColor={Constants.customgrey}
          />
        </TouchableOpacity>
        {/* <TouchableOpacity style={styles.iconBtn}>
          <Text style={styles.iconBtnTxt}>📷</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn}>
          <Text style={styles.iconBtnTxt}>🔔</Text>
          <View style={styles.notifBadge}>
            <Text style={styles.notifBadgeTxt}>2</Text>
          </View>
        </TouchableOpacity> */}
        {shoppinguserProfile?.image ? (
            <TouchableOpacity onPress={() =>
             navigate('Shoppingprofile')
            }>
              <Image
                source={{
                  uri: `${shoppinguserProfile.image}`,
                }}
                style={styles.hi}
              />
            </TouchableOpacity>
          ) : (
            <Profile3Icon
              height={28}
              width={28}
              color={Constants.black}
              onPress={() =>
               navigate('Shoppingprofile')
              }
            />
          )}
      </View>

      <ScrollView
        style={{marginBottom: Platform.OS === 'android' ? 70 : 40}}
        showsVerticalScrollIndicator={false}>

        {/* ── Promo Badges Strip ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.promoBadgesScroll}
          contentContainerStyle={{paddingHorizontal: 16, gap: 10}}>
          {PROMO_BADGES.map((b, i) => (
            <View
              key={i}
              style={[
                styles.promoBadgePill,
                {backgroundColor: b.color},
              ]}>
                <View>{b.icon}</View>
              <Text style={[styles.promoBadgeTxt, {color: b.border}]}>
                {b.label}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* ── Hero Carousel Banner ── */}
        <View style={styles.heroBannerWrap}>
          {carosalimg && carosalimg.length > 0 ? (
            <SwiperFlatList
              autoplay
              autoplayDelay={3}
              autoplayLoop
              data={carosalimg}
              renderItem={({item, index}) => (
                <TouchableOpacity
                  style={{width: width, alignItems: 'center'}}
                  onPress={() => {
                    item.shopping_id &&
                      navigate('ShoppingPreview', item.shopping_id);
                  }}>
                  {imgLoading && (
                    <ActivityIndicator
                      size="small"
                      color="#999"
                      style={StyleSheet.absoluteFill}
                    />
                  )}
                  <Image
                    source={{uri: `${item.image}`}}
                    // source={item.images}
                    style={{
                      height: 180,
                      width: width2,
                      borderRadius: 20,
                      alignSelf: 'center',
                    }}
                    resizeMode="stretch"
                    onLoadStart={() => setImgLoading(true)}
                    onLoadEnd={() => setImgLoading(false)}
                    onError={() => setImgLoading(false)}
                    key={index}
                  />
                </TouchableOpacity>
              )}
            />
          ) : (
            <View style={[styles.heroBanner, {marginHorizontal: 16}]}>
              <Scheliton />
            </View>
          )}
        </View>

        {/* ── Categories ── */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Category2Icon height={20} width={20} color={Constants.normal_green}/>
            <Text style={styles.sectionTitle}>{t('Categories')}</Text>
          </View>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}>
          {categorylist &&
            categorylist.map((item, i) => (
              <TouchableOpacity
                key={i}
                style={styles.categoryItem}
                onPress={() =>
                  navigate('ShoppingProducts', {id: item._id, name: item.name})
                }>
                <View style={styles.categoryCircle}>
                  {item?.image && (
                    <Image
                      source={{uri: item.image}}
                      style={styles.categoryImg}
                      resizeMode="cover"
                    />
                  )}
                </View>
                <Text style={styles.categoryLabel} numberOfLines={1}>
                  <TranslateHandled text={item?.name} />
                </Text>
              </TouchableOpacity>
            ))}
          <TouchableOpacity
            style={styles.categoryItem}
            onPress={() => navigate('ShoppingCategories')}>
            <View style={[styles.categoryCircle, styles.categoryCircleMore]}>
              <Text style={{fontSize: 20, color: Constants.normal_green}}>›</Text>
            </View>
            <Text style={styles.categoryLabel}>{t('More')}</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* ── Lightning Deals ── */}
        {/* <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionIcon}>⚡</Text>
            <Text style={[styles.sectionTitle, {color: Constants.black}]}>
              {t('Lightning deals')}
            </Text>
            <View style={styles.countdownWrap}>
              <View style={styles.countdownBlock}>
                <Text style={styles.countdownNum}>{countdown.h}</Text>
              </View>
              <Text style={styles.countdownColon}>:</Text>
              <View style={styles.countdownBlock}>
                <Text style={styles.countdownNum}>{countdown.m}</Text>
              </View>
              <Text style={styles.countdownColon}>:</Text>
              <View style={styles.countdownBlock}>
                <Text style={styles.countdownNum}>{countdown.s}</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() =>
                navigate('ShoppingProducts', {
                  name: 'Lightning Deals',
                  type: 'topselling',
                })
              }>
              <Text style={styles.seeAllTxt}>{t('SEE ALL')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dealScroll}>
          {topsellinglist.map((item, i) => renderDealCard(item, i))}
        </ScrollView> */}

        {/* ── Curated For You ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('Curated for you')}</Text>
          {/* <Text style={styles.curatedSubtxt}>1,200+ New items</Text> */}
        </View>

        <View style={styles.curatedGrid}>
          {topsellinglist.map((item, i) => renderCuratedCard(item, i))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;

// ─── Styles ──────────────────────────────────────────────────────────────────
const {width: W} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },

  // Search Bar
  searchBarWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: Constants.white,
    gap: 8,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#2C614061',
    borderWidth:1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: Constants.black,
    fontFamily: FONTS.Medium,
    fontSize: 14,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F2F2F2',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  iconBtnTxt: {fontSize: 18},
  notifBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#E53935',
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  notifBadgeTxt: {
    color: '#fff',
    fontSize: 9,
    fontFamily: FONTS.SemiBold,
  },

  // Promo Badges
  promoBadgesScroll: {
    marginVertical: 10,
  },
  promoBadgePill: {
    flexDirection:'row',
    alignItems:'center',
    // borderWidth: 1,
    borderRadius: 7,
    paddingHorizontal: 14,
    paddingVertical: 6,
    gap:7
  },
  promoBadgeTxt: {
    fontSize: 12,
    fontFamily: FONTS.SemiBold,
  },

  // Hero Banner
  heroBannerWrap: {
    marginBottom: 10,
  },
  heroBanner: {
    borderRadius: 16,
    padding: 20,
    height: 190,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  heroBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  heroBadgeTxt: {
    color: '#fff',
    fontSize: 12,
    fontFamily: FONTS.SemiBold,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 20,
    fontFamily: FONTS.Black,
    fontWeight: '800',
    marginBottom: 12,
    lineHeight: 26,
  },
  heroBtn: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  heroBtnTxt: {
    color: Constants.normal_green,
    fontFamily: FONTS.SemiBold,
    fontSize: 14,
  },
  heroImg: {
    position: 'absolute',
    right: -10,
    bottom: 0,
    height: 190,
    width: 180,
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 18,
    marginBottom: 10,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 6,
  },
  sectionIcon: {
    fontSize: 18,
    color: Constants.normal_green,
  },
  sectionTitle: {
    fontSize: 16,
    color: Constants.black,
    fontFamily: FONTS.SemiBold,
  },
  seeAllTxt: {
    fontSize: 13,
    color: Constants.normal_green,
    fontFamily: FONTS.SemiBold,
    marginLeft: 8,
  },
  curatedSubtxt: {
    fontSize: 12,
    color: Constants.customgrey2,
    fontFamily: FONTS.Regular,
  },

  // Categories
  categoryScroll: {
    paddingHorizontal: 16,
    gap: 14,
    paddingBottom: 4,
  },
  categoryItem: {
    alignItems: 'center',
    width: 68,
  },
  categoryCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryCircleMore: {
    backgroundColor: '#F2F2F2',
  },
  categoryImg: {
    width: 60,
    height: 60,
  },
  categoryLabel: {
    fontSize: 12,
    color: Constants.black,
    fontFamily: FONTS.Regular,
    textAlign: 'center',
    marginTop: 5,
    width: 68,
  },

  // Countdown
  countdownWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
    gap: 3,
    flex: 1,
  },
  countdownBlock: {
    backgroundColor: '#1B3826',
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  countdownNum: {
    color: '#fff',
    fontFamily: FONTS.SemiBold,
    fontSize: 13,
  },
  countdownColon: {
    color: Constants.black,
    fontFamily: FONTS.SemiBold,
    fontSize: 15,
  },

  // Deal Cards
  dealScroll: {
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 4,
  },
  dealCard: {
    width: 150,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 10,
    overflow: 'hidden',
  },
  dealBadge: {
    backgroundColor: '#1B3826',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  dealBadgeTxt: {
    color: '#fff',
    fontSize: 9,
    fontFamily: FONTS.SemiBold,
  },
  dealImg: {
    height: 110,
    width: '100%',
    borderRadius: 8,
    backgroundColor: '#F7F7F7',
    marginBottom: 8,
  },
  dealPrice: {
    fontSize: 15,
    color: Constants.normal_green,
    fontFamily: FONTS.SemiBold,
    marginBottom: 5,
  },
  soldBarBg: {
    height: 5,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    marginBottom: 4,
    overflow: 'hidden',
  },
  soldBarFill: {
    height: 5,
    backgroundColor: Constants.normal_green,
    borderRadius: 3,
  },
  soldTxt: {
    fontSize: 10,
    color: Constants.customgrey2,
    fontFamily: FONTS.Regular,
  },

  // Curated Grid
  curatedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 16,
    marginBottom: 20,
  },
  curatedCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    paddingBottom: 10,
    boxShadow:'0px 1px 2px 0px #00000024'
  },
  heartBtn: {
    position: 'absolute',
    top: 6,
    right: 4,
    zIndex: 10,
    // backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 20,
    padding: 4,
  },
  curatedBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    zIndex: 9,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    backgroundColor:'#B32000'
  },
  curatedBadgeTxt: {
    fontSize: 9,
    fontFamily: FONTS.SemiBold,
    color: Constants.white
  },
  curatedImg: {
    height: 160,
    width: '100%',
    backgroundColor: '#F7F7F7',
  },
  promoPill: {
    backgroundColor: '#1B3826',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginHorizontal: 10,
    marginTop: -14,
    marginBottom: 4,
  },
  promoPillTxt: {
    color: '#fff',
    fontSize: 10,
    fontFamily: FONTS.SemiBold,
  },
  curatedInfo: {
    paddingHorizontal: 10,
    marginTop: 6,
  },
  curatedName: {
    fontSize: 13,
    color: Constants.black,
    fontFamily: FONTS.Medium,
    marginBottom: 4,
    lineHeight: 18,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  curatedPrice: {
    fontSize: 15,
    color: '#B32000',
    fontFamily: FONTS.SemiBold,
  },
  curatedOldPrice: {
    fontSize: 12,
    color: Constants.customgrey2,
    fontFamily: FONTS.Regular,
    textDecorationLine: 'line-through',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  starTxt: {
    color: '#F4A03A',
    fontSize: 12,
  },
  reviewTxt: {
    color: Constants.customgrey2,
    fontSize: 11,
    fontFamily: FONTS.Regular,
  },
  addBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderColor: Constants.normal_green,
    borderWidth:2,
    width: 28,
    height: 28,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnTxt: {
    color: Constants.normal_green,
    fontSize: 18,
    lineHeight: 22,
    fontFamily: FONTS.SemiBold,
  },
  hi: {
    height: 28,
    width: 28,
    borderRadius: 15,
  },
});