import React, {useCallback,} from 'react';
import {Platform, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {NotesIcon,Home3Icon,  Location3Icon,  Profile3Icon } from '../../Theme';
import Constants, { FONTS } from '../Assets/Helpers/constant';
import { useTranslation } from 'react-i18next';
import useModuleStatusBar from '../Assets/Helpers/useModuleStatusBar';
import Home from '../screen/masjid/Home';
import Mosques from '../screen/masjid/Mosques';
import Services from '../screen/masjid/Services';
import Profile from '../screen/masjid/Profile';



const Tab = createBottomTabNavigator();

export const  Masjidtab=()=>{
  useModuleStatusBar({bg: Constants.dark_green, barStyle: 'light-content'});
 const { t } = useTranslation();
  const TabArr = [
    {
      iconActive: <Home3Icon color={Constants.dark_green} height={22} width={22} />,
      iconInActive: <Home3Icon color={Constants.white} height={22} width={22} />,
      component: Home,
      routeName: 'Home',
      name: t('Home'),
    },
    {
      iconActive: <Location3Icon color={Constants.dark_green} height={22} width={22} />,
      iconInActive: <Location3Icon color={Constants.white} height={22} width={22} />,
      component: Mosques,
      routeName: 'Mosques',
      name: t('Mosques'),
    },
    // {
    //   iconActive: <NotesIcon color={Constants.dark_green} height={22} width={22} />,
    //   iconInActive: <NotesIcon color={Constants.white} height={22} width={22} />,
    //   component: Services,
    //   routeName: 'Services',
    //   name: t('Services'),
    // },
    {
        iconActive: <Profile3Icon color={Constants.dark_green} height={22} width={22} />,
        iconInActive: <Profile3Icon color={Constants.white} height={22} width={22} />,
        component: Profile,
        routeName: 'Profile',
        name: t('Profile'),
    },
   
  ];

  const TabButton = useCallback(
    ({accessibilityState, onPress, onclick, item,index}) => {
      const isSelected = accessibilityState?.selected;
      return (
        <View style={styles.tabBtnView}>
         <View style={[isSelected&&styles.iconcov]}>
          <TouchableOpacity
            onPress={onclick ? onclick : onPress}
            style={[
              styles.tabBtn
            ]}>
            {isSelected ? item.iconActive : item.iconInActive}
            
          </TouchableOpacity>
                        </View>
          <Text style={styles.tabtxt}>{item.name}</Text>
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
          height: Platform.OS==='ios'?100: 90,
          backgroundColor: Constants.dark_green,
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
    height: 45,
    width: 45,
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
    color:Constants.white,
    fontSize:12,
    // fontWeight:'400',
    fontFamily:FONTS.Medium,
    marginTop:5
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
  iconcov:{
    height:45,
    width:45,
    borderRadius:10,
    justifyContent:'center',
    alignItems:'center',
    backgroundColor:Constants.white
  }
});
