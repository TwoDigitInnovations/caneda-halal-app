import {Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, { createRef, useContext, useEffect, useState } from 'react';
import {BackIcon, DownarrowIcon} from '../../../../Theme';
import Constants, {FONTS} from '../../../Assets/Helpers/constant';
import { goBack } from '../../../../navigationRef';
import LanguageChange from '../../../Assets/Component/LanguageChange';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TranslatorContext } from '../../../../App';

const Language = () => {
  const [selectLanguage, setSelectLanguage] = useState('English');
  const [language, setLanguage] = useContext(TranslatorContext);
      const { t } = useTranslation();
      const langRef = createRef()
              useEffect(() => {
    checkLng();
  }, []);
  const checkLng = async () => {
    const x = await AsyncStorage.getItem('LANG');
    if (x != null) {
      let lng = x == 'en' ? 'English' : x == 'ar' ? 'العربية' :x == 'fr' ? 'Français' : x == 'pt' ? 'Português' : x == 'wo' ? 'Wolof' : x == 'zh' ? '中文 / 汉语' : 'English';
      setSelectLanguage(lng);
      let lng2 = x == 'zh' ? 'zh-CN' : x;
      setLanguage(lng2)
    }
  };
  return (
    <SafeAreaView style={{flex:1}}>
    <View style={styles.container}>
      <View style={styles.topcov}>
        <BackIcon height={30} width={30} color={Constants.black} onPress={() => goBack()}/>
      </View>
      <Text style={styles.edittxt}>{t("Language")}</Text>
                <TouchableOpacity
            style={[styles.box]}
            onPress={() =>langRef.current.show()}>
            <View style={styles.btmboxfirpart}>
              <Text style={[styles.protxt,{color:selectLanguage?Constants.black:Constants.customgrey3}]}>{selectLanguage?selectLanguage:t('Select Language')} </Text>
            </View>
              <DownarrowIcon
                color={Constants.black}
                height={20}
                width={20}
                style={styles.aliself}
              />
          </TouchableOpacity>
          <LanguageChange refs={langRef} selLang={(item)=>{setSelectLanguage(item)}}/>
            </View>
    </SafeAreaView>
  );
};

export default Language;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.white,
    paddingHorizontal: 20,
    paddingVertical:Platform.OS==='ios'?10: 20,
  },
  topcov: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // marginVertical:20
  },
  edittxt: {
    color: Constants.black,
    fontFamily: FONTS.SemiBold,
    fontSize: 20,
    marginVertical: 10,
  },
   box: {
    paddingHorizontal: 15,
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    backgroundColor: Constants.customgrey4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems:'center'
  },
   btmboxfirpart: {
    flexDirection: 'row',
    alignItems: 'center',
     gap: 15
    },
    protxt: {
    color: Constants.black,
    fontSize: 14,
    fontFamily: FONTS.SemiBold,
  },
});
