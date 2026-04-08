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
import { AddressContext, GroceryUserContext, UserContext } from '../../../App';

const Header = props => {
  const [location, setlocation] = useState(null);
  const [locationadd, setlocationadd] = useContext(AddressContext);
  const [groceryuserProfile, setgroceryuserProfile] =useContext(GroceryUserContext)

  return (
    <View style={{ backgroundColor: Constants.normal_green }}>
      {/* <StatusBar barStyle={Platform.OS==='ios'?"dark-content":"light-content"} backgroundColor={Constants.normal_green} /> */}
      <StatusBar barStyle="dark-content" />
      <View style={styles.toppart}>
        <View style={styles.firstrow}>
          <TouchableOpacity
            style={{ flexDirection: 'row' }}
            onPress={() => navigate('GroceryShipping')}>
            <Location2Icon height={25} width={25} color={Constants.white}/>
            {groceryuserProfile?.shipping_address?.address ? (
              <Text style={styles.locationtxt} numberOfLines={1}>
                {groceryuserProfile?.shipping_address?.house_no},{' '}
                {groceryuserProfile?.shipping_address?.address}
              </Text>
            ) : (
              <Text style={styles.locationtxt} numberOfLines={1}>
                {locationadd}
              </Text>
            )}
            <DownarrowIcon height={15} width={15} style={{ alignSelf: 'center' }} color={Constants.white}/>
          </TouchableOpacity>
          {groceryuserProfile?.image ? (
            <TouchableOpacity onPress={() =>
             navigate('Groceryprofile')
            }>
              <Image
                source={{
                  uri: `${groceryuserProfile.image}`,
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
               navigate('Groceryprofile')
              }
            />
          )}
        </View>
      </View>
    </View>
  );
};

export default Header;

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
