import React, {useCallback, useContext, useRef} from 'react';
import {Platform, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {CartIcon,Home2Icon,  Profile2Icon, ShopIcon } from '../../Theme';
import Constants, { FONTS } from '../Assets/Helpers/constant';
import Home from '../screen/food/user/Home';
import Cart from '../screen/food/user/Cart';
import Profile from '../screen/food/user/Profile';
import { useTranslation } from 'react-i18next';
import { FoodCartContext } from '../../App';
import FoodShops from '../screen/food/user/FoodShops';



const Tab = createBottomTabNavigator();

export const  Foodtab=()=>{
 const { t } = useTranslation();
 const [foodcartdetail, setfoodcartdetail] = useContext(FoodCartContext);
  const TabArr = [
    {
      iconActive: <Home2Icon color={Constants.dark_green} height={30} width={30} />,
      iconInActive: <Home2Icon color={Constants.tabgrey} height={30} width={30} />,
      component: Home,
      routeName: 'Home',
      name: t('Home'),
    },
    {
      iconActive: <ShopIcon color={Constants.dark_green} height={30} width={30} />,
      iconInActive: <ShopIcon color={Constants.tabgrey} height={30} width={30} />,
      component: FoodShops,
      routeName: 'FoodShops',
      name: t('Shops'),
    },
    {
      iconActive: <CartIcon color={Constants.dark_green} height={30} width={30} />,
      iconInActive: <CartIcon color={Constants.tabgrey} height={30} width={30} />,
      component: Cart,
      routeName: 'Cart',
      name: t('Cart'),
    },
    {
        iconActive: <Profile2Icon color={Constants.dark_green} height={30} width={30} />,
        iconInActive: <Profile2Icon color={Constants.tabgrey} height={30} width={30} />,
        component: Profile,
        routeName: 'Profile',
        name: t('Profile'),
    },
   
  ];

  const TabButton = useCallback(
    ({accessibilityState, onPress, onclick, item,index}) => {
      const cartCount = foodcartdetail?.length || 0;
      const isSelected = accessibilityState?.selected;
      return (
        <View style={styles.tabBtnView}>
         <View style={[index ===1 && {position:'relative'}]}>
          <TouchableOpacity
            onPress={onclick ? onclick : onPress}
            style={[
              styles.tabBtn
            ]}>
            {isSelected ? item.iconActive : item.iconInActive}
            
          </TouchableOpacity>
          { index ===2&&cartCount>0&&<TouchableOpacity style={styles.badge} onPress={onclick ? onclick : onPress}>
                          <Text style={styles.badgeText}>
                            {cartCount > 99 ? '99+' : cartCount}
                          </Text>
                        </TouchableOpacity>}
                        </View>
          <Text style={[styles.tabtxt,{color:isSelected?Constants.dark_green:Constants.black}]}>{item.name}</Text>
        </View>
      );
    },
    [foodcartdetail],
  );

  return (
    
    <Tab.Navigator
      screenOptions={{
        tabBarShowLabel: false,
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          position: 'absolute',
          width: '100%',
          height: Platform.OS==='ios'?90: 70,
          backgroundColor: Constants.white,
          borderTopRightRadius: 15,
          borderTopLeftRadius: 15,
          borderTopWidth: 0,
        //   paddingTop: Platform.OS === 'ios' ? 10 : 0,
        },
      }}>
      {TabArr.map((item, index) => {
        return (
          <Tab.Screen
            key={index}
            name={item.routeName}
            component={item.component}
           
            options={{
              tabBarShowLabel: false,
              tabBarButton: props => (
                <TabButton {...props} item={item} index={index} />
              ),
            }}
          />
        );
      })}
    </Tab.Navigator>
    
  );
  
}

const styles = StyleSheet.create({
  tabBtnView: {
    // backgroundColor: isSelected ? 'blue' : '#FFFF',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBtn: {
    height: 40,
    width: 40,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBtnActive: {
    backgroundColor: Constants.white,
  },
  tabBtnInActive: {
    backgroundColor: 'white',
  },
  tabtxt:{
    color:Constants.black,
    // fontWeight:'400',
    fontFamily:FONTS.Medium,
  },
  badge: {
    position: 'absolute',
    top: 1,
    right: -2,
    backgroundColor: Constants.normal_green,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontFamily: FONTS.Medium,
    textAlign: 'center',
  },
});
