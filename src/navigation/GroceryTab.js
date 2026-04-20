import React, { useContext, useEffect, useRef } from 'react';
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
import { CategoryIcon, Home2Icon, Profile4Icon, Shop2Icon } from '../../Theme';
import Constants, { FONTS } from '../Assets/Helpers/constant';
import Home from '../screen/grocery/app/Home';
import Cart from '../screen/grocery/app/Cart';
import Account from '../screen/grocery/app/Account';
import { useTranslation } from 'react-i18next';
import { GroceryCartContext } from '../../App';
import GroceryShops from '../screen/grocery/app/GroceryShops';
import Categories from '../screen/grocery/app/Categories';

const Tab = createBottomTabNavigator();
const SCREEN_WIDTH = Dimensions.get('window').width;

const TAB_BAR_H = Platform.OS === 'ios' ? 70 : 60;
const H_MARGIN = 16;
const BAR_WIDTH = SCREEN_WIDTH - H_MARGIN * 2;
const TAB_WIDTH = BAR_WIDTH / 4;

const PILL_WIDTH = 110;
const PILL_HEIGHT = 46;
const PILL_TOP = (TAB_BAR_H - PILL_HEIGHT) / 2;

export const Grocerytab = () => {
  const { t } = useTranslation();
  const [grocerycartdetail] = useContext(GroceryCartContext);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const TabArr = [
    {
      icon: (color) => <Home2Icon color={color} height={24} width={24} />,
      component: Home,
      routeName: 'Home',
      name: t('Home'),
    },
    {
      icon: (color) => <Shop2Icon color={color} height={24} width={24} />,
      component: GroceryShops,
      routeName: 'GroceryShops',
      name: t('Shops'),
    },
    {
      icon: (color) => <CategoryIcon color={color} height={24} width={24} />,
      component: Categories,
      routeName: 'Categories',
      name: t('Categories'),
    },
    {
      icon: (color) => <Profile4Icon color={color} height={22} width={22} />,
      component: Account,
      routeName: 'Account',
      name: t('Account'),
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

  const pillTranslateX = slideAnim.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: [0, 1, 2, 3].map(
      (i) => i * TAB_WIDTH + (TAB_WIDTH - PILL_WIDTH) / 2
    ),
  });

  const CustomTabBar = ({ state, navigation }) => {
    useEffect(() => {
      animatePill(state.index);
    }, [state.index]);

    const cartCount = grocerycartdetail?.length || 0;

    return (
      <View style={styles.outerWrapper}>
        {/* ── Frosted glass bar (no package) ── */}
        <View style={styles.tabBarOuter}>

          {/* ── Sliding pill — more opaque so it looks "less blurry" ── */}
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

          {/* ── Tab items ── */}
          {TabArr.map((item, index) => {
            const isSelected = state.index === index;
            const route = state.routes[index];
            const iconColor = isSelected ? Constants.dark_green : Constants.tabgrey;

            return (
              <TouchableOpacity
                key={index}
                style={styles.tabItem}
                activeOpacity={0.8}
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
                  <View style={styles.activeRow}>
                    <View style={styles.iconBox}>
                      {item.icon(Constants.dark_green)}
                    </View>
                    <Text style={styles.activeLabel}>{item.name}</Text>
                  </View>
                ) : (
                  <View style={styles.inactiveCol}>
                    <View style={styles.iconBox}>
                      {item.icon(Constants.tabgrey)}
                    </View>
                    <Text style={styles.inactiveLabel}>{item.name}</Text>
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
  outerWrapper: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 16,
    left: H_MARGIN,
    right: H_MARGIN,
    // Shadow so bar lifts off the page content beneath it
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
    // backgroundColor:'red'
  },
  tabBarOuter: {
    flexDirection: 'row',
    height: TAB_BAR_H,
    borderRadius: 50,
    // Semi-transparent white — simulates the blurry frosted look
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderWidth: 0.8,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    alignItems: 'center',
    overflow: 'hidden',
  },
  pill: {
    position: 'absolute',
    // More opaque white = "less blurry" active capsule
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    borderRadius: 50,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    zIndex: 1,
  },
  activeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 8,
  },
  activeLabel: {
    color: Constants.dark_green,
    fontFamily: FONTS.Medium,
    fontSize: 13,
  },
  inactiveCol: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  inactiveLabel: {
    color: Constants.tabgrey,
    fontFamily: FONTS.Medium,
    fontSize: 10,
    marginTop: 2,
  },
  iconBox: {
    // position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
});