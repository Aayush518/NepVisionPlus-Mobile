import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { BlurView } from "expo-blur";
import styles from '../../styles/components/processingOverlay.styles';

const ProcessingOverlay = ({ isVisible, progress }) => {
  if (!isVisible) return null;
  
  return (
    <View style={styles.container}>
      <BlurView intensity={20} tint="dark" style={styles.overlay}>
        <View style={styles.content}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.text}>
            Processing Video ({progress}%)
          </Text>
        </View>
      </BlurView>
    </View>
  );
};

export default ProcessingOverlay; 