import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from "expo-linear-gradient";

const NepaliBorder = ({ children, style }) => (
  <View style={[{
    padding: 2,
    borderRadius: 16,
    overflow: 'hidden',
  }, style]}>
    <LinearGradient
      colors={['#DC2626', '#F59E0B']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    />
    <View style={{
      backgroundColor: '#0F1729',
      borderRadius: 14,
      overflow: 'hidden',
    }}>
      {children}
    </View>
  </View>
);

export default NepaliBorder; 