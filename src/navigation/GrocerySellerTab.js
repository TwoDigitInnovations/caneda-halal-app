import React, {useCallback, useRef} from 'react';
import {Animated, Dimensions, Platform, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import { GridIcon, Notification2Icon, PlusIcon, Profile2Icon, ProfileIcon, ThreelineIcon } from '../../Theme';
import Constants, { FONTS } from '../Assets/Helpers/constant';
import useModuleStatusBar from '../Assets/Helpers/useModuleStatusBar';
import Home from '../screen/grocery/seller/Home';
import Grocerylist from '../screen/grocery/seller/GroceryList';
import CreateGrocery from '../screen/grocery/seller/CreateGrocery';
import Account from '../screen/grocery/seller/Account';
import Notification from '../screen/grocery/seller/Notification';



const Tab = createBottomTabNavigator();

export const  GrocerySellerTab=()=>{
  useModuleStatusBar({bg: '#ffffff', barStyle: 'dark-content'});
  const TabArr = [
    {
      iconActive: <GridIcon color={Constants.dark_green} height={25} width={25} />,
      iconInActive: <GridIcon color={Constants.tabgrey} height={25} width={25} />,
      component: Home,
      routeName: 'Home',
    },
    {
      iconActive: <ThreelineIcon color={Constants.dark_green} height={25} width={25} />,
      iconInActive: <ThreelineIcon color={Constants.tabgrey} height={25} width={25} />,
      component: Grocerylist,
      routeName: 'Grocerylist',
    },
    {
        iconActive: <PlusIcon color={Constants.dark_green} height={20} width={20} />,
        iconInActive: <PlusIcon color={Constants.tabgrey} height={20} width={20} />,
        component: CreateGrocery,
        routeName: 'CreateGrocery',
    },
    {
        iconActive: <Notification2Icon color={Constants.dark_green} height={25} width={25} />,
        iconInActive: <Notification2Icon color={Constants.tabgrey} height={25} width={25} />,
        component: Notification,
        routeName: 'Notification',
    },
    {
        iconActive: <ProfileIcon color={Constants.dark_green} height={25} width={25} />,
        iconInActive: <ProfileIcon color={Constants.tabgrey} height={25} width={25} />,
        component: Account,
        routeName: 'Account',
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
              index===2?styles.plusBtn:styles.tabBtn,
              {backgroundColor:isSelected&&index===2?'#F1FFF2':index===2?'#FFF1F2':null}
            ]}>
            {isSelected ? item.iconActive : item.iconInActive}
            
          </TouchableOpacity>
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
          borderTopRightRadius: 20,
          borderTopLeftRadius: 20,
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
  plusBtn: {
    height: 55,
    width: 55,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth:1,
    borderColor:Constants.normal_green,
    backgroundColor:'#FFF1F2'
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
