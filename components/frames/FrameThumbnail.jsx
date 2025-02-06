import React from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import styles from '../../styles/components/frameThumbnail.styles';

const FrameThumbnail = ({ frame, onPress }) => (
  <Pressable
    style={styles.frameItem}
    onPress={() => onPress(frame)}
    android_ripple={{ color: 'rgba(255,255,255,0.1)' }}
  >
    <Image
      source={{ uri: frame.uri }}
      style={styles.frameThumbnail}
      resizeMode="cover"
    />
    <View style={styles.frameOverlay}>
      <Text style={styles.frameTimestamp}>{frame.timestamp}s</Text>
    </View>
  </Pressable>
);

export default FrameThumbnail; 