import {
  StyleSheet,
  Text,
  View,
  Image,
  StatusBar,
  TouchableOpacity,
  Platform,
} from 'react-native';
import React, {useContext, useEffect, useState} from 'react';
import Constants, {FONTS} from '../Helpers/constant';
import {goBack, navigate, reset} from '../../../navigationRef';
import {GetApi} from '../Helpers/Service';
import {DriverProfileContext, UserContext} from '../../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {BackIcon} from '../../../Theme';

const DriverHeader = props => {
  const [loading, setLoading] = useState(false);
  const [driverProfile, setdriverProfile] = useContext(DriverProfileContext);
 
  return (
    <View style={styles.toppart}>
      <StatusBar barStyle="dark-content"/>
      <View
        style={{
          flexDirection: 'row',
          gap: 10,
          height: '100%',
          alignItems: 'center',
        }}>
        {props.showback ? (
          <TouchableOpacity
            onPress={() => goBack()}
            style={{width: 20, height: 20, marginRight: 10}}>
            <BackIcon color={Constants.white} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() =>navigate('DriverProfile')
              // user.type === 'DRIVER'
              //   ? navigate('DriverAccount')
              //   : user.type === 'SELLER'
              //   ? navigate('VendorAccount')
              //   : user.type === 'USER'
              //   ? navigate('Account')
              //   : navigate('Auth')
            }>
           {!props.hideprofile&& <Image
              // source={require('../Images/profile.png')}
              source={
                driverProfile?.image
                  ? {
                      uri: `${driverProfile.image}`,
                    }
                  : require('../../Assets/Images/profile2.png')
              }
              style={styles.hi}
            />}
          </TouchableOpacity>
        )}
        <Text style={styles.backtxt}>{props?.item}</Text>
      </View>
    </View>
  );
};

export default DriverHeader;

const styles = StyleSheet.create({
  backtxt: {
    color: Constants.white,
    fontSize: 18,
    fontFamily: FONTS.SemiBold,
  },
  toppart: {
    flexDirection: 'row',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: Constants.dark_green,
  },
  hi: {
    marginRight: 10,
    height: 25,
    width: 25,
    borderRadius: 15,
  },
  aliself: {
    alignSelf: 'center',
    // fontWeight:'bold'
    // fontFamily:FONTS.Bold
  },
});
