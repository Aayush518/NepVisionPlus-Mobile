import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import styles from '../styles/styles';

const AudioControls = ({
  isReady,
  isPlaying,
  isPaused,
  position,
  duration,
  handlePlayPause,
  handleReplay,
  handleReset,
  handleSeek,
}) => {
  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.audioControlsContainer}>
      {isReady && (
        <View style={styles.timeDisplay}>
          <Text style={styles.timeText}>{formatTime(position)}</Text>
          <Text style={styles.timeText}> / </Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
      )}
      
      {isReady && (
        <Pressable 
          style={styles.progressBar}
          onPress={(event) => {
            const { locationX } = event.nativeEvent;
            const progress = (locationX / event.target.width) * 100;
            handleSeek(progress);
          }}
        >
          <View 
            style={[
              styles.progressFill,
              { width: `${(position / duration) * 100}%` }
            ]} 
          />
        </Pressable>
      )}
      
      <View style={styles.audioButtons}>
        <Pressable
          style={styles.audioButton}
          onPress={handleReset}
          disabled={!isReady}
        >
          <MaterialIcons name="stop" size={24} color="#FFFFFF" />
        </Pressable>
        
        <Pressable
          style={[styles.audioButton, styles.mainButton]}
          onPress={handlePlayPause}
          disabled={!isReady}
        >
          <MaterialIcons
            name={isPlaying ? "pause" : "play-arrow"}
            size={32}
            color="#FFFFFF"
          />
        </Pressable>
        
        <Pressable
          style={styles.audioButton}
          onPress={handleReplay}
          disabled={!isReady}
        >
          <MaterialIcons name="replay" size={24} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
};

export default AudioControls;