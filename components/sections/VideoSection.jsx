import React from 'react';
import { View, Pressable, Text, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';
import styles from '../styles/styles';
import { LinearGradient } from 'expo-linear-gradient';

const VideoSection = ({
  videoUri,
  isLoading,
  isProcessing,
  uploadProgress,
  pickVideo
}) => (
  <View style={styles.videoSection}>
    <Pressable
      style={styles.uploadButton}
      onPress={pickVideo}
      disabled={isLoading || isProcessing}
    >
      <LinearGradient
        colors={['#6366F1', '#4F46E5']}
        style={styles.uploadButtonGradient}
      />
      <MaterialIcons
        name={isLoading ? "hourglass-empty" : "cloud-upload"}
        size={32}
        color="#FFFFFF"
      />
      <Text style={styles.uploadText}>
        {isLoading ? "Loading..." : "Select Video"}
      </Text>
    </Pressable>

    {isProcessing && (
      <View style={styles.progressContainer}>
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={styles.progressText}>
          Processing Video ({uploadProgress}%)
        </Text>
      </View>
    )}

    {videoUri && (
      <View style={styles.videoContainer}>
        <LinearGradient
          colors={['rgba(99, 102, 241, 0.1)', 'transparent']}
          style={styles.videoOverlay}
        />
        <Video
          source={{ uri: videoUri }}
          style={styles.video}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}
        />
      </View>
    )}
  </View>
);

export default VideoSection;