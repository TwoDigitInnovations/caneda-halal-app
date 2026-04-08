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
import LinearGradient from 'react-native-linear-gradient';
import {navigate} from '../../../../navigationRef';
import {GetApi} from '../../../Assets/Helpers/Service';
import {LoadContext, ToastContext} from '../../../../App';
import {PlusIcon} from '../../../../Theme';
import ShoppingHeader from '../../../Assets/Component/ShoppingHeader';
import { useTranslation } from 'react-i18next';
import TranslateHandled from '../../../Assets/Component/TranslateHandled';
import DriverHeader from '../../../Assets/Component/DriverHeader';

const ShoppingCategories = () => {
  const { t } = useTranslation();
  const [toast, setToast] = useContext(ToastContext);
  const [loading, setLoading] = useContext(LoadContext);
  const [categorylist, setcategorylist] = useState();
  useEffect(() => {
    getCategoryWithShopping();
  }, []);

  const getCategoryWithShopping = () => {
    setLoading(true);
    GetApi(`getShoppingCategory`, {}).then(
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
      <DriverHeader item={t("Category")} showback={true} />
      <View style={{marginBottom:20, flex: 1}}>
        <FlatList
          data={categorylist}
          numColumns={2}
          style={{width: '100%',marginVertical: 10,paddingRight:20}}
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                navigate('ShoppingProducts', {id: item._id, name: item.name})
              }>
                <View style={{flex: 1}}>
                {/* <Text style={styles.categorytxt2}>{item.name}</Text> */}
                <Text style={styles.categorytxt2}><TranslateHandled text={item.name} /></Text>
              </View>
              <View style={styles.categorycircle}>
                <Image
                  // source={item.img}
                  source={
                    item?.image
                      ? {
                          uri: `${item?.image}`,
                        }
                      : require('../../../Assets/Images/cloth.png')
                  }
                  style={styles.categoryimg}
                />
              </View>
              
            </TouchableOpacity>
          )}
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
                        {!categorylist ? t('Loading...' ): t('No category avilable')}
                      </Text>
                    </View>
                  )}
        />
      </View>
    </SafeAreaView>
  );
};

export default ShoppingCategories;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.white,
    // padding: 10,
  },
  btn: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    marginTop: 10,
    width: '48%',
    backgroundColor: Constants.light_green,
    borderRadius:15,
    marginLeft:12
  },
  categorycircle: {
    // height: 70,
    width: '100%',
    // borderRadius: 10,
    // backgroundColor: Constants.light_green,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  categoryimg: {
    height: 100,
    width: '100%',
    resizeMode: 'stretch',
    borderRadius: 15,
  },
  categorytxt2: {
    fontSize: 14,
    color: Constants.normal_green,
    fontFamily: FONTS.SemiBold,
    textAlign: 'center',
    marginTop: 5,
    // backgroundColor:'red'
  },
    btntxt: {
    color: Constants.white,
    fontSize: 16,
    fontFamily: FONTS.Black,
    fontStyle: 'italic',
    fontWeight: '700',
  },
});
