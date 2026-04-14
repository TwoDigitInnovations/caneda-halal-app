import {
  Animated,
  Dimensions,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTranslation} from 'react-i18next';
import Constants, { FONTS } from '../../../Assets/Helpers/constant';
import { navigate } from '../../../../navigationRef';

const {width, height} = Dimensions.get('window');

const DATA = [
  {
    image: require('../../../Assets/Images/onboarding1.png'),
    title: 'Find Food You Love',
    desc: 'Indulge in the exquisite flavors of our culinary masterpiece – a symphony of succulent grilled chicken, nestled on a bed of perfectly seasoned quinoa and adorned with a medley of vibrant, roasted vegetables.',
  },
  {
    image: require('../../../Assets/Images/onboarding2.png'),
    title: 'Fast Delivery',
    desc: 'The dish is artfully drizzled with a velvety balsamic glaze. Each bite is a journey through a culinary wonderland, where freshness meets finesse.',
  },
  {
    image: require('../../../Assets/Images/onboarding3.png'),
    title: 'Easy Payment',
    desc: 'Multiple secure and fast payment methods to choose from. Pay seamlessly and enjoy your meal without any hassle.',
  },
];


const Onboarding = () => {
  const {t} = useTranslation();
  const [index, setIndex] = useState(0);

  // Strip slides horizontally
  const imageSlide  = useRef(new Animated.Value(0)).current;
  // Text fade + slide-up
  const textFade    = useRef(new Animated.Value(1)).current;
  const textTranslY = useRef(new Animated.Value(0)).current;
  // Arrow pulse
  const arrowScale  = useRef(new Animated.Value(1)).current;
  // Dot width animations
  const dotWidths   = useRef(DATA.map(() => new Animated.Value(8))).current;

  // Animate dots when index changes
  useEffect(() => {
    DATA.forEach((_, i) => {
      Animated.spring(dotWidths[i], {
        toValue: 10,
        useNativeDriver: false,
        tension: 60,
        friction: 7,
      }).start();
    });
  }, [index]);

  const animateToNext = nextIndex => {
    // 1. Fade text out
    Animated.parallel([
      Animated.timing(textFade,    {toValue: 0,  duration: 150, useNativeDriver: true}),
      Animated.timing(textTranslY, {toValue: 10, duration: 150, useNativeDriver: true}),
    ]).start(() => {
      // 2. Slide image strip
      Animated.spring(imageSlide, {
        toValue: -nextIndex * width,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();

      setIndex(nextIndex);

      // 3. Fade text back in from above
      textTranslY.setValue(-12);
      Animated.parallel([
        Animated.timing(textFade,    {toValue: 1, duration: 250, useNativeDriver: true}),
        Animated.timing(textTranslY, {toValue: 0, duration: 250, useNativeDriver: true}),
      ]).start();
    });
  };

  const handleNext = async () => {
    Animated.sequence([
      Animated.timing(arrowScale, {toValue: 0.88, duration: 80,  useNativeDriver: true}),
      Animated.spring(arrowScale,  {toValue: 1,    useNativeDriver: true, tension: 200}),
    ]).start();

    if (index === DATA.length - 1) {
      await AsyncStorage.setItem('foodflow', 'true');
      navigate('Foodtab');
      return;
    }
    animateToNext(index + 1);
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('foodflow', 'true');
    navigate('Foodtab');
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../../Assets/Images/onboardingBg.png')}
        style={styles.bgImage}>

        {/* ── IMAGE STRIP: all slides side-by-side, clipped to screen width ── */}
        <View style={styles.imageArea}>
          <Animated.View
            style={[
              styles.imageStrip,
              {transform: [{translateX: imageSlide}]},
            ]}>
            {DATA.map((item, i) => (
              <View key={i} style={styles.imageSlide}>
                <Image
                  source={item.image}
                  style={styles.illustration}
                  resizeMode="contain"
                />
              </View>
            ))}
          </Animated.View>
        </View>

        {/* ── BOTTOM Constants.white CARD ── */}
        <View style={styles.card}>
          <Animated.View
            style={{
              opacity:   textFade,
              transform: [{translateY: textTranslY}],
              alignItems: 'center',
            }}>
            <Text style={styles.title}>{t(DATA[index].title)}</Text>
            <Text style={styles.desc}>{t(DATA[index].desc)}</Text>
          </Animated.View>

          {/* Dots */}
          <View style={styles.dotsRow}>
            {DATA.map((_, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.dot,
                  {
                    width:           dotWidths[i],
                    backgroundColor: i === index ? Constants.dark_green : '#C0C0C0',
                  },
                ]}
              />
            ))}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity onPress={handleSkip} >
              <Text style={styles.skipTxt}>{t('Skip')}</Text>
            </TouchableOpacity>

            <Animated.View style={{transform: [{scale: arrowScale}]}}>
              <TouchableOpacity
                style={styles.arrowBtn}
                onPress={handleNext}
                activeOpacity={0.85}>
                <View style={styles.chevron} />
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>

      </ImageBackground>
    </View>
  );
};

export default Onboarding;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bgImage: {
    flex: 1,
    marginTop:-50,
  },

  /* Image area – clips overflow so only one slide is visible */
  imageArea: {
    flex: 1,
    // overflow: 'hidden',
  },
  imageStrip: {
    flexDirection: 'row',
    flex: 1,
    width: width * DATA.length,
    // marginTop:'35%',
  },
  imageSlide: {
    width,
    flex: 1,
    // justifyContent: 'center',
    marginTop:'5%',
    alignItems: 'center',
  },
  illustration: {
    width:  width * 0.96,
    height: height * 0.68,
  },

  card: {
    backgroundColor:      Constants.white,
    paddingHorizontal:    28,
    paddingTop:           20,
    paddingBottom:        0,
    // minHeight:            height * 0.42,
    position:             'absolute',
    bottom:               0,
  },
  title: {
    fontSize:      26,
    fontFamily:   FONTS.Bold,
    color:         Constants.normal_green,
    textAlign:     'center',
    marginBottom:  14,
    letterSpacing: 0.2,
  },
  desc: {
    fontSize:          14,
    lineHeight:        22,
    color:             Constants.customgrey,
    textAlign:         'center',
    paddingHorizontal: 8,
  },

  /* Dots */
  dotsRow: {
    flexDirection:  'row',
    justifyContent: 'center',
    alignItems:     'center',
    marginTop:      24,
    gap:            6,
  },
  dot: {
    height:       10,
    borderRadius: 6,
  },

  /* Footer */
  footer: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginTop:      28,
    paddingBottom:  24,
  },
  skipTxt: {
    fontSize:   16,
    color:      Constants.customgrey,
    fontFamily: FONTS.Regular,
  },
  arrowBtn: {
    width:           54,
    height:          54,
    borderRadius:    17,
    backgroundColor: Constants.white,
    justifyContent:  'center',
    alignItems:      'center',
    boxShadow:      '0px 3px 10px 0px #2C614080',
  },
  chevron: {
    width:            11,
    height:           11,
    borderTopWidth:   2.5,
    borderRightWidth: 2.5,
    borderColor:      Constants.dark_green,
    transform:        [{rotate: '45deg'}],
    marginLeft:       -3,
  },
});
