import React, {useContext} from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  Linking,
} from 'react-native';
import {DrawerContentScrollView, DrawerItem} from '@react-navigation/drawer';
import {useNavigation} from '@react-navigation/native';
import {
  AlertcircleIcon,
  Clock2Icon,
  CrossIcon,
  HomeIcon,
  LanguageIcon,
  Notification2Icon,
  SupportIcon,
  TagIcon,
  TermIcon,
} from '../../../Theme';
import {navigate} from '../../../navigationRef';
import Constants, {FONTS} from '../Helpers/constant';
import {GetApi} from '../Helpers/Service';
import {DriverProfileContext, ProfileContext, ProfileStatusContext} from '../../../App';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import { useTranslation } from 'react-i18next';

const DrawerList = [
  {
    icon: <HomeIcon height={25} width={25} />,
    label: 'Add Home',
    navigateTo: 'HomeLocation',
  },
  {
    icon: <TagIcon height={25} width={25} />,
    label: 'Work Location',
    navigateTo: 'WorkLocation',
  },
  {
    icon: <Clock2Icon height={25} width={25} />,
    label: 'My Rides',
    navigateTo: 'MyRides',
  },
  {
    icon: <LanguageIcon height={25} width={25} color={'#5C5C5C'} />,
    label: 'Language',
    navigateTo: 'Language',
  },
  {
    icon: <Notification2Icon height={25} width={25} color={'#5C5C5C'} />,
    label: 'Notification',
    navigateTo: 'RideUserNotification',
  },
  {
    icon: <TermIcon height={22} width={22} />,
    label: 'Terms and Condition',
    onPress: async () => {
      try {
        if (await InAppBrowser.isAvailable()) {
          await InAppBrowser.open(
            'https://www.chmp.world/termConditions',
            {
              // Customization options
              dismissButtonStyle: 'cancel',
              preferredBarTintColor: Constants.normal_green,
              preferredControlTintColor: 'white',
              readerMode: false,
              animated: true,
              modalPresentationStyle: 'fullScreen',
              modalTransitionStyle: 'coverVertical',
              enableBarCollapsing: false,
            },
          );
        } else {
          Linking.openURL('https://www.chmp.world/termConditions');
        }
      } catch (error) {
        console.error(error);
      }
    },
  },
  {
    icon: <AlertcircleIcon height={25} width={25} />,
    label: 'About',
    onPress: async () => {
      try {
        if (await InAppBrowser.isAvailable()) {
          await InAppBrowser.open(
            'https://www.chmp.world/AboutUs',
            {
              // Customization options
              dismissButtonStyle: 'cancel',
              preferredBarTintColor: Constants.normal_green,
              preferredControlTintColor: 'white',
              readerMode: false,
              animated: true,
              modalPresentationStyle: 'fullScreen',
              modalTransitionStyle: 'coverVertical',
              enableBarCollapsing: false,
            },
          );
        } else {
          Linking.openURL('https://www.chmp.world/AboutUs');
        }
      } catch (error) {
        console.error(error);
      }
    },
  },
  {
    icon: <SupportIcon height={25} width={25} />,
    label: 'Support',
    onPress: async () => {
      try {
        if (await InAppBrowser.isAvailable()) {
          await InAppBrowser.open(
            'https://tawk.to/chat/6849579fe7d8d619164a4469/1itf7shu9',
            {
              // Customization options
              dismissButtonStyle: 'cancel',
              preferredBarTintColor: Constants.normal_green,
              preferredControlTintColor: 'white',
              readerMode: false,
              animated: true,
              modalPresentationStyle: 'fullScreen',
              modalTransitionStyle: 'coverVertical',
              enableBarCollapsing: false,
            },
          );
        } else {
          Linking.openURL(
            'https://tawk.to/chat/6849579fe7d8d619164a4469/1itf7shu9',
          );
        }
      } catch (error) {
        console.error(error);
      }
    },
  },
];
const DrawerLayout = ({icon, label, navigateTo, onPress}) => {
  const navigation = useNavigation();
  // console.log(userData);
  return (
    <DrawerItem
      icon={() => icon}
      label={label}
      labelStyle={{
        color: Constants.black,
        fontSize: 16,
        fontFamily: FONTS.Medium,
        marginLeft: 10,
        marginVertical: 5,
      }}
      // activeTintColor="red"
      // inactiveTintColor="black"
      onPress={() => {
        // navigate(navigateTo);
        if (onPress) {
          onPress(); // call the custom function
        } else if (navigateTo) {
          navigate(navigateTo);
        }
      }}
    />
  );
};

