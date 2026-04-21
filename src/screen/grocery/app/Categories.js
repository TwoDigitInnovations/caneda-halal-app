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
import {GetApi, Post} from '../../../Assets/Helpers/Service';
import CuurentLocation from '../../../Assets/Component/CuurentLocation';
import {GroceryUserContext, LoadContext, ToastContext} from '../../../../App';
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
    const url = key ? `getGroceryCategory?key=${encodeURIComponent(key)}` : `getGroceryCategory`;
    GetApi(url)
      .then(async res => {
        setIsLoading(false);
        if (res.status) setstorelist(res.data);
      })
      .catch(err => {
        setIsLoading(false);
        console.log(err);
      });
  };

  const handleSearch = (text) => {
    setSearchText(text);
    getnearbyshops(text);
  };


  const renderStoreCard = ({item}) => {

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigate('GroceryProducts', {id: item?._id, name: item?.name})
        }>
        <View style={styles.imageWrapper}>
        {item?.image&&  <Image
            source={{uri: item?.image}}
            style={styles.coverImage}
            resizeMode="stretch"
          />}
          </View>
          <View style={{flex: 1}}>
          <Text style={styles.storeName} numberOfLines={1}>
            {item.name}
          </Text>
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
        data={isLoading ? Array(8).fill(null) : storelist}
        keyExtractor={(item, index) => isLoading ? `skeleton-${index}` : item._id}
        numColumns={4}
        renderItem={isLoading ? ({index}) => <Scheliton key={index} type="category" /> : renderStoreCard}
        style={{width: '100%', gap: 5, marginVertical: 10}}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={!isLoading ? () => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>{t('No shop available')}</Text>
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

  /* ── Top Header ── */
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

  /* ── Store Card ── */
  card: {
    // borderRadius: 16,
    // marginHorizontal: 16,
    marginTop: 16,
    // overflow: 'hidden',
    // height: 80,
    // width: 80,
    flex:1,
    // marginHorizontal
  },
  imageWrapper: {
    boxShadow: '0px 1px 4px 0px #00000040',
    backgroundColor: '#F3F0EF',
    // width: '100%',
    // height: 180,
    // position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    height: 80,
    width: 80,
    borderRadius: 11,
  },
  coverImage: {
    height: '80%',
    width: '80%',
    // resizeMode: 'contain',
    // borderRadius: 7,
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
    fontSize: 12,
    fontFamily: FONTS.Medium,
    color: Constants.black,
    // flex: 1,
    textAlign: 'center',
    marginVertical: 5,
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
});