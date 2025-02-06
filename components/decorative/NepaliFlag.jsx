import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import { MotiView } from 'moti';

const NepaliFlag = ({ size = 100, style }) => (
  <MotiView
    style={[{
      width: size,
      height: size * 1.2,
      position: 'relative',
    }, style]}
    from={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{
      type: 'spring',
      damping: 15,
      stiffness: 100
    }}
  >
    {/* Flag Container */}
    <View style={{
      width: size,
      height: size * 1.2,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Upper Triangle */}
      <View style={{
        position: 'absolute',
        width: size,
        height: size * 0.8,
        backgroundColor: '#DC2626',
        borderWidth: 4,
        borderColor: '#FDE68A',
        borderTopLeftRadius: 4,
        borderTopRightRadius: size * 0.4,
        borderBottomRightRadius: size * 0.4,
      }}>
        <LinearGradient
          colors={['#DC2626', '#991B1B']}
          style={StyleSheet.absoluteFill}
        />
      </View>

      {/* Lower Triangle */}
      <View style={{
        position: 'absolute',
        top: size * 0.4,
        width: size * 0.9,
        height: size * 0.8,
        backgroundColor: '#DC2626',
        borderWidth: 4,
        borderColor: '#FDE68A',
        borderTopLeftRadius: 4,
        borderTopRightRadius: size * 0.4,
        borderBottomRightRadius: size * 0.4,
      }}>
        <LinearGradient
          colors={['#DC2626', '#991B1B']}
          style={StyleSheet.absoluteFill}
        />
      </View>
      
      {/* Sun Symbol */}
      <MotiView
        style={{
          position: 'absolute',
          top: size * 0.15,
          left: size * 0.2,
        }}
        from={{ rotate: '0deg' }}
        animate={{ rotate: '360deg' }}
        transition={{
          type: 'timing',
          duration: 20000,
          loop: true,
        }}
      >
        <MaterialIcons 
          name="wb-sunny" 
          size={size * 0.25} 
          color="#FDE68A" 
          style={{
            shadowColor: '#FDE68A',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.5,
            shadowRadius: 10,
          }}
        />
      </MotiView>
      
      {/* Moon Symbol */}
      <View style={{
        position: 'absolute',
        top: size * 0.65,
        left: size * 0.15,
      }}>
        <MaterialIcons 
          name="nightlight-round" 
          size={size * 0.2} 
          color="#FDE68A"
          style={{
            shadowColor: '#FDE68A',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.5,
            shadowRadius: 10,
          }}
        />
      </View>

      {/* Border Shine Effect */}
      <LinearGradient
        colors={['rgba(253, 230, 138, 0.4)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.5,
        }}
      />
    </View>
  </MotiView>
);

export default NepaliFlag; 