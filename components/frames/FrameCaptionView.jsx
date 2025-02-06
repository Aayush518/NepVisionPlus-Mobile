import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions,
  Image,
  Modal,
  StatusBar,
  Platform
} from 'react-native';
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { colors } from '../../styles/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const FrameCaptionView = ({ frame, onClose }) => {
  const [isImagePreviewVisible, setIsImagePreviewVisible] = useState(false);

  return (
    <>
      <View style={styles.container}>
        <LinearGradient
          colors={[colors.backgroundAccent, colors.background]}
          style={styles.content}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerText}>विवरण</Text>
            <TouchableOpacity 
              onPress={onClose}
              style={styles.closeButton}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
              <MaterialIcons name="close" size={24} color={colors.textTertiary} />
            </TouchableOpacity>
          </View>

          {/* Image Preview */}
          <TouchableOpacity 
            style={styles.imageContainer}
            onPress={() => setIsImagePreviewVisible(true)}
            activeOpacity={0.9}
          >
            <Image
              source={{ uri: frame.uri }}
              style={styles.image}
              resizeMode="cover"
            />
            <View style={styles.imageOverlay}>
              <MaterialIcons name="fullscreen" size={24} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          {/* Timestamp */}
          <View style={styles.timestampContainer}>
            <MaterialIcons name="access-time" size={20} color={colors.textSecondary} />
            <Text style={styles.timestamp}>{frame.timestamp} सेकेन्ड</Text>
          </View>

          {/* Caption */}
          <View style={styles.captionContainer}>
            <Text style={styles.caption}>{frame.caption}</Text>
          </View>
        </LinearGradient>
      </View>

      {/* Full Screen Image Modal */}
      <Modal
        visible={isImagePreviewVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalBackground}
            activeOpacity={1}
            onPress={() => setIsImagePreviewVisible(false)}
          >
            <Image
              source={{ uri: frame.uri }}
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
            <TouchableOpacity 
              style={styles.closeFullScreenButton}
              onPress={() => setIsImagePreviewVisible(false)}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
              <MaterialIcons name="close" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 16,
    overflow: 'hidden',
    marginVertical: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textTertiary,
  },
  closeButton: {
    padding: 4,
  },
  imageContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 8,
    padding: 8,
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: colors.backgroundAccent,
    padding: 8,
    borderRadius: 8,
  },
  timestamp: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  captionContainer: {
    backgroundColor: colors.backgroundLight,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  caption: {
    fontSize: 16,
    color: colors.textTertiary,
    lineHeight: 24,
    letterSpacing: 0.3,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  closeFullScreenButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
});

export default FrameCaptionView; 