import { FlatList, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import Constants, { FONTS,} from '../../Assets/Helpers/constant'
import { LocationDataContext } from '../../../App'
import { DirectionIcon } from '../../../Theme'

const Services = () => {
    const [latlong, setlatlong] = useContext(LocationDataContext);
    const [masjidList, setmasjidList] = useState([]);


  return (
    <View style={styles.container}>
        <View style={styles.loctxt}>
            <Text style={styles.headtxt1}>Nearby Masjids</Text>
        </View>

            <FlatList
            data={masjidList}
            showsVerticalScrollIndicator={false}
            renderItem={({item,index})=><View style={[styles.card,{marginBottom:index===masjidList.length-1?100:0}]}>
              <View style={{width:'65%',}}>
                <Text style={styles.masname} numberOfLines={2}>{item?.name}</Text>
                <Text style={styles.masadd} numberOfLines={2}>{item?.vicinity}</Text>
                <Text style={[styles.masadd,{fontFamily:FONTS.Medium}]}>{getDistance(latlong?.latitude,latlong?.longitude,item?.geometry?.location?.lat,item?.geometry?.location?.lng)} km</Text>
                </View>
                <TouchableOpacity style={styles.btnview} >
                  <DirectionIcon width={20} height={20} color={Constants.normal_green}/>
                  <Text style={styles.dirtxt}>Directions</Text>
                </TouchableOpacity>
            </View>}
            />

    </View>
  )
}

export default Services

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