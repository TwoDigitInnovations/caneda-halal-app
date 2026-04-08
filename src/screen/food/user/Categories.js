import {
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useContext, useEffect, useState} from 'react';
import Constants, {Currency, FONTS} from '../../../Assets/Helpers/constant';
import LinearGradient from 'react-native-linear-gradient';
import {goBack, navigate} from '../../../../navigationRef';
import {GetApi} from '../../../Assets/Helpers/Service';
import {LoadContext, ToastContext} from '../../../../App';
import {BackIcon} from '../../../../Theme';
import { useTranslation } from 'react-i18next';
import TranslateHandled from '../../../Assets/Component/TranslateHandled';

const FoodCategories = (props) => {
  const seller_id = props.route.params;
  const { t } = useTranslation();
  const [toast, setToast] = useContext(ToastContext);
  const [loading, setLoading] = useContext(LoadContext);
  const [categorylist, setcategorylist] = useState();
  useEffect(() => {
    getCategoryWithFoods();
  }, []);

  const getCategoryWithFoods = () => {
    setLoading(true);
    let url =`getCategoryWithFoods`
    if (seller_id) {
       url =`getSellerCategoryWithFoods?seller_id=${seller_id}`
      
    }
    GetApi(url).then(
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
        <BackIcon height={30} width={30} color={Constants.black} onPress={() => goBack()} />
        <Text style={styles.headtxt}>{t("Category")}</Text>
        <View></View>
      </View>

      <FlatList
        data={categorylist}
        showsVerticalScrollIndicator={false}
        renderItem={
          ({item, index}) =>
            item?.foods &&
            item?.foods.length > 0 && (
              <View style={{marginTop: 5}}>
                <View style={styles.covline}>
                  <Text style={styles.cattxt}><TranslateHandled text={item.name} /></Text>

                  <Text
                    style={styles.seealltxt}
                    onPress={() =>
                      navigate('Foods', {id: item?._id, name: item?.name,store_id:seller_id})
                    }>
                    {t("See all")}
                  </Text>
                </View>
                <ScrollView
                  horizontal={true}
                  showsHorizontalScrollIndicator={false}>
                  {item.foods.map((proditem, ind) => (
                    <TouchableOpacity
                      key={ind}
                      style={styles.prodbox}
                      onPress={() => navigate('PreView', proditem?._id)}>
                      <Image
                        source={{uri: proditem?.image[0]}}
                        style={{height: 106, width: '100%', borderRadius: 10}}
                      />
                      <Text style={styles.proname}>{proditem?.name}</Text>
                      <Text style={styles.pricetxt}>{Currency} {proditem?.price}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )
          // )}
        }
        ListEmptyComponent={() => (
                    <View
                      style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: Dimensions.get('window').height - 300,
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
      />
    </SafeAreaView>
  );
};

export default FoodCategories;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.white,
    padding: 10,
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
  covline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginVertical: 10,
    // backgroundColor:Constants.red
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
    fontSize: 16,
    color: Constants.dark_green,
    fontFamily: FONTS.SemiBold,
    alignSelf: 'flex-start',
  },
  proname: {
    fontSize: 16,
    color: Constants.dark_green,
    fontFamily: FONTS.SemiBold,
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  prodbox: {
    // marginHorizontal: 10,
    width: 180,
    // flex: 1,
    // backgroundColor: Constants.red,
    padding: 10,
    borderRadius: 15,
    alignItems: 'center',
    boxShadow: '0 0 6 0.5 grey',
  },
});
