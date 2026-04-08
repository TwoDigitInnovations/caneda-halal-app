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
import React, {useContext, useEffect, useState} from 'react';
import Constants, {Currency, FONTS} from '../../../Assets/Helpers/constant';
import {goBack, navigate} from '../../../../navigationRef';
import {GetApi} from '../../../Assets/Helpers/Service';
import {LoadContext, ToastContext} from '../../../../App';
import {BackIcon, PlusIcon} from '../../../../Theme';
import {useTranslation} from 'react-i18next';
import TranslateHandled from '../../../Assets/Component/TranslateHandled';

const ShoppingWithCategoryForSeller = props => {
  const {t} = useTranslation();
  const seller_id = props.route.params;
  const [toast, setToast] = useContext(ToastContext);
  const [loading, setLoading] = useContext(LoadContext);
  const [categorylist, setcategorylist] = useState();
  useEffect(() => {
    {
      seller_id && getCategoryWithGrocery();
    }
  }, [seller_id]);

  const getCategoryWithGrocery = () => {
    setLoading(true);
    GetApi(`getSellerCategoryWithShoppings?seller_id=${seller_id}`).then(
      async res => {
        setLoading(false);
        console.log('cef', res);
        if (res.status) {
          setcategorylist(res.data);
        }
      },
      err => {
        setLoading(false);
        console.log(err);
      },
    );
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.rowbtn}>
        <BackIcon
          height={30}
          width={30}
          color={Constants.black}
          onPress={() => goBack()}
        />
        <Text style={styles.headtxt}>{t('Category')}</Text>
        <View style={{width: 40}}></View>
      </View>
      <View
        style={{marginBottom: 10, flex: 1}}>
        <FlatList
          data={categorylist}
          showsVerticalScrollIndicator={false}
          renderItem={({item, index}) =>
            item?.shoppings &&
            item?.shoppings?.length > 0 && (
              <View style={{marginTop: 5}}>
                <View style={styles.covline}>
                  <Text style={styles.cattxt}>
                    <TranslateHandled text={item.name} />
                  </Text>
                  <Text
                    style={styles.seealltxt}
                    onPress={() =>
                      navigate('ShoppingProducts', {
                        id: item?._id,
                        name: item?.name,
                        store_id: seller_id,
                      })
                    }>
                    {t('See all')}
                  </Text>
                </View>
                <ScrollView
                  horizontal={true}
                  showsHorizontalScrollIndicator={false}>
                  {item.shoppings.map((proditm, ind) => (
                    <View
                      style={[
                        styles.shadowWrapper,
                        {
                          marginRight:
                            item?.shoppings.length === ind + 1 ? 20 : 10,
                        },
                      ]}
                      key={ind}>
                      <TouchableOpacity
                        style={[styles.box]}
                        onPress={() =>
                          navigate('ShoppingPreview', proditm._id)
                        }>
                        <Image
                          source={{uri: proditm?.variants[0].image[0]}}
                          style={styles.cardimg}
                          resizeMode="stretch"
                        />
                        {proditm?.variants && proditm?.variants?.length > 0 && (
                          <ImageBackground
                            source={require('../../../Assets/Images/star.png')}
                            style={styles.cardimg2}>
                            <Text style={styles.offtxt}>
                              {(
                                ((Number(
                                  proditm?.variants[0]?.selected[0]
                                    ?.other_price,
                                ) -
                                  Number(
                                    proditm?.variants[0]?.selected[0]
                                      ?.our_price,
                                  )) /
                                  Number(
                                    proditm?.variants[0]?.selected[0]
                                      ?.other_price,
                                  )) *
                                100
                              ).toFixed(0)}
                              %
                            </Text>
                            <Text style={styles.offtxt}>{t('off')}</Text>
                          </ImageBackground>
                        )}
                        <Text numberOfLines={2} style={styles.proname}>
                          {proditm.name}
                        </Text>
                        <View
                          style={{
                            flex: 1,
                            flexDirection: 'row',
                            gap: 10,
                            alignItems: 'center',
                            marginHorizontal: 15,
                          }}>
                          {proditm?.variants &&
                            proditm?.variants?.length > 0 && (
                              <Text style={styles.disctxt}>
                                {Currency}
                                {proditm?.variants[0]?.selected[0]?.our_price}
                              </Text>
                            )}
                          {proditm?.variants &&
                            proditm?.variants?.length > 0 && (
                              <Text style={styles.maintxt}>
                                {Currency}
                                {proditm?.variants[0]?.selected[0]?.other_price}
                              </Text>
                            )}
                        </View>
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )
          }
          ListEmptyComponent={() => (
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                height: Dimensions.get('window').height - 200,
              }}>
              <Text
                style={{
                  color: Constants.black,
                  fontSize: 18,
                  fontFamily: FONTS.Medium,
                }}>
                {!categorylist ? t('Loading...') : t('No category avilable')}
              </Text>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
};

export default ShoppingWithCategoryForSeller;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.white,
    // padding: 10,
  },
  cattxt: {
    fontSize: 16,
    color: Constants.black,
    fontFamily: FONTS.SemiBold,
  },
  shadowWrapper: {
    boxShadow: '0px 0px 6px 0.5px grey',
    borderRadius: 20,
    marginVertical: 20,
    marginHorizontal: 10,
    backgroundColor: Constants.light_green, // necessary for iOS shadows
  },

  seealltxt: {
    fontSize: 16,
    color: Constants.normal_green,
    fontFamily: FONTS.SemiBold,
    marginHorizontal: 10,
  },
  covline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginVertical: 10,
    // backgroundColor:Constants.red
  },
  headtxt: {
    color: Constants.black,
    fontSize: 16,
    fontFamily: FONTS.SemiBold,
  },
  rowbtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
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
  box: {
    width: 170,
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
  proname: {
    fontSize: 16,
    color: Constants.black,
    fontFamily: FONTS.Medium,
    marginLeft: 15,
    marginTop: 5,
    flex: 1,
  },
  offtxt: {
    fontSize: 10,
    color: Constants.white,
    fontFamily: FONTS.SemiBold,
    lineHeight: 15,
    // marginLeft: 7,
  },
});
