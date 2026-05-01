import {
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { SwiperFlatList } from 'react-native-swiper-flatlist';
import Constants, { Currency, FONTS } from '../../../Assets/Helpers/constant';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GroceryCartContext, LoadContext, ToastContext, UserContext } from '../../../../App';
import { BackIcon, CartIcon, ClockIcon, MinusIcon, Plus2Icon, PlusIcon, StarIcon, UnfavIcon, SearchIcon, UparrowIcon, DownarrowIcon } from '../../../../Theme';
import { goBack, navigate } from '../../../../navigationRef';
import { GetApi, Post } from '../../../Assets/Helpers/Service';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const GroceryPreview = props => {
  const productid = props?.route?.params;
  const { t } = useTranslation();
  const [isalreadyadd, setisalreadyadd] = useState(false);
  const [currentproduct, setcurrentproduct] = useState({});
  const [grocerycartdetail, setgrocerycartdetail] = useContext(GroceryCartContext);
  const [toast, setToast] = useContext(ToastContext);
  const [loading, setLoading] = useContext(LoadContext);
  const [user] = useContext(UserContext);
  const [selectedslot, setsselectedslot] = useState();
  const [productdata, setproductdata] = useState();
  const [isInCart, setIsInCart] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [availableQty, setAvailableQty] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [frequentlyBought, setFrequentlyBought] = useState([]);

  const sumdata =
    grocerycartdetail && grocerycartdetail.length > 0
      ? grocerycartdetail.reduce((a, item) => {
        return Number(a) + Number(item?.offer) * Number(item?.qty);
      }, 0)
      : null;

  useEffect(() => {
    if (productid) getProductById();
  }, []);

  useEffect(() => {
    const current = grocerycartdetail.find(
      item => item?.productid === productdata?._id,
    );
    setcurrentproduct(current);
  }, [grocerycartdetail]);

  useEffect(() => {
    if (grocerycartdetail.length > 0) {
      const cartItem = grocerycartdetail.find(
        f =>
          f.productid === productdata?._id &&
          f.price_slot?.value === selectedslot?.value,
      );
      if (cartItem) {
        setIsInCart(true);
        setAvailableQty(cartItem.qty);
      } else {
        setIsInCart(false);
        setAvailableQty(0);
      }
    } else {
      setIsInCart(false);
      setAvailableQty(0);
    }
  }, [grocerycartdetail, productdata, selectedslot]);

  const togglefav = id => {
    Post(`grocerytogglefavorite`, { groceryid: id }).then(
      async res => {
        if (res.status) {
          setproductdata(prev => ({ ...prev, isFavorite: !prev?.isFavorite }));
        }
      },
      err => console.log(err),
    );
  };

  const getProductById = () => {
    setLoading(true);
    GetApi(`getGroceryById/${productid}${user?._id ? `?userId=${user._id}` : ''}`).then(
      async res => {
        setLoading(false);
        if (res.status) {
          setproductdata(res.data);
          if (res?.data?.price_slot && res?.data?.price_slot?.length > 0) {
            setsselectedslot(res?.data?.price_slot[0]);
          }
          if (res.data?.sellerid) {
            fetchFrequentlyBought(res.data.sellerid, res.data._id);
          }
        }
      },
      err => {
        setLoading(false);
        console.log(err);
      },
    );
  };

  const fetchFrequentlyBought = (sellerId, excludeId) => {
    const uid = user?._id || '';
    GetApi(`getTopGroceryBySeller/${sellerId}?excludeIds=${excludeId}&limit=6&userId=${uid}`).then(
      res => { if (res.status) setFrequentlyBought(res.data); },
      err => console.log(err),
    );
  };

  const cartdata = async () => {
    const existingCart = Array.isArray(grocerycartdetail) ? grocerycartdetail : [];
    const existingProduct = existingCart.find(
      f =>
        f.productid === productdata._id &&
        f.price_slot?.value === selectedslot?.value,
    );

    if (existingCart.length > 0) {
      const currentSellerId = existingCart[0].seller_id;
      if (productdata.sellerid !== currentSellerId) {
        const newProduct = {
          productid: productdata._id,
          productname: productdata.name,
          price: selectedslot.other_price,
          offer: selectedslot.our_price,
          price_slot: selectedslot,
          image: productdata.image[0],
          qty: 1,
          seller_id: productdata.sellerid,
          seller_profile: productdata.seller_profile?._id,
          seller_location: productdata.seller_profile?.location,
        };
        const updatedCart = [newProduct];
        setgrocerycartdetail(updatedCart);
        await AsyncStorage.setItem('grocerycartdata', JSON.stringify(updatedCart));
        setAvailableQty(1);
        return;
      }
    }

    if (!existingProduct) {
      const newProduct = {
        productid: productdata._id,
        productname: productdata.name,
        price: selectedslot.other_price,
        offer: selectedslot.our_price,
        price_slot: selectedslot,
        image: productdata.image[0],
        qty: 1,
        seller_id: productdata.sellerid,
        seller_profile: productdata.seller_profile?._id,
        seller_location: productdata.seller_profile?.location,
      };
      const updatedCart = [...existingCart, newProduct];
      setgrocerycartdetail(updatedCart);
      await AsyncStorage.setItem('grocerycartdata', JSON.stringify(updatedCart));
    }
  };

  const discountPercent =
    selectedslot?.other_price && selectedslot?.our_price
      ? (((selectedslot.other_price - selectedslot.our_price) / selectedslot.other_price) * 100).toFixed(0)
      : null;

  const isVeg = productdata?.grocerycategory?.name?.toLowerCase().includes('veg') ||
    productdata?.categoryName?.toLowerCase().includes('veg') ||
    true; // default veg indicator

  return (
    <View style={styles.container}>

      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* Product Image Swiper */}
        <View style={styles.imageContainer}>
          <SwiperFlatList
            data={productdata?.image || []}
            onChangeIndex={({ index }) => setCurrentIndex(index)}
            renderItem={({ item, index }) => (
              <View style={{ width: SCREEN_WIDTH }}>
                <Image
                  source={{ uri: item }}
                  style={styles.productImage}
                  resizeMode="contain"
                  key={index}
                />
              </View>
            )}
          />
          {/* Pagination dots */}
          {productdata?.image && productdata.image.length > 1 && (
            <View style={styles.paginationRow}>
              {productdata.image.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    i === currentIndex ? styles.activeDot : styles.inactiveDot,
                  ]}
                />
              ))}
            </View>
          )}

          <View style={styles.header}>
        <TouchableOpacity style={styles.headerIconBtn} onPress={() => goBack()}>
          <BackIcon width={20} height={20} />
        </TouchableOpacity>
        {/* <View style={styles.headerRight}> */}
          <TouchableOpacity style={styles.headerIconBtn}>
            <UnfavIcon
              color={productdata?.isFavorite ? '#F14141' : '#fff'}
              width={20}
              height={20}
              onPress={() => togglefav(productdata?._id)}
            />
          </TouchableOpacity>
          {/* <TouchableOpacity style={styles.headerIconBtn}>
            <SearchIcon width={20} height={20} />
          </TouchableOpacity> */}
          {/* <TouchableOpacity style={styles.headerIconBtn}>
            <ShareIcon width={20} height={20} />
          </TouchableOpacity> */}
        {/* </View> */}
      </View>
        </View>

        {/* Product Info */}
        <View style={styles.infoSection}>
          {/* Veg Badge */}
          {/* <View style={styles.vegRow}>
            <View style={styles.vegBadge}>
              <View style={styles.vegDot} />
            </View>
            <Text style={styles.vegText}>{t('Veg')}</Text>
          </View> */}

          {/* Rating & Delivery */}
          <View style={styles.ratingRow}>
            {productdata?.averageRating && (
              <View style={styles.ratingChip}>
                <StarIcon color="#FFB800" width={13} height={13} />
                <Text style={styles.ratingVal}>{Number(productdata.averageRating).toFixed(1)}</Text>
                {productdata?.totalReviews > 0 && (
                  <Text style={styles.ratingCount}> ({productdata.totalReviews})</Text>
                )}
              </View>
            )}
            {/* <View style={styles.dot2} />
            <Text style={styles.deliveryTime}>⏱ 17 mins</Text> */}
          </View>

          {/* Product Name */}
          <Text style={styles.productName}>{productdata?.name}</Text>

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={styles.mainPrice}>{Currency}{selectedslot?.our_price}</Text>
            {selectedslot?.other_price && selectedslot.other_price !== selectedslot.our_price && (
              <Text style={styles.strikePrice}>{Currency}{selectedslot?.other_price}</Text>
            )}
            {discountPercent && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountBadgeText}>{discountPercent}% OFF</Text>
              </View>
            )}
          </View>

          {/* Tax Note */}
          {/* {selectedslot && (
            <Text style={styles.taxNote}>{Currency}{selectedslot?.our_price} {t('Inclusive of all taxes')}</Text>
          )} */}

          {/* View Product Details Toggle */}
          <TouchableOpacity
            style={styles.detailsToggle}
            onPress={() => setShowDetails(!showDetails)}
            activeOpacity={0.7}>
            <Text style={styles.detailsToggleText}>
              {showDetails ? t('Hide Product details') : t('View Product details')}
            </Text>
            {showDetails ? <UparrowIcon /> : <DownarrowIcon color={Constants.normal_green} />}
          </TouchableOpacity>

          {/* Collapsible Details */}
          {showDetails && (
            <View style={styles.detailsBox}>
              <Text style={styles.detailsBoxTitle}>{t('Key Information')}</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailKey}>{t('Category')}</Text>
                <Text style={styles.detailVal}>{productdata?.grocerycategory?.name || productdata?.categoryName}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailKey}>{t('Manufacturer')}</Text>
                <Text style={styles.detailVal}>{productdata?.manufacturername}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailKey}>{t('Expiry Date')}</Text>
                <Text style={styles.detailVal}>{moment(productdata?.expirydate).format('DD MMM YYYY')}</Text>
              </View>
              {productdata?.short_description ? (
                <View style={styles.detailRow}>
                  <Text style={styles.detailKey}>{t('Description')}</Text>
                  <Text style={styles.detailVal}>{productdata?.short_description}</Text>
                </View>
              ) : null}
              {productdata?.long_description ? (
                <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
                  <Text style={styles.detailKey}>{t('Details')}</Text>
                  <Text style={styles.detailVal}>{productdata?.long_description}</Text>
                </View>
              ) : null}
            </View>
          )}
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Weight/Slot Selector */}
        {productdata?.price_slot && productdata.price_slot.length > 0 && productdata.price_slot[0].unit && (
          <View style={styles.slotSection}>
            <Text style={styles.slotSectionTitle}>{t('Select Pack Size')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
              {productdata.price_slot.map((item, i) => {
                const slotDiscount = (((item.other_price - item.our_price) / item.other_price) * 100).toFixed(0);
                const isSelected = selectedslot?.value === item.value;
                return (
                  <TouchableOpacity
                    key={i}
                    style={[styles.slotCard, isSelected && styles.slotCardActive, { marginRight: i === productdata.price_slot.length - 1 ? 20 : 10 }]}
                    onPress={() => setsselectedslot(item)}>
                    {slotDiscount > 0 && (
                      <View style={styles.slotDiscountBadge}>
                        <Text style={styles.slotDiscountText}>{slotDiscount}% OFF</Text>
                      </View>
                    )}
                    <Text style={[styles.slotWeight, isSelected && styles.slotWeightActive]}>
                      {item.value}{item.unit}
                    </Text>
                    <Text style={[styles.slotPrice, isSelected && styles.slotPriceActive]}>
                      {Currency}{item.our_price}
                    </Text>
                    {item.other_price !== item.our_price && (
                      <Text style={styles.slotOldPrice}>{Currency}{item.other_price}</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Frequently Bought */}
        {frequentlyBought.length > 0 && (
          <View style={styles.freqSection}>
            <Text style={styles.freqTitle}>{t('Frequently Bought')}</Text>
            <FlatList
              data={frequentlyBought}
              numColumns={2}
              scrollEnabled={false}
              keyExtractor={item => item._id}
              contentContainerStyle={{paddingHorizontal: 12, paddingTop: 8}}
              columnWrapperStyle={{gap: 8, marginBottom: 8}}
              renderItem={({item}) => {
                const avgRating = item.averageRating ? Number(item.averageRating).toFixed(1) : null;
                const reviewCount = item.totalReviews || 0;
                const cartItem = grocerycartdetail?.find(
                  f => f.productid === item._id && f.price_slot?.value === item.price_slot?.[0]?.value,
                );
                return (
                  <TouchableOpacity
                    style={styles.freqCard}
                    activeOpacity={0.85}
                    onPress={() => navigate('GroceryPreview', item._id)}>
                    <View style={styles.freqImgContainer}>
                      <Image
                        source={{uri: item.image?.[0]}}
                        style={styles.freqCardImg}
                        resizeMode="contain"
                      />
                      {cartItem?.qty > 0 ? (
                        <View style={styles.freqStepperBtn}>
                          <TouchableOpacity
                            style={styles.freqStepperTouch}
                            onPress={async e => {
                              e.stopPropagation?.();
                              const existingCart = Array.isArray(grocerycartdetail) ? grocerycartdetail : [];
                              const updatedCart = cartItem.qty <= 1
                                ? existingCart.filter(f => !(f.productid === item._id && f.price_slot?.value === item.price_slot?.[0]?.value))
                                : existingCart.map(f => f.productid === item._id && f.price_slot?.value === item.price_slot?.[0]?.value ? {...f, qty: f.qty - 1} : f);
                              setgrocerycartdetail(updatedCart);
                              await AsyncStorage.setItem('grocerycartdata', JSON.stringify(updatedCart));
                            }}>
                            <MinusIcon color={Constants.normal_green} height={10} width={10} />
                          </TouchableOpacity>
                          <Text style={styles.freqStepperQty}>{cartItem.qty}</Text>
                          <TouchableOpacity
                            style={styles.freqStepperTouch}
                            onPress={async e => {
                              e.stopPropagation?.();
                              const existingCart = Array.isArray(grocerycartdetail) ? grocerycartdetail : [];
                              const updatedCart = existingCart.map(f => f.productid === item._id && f.price_slot?.value === item.price_slot?.[0]?.value ? {...f, qty: f.qty + 1} : f);
                              setgrocerycartdetail(updatedCart);
                              await AsyncStorage.setItem('grocerycartdata', JSON.stringify(updatedCart));
                            }}>
                            <PlusIcon color={Constants.normal_green} height={10} width={10} />
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={styles.freqAddBtn}
                          onPress={async e => {
                            e.stopPropagation?.();
                            const existingCart = Array.isArray(grocerycartdetail) ? grocerycartdetail : [];
                            const newProduct = {
                              productid: item._id,
                              productname: item.name,
                              price: item?.price_slot?.[0]?.other_price,
                              offer: item?.price_slot?.[0]?.our_price,
                              image: item.image?.[0],
                              price_slot: item?.price_slot?.[0],
                              qty: 1,
                              seller_id: item.sellerid,
                              seller_profile: item.seller_profile?._id,
                              seller_location: item.seller_profile?.location,
                            };
                            const updatedCart = [...existingCart, newProduct];
                            setgrocerycartdetail(updatedCart);
                            await AsyncStorage.setItem('grocerycartdata', JSON.stringify(updatedCart));
                          }}>
                          <Text style={styles.freqAddBtnTxt}>ADD+</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    <View style={styles.freqInfo}>
                      <View style={styles.freqPriceRow}>
                        <Text style={styles.freqPriceTxt}>{Currency}{item.price_slot?.[0]?.our_price}</Text>
                        <Text style={styles.freqWeightTxt}> {item.price_slot?.[0]?.value}{item.price_slot?.[0]?.unit}</Text>
                      </View>
                      <Text style={styles.freqNameTxt} numberOfLines={2}>{item.name}</Text>
                      {avgRating && (
                        <View style={styles.freqRatingRow}>
                          <StarIcon height={10} width={10} color="#F5A623" />
                          <Text style={styles.freqRatingTxt}> {avgRating}</Text>
                          <Text style={styles.freqReviewTxt}> ({reviewCount})</Text>
                        </View>
                      )}
                      {/* <View style={styles.freqDeliveryRow}>
                        <ClockIcon height={10} width={10} color={Constants.customgrey} />
                        <Text style={styles.freqDeliveryTxt}> 17 mins</Text>
                      </View> */}
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        )}

        {/* Bottom padding for cart bar */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View style={styles.stickyBottom}>
        <View style={styles.stickyPriceCol}>
          <Text style={styles.stickyWeight}>
            {selectedslot?.value}{selectedslot?.unit}
          </Text>
          <Text style={styles.stickyPrice}>{Currency}{selectedslot?.our_price}</Text>
          {/* <Text style={styles.stickyTax}>{t('Inclusive of all taxes')}</Text> */}
        </View>

        {isInCart ? (
          <View style={styles.qtyControl}>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={async () => {
                if (availableQty > 1) {
                  const updatedCart = grocerycartdetail.map(item => {
                    if (
                      item.productid === currentproduct?.productid &&
                      item.price_slot?.value === selectedslot?.value
                    ) {
                      return { ...item, qty: item.qty - 1 };
                    }
                    return item;
                  });
                  setgrocerycartdetail(updatedCart);
                  await AsyncStorage.setItem('grocerycartdata', JSON.stringify(updatedCart));
                  setAvailableQty(availableQty - 1);
                } else {
                  const updatedCart = grocerycartdetail.filter(item =>
                    !(item.productid === currentproduct?.productid &&
                      item.price_slot?.value === selectedslot?.value),
                  );
                  setgrocerycartdetail(updatedCart);
                  await AsyncStorage.setItem('grocerycartdata', JSON.stringify(updatedCart));
                  setIsInCart(false);
                  setAvailableQty(0);
                }
              }}>
              <MinusIcon color="#fff" height={16} width={16} />
            </TouchableOpacity>
            <Text style={styles.qtyText}>{availableQty}</Text>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={async () => {
                const updatedCart = grocerycartdetail.map(item => {
                  if (
                    item.productid === currentproduct?.productid &&
                    item.price_slot?.value === selectedslot?.value
                  ) {
                    return { ...item, qty: item.qty + 1 };
                  }
                  return item;
                });
                setgrocerycartdetail(updatedCart);
                await AsyncStorage.setItem('grocerycartdata', JSON.stringify(updatedCart));
                setAvailableQty(availableQty + 1);
              }}>
              <Plus2Icon color="#fff" height={16} width={16} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.addToCartBtn} onPress={cartdata}>
            <Text style={styles.addToCartText}>{t('Add to cart')}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* View Cart Bar */}
      {currentproduct && grocerycartdetail.length > 0 && (
        <TouchableOpacity
          style={styles.viewCartBar}
          onPress={() => navigate('Grocerytab', { screen: 'Cart' })}>
          <Text style={styles.viewCartLeft}>
            {grocerycartdetail.length} {t('items')} | {Currency}{sumdata}
          </Text>
          <View style={styles.viewCartRight}>
            <CartIcon color="#fff" width={18} height={18} />
            <Text style={styles.viewCartText}>{t('View Cart')}</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default GroceryPreview;

const LIGHT_GREEN = '#E8F5E9';
const BORDER = '#E8E8E8';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingTop: Platform.OS === 'android' ? 14 : 10,
    position:'absolute',
    top:10,
    width:'100%',
    // backgroundColor: 'red',
  },
  headerIconBtn: {
    height: 38,
    width: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFFB2',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    boxShadow: '0 0px 5.9px 0px #0000002B',
  },
  headerRight: {
    flexDirection: 'row',
  },

  // Image
  imageContainer: {
    // backgroundColor: '#F8F8F8',
    position: 'relative',
    top: -10,
  },
  productImage: {
    height: 280,
    width: SCREEN_WIDTH,
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    // paddingVertical: 10,
    gap: 5,
  },
  dot: {
    height: 7,
    borderRadius: 4,
    marginHorizontal: 3,
    marginTop:5,
  },
  activeDot: {
    width: 7,
    backgroundColor: Constants.normal_green,
  },
  inactiveDot: {
    width: 7,
    backgroundColor: '#C8C8C8',
  },

  // Info Section
  infoSection: {
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: '#fff',
  },
  vegRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  vegBadge: {
    height: 18,
    width: 18,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: Constants.normal_green,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vegDot: {
    height: 9,
    width: 9,
    borderRadius: 5,
    backgroundColor: Constants.normal_green,
  },
  vegText: {
    fontSize: 13,
    color: Constants.normal_green,
    fontFamily: FONTS.SemiBold,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  ratingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingVal: {
    fontSize: 13,
    color: '#333',
    fontFamily: FONTS.SemiBold,
  },
  ratingCount: {
    fontSize: 13,
    color: '#888',
    fontFamily: FONTS.Regular,
  },
  dot2: {
    height: 4,
    width: 4,
    borderRadius: 2,
    backgroundColor: '#CCC',
  },
  deliveryTime: {
    fontSize: 13,
    color: '#555',
    fontFamily: FONTS.Regular,
  },
  productName: {
    fontSize: 16,
    color: '#1C1C1C',
    fontFamily: FONTS.SemiBold,
    lineHeight: 26,
    marginBottom: 10,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  mainPrice: {
    fontSize: 18,
    color: '#1C1C1C',
    fontFamily: FONTS.SemiBold,
  },
  strikePrice: {
    fontSize: 14,
    color: '#999',
    fontFamily: FONTS.Regular,
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: Constants.light_green,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  discountBadgeText: {
    color: Constants.normal_green,
    fontSize: 12,
    fontFamily: FONTS.SemiBold,
    lineHeight: 16,
  },
  taxNote: {
    fontSize: 12,
    color: '#999',
    fontFamily: FONTS.Regular,
    marginBottom: 12,
  },

  // Details Toggle
  detailsToggle: {
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    // marginTop: 4,
    flexDirection:'row',
    alignItems:'center',
    gap:5
  },
  detailsToggleText: {
    fontSize: 14,
    color: Constants.normal_green,
    fontFamily: FONTS.Medium,
  },
  detailsBox: {
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: 'hidden',
    marginBottom: 10,
  },
  detailsBoxTitle: {
    fontSize: 14,
    color: '#1C1C1C',
    fontFamily: FONTS.SemiBold,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  detailRow: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  detailKey: {
    flex: 1,
    fontSize: 13,
    color: '#666',
    fontFamily: FONTS.Regular,
  },
  detailVal: {
    flex: 1.5,
    fontSize: 13,
    color: '#1C1C1C',
    fontFamily: FONTS.Regular,
    textAlign: 'right',
  },

  // Divider
  divider: {
    height: 8,
    backgroundColor: '#F2F2F2',
    marginTop: 16,
  },

  // Slot Selector
  slotSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  slotSectionTitle: {
    fontSize: 15,
    color: '#1C1C1C',
    fontFamily: FONTS.SemiBold,
  },
  slotCard: {
    width: 105,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: BORDER,
    backgroundColor: '#fff',
    marginLeft: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  slotCardActive: {
    borderColor: Constants.normal_green,
    backgroundColor: LIGHT_GREEN,
  },
  slotDiscountBadge: {
    backgroundColor: Constants.normal_green,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  slotDiscountText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: FONTS.SemiBold,
    lineHeight: 16,
  },
  slotWeight: {
    fontSize: 14,
    color: '#555',
    fontFamily: FONTS.Regular,
    marginBottom: 2,
  },
  slotWeightActive: {
    color: Constants.normal_green,
    fontFamily: FONTS.SemiBold,
  },
  slotPrice: {
    fontSize: 15,
    color: '#1C1C1C',
    fontFamily: FONTS.SemiBold,
  },
  slotPriceActive: {
    color: Constants.normal_green,
  },
  slotOldPrice: {
    fontSize: 11,
    color: '#AAA',
    fontFamily: FONTS.Regular,
    textDecorationLine: 'line-through',
    marginTop: 1,
  },

  // Sticky Bottom Bar
  stickyBottom: {
    position: 'absolute',
    bottom: grocerycartdetail => (grocerycartdetail?.length > 0 ? 80 : 20),
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: BORDER,
    bottom: 0,
    paddingBottom: 3,
  },
  stickyPriceCol: {
    flex: 1,
  },
  stickyWeight: {
    fontSize: 12,
    color: '#888',
    fontFamily: FONTS.Regular,
  },
  stickyPrice: {
    fontSize: 16,
    color: '#1C1C1C',
    fontFamily: FONTS.SemiBold,
  },
  stickyTax: {
    fontSize: 11,
    color: '#AAA',
    fontFamily: FONTS.Regular,
  },
  addToCartBtn: {
    backgroundColor: Constants.normal_green,
    paddingHorizontal: 32,
    paddingVertical: 7,
    borderRadius: 10,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: FONTS.SemiBold,
  },

  // Qty Control
  qtyControl: {
    flexDirection: 'row',
    backgroundColor: Constants.normal_green,
    borderRadius: 10,
    overflow: 'hidden',
    // height: 46,
    paddingVertical: 7,
    width: 130,
  },
  qtyBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
    color: '#fff',
    fontSize: 16,
    fontFamily: FONTS.SemiBold,
    // backgroundColor: 'rgba(255,255,255,0.15)',
    // lineHeight: 46,
  },

  // View Cart Bar
  viewCartBar: {
    position: 'absolute',
    bottom: 65,
    left: 16,
    right: 16,
    backgroundColor: Constants.normal_green,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    height: 54,
    shadowColor: Constants.normal_green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  viewCartLeft: {
    color: '#fff',
    fontSize: 14,
    fontFamily: FONTS.SemiBold,
  },
  viewCartRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  viewCartText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: FONTS.SemiBold,
  },

  // Frequently Bought
  freqSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 8,
    borderTopColor: '#F2F2F2',
  },
  freqTitle: {
    fontSize: 15,
    color: Constants.black,
    fontFamily: FONTS.SemiBold,
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  freqCard: {
    width: (Dimensions.get('window').width - 32) / 2,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  freqImgContainer: {
    paddingTop: 8,
    paddingBottom: 34,
    position: 'relative',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  freqCardImg: {
    width: '100%',
    height: 110,
  },
  freqAddBtn: {
    position: 'absolute',
    bottom: 0,
    right: -8,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: Constants.normal_green,
    justifyContent: 'center',
    alignItems: 'center',
  },
  freqAddBtnTxt: {
    fontSize: 10,
    color: Constants.normal_green,
    fontFamily: FONTS.SemiBold,
    letterSpacing: 0.3,
  },
  freqStepperBtn: {
    position: 'absolute',
    bottom: 0,
    right: -8,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Constants.normal_green,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 3,
    gap: 4,
  },
  freqStepperTouch: {
    padding: 2,
  },
  freqStepperQty: {
    fontSize: 10,
    color: Constants.normal_green,
    fontFamily: FONTS.SemiBold,
    minWidth: 12,
    textAlign: 'center',
  },
  freqInfo: {
    padding: 7,
    paddingTop: 6,
  },
  freqPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
  },
  freqPriceTxt: {
    fontSize: 13,
    color: Constants.black,
    fontFamily: FONTS.SemiBold,
  },
  freqWeightTxt: {
    fontSize: 11,
    color: Constants.customgrey,
    fontFamily: FONTS.Regular,
  },
  freqNameTxt: {
    fontSize: 11,
    color: Constants.black,
    fontFamily: FONTS.Regular,
    lineHeight: 15,
  },
  freqRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  freqRatingTxt: {
    fontSize: 10,
    color: Constants.black,
    fontFamily: FONTS.SemiBold,
  },
  freqReviewTxt: {
    fontSize: 10,
    color: Constants.customgrey,
    fontFamily: FONTS.Regular,
  },
  freqDeliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  freqDeliveryTxt: {
    fontSize: 10,
    color: Constants.customgrey,
    fontFamily: FONTS.Regular,
  },
});