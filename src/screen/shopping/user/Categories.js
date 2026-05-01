import {
  Dimensions,
  FlatList,
  Image,
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
import {navigate} from '../../../../navigationRef';
import {GetApi} from '../../../Assets/Helpers/Service';
import {LoadContext, UserContext} from '../../../../App';
import {MenuIcon, RightArrow, SearchIcon} from '../../../../Theme';
import {useTranslation} from 'react-i18next';
import TranslateHandled from '../../../Assets/Component/TranslateHandled';
import {StarRatingDisplay} from 'react-native-star-rating-widget';

const {width} = Dimensions.get('window');
const SIDEBAR_WIDTH = 120;
const CARD_SIZE = (width - SIDEBAR_WIDTH - 32) / 2;

const ShoppingCategories = () => {
  const {t} = useTranslation();
  const [loading, setLoading] = useContext(LoadContext);
  const [user] = useContext(UserContext);
  const [categorylist, setcategorylist] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    getCategoryWithShopping();
  }, []);

  useEffect(() => {
    if (selectedCategory?._id) {
      fetchProducts(selectedCategory._id);
    }
  }, [selectedCategory]);

  const getCategoryWithShopping = () => {
    setLoading(true);
    GetApi('getShoppingCategory', {}).then(
      async res => {
        setLoading(false);
        if (res.status) {
          setcategorylist(res.data);
          if (res.data?.length > 0) setSelectedCategory(res.data[0]);
        }
      },
      err => {
        setLoading(false);
      },
    );
  };

  const fetchProducts = categoryId => {
    const uid = user?._id || '';
    GetApi(`getShoppingbycategory/${categoryId}?page=1&limit=10&userId=${uid}`).then(
      res => {
        if (res.status) setProducts(res.data ?? []);
        else setProducts([]);
      },
      () => setProducts([]),
    );
  };

  const filteredCategories = categorylist.filter(c =>
    c.name?.toLowerCase().includes(searchText.toLowerCase()),
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {/* <MenuIcon height={22} width={22} color={Constants.black} /> */}
        <View style={styles.searchBar}>
          <SearchIcon height={16} width={16} color={Constants.customgrey} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('Search categories...')}
            placeholderTextColor={Constants.customgrey}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
        <Text style={styles.headerTitle}>{t('Categories')}</Text>
      </View>

      <View style={styles.body}>
        {/* Left sidebar */}
        <View style={styles.sidebarWrapper}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {filteredCategories.map(item => {
              const isActive = selectedCategory?._id === item._id;
              return (
                <TouchableOpacity
                  key={item._id}
                  style={[styles.sidebarItem, isActive && styles.sidebarItemActive]}
                  onPress={() => setSelectedCategory(item)}>
                  <Text
                    style={[styles.sidebarTxt, isActive && styles.sidebarTxtActive]}
                    numberOfLines={2}>
                    {item.name?.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Right content */}
        <View style={styles.content}>
          {/* Section header */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle} numberOfLines={1}>
              <TranslateHandled text={selectedCategory?.name ?? ''} />
            </Text>
            <TouchableOpacity
              style={styles.seeAllBtn}
              onPress={() =>
                navigate('ShoppingProducts', {
                  id: selectedCategory?._id,
                  name: selectedCategory?.name,
                })
              }>
              <Text style={styles.seeAllTxt}>{t('See All')} </Text>
              <RightArrow height={11} width={11} color={Constants.normal_green} />
            </TouchableOpacity>
          </View>

          {/* Products grid */}
          <FlatList
            key={selectedCategory?._id}
            data={products}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.grid}
            columnWrapperStyle={styles.gridRow}
            ListEmptyComponent={() => (
              <View style={styles.emptyCov}>
                <Text style={styles.emptyTxt}>{t('No Products')}</Text>
              </View>
            )}
            renderItem={({item}) => {
              const image = item?.variants?.[0]?.image?.[0];
              const ourPrice = item?.variants?.[0]?.selected?.[0]?.our_price;
              const otherPrice = item?.variants?.[0]?.selected?.[0]?.other_price;
              return (
                <TouchableOpacity
                  style={styles.card}
                  activeOpacity={0.85}
                  onPress={() => navigate('ShoppingPreview', item._id)}>
                  <Image
                    source={
                      image
                        ? {uri: image}
                        : require('../../../Assets/Images/cloth.png')
                    }
                    style={styles.cardImg}
                    resizeMode="contain"
                  />
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardName} numberOfLines={2}>
                      {item.name}
                    </Text>
                    <View style={styles.priceRow}>
                      {ourPrice != null && (
                        <Text style={styles.cardPrice}>
                          {Currency}{ourPrice}
                        </Text>
                      )}
                      {otherPrice != null && (
                        <Text style={styles.cardOldPrice}>
                          {Currency}{otherPrice}
                        </Text>
                      )}
                    </View>
                    {item?.averageRating > 0 && (
                      <View style={styles.ratingRow}>
                        <StarRatingDisplay
                          rating={Number(item.averageRating)}
                          starSize={10}
                          starStyle={{marginHorizontal: 0}}
                          color="#6D5A00"
                        />
                        {item?.totalReviews > 0 && (
                          <Text style={styles.reviewTxt}>({item.totalReviews})</Text>
                        )}
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ShoppingCategories;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f4f4f4',
    borderRadius: 22,
    paddingHorizontal: 12,
    paddingVertical: 7,
    gap: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: Constants.black,
    fontFamily: FONTS.Regular,
    padding: 0,
  },
  headerTitle: {
    fontSize: 16,
    color: Constants.normal_green,
    fontFamily: FONTS.SemiBold,
  },
  body: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebarWrapper: {
    width: SIDEBAR_WIDTH,
    backgroundColor: '#f7f7f7',
    overflow: 'hidden',
  },
  sidebarItem: {
    paddingVertical: 16,
    paddingHorizontal: 6,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
    alignItems: 'center',
  },
  sidebarItemActive: {
    borderLeftColor: Constants.normal_green,
    backgroundColor: Constants.white,
  },
  sidebarTxt: {
    fontSize: 10,
    color: Constants.customgrey,
    fontFamily: FONTS.Medium,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  sidebarTxtActive: {
    color: Constants.normal_green,
    fontFamily: FONTS.SemiBold,
  },
  content: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 15,
    color: Constants.black,
    fontFamily: FONTS.SemiBold,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllTxt: {
    fontSize: 13,
    color: Constants.normal_green,
    fontFamily: FONTS.Medium,
  },
  grid: {
    paddingHorizontal: 8,
    paddingBottom: 20,
  },
  gridRow: {
    gap: 8,
    marginBottom: 10,
  },
  card: {
    width: CARD_SIZE,
    backgroundColor: Constants.white,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 0.5,
    borderColor: '#ebebeb',
  },
  cardImg: {
    width: '100%',
    height: CARD_SIZE * 0.8,
  },
  cardInfo: {
    padding: 8,
  },
  cardName: {
    fontSize: 12,
    color: Constants.black,
    fontFamily: FONTS.SemiBold,
    lineHeight: 16,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginTop: 3,
  },
  cardPrice: {
    fontSize: 12,
    color: '#B32000',
    fontFamily: FONTS.SemiBold,
  },
  cardOldPrice: {
    fontSize: 10,
    color: Constants.customgrey,
    fontFamily: FONTS.Regular,
    textDecorationLine: 'line-through',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    gap: 3,
  },
  reviewTxt: {
    fontSize: 9,
    color: Constants.customgrey,
    fontFamily: FONTS.Regular,
  },
  emptyCov: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyTxt: {
    fontSize: 16,
    color: Constants.customgrey,
    fontFamily: FONTS.Medium,
  },
});
