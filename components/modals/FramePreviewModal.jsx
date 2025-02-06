import React from 'react';
import { View, Text, Modal, Pressable, Image } from 'react-native';
import { MaterialIcons } from "@expo/vector-icons";
import styles from '../../styles/components/framePreviewModal.styles';

const FramePreviewModal = ({ isVisible, frame, frames, onClose, onNavigate }) => {
  const currentIndex = frames.findIndex((f) => f?.id === frame?.id);

  if (!isVisible || !frame) return null;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.modalRoot}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderText}>Frame Preview</Text>
              <Pressable 
                style={styles.closeButton} 
                onPress={onClose}
                hitSlop={20}
              >
                <MaterialIcons name="close" size={24} color="#FFFFFF" />
              </Pressable>
            </View>

            <View style={styles.modalImageContainer}>
              {frame.uri ? (
                <Image
                  source={{ uri: frame.uri }}
                  style={styles.modalImage}
                  resizeMode="contain"
                />
              ) : (
                <View style={[styles.modalImage, styles.modalImagePlaceholder]}>
                  <MaterialIcons name="image" size={48} color="#4F46E5" />
                  <Text style={styles.placeholderText}>No preview available</Text>
                </View>
              )}
            </View>

            <View style={styles.modalCaptionContainer}>
              <Text style={styles.modalTimestamp}>
                समय: {frame.timestamp} सेकेन्ड
              </Text>
              <Text style={styles.modalCaption}>{frame.caption}</Text>
            </View>

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
          </View>
        </View>
      </View>
    </Modal>
  );
};

const NavigationButton = ({ direction, disabled, onPress }) => (
  <Pressable 
    style={[styles.navButton, disabled && styles.navButtonDisabled]}
    onPress={onPress}
    disabled={disabled}
  >
    <MaterialIcons 
      name={`chevron-${direction}`} 
      size={30} 
      color="#FFFFFF" 
    />
  </Pressable>
);

export default FramePreviewModal; 