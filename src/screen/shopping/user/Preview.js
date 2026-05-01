import {
  Dimensions,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Share,
} from 'react-native';
import React, {useContext, useEffect, useState, useRef} from 'react';
import {SwiperFlatList} from 'react-native-swiper-flatlist';
import Constants, {Currency, FONTS} from '../../../Assets/Helpers/constant';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ShoppingCartContext, LoadContext, ToastContext} from '../../../../App';
import {BackIcon, CartIcon, MinusIcon, Plus2Icon} from '../../../../Theme';
import {goBack, navigate} from '../../../../navigationRef';
import {GetApi} from '../../../Assets/Helpers/Service';
import moment from 'moment';
import {useTranslation} from 'react-i18next';

// ─── Countdown Timer Hook ────────────────────────────────────────────────────
const useCountdown = totalSeconds => {
  const [remaining, setRemaining] = useState(totalSeconds);
  useEffect(() => {
    const id = setInterval(() => setRemaining(r => Math.max(0, r - 1)), 1000);
    return () => clearInterval(id);
  }, []);
  const h = String(Math.floor(remaining / 3600)).padStart(2, '0');
  const m = String(Math.floor((remaining % 3600) / 60)).padStart(2, '0');
  const s = String(remaining % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
};

// ─── Star Rating ─────────────────────────────────────────────────────────────
const StarRow = ({rating = 0, size = 14, color = '#F5A623'}) => (
  <View style={{flexDirection: 'row', gap: 2}}>
    {[1, 2, 3, 4, 5].map(i => (
      <Text key={i} style={{fontSize: size, color: i <= Math.round(rating) ? color : '#D5D5D5'}}>
        ★
      </Text>
    ))}
  </View>
);

// ─── Rating Bar ──────────────────────────────────────────────────────────────
const RatingBar = ({label, pct}) => (
  <View style={styles.ratingBarRow}>
    <Text style={styles.ratingBarLabel}>{label}</Text>
    <View style={styles.ratingBarTrack}>
      <View style={[styles.ratingBarFill, {width: `${pct}%`}]} />
    </View>
    <Text style={styles.ratingBarPct}>{pct}%</Text>
  </View>
);

const ShoppingPreview = props => {
  const productid = props?.route?.params;
  const {t} = useTranslation();
  const [currentproduct, setcurrentproduct] = useState({});
  const [shoppingcartdetail, setshoppingcartdetail] = useContext(ShoppingCartContext);
  const [toast, setToast] = useContext(ToastContext);
  const [loading, setLoading] = useContext(LoadContext);
  const [selectedslot, setsselectedslot] = useState();
  const [productdata, setproductdata] = useState();
  const [isInCart, setIsInCart] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [availableQty, setAvailableQty] = useState(0);
  const [selsctSizeSlot, setSelsctSizeSlot] = useState();
  const [selsctSize, setSelsctSize] = useState();
  const [isFav, setIsFav] = useState(false);

  const countdown = useCountdown(4 * 3600 + 22 * 60 + 15); // demo 4h22m15s

  const sumdata =
    shoppingcartdetail?.length > 0
      ? shoppingcartdetail.reduce((a, item) => a + Number(item?.offer) * Number(item?.qty), 0)
      : null;

  useEffect(() => {
    if (productid) getProductById();
  }, []);

  useEffect(() => {
    const cp = shoppingcartdetail.find(item => item?.productid === productdata?._id);
    setcurrentproduct(cp);
  }, [shoppingcartdetail]);

  useEffect(() => {
    if (shoppingcartdetail.length > 0) {
      const cartItem = shoppingcartdetail.find(
        f =>
          f.productid === productdata?._id &&
          f.variant_color === selectedslot?.color &&
          f.selected_size?.value === selsctSizeSlot?.value,
      );
      setIsInCart(!!cartItem);
      setAvailableQty(cartItem ? cartItem.qty : 0);
    } else {
      setIsInCart(false);
      setAvailableQty(0);
    }
  }, [shoppingcartdetail, productdata, selectedslot, selsctSizeSlot]);

  const getProductById = () => {
    setLoading(true);
    GetApi(`getShoppingById/${productid}`).then(
      res => {
        setLoading(false);
        if (res.status) {
          setproductdata(res.data);
          setIsFav(res.data?.isFavorite || false);
          if (res?.data?.variants?.length > 0) {
            setsselectedslot(res.data.variants[0]);
            if (res.data.variants[0]?.selected?.length > 0) {
              setSelsctSizeSlot(res.data.variants[0].selected[0]);
            }
          }
        }
      },
      err => {
        setLoading(false);
      },
    );
  };

  const cartdata = async (buyNow = false) => {
    if (!selsctSize) {
      setToast('Please select size');
      return;
    }
    const existingCart = Array.isArray(shoppingcartdetail) ? shoppingcartdetail : [];
    const existingProduct = existingCart.find(
      f =>
        f.productid === productdata._id &&
        f.variant_color === selectedslot?.color &&
        f.selected_size?.value === selsctSizeSlot?.value,
    );

    const newProduct = {
      productid: productdata._id,
      productname: productdata.name,
      price: Number(selsctSizeSlot.other_price),
      offer: Number(selsctSizeSlot.our_price),
      variant_color: selectedslot?.color,
      variant_images: selectedslot?.image,
      selected_size: selsctSizeSlot,
      image: selectedslot?.image?.[0] || productdata.image?.[0],
      qty: 1,
      seller_id: productdata.sellerid,
      seller_profile: productdata.seller_profile?._id,
      seller_location: productdata.seller_profile?.location,
    };

    if (existingCart.length > 0 && productdata.sellerid !== existingCart[0].seller_id) {
      const updatedCart = [newProduct];
      setshoppingcartdetail(updatedCart);
      await AsyncStorage.setItem('shoppingcartdata', JSON.stringify(updatedCart));
      setAvailableQty(1);
    } else if (!existingProduct) {
      const updatedCart = [...existingCart, newProduct];
      setshoppingcartdetail(updatedCart);
      await AsyncStorage.setItem('shoppingcartdata', JSON.stringify(updatedCart));
    }

    if (buyNow) navigate('Shoppingtab', {screen: 'Cart'});
  };

  const handleShare = async () => {
    try {
      await Share.share({message: `Check out ${productdata?.name}!`});
    } catch (_) {}
  };

  const handleQtyChange = async delta => {
    if (delta < 0 && availableQty <= 1) {
      // Remove
      const updatedCart = shoppingcartdetail.filter(
        item =>
          !(
            item.productid === currentproduct?.productid &&
            item.variant_color === selectedslot?.color &&
            item.selected_size?.value === selsctSizeSlot?.value
          ),
      );
      setshoppingcartdetail(updatedCart);
      await AsyncStorage.setItem('shoppingcartdata', JSON.stringify(updatedCart));
      setIsInCart(false);
      setAvailableQty(0);
    } else {
      const updatedCart = shoppingcartdetail.map(item =>
        item.productid === currentproduct?.productid &&
        item.variant_color === selectedslot?.color &&
        item.selected_size?.value === selsctSizeSlot?.value
          ? {...item, qty: item.qty + delta}
          : item,
      );
      setshoppingcartdetail(updatedCart);
      await AsyncStorage.setItem('shoppingcartdata', JSON.stringify(updatedCart));
      setAvailableQty(prev => prev + delta);
    }
  };

  const width = Dimensions.get('window').width;
  const imgWidth = width - 40;

  const avgRating = parseFloat(productdata?.averageRating || '0');
  const totalReviews = productdata?.totalReviews || 0;

  // Build rating distribution from reviews array
  const reviews = productdata?.reviews || [];
  const ratingCounts = {5: 0, 4: 0, 3: 0};
  reviews.forEach(r => {
    if (r.rating >= 5) ratingCounts[5]++;
    else if (r.rating >= 4) ratingCounts[4]++;
    else ratingCounts[3]++;
  });
  const ratingPct = star =>
    totalReviews > 0 ? Math.round((ratingCounts[star] / totalReviews) * 100) : 0;

  const CustomPagination = ({data, index}) => (
    <View style={styles.paginationContainer}>
      {data.map((_, i) => (
        <View key={i} style={[styles.dot, i === index ? styles.activeDot : styles.inactiveDot]} />
      ))}
    </View>
  );

  const discountPct =
    selsctSizeSlot?.other_price && selsctSizeSlot?.our_price
      ? Math.round(
          ((selsctSizeSlot.other_price - selsctSizeSlot.our_price) / selsctSizeSlot.other_price) *
            100,
        )
      : 0;

  // Specs from product attributes or static fallback
  const specs = productdata?.attributes?.length > 0
    ? productdata.attributes
    : [
        {label: 'Category', value: productdata?.categoryName},
        {label: 'Manufacturer', value: productdata?.manufacturername},
        {label: 'Address', value: productdata?.manufactureradd},
        {label: 'Status', value: productdata?.status},
      ].filter(s => s.value);

  return (
    <SafeAreaView style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => goBack()}>
          <BackIcon color={Constants.black} />
        </TouchableOpacity>
        <Text style={styles.headtxt}>{t('Product Details')}</Text>
        {/* <TouchableOpacity style={styles.iconBtn} onPress={handleShare}>
          <Text style={styles.shareIcon}>⇪</Text>
        </TouchableOpacity> */}
        <View style={{width:50}}/>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Image Carousel ── */}
        <View style={styles.carouselWrap}>
          <SwiperFlatList
            data={selectedslot?.image?.length > 0 ? selectedslot.image : [productdata?.image?.[0]]}
            onChangeIndex={({index}) => setCurrentIndex(index)}
            renderItem={({item, index}) => (
              <View style={{width: imgWidth + 40, alignItems: 'center'}}>
                <Image
                  source={{uri: item}}
                  style={styles.mainImage}
                  resizeMode="stretch"
                  key={index}
                />
              </View>
            )}
          />
          {/* Fav */}
          <TouchableOpacity style={styles.favBtn} onPress={() => setIsFav(f => !f)}>
            <Text style={{fontSize: 20, color: isFav ? '#E74C3C' : '#CCC'}}>♥</Text>
          </TouchableOpacity>
          {selectedslot?.image?.length > 0 && (
            <CustomPagination data={selectedslot.image} index={currentIndex} />
          )}
        </View>

        <View style={styles.content}>
          {/* ── Name + Fav ── */}
          <View style={styles.nameRow}>
            <Text style={styles.proname}>{productdata?.name}</Text>
          </View>
          <Text style={styles.shortDesc}>{productdata?.short_description}</Text>

          {/* ── Price Row ── */}
          <View style={styles.priceRow}>
            <Text style={styles.salePrice}>
              {Currency} {selsctSizeSlot?.our_price}
            </Text>
            {selsctSizeSlot?.other_price ? (
              <Text style={styles.origPrice}>
                {Currency} {selsctSizeSlot?.other_price}
              </Text>
            ) : null}
            {discountPct > 0 && (
              <View style={styles.discBadge}>
                <Text style={styles.discTxt}>{discountPct}% OFF</Text>
              </View>
            )}
          </View>

          {/* ── Flash Sale Countdown ── */}
          {/* <View style={styles.countdownCard}>
            <View style={styles.countdownLeft}>
              <Text style={styles.countdownLabel}>⏰ OFFER ENDS IN:</Text>
              <Text style={styles.countdownTimer}>{countdown}</Text>
            </View>
            <View style={styles.countdownRight}>
              <Text style={styles.soldOutTxt}>75% SOLD OUT</Text>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, {width: '75%'}]} />
              </View>
            </View>
          </View> */}

          {/* ── Shipping Chips ── */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
            {[
              {icon: '🚚', title: 'FREE SHIPPING', sub: 'Order within 4h'},
              {icon: '🛡️', title: 'DELIVERY GUARANTEE', sub: 'Arrival by Friday'},
              {icon: '↩️', title: 'EASY RETURN', sub: '30-day policy'},
            ].map((chip, i) => (
              <View key={i} style={styles.chip}>
                <Text style={styles.chipIcon}>{chip.icon}</Text>
                <View>
                  <Text style={styles.chipTitle}>{chip.title}</Text>
                  <Text style={styles.chipSub}>{chip.sub}</Text>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* ── Color Variants ── */}
          {productdata?.variants?.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.variantsRow}>
              {productdata.variants.map((item, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.variantBox,
                    selectedslot?.color === item.color && styles.variantBoxActive,
                  ]}
                  onPress={() => {
                    setsselectedslot(item);
                    setSelsctSizeSlot(item?.selected?.[0]);
                    setSelsctSize('');
                  }}>
                  <Image
                    source={{uri: item?.image?.[0]}}
                    style={styles.variantImg}
                    resizeMode="stretch"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* ── Size Selector ── */}
          {selectedslot?.selected?.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>{t('Select Size')}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: 16}}>
                {selectedslot.selected.map((it, ind) => (
                  <TouchableOpacity
                    key={ind}
                    style={[
                      styles.sizeChip,
                      selsctSize === it?.value && styles.sizeChipActive,
                    ]}
                    onPress={() => {
                      setSelsctSizeSlot(it);
                      setSelsctSize(it?.value);
                    }}>
                    <Text
                      style={[
                        styles.sizeTxt,
                        selsctSize === it?.value && {color: Constants.white},
                      ]}>
                      {it?.value}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}

          {/* ── Frequently Bought Together ── */}
          <Text style={styles.sectionTitle}>{t('FREQUENTLY BOUGHT TOGETHER')}</Text>
          <View style={styles.bundleCard}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.bundleImgs}>
                {(selectedslot?.image?.slice(0, 3) || []).map((img, i) => (
                  <View key={i} style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Image source={{uri: img}} style={styles.bundleImg} resizeMode="cover" />
                    {i < 2 && <Text style={styles.bundlePlus}>+</Text>}
                  </View>
                ))}
              </View>
            </ScrollView>
            <View style={styles.bundlePriceRow}>
              <View>
                <Text style={styles.bundleLbl}>BUNDLE PRICE</Text>
                <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                  <Text style={styles.bundlePrice}>
                    {Currency} {selsctSizeSlot ? (Number(selsctSizeSlot.our_price) * 1.5).toFixed(2) : '—'}
                  </Text>
                  <Text style={styles.bundleOrig}>
                    {selsctSizeSlot ? (Number(selsctSizeSlot.other_price) * 1.5).toFixed(2) : ''}
                  </Text>
                </View>
              </View>
              <TouchableOpacity style={styles.bundleBtn} onPress={() => cartdata()}>
                <Text style={styles.bundleBtnTxt}>ADD BUNDLE</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Divider ── */}
          <View style={styles.divider} />

          {/* ── Product Specifications ── */}
          <Text style={styles.sectionTitle}>{t('PRODUCT SPECIFICATIONS')}</Text>
          <View style={styles.specsTable}>
            {specs.map((s, i) => (
              <View key={i} style={[styles.specRow, i % 2 === 1 && styles.specRowAlt]}>
                <Text style={styles.specLabel}>{s.label}</Text>
                <Text style={styles.specValue}>{s.value}</Text>
              </View>
            ))}
          </View>

          {/* ── Long Description ── */}
          {productdata?.long_description ? (
            <>
              <Text style={styles.sectionTitle}>{t('Product Information')}</Text>
              <Text style={styles.longDesc}>{productdata.long_description}</Text>
            </>
          ) : null}

          {/* ── Customer Reviews ── */}
          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>{t('CUSTOMER REVIEWS')}</Text>
          <View style={styles.reviewSummary}>
            <View style={styles.reviewAvgBlock}>
              <Text style={styles.reviewAvgNum}>{avgRating.toFixed(1)}</Text>
              <StarRow rating={avgRating} size={18} />
            </View>
            <View style={styles.reviewBarsBlock}>
              <RatingBar label="5★" pct={ratingPct(5)} />
              <RatingBar label="4★" pct={ratingPct(4)} />
              <RatingBar label="3★" pct={ratingPct(3)} />
            </View>
          </View>

          {reviews.map((r, i) => (
            <View key={i} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={styles.reviewAvatar}>
                  <Text style={styles.reviewAvatarTxt}>
                    {r?.username ? r.username[0].toUpperCase() : 'U'}
                  </Text>
                </View>
                <View style={{flex: 1}}>
                  <Text style={styles.reviewName}>{r?.username || 'Verified Buyer'}</Text>
                  <Text style={styles.reviewDate}>Verified Buyer</Text>
                </View>
                <StarRow rating={r.rating} size={13} />
              </View>
              {r?.comment ? <Text style={styles.reviewComment}>{r.comment}</Text> : null}
            </View>
          ))}

          <TouchableOpacity style={styles.seeAllBtn}>
            <Text style={styles.seeAllTxt}>SEE ALL {totalReviews} REVIEWS</Text>
          </TouchableOpacity>

          <View style={{height: 100}} />
        </View>
      </ScrollView>

      {/* ── Bottom CTA ── */}
      <View style={styles.bottomBar}>
        {isInCart ? (
          <View style={styles.qtyControl}>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => handleQtyChange(-1)}>
              <MinusIcon color={Constants.white} height={18} width={18} />
            </TouchableOpacity>
            <Text style={styles.qtyTxt}>{availableQty}</Text>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => handleQtyChange(1)}>
              <Plus2Icon color={Constants.white} height={18} width={18} />
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.ctaBtn, {backgroundColor: '#fff', borderWidth: 1.5, borderColor: Constants.normal_green}]}
              onPress={() => cartdata(false)}>
              <Text style={[styles.ctaTxt, {color: Constants.normal_green}]}>
                {t('Add to Cart')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.ctaBtn, {backgroundColor: Constants.normal_green}]}
              onPress={() => cartdata(true)}>
              <Text style={[styles.ctaTxt, {color: '#fff'}]}>{t('Buy Now')}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

