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
import {BackIcon, Clock2Icon} from '../../../../Theme';
import {goBack, navigate} from '../../../../navigationRef';
import {LoadContext, ToastContext} from '../../../../App';
import {GetApi} from '../../../Assets/Helpers/Service';
import TranslateHandled from '../../../Assets/Component/TranslateHandled';

const ShopDetail = props => {
  const {t} = useTranslation();
  const data = props.route.params;
  const [toast, setToast] = useContext(ToastContext);
  const [loading, setLoading] = useContext(LoadContext);
  const [selectcat, setSelectcat] = useState();
  const [categorylist, setcategorylist] = useState();
  const [foodlist, setfoodlist] = useState([]);
  useEffect(() => {
    getCategoryWithFoods();
  }, []);

  const getCategoryWithFoods = () => {
    setLoading(true);
    GetApi(`getSellerCategoryWithFoods?seller_id=${data?.store_id}`).then(
      async res => {
        setLoading(false);
        console.log('cef', res);
        if (res.status) {
          setcategorylist(res.data);
          if (res.data && res.data?.length > 0) {
            setfoodlist(res.data[0].foods);
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
        data={foodlist}
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
          <Clock2Icon height={15} width={15} />
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
          onPress={() => navigate('FoodCategories', data?.store_id)}>
          {t('See all')}
        </Text>
      </View>
      <FlatList
        data={categorylist}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{marginHorizontal:20}}
        renderItem={({item, index}) =>
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.box,
                    {
                      backgroundColor:
                        selectcat === item._id
                          ? Constants.dark_green
                          : Constants.white,
                    },
                  ]}
                  onPress={() => {
                    setSelectcat(item._id), setfoodlist(item?.foods);
                  }}>
                  <Image
                    source={{uri: item?.image}}
                    style={styles.catimg}
                    resizeMode="contain"
                  />
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.cattxt2,
                      {
                        color:
                          selectcat === item._id
                            ? Constants.white
                            : Constants.customgrey2,
                      },
                    ]}>
                    <TranslateHandled text={item?.name} />
                  </Text>
                </TouchableOpacity>
          }/>
      {/* </View>
        )}
        showsVerticalScrollIndicator={false}
        numColumns={2}
        style={{marginTop: 10, marginRight: 15}} */}
      {foodlist?.length > 0 ? (
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            marginHorizontal: 15,
            marginTop: 10,
          }}>
          {foodlist?.map((item, ind) => (
            <TouchableOpacity
              key={ind}
              style={styles.prodbox}
              onPress={() => navigate('PreView', item?._id)}>
              <Image
                source={{uri: item?.image[0]}}
                style={{height: 106, width: '100%', borderRadius: 10}}
              />
              <Text style={styles.proname} numberOfLines={2}>
                {item?.name}
              </Text>
              <Text style={styles.pricetxt}>
                {Currency} {item?.price}
              </Text>
            </TouchableOpacity>
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
            {t('No item avilable')}
          </Text>
        </View>
      )}
      {/* )}
      /> */}
    </ScrollView>
  );
};

export default ShopDetail;

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
  covline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginVertical: 10,
    // backgroundColor:Constants.red
  },
  catimg: {
    height: 30,
    width: 30,
  },
  seealltxt: {
    fontSize: 14,
    color: Constants.dark_green,
    fontFamily: FONTS.Medium,
    marginHorizontal: 10,
  },
  cattxt: {
    fontSize: 16,
    color: Constants.black,
    fontFamily: FONTS.SemiBold,
  },
  pricetxt: {
    fontSize: 14,
    color: Constants.dark_green,
    fontFamily: FONTS.SemiBold,
    alignSelf: 'flex-start',
  },
  proname: {
    fontSize: 14,
    color: Constants.dark_green,
    fontFamily: FONTS.SemiBold,
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  prodbox: {
    // marginHorizontal: 10,
    width: '48%',
    padding: 10,
    borderRadius: 15,
    alignItems: 'center',
    boxShadow: '0 0 6 0.5 grey',
    // backgroundColor:'red'
  },
  cattxt2: {
    fontSize: 14,
    color: Constants.customgrey2,
    fontFamily: FONTS.Medium,
    marginTop: 5,
  },
  categorytxt: {
    fontSize: 16,
    color: Constants.black,
    fontFamily: FONTS.SemiBold,
  },
  box: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    padding: 8,
    borderRadius: 10,
    boxShadow: '2 5 6 0 grey',
    marginRight:10
  },
});
