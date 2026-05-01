import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Cart2Icon, Home2Icon, Profile2Icon, ProfileIcon, ShopIcon } from '../../Theme';
import Constants, { FONTS } from '../Assets/Helpers/constant';
import useModuleStatusBar from '../Assets/Helpers/useModuleStatusBar';
import Home from '../screen/food/user/Home';
import Cart from '../screen/food/user/Cart';
import Profile from '../screen/food/user/Profile';
import { useTranslation } from 'react-i18next';
import { FoodCartContext } from '../../App';
import FoodShops from '../screen/food/user/FoodShops';

const Tab = createBottomTabNavigator();
const SCREEN_WIDTH = Dimensions.get('window').width;
const TAB_BAR_H = Platform.OS === 'ios' ? 90 : 70;
const H_PADDING = 16;
const TAB_WIDTH = (SCREEN_WIDTH - H_PADDING * 2) / 4;

// Width of the pill — active tab shows icon + label side by side
// Inactive tabs show only icon, so they stay narrow
const PILL_WIDTH = 110; // adjust to fit your longest label
const PILL_HEIGHT = 48;
const PILL_TOP = (TAB_BAR_H - (Platform.OS === 'ios' ? 20 : 0) - PILL_HEIGHT) / 2;

export const Foodtab = () => {
  useModuleStatusBar({bg: '#ffffff', barStyle: 'dark-content'});
  const { t } = useTranslation();
  const [foodcartdetail] = useContext(FoodCartContext);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const TabArr = [
    {
      iconActive: (color) => <Home2Icon color={color} height={24} width={24} />,
      component: Home,
      routeName: 'Home',
      name: t('Home'),
    },
    {
      iconActive: (color) => <ShopIcon color={color} height={24} width={24} />,
      component: FoodShops,
      routeName: 'FoodShops',
      name: t('Restaurants'),
    },
    {
      iconActive: (color) => <Cart2Icon color={color} height={24} width={24} />,
      component: Cart,
      routeName: 'Cart',
      name: t('Cart'),
    },
    {
      iconActive: (color) => <ProfileIcon color={color} height={20} width={20} />,
      component: Profile,
      routeName: 'Profile',
      name: t('Profile'),
    },
  ];

  const animatePill = (index) => {
    Animated.spring(slideAnim, {
      toValue: index,
      useNativeDriver: true,
      friction: 7,
      tension: 55,
    }).start();
  };

  // Pill slides to center of active tab, then offsets left so it starts from icon
  const pillTranslateX = slideAnim.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: [0, 1, 2, 3].map(
      (i) => H_PADDING + i * TAB_WIDTH + (TAB_WIDTH - PILL_WIDTH) / 2
    ),
  });

  const CustomTabBar = ({ state, navigation }) => {
    useEffect(() => {
      animatePill(state.index);
    }, [state.index]);

    const cartCount = foodcartdetail?.length || 0;

    return (
      <View style={styles.tabBarOuter}>
        <View style={styles.tabBarInner}>

          {/* Animated sliding pill */}
          <Animated.View
            style={[
              styles.pill,
              {
                width: PILL_WIDTH,
                height: PILL_HEIGHT,
                top: PILL_TOP,
                transform: [{ translateX: pillTranslateX }],
              },
            ]}
          />

          {/* Tab items */}
          {TabArr.map((item, index) => {
            const isSelected = state.index === index;
            const route = state.routes[index];
            const iconColor = isSelected ? Constants.dark_green : Constants.tabgrey;

            return (
              <TouchableOpacity
                key={index}
                style={styles.tabItem}
                activeOpacity={0.85}
                onPress={() => {
                  const event = navigation.emit({
                    type: 'tabPress',
                    target: route.key,
                    canPreventDefault: true,
                  });
                  if (!isSelected && !event.defaultPrevented) {
                    navigation.navigate(route.name);
                  }
                }}>

                {isSelected ? (
                  // ── Active: icon + label in a ROW ──
                  <View style={styles.activeRow}>
                    <View style={styles.iconBox}>
                      {item.iconActive(Constants.dark_green)}
                      {/* Cart badge */}
                      {index === 2 && cartCount > 0 && (
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>
                            {cartCount > 99 ? '99+' : cartCount}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.activeLabelText}>{item.name}</Text>
                  </View>
                ) : (
                  // ── Inactive: icon only ──
                  <View style={styles.iconBox}>
                    {item.iconActive(Constants.tabgrey)}
                    {index === 2 && cartCount > 0 && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>
                          {cartCount > 99 ? '99+' : cartCount}
                        </Text>
                      </View>
                    )}
                    <Text style={[styles.activeLabelText,{marginBottom:-10,marginTop:5}]}>{item.name}</Text>
                  </View>
                )}

              </TouchableOpacity>
            );
          })}

        </View>
      </View>
    );
  };

  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}>
      {TabArr.map((item, index) => (
        <Tab.Screen key={index} name={item.routeName} component={item.component} />
      ))}
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarOuter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: TAB_BAR_H,
    backgroundColor: Constants.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 12,
  },
  tabBarInner: {
    flexDirection: 'row',
    paddingHorizontal: H_PADDING,
    flex: 1,
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  pill: {
    position: 'absolute',
    backgroundColor: '#E8F5E9',   // swap with Constants.light_green if available
    borderRadius: 50,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    zIndex: 1,
  },

  // Active state — row layout
  activeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  activeLabelText: {
    color: Constants.dark_green,
    fontFamily: FONTS.Medium,
    fontSize: 10,
  },

  // Icon wrapper (for badge positioning)
  iconBox: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Badge
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
  },
});