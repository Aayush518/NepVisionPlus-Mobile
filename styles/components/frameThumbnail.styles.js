import { StyleSheet } from 'react-native';
import { colors } from '../theme';

export default StyleSheet.create({
  frameItem: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  frameThumbnail: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 12,
  },
  frameOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(99, 102, 241, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  frameTimestamp: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  }
}); 