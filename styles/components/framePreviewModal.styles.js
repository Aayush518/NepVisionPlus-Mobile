import { StyleSheet } from 'react-native';
import { colors } from '../theme';

export default StyleSheet.create({
  modalRoot: {
    flex: 1,
    backgroundColor: 'rgba(4, 11, 33, 0.95)',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: colors.backgroundLight,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalHeaderText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 8,
  },
  modalImageContainer: {
    width: '100%',
    height: 300,
    backgroundColor: colors.background,
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  modalImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: colors.textSecondary,
    marginTop: 12,
  },
  modalCaptionContainer: {
    padding: 20,
    backgroundColor: colors.backgroundLight,
  },
  modalTimestamp: {
    color: colors.textTertiary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  modalCaption: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 24,
  },
  modalNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: colors.backgroundLight,
  },
  navButton: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(99, 102, 241, 0.3)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.4)',
  },
  navButtonDisabled: {
    opacity: 0.5,
  }
}); 