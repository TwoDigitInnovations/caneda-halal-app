import React, {useCallback, useRef} from 'react';
import {Animated, Dimensions, Platform, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {OrderIcon,  Profile2Icon,  WorkIcon } from '../../Theme';
import Constants, { FONTS } from '../Assets/Helpers/constant';
import useModuleStatusBar from '../Assets/Helpers/useModuleStatusBar';
import AllOrder from '../screen/deliveryrider/AllOrder';
import MyOrder from '../screen/deliveryrider/MyOrder';
import Account from '../screen/deliveryrider/Account';
import { useTranslation } from 'react-i18next';



const Tab = createBottomTabNavigator();

export const  Ridertab=()=>{
  useModuleStatusBar({bg: '#ffffff', barStyle: 'dark-content'});
 const { t } = useTranslation();
  const TabArr = [
    {
      iconActive: <OrderIcon color={Constants.dark_green} height={30} width={35} />,
      iconInActive: <OrderIcon color={Constants.tabgrey} height={30} width={35} />,
      component: AllOrder,
      routeName: 'AllOrder',
      name: t('All Orders'),
    },
    {
      iconActive: <WorkIcon color={Constants.dark_green} height={35} width={35} />,
      iconInActive: <WorkIcon color={Constants.tabgrey} height={35} width={35} />,
      component: MyOrder,
      routeName: 'MyOrder',
      name: t('My Orders'),
    },
    {
        iconActive: <Profile2Icon color={Constants.dark_green} height={35} width={35} />,
        iconInActive: <Profile2Icon color={Constants.tabgrey} height={35} width={35} />,
        component: Account,
        routeName: 'Account',
        name: t('Account'),
    },
   
  ];

  const TabButton = useCallback(
    ({accessibilityState, onPress, onclick, item,index}) => {
      const isSelected = accessibilityState?.selected;
      return (
        <View style={styles.tabBtnView}>
         
          <TouchableOpacity
            onPress={onclick ? onclick : onPress}
            style={[
              styles.tabBtn,
              // isSelected ? styles.tabBtnActive : styles.tabBtnInActive,
            ]}>
            {isSelected ? item.iconActive : item.iconInActive}
            
          </TouchableOpacity>
          <Text style={[styles.tabtxt,{color:isSelected?Constants.dark_green:Constants.black,fontFamily:isSelected?FONTS.SemiBold:FONTS.Medium}]}>{item.name}</Text>
        </View>
      );
    },
    [],
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
          height: Platform.OS === 'ios'? 90:70,
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
    fontSize:12,
    fontFamily:FONTS.Medium,
  }
});
