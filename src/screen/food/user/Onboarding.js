import {
  Animated,
  Dimensions,
  ImageBackground,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import Constants, {FONTS} from '../../../Assets/Helpers/constant';
import {RightArrow, RightArrow2} from '../../../../Theme';
import {navigate} from '../../../../navigationRef';
import {AnimatedCircularProgress} from 'react-native-circular-progress';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

const {width} = Dimensions.get('window');
// const BOX_WIDTH = width * 0.6;

const DATA = [
  {
    title: 'We serve incomparable delicacies',
    desc: 'All the best restaurants with their top menu waiting for you, they can’t wait for your order!!',
  },
  {
    title: 'Fast delivery at your doorstep',
    desc: 'We ensure fast delivery from the best local restaurants near you.',
  },
  {
    title: 'Easy payment options',
    desc: 'Multiple secure and fast payment methods to choose from.',
  },
];

const Onboarding = () => {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  //   const translateX = useRef(new Animated.Value(BOX_WIDTH)).current;
  const BOX_WIDTH = width * 0.80 - 40;
  const translateX = useRef(new Animated.Value(0)).current;

  const handleNext = async() => {
    if (index === DATA.length - 1) {
      await AsyncStorage.setItem('foodflow','true');
      navigate('Foodtab');
      return;
    }
    const nextIndex = index + 1;

    Animated.timing(translateX, {
      toValue: -nextIndex * BOX_WIDTH,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setIndex(nextIndex);
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../../Assets/Images/bgimg.png')}
        style={styles.bgimg}
        resizeMode="cover">
        <View style={styles.box}>
          <View style={{width: '100%', overflow: 'hidden'}}>
            <Animated.View style={[styles.slider, {transform: [{translateX}]}]}>
              {DATA.map((item, i) => (
                <View key={i} style={{width: BOX_WIDTH}}>
                  <Text style={styles.txt1}>{t(item.title)}</Text>
                  <Text style={styles.txt2}>{t(item.desc)}</Text>
                </View>
              ))}
            </Animated.View>
          </View>

          {/* Progress dots */}
          <View style={styles.dots}>
            {DATA.map((_, i) => {
              const isActive = i === index;
              return (
                <Animated.View
                  key={i}
                  style={[
                    styles.dot,
                    isActive && styles.activeDot,
                    {
                      transform: [{scale: isActive ? 1.4 : 1}],
                      opacity: isActive ? 1 : 0.5,
                    },
                  ]}
                />
              );
            })}
          </View>
          <AnimatedCircularProgress
            size={80}
            width={3}
            fill={((index + 1) / DATA.length) * 100}
            tintColor="#fff"
            backgroundColor="rgba(255,255,255,0.2)"
            rotation={0}
            style={styles.progressWrapper}>
              {() => (
            <TouchableOpacity style={styles.arrowButton} onPress={handleNext}>
              <RightArrow2 height={20} width={20} />
            </TouchableOpacity>
              )}
          </AnimatedCircularProgress>
        </View>
      </ImageBackground>
    </View>
  );
};

export default Onboarding;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.white,
  },
  bgimg: {
    flex: 1,
  },
  box: {
    backgroundColor: Constants.dark_green,
    width: '80%',
    borderRadius: 25,
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    padding: 20,
    minHeight: 320,
  },
  txt1: {
    fontSize: 18,
    color: Constants.white,
    fontFamily: FONTS.SemiBold,
    textAlign: 'center',
    marginBottom: 20,
  },
  txt2: {
    fontSize: 14,
    color: Constants.white,
    fontFamily: FONTS.Medium,
    textAlign: 'center',
  },
  dots: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    marginTop: 20,
  },
  dot: {
    height: 8,
    width: 8,
    backgroundColor: 'gray',
    borderRadius: 4,
    marginHorizontal: 7,
  },
  activeDot: {
    width: 15,
    height:6,
    backgroundColor: 'white',
    alignSelf:'center'
  },
    arrowButton: {
      width: 50,
      height: 50,
      borderRadius: 30,
      backgroundColor: 'white',
      justifyContent: 'center',
      alignItems: 'center',    
  },
  slider: {
    flexDirection: 'row',
  },
  progressWrapper: {
    alignSelf: 'center',
    justifyContent:'center',
    marginTop: 20,
  },
});
