import {
  FlatList,
  Image,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useContext, useEffect, useRef, useState} from 'react';
import {BackIcon, MinusIcon, PlusIcon, SearchIcon, UnfavIcon} from '../../../../Theme';
import Constants, {Currency, FONTS} from '../../../Assets/Helpers/constant';
import {FoodCartContext, LoadContext, ToastContext, UserContext} from '../../../../App';
import {GetApi, Post} from '../../../Assets/Helpers/Service';
import {goBack, navigate} from '../../../../navigationRef';
import {useTranslation} from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SearchPage = () => {
  const {t} = useTranslation();
  const inputRef = useRef(null);
  const [toast, setToast] = useContext(ToastContext);
  const [loading, setLoading] = useContext(LoadContext);
  const [user, setUser] = useContext(UserContext);
  const [foodcartdetail, setfoodcartdetail] = useContext(FoodCartContext);
  const [productlist, setproductlist] = useState([]);
  const [searchkey, setsearchkey] = useState('');
  const [page, setPage] = useState(1);
  const [curentData, setCurrentData] = useState([]);

  useEffect(() => {
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 200);
  }, []);

  const getsearchproducts = (p, text) => {
    setPage(p);
    GetApi(`foodSearch?page=${p}&key=${text}&userId=${user?._id}`).then(
      async res => {
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

  const togglefav = id => {
    setLoading(true);
    const data = {foodid: id};
    Post(`togglefavorite`, data).then(
      async res => {
        setLoading(false);
        getsearchproducts(page, searchkey);
      },
      err => {
        setLoading(false);
        console.log(err);
      },
    );
  };

  const cartdata = async item => {
    const existingCart = Array.isArray(foodcartdetail) ? foodcartdetail : [];
    const existing = existingCart.find(f => f.foodid === item._id);

    // Different seller → clear cart and add this item
    if (existingCart.length > 0 && item.sellerid !== existingCart[0].seller_id) {
      const updated = [{
        foodid: item._id,
        foodname: item.name,
        price: item.price,
        image: item.image?.[0],
        qty: 1,
        seller_id: item.sellerid,
        seller_name: item.seller_profile?.store_name || '',
        seller_profile: item.seller_profile?._id || item.seller_profile,
        seller_location: item.seller_profile?.location,
      }];
      setfoodcartdetail(updated);
      await AsyncStorage.setItem('foodcartdata', JSON.stringify(updated));
      return;
    }

    let updated;
    if (existing) {
      updated = existingCart.map(f =>
        f.foodid === item._id ? {...f, qty: f.qty + 1} : f,
      );
    } else {
      updated = [...existingCart, {
        foodid: item._id,
        foodname: item.name,
        price: item.price,
        image: item.image?.[0],
        qty: 1,
        seller_id: item.sellerid,
        seller_name: item.seller_profile?.store_name || '',
        seller_profile: item.seller_profile?._id || item.seller_profile,
        seller_location: item.seller_profile?.location,
      }];
    }
    setfoodcartdetail(updated);
    await AsyncStorage.setItem('foodcartdata', JSON.stringify(updated));
  };

  const decreaseCartItem = async item => {
    const existing = foodcartdetail.find(f => f.foodid === item._id);
    if (!existing) return;
    let updated;
    if (existing.qty > 1) {
      updated = foodcartdetail.map(f =>
        f.foodid === item._id ? {...f, qty: f.qty - 1} : f,
      );
    } else {
      updated = foodcartdetail.filter(f => f.foodid !== item._id);
    }
    setfoodcartdetail(updated);
    await AsyncStorage.setItem('foodcartdata', JSON.stringify(updated));
  };

  const fetchNextPage = () => {
    if (curentData.length === 20) {
      getsearchproducts(page + 1, searchkey);
    }
  };

  const renderItem = ({item}) => (
    <TouchableOpacity
      style={styles.productCard}
      activeOpacity={0.85}
      onPress={() => navigate('PreView', item?._id)}>
      {/* Left content */}
      <View style={styles.cardLeft}>
        {/* Discount badge */}
        {item?.discount ? (
          <View style={styles.discountBadge}>
            <View style={styles.discountDot} />
            <Text style={styles.discountText}>{item.discount}% OFF</Text>
          </View>
        ) : null}

        <Text style={styles.productName} numberOfLines={2}>
          {item?.name}
        </Text>

        <View style={styles.priceRow}>
          <Text style={styles.currentPrice}>
            {Currency}
            {item?.price}
          </Text>
          {item?.originalPrice ? (
            <Text style={styles.originalPrice}>
              {Currency}
              {item?.originalPrice}
            </Text>
          ) : null}
        </View>

        {item?.description ? (
          <Text style={styles.descriptionText} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}

        {/* Action icons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => togglefav(item?._id)}>
            <UnfavIcon color={item?.isFavorite ? '#F14141' : Constants.white} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Right image + ADD / stepper */}
      <View style={styles.cardRight}>
        <Image
          source={{uri: item?.image?.[0]}}
          style={styles.productImage}
          resizeMode="cover"
        />
        {(() => {
          const qty =
            foodcartdetail.find(f => f.foodid === item._id)?.qty || 0;
          return qty > 0 ? (
            <View style={styles.stepper}>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => decreaseCartItem(item)}>
                <MinusIcon
                  color={Constants.normal_green}
                  width={14}
                  height={14}
                />
              </TouchableOpacity>
              <Text style={styles.stepperQty}>{qty}</Text>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => cartdata(item)}>
                <PlusIcon
                  color={Constants.normal_green}
                  width={14}
                  height={14}
                />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => cartdata(item)}>
              <Text style={styles.addButtonText}>+ {t('ADD')}</Text>
            </TouchableOpacity>
          );
        })()}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => goBack()}>
            <BackIcon color={Constants.normal_green} />
          </TouchableOpacity>
          {/* Search bar */}
          <View style={styles.searchBar}>
            <SearchIcon
              height={20}
              width={20}
              style={{alignSelf: 'center'}}
              color={Constants.normal_green}
            />
            <TextInput
              placeholder={t('Search Food')}
              placeholderTextColor={'#aaa'}
              style={styles.searchInput}
              ref={inputRef}
              onChangeText={name => {
                getsearchproducts(1, name);
                setsearchkey(name);
              }}
            />
          </View>
        </View>

        {/* Results or empty state */}
        {productlist && productlist.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>{t('Recommended Items')}</Text>
            <FlatList
              data={productlist}
              keyExtractor={item => item?._id?.toString()}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              onEndReached={() => {
                if (productlist && productlist.length > 0) {
                  fetchNextPage();
                }
              }}
              onEndReachedThreshold={0.05}
            />
          </>
        ) : (
          <View style={styles.emptyState}>
            <Image
              source={require('../../../Assets/Images/cart.png')}
              style={styles.emptyImage}
            />
            <Text style={styles.emptyTitle}>
              {t("We couldn't find any result!")}
            </Text>
            <Text style={styles.emptySubtitle}>
              {t(
                'Please check your search for any typos or spelling errors, or try a different search term.',
              )}
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default SearchPage;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  /* ── Header ── */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 8 : 16,
    paddingBottom: 12,
    gap: 10,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: Constants.customgrey2,
    paddingHorizontal: 14,
    height: 44,
    backgroundColor: Constants.white,
    gap: 8,
    boxShadow: '0px 1px 3px 0.2px rgba(0,0,0,0.1)',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Constants.black,
    fontFamily: FONTS.SemiBold,
  },

  /* ── Section title ── */
  sectionTitle: {
    fontSize: 18,
    color: Constants.black,
    fontFamily: FONTS.Bold,
    paddingHorizontal: 16,
    marginBottom: 6,
    marginTop: 4,
  },

  /* ── List ── */
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },

  /* ── Product Card ── */
  productCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 14,
    paddingBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
    boxShadow: '0px 0px 10px 0.5px rgba(0,0,0,0.1)',
  },
  cardLeft: {
    flex: 1,
    paddingRight: 12,
    justifyContent: 'flex-start',
  },
  discountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 5,
  },
  discountDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#1a7a1a',
    borderWidth: 2,
    borderColor: '#a8e6a3',
  },
  discountText: {
    fontSize: 11,
    color: '#e63946',
    fontFamily: FONTS.Bold,
    letterSpacing: 0.4,
  },
  productName: {
    fontSize: 16,
    color: Constants.black,
    fontFamily: FONTS.Bold,
    lineHeight: 20,
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  currentPrice: {
    fontSize: 15,
    color: Constants.black,
    fontFamily: FONTS.SemiBold,
  },
  originalPrice: {
    fontSize: 13,
    color: '#aaa',
    fontFamily: FONTS.Medium,
    textDecorationLine: 'line-through',
  },
  descriptionText: {
    fontSize: 12,
    color: '#888',
    fontFamily: FONTS.Regular,
    lineHeight: 17,
    marginBottom: 10,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 4,
  },
  iconBtn: {
    padding: 2,
  },
  shareIconText: {
    fontSize: 16,
    color: '#888',
  },

  /* ── Right image column ── */
  cardRight: {
    width: 100,
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative',
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  addButton: {
    position: 'absolute',
    bottom: -10,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#2C61401A',
    boxShadow: '0px 1px 3px 0.2px rgba(0,0,0,0.1)',
  },
  addButtonText: {
    fontSize: 13,
    color: Constants.normal_green,
    fontFamily: FONTS.SemiBold,
  },
  stepper: {
    position: 'absolute',
    bottom: -10,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: Constants.white,
    borderWidth: 1,
    borderColor: '#2C61401A',
    boxShadow: '0px 1px 3px 0.2px rgba(0,0,0,0.1)',
  },
  stepperBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  stepperQty: {
    fontSize: 13,
    fontFamily: FONTS.SemiBold,
    color: Constants.normal_green,
    // minWidth: 20,
    textAlign: 'center',
  },

  /* ── Empty state ── */
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyImage: {
    alignSelf: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 16,
    color: '#111',
    fontFamily: FONTS.Bold,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#aaa',
    fontFamily: FONTS.Medium,
    textAlign: 'center',
    lineHeight: 20,
  },
});