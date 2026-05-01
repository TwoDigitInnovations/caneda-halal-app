import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  Image,
  Pressable,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Svg, Path, Circle} from 'react-native-svg';
import Constants, {FONTS} from '../../Assets/Helpers/constant';
import {ApiFormData, GetApi, Post} from '../../Assets/Helpers/Service';
import {ToastContext, UserContext} from '../../../App';
import {goBack} from '../../../navigationRef';
import CameraGalleryPeacker from '../../Assets/Component/CameraGalleryPeacker';
import {checkEmail} from '../../Assets/Helpers/InputsNullChecker';
import {createRef} from 'react';

const ROLE = 'FLIGHTUSER';

/* ── avatar placeholder ── */
const AvatarPlaceholder = () => (
  <Svg width="90" height="90" viewBox="0 0 80 80">
    <Circle cx="40" cy="40" r="40" fill="#d0d0d0" />
    <Circle cx="40" cy="30" r="14" fill="#9ca3af" />
    <Path d="M14 72c0-14.4 11.7-26 26-26s26 11.6 26 26" fill="#9ca3af" />
  </Svg>
);

/* ── edit pencil icon ── */
const EditPencil = () => (
  <Svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <Path
      d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
      stroke={Constants.white} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path
      d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
      stroke={Constants.white} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

/* ── field row ── */
const Field = ({label, children, error}) => (
  <View style={s.fieldWrap}>
    <Text style={s.fieldLabel}>{label}</Text>
    {children}
    {error ? <Text style={s.errorText}>{error}</Text> : null}
  </View>
);

/* ════════════ screen ════════════ */
const FlightPersonalData = () => {
  const [, setToast] = useContext(ToastContext);
  const [user] = useContext(UserContext);

  const [profile, setProfile] = useState({username: '', phone: '', email: '', image: ''});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [edit, setEdit] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const cameraRef = createRef();

  useEffect(() => {
    GetApi(`getProfile/${ROLE}`).then(
      res => {
        setLoading(false);
        setProfile({
          ...res?.data,
          phone: res?.data?.phone ?? user?.phone ?? '',
          username: res?.data?.username ?? user?.username ?? '',
          email: res?.data?.email ?? user?.email ?? '',
        });
      },
      () => setLoading(false),
    );
  }, []);

  const getImageValue = img => {
    ApiFormData(img.assets[0]).then(res => {
      if (res?.status) {
        setProfile(prev => ({...prev, image: res.data.file}));
      }
    });
  };

  const handleSave = () => {
    setSubmitted(true);
    if (!profile.username?.trim() || !profile.phone?.trim()) {return;}
    if (profile.email?.trim() && !checkEmail(profile.email.trim())) {
      setToast('Invalid email address');
      return;
    }
    setSaving(true);
    Post(`updateProfile/${ROLE}`, profile).then(
      res => {
        setSaving(false);
        if (res?.status) {
          setToast('Profile updated successfully');
          setEdit(false);
          setSubmitted(false);
        } else {
          setToast(res?.message || 'Update failed');
        }
      },
      () => {
        setSaving(false);
        setToast('Something went wrong. Please try again.');
      },
    );
  };

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <StatusBar backgroundColor={Constants.dark_green} barStyle="light-content" />

      {/* header */}
      <View style={s.header}>
        <TouchableOpacity onPress={goBack} activeOpacity={0.7} style={s.backBtn}>
          <Text style={s.backArrow}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Personal Data</Text>
      </View>

      {loading ? (
        <View style={s.loadingWrap}>
          <ActivityIndicator size="large" color={Constants.dark_green} />
        </View>
      ) : (
        <KeyboardAvoidingView
          style={{flex: 1}}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={s.scroll}
            keyboardShouldPersistTaps="handled">

            {/* avatar */}
            <View style={s.avatarSection}>
              <View style={s.avatarWrap}>
                {profile.image ? (
                  <Image source={{uri: profile.image}} style={s.avatarImage} />
                ) : (
                  <AvatarPlaceholder />
                )}
                {edit && (
                  <Pressable style={s.editBadge} onPress={() => cameraRef.current?.show()}>
                    <EditPencil />
                  </Pressable>
                )}
              </View>
              <Text style={s.avatarName}>{profile.username || 'Your Name'}</Text>
              {profile.email ? <Text style={s.avatarEmail}>{profile.email}</Text> : null}
            </View>

            {/* form */}
            <View style={s.formCard}>
              <Field
                label="Full Name"
                error={submitted && !profile.username?.trim() ? 'Name is required' : null}>
                <TextInput
                  style={[s.input, !edit && s.inputDisabled]}
                  value={profile.username}
                  onChangeText={v => setProfile(p => ({...p, username: v}))}
                  placeholder="Enter your name"
                  placeholderTextColor={Constants.customgrey3}
                  editable={edit}
                  autoCapitalize="words"
                />
              </Field>

              <Field
                label="Phone"
                error={submitted && !profile.phone?.trim() ? 'Phone is required' : null}>
                <TextInput
                  style={[s.input, !edit && s.inputDisabled]}
                  value={profile.phone}
                  onChangeText={v => setProfile(p => ({...p, phone: v}))}
                  placeholder="Enter phone number"
                  placeholderTextColor={Constants.customgrey3}
                  keyboardType="phone-pad"
                  editable={edit}
                />
              </Field>

              <Field label="Email">
                <TextInput
                  style={[s.input, !edit && s.inputDisabled]}
                  value={profile.email}
                  onChangeText={v => setProfile(p => ({...p, email: v}))}
                  placeholder="Enter email address"
                  placeholderTextColor={Constants.customgrey3}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={edit}
                />
              </Field>
            </View>

            {/* action button */}
            {edit ? (
              <View style={s.btnRow}>
                <TouchableOpacity
                  style={s.cancelBtn}
                  activeOpacity={0.8}
                  onPress={() => {setEdit(false); setSubmitted(false);}}>
                  <Text style={s.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.saveBtn, saving && s.saveBtnDisabled]}
                  activeOpacity={0.8}
                  onPress={handleSave}
                  disabled={saving}>
                  {saving ? (
                    <ActivityIndicator color={Constants.white} />
                  ) : (
                    <Text style={s.saveBtnText}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={s.editBtn} activeOpacity={0.8} onPress={() => setEdit(true)}>
                <Text style={s.editBtnText}>Edit Profile</Text>
              </TouchableOpacity>
            )}

            <View style={s.bottomSpacer} />
          </ScrollView>
        </KeyboardAvoidingView>
      )}

      <CameraGalleryPeacker
        refs={cameraRef}
        getImageValue={getImageValue}
        base64={false}
        cancel={() => {}}
      />
    </SafeAreaView>
  );
};

export default FlightPersonalData;

/* ════════════ styles ════════════ */
const s = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f5f5f5'},

  header: {
    backgroundColor: Constants.dark_green,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 20,
    gap: 10,
  },
  backBtn: {padding: 4},
  backArrow: {fontSize: 22, color: Constants.white, fontFamily: FONTS.Bold, lineHeight: 26},
  headerTitle: {fontSize: 20, fontFamily: FONTS.Bold, color: Constants.white},

  loadingWrap: {flex: 1, justifyContent: 'center', alignItems: 'center'},

  scroll: {paddingHorizontal: 16, paddingTop: 20, gap: 16},
  bottomSpacer: {height: 40},

  /* avatar */
  avatarSection: {alignItems: 'center', marginBottom: 4},
  avatarWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    overflow: 'hidden',
    marginBottom: 12,
    position: 'relative',
  },
  avatarImage: {width: 96, height: 96, borderRadius: 48},
  editBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Constants.dark_green,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarName: {fontSize: 18, fontFamily: FONTS.SemiBold, color: Constants.black, marginBottom: 2},
  avatarEmail: {fontSize: 13, fontFamily: FONTS.Regular, color: Constants.customgrey3},

  /* form card */
  formCard: {
    backgroundColor: Constants.white,
    borderRadius: 14,
    padding: 16,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  fieldWrap: {paddingVertical: 8},
  fieldLabel: {
    fontSize: 12,
    fontFamily: FONTS.Medium,
    color: Constants.customgrey3,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    fontSize: 14,
    fontFamily: FONTS.Regular,
    color: Constants.black,
    backgroundColor: '#fafafa',
  },
  inputDisabled: {
    backgroundColor: '#f5f5f5',
    color: Constants.customgrey3,
  },
  errorText: {fontSize: 11, fontFamily: FONTS.Regular, color: '#e53935', marginTop: 4},

  /* buttons */
  btnRow: {flexDirection: 'row', gap: 10},
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: Constants.customgrey3,
    borderRadius: 30,
    paddingVertical: 13,
    alignItems: 'center',
  },
  cancelBtnText: {fontSize: 14, fontFamily: FONTS.SemiBold, color: Constants.black},
  saveBtn: {
    flex: 1,
    backgroundColor: Constants.dark_green,
    borderRadius: 30,
    paddingVertical: 13,
    alignItems: 'center',
  },
  saveBtnDisabled: {opacity: 0.6},
  saveBtnText: {fontSize: 14, fontFamily: FONTS.SemiBold, color: Constants.white},
  editBtn: {
    backgroundColor: Constants.dark_green,
    borderRadius: 30,
    paddingVertical: 13,
    alignItems: 'center',
  },
  editBtnText: {fontSize: 15, fontFamily: FONTS.SemiBold, color: Constants.white},
});
