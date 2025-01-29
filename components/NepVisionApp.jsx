import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Alert,
  StatusBar,
  Platform,
  Animated,
  StyleSheet,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Video, ResizeMode, Audio } from "expo-av";
import * as VideoThumbnails from "expo-video-thumbnails";
import { MaterialIcons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import { LinearGradient } from "expo-linear-gradient";
import * as FileSystem from "expo-file-system";

// Components
import HeaderSection from './sections/HeaderSection'
import VideoSection from "./sections/VideoSection";
import FrameThumbnail from "./common/FrameThumbnail";
import FramePreviewModal from "./common/FramePreviewModal";
import AudioControls from "./common/AudioControls";
// Styles
import styles from "./styles/styles";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const API_URL = "https://d6f7-34-143-170-173.ngrok-free.app/process_video";

const NepVisionApp = () => {
  // State management
  const [videoUri, setVideoUri] = useState(null);
  const [frames, setFrames] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFrame, setSelectedFrame] = useState(null);
  const [isFrameModalVisible, setIsFrameModalVisible] = useState(false);
  const [audioBase64, setAudioBase64] = useState(null);
  const [sound, setSound] = useState(null);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [isReady, setIsReady] = useState(false);

  // Refs
  const videoRef = useRef(null);
  const scrollViewRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Audio cleanup
  const cleanupAudio = async () => {
    try {
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }
      setAudioBase64(null);
      setIsPlaying(false);
      setIsPaused(false);
      setIsReady(false);
      setDuration(0);
      setPosition(0);
    } catch (error) {
      console.error("Error cleaning up audio:", error);
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await requestPermissions();
        Animated.spring(fadeAnim, {
          toValue: 1,
          tension: 10,
          friction: 2,
          useNativeDriver: true,
        }).start();
      } catch (error) {
        Alert.alert("Error", "Failed to initialize app");
      }
    };

    initializeApp();
    return () => cleanupAudio();
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS !== "web") {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        throw new Error("Permission denied");
      }
    }
  };

  const pickVideo = async () => {
    try {
      setIsLoading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 1,
        videoMaxDuration: 60,
      });

      if (!result.canceled && result.assets?.[0]) {
        const videoUri = result.assets[0].uri;
        setVideoUri(videoUri);
        await processVideo(videoUri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick video. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const processVideo = async (uri) => {
    setIsProcessing(true);
    setFrames([]);
    await cleanupAudio();

    try {
      setUploadProgress(10);
      const response = await uploadVideo(uri);
      setUploadProgress(50);

      if (!response?.frameTranscripts) {
        throw new Error("Invalid response from server");
      }

      const newFrames = await generateFrames(uri, response.frameTranscripts);
      setUploadProgress(75);

      if (newFrames.length > 0) {
        setFrames(newFrames);
        setResult({ summary: response.summary });
        if (response.audio) {
          setAudioBase64(response.audio);
        }
      }

      setUploadProgress(100);
      scrollViewRef.current?.scrollToEnd({ animated: true });
    } catch (error) {
      Alert.alert("Error", "Failed to process video. Please try again.");
    } finally {
      setIsProcessing(false);
      setUploadProgress(0);
    }
  };

  const generateFrames = async (uri, transcripts) => {
    const frames = [];
    for (let i = 0; i < transcripts.length; i++) {
      try {
        const thumbnail = await VideoThumbnails.getThumbnailAsync(uri, {
          time: i * 1000,
          quality: 0.7,
        });

        if (thumbnail?.uri) {
          frames.push({
            id: i,
            uri: thumbnail.uri,
            timestamp: ((i + 1) * 1).toFixed(1),
            exactMs: (i + 1) * 1000,
            caption: transcripts[i],
          });
        }
      } catch (error) {
        console.error(`Error generating thumbnail ${i}:`, error);
      }
    }
    return frames;
  };

  const uploadVideo = async (uri) => {
    const formData = new FormData();
    formData.append("video", {
      uri,
      name: "video.mp4",
      type: "video/mp4",
    });

    const response = await fetch(API_URL, {
      method: "POST",
      body: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  };

  // Audio handling functions
  const handlePlayPause = async () => {
    try {
      if (audioBase64) {
        await handleCustomAudio();
      } else {
        await handleTextToSpeech();
      }
    } catch (error) {
      Alert.alert("Error", "Audio playback failed");
      setIsPlaying(false);
      setIsPaused(false);
    }
  };

  const handleCustomAudio = async () => {
    try {
      if (!sound) {
        const audioUri = `${FileSystem.cacheDirectory}temp_audio.wav`;
        await FileSystem.writeAsStringAsync(audioUri, audioBase64, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: audioUri },
          { shouldPlay: true },
          onPlaybackStatusUpdate
        );

        setSound(newSound);
        setIsPlaying(true);
        setIsPaused(false);
        setIsReady(true);
      } else {
        if (isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
          setIsPaused(true);
        } else {
          await sound.playAsync();
          setIsPlaying(true);
          setIsPaused(false);
        }
      }
    } catch (error) {
      Alert.alert("Error", "Failed to play audio");
      setIsPlaying(false);
      setIsPaused(false);
    }
  };

  const onPlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      setDuration(status.durationMillis || 0);
      setPosition(status.positionMillis || 0);
      
      if (status.didJustFinish) {
        setIsPlaying(false);
        setIsPaused(false);
      }
    }
  };

  const handleReplay = async () => {
    try {
      if (sound) {
        await sound.stopAsync();
        await sound.playFromPositionAsync(0);
        setIsPlaying(true);
        setIsPaused(false);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to replay audio");
    }
  };

  const handleReset = async () => {
    try {
      if (sound) {
        await sound.stopAsync();
        await sound.setPositionAsync(0);
        setIsPlaying(false);
        setIsPaused(false);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to reset audio");
    }
  };

  const handleSeek = async (value) => {
    try {
      if (sound) {
        const newPosition = (value / 100) * duration;
        await sound.setPositionAsync(newPosition);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to seek audio");
    }
  };

  const handleTextToSpeech = async () => {
    const isSpeaking = await Speech.isSpeakingAsync();
    if (isSpeaking) {
      await Speech.pause();
      setIsPlaying(false);
      setIsPaused(true);
    } else if (isPaused) {
      await Speech.resume();
      setIsPlaying(true);
      setIsPaused(false);
    } else {
      setIsPlaying(true);
      setIsPaused(false);
      await Speech.speak(result.summary, {
        language: "ne-NP",
        rate: 0.9,
        pitch: 1.0,
        onDone: () => {
          setIsPlaying(false);
          setIsPaused(false);
        },
        onError: () => {
          setIsPlaying(false);
          setIsPaused(false);
        },
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#1A1A1A", "#2D2D2D"]}
        style={StyleSheet.absoluteFillObject}
      />

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <HeaderSection />

          <VideoSection
            videoUri={videoUri}
            isLoading={isLoading}
            isProcessing={isProcessing}
            uploadProgress={uploadProgress}
            pickVideo={pickVideo}
          />

          {frames.length > 0 && (
            <View style={styles.framesSection}>
              <Text style={styles.sectionTitle}>Generated Frames</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.framesScrollContent}
              >
                {frames.map((frame) => (
                  <FrameThumbnail
                    key={frame.id}
                    frame={frame}
                    onPress={(frame) => {
                      setSelectedFrame(frame);
                      setIsFrameModalVisible(true);
                    }}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {result && (
            <View style={styles.summarySection}>
              <Text style={styles.sectionTitle}>Summary</Text>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryText}>{result.summary}</Text>
                <AudioControls
                  isReady={isReady}
                  isPlaying={isPlaying}
                  isPaused={isPaused}
                  position={position}
                  duration={duration}
                  handlePlayPause={handlePlayPause}
                  handleReplay={handleReplay}
                  handleReset={handleReset}
                  handleSeek={handleSeek}
                />
              </View>
            </View>
          )}
        </ScrollView>

        <FramePreviewModal
          isVisible={isFrameModalVisible}
          frame={selectedFrame}
          frames={frames}
          onClose={() => setIsFrameModalVisible(false)}
          onNavigate={setSelectedFrame}
        />
      </Animated.View>
    </SafeAreaView>
  );
};

export default NepVisionApp;