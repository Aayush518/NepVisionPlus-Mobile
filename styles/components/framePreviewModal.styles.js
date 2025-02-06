import { StyleSheet, Dimensions, Platform } from 'react-native';
import { colors } from '../../styles/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Calculate responsive dimensions
const MODAL_WIDTH = Platform.select({
  ios: Math.min(SCREEN_WIDTH * 0.9, 400),
  android: SCREEN_WIDTH * 0.95,
  default: Math.min(SCREEN_WIDTH * 0.9, 400),
});

const MODAL_HEIGHT = Platform.select({
  ios: Math.min(SCREEN_HEIGHT * 0.7, 600),
  android: SCREEN_HEIGHT * 0.7,
  default: Math.min(SCREEN_HEIGHT * 0.7, 600),
});

const IMAGE_HEIGHT = MODAL_HEIGHT * 0.4;

export default StyleSheet.create({
  modalRoot: {
    flex: 1,
    backgroundColor: Platform.OS === 'ios' 
      ? 'rgba(0, 0, 0, 0.75)' 
      : 'rgba(0, 0, 0, 0.85)',
  },
  modalTouchable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: MODAL_WIDTH,
    maxHeight: MODAL_HEIGHT,
    borderRadius: Platform.OS === 'ios' ? 20 : 16,
    overflow: 'hidden',
    backgroundColor: colors.background,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 8,
        borderWidth: 1,
        borderColor: colors.borderLight,
      },
    }),
  },
  modalContent: {
    padding: Platform.OS === 'ios' ? 16 : 12,
    height: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalHeaderText: {
    fontSize: Platform.OS === 'ios' ? 18 : 20,
    fontWeight: '600',
    color: colors.textTertiary,
  },
  closeButton: {
    padding: 8,
  },
  modalImageContainer: {
    height: Platform.OS === 'ios' ? MODAL_HEIGHT * 0.4 : MODAL_HEIGHT * 0.35,
    backgroundColor: colors.backgroundLight,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  modalImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundAccent,
  },
  placeholderText: {
    marginTop: 8,
    color: colors.textSecondary,
    fontSize: 14,
  },
  modalCaptionContainer: {
    padding: 12,
    backgroundColor: colors.backgroundLight,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  modalTimestamp: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  modalCaption: {
    fontSize: Platform.OS === 'ios' ? 16 : 15,
    color: colors.textTertiary,
    lineHeight: 24,
  },
  modalNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 'auto',
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
}); 