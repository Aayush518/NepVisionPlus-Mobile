import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import { LinearGradient } from "expo-linear-gradient";

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const MandalaBackground = () => (
  <MotiView
    style={styles.mandalaContainer}
    from={{ rotate: '0deg' }}
    animate={{ rotate: '360deg' }}
    transition={{
      type: 'timing',
      duration: 50000,
      loop: true,
    }}
  >
    {/* Create circular mandala patterns */}
    {[...Array(12)].map((_, i) => (
      <LinearGradient
        key={i}
        colors={['#DC2626', '#F59E0B']}
        style={[
          styles.mandalaPattern,
          {
            transform: [
              { rotate: `${i * 30}deg` },
              { scale: 1 + (i % 2) * 0.2 }
            ]
          }
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
    ))}
  </MotiView>
);

const styles = StyleSheet.create({
  mandalaContainer: {
    position: 'absolute',
    width: SCREEN_WIDTH * 2,
    height: SCREEN_WIDTH * 2,
    top: -SCREEN_WIDTH / 2,
    left: -SCREEN_WIDTH / 2,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.1,
  },
  mandalaPattern: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.05,
    borderRadius: SCREEN_WIDTH,
  },
});

export default MandalaBackground; 