export default ShoppingPreview;

const GREEN = '#2C7A3F';
const LIGHT_GREEN = '#E8F5E9';

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    paddingTop: Platform.OS === 'ios' ? 10 : 14,
  },
  headtxt: {fontSize: 16, fontFamily: FONTS.SemiBold, color: Constants.black},
  iconBtn: {
    height: 34,
    width: 34,
    borderRadius: 17,
    backgroundColor: '#F2F2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareIcon: {fontSize: 18, color: Constants.black},

  // Carousel
  carouselWrap: {position: 'relative'},
  mainImage: {height: 320, width: '92%', borderRadius: 16},
  badgeStack: {position: 'absolute', top: 14, left: 26, zIndex: 10},
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  badgeTxt: {color: '#fff', fontSize: 11, fontFamily: FONTS.SemiBold, letterSpacing: 0.5},
  favBtn: {
    position: 'absolute',
    top: 14,
    right: 26,
    height: 36,
    width: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 14,
    alignSelf: 'center',
  },
  dot: {height: 6, borderRadius: 3, marginHorizontal: 3},
  activeDot: {width: 24, backgroundColor: GREEN},
  inactiveDot: {width: 8, backgroundColor: '#fff'},

  // Content
  content: {paddingHorizontal: 20, paddingTop: 14},
  nameRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start'},
  proname: {
    fontSize: 18,
    fontFamily: FONTS.SemiBold,
    color: Constants.black,
    flex: 1,
    lineHeight: 24,
  },
  shortDesc: {fontSize: 13, color: '#888', fontFamily: FONTS.Regular, marginTop: 4, marginBottom: 10},
  priceRow: {flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12},
  salePrice: {fontSize: 22, fontFamily: FONTS.SemiBold, color: GREEN},
  origPrice: {
    fontSize: 16,
    fontFamily: FONTS.Regular,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  discBadge: {
    backgroundColor: LIGHT_GREEN,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
  },
  discTxt: {fontSize: 12, fontFamily: FONTS.SemiBold, color: GREEN},

  // Countdown
  countdownCard: {
    flexDirection: 'row',
    backgroundColor: LIGHT_GREEN,
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  countdownLeft: {flex: 1},
  countdownLabel: {fontSize: 11, fontFamily: FONTS.SemiBold, color: GREEN, letterSpacing: 0.5},
  countdownTimer: {fontSize: 20, fontFamily: FONTS.SemiBold, color: GREEN, marginTop: 2},
  countdownRight: {flex: 1, alignItems: 'flex-end'},
  soldOutTxt: {fontSize: 11, fontFamily: FONTS.Medium, color: '#666', marginBottom: 6},
  progressTrack: {height: 6, width: '100%', backgroundColor: '#C8E6C9', borderRadius: 3},
  progressFill: {height: 6, backgroundColor: GREEN, borderRadius: 3},

  // Chips
  chipsRow: {marginBottom: 16},
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: 10,
    padding: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    gap: 8,
    minWidth: 150,
  },
  chipIcon: {fontSize: 20},
  chipTitle: {fontSize: 10, fontFamily: FONTS.SemiBold, color: Constants.black, letterSpacing: 0.3},
  chipSub: {fontSize: 10, fontFamily: FONTS.Regular, color: '#888', marginTop: 1},

  // Variants
  variantsRow: {marginBottom: 14},
  variantBox: {
    width: 64,
    height: 64,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    marginRight: 10,
    overflow: 'hidden',
  },
  variantBoxActive: {borderColor: GREEN, borderWidth: 2},
  variantImg: {width: '100%', height: '100%'},

  // Sizes
  sectionTitle: {
    fontSize: 14,
    fontFamily: FONTS.SemiBold,
    color: Constants.black,
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  sizeChip: {
    height: 40,
    minWidth: 40,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: GREEN,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  sizeChipActive: {backgroundColor: GREEN},
  sizeTxt: {fontSize: 14, fontFamily: FONTS.SemiBold, color: GREEN},

  // Bundle
  bundleCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  bundleImgs: {flexDirection: 'row', alignItems: 'center', marginBottom: 12},
  bundleImg: {width: 64, height: 64, borderRadius: 8, backgroundColor: '#EEE'},
  bundlePlus: {fontSize: 18, color: '#999', marginHorizontal: 8},
  bundlePriceRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  bundleLbl: {fontSize: 10, fontFamily: FONTS.SemiBold, color: '#888', letterSpacing: 0.5},
  bundlePrice: {fontSize: 18, fontFamily: FONTS.SemiBold, color: GREEN},
  bundleOrig: {
    fontSize: 13,
    fontFamily: FONTS.Regular,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  bundleBtn: {
    backgroundColor: GREEN,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  bundleBtnTxt: {color: '#fff', fontFamily: FONTS.SemiBold, fontSize: 13},

  // Divider
  divider: {height: 8, backgroundColor: '#F2F2F2', marginHorizontal: -20, marginBottom: 16},

  // Specs
  specsTable: {borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#EFEFEF', marginBottom: 16},
  specRow: {flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 14, backgroundColor: '#fff'},
  specRowAlt: {backgroundColor: '#F9F9F9'},
  specLabel: {flex: 1, fontSize: 13, fontFamily: FONTS.Regular, color: '#777'},
  specValue: {flex: 1.2, fontSize: 13, fontFamily: FONTS.SemiBold, color: Constants.black, textAlign: 'right'},

  // Long desc
  longDesc: {fontSize: 14, fontFamily: FONTS.Regular, color: '#555', lineHeight: 22, marginBottom: 16},

  // Reviews
  reviewSummary: {flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 16},
  reviewAvgBlock: {alignItems: 'center', gap: 4},
  reviewAvgNum: {fontSize: 36, fontFamily: FONTS.SemiBold, color: Constants.black},
  reviewBarsBlock: {flex: 1, gap: 6},
  ratingBarRow: {flexDirection: 'row', alignItems: 'center', gap: 8},
  ratingBarLabel: {fontSize: 12, fontFamily: FONTS.Regular, color: '#777', width: 26},
  ratingBarTrack: {flex: 1, height: 6, backgroundColor: '#EFEFEF', borderRadius: 3},
  ratingBarFill: {height: 6, backgroundColor: '#F5A623', borderRadius: 3},
  ratingBarPct: {fontSize: 11, fontFamily: FONTS.Regular, color: '#999', width: 32, textAlign: 'right'},

  reviewCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  reviewHeader: {flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8},
  reviewAvatar: {
    height: 36,
    width: 36,
    borderRadius: 18,
    backgroundColor: GREEN,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewAvatarTxt: {color: '#fff', fontFamily: FONTS.SemiBold, fontSize: 16},
  reviewName: {fontSize: 13, fontFamily: FONTS.SemiBold, color: Constants.black},
  reviewDate: {fontSize: 11, fontFamily: FONTS.Regular, color: '#999', marginTop: 1},
  reviewComment: {fontSize: 13, fontFamily: FONTS.Regular, color: '#444', lineHeight: 20},

  seeAllBtn: {
    borderWidth: 1.5,
    borderColor: '#D5D5D5',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 8,
  },
  seeAllTxt: {fontSize: 13, fontFamily: FONTS.SemiBold, color: Constants.black, letterSpacing: 0.5},

  // Bottom
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  ctaBtn: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaTxt: {fontSize: 16, fontFamily: FONTS.SemiBold},
  qtyControl: {
    flex: 1,
    flexDirection: 'row',
    height: 50,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: GREEN,
  },
  qtyBtn: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  qtyTxt: {
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 20,
    fontFamily: FONTS.SemiBold,
    color: '#fff',
    backgroundColor: '#245F32',
  },
});