import * as VideoThumbnails from "expo-video-thumbnails";
import * as FileSystem from "expo-file-system";
import { MOCK_DATA } from '../constants/mockData';

export const generateVideoThumbnails = async (uri) => {
  try {
    const frames = [];
    for (let i = 0; i < 5; i++) {
      const thumbnail = await VideoThumbnails.getThumbnailAsync(uri, {
        time: i * 1000,
        quality: 1,
      });
      frames.push({
        id: `frame-${i}`,
        uri: thumbnail.uri,
        timestamp: i + 1,
        caption: MOCK_DATA.frames[i]?.caption
      });
    }
    return frames;
  } catch (error) {
    console.error('Error generating thumbnails:', error);
    return MOCK_DATA.frames;
  }
};

export const preprocessVideo = async (uri) => {
  try {
    const info = await FileSystem.getInfoAsync(uri);
    return info.uri;
  } catch (error) {
    console.error('Error preprocessing video:', error);
    throw error;
  }
}; 