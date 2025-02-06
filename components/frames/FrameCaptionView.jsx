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
  Platform,
  Animated
} from 'react-native';
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MotiView } from 'moti';
import { colors } from '../../styles/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const FrameCaptionView = ({ frame, onClose }) => {
  const [isImagePreviewVisible, setIsImagePreviewVisible] = useState(false);

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 300 }}
      style={styles.container}
    >
      <LinearGradient
        colors={[colors.backgroundAccent, colors.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.content}
      >
        {/* Header with decorative elements */}
        <View style={styles.headerContainer}>
          <LinearGradient
            colors={['rgba(99, 102, 241, 0.1)', 'rgba(79, 70, 229, 0.1)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.headerGradient}
          />
          <View style={styles.header}>
            <View style={styles.headerTitleContainer}>
              <MaterialIcons name="description" size={24} color={colors.primary} />
              <Text style={styles.headerText}>विवरण</Text>
            </View>
            <TouchableOpacity 
              onPress={onClose}
              style={styles.closeButton}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
              <MaterialIcons name="close" size={24} color={colors.textTertiary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Image Preview with enhanced container */}
        <TouchableOpacity 
          style={styles.imageContainer}
          onPress={() => setIsImagePreviewVisible(true)}
          activeOpacity={0.95}
        >
          <Image
            source={{ uri: frame.uri }}
            style={styles.image}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.3)']}
            style={styles.imageGradient}
          />
          <View style={styles.imageOverlay}>
            <MaterialIcons name="fullscreen" size={24} color="#FFFFFF" />
            <Text style={styles.expandText}>Expand</Text>
          </View>
        </TouchableOpacity>

        {/* Enhanced Timestamp */}
        <View style={styles.timestampContainer}>
          <LinearGradient
            colors={[colors.primary + '20', colors.primary + '10']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
          <MaterialIcons name="access-time" size={20} color={colors.primary} />
          <Text style={styles.timestamp}>{frame.timestamp} सेकेन्ड</Text>
        </View>

        {/* Enhanced Caption */}
        <View style={styles.captionContainer}>
          <LinearGradient
            colors={[colors.backgroundLight, colors.background]}
            style={StyleSheet.absoluteFill}
          />
          <Text style={styles.caption}>{frame.caption}</Text>
        </View>
      </LinearGradient>

      {/* Full Screen Image Modal with enhanced UI */}
      <Modal
        visible={isImagePreviewVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View style={styles.modalContainer}>
          <BlurView intensity={100} style={StyleSheet.absoluteFill} tint="dark" />
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
            >
              <BlurView intensity={80} style={styles.closeButtonBlur} tint="dark">
                <MaterialIcons name="close" size={28} color="#FFFFFF" />
              </BlurView>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      </Modal>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 20,
    overflow: 'hidden',
    marginVertical: 12,
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: colors.borderLight,
    elevation: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  content: {
    padding: 16,
  },
  headerContainer: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  headerGradient: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textTertiary,
  },
  closeButton: {
    padding: 8,
    backgroundColor: colors.backgroundLight,
    borderRadius: 12,
  },
  imageContainer: {
    height: 220,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    position: 'relative',
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  imageOverlay: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  expandText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary + '30',
    overflow: 'hidden',
  },
  timestamp: {
    marginLeft: 8,
    fontSize: 15,
    color: colors.primary,
    fontWeight: '600',
  },
  captionContainer: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
  },
  caption: {
    fontSize: 16,
    color: colors.textTertiary,
    lineHeight: 26,
    letterSpacing: 0.3,
  },
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
    overflow: 'hidden',
    borderRadius: 20,
  },
  closeButtonBlur: {
    padding: 10,
    borderRadius: 20,
  }
});

export default FrameCaptionView; 