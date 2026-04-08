import { Dimensions, FlatList, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import Constants, { FONTS, Googlekey, } from '../../Assets/Helpers/constant'
import axios from 'axios'
import { LoadContext, LocationDataContext } from '../../../App'
import { DirectionIcon } from '../../../Theme'

const Mosques = () => {
    const [latlong, setlatlong] = useContext(LocationDataContext);
    const [loading, setLoading] = useContext(LoadContext);
    const [masjidList, setmasjidList] = useState([]);

    useEffect(()=>{
       {latlong?.latitude&& nearbyMasjid();}
    }, [latlong])

    const nearbyMasjid = async() => {
      setLoading(true)
      // const url = `https://islamicapi.com/api/v1/prayer-time/?lat=$&lon=&api_key=${Masjid_key}`;
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latlong?.latitude},${latlong?.longitude}&radius=5000&type=mosque&key=${Googlekey}`;
      console.log('url', url);
      try {
        const response = await axios.get(url);
        setLoading(false)
      console.log(response?.data);
      setmasjidList(response?.data?.results);
      
    } catch (error) {
      console.error('Error fetching data: ', error);
    }
  };

  const getDistance = (lat1, lon1, lat2, lon2) => {

  const R = 6371; // Radius of earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1); // Distance in KM
};

  return (
    <View style={styles.container}>
        <View style={styles.loctxt}>
            <Text style={styles.headtxt1}>Nearby Masjids</Text>
        </View>

            <FlatList
            data={masjidList}
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
              No Masjids Available
            </Text>
          </View>
        )}
            showsVerticalScrollIndicator={false}
            renderItem={({item,index})=><View style={[styles.card,{marginBottom:index===masjidList.length-1?100:0}]}>
              <View style={{width:'65%',}}>
                <Text style={styles.masname} numberOfLines={2}>{item?.name}</Text>
                <Text style={styles.masadd} numberOfLines={2}>{item?.vicinity}</Text>
                <Text style={[styles.masadd,{fontFamily:FONTS.Medium}]}>{getDistance(latlong?.latitude,latlong?.longitude,item?.geometry?.location?.lat,item?.geometry?.location?.lng)} km</Text>
                </View>
                <TouchableOpacity style={styles.btnview} onPress={() => {
              let origin = `${latlong?.latitude},${latlong?.longitude}`;
              let destination = `${item?.geometry?.location?.lat},${item?.geometry?.location?.lng}`;
              Linking.openURL(
                `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`,
              );
            }}>
                  <DirectionIcon width={20} height={20} color={Constants.normal_green}/>
                  <Text style={styles.dirtxt}>Directions</Text>
                </TouchableOpacity>
            </View>}
            />

    </View>
  )
}

export default Mosques

const styles = StyleSheet.create({
    container: {
    flex: 1,
    backgroundColor: Constants.white,
    padding: 15,
  },
  headtxt1: {
    fontSize: 16,
    fontFamily: FONTS.SemiBold,
    color: Constants.black,
    marginTop: 10,
    textAlign:'center'
  },
  masname: {
    fontSize: 14,
    fontFamily: FONTS.SemiBold,
    color: Constants.black,
  },
  masadd: {
    fontSize: 14,
    fontFamily: FONTS.Regular,
    color: Constants.black,
  },
  card:{
    borderWidth:1,
    borderColor:Constants.normal_green,
    padding:15,
    borderRadius:20,
    marginTop:10,
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-between',
  },
  dirtxt:{
    color:Constants.white,
    fontFamily:FONTS.SemiBold,
    fontSize:12,
  },
  btnview:{
    backgroundColor:Constants.normal_green,
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'center',
    gap:5,
    padding:8,
    borderRadius:10,
  },
})