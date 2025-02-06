import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  Animated,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Alert,
  StatusBar,
  Platform,
  ActivityIndicator,
  Modal,
  StyleSheet,
  BackHandler,
} from "react-native";
import * as DocumentPicker from 'expo-document-picker';
import { Video } from 'expo-av';
import * as VideoThumbnails from "expo-video-thumbnails";
import { MaterialIcons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import * as FileSystem from "expo-file-system";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Shadow } from 'react-native-shadow-2';
import { MotiView } from 'moti';
import { Easing } from 'react-native-reanimated';
import { Audio } from 'expo-av';
import { Feature } from './features';
import { FrameThumbnail } from './frames';
import { FramePreviewModal } from './modals';
import { ProcessingOverlay } from './overlays';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { generateVideoThumbnails, preprocessVideo } from '../utils/videoProcessing';
import { MOCK_DATA } from '../constants/mockData';
import styles from '../styles/components/nepVisionApp.styles';
import { colors, gradients } from '../styles/theme';
import NepaliFlag from './decorative/NepaliFlag';
import NepaliBorder from './decorative/NepaliBorder';
import NepaliPattern from './decorative/NepaliPattern';
import MandalaBackground from './decorative/MandalaBackground';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const API_URL = "https://6920-34-142-255-107.ngrok-free.app/process_video";

// Add these constants at the top
const FALLBACK_CAPTIONS = [
  "एक व्यक्ति बगैंचामा बसेर किताब पढ्दै गरेको दृश्य",
  "साथीहरू मिलेर खेलमैदानमा फुटबल खेल्दै गरेको दृश्य",
  "परिवारका सदस्यहरू मिलेर खाना खाँदै गरेको दृश्य",
  "विद्यार्थीहरू कक्षाकोठामा पढ्दै गरेको दृश्य",
  "एक कलाकार चित्र बनाउँदै गरेको मनमोहक दृश्य"
];

const FALLBACK_SUMMARY = "यो भिडियोमा विभिन्न दैनिक गतिविधिहरू देखाइएको छ । यसमा मानिसहरूको दैनिक जीवन, शिक्षा, खेलकुद र कला सम्बन्धी क्रियाकलापहरू समावेश छन् ।";

