import { Animated, Easing, StyleSheet, View } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'

const Scheliton = ({ type = 'shop' }) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const [cardW, setCardW] = useState(0);
  const [bandW, setBandW] = useState(0);

  const start = useCallback(() => {
    if (!cardW || !bandW) return;
    translateX.setValue(-bandW);
    Animated.loop(
      Animated.timing(translateX, {
        toValue: cardW,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, [cardW, bandW, translateX]);

  useEffect(() => {
    start();
  }, [start]);

  const onLayout = e => {
    const w = e.nativeEvent.layout.width;
    setCardW(w);
    setBandW(Math.max(60, Math.round(w * 0.85)));
  };

  if (type === 'category') {
    return (
      <View style={styles.categoryWrap} onLayout={onLayout}>
        <View style={styles.categoryImage} />
        <View style={styles.categoryText} />
        <Animated.View
          pointerEvents="none"
          style={[styles.shimmer, { width: bandW, transform: [{ translateX }] }]}
        />
      </View>
    );
  }

  // default: 'shop' — full store card skeleton
  return (
    <View style={styles.shopCard} onLayout={onLayout}>
      <View style={styles.shopImageArea} />
      <View style={styles.shopBody}>
        <View style={styles.shopRow}>
          <View style={styles.shopName} />
          <View style={styles.shopBadge} />
        </View>
        <View style={styles.shopLine} />
        <View style={[styles.shopLine, { width: '55%', marginTop: 6 }]} />
      </View>
      <Animated.View
        pointerEvents="none"
        style={[styles.shimmer, { width: bandW, transform: [{ translateX }] }]}
      />
    </View>
  );
};

export default Scheliton;

const styles = StyleSheet.create({
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },

  // ── Shop card skeleton ──
  shopCard: {
    backgroundColor: '#efefef',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  shopImageArea: {
    height: 180,
    backgroundColor: '#e0e0e0',
  },
  shopBody: {
    padding: 14,
  },
  shopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  shopName: {
    height: 16,
    width: '55%',
    backgroundColor: '#d0d0d0',
    borderRadius: 4,
  },
  shopBadge: {
    height: 24,
    width: 50,
    backgroundColor: '#d0d0d0',
    borderRadius: 6,
  },
  shopLine: {
    height: 12,
    width: '80%',
    backgroundColor: '#d0d0d0',
    borderRadius: 4,
  },

  // ── Category grid skeleton ──
  categoryWrap: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 6,
    overflow: 'hidden',
  },
  categoryImage: {
    height: 80,
    width: 80,
    borderRadius: 11,
    backgroundColor: '#e0e0e0',
  },
  categoryText: {
    height: 10,
    width: 55,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
    marginTop: 8,
  },
});
