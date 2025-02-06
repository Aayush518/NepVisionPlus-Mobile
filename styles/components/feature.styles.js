import { StyleSheet, Dimensions } from 'react-native';
import { colors, patterns } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default StyleSheet.create({
  featureCard: {
    flex: 1,
    margin: 8,
    borderRadius: patterns.borderRadius,
    overflow: 'hidden',
    borderWidth: patterns.borderWidth,
    borderColor: colors.border,
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: patterns.shadowOpacity,
    shadowRadius: patterns.shadowRadius,
    backgroundColor: colors.backgroundAccent,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  featureContent: {
    padding: 20,
    alignItems: 'center',
  },
  featureIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 16,
    padding: 2,
    backgroundColor: colors.backgroundLight,
    borderWidth: patterns.borderWidth,
    borderColor: colors.borderLight,
  },
  iconGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 33,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textTertiary,
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: colors.primary,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  featureDescription: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
}); 