import { useState, useEffect } from 'react';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';

export const useAudioPlayer = () => {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const handlePlayPause = async (text) => {
    if (isPlaying) {
      await Speech.stop();
      setIsPlaying(false);
    } else {
      try {
        setIsPlaying(true);
        await Speech.speak(text, {
          language: 'ne-NP',
          onDone: () => setIsPlaying(false),
          onError: () => setIsPlaying(false),
        });
      } catch (error) {
        console.error('Error playing audio:', error);
        setIsPlaying(false);
      }
    }
  };

  const handleCustomAudio = async (base64Audio) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: `data:audio/mp3;base64,${base64Audio}` },
        { shouldPlay: true }
      );
      setSound(newSound);
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing custom audio:', error);
    }
  };

  return {
    sound,
    isPlaying,
    duration,
    position,
    handlePlayPause,
    handleCustomAudio,
  };
}; 