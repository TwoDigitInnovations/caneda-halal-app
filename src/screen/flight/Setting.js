import React, {useState, useCallback, useContext} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Modal,
  Linking,
  Image,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Svg, Path, Rect, Circle} from 'react-native-svg';
import Constants, {FONTS} from '../../Assets/Helpers/constant';
import {GetApi} from '../../Assets/Helpers/Service';
import {UserContext} from '../../../App';
import {navigate, reset} from '../../../navigationRef';
import AsyncStorage from '@react-native-async-storage/async-storage';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import {RadioButton} from 'react-native-paper';

/* ── menu icons ── */
const PersonalDataIcon = () => (
  <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="3" width="18" height="18" rx="3" stroke={Constants.dark_green} strokeWidth="1.5" />
    <Circle cx="12" cy="9" r="3" stroke={Constants.dark_green} strokeWidth="1.5" />
    <Path d="M6 20c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke={Constants.dark_green} strokeWidth="1.5" strokeLinecap="round" />
  </Svg>
);

const PrivacyIcon = () => (
  <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={Constants.dark_green} strokeWidth="1.5" />
    <Path d="M12 3C12 3 8 7 8 12C8 17 12 21 12 21" stroke={Constants.dark_green} strokeWidth="1.5" strokeLinecap="round" />
    <Path d="M12 3C12 3 16 7 16 12C16 17 12 21 12 21" stroke={Constants.dark_green} strokeWidth="1.5" strokeLinecap="round" />
    <Path d="M3 12H21" stroke={Constants.dark_green} strokeWidth="1.5" strokeLinecap="round" />
  </Svg>
);