const DrawerItems = () => {
  const { t } = useTranslation();
  return DrawerList.map((el, i) => {
    return (
      <DrawerLayout
        key={i}
        icon={el.icon}
        label={t(el.label)}
        navigateTo={el.navigateTo}
        onPress={el.onPress}
      />
    );
  });
};
function DrawerContent(props) {
  const { t } = useTranslation();
  const [profileStatus, setProfileStatus] = useContext(ProfileStatusContext);
  const [profile, setProfile] = useContext(ProfileContext);
  const [driverProfile, setdriverProfile] = useContext(DriverProfileContext);

  const getProfile = () => {
    // setLoading(true);
    GetApi(`getProfile/RIDEDRIVER`, {}).then(
      async res => {
        // setLoading(false);
        console.log(res.data);
        if (res?.data?.status === 'VERIFIED') {
          navigate('Drivertab');
          setdriverProfile(res?.data);
        } else {
          navigate('Driverform');
        }
      },
      err => {
        // setLoading(false);
        console.log(err);
      },
    );
  };
  return (
    <View style={{flex: 1}}>
      <DrawerContentScrollView {...props}>
        <View style={styles.drawerContent}>
          <TouchableOpacity activeOpacity={0.8}>
            <View style={styles.topcov}>
              <TouchableOpacity
                style={styles.procov}
                onPress={() => navigate('RideAccount')}>
                <Image
                  source={
                    // require('../../Assets/Images/profile3.png')
                    profile?.image
                      ? {
                          uri: `${profile.image}`,
                        }
                      : require('../../Assets/Images/profile.png')
                  }
                  style={styles.proimg}
                />
                <View>
                  <Text style={styles.nametxt}>{profile?.username}</Text>
                  <Text style={styles.protxt2}>Edit Profile</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={{height: 30, width: 30, alignItems: 'flex-end'}}
                onPress={() => props.navigation.closeDrawer()}>
                <CrossIcon height={15} width={15} color={Constants.black} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
          <View style={styles.drawerSection}>
            <DrawerItems />
          </View>
        </View>
      </DrawerContentScrollView>
      <TouchableOpacity
        style={styles.bottomDrawerSection}
        onPress={() => getProfile()}>
        <Text style={styles.buttomparttxt}>{profileStatus?.RIDEDRIVER?t('Go to Driver Flow'):t("Become a driver")}</Text>
        <Text style={styles.buttomparttxt2}>{t("Earn money on your schedule")}</Text>
      </TouchableOpacity>
    </View>
  );
}
export default DrawerContent;

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
  },
  topcov: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // alignItems:'center',
    // backgroundColor:'red',
    paddingRight: 10,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: Constants.customgrey5,
  },
  procov: {
    flexDirection: 'row',
    gap: 15,
  },
  protxt2: {
    color: Constants.black,
    fontFamily: FONTS.Light,
    fontSize: 14,
  },
  nametxt: {
    color: Constants.black,
    fontFamily: FONTS.SemiBold,
    fontSize: 16,
  },
  drawerSection: {
    marginTop: 15,
    // borderBottomWidth: 0,
    // borderBottomColor: Constants.customgrey5,
    // borderBottomWidth: 1,
  },
  bottomDrawerSection: {
    // marginBottom: 15,
    backgroundColor: Constants.dark_green,
    borderRadius: 10,
    padding: 15,
    margin: 20,
  },
  buttomparttxt: {
    color: Constants.white,
    fontSize: 16,
    fontFamily: FONTS.SemiBold,
  },
  buttomparttxt2: {
    color: Constants.white,
    fontSize: 14,
    fontFamily: FONTS.Light,
  },
  proimg: {
    height: 50,
    width: 50,
    borderRadius: 50,
  },
});
