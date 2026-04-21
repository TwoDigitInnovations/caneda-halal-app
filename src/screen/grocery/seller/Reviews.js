import {
  Dimensions,
  FlatList,
  Image,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useContext, useEffect, useState} from 'react';
import {goBack} from '../../../../navigationRef';
import Constants, {FONTS} from '../../../Assets/Helpers/constant';
import {BackIcon} from '../../../../Theme';
import {LoadContext} from '../../../../App';
import {GetApi} from '../../../Assets/Helpers/Service';
import {StarRatingDisplay} from 'react-native-star-rating-widget';
import { useTranslation } from 'react-i18next';

const GrocerySellerReviews = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useContext(LoadContext);
  const [reviewlist, setreviewlist] = useState([]);

  useEffect(() => {
    getreviewbyseller();
  }, []);

  const getreviewbyseller = () => {
    setLoading(true);
    GetApi(`grocerygetreviewbyseller`).then(
      async res => {
        setLoading(false);
        if (res?.status) {
          setreviewlist(res?.data);
        }
      },
      err => {
        setLoading(false);
        console.log(err);
      },
    );
  };

  return (
    <SafeAreaView style={{flex:1}}>
    <View style={styles.container}>
      <View style={styles.row}>
        <TouchableOpacity style={styles.backcov} onPress={() => goBack()}>
          <BackIcon color={Constants.black}/>
        </TouchableOpacity>
        <Text style={styles.headtxt}>{t("Reviews")}</Text>
      </View>
      <View style={{flex: 1, marginTop: 10}}>
        <FlatList
          data={reviewlist}
          showsVerticalScrollIndicator={false}
          renderItem={({item}) => (
            <View style={styles.revcov}>
              <Image
                source={
                  item?.userProfile?.image
                    ? {uri: item?.userProfile?.image}
                    : require('../../../Assets/Images/profile.png')
                }
                style={styles.userimg}
              />
              <TouchableOpacity style={styles.box}>
                <View style={styles.rowbtn}>
                  <Text style={styles.boxtxt1}>
                    {item?.userProfile?.username}
                  </Text>
                  {item?.createdAt&&<Text style={styles.boxtxt2}>{item?.createdAt}</Text>}
                </View>
                <View style={styles.foodcov}>
                  {item?.groceryImage&&<Image
                    source={{uri: item?.groceryImage}}
                    style={styles.foodimg}
                  />}
                  <Text style={styles.boxtxt3}>{item?.groceryName}</Text>
                </View>
                <StarRatingDisplay
                  rating={item?.rating || 0}
                  starSize={20}
                  color={Constants.normal_green}
                />
                <Text style={styles.boxtxt4}>{item?.comment}</Text>
              </TouchableOpacity>
            </View>
          )}
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
                {t("No Reviews Available")}
              </Text>
            </View>
          )}
        />
      </View>
      </View>
    </SafeAreaView>
  );
};

export default GrocerySellerReviews;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.white,
    paddingHorizontal: 20,
    paddingVertical: Platform.OS==='ios'?10:20,
  },
  headtxt: {
    color: Constants.black,
    fontSize: 16,
    fontFamily: FONTS.Regular,
  },
  row: {
    flexDirection: 'row',
    gap: 25,
    alignItems: 'center',
  },
  backcov: {
    height: 40,
    width: 40,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Constants.customgrey4,
  },
  box: {
    backgroundColor: Constants.customgrey4,
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    width: '70%',
  },
  userimg: {
    height: 40,
    width: 40,
    borderRadius: 20,
  },
  foodimg: {
    height: 30,
    width: 30,
    borderRadius: 20,
  },
  rowbtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  revcov: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 10,
  },
  foodcov: {
    flexDirection: 'row',
    gap: 15,
    marginVertical: 10,
    alignItems: 'center',
  },
  boxtxt1: {
    fontSize: 14,
    fontFamily: FONTS.Regular,
    color: Constants.customgrey,
  },
  boxtxt2: {
    fontSize: 14,
    fontFamily: FONTS.Regular,
    color: Constants.customgrey3,
  },
  boxtxt3: {
    fontSize: 14,
    fontFamily: FONTS.Medium,
    color: Constants.black,
  },
  boxtxt4: {
    fontSize: 12,
    fontFamily: FONTS.Medium,
    color: Constants.customgrey3,
    marginTop: 10,
  },
});
