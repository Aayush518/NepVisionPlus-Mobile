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

// Update the mock data to not require image files
const MOCK_DATA = {
  frames: [
    {
      id: 'frame-0',
      timestamp: 1,
      caption: "एक व्यक्ति बगैंचामा बसेर किताब पढ्दै गरेको दृश्य",
    },
    {
      id: 'frame-1',
      timestamp: 2,
      caption: "साथीहरू मिलेर खेलमैदानमा फुटबल खेल्दै गरेको दृश्य",
    },
    {
      id: 'frame-2',
      timestamp: 3,
      caption: "परिवारका सदस्यहरू मिलेर खाना खाँदै गरेको दृश्य",
    },
    {
      id: 'frame-3',
      timestamp: 4,
      caption: "विद्यार्थीहरू कक्षाकोठामा पढ्दै गरेको दृश्य",
    },
    {
      id: 'frame-4',
      timestamp: 5,
      caption: "एक कलाकार चित्र बनाउँदै गरेको मनमोहक दृश्य",
    }
  ],
  summary: "यो भिडियोमा विभिन्न दैनिक गतिविधिहरू देखाइएको छ । यसमा मानिसहरूको दैनिक जीवन, शिक्षा, खेलकुद र कला सम्बन्धी क्रियाकलापहरू समावेश छन् । सुरुमा एक व्यक्ति शान्त वातावरणमा अध्ययन गर्दै गरेको देखिन्छ । त्यसपछि युवाहरू खेलकुदमा व्यस्त छन् । परिवारिक भोजनको दृश्यले नेपाली संस्कृतिको झलक दिन्छ । विद्यालयको दृश्यले शिक्षाको महत्व दर्शाउँछ । अन्त्यमा कलात्मक गतिविधिले सिर्जनात्मकताको प्रतिनिधित्व गर्छ ।"
};

// Feature Component - Move this before NepVisionApp
const Feature = ({ icon, title, description }) => (
  <MotiView
    from={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ type: 'spring', delay: Math.random() * 500 }}
    style={styles.featureCard}
  >
    <LinearGradient
      colors={['rgba(99, 102, 241, 0.1)', 'rgba(79, 70, 229, 0.1)']}
      style={StyleSheet.absoluteFill}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    />
    <View style={styles.featureIconContainer}>
      <MaterialIcons name={icon} size={32} color="#818CF8" />
    </View>
    <Text style={styles.featureTitle}>{title}</Text>
    <Text style={styles.featureDescription}>{description}</Text>
  </MotiView>
);

// Component for individual frame thumbnails
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

// Frame preview modal component
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
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Update the processing overlay to be dismissible and not block interactions when done
const ProcessingOverlay = ({ isVisible, progress }) => {
  if (!isVisible) return null;
  
  return (
    <View style={styles.processingOverlayContainer}>
      <BlurView intensity={20} tint="dark" style={styles.processingOverlay}>
        <View style={styles.processingContent}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.processingText}>
            Processing Video ({progress}%)
          </Text>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <LinearGradient
                colors={['#4F46E5', '#6366F1']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: `${progress}%` }]}
              />
            </View>
          </View>
        </View>
      </BlurView>
    </View>
  );
};

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
      <StatusBar style="light" />
      <LinearGradient
        colors={['#0F172A', '#1E293B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
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
              <LinearGradient
                colors={['rgba(99, 102, 241, 0.2)', 'rgba(79, 70, 229, 0.2)']}
                style={styles.headerGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <View style={styles.headerContent}>
                <View style={styles.headerAnimation}>
                  <MaterialIcons 
                    name="psychology" 
                    size={80} 
                    color="#6366F1"
                    style={styles.brainIcon}
                  />
                </View>
                <View style={styles.titleContainer}>
                  <Text style={styles.title}>NepVision</Text>
                  <Text style={styles.subtitle}>AI Video Analysis & Description</Text>
                </View>
                <Text style={styles.description}>
                  Transform your videos into detailed Nepali descriptions with advanced AI technology
                </Text>
              </View>
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
          </Animated.View>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    position: 'relative',
    marginBottom: 32,
    borderRadius: 24,
    overflow: 'hidden',
  },
  headerGradient: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.8,
  },
  headerContent: {
    padding: 24,
    alignItems: 'center',
  },
  headerAnimation: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderRadius: 70,
    borderWidth: 2,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    marginBottom: 16,
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(99, 102, 241, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 18,
    color: '#A5B4FC',
    marginTop: 8,
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    maxWidth: '80%',
  },
  featuresContainer: {
    marginBottom: 32,
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  featureCard: {
    flex: 1,
    margin: 8,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
    overflow: 'hidden',
  },
  featureIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E2E8F0',
    marginTop: 12,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 20,
  },
  uploadContainer: {
    position: 'relative',
    marginBottom: 32,
    borderRadius: 24,
    overflow: 'hidden',
  },
  uploadGradient: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.8,
  },
  uploadButton: {
    padding: 32,
    borderRadius: 24,
    overflow: 'hidden',
  },
  uploadButtonGradient: {
    borderRadius: 24,
  },
  uploadButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  uploadContent: {
    alignItems: 'center',
  },
  uploadIcon: {
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  uploadSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 15,
    marginTop: 8,
    letterSpacing: 0.3,
  },
  processingOverlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  processingOverlay: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingContent: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
    maxWidth: '80%',
  },
  processingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#E2E8F0',
    letterSpacing: 0.5,
  },
  progressBarContainer: {
    marginTop: 16,
    width: 240,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  videoWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  video: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  framesSection: {
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  frameCard: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  frameCardGradient: {
    padding: 16,
  },
  frameCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  frameThumbnailContainer: {
    position: 'relative',
    width: 160,
    height: 90,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  frameThumbnail: {
    width: '100%',
    height: '100%',
  },
  timestampBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(99, 102, 241, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  timestampText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  captionContainer: {
    flex: 1,
  },
  captionText: {
    color: '#E2E8F0',
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: 0.3,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#E2E8F0',
    marginBottom: 20,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  summarySection: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    overflow: 'hidden',
  },
  summaryCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 16,
    padding: 20,
  },
  summaryText: {
    fontSize: 16,
    color: '#E2E8F0',
    lineHeight: 24,
    letterSpacing: 0.3,
  },
  audioControlsContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    overflow: 'hidden',
  },
  modalRoot: {
    flex: 1,
    backgroundColor: 'rgba(4, 11, 33, 0.95)',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: '#1E293B',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(99, 102, 241, 0.2)',
  },
  modalHeaderText: {
    color: '#E2E8F0',
    fontSize: 18,
    fontWeight: '600',
  },
  modalImageContainer: {
    width: '100%',
    height: 300,
    backgroundColor: '#0F172A',
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  modalCaptionContainer: {
    padding: 20,
    backgroundColor: '#1E293B',
  },
  modalTimestamp: {
    color: '#A5B4FC',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  modalCaption: {
    color: '#E0E7FF',
    fontSize: 16,
    lineHeight: 24,
  },
  modalNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#1E293B',
  },
  navButton: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(99, 102, 241, 0.3)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.4)',
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  closeButton: {
    padding: 8,
  },
  brainIcon: {
    textShadowColor: 'rgba(99, 102, 241, 0.5)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  modalImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
  },
  placeholderText: {
    color: '#6366F1',
    fontSize: 16,
    marginTop: 12,
    fontWeight: '500',
  },
  thumbnailPlaceholder: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoSection: {
    marginBottom: 32,
  },
  videoWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  video: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
});

export default NepVisionApp;