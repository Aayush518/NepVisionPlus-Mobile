import React from 'react';
import { View, Text } from 'react-native';
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from 'moti';
import styles from '../../styles/components/feature.styles';

const Feature = ({ icon, title, description }) => (
  <MotiView
    from={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ 
      type: 'spring',
      delay: Math.random() * 500,
      damping: 15,
      stiffness: 100
    }}
    style={styles.featureCard}
  >
    <LinearGradient
      colors={['rgba(220, 38, 38, 0.1)', 'rgba(245, 158, 11, 0.1)']}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    />
    <View style={styles.featureContent}>
      <View style={styles.featureIconContainer}>
        <LinearGradient
          colors={['#991B1B', '#DC2626']}
          style={styles.iconGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <MaterialIcons name={icon} size={35} color="#FDE68A" />
        </LinearGradient>
      </View>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  </MotiView>
);

export default Feature; 