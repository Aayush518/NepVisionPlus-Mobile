import React from 'react';
import { Modal, View, Pressable, Image, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import styles from '../styles/styles';

const FramePreviewModal = ({ isVisible, frame, frames, onClose, onNavigate }) => {
  const currentIndex = frames.findIndex((f) => f?.id === frame?.id);

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <View style={styles.modalContent}>
          {frame && (
            <>
              <Image
                source={{ uri: frame.uri }}
                style={styles.modalImage}
                resizeMode="contain"
              />
              <View style={styles.modalCaptionContainer}>
                <Text style={styles.modalTimestamp}>
                  Timestamp: {frame.timestamp}s
                </Text>
                <Text style={styles.modalCaption}>{frame.caption}</Text>
              </View>
              <View style={styles.modalNavigation}>
                <Pressable 
                  style={[styles.navButton, currentIndex === 0 && styles.navButtonDisabled]}
                  onPress={() => currentIndex > 0 && onNavigate(frames[currentIndex - 1])}
                  disabled={currentIndex === 0}
                >
                  <MaterialIcons name="chevron-left" size={30} color="#FFFFFF" />
                </Pressable>
                <Pressable 
                  style={[styles.navButton, currentIndex === frames.length - 1 && styles.navButtonDisabled]}
                  onPress={() => currentIndex < frames.length - 1 && onNavigate(frames[currentIndex + 1])}
                  disabled={currentIndex === frames.length - 1}
                >
                  <MaterialIcons name="chevron-right" size={30} color="#FFFFFF" />
                </Pressable>
              </View>
              <Pressable style={styles.closeButton} onPress={onClose}>
                <MaterialIcons name="close" size={24} color="#FFFFFF" />
              </Pressable>
            </>
          )}
        </View>
      </Pressable>
    </Modal>
  );
};

export default FramePreviewModal;