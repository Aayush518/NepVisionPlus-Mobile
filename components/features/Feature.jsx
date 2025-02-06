import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, Platform } from 'react-native';
import { MaterialIcons } from "@expo/vector-icons";
import { MotiView, AnimatePresence } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Easing } from 'react-native-reanimated';

// Fallback values in case theme is not loaded
const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const COLORS = {
  primary: '#4F46E5',
  primaryLight: '#818CF8',
  primaryDark: '#3730A3',
  accent: '#F59E0B',
  text: '#F8FAFC',
  textSecondary: '#CBD5E1',
  backgroundLight: '#1E293B',
  borderLight: '#475569',
};

const Feature = ({ icon, title, description, index = 0 }) => {
  const renderIconBackground = useCallback(() => (
    <MotiView
      from={{ rotate: '0deg' }}
      animate={{ rotate: '360deg' }}
      transition={{
        type: 'timing',
        duration: 20000,
        loop: true,
        easing: Easing.linear,
      }}
      style={styles.iconBackground}
    >
      <LinearGradient
        colors={[`${COLORS.primary}20`, 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.iconBackgroundGradient}
      />
    </MotiView>
  ), []);

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20, scale: 0.9 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{
        type: 'spring',
        damping: 15,
        stiffness: 100,
        delay: index * 100,
      }}
      style={styles.container}
    >
      <Pressable
        style={({ pressed }) => [
          styles.pressable,
          pressed && styles.pressed
        ]}
      >
        <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        
        {/* Animated Icon Background */}
        {renderIconBackground()}
        
        {/* Icon Container */}
        <View style={styles.iconContainer}>
          <MotiView
            from={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: 'spring',
              damping: 10,
              delay: (index * 100) + 200,
            }}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark]}
              style={styles.iconGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <MaterialIcons name={icon} size={24} color={COLORS.text} />
            </LinearGradient>
          </MotiView>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <MotiView
            from={{ opacity: 0, translateX: -10 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ delay: (index * 100) + 300 }}
          >
            <Text style={styles.title}>{title}</Text>
          </MotiView>
          <MotiView
            from={{ opacity: 0, translateX: -10 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ delay: (index * 100) + 400 }}
          >
            <Text style={styles.description}>{description}</Text>
          </MotiView>
        </View>

        {/* Decorative Elements */}
        <View style={[styles.decorativeDot, styles.topRight]} />
        <View style={[styles.decorativeDot, styles.bottomLeft]} />
        <LinearGradient
          colors={['transparent', `${COLORS.primaryLight}20`]}
          style={styles.shine}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Pressable>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: SPACING.sm,
    flex: 1,
    minWidth: 160,
    maxWidth: 200,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  pressable: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: `${COLORS.borderLight}40`,
    backgroundColor: `${COLORS.backgroundLight}80`,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.5,
  },
  iconBackground: {
    position: 'absolute',
    top: -50,
    left: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    overflow: 'hidden',
  },
  iconBackgroundGradient: {
    width: '100%',
    height: '100%',
  },
  iconContainer: {
    margin: SPACING.md,
    alignSelf: 'flex-start',
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  iconGradient: {
    padding: SPACING.md,
    borderRadius: 12,
  },
  content: {
    padding: SPACING.md,
    paddingTop: 0,
  },
  title: {
    fontSize: 20,
    fontWeight: Platform.OS === 'ios' ? '600' : '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
    letterSpacing: 0.2,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textSecondary,
    letterSpacing: 0.2,
  },
  decorativeDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: `${COLORS.primaryLight}40`,
  },
  topRight: {
    top: SPACING.sm,
    right: SPACING.sm,
  },
  bottomLeft: {
    bottom: SPACING.sm,
    left: SPACING.sm,
  },
  shine: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: 200,
    height: 200,
    transform: [{ rotate: '45deg' }],
    opacity: 0.1,
  },
});

export default React.memo(Feature); 