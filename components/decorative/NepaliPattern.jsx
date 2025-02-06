import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from "expo-linear-gradient";

const NepaliPattern = ({ style }) => (
  <View style={[{
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
  }, style]}>
    {/* Mandala-inspired patterns */}
    {[...Array(8)].map((_, i) => (
      <View
        key={i}
        style={{
          position: 'absolute',
          width: 100,
          height: 100,
          transform: [{ rotate: `${i * 45}deg` }],
        }}
      >
        <LinearGradient
          colors={['#DC2626', '#F59E0B']}
          style={{
            flex: 1,
            opacity: 0.3,
          }}
        />
      </View>
    ))}
  </View>
);

export default NepaliPattern; 