import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useContext, useEffect, useState} from 'react';
import {Post} from '../../../Assets/Helpers/Service';
import CuurentLocation from '../../../Assets/Component/CuurentLocation';
import {FoodUserContext, LoadContext, ToastContext} from '../../../../App';
import Constants, {FONTS} from '../../../Assets/Helpers/constant';
import {useTranslation} from 'react-i18next';
import moment from 'moment';
import { navigate } from '../../../../navigationRef';

const FoodShops = () => {
  const [storelist, setstorelist] = useState([]);
  const [toast, setToast] = useContext(ToastContext);
  const [loading, setLoading] = useContext(LoadContext);
  const [fooduserProfile, setfooduserProfile] = useContext(FoodUserContext);
  const {t} = useTranslation();
  useEffect(() => {
    getnearbyshops();
  }, [fooduserProfile]);

  const getnearbyshops = () => {
    setLoading(true);
    if (fooduserProfile?.shipping_address?.location?.coordinates?.length > 0) {
    // Use saved location
    const data = {
      role: 'FOODSELLER',
      location: fooduserProfile.shipping_address.location,
    };

    Post(`getnearbystore`, data)
      .then(async res => {
        setLoading(false);
        console.log(res);
        if (res.status) {
          setstorelist(res.data);
        }
      })
      .catch(err => {
        setLoading(false);
        console.log(err);
      });
  } else {
    // Fetch current location
    CuurentLocation(res => {
      const data = {
        role: 'FOODSELLER',
        location: {
          type: 'Point',
          coordinates: [res.coords.longitude, res.coords.latitude],
        },
      };

      Post(`getnearbystore`, data)
        .then(async res => {
          setLoading(false);
          console.log(res);
          if (res.status) {
            setstorelist(res.data);
          }
        })
        .catch(err => {
          setLoading(false);
          console.log(err);
        });
    });
  }
  };
const getShopStatus = (shop) => {
  const { available_days=[], opeing_time, close_time } = shop;

  const now = moment(); // current time
  const today = now.format("ddd"); // e.g. "Mon"
  const currentDayIndex = now.isoWeekday(); // 1=Mon ... 7=Sun

  // Convert opening & closing times to today's date
  const opening = moment(opeing_time, ["hh:mm A"]);
  const closing = moment(close_time, ["hh:mm A"]);

  // Is today in available days?
  const isTodayAvailable = available_days.includes(today);

  // Check if currently open
  if (isTodayAvailable && now.isBetween(opening, closing)) {
    return { status: "open" };
  }

  // If closed, find next opening day
  for (let i = 0; i < 7; i++) {
    const nextDay = moment().add(i, "days");
    const nextDayName = nextDay.format("ddd");

    if (available_days.includes(nextDayName)) {
      if (i === 0 && now.isBefore(opening)) {
        // Shop opens later today
        return {
          status: "closed",
          nextOpen: t("opensToday", { time: opeing_time }),
        };
      } else if (i > 0) {
        // Shop opens in coming days
        return {
          status: "closed",
          nextOpen: t("opensNextDay", { day: nextDayName, time: opeing_time }),
        };
      }
    }
  }

  return { status: "closed", nextOpen: null };
};
  return (
    <View style={styles.container}>
      <Text style={styles.headtxt}>{t("Shops")}</Text>
      <FlatList
        data={storelist}
        numColumns={3}
        renderItem={({item, index}) => {
          const { status, nextOpen } = getShopStatus(item);
          return(
          <TouchableOpacity style={styles.shoppart} onPress={() => navigate('ShopDetail',{store_cover_img:item?.store_cover_img,store_logo:item?.store_logo,store_name:item?.store_name,distance:item?.distance,store_id:item?.user,status:status,nextOpen:nextOpen})}>
            <Image
              source={{uri: item?.store_logo}}
              style={{height: 100, width: 100, borderRadius: 120,opacity:status==="open"?1:0.5}}
            />
            <Text style={styles.shopname}>{item?.store_name}</Text>
            {status === "open" ? (
        <Text style={styles.opntxt}>{t("Open Now")}</Text>
      ) : (
        <Text style={styles.opntxt}>{t("Closed")}</Text>
      )}
      {status === "closed" &&<Text style={styles.clostxt}>{nextOpen}</Text>}
          </TouchableOpacity>
        )}}
        ListEmptyComponent={() => (
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              height: Dimensions.get('window').height - 200,
            }}>
            <Image
              source={require('../../../Assets/Images/shop.png')}
              style={{alignSelf: 'center', height: 200, width: 200}}
            />
            <Text style={styles.empttxt}>{t('No shop available')}</Text>
            <Text style={styles.empttxt2}>
              {t('No shop available in your area. Please check again later.')}
            </Text>
          </View>
        )}
      />
    </View>
  );
};

export default FoodShops;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.white,
    padding: 20,
  },
  headtxt: {
    color: Constants.black,
    fontSize: 18,
    fontFamily: FONTS.SemiBold,
    marginBottom: 10,
  },
  shopname: {
    color: Constants.black,
    fontSize: 14,
    fontFamily: FONTS.Medium,
    textAlign: 'center',
    marginTop: 5,
  },
  shoppart: {
    alignItems: 'center',
    width: '33.3%',
  },
  empttxt: {
    fontSize: 16,
    color: Constants.black,
    fontFamily: FONTS.Bold,
    textAlign: 'center',
  },
  opntxt: {
    fontSize: 12,
    color: Constants.customgrey2,
    fontFamily: FONTS.Medium,
    textAlign: 'center',
  },
  clostxt: {
    fontSize: 12,
    color: '#94712e',
    fontFamily: FONTS.Medium,
    textAlign: 'center',
  },
  empttxt2: {
    fontSize: 16,
    color: Constants.customgrey2,
    fontFamily: FONTS.Medium,
    textAlign: 'center',
    width: '80%',
    alignSelf: 'center',
  },
});
