import {
  StyleSheet,
  Text,
  View,
  Image,
  StatusBar,
  TouchableOpacity,
  TextInput,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import {
  DownarrowIcon,
  Location2Icon,
  LocationIcon,
  ProfileIcon,
} from '../../../Theme';
import Constants, { FONTS } from '../Helpers/constant';
import { goBack, navigate } from '../../../navigationRef';
import { AddressContext, ShoppingUserContext, UserContext } from '../../../App';

const ShoppingHeader = props => {
  const [location, setlocation] = useState(null);
  const [locationadd, setlocationadd] = useContext(AddressContext);
  const [shoppinguserProfile, setshoppinguserProfile] =useContext(ShoppingUserContext)

  return (
    <View style={{ backgroundColor: Constants.normal_green }}>
      <View style={styles.toppart}>
        <View style={styles.firstrow}>
          <TouchableOpacity
            style={{ flexDirection: 'row' }}
            onPress={() => navigate('ShoppingShipping')}>
            <Location2Icon height={25} width={25} color={Constants.white}/>
            {shoppinguserProfile?.shipping_address?.address ? (
              <Text style={styles.locationtxt} numberOfLines={1}>
                {shoppinguserProfile?.shipping_address?.house_no},{' '}
                {shoppinguserProfile?.shipping_address?.address}
              </Text>
            ) : (
              <Text style={styles.locationtxt} numberOfLines={1}>
                {locationadd}
              </Text>
            )}
            <DownarrowIcon height={15} width={15} style={{ alignSelf: 'center' }} color={Constants.white}/>
          </TouchableOpacity>
          {shoppinguserProfile?.image ? (
            <TouchableOpacity onPress={() =>
             navigate('Shoppingprofile')
            }>
              <Image
                source={{
                  uri: `${shoppinguserProfile.image}`,
                }}
                style={styles.hi}
              />
            </TouchableOpacity>
          ) : (
            <ProfileIcon
              height={22}
              width={22}
              color={Constants.white}
              onPress={() =>
               navigate('Shoppingprofile')
              }
            />
          )}
        </View>
      </View>
    </View>
  );
};

export default ShoppingHeader;

const styles = StyleSheet.create({
  toppart: {
    backgroundColor: Constants.normal_green,
    paddingTop: 5,
    // paddingBottom: 20,
  },
  firstrow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    marginVertical: 10,
  },
  locationtxt: {
    color: Constants.white,
    fontSize: 16,
    fontFamily: FONTS.Bold,
    marginLeft: 10,
    marginRight: 5,
    maxWidth: '70%',
  },
  hi: {
    height: 28,
    width: 28,
    borderRadius: 15,
  },
});
