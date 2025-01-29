import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import styles from '../styles/styles';

const HeaderSection = () => (
  <View style={styles.header}>
    <LinearGradient
      colors={['rgba(99, 102, 241, 0.15)', 'transparent']}
      style={styles.headerGlow}
    />
    <Text style={styles.headerTitle}>NepVision+</Text>
    <Text style={styles.headerSubtitle}>Video Caption Generator</Text>
  </View>
);

export default HeaderSection;