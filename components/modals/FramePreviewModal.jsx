import React from 'react';
import { View, Text, Modal, Pressable, Image, Platform, TouchableOpacity } from 'react-native';
import { MaterialIcons } from "@expo/vector-icons";
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import styles from '../../styles/components/framePreviewModal.styles';
import { colors } from '../../styles/theme';

const FramePreviewModal = ({ isVisible, frame, frames, onClose, onNavigate }) => {
  const currentIndex = frames.findIndex((f) => f?.id === frame?.id);

  if (!frame) return null;

  const ModalBackground = Platform.OS === 'ios' ? BlurView : View;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
      statusBarTranslucent
      presentationStyle="overFullScreen"
    >
      <ModalBackground
        style={styles.modalRoot}
        intensity={Platform.OS === 'ios' ? 80 : undefined}
        tint="dark"
      >
        <TouchableOpacity 
          style={styles.modalTouchable}
          activeOpacity={1}
          onPress={onClose}
        >
          <Pressable 
            style={styles.modalContainer}
            onPress={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
          >
            <LinearGradient
              colors={[colors.backgroundAccent, colors.background]}
              style={styles.modalContent}
            >
              {/* Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalHeaderText}>Frame Preview</Text>
                <TouchableOpacity 
                  style={styles.closeButton} 
                  onPress={onClose}
                  hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                >
                  <MaterialIcons name="close" size={24} color={colors.textTertiary} />
                </TouchableOpacity>
              </View>

              {/* Image */}
              <View style={styles.modalImageContainer}>
                {frame.uri ? (
                  <Image
                    source={{ uri: frame.uri }}
                    style={styles.modalImage}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={[styles.modalImage, styles.modalImagePlaceholder]}>
                    <MaterialIcons name="image" size={48} color={colors.primary} />
                    <Text style={styles.placeholderText}>No preview available</Text>
                  </View>
                )}
              </View>

              {/* Caption */}
              <View style={styles.modalCaptionContainer}>
                <Text style={styles.modalTimestamp}>
                  समय: {frame.timestamp} सेकेन्ड
                </Text>
                <Text style={styles.modalCaption}>{frame.caption}</Text>
              </View>

              {/* Navigation */}
              <View style={styles.modalNavigation}>
                <NavigationButton 
                  direction="left"
                  disabled={currentIndex === 0}
                  onPress={() => currentIndex > 0 && onNavigate(frames[currentIndex - 1])}
                />
                <NavigationButton 
                  direction="right"
                  disabled={currentIndex === frames.length - 1}
                  onPress={() => currentIndex < frames.length - 1 && onNavigate(frames[currentIndex + 1])}
                />
              </View>
            </LinearGradient>
          </Pressable>
        </TouchableOpacity>
      </ModalBackground>
    </Modal>
  );
};

const NavigationButton = ({ direction, disabled, onPress }) => (
  <TouchableOpacity 
    style={[styles.navButton, disabled && styles.navButtonDisabled]}
    onPress={onPress}
    disabled={disabled}
    activeOpacity={0.7}
  >
    <MaterialIcons 
      name={`chevron-${direction}`} 
      size={30} 
      color={colors.textTertiary} 
    />
  </TouchableOpacity>
);

export default FramePreviewModal; 