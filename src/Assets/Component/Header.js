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
  Cart2Icon,
  DownarrowIcon,
  Location2Icon,
  LocationIcon,
  Notification2Icon,
  NotificationIcon,
  ProfileIcon,
} from '../../../Theme';
import Constants, { FONTS } from '../Helpers/constant';
import { goBack, navigate } from '../../../navigationRef';
import { AddressContext, GroceryCartContext, GroceryUserContext, UserContext } from '../../../App';

const Header = props => {
  const [location, setlocation] = useState(null);
  const [locationadd, setlocationadd] = useContext(AddressContext);
  const [groceryuserProfile, setgroceryuserProfile] =useContext(GroceryUserContext)
  const [grocerycartdetail] = useContext(GroceryCartContext);
  const cartCount = grocerycartdetail?.length || 0;

  return (
    <View >

      <View style={styles.toppart}>
        <View style={styles.firstrow}>
              <View style={styles.deliveryInfo}>
                        <Text style={[styles.deliveryTitle, {color: props.textColor || Constants.white}]}>15 minutes</Text>
                        <Text style={[styles.deliverySubtitle, {color: props.textColor || Constants.white}]} numberOfLines={1} onPress={() => navigate('GroceryShipping')}>
                          HOME -{' '}
                          {groceryuserProfile?.shipping_address?.address || locationadd}
                        </Text>
                      </View>
          <TouchableOpacity style={styles.iconcov} onPress={()=>navigate('GroceryCart')}>
            <Cart2Icon height={18} width={18} />
            {cartCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {cartCount > 99 ? '99+' : cartCount}
                </Text>
              </View>
            )}
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
            <TouchableOpacity
            style={styles.iconcov}
              onPress={() =>
               navigate('Groceryprofile')
              }
            >
              <Text>{groceryuserProfile?.name?.split(' ')[0] || 'P'}</Text>
              </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  toppart: {
    // backgroundColor: Constants.normal_green,
    paddingTop: 5,
    // paddingBottom: 20,
  },
  firstrow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems:'center',
    padding: 10,
    marginVertical: 10,
  },
  deliveryInfo: {
    // flex: 1,
    width: '75%',
    // backgroundColor:'red'
  },
  deliveryTitle: {
    fontSize: 18,
    fontFamily: FONTS.Bold,
    color: Constants.white,
    lineHeight: 22,
  },
  deliverySubtitle: {
    fontSize: 12,
    fontFamily: FONTS.Medium,
    color: Constants.white,
    // marginTop: 2,
    // width: '70%',
  },
  hi: {
    height: 28,
    width: 28,
    borderRadius: 15,
  },
  iconcov:{
    backgroundColor:'#F1F5F9CC',
    boxShadow: '0px 1px 4px 0px #00000024',
    borderRadius:50,
    height:35,
    width:35,
    justifyContent:'center',
    alignItems:'center'
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: Constants.normal_green,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontFamily: FONTS.Medium,
    textAlign: 'center',
    lineHeight: 15,
  },
});
