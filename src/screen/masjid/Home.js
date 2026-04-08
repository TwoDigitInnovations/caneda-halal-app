import { ActivityIndicator, Dimensions, Image, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import Constants, { FONTS, Masjid_key } from '../../Assets/Helpers/constant'
import SwiperFlatList from 'react-native-swiper-flatlist'
import Scheliton from '../../Assets/Component/Scheliton'
import { GetApi } from '../../Assets/Helpers/Service'
import axios from 'axios'
import { AddressContext, LoadContext, LocationDataContext } from '../../../App'
import CuurentLocation from '../../Assets/Component/CuurentLocation'
import moment from 'moment'

const Home = () => {
    const [carosalimg, setcarosalimg] = useState([]);
    const [locationadd, setlocationadd] = useContext(AddressContext);
    const [latlong, setlatlong] = useContext(LocationDataContext);
    const [loading, setLoading] = useContext(LoadContext);
    const [imgLoading, setImgLoading] = useState(true);
    const [timeSlots, settimeSlots] = useState([]);
    const [nextPrayer, setNextPrayer] = useState(null);
    const [timeZone, setTimeZone] = useState(null);
    const [currentPrayer, setCurrentPrayer] = useState(null);
    const [nextPrayerTime, setNextPrayerTime] = useState(null);

    // console.log('locationadd', locationadd);
    const width = Dimensions.get('window').width;
    const width2 = Dimensions.get('window').width - 30;

    useEffect(()=>{
        getcarosal1();
    }, [])
    useEffect(()=>{
       {latlong?.latitude&& prayerTime();}
    }, [latlong])

    const prayerTime = async() => {
        // CuurentLocation(async(res) => {
setLoading(true)
const url = `https://islamicapi.com/api/v1/prayer-time/?lat=${latlong?.latitude}&lon=${latlong?.longitude}&api_key=${Masjid_key}`;
console.log('url', url);
try {
  const response = await axios.get(url);
  setLoading(false)
      console.log(response?.data);
      const timesObj = response?.data?.data?.times;
      setTimeZone(response?.data?.data?.timezone?.name);
      const prayerStatus = getCurrentPrayerStatus(timesObj);

    setCurrentPrayer(prayerStatus?.currentPrayer || null);
    setNextPrayerTime(prayerStatus?.nextPrayerTime || null);
      settimeSlots(Object.entries(timesObj));
      const next = getNextPrayer(timesObj);
      setNextPrayer(next);
      
    } catch (error) {
      console.error('Error fetching data: ', error);
    }
  };

    const getcarosal1 = () => {
    // setLoading(true);
    GetApi(`getBookingCarousel1`,).then(
      async res => {
        // setLoading(false);
        console.log(res);
        if (res.status) {
          setcarosalimg(res?.data?.bookingcarousel1[0].carousel);
        }
      },
      err => {
        // setLoading(false);
        console.log(err);
      },
    );
  };
  const to12Hour = (time) => {
  if (!time) return "";
  let [h, m] = time.split(":");
  h = parseInt(h, 10);
  const suffix = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${suffix}`;
};
const getNextPrayer = (timesObj) => {
  const now = new Date();
  const today = now.toISOString().substring(0, 10);

  let upcoming = null;

  Object.entries(timesObj).forEach(([name, time]) => {
    const [h, m] = time.split(":");
    const prayerDate = new Date(today);
    prayerDate.setHours(h, m, 0);

    if (prayerDate > now) {
      if (!upcoming || prayerDate < upcoming.time) {
        upcoming = { name, time: prayerDate };
      }
    }
  });

  return upcoming?.name || null;
};

const getCurrentPrayerStatus = (timesObj) => {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);

  const entries = Object.entries(timesObj).map(([name, time]) => {
    const [h, m] = time.split(":");
    const date = new Date(today);
    date.setHours(h, m, 0);
    return { name, date };
  });

  // Sort by time
  entries.sort((a, b) => a.date - b.date);

  for (let i = 0; i < entries.length; i++) {
    const current = entries[i];
    const next = entries[i + 1];

    if (now >= current.date && (!next || now < next.date)) {
      return {
        currentPrayer: current.name,
        nextPrayer: next?.name,
        nextPrayerTime: next?.date,
      };
    }
  }

  return null;
};

const getTimeDiff = (futureTime) => {
  const now = new Date();
  const diffMs = futureTime - now;

  if (diffMs <= 0) return "0m";

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  return `${hours}h ${minutes}m`;
};


  return (
    <View style={styles.container}>
        <View style={styles.loctxt}>
            <Text style={styles.headtxt1}>{timeZone}</Text>
            <Text style={styles.headtxt2} numberOfLines={1}>{locationadd}</Text>
        </View>
        <View>
      {carosalimg && carosalimg?.length > 0 ? (
          <SwiperFlatList
            autoplay
            autoplayDelay={2}
            autoplayLoop
            data={carosalimg || []}
            renderItem={({item, index}) => (
              <View style={{width: width, alignItems: 'center'}}>
                {imgLoading && (
        <ActivityIndicator
          size="small"
          color="#999"
          style={StyleSheet.absoluteFill}
        />
      )}
                <Image
                  source={{uri: `${item.image}`}}
                  // source={item.images}
                  style={{
                    height: 180,
                    width: width2,
                    borderRadius: 20,
                    // marginLeft:-10,
                    // backgroundColor: 'red',
                    alignSelf: 'center',
                  }}
                  onLoadStart={() => setImgLoading(true)}
                  onLoadEnd={() => setImgLoading(false)}
                  onError={() => setImgLoading(false)}
                  resizeMode="stretch"
                  key={index}
                />
              </View>
            )}
          />
        ) : (
          <Scheliton/>
        )}
        </View>
        <View style={{alignItems:'center',marginTop:20 }}>
  <Text style={styles.timetxt}>
    {moment(new Date()).format("hh:mm A")}
  </Text>

  {currentPrayer ? (
    <Text style={styles.timetxt2}>
      {currentPrayer.toUpperCase()} TIME HAS BEGUN
    </Text>
  ) : null}

  {nextPrayer ? (
    <Text style={styles.timetxt3}>
      Next prayer {nextPrayer} in {getTimeDiff(nextPrayerTime)}
    </Text>
  ) : null}
</View>

        <ScrollView style={{marginTop:5}} showsVerticalScrollIndicator={false}>
        {timeSlots?.length>0 &&timeSlots?.map(([name, time], index) =>{
            const isNext = name === nextPrayer;
            return(<View key={index} style={[styles.timeslotbox,{marginBottom:index===timeSlots.length-1?130:0,backgroundColor: isNext ? "#F2D06A" : Constants.normal_green,}]}>
                <Text style={[styles.btntxt,{color:isNext?Constants.dark_green:Constants.white}]}>{name}</Text>
                <View style={{flexDirection:'row',alignItems:'center',gap:10}}>
                    {isNext&&<Text style={styles.nowtxt}>Now</Text>}
                <Text style={[styles.btntxt,{color:isNext?Constants.dark_green:Constants.white}]}>{to12Hour(time)}</Text>
                </View>
            </View>)})}
            </ScrollView>
    </View>
  )
}

export default Home

const styles = StyleSheet.create({
    container: {
    flex: 1,
    backgroundColor: Constants.white,
  },
  headtxt1: {
    fontSize: 16,
    fontFamily: FONTS.SemiBold,
    color: Constants.black,
    marginTop: 10,
  },
  headtxt2: {
    fontSize: 14,
    fontFamily: FONTS.Medium,
    color: Constants.black,
    width: '70%',
  },
  timeslotbox:{
    backgroundColor:Constants.normal_green,
    justifyContent:'space-between',
    flexDirection:'row',
    padding:15,
    borderRadius:25,
    marginTop:10,
    width:'90%',
    alignSelf:'center'
  },
  btntxt:{
    color:Constants.white,
    fontFamily:FONTS.Medium,
    fontSize:14,
  },
  loctxt:{
    marginLeft:20,
    marginBottom:10
},
nowtxt:{
    color:'#FC8600',
    fontFamily:FONTS.Medium,
    fontSize:14,
},
timetxt:{
     fontSize: 24, 
     fontFamily:FONTS.Bold, 
     color:Constants.black
},
timetxt2:{
     fontSize: 16, 
     fontFamily:FONTS.SemiBold, 
     color:Constants.normal_green
},
timetxt3:{
     fontSize: 14, 
     fontFamily:FONTS.Medium, 
     color:Constants.black
},
})