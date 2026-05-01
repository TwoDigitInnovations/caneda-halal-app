import {
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useContext, useEffect, useState} from 'react';
import Constants, {Currency, FONTS} from '../../../Assets/Helpers/constant';
import {UnfavIcon} from '../../../../Theme';
import { LoadContext, UserContext} from '../../../../App';
import {GetApi, Post} from '../../../Assets/Helpers/Service';
import {navigate} from '../../../../navigationRef';
import DriverHeader from '../../../Assets/Component/DriverHeader';
import { useTranslation } from 'react-i18next';
import TranslateHandled from '../../../Assets/Component/TranslateHandled';
import {StarRatingDisplay} from 'react-native-star-rating-widget';

const {width: W} = Dimensions.get('window');
const cardWidth = (W - 48) / 2;

const ShoppingProducts = props => {
  const { t } = useTranslation();
  const [loading, setLoading] = useContext(LoadContext);
  const [user] = useContext(UserContext);
  const [productlist, setproductlist] = useState([]);
  const [page, setPage] = useState(1);
  const [curentData, setCurrentData] = useState([]);
  const data = props?.route?.params.id;
  const catname = props?.route?.params.name;
  const topsell = props?.route?.params.type;
  const store_id = props?.route?.params.store_id;

  useEffect(() => {
    data && getproduct(1);
    topsell === 'topselling' && getTopSoldProduct(1);
  }, []);

  const getproduct = p => {
    setPage(p);
    setLoading(true);
    const uid = user?._id || '';
    let url = `getShoppingbycategory/${data}?page=${p}&userId=${uid}`;
    if (store_id) {
      url = `getShoppingbycategory/${data}?page=${p}&store_id=${store_id}&userId=${uid}`;
    }
    GetApi(url).then(
      res => {
        setLoading(false);
        if (res.status) {
          setCurrentData(res.data);
          setproductlist(p === 1 ? res.data : [...productlist, ...res.data]);
        }
      },
      err => { setLoading(false); console.log(err); },
    );
  };

  const getTopSoldProduct = p => {
    setPage(p);
    setLoading(true);
    const uid = user?._id || '';
    GetApi(`getTopSoldShopping?page=${p}&userId=${uid}`).then(
      res => {
        setLoading(false);
        if (res.status) {
          setCurrentData(res.data);
          setproductlist(p === 1 ? res.data : [...productlist, ...res.data]);
        }
      },
      err => { setLoading(false); console.log(err); },
    );
  };

  const toggleFav = id => {
    setproductlist(prev => prev.map(p => p._id === id ? {...p, isFavorite: !p.isFavorite} : p));
    Post('shoppingtogglefavorite', {shoppingid: id}).then(
      () => {},
      () => {
        setproductlist(prev => prev.map(p => p._id === id ? {...p, isFavorite: !p.isFavorite} : p));
      },
    );
  };

  const fetchNextPage = () => {
    if (curentData.length === 20) {
      topsell === 'topselling' ? getTopSoldProduct(page + 1) : getproduct(page + 1);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <DriverHeader item={t('Products')} showback={true} />
      <Text style={styles.headtxt}><TranslateHandled text={catname} /></Text>
      <FlatList
        data={productlist}
        numColumns={2}
        contentContainerStyle={{paddingHorizontal: 16, paddingTop: 10, paddingBottom: 20}}
        columnWrapperStyle={{gap: 16, marginBottom: 16}}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={{alignItems: 'center', justifyContent: 'center', height: Dimensions.get('window').height - 200}}>
            <Text style={{color: Constants.black, fontSize: 20, fontFamily: FONTS.Medium}}>
              {t('No Products')}
            </Text>
          </View>
        )}
        renderItem={({item}) => {
          const discountPct = item?.variants?.[0]?.selected?.[0]
            ? (((Number(item.variants[0].selected[0].other_price) - Number(item.variants[0].selected[0].our_price)) / Number(item.variants[0].selected[0].other_price)) * 100).toFixed(0)
            : null;
          return (
            <TouchableOpacity
              style={[styles.curatedCard, {width: cardWidth}]}
              activeOpacity={0.85}
              onPress={() => navigate('ShoppingPreview', item._id)}>
              <TouchableOpacity
                style={styles.heartBtn}
                onPress={e => { e.stopPropagation?.(); toggleFav(item._id); }}>
                <UnfavIcon height={16} width={16} color={item.isFavorite ? '#E53935' : null} />
              </TouchableOpacity>
              {discountPct && (
                <View style={styles.curatedBadge}>
                  <Text style={styles.curatedBadgeTxt}>-{discountPct}%</Text>
                </View>
              )}
              <Image
                source={{uri: item?.variants?.[0]?.image?.[0]}}
                style={styles.curatedImg}
                resizeMode="contain"
              />
              <View style={styles.curatedInfo}>
                <Text numberOfLines={2} style={styles.curatedName}>{item.name}</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.curatedPrice}>{Currency}{item?.variants?.[0]?.selected?.[0]?.our_price}</Text>
                  {item?.variants?.[0]?.selected?.[0]?.other_price && (
                    <Text style={styles.curatedOldPrice}>{Currency}{item?.variants?.[0]?.selected?.[0]?.other_price}</Text>
                  )}
                </View>
                {item?.averageRating && item?.averageRating > 0 ? (
                  <View style={styles.ratingRow}>
                    <StarRatingDisplay
                      rating={Number(item.averageRating)}
                      starStyle={{marginHorizontal: 0}}
                      starSize={12}
                      color="#6D5A00"
                    />
                    {item?.totalReviews > 0 && <Text style={styles.reviewTxt}>({item.totalReviews})</Text>}
                  </View>
                ) : null}
              </View>
            </TouchableOpacity>
          );
        }}
        onEndReached={() => { if (productlist && productlist.length > 0) fetchNextPage(); }}
        onEndReachedThreshold={0.05}
      />
    </SafeAreaView>
  );
};

export default ShoppingProducts;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  headtxt: {
    color: Constants.black,
    fontSize: 16,
    textAlign: 'center',
    // marginVertical: 10,
    fontFamily: FONTS.SemiBold,
    // backgroundColor:'red'
  },
  curatedCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    paddingBottom: 10,
    boxShadow: '0px 1px 2px 0px #00000024',
  },
  heartBtn: {
    position: 'absolute',
    top: 6,
    right: 4,
    zIndex: 10,
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
    backgroundColor: '#B32000',
  },
  curatedBadgeTxt: {
    fontSize: 9,
    fontFamily: FONTS.SemiBold,
    color: Constants.white,
  },
  curatedImg: {
    height: 150,
    width: '100%',
    backgroundColor: '#F7F7F7',
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
    fontSize: 14,
    color: '#B32000',
    fontFamily: FONTS.SemiBold,
  },
  curatedOldPrice: {
    fontSize: 11,
    color: Constants.customgrey2,
    fontFamily: FONTS.Regular,
    textDecorationLine: 'line-through',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reviewTxt: {
    color: Constants.customgrey2,
    fontSize: 11,
    fontFamily: FONTS.Regular,
  },
});
