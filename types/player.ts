import { ImageSourcePropType } from 'react-native';

// Type for individual stream/station data
export interface StreamData {
  id: string;
  title: string;
  emoji: string;
  description: string;
  imageUrl: ImageSourcePropType; 
  moodImageUrl?: string; // New field for the consistent URL
  videoUrl?: any; // or specific video type if you have one
  streamUrl?: string; 
  metadataUrl?: string; 
  stationSlug?: string;
}

// Type for fetched track metadata
export interface StreamMetadata {
  // Removed title, artist, album as they are combined into song
  song: string; // e.g., "Artist Name - Track Title"
  artUrl?: string;
} 