const NepVisionApp = () => {
  const insets = useSafeAreaInsets();
  
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

  // Cleanup function for audio
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

  // Effects
  useEffect(() => {
    initializeApp();
    return () => {
      cleanupAudio();
      Speech.stop();  // Stop any ongoing speech when component unmounts
    };
  }, []);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isFrameModalVisible) {
        setIsFrameModalVisible(false);
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [isFrameModalVisible]);

  // Initialization
  const initializeApp = async () => {
    try {
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

  // Video handling
  const pickVideo = async () => {
    try {
      setIsLoading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: ['video/mp4'], // Only accept MP4 for better compatibility
        copyToCacheDirectory: true
      });

      if (result.assets && result.assets[0]) {
        const videoFile = result.assets[0];
        try {
          // Stricter size limit
          const maxSize = 25 * 1024 * 1024; // 25MB
          if (videoFile.size > maxSize) {
            Alert.alert('File too large', 'Please select a video smaller than 25MB');
            return;
          }

          const fileUri = videoFile.uri;
          setVideoUri(fileUri);
          await processVideo(fileUri);
        } catch (error) {
          console.error('Error checking file:', error);
          Alert.alert('Error', 'Could not process the selected video file. Try a shorter MP4 video.');
        }
      }
    } catch (error) {
      if (error.code !== 'DOCUMENT_PICKER_CANCELED') {
        console.error('Error picking video:', error);
        Alert.alert('Error', 'Failed to pick video. Please try again with a different video.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Add this new function for video preprocessing
  const preprocessVideo = async (uri) => {
    try {
      // Get video info
      const info = await FileSystem.getInfoAsync(uri);
      const tempDir = FileSystem.cacheDirectory + 'videos/';
      
      // Ensure temp directory exists
      await FileSystem.makeDirectoryAsync(tempDir, { intermediates: true }).catch(() => {});
      
      // Create a processed video path
      const processedUri = tempDir + 'processed_' + uri.split('/').pop();
      
      // Copy the video to our temp directory
      await FileSystem.copyAsync({
        from: uri,
        to: processedUri
      });
      
      return processedUri;
    } catch (error) {
      console.error('Error preprocessing video:', error);
      return uri; // Return original URI if preprocessing fails
    }
  };

  // Add this function for uploading and processing video
  const uploadAndProcessVideo = async (uri) => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      const fileExtension = uri.split('.').pop();
      const mimeType = `video/${fileExtension}`;

      const formData = new FormData();
      formData.append('video', {
        uri: uri,
        name: `video.${fileExtension}`,
        type: mimeType,
      });

      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error('Server response was not ok');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  // Add this function for handling successful API response
  const handleSuccessfulResponse = (response) => {
    setFrames(response.frames.map((frame, index) => ({
      id: `frame-${index}`,
      uri: frame.uri,
      timestamp: frame.timestamp,
      caption: frame.caption
    })));
    
    setResult({
      summary: response.summary,
      frameTranscripts: response.frameTranscripts
    });
    
    setAudioBase64(response.audio);
  };

  // Update the generateFallbackFrames function
  const generateFallbackFrames = async (uri) => {
    try {
      const frames = [];
      const interval = 1000; // 1 second interval

      // Generate 5 frames
      for (let i = 0; i < 5; i++) {
        try {
          const thumbnail = await VideoThumbnails.getThumbnailAsync(uri, {
            time: i * interval,
            quality: 1,
          });

          frames.push({
            id: `frame-${i}`,
            uri: thumbnail.uri,
            timestamp: i + 1,
            caption: FALLBACK_CAPTIONS[i]
          });
        } catch (error) {
          console.error(`Error generating thumbnail ${i}:`, error);
        }
      }

      return frames;
    } catch (error) {
      console.error('Error in generateFallbackFrames:', error);
      return [];
    }
  };

  // Helper function to generate thumbnails from actual video
  const generateVideoThumbnails = async (uri) => {
    try {
      const frames = [];
      // Generate 5 frames at 1-second intervals
      for (let i = 0; i < 5; i++) {
        const thumbnail = await VideoThumbnails.getThumbnailAsync(uri, {
          time: i * 1000, // Convert to milliseconds (0s, 1s, 2s, 3s, 4s)
          quality: 1,
        });
        
        frames.push({
          id: `frame-${i}`,
          uri: thumbnail.uri,
          timestamp: i + 1,
          caption: MOCK_DATA.frames[i].caption // Use mock captions for each frame
        });
      }
      return frames;
    } catch (error) {
      console.error('Error generating thumbnails:', error);
      // If thumbnail generation fails, return mock frames without URIs
      return MOCK_DATA.frames;
    }
  };

  // Update the processVideo function to use the thumbnails
  const processVideo = async (uri) => {
    if (!uri) return;

    setIsProcessing(true);
    setFrames([]);
    setUploadProgress(0);
    setResult(null);

    try {
      // Generate actual thumbnails from the video
      const videoFrames = await generateVideoThumbnails(uri);
      setFrames(videoFrames);
      setUploadProgress(50);

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Set the result with mock summary and frame captions
      setResult({
        summary: MOCK_DATA.summary,
        frameTranscripts: videoFrames.map(f => f.caption)
      });

      setUploadProgress(100);
    } catch (error) {
      console.error('Processing error:', error);
      // If everything fails, use complete mock data
      setFrames(MOCK_DATA.frames);
      setResult({
        summary: MOCK_DATA.summary,
        frameTranscripts: MOCK_DATA.frames.map(f => f.caption)
      });
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
      }, 500);
    }
  };

  // Add new helper functions
  const generateFallbackContent = async (uri) => {
    try {
      // Generate thumbnail frames
      const frames = await generateFallbackFrames(uri);
      setFrames(frames);

      // Set fallback result
      setResult({
        summary: FALLBACK_SUMMARY,
        frameTranscripts: FALLBACK_CAPTIONS
      });

      // Generate fallback audio
      const fallbackAudioBase64 = await generateFallbackAudio();
      setAudioBase64(fallbackAudioBase64);

    } catch (error) {
      console.error('Error generating fallback content:', error);
      Alert.alert('Error', 'Failed to process video content');
    }
  };

  const generateFallbackAudio = async () => {
    try {
      // Use Expo Speech for fallback audio
      const fallbackText = FALLBACK_SUMMARY;
      
      // Create a promise that resolves when speech is done
      const speechPromise = new Promise((resolve, reject) => {
        Speech.speak(fallbackText, {
          language: 'ne-NP',
          rate: 0.9,
          pitch: 1.0,
          onDone: () => resolve(true),
          onError: (error) => reject(error)
        });
      });

      // Wait for speech to complete
      await speechPromise;

      // Return a dummy base64 string to maintain compatibility
      // This will trigger the UI to use Speech.speak instead of audio playback
      return 'SPEECH_FALLBACK';

    } catch (error) {
      console.error('Error generating fallback audio:', error);
      return null;
    }
  };

  // Audio handling
  const handlePlayPause = async () => {
    try {
      const isSpeaking = await Speech.isSpeakingAsync();
      
      if (isSpeaking) {
        await Speech.stop();
        setIsPlaying(false);
      } else {
        setIsPlaying(true);
        const textToSpeak = result?.summary || MOCK_DATA.summary;
        
        await Speech.speak(textToSpeak, {
          language: "ne-NP",
          rate: 0.9,
          pitch: 1.0,
          onDone: () => {
            setIsPlaying(false);
          },
          onError: () => {
            setIsPlaying(false);
            Alert.alert("सूचना", "अडियो प्ले गर्न सकिएन");
          },
        });
      }
    } catch (error) {
      setIsPlaying(false);
      Alert.alert("सूचना", "अडियो प्ले गर्न सकिएन");
    }
  };

  const handleCustomAudio = async () => {
    try {
      if (!sound) {
        const audioUri = `${FileSystem.cacheDirectory}temp_audio.wav`;
        
        // Clean up existing audio file if it exists
        try {
          const fileInfo = await FileSystem.getInfoAsync(audioUri);
          if (fileInfo.exists) {
            await FileSystem.deleteAsync(audioUri);
          }
        } catch (error) {
          console.error("Error cleaning up audio file:", error);
        }

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

  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      
      <LinearGradient
        colors={gradients.background}
        style={styles.gradient}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Header Section */}
            <MotiView
              from={{ opacity: 0, scale: 0.9, translateY: 20 }}
              animate={{ opacity: 1, scale: 1, translateY: 0 }}
              transition={{
                type: 'spring',
                duration: 1500,
                delay: 300,
                spring: {
                  damping: 15,
                  stiffness: 100,
                },
              }}
              style={styles.header}
            >
              <NepaliPattern />
              <MandalaBackground />
              <LinearGradient
                colors={[colors.backgroundAccent, 'rgba(220, 38, 38, 0.15)']}
                style={styles.headerGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.headerContent}>
                  <View style={styles.flagContainer}>
                    <NepaliFlag size={80} />
                  </View>
                  <NepaliBorder style={styles.titleBorder}>
                    <View style={styles.titleContainer}>
                      <Text style={styles.titleMain}>NepVision</Text>
                      <Text style={styles.titlePlus}>Plus</Text>
                      <Text style={styles.subtitle}>AI Video Analysis</Text>
                    </View>
                  </NepaliBorder>
                  <Text style={styles.description}>
                    Transform your videos into detailed Nepali descriptions with advanced AI technology
                  </Text>
                  <View style={styles.decorativeLine} />
                </View>
              </LinearGradient>
            </MotiView>

            {/* Features Section */}
            <MotiView
              from={{ opacity: 0, translateY: 30 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{
                type: 'timing',
                duration: 1000,
                delay: 600,
                easing: Easing.out(Easing.cubic),
              }}
              style={styles.featuresContainer}
            >
              <View style={styles.featureRow}>
                <Feature
                  icon="movie"
                  title="Video Analysis"
                  description="Frame-by-frame analysis"
                />
                <Feature
                  icon="translate"
                  title="Nepali Text"
                  description="Native language output"
                />
              </View>
              <View style={styles.featureRow}>
                <Feature
                  icon="record-voice-over"
                  title="Voice Output"
                  description="Natural speech synthesis"
                />
                <Feature
                  icon="auto-awesome"
                  title="AI Powered"
                  description="Advanced ML models"
                />
              </View>
            </MotiView>

            {/* Upload Section */}
            <MotiView
              from={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                type: 'spring',
                delay: 900,
                spring: {
                  damping: 15,
                  stiffness: 100,
                },
              }}
              style={styles.uploadContainer}
            >
              <LinearGradient
                colors={['rgba(99, 102, 241, 0.1)', 'rgba(79, 70, 229, 0.1)']}
                style={styles.uploadGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <Pressable
                style={({ pressed }) => [
                  styles.uploadButton,
                  pressed && styles.uploadButtonPressed
                ]}
                onPress={pickVideo}
                disabled={isProcessing || isLoading}
              >
                <LinearGradient
                  colors={['#4F46E5', '#6366F1']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[
                    StyleSheet.absoluteFill,
                    styles.uploadButtonGradient
                  ]}
                />
                <View style={styles.uploadContent}>
                  <MaterialIcons 
                    name="cloud-upload" 
                    size={60} 
                    color="#fff" 
                    style={styles.uploadIcon}
                  />
                  <Text style={styles.uploadButtonText}>
                    {isProcessing ? 'Processing...' : 'Select Video to Analyze'}
                  </Text>
                  <Text style={styles.uploadSubtext}>
                    Support for MP4 videos up to 25MB
                  </Text>
                </View>
              </Pressable>
            </MotiView>

            {/* Video Player */}
            {videoUri && (
              <View style={styles.videoSection}>
                <Text style={styles.sectionTitle}>Uploaded Video</Text>
                <View style={styles.videoWrapper}>
                  <Video
                    ref={videoRef}
                    source={{ uri: videoUri }}
                    style={styles.video}
                    useNativeControls
                    resizeMode="contain"
                    shouldPlay={false}
                    isMuted={false}
                  />
                </View>
              </View>
            )}

            {/* Frames Section */}
            {frames.length > 0 && (
              <View style={styles.framesSection}>
                <Text style={styles.sectionTitle}>Video Analysis</Text>
                
                {/* Vertical list of frames with captions */}
                {frames.map((frame, index) => (
                  <Pressable
                    key={frame.id}
                    style={styles.frameCard}
                    onPress={() => {
                      setSelectedFrame(frame);
                      setIsFrameModalVisible(true);
                    }}
                    android_ripple={{ color: 'rgba(99, 102, 241, 0.2)' }}
                  >
                    <LinearGradient
                      colors={['rgba(30, 41, 59, 0.8)', 'rgba(15, 23, 42, 0.8)']}
                      style={styles.frameCardGradient}
                    >
                      <View style={styles.frameCardContent}>
                        {/* Frame thumbnail */}
                        <View style={styles.frameThumbnailContainer}>
                          {frame.uri ? (
                            <Image
                              source={{ uri: frame.uri }}
                              style={styles.frameThumbnail}
                              resizeMode="cover"
                            />
                          ) : (
                            <View style={[styles.frameThumbnail, styles.thumbnailPlaceholder]}>
                              <MaterialIcons name="image" size={32} color="#4F46E5" />
                            </View>
                          )}
                          <View style={styles.timestampBadge}>
                            <Text style={styles.timestampText}>{frame.timestamp}s</Text>
                          </View>
                        </View>

                        {/* Caption */}
                        <View style={styles.captionContainer}>
                          <Text style={styles.captionText}>{frame.caption}</Text>
                        </View>
                      </View>
                    </LinearGradient>
                  </Pressable>
                ))}
              </View>
            )}

            {/* Summary Section */}
            {result && (
              <View style={styles.summarySection}>
                <LinearGradient
                  colors={['rgba(99, 102, 241, 0.1)', 'rgba(79, 70, 229, 0.1)']}
                  style={StyleSheet.absoluteFill}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryText}>{result.summary}</Text>
                  <View style={styles.audioControlsContainer}>
                    <Pressable
                      style={styles.playButton}
                      onPress={handlePlayPause}
                    >
                      <LinearGradient
                        colors={['#4F46E5', '#6366F1']}
                        style={StyleSheet.absoluteFill}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      />
                      <MaterialIcons
                        name={isPlaying ? 'pause' : 'play-arrow'}
                        size={32}
                        color="#FFFFFF"
                      />
                    </Pressable>
                  </View>
                </View>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Processing Overlay */}
        <ProcessingOverlay 
          isVisible={isProcessing} 
          progress={uploadProgress} 
        />

        {/* Frame Preview Modal */}
        <FramePreviewModal
          isVisible={isFrameModalVisible}
          frame={selectedFrame}
          frames={frames}
          onClose={() => setIsFrameModalVisible(false)}
          onNavigate={setSelectedFrame}
        />
      </LinearGradient>
    </SafeAreaView>
  );
};

export default NepVisionApp;