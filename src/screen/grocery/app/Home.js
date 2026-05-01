import {
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useContext, useEffect, useState} from 'react';
import Constants, {Currency, FONTS} from '../../../Assets/Helpers/constant';
import {
  MinusIcon,
  PlusIcon,
  RightArrow,
  SearchIcon,
  UnfavIcon,
  StarIcon,
  ClockIcon,
  GrocerybtmwelIcon,
} from '../../../../Theme';
import LinearGradient from 'react-native-linear-gradient';
import {navigate} from '../../../../navigationRef';
import {GetApi, Post} from '../../../Assets/Helpers/Service';
import {
  GroceryCartContext,
  GroceryUserContext,
  LoadContext,
  ToastContext,
  UserContext,
} from '../../../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SwiperFlatList from 'react-native-swiper-flatlist';
import Header from '../../../Assets/Component/Header';
import {useTranslation} from 'react-i18next';
import Scheliton from '../../../Assets/Component/Scheliton';
import TranslateHandled from '../../../Assets/Component/TranslateHandled';
import CuurentLocation from '../../../Assets/Component/CuurentLocation';

// ─── Smart Bestseller Image Grid ────────────────────────────────────────────
// Rules:
//  1 image  → fills full card
//  2 images → each fills 50% width, full height
//  3 images → first fills full left half; right half split top/bottom
//  4+ images→ 2×2 grid; last cell shows the extra-count overlay
const BestsellerImageGrid = ({groceries = [], totalCount = 0}) => {
  const images = groceries.map(g => g.image?.[0]).filter(Boolean);
  const count = images.length;

  if (count === 0) {
    return <View style={bsGrid.empty} />;
  }

  if (count === 1) {
    return (
      <View style={bsGrid.container}>
        <Image source={{uri: images[0]}} style={bsGrid.full} resizeMode="cover" />
      </View>
    );
  }

  if (count === 2) {
    return (
      <View style={[bsGrid.container, {flexDirection: 'row'}]}>
        <Image source={{uri: images[0]}} style={bsGrid.half} resizeMode="cover" />
        <View style={bsGrid.dividerV} />
        <Image source={{uri: images[1]}} style={bsGrid.half} resizeMode="cover" />
      </View>
    );
  }

  if (count === 3) {
    return (
      <View style={[bsGrid.container, {flexDirection: 'row'}]}>
        <Image source={{uri: images[0]}} style={bsGrid.half} resizeMode="cover" />
        <View style={bsGrid.dividerV} />
        <View style={{flex: 1}}>
          <Image source={{uri: images[1]}} style={bsGrid.quarterTop} resizeMode="cover" />
          <View style={bsGrid.dividerH} />
          <Image source={{uri: images[2]}} style={bsGrid.quarterBottom} resizeMode="cover" />
        </View>
      </View>
    );
  }

  // 4 or more → 2×2 grid
  const extraCount = totalCount > 0 ? totalCount : count > 4 ? count - 3 : 0;
  return (
    <View style={[bsGrid.container, {flexDirection: 'row', flexWrap: 'wrap'}]}>
      {[0, 1, 2, 3].map(idx => {
        const isLast = idx === 3;
        const showOverlay = isLast && extraCount > 0;
        return (
          <View key={idx} style={bsGrid.quadCell}>
            {images[idx] ? (
              <Image
                source={{uri: images[idx]}}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
              />
            ) : (
              <View style={[StyleSheet.absoluteFill, {backgroundColor: '#f0f0f0'}]} />
            )}
            {showOverlay && (
              <View style={bsGrid.overlay}>
                <Text style={bsGrid.overlayTxt}>+{extraCount}</Text>
                <Text style={bsGrid.overlayLabel}>more</Text>
              </View>
            )}
            {/* thin grid lines */}
            {idx % 2 === 0 && <View style={bsGrid.cellDividerR} />}
            {idx < 2 && <View style={bsGrid.cellDividerB} />}
          </View>
        );
      })}
    </View>
  );
};

const bsGrid = StyleSheet.create({
  container: {
    width: '100%',
    height: 160,
    overflow: 'hidden',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  empty: {
    height: 160,
    backgroundColor: '#f0f0f0',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  full: {
    width: '100%',
    height: '100%',
  },
  half: {
    flex: 1,
    height: '100%',
  },
  quarterTop: {
    flex: 1,
    width: '100%',
  },
  quarterBottom: {
    flex: 1,
    width: '100%',
  },
  dividerV: {
    width: 1,
    backgroundColor: '#fff',
  },
  dividerH: {
    height: 1,
    backgroundColor: '#fff',
  },
  quadCell: {
    width: '50%',
    height: '50%',
    position: 'relative',
    overflow: 'hidden',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayTxt: {
    color: '#fff',
    fontSize: 18,
    fontFamily: FONTS.Bold ?? FONTS.SemiBold,
    lineHeight: 22,
  },
  overlayLabel: {
    color: '#fff',
    fontSize: 11,
    fontFamily: FONTS.Regular,
  },
  cellDividerR: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#fff',
  },
  cellDividerB: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 1,
    backgroundColor: '#fff',
  },
});

// ────────────────────────────────────────────────────────────────────────────

const Home = () => {
  const {t} = useTranslation();
  const [grocerycartdetail, setgrocerycartdetail] =
    useContext(GroceryCartContext);
  const [toast, setToast] = useContext(ToastContext);
  const [loading, setLoading] = useContext(LoadContext);
  const [user] = useContext(UserContext);
  const [imgLoading, setImgLoading] = useState(true);
  const [carosalimg, setcarosalimg] = useState([]);
  const [storelist, setstorelist] = useState([]);
  const [categoryWithProducts, setCategoryWithProducts] = useState([]);
  const [groceryuserProfile, setgroceryuserProfile] =
    useContext(GroceryUserContext);

  useEffect(() => {
    getCategoryWithProducts();
  }, []);

  useEffect(() => {
    getnearbyshops();
  }, [groceryuserProfile]);

  const getCategoryWithProducts = () => {
    setLoading(true);
    GetApi(`getCategoryWithGrocerys`, {}).then(
      async res => {
        setLoading(false);
        if (res.status) {
          setCategoryWithProducts(res.data);
        }
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
      groceryuserProfile?.shipping_address?.location?.coordinates?.length > 0
    ) {
      const data = {
        role: 'GROCERYSELLER',
        location: groceryuserProfile.shipping_address.location,
      };
      Post(`getnearbystore`, data)
        .then(async res => {
          setLoading(false);
          if (res.status) {
            setstorelist(res.data);
          }
        })
        .catch(err => {
          setLoading(false);
          console.log(err);
        });
    } else {
      CuurentLocation(res => {
        const data = {
          role: 'GROCERYSELLER',
          location: {
            type: 'Point',
            coordinates: [res.coords.longitude, res.coords.latitude],
          },
        };
        Post(`getnearbystore`, data)
          .then(async res => {
            setLoading(false);
            if (res.status) {
              setstorelist(res.data);
            }
          })
          .catch(err => {
            setLoading(false);
            console.log(err);
          });
      });
    }
  };

  const getSetting = () => {
    GetApi(`getGroceryCarousel`, {}).then(
      async res => {
        setLoading(false);
        if (res.success) {
          setcarosalimg(res?.grocerycarousel[0].carousel);
        }
      },
      err => {
        setLoading(false);
        console.log(err);
      },
    );
  };

  const toggleFav = (groceryId) => {
    setCategoryWithProducts(prev =>
      prev.map(cat => ({
        ...cat,
        groceries: cat.groceries?.map(g =>
          g._id === groceryId ? {...g, isFavorite: !g.isFavorite} : g,
        ) || [],
      })),
    );
    Post('grocerytogglefavorite', {groceryid: groceryId}).then(
      () => {},
      () => {
        setCategoryWithProducts(prev =>
          prev.map(cat => ({
            ...cat,
            groceries: cat.groceries?.map(g =>
              g._id === groceryId ? {...g, isFavorite: !g.isFavorite} : g,
            ) || [],
          })),
        );
      },
    );
  };

  const cartdata = async productdata => {
    const existingCart = Array.isArray(grocerycartdetail)
      ? grocerycartdetail
      : [];

    const existingProduct = existingCart.find(
      f =>
        f.productid === productdata._id &&
        f.price_slot?.value === productdata?.price_slot[0]?.value,
    );
    if (existingCart.length > 0) {
      const currentSellerId = existingCart[0].seller_id;
      if (productdata.sellerid !== currentSellerId) {
        const newProduct = {
          productid: productdata._id,
          productname: productdata.name,
          price: productdata?.price_slot[0]?.other_price,
          offer: productdata?.price_slot[0]?.our_price,
          image: productdata.image[0],
          price_slot: productdata?.price_slot[0],
          qty: 1,
          seller_id: productdata.sellerid,
          seller_profile: productdata.seller_profile?._id,
          seller_location: productdata.seller_profile?.location,
        };
        const updatedCart = [newProduct];
        setgrocerycartdetail(updatedCart);
        await AsyncStorage.setItem(
          'grocerycartdata',
          JSON.stringify(updatedCart),
        );
        setToast('Successfully added to cart.');
        return;
      } else {
        let stringdata = grocerycartdetail.map(_i => {
          if (_i?.productid == productdata._id) {
            return {..._i, qty: _i?.qty + 1};
          } else {
            return _i;
          }
        });
        setgrocerycartdetail(stringdata);
        await AsyncStorage.setItem(
          'grocerycartdata',
          JSON.stringify(stringdata),
        );
      }
    }
    if (!existingProduct) {
      const newProduct = {
        productid: productdata._id,
        productname: productdata.name,
        price: productdata?.price_slot[0]?.other_price,
        offer: productdata?.price_slot[0]?.our_price,
        image: productdata.image[0],
        price_slot: productdata?.price_slot[0],
        qty: 1,
        seller_id: productdata.sellerid,
        seller_profile: productdata.seller_profile?._id,
        seller_location: productdata.seller_profile?.location,
      };
      const updatedCart = [...existingCart, newProduct];
      setgrocerycartdetail(updatedCart);
      await AsyncStorage.setItem(
        'grocerycartdata',
        JSON.stringify(updatedCart),
      );
    }
    setToast('Successfully added to cart.');
  };

  const decreaseQty = async productdata => {
    const existingCart = Array.isArray(grocerycartdetail) ? grocerycartdetail : [];
    const cartItem = existingCart.find(
      f => f.productid === productdata._id && f.price_slot?.value === productdata.price_slot?.[0]?.value,
    );
    if (!cartItem) return;
    const updatedCart =
      cartItem.qty <= 1
        ? existingCart.filter(
            f => !(f.productid === productdata._id && f.price_slot?.value === productdata.price_slot?.[0]?.value),
          )
        : existingCart.map(f =>
            f.productid === productdata._id && f.price_slot?.value === productdata.price_slot?.[0]?.value
              ? {...f, qty: f.qty - 1}
              : f,
          );
    setgrocerycartdetail(updatedCart);
    await AsyncStorage.setItem('grocerycartdata', JSON.stringify(updatedCart));
  };

  const width = Dimensions.get('window').width;
  const width2 = Dimensions.get('window').width - 30;

  const bestsellers = categoryWithProducts.filter(
    c => c.groceries?.length > 0,
  );

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../../Assets/Images/grocerybg.png')}
        style={{}}>
        <Header />
        <View style={{paddingBottom: 15}}>
          <TouchableOpacity
            style={[styles.inpcov]}
            onPress={() => {
              navigate('GrocerySearchpage');
            }}>
            <SearchIcon height={20} width={20} color={Constants.black} />
            <TextInput
              style={styles.input}
              editable={false}
              placeholder={t('Search')}
              onPress={() => navigate('GrocerySearchpage')}
              placeholderTextColor={Constants.customgrey2}
            />
          </TouchableOpacity>
        </View>
      </ImageBackground>

      <GrocerybtmwelIcon height={130} width={'100%'} style={{marginTop: -3}} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Bestsellers ── */}
        {bestsellers.length > 0 && (
          <>
            <View style={styles.covline}>
              <Text style={styles.sectionTitle}>{t('Bestsellers')}</Text>
            </View>
            <FlatList
              data={bestsellers}
              numColumns={2}
              scrollEnabled={false}
              keyExtractor={item => item._id}
              contentContainerStyle={{paddingHorizontal: 15}}
              columnWrapperStyle={{gap: 12, marginBottom: 12}}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={styles.bestsellerCard}
                  activeOpacity={0.85}
                  onPress={() =>
                    navigate('GroceryProducts', {
                      id: item._id,
                      name: item.name,
                    })
                  }>
                  {/* Smart image grid */}
                  <BestsellerImageGrid
                    groceries={item.groceries}
                    totalCount={item.totalCount}
                  />
                  {/* Card footer */}
                  <View style={styles.bestsellerCardBottom}>
                    <Text style={styles.bestsellerCatName} numberOfLines={1}>
                      {item.name}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.seeMoreRow}
              onPress={() => navigate('ProductWithCategoryForSeller')}>
              <Text style={styles.seealltxt}>{t('See more')}</Text>
              <RightArrow
                height={14}
                width={14}
                style={{alignSelf: 'center'}}
                color={Constants.normal_green}
              />
            </TouchableOpacity>
          </>
        )}

        {/* ── Per-category product sections ── */}
        {categoryWithProducts.map(category =>
          category.groceries?.length > 0 ? (
            <View key={category._id}>
              <View style={styles.covline}>
                <Text style={styles.sectionTitle} numberOfLines={1}>
                  {t('Stock up on')} {category.name}
                </Text>
                <TouchableOpacity
                  style={{flexDirection: 'row', alignItems: 'center'}}
                  onPress={() =>
                    navigate('GroceryProducts', {
                      id: category._id,
                      name: category.name,
                    })
                  }>
                  <Text style={styles.seealltxt}>{t('See all')}</Text>
                  <RightArrow
                    height={12}
                    width={12}
                    style={{alignSelf: 'center'}}
                    color={Constants.normal_green}
                  />
                </TouchableOpacity>
              </View>

              <FlatList
                data={category.groceries}
                numColumns={3}
                scrollEnabled={false}
                keyExtractor={item => item._id}
                contentContainerStyle={{paddingHorizontal: 12}}
                columnWrapperStyle={{gap: 8, marginBottom: 8}}
                renderItem={({item}) => {
                  const avgRating = item.averageRating ? Number(item.averageRating).toFixed(1) : null;
                  const reviewCount = item.totalReviews || 0;
                  return (
                    <TouchableOpacity
                      style={styles.productCard}
                      activeOpacity={0.85}
                      onPress={() => navigate('GroceryPreview', item._id)}>

                      {/* ── Image area ── */}
                      <View style={styles.productImgContainer}>
                        <Image
                          source={{uri: item.image?.[0]}}
                          style={styles.productCardImg}
                          resizeMode="contain"
                        />
                        {/* Heart / wishlist icon */}
                        <TouchableOpacity
                          style={styles.heartBtn}
                          onPress={e => { e.stopPropagation?.(); toggleFav(item._id); }}>
                          <UnfavIcon
                            height={16}
                            width={16}
                            color={item.isFavorite ? '#F14141' : null}
                          />
                        </TouchableOpacity>
                        {(() => {
                          const cartItem = grocerycartdetail?.find(
                            f => f.productid === item._id && f.price_slot?.value === item.price_slot?.[0]?.value,
                          );
                          return cartItem?.qty > 0 ? (
                            <View style={styles.stepperBtn}>
                              <TouchableOpacity
                                style={styles.stepperTouch}
                                onPress={e => { e.stopPropagation?.(); decreaseQty(item); }}>
                                <MinusIcon color={Constants.normal_green} height={10} width={10} />
                              </TouchableOpacity>
                              <Text style={styles.stepperQty}>{cartItem.qty}</Text>
                              <TouchableOpacity
                                style={styles.stepperTouch}
                                onPress={e => { e.stopPropagation?.(); cartdata(item); }}>
                                <PlusIcon color={Constants.normal_green} height={10} width={10} />
                              </TouchableOpacity>
                            </View>
                          ) : (
                            <TouchableOpacity
                              style={styles.addBtn}
                              onPress={e => { e.stopPropagation?.(); cartdata(item); }}>
                              <Text style={styles.addBtnTxt}>ADD+</Text>
                            </TouchableOpacity>
                          );
                        })()}
                      </View>

                      {/* ── Product info ── */}
                      <View style={styles.productInfo}>
                        {/* ADD+ pill */}
                        {/* Price + weight */}
                        <View style={styles.priceRow}>
                          <Text style={styles.productPriceTxt}>
                            {Currency}
                            {item.price_slot?.[0]?.our_price}
                          </Text>
                          <Text style={styles.productWeightTxt}>
                            {' '}
                            {item.price_slot?.[0]?.value}
                            {item.price_slot?.[0]?.unit}
                          </Text>
                        </View>

                        {/* Product name */}
                        <Text style={styles.productNameTxt} numberOfLines={2}>
                          {item.name}
                        </Text>

                        {/* Rating */}
                        {avgRating && (
                          <View style={styles.ratingRow}>
                            <StarIcon height={10} width={10} color="#F5A623" />
                            <Text style={styles.ratingTxt}> {avgRating}</Text>
                            <Text style={styles.reviewCountTxt}> ({reviewCount})</Text>
                          </View>
                        )}

                        {/* Delivery time */}
                        {/* <View style={styles.deliveryRow}>
                          <ClockIcon
                            height={10}
                            width={10}
                            color={Constants.customgrey}
                          />
                          <Text style={styles.deliveryTxt}>{' '}17 mins</Text>
                        </View> */}
                      </View>
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
          ) : null,
        )}

        {/* ── See all products ── */}
        {categoryWithProducts.length > 0 && (
          <TouchableOpacity
            style={styles.seeAllProductsBtn}
            onPress={() => navigate('ProductWithCategoryForSeller')}>
            <Text style={styles.seeAllProductsTxt}>
              {t('See all products')}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.white,
  },
  inpcov: {
    borderColor: Constants.customgrey,
    backgroundColor: '#FFFFFFDE',
    borderRadius: 40,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginHorizontal: 20,
  },
  input: {
    flex: 1,
    color: Constants.black,
    fontFamily: FONTS.Medium,
    fontSize: 16,
    textAlign: 'left',
    minHeight: 45,
    marginLeft: 10,
  },
  covline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    color: Constants.black,
    fontFamily: FONTS.SemiBold,
    flex: 1,
    marginRight: 8,
  },
  seealltxt: {
    fontSize: 14,
    color: Constants.normal_green,
    fontFamily: FONTS.SemiBold,
    marginHorizontal: 4,
  },

  // ── Bestseller card ──────────────────────────────────────────────────────
  bestsellerCard: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: Constants.white,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  bestsellerCardBottom: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  bestsellerCatName: {
    fontSize: 13,
    fontFamily: FONTS.SemiBold,
    color: Constants.black,
  },
  seeMoreRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 14,
  },

  // ── Product card (3-column) ──────────────────────────────────────────────
  productCard: {
    // flex: 1,
    borderRadius: 12,
    backgroundColor: Constants.white,
    // overflow: 'hidden',
    // shadowColor: '#000',
    // shadowOffset: {width: 0, height: 1},
    // shadowOpacity: 0.08,
    // shadowRadius: 4,
    // elevation: 2,
    // borderWidth: 0.05,
    // borderColor: '#ebebeb',
    width: 150, // 3 columns with 12px gap and 15px padding
  },
  productImgContainer: {
    // backgroundColor: '#FAFAFA',
    paddingTop: 8,
    paddingBottom: 34,    // space for ADD+ button
    position: 'relative',
    borderRadius: 10,
    borderWidth:1,
    borderColor: Constants.customgrey4,
  },
  productCardImg: {
    width: '100%',
    height: 90,
  },
  heartBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    padding: 2,
  },
  addBtn: {
    position: 'absolute',
    bottom: 0,
    right: -8,
    backgroundColor: '#E8F5E9',   // light green tint
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: Constants.normal_green,
    justifyContent:'center',
    alignItems:'center'
  },
  addBtnTxt: {
    fontSize: 10,
    color: Constants.normal_green,
    fontFamily: FONTS.SemiBold,
    letterSpacing: 0.3,
  },
  stepperBtn: {
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
  stepperTouch: {
    padding: 2,
  },
  stepperQty: {
    fontSize: 10,
    color: Constants.normal_green,
    fontFamily: FONTS.SemiBold,
    minWidth: 12,
    textAlign: 'center',
  },
  productInfo: {
    padding: 7,
    paddingTop: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
  },
  productPriceTxt: {
    fontSize: 13,
    color: Constants.black,
    fontFamily: FONTS.Bold ?? FONTS.SemiBold,
  },
  productWeightTxt: {
    fontSize: 11,
    color: Constants.customgrey,
    fontFamily: FONTS.Regular,
  },
  productNameTxt: {
    fontSize: 11,
    color: Constants.black,
    fontFamily: FONTS.Regular,
    // marginTop: 2,
    lineHeight: 15,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  ratingTxt: {
    fontSize: 10,
    color: Constants.black,
    fontFamily: FONTS.SemiBold,
  },
  reviewCountTxt: {
    fontSize: 10,
    color: Constants.customgrey,
    fontFamily: FONTS.Regular,
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  deliveryTxt: {
    fontSize: 10,
    color: Constants.customgrey,
    fontFamily: FONTS.Regular,
  },

  // ── See all products button ──────────────────────────────────────────────
  seeAllProductsBtn: {
    // marginHorizontal: 40,
    // marginVertical: 20,
    backgroundColor:Constants.light_green,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#2C614054',
    paddingVertical: 6,
    alignItems: 'center',
    width: '40%',
    marginBottom:110,
    alignSelf:'center'
  },
  seeAllProductsTxt: {
    fontSize: 14,
    color: Constants.normal_green,
    fontFamily: FONTS.Medium,
  },
});