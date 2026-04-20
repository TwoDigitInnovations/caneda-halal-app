import {
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useContext, useEffect, useState} from 'react';
import {Post} from '../../../Assets/Helpers/Service';
import CuurentLocation from '../../../Assets/Component/CuurentLocation';
import {GroceryCartContext, GroceryUserContext, LoadContext, ToastContext} from '../../../../App';
import Constants, {FONTS} from '../../../Assets/Helpers/constant';
import {useTranslation} from 'react-i18next';
import moment from 'moment';
import {navigate} from '../../../../navigationRef';
import { Cart2Icon, Notification2Icon, SearchIcon } from '../../../../Theme';
import Scheliton from '../../../Assets/Component/Scheliton';
import Header from '../../../Assets/Component/Header';

const {width} = Dimensions.get('window');

const GroceryShops = () => {
  const [storelist, setstorelist] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useContext(ToastContext);
  const [loading] = useContext(LoadContext);
  const [groceryuserProfile, setgroceryuserProfile] =
    useContext(GroceryUserContext);
  const {t} = useTranslation();

  useEffect(() => {
    getnearbyshops();
  }, []);

  const getnearbyshops = (key = '') => {
    setIsLoading(true);
    if (
      groceryuserProfile?.shipping_address?.location?.coordinates?.length > 0
    ) {
      const data = {
        role: 'GROCERYSELLER',
        location: groceryuserProfile.shipping_address.location,
        ...(key ? {key} : {}),
      };
      Post(`getnearbystore`, data)
        .then(async res => {
          setIsLoading(false);
          if (res.status) setstorelist(res.data);
        })
        .catch(err => {
          setIsLoading(false);
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
          ...(key ? {key} : {}),
        };
        Post(`getnearbystore`, data)
          .then(async res => {
            setIsLoading(false);
            if (res.status) setstorelist(res.data);
          })
          .catch(err => {
            setIsLoading(false);
            console.log(err);
          });
      });
    }
  };

  const handleSearch = (text) => {
    setSearchText(text);
    getnearbyshops(text);
  };

  const getShopStatus = shop => {
    const {available_days = [], opeing_time, close_time} = shop;
    const now = moment();
    const today = now.format('ddd');
    const opening = moment(opeing_time, ['hh:mm A']);
    const closing = moment(close_time, ['hh:mm A']);
    const isTodayAvailable = available_days.includes(today);

    if (isTodayAvailable && now.isBetween(opening, closing)) {
      return {status: 'open'};
    }

    for (let i = 0; i < 7; i++) {
      const nextDay = moment().add(i, 'days');
      const nextDayName = nextDay.format('ddd');
      if (available_days.includes(nextDayName)) {
        if (i === 0 && now.isBefore(opening)) {
          return {
            status: 'closed',
            nextOpen: t('opensToday', {time: opeing_time}),
          };
        } else if (i > 0) {
          return {
            status: 'closed',
            nextOpen: t('opensNextDay', {day: nextDayName, time: opeing_time}),
          };
        }
      }
    }
    return {status: 'closed', nextOpen: null};
  };

  // distance from $geoNear is in metres
  const formatDistance = metres => {
    if (!metres && metres !== 0) return '';
    const km = metres / 1000;
    return km < 1 ? `${Math.round(metres)} m` : `${km.toFixed(1)} km`;
  };

  // 15 min base prep + 5 min per km, rounded up to nearest 5-min band
  const getDeliveryTime = metres => {
    const km = (metres || 0) / 1000;
    const raw = 15 + Math.round(km * 5);
    const lo = Math.ceil(raw / 5) * 5;
    return `${lo - 5}-${lo} mins`;
  };

  const renderStoreCard = ({item}) => {
    const {status, nextOpen} = getShopStatus(item);
    const distanceStr = formatDistance(item?.distance);
    const deliveryTime = getDeliveryTime(item?.distance);

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.92}
        onPress={() =>
          navigate('GroceryShopDetail', {
            store_cover_img: item?.store_cover_img,
            store_logo: item?.store_logo,
            store_name: item?.store_name,
            distance: item?.distance,
            store_id: item?.user,
            status: status,
            nextOpen: nextOpen,
          })
        }>
        {/* Cover Image */}
        <View style={styles.imageWrapper}>
          <Image
            source={{uri: item?.store_cover_img}}
            style={[styles.coverImage, status === 'closed' && {opacity: 0.6}]}
            resizeMode="cover"
          />

          {/* Discount Badge */}
          {/* <View style={styles.discountBadge}>
            <Text style={styles.discountText}>40% OFF</Text>
          </View> */}

          {/* Delivery Info Pill */}
          <View style={styles.deliveryPill}>
            <Text style={styles.boltIcon}>⚡</Text>
            <Text style={styles.deliveryText}>
              {deliveryTime}
              {distanceStr ? ` | ${distanceStr}` : ''}
            </Text>
          </View>
        </View>

        {/* Card Body */}
        <View style={styles.cardBody}>
          <View style={styles.cardHeader}>
            <Text style={styles.storeName} numberOfLines={1}>
              {item?.store_name}
            </Text>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>4.3 ★</Text>
            </View>
          </View>
          <Text style={styles.storeAddress} numberOfLines={2}>
            {item?.address}
          </Text>

          {/* Open/Closed status */}
          {status === 'closed' && nextOpen ? (
            <Text style={styles.closedText}>{nextOpen}</Text>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.topHeader}>
        <Header textColor={Constants.black} />
      <View style={styles.searchBar}>
        <SearchIcon />
        <TextInput
          placeholder={t('Search "veges"')}
          placeholderTextColor="#aaa"
          style={styles.searchInput}
          value={searchText}
          onChangeText={handleSearch}
        />
      </View>
      </View>
      <FlatList
        data={isLoading ? Array(4).fill(null) : storelist}
        keyExtractor={(item, index) => isLoading ? `skeleton-${index}` : item._id}
        renderItem={isLoading ? ({index}) => <Scheliton key={index} type="shop" /> : renderStoreCard}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={() => (
          <Text style={styles.sectionTitle}>{t('Grocery Stores')}</Text>
        )}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={!isLoading ? () => (
          <View style={styles.emptyContainer}>
            <Image
              source={require('../../../Assets/Images/shop.png')}
              style={styles.emptyImage}
            />
            <Text style={styles.emptyTitle}>{t('No shop available')}</Text>
            <Text style={styles.emptySubtitle}>
              {t(
                'No shop available in your area. Please check again later.',
              )}
            </Text>
          </View>
        ) : null}
      />

    </View>
  );
};

export default GroceryShops;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    paddingBottom: 80,
  },

  topHeader: {
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Constants.white,
    // paddingTop: 16,
    paddingBottom: 16,
    boxShadow: '0px 5px 7.5px 0px #0000000D',
    borderBottomWidth: 1,
    borderColor: '#2C61401F'
  },
  deliveryInfo: {
    flex: 1,
  },
  deliveryTitle: {
    fontSize: 20,
    fontFamily: FONTS.Bold,
    color: Constants.black,
  },
  deliverySubtitle: {
    fontSize: 12,
    fontFamily: FONTS.Medium,
    color: '#888',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor:'#F1F5F9CC',
    boxShadow: '0px 1px 4px 0px #00000024',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 15,
    fontFamily: FONTS.SemiBold,
    color: Constants.black,
  },

  /* ── Search Bar ── */
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Constants.white,
    marginHorizontal: 16,
    // marginVertical: 10,
    borderRadius: 52,
    paddingHorizontal: 12,
    // paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#FFFFFF6B',
    boxShadow: '0px 1px 4px 0px #00000030',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.Medium,
    color: Constants.black,
  },

  /* ── Section Title ── */
  sectionTitle: {
    fontSize: 20,
    fontFamily: FONTS.Bold,
    color: Constants.black,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: '#f5f5f5',
  },

  /* ── Store Card ── */
  card: {
    backgroundColor: Constants.white,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  imageWrapper: {
    width: '100%',
    height: 180,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#2d6a2d',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  discountText: {
    color: '#fff',
    fontSize: 11,
    fontFamily: FONTS.Bold,
    letterSpacing: 0.4,
  },
  deliveryPill: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  boltIcon: {fontSize: 11, marginRight: 3},
  deliveryText: {
    color: '#fff',
    fontSize: 11,
    fontFamily: FONTS.Medium,
  },

  /* ── Card Body ── */
  cardBody: {
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  storeName: {
    fontSize: 16,
    fontFamily: FONTS.SemiBold,
    color: Constants.black,
    flex: 1,
    marginRight: 8,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2d6a2d',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  ratingText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: FONTS.SemiBold,
  },
  storeAddress: {
    fontSize: 12,
    fontFamily: FONTS.Regular,
    color: '#666',
    lineHeight: 18,
  },
  closedText: {
    marginTop: 4,
    fontSize: 12,
    fontFamily: FONTS.Medium,
    color: '#94712e',
  },

  /* ── Empty State ── */
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  emptyImage: {
    height: 160,
    width: 160,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    color: Constants.black,
    fontFamily: FONTS.Bold,
    textAlign: 'center',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#888',
    fontFamily: FONTS.Medium,
    textAlign: 'center',
    lineHeight: 20,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: Constants.normal_green,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontFamily: FONTS.Medium,
    textAlign: 'center',
    lineHeight: 15,
  },
});