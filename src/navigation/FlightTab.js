import React, {useCallback} from 'react';
import {Platform, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {
  Home3Icon,
  History2Icon,
  Notification2Icon,
  SettingsIcon,
} from '../../Theme';
import Constants, {FONTS} from '../Assets/Helpers/constant';
import {useTranslation} from 'react-i18next';
import useModuleStatusBar from '../Assets/Helpers/useModuleStatusBar';
import FlightHome from '../screen/flight/Home';
import FlightHistory from '../screen/flight/History';
import FlightNotification from '../screen/flight/Notification';
import FlightSetting from '../screen/flight/Setting';

const Tab = createBottomTabNavigator();

export const Flighttab = () => {
  useModuleStatusBar({bg: Constants.dark_green, barStyle: 'light-content'});
  const {t} = useTranslation();

  const TabArr = [
    {
      iconActive: <Home3Icon color={Constants.dark_green} height={22} width={22} />,
      iconInActive: <Home3Icon color={Constants.white} height={22} width={22} />,
      component: FlightHome,
      routeName: 'FlightHome',
      name: t('Home'),
    },
    {
      iconActive: <History2Icon color={Constants.dark_green} height={22} width={22} />,
      iconInActive: <History2Icon color={Constants.white} height={22} width={22} />,
      component: FlightHistory,
      routeName: 'FlightHistory',
      name: t('History'),
    },
    {
      iconActive: <Notification2Icon color={Constants.dark_green} height={22} width={22} />,
      iconInActive: <Notification2Icon color={Constants.white} height={22} width={22} />,
      component: FlightNotification,
      routeName: 'FlightNotification',
      name: t('Notifications'),
    },
    {
      iconActive: <SettingsIcon color={Constants.dark_green} height={22} width={22} />,
      iconInActive: <SettingsIcon color={Constants.white} height={22} width={22} />,
      component: FlightSetting,
      routeName: 'FlightSetting',
      name: t('Settings'),
    },
  ];

  const TabButton = useCallback(
    ({accessibilityState, onPress, onclick, item}) => {
      const isSelected = accessibilityState?.selected;
      return (
        <View style={styles.tabBtnView}>
          <View style={[isSelected && styles.iconcov]}>
            <TouchableOpacity
              onPress={onclick ? onclick : onPress}
              style={styles.tabBtn}>
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
          height: Platform.OS === 'ios' ? 80 : 65,
          backgroundColor: Constants.dark_green,
          borderTopRightRadius: 15,
          borderTopLeftRadius: 15,
          borderTopWidth: 0,
        },
      }}>
      {TabArr.map((item, index) => (
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
      ))}
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBtnView: {
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
  tabtxt: {
    color: Constants.white,
    fontSize: 11,
    fontFamily: FONTS.Medium,
    marginTop: 2,
  },
  iconcov: {
    height: 45,
    width: 45,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Constants.white,
  },
});