const TermsIcon = () => (
  <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
      stroke={Constants.dark_green} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"
      stroke={Constants.dark_green} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const HelpIcon = () => (
  <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={Constants.dark_green} strokeWidth="1.5" />
    <Path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke={Constants.dark_green} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="12" cy="17" r="0.5" fill={Constants.dark_green} stroke={Constants.dark_green} strokeWidth="1" />
  </Svg>
);

const DeleteIcon = () => (
  <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <Path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke={Constants.dark_green} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M10 11v6M14 11v6" stroke={Constants.dark_green} strokeWidth="1.5" strokeLinecap="round" />
  </Svg>
);

const LogOutIcon = () => (
  <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke={Constants.dark_green} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M16 17l5-5-5-5M21 12H9" stroke={Constants.dark_green} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ChevronRight = () => (
  <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <Path d="M9 18l6-6-6-6" stroke={Constants.customgrey3} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const AvatarPlaceholder = () => (
  <Svg width="80" height="80" viewBox="0 0 80 80">
    <Circle cx="40" cy="40" r="40" fill="#d0d0d0" />
    <Circle cx="40" cy="30" r="14" fill="#9ca3af" />
    <Path d="M14 72c0-14.4 11.7-26 26-26s26 11.6 26 26" fill="#9ca3af" />
  </Svg>
);

const openInApp = async url => {
  try {
    if (await InAppBrowser.isAvailable()) {
      await InAppBrowser.open(url, {
        dismissButtonStyle: 'cancel',
        preferredBarTintColor: Constants.dark_green,
        preferredControlTintColor: 'white',
        readerMode: false,
        animated: true,
        modalPresentationStyle: 'fullScreen',
        modalTransitionStyle: 'coverVertical',
        enableBarCollapsing: false,
      });
    } else {
      Linking.openURL(url);
    }
  } catch {
    Linking.openURL(url);
  }
};

const MenuItem = ({icon, title, onPress}) => (
  <TouchableOpacity style={s.menuItem} onPress={onPress} activeOpacity={0.7}>
    <View style={s.menuIcon}>{icon}</View>
    <Text style={s.menuTitle}>{title}</Text>
    <ChevronRight />
  </TouchableOpacity>
);

const FlightSetting = () => {
  const [user] = useContext(UserContext);
  const [profile, setProfile] = useState({});
  const [logoutModal, setLogoutModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [logoutDest, setLogoutDest] = useState('main');

  useFocusEffect(
    useCallback(() => {
      GetApi('getProfile/FLIGHTUSER').then(
        res => { if (res?.data) setProfile(res.data); },
        () => {},
      );
    }, []),
  );

  const handleLogout = async () => {
    setLogoutModal(false);
    if (logoutDest === 'main') {
      reset('Options');
    } else {
      await AsyncStorage.removeItem('userDetail');
      reset('Auth');
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteModal(false);
    await AsyncStorage.removeItem('userDetail');
    reset('Auth');
  };

  const SECTIONS = [
    {
      label: 'Account',
      items: [
        {icon: <PersonalDataIcon />, title: 'Personal Data', onPress: () => navigate('FlightPersonalData')},
        {icon: <PrivacyIcon />, title: 'Privacy Policy', onPress: () => openInApp('https://www.chmp.world/Policy')},
        {icon: <TermsIcon />, title: 'Terms & Conditions', onPress: () => openInApp('https://www.chmp.world/termConditions')},
      ],
    },
    {
      label: 'Support',
      items: [
        {icon: <HelpIcon />, title: 'Help Centre', onPress: () => openInApp('https://tawk.to/chat/6849579fe7d8d619164a4469/1itf7shu9')},
        {icon: <DeleteIcon />, title: 'Request Account Deletion', onPress: () => setDeleteModal(true)},
        {icon: <LogOutIcon />, title: 'Log Out', onPress: () => setLogoutModal(true)},
      ],
    },
  ];

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <StatusBar backgroundColor={Constants.dark_green} barStyle="light-content" />

      {/* header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Profile Settings</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* avatar */}
        <View style={s.profileSection}>
          <View style={s.avatarWrap}>
            {profile.image
              ? <Image source={{uri: profile.image}} style={s.avatarImage} />
              : <AvatarPlaceholder />}
          </View>
          <Text style={s.profileName}>{profile.username || user?.username || 'Name'}</Text>
          {(profile.email || user?.email)
            ? <Text style={s.profileEmail}>{profile.email || user?.email}</Text>
            : null}
        </View>

        {/* menu sections */}
        {SECTIONS.map((section, si) => (
          <View key={si} style={s.section}>
            <Text style={s.sectionLabel}>{section.label}</Text>
            <View style={s.sectionCard}>
              {section.items.map((item, ii) => (
                <View key={ii}>
                  {ii > 0 && <View style={s.divider} />}
                  <MenuItem icon={item.icon} title={item.title} onPress={item.onPress} />
                </View>
              ))}
            </View>
          </View>
        ))}

        <View style={{height: 80}} />
      </ScrollView>

      {/* logout modal */}
      <Modal
        animationType="none"
        transparent
        visible={logoutModal}
        onRequestClose={() => setLogoutModal(false)}>
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <View style={s.modalHeader}>
              <View />
              <Text style={s.modalTitle}>Sign Out</Text>
              <TouchableOpacity onPress={() => setLogoutModal(false)} style={s.closeBtn}>
                <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <Path d="M18 6L6 18M6 6l12 12" stroke={Constants.black} strokeWidth="2" strokeLinecap="round" />
                </Svg>
              </TouchableOpacity>
            </View>
            <Text style={s.modalSubtitle}>Where do you want to go after logging out?</Text>
            <RadioButton.Group onValueChange={v => setLogoutDest(v)} value={logoutDest}>
              <View style={s.radioRow}>
                <TouchableOpacity style={s.radioOption} activeOpacity={0.7} onPress={() => setLogoutDest('main')}>
                  <RadioButton value="main" color={Constants.dark_green} />
                  <Text style={[s.radioLabel, logoutDest === 'main' && s.radioLabelActive]}>Main Menu</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.radioOption} activeOpacity={0.7} onPress={() => setLogoutDest('login')}>
                  <RadioButton value="login" color={Constants.dark_green} />
                  <Text style={[s.radioLabel, logoutDest === 'login' && s.radioLabelActive]}>Log In</Text>
                </TouchableOpacity>
              </View>
            </RadioButton.Group>
            <View style={s.modalActions}>
              <TouchableOpacity style={s.modalCancelBtn} activeOpacity={0.8} onPress={() => setLogoutModal(false)}>
                <Text style={s.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.modalConfirmBtn} activeOpacity={0.8} onPress={handleLogout}>
                <Text style={s.modalConfirmText}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* delete account modal */}
      <Modal
        animationType="none"
        transparent
        visible={deleteModal}
        onRequestClose={() => setDeleteModal(false)}>
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <Text style={s.warningTitle}>
              WARNING: You are about to delete your account. This action is permanent and cannot be undone.
            </Text>
            <Text style={s.warningItem}>• All your data, including personal information and settings, will be permanently erased.</Text>
            <Text style={s.warningItem}>• You will lose access to all services and benefits associated with your account.</Text>
            <Text style={s.warningItem}>• You will no longer receive updates, support, or communications from us.</Text>
            <Text style={s.warningQuestion}>Are you sure you want to delete your account?</Text>
            <View style={s.modalActions}>
              <TouchableOpacity style={s.modalConfirmBtn} activeOpacity={0.8} onPress={() => setDeleteModal(false)}>
                <Text style={s.modalConfirmText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.modalDeleteBtn} activeOpacity={0.8} onPress={handleDeleteAccount}>
                <Text style={s.modalConfirmText}>Delete Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default FlightSetting;

const s = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f5f5f5'},

  /* header */
  header: {
    backgroundColor: Constants.dark_green,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 20,
    gap: 10,
  },
  headerTitle: {fontSize: 20, fontFamily: FONTS.Bold, color: Constants.white},

  scroll: {paddingBottom: 20},

  /* profile */
  profileSection: {
    alignItems: 'center',
    backgroundColor: Constants.white,
    paddingTop: 30,
    paddingBottom: 24,
  },
  avatarWrap: {
    width: 84,
    height: 84,
    borderRadius: 42,
    overflow: 'hidden',
    marginBottom: 12,
  },
  avatarImage: {width: 84, height: 84, borderRadius: 42},
  profileName: {
    fontSize: 17,
    fontFamily: FONTS.SemiBold,
    color: Constants.black,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 13,
    fontFamily: FONTS.Regular,
    color: Constants.customgrey3,
  },

  /* sections */
  section: {paddingHorizontal: 16, paddingTop: 20},
  sectionLabel: {
    fontSize: 13,
    fontFamily: FONTS.Regular,
    color: Constants.customgrey3,
    marginBottom: 10,
    marginLeft: 2,
  },
  sectionCard: {
    backgroundColor: Constants.white,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginLeft: 54,
  },

  /* menu item */
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  menuIcon: {width: 30, alignItems: 'center', marginRight: 12},
  menuTitle: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.Regular,
    color: Constants.black,
  },

  /* modals */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: Constants.white,
    borderRadius: 16,
    padding: 20,
    width: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 17,
    fontFamily: FONTS.SemiBold,
    color: Constants.black,
  },
  closeBtn: {padding: 4},
  modalSubtitle: {
    fontSize: 14,
    fontFamily: FONTS.Regular,
    color: Constants.customgrey3,
    marginBottom: 4,
    textAlign: 'center',
  },
  radioRow: {flexDirection: 'row', justifyContent: 'center', marginTop: 8, gap: 8},
  radioOption: {flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'center'},
  radioLabel: {fontSize: 15, fontFamily: FONTS.Medium, color: Constants.black},
  radioLabelActive: {color: Constants.dark_green},
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  modalCancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: Constants.customgrey3,
    borderRadius: 30,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 14,
    fontFamily: FONTS.SemiBold,
    color: Constants.black,
  },
  modalConfirmBtn: {
    flex: 1,
    backgroundColor: Constants.dark_green,
    borderRadius: 30,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: 14,
    fontFamily: FONTS.SemiBold,
    color: Constants.white,
  },
  modalDeleteBtn: {
    flex: 1,
    backgroundColor: '#ef4444',
    borderRadius: 30,
    paddingVertical: 12,
    alignItems: 'center',
  },

  /* delete modal text */
  warningTitle: {
    fontSize: 14,
    fontFamily: FONTS.SemiBold,
    color: '#ef4444',
    marginBottom: 12,
    textAlign: 'center',
  },
  warningItem: {
    fontSize: 13,
    fontFamily: FONTS.Regular,
    color: Constants.black,
    marginBottom: 6,
    lineHeight: 18,
  },
  warningQuestion: {
    fontSize: 14,
    fontFamily: FONTS.Medium,
    color: Constants.black,
    marginTop: 10,
    textAlign: 'center',
  },
});
