import { Dimensions, Platform } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const colors = {
  // Primary colors
  primary: '#4F46E5',
  primaryLight: '#818CF8',
  primaryDark: '#3730A3',
  
  // Accent colors
  accent: '#F59E0B',
  accentLight: '#FCD34D',
  accentDark: '#D97706',
  
  // Background colors
  background: '#0F172A',
  backgroundLight: '#1E293B',
  backgroundAccent: '#1E1B4B',
  backgroundElevated: '#334155',
  
  // Text colors
  text: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textTertiary: '#E2E8F0',
  textMuted: '#94A3B8',
  
  // Border colors
  border: '#334155',
  borderLight: '#475569',
  borderAccent: '#6366F1',
  
  // Status colors
  success: '#22C55E',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
};

export const gradients = {
  primary: [colors.primary, colors.primaryDark],
  accent: [colors.accent, colors.accentDark],
  background: [colors.backgroundAccent, colors.background],
  card: ['rgba(30, 41, 59, 0.8)', 'rgba(15, 23, 42, 0.8)'],
  overlay: ['transparent', 'rgba(0, 0, 0, 0.8)'],
  glass: ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)'],
};

export const patterns = {
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  shadows: {
    sm: {
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 3,
    },
    md: {
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 5,
    },
    lg: {
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 8,
    },
  },
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
    h2: {
      fontSize: 24,
      fontWeight: '600',
      letterSpacing: 0.3,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600',
      letterSpacing: 0.2,
    },
    body: {
      fontSize: 16,
      lineHeight: 24,
      letterSpacing: 0.3,
    },
    caption: {
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: 0.2,
    },
  },
  animation: {
    spring: {
      damping: 15,
      stiffness: 100,
    },
    timing: {
      duration: 300,
    },
  },
  glassmorphism: {
    light: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderColor: 'rgba(255, 255, 255, 0.2)',
      blur: Platform.OS === 'ios' ? 20 : 2,
    },
    dark: {
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      blur: Platform.OS === 'ios' ? 30 : 3,
    },
  },
  layout: {
    maxWidth: Math.min(SCREEN_WIDTH * 0.9, 400),
    containerPadding: 16,
    sectionSpacing: 24,
    cardSpacing: 16,
  },
};

export const getNeumorphicStyle = (color = colors.backgroundLight, intensity = 0.15) => ({
  backgroundColor: color,
  shadowColor: colors.primary,
  shadowOffset: { width: -4, height: -4 },
  shadowOpacity: intensity,
  shadowRadius: 8,
  elevation: 8,
});

export const getGlassStyle = (isDark = true) => ({
  ...patterns.glassmorphism[isDark ? 'dark' : 'light'],
  borderWidth: 1,
  borderRadius: patterns.borderRadius.lg,
  overflow: 'hidden',
}); 