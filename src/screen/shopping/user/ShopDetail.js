import {
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useContext, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import Constants, {Currency, FONTS} from '../../../Assets/Helpers/constant';
import {BackIcon, Clock2Icon, PlusIcon} from '../../../../Theme';
import {goBack, navigate} from '../../../../navigationRef';
import {ShoppingCartContext, LoadContext, ToastContext} from '../../../../App';
import {GetApi} from '../../../Assets/Helpers/Service';
import TranslateHandled from '../../../Assets/Component/TranslateHandled';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ShoppingShopDetail = props => {
  const {t} = useTranslation();
  const data = props.route.params;
  const [toast, setToast] = useContext(ToastContext);
  const [loading, setLoading] = useContext(LoadContext);
  const [selectcat, setSelectcat] = useState();
  const [productList, setproductList] = useState();
  const [categorylist, setcategorylist] = useState();
  useEffect(() => {
    getCategoryWithFoods();
  }, []);

  const getCategoryWithFoods = () => {
    setLoading(true);
    GetApi(`getSellerCategoryWithShoppings?seller_id=${data?.store_id}`).then(
      async res => {
        setLoading(false);
        console.log('cef', res);
        if (res.status) {
          setcategorylist(res.data);
          if (res.data && res.data?.length > 0) {
            setproductList(res.data[0].shoppings);
            setSelectcat(res.data[0]._id);
          }
        }
      },
      err => {
        setLoading(false);
        console.log(err);
      },
    );
  };
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* <FlatList
        data={productList}
        showsVerticalScrollIndicator={false}
        style={{paddingRight: 20, marginLeft: 5, paddingTop: 10}}
        ListHeaderComponent={() => (
          <View> */}
      <ImageBackground
        source={
          data?.store_cover_img
            ? {uri: data?.store_cover_img}
            : require('../../../Assets/Images/foodbaner.png')
        }
        style={{height: 170}}
        resizeMode="stretch">
        <TouchableOpacity style={styles.backcov} onPress={() => goBack()}>
          <BackIcon />
        </TouchableOpacity>
      </ImageBackground>
      <View style={styles.stodata}>
        <Image source={{uri: data?.store_logo}} style={styles.stologo} />
        <Text style={styles.storename}>{data?.store_name}</Text>
      </View>
      <View style={styles.stodata}>
        <View style={styles.icontxtcov}>
          <Clock2Icon height={15} width={15} color='#5C5C5C'/>
          {data?.status === 'open' ? (
            <Text style={[styles.opntxt, {color: Constants.black}]}>
              {t('Open Now')}
            </Text>
          ) : (
            <Text style={[styles.opntxt, {color: Constants.red}]}>
              {t('Store Closed')}
            </Text>
          )}
        </View>
        {data?.status === 'open' ? (
          <Text style={styles.clostxt}>
            {data?.distance ? (data?.distance / 1000).toFixed(1) : 0}km
          </Text>
        ) : (
          <Text style={styles.clostxt}>{data?.nextOpen}</Text>
        )}
      </View>
      <View style={styles.covline}>
        <Text style={styles.categorytxt}>{t('Find by Category')}</Text>
        <Text
          style={styles.seealltxt}
          onPress={() =>
            navigate('ShoppingWithCategoryForSeller', data?.store_id)
          }>
          {t('See all')}
        </Text>
      </View>
      <FlatList
        data={categorylist}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{marginHorizontal: 20}}
        renderItem={({item, index}) => (
          <TouchableOpacity
            key={index}
            style={{flex: 1, marginVertical: 10}}
            onPress={() => {
              setSelectcat(item._id), setproductList(item?.shoppings);
            }}>
            <View
              style={[
                styles.categorycircle,
                {
                  // backgroundColor:
                  //   selectcat === item._id
                  //     ? Constants.light_green
                  //     : null,
                  borderWidth: selectcat === item._id ? 1 : 0,
                  padding: selectcat === item._id ? 2 : 0,
                },
              ]}>
              {item?.image && (
                <Image
                  source={{uri: `${item?.image}`}}
                  style={styles.categoryimg}
                />
              )}
            </View>
            <View>
              <Text
                style={[
                  styles.categorytxt2,
                  {
                    color:
                      selectcat === item._id
                        ? Constants.normal_green
                        : Constants.black,
                  },
                ]}>
                <TranslateHandled text={item?.name} />
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
      {productList?.length > 0 ? (
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            marginHorizontal: 15,
            marginTop: 10,
          }}>
          {productList.map((item, ind) => (
            <View style={[styles.shadowWrapper]} key={ind}>
              <TouchableOpacity
                style={[styles.box]}
                onPress={() => navigate('ShoppingPreview', item._id)}>
                <Image
                  source={{uri: item?.variants[0].image[0]}}
                  style={styles.cardimg}
                  resizeMode="stretch"
                />
                {item?.variants && item?.variants?.length > 0 && (
                  <ImageBackground
                    source={require('../../../Assets/Images/star.png')}
                    style={styles.cardimg2}>
                    <Text style={styles.offtxt}>
                      {(
                        ((Number(item?.variants[0]?.selected[0]?.other_price) -
                          Number(item?.variants[0]?.selected[0]?.our_price)) /
                          Number(item?.variants[0]?.selected[0]?.other_price)) *
                        100
                      ).toFixed(0)}
                      %
                    </Text>
                    <Text style={styles.offtxt}>{t('off')}</Text>
                  </ImageBackground>
                )}
                <Text numberOfLines={2} style={styles.proname}>
                  {item.name}
                </Text>
                <View
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    gap: 10,
                    alignItems: 'center',
                    marginHorizontal: 15,
                  }}>
                  {item?.variants && item?.variants?.length > 0 && (
                    <Text style={styles.disctxt}>
                      {Currency}
                      {item?.variants[0]?.selected[0]?.our_price}
                    </Text>
                  )}
                  {item?.variants && item?.variants?.length > 0 && (
                    <Text style={styles.maintxt}>
                      {Currency}
                      {item?.variants[0]?.selected[0]?.other_price}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      ) : (
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            height: Dimensions.get('window').height - 450,
          }}>
          <Text
            style={{
              color: Constants.black,
              fontSize: 18,
              fontFamily: FONTS.Medium,
            }}>
            {!categorylist ? t('Loading...') : t('No item avilable')}
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

export default ShoppingShopDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.white,
  },
  locopttxt: {
    fontSize: 14,
    color: Constants.white,
    fontFamily: FONTS.Regular,
  },
  backcov: {
    height: 30,
    width: 30,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Constants.white,
    marginTop: 20,
    marginLeft: 20,
  },
  stologo: {
    height: 60,
    width: 60,
    borderRadius: 50,
  },
  storename: {
    fontSize: 16,
    fontFamily: FONTS.SemiBold,
    color: Constants.black,
  },
  stodata: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 15,
    gap: 15,
  },
  opntxt: {
    fontSize: 14,
    color: Constants.black,
    fontFamily: FONTS.Medium,
    textAlign: 'center',
  },
  clostxt: {
    fontSize: 14,
    color: '#94712e',
    fontFamily: FONTS.Medium,
    textAlign: 'center',
  },
  icontxtcov: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
  },

  cardimg: {
    height: 175,
    width: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    resizeMode: 'contain',
    alignSelf: 'center',
    borderRadius: 5,
    // backgroundColor:'red'
  },
  shadowWrapper: {
    boxShadow: '0px 0px 6px 0.5px grey',
    borderRadius: 20,
    marginVertical: 20,
    marginHorizontal: 10,
    backgroundColor: Constants.light_green, // necessary for iOS shadows
    width: '47%',
  },
  box: {
    width: '100%',
    // paddingTop: 10,
    paddingBottom: 5,
    borderRadius: 20,
    overflow: 'visible', // still needed if your child extends outside
    backgroundColor: 'transparent', // make sure this doesn't override shadow
  },
  cardimg2: {
    height: 50,
    width: 50,
    position: 'absolute',
    right: -14,
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999, // very high to force render on top
  },

  seealltxt: {
    fontSize: 16,
    color: Constants.normal_green,
    fontFamily: FONTS.SemiBold,
    marginHorizontal: 10,
  },
  disctxt: {
    fontSize: 16,
    color: Constants.linearcolor,
    fontFamily: FONTS.SemiBold,
  },
  maintxt: {
    fontSize: 16,
    color: Constants.customgrey,
    fontFamily: FONTS.Medium,
    textDecorationLine: 'line-through',
  },
  covline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginVertical: 10,
  },
  proname: {
    fontSize: 16,
    color: Constants.black,
    fontFamily: FONTS.Medium,
    marginLeft: 20,
    marginTop: 5,
  },
  offtxt: {
    fontSize: 10,
    color: Constants.white,
    fontFamily: FONTS.SemiBold,
    lineHeight: 15,
  },
  categorycircle: {
    height: 70,
    width: 70,
    borderRadius: 5,
    // backgroundColor: Constants.light_green,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: Constants.normal_green,
    marginHorizontal: 10,
  },
  categoryimg: {
    height: '100%',
    width: '100%',
    resizeMode: 'stretch',
    borderRadius:5
    // borderRadius: 5,
  },
  categorytxt2: {
    fontSize: 12,
    color: Constants.black,
    fontFamily: FONTS.Regular,
    textAlign: 'center',
    marginVertical: 5,
  },
  covline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginVertical: 10,
    // backgroundColor:Constants.red
  },
  categorytxt: {
    fontSize: 16,
    color: Constants.black,
    fontFamily: FONTS.SemiBold,
  },
});
