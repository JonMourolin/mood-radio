import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ImageBackground,
  Platform,
  useWindowDimensions,
  SafeAreaView,
  ImageSourcePropType,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 
import { Audio } from 'expo-av';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText'; 

// --- Interfaces --- 
interface StreamData {
  id: string;
  title: string;
  emoji: string;
  description: string;
  imageUrl: ImageSourcePropType; 
  streamUrl: string; 
  metadataUrl?: string; 
}

interface StreamMetadata {
  title: string;
  artist: string;
  album?: string;
  song?: string;
  artUrl?: string;
}

interface StreamItemProps {
  item: StreamData;
  onPlayPress: (item: StreamData) => void;
  isActive: boolean;
  isPlaying: boolean;
}

interface MiniPlayerProps {
  activeStream: StreamData | null;
  metadata: StreamMetadata | null;
  isPlaying: boolean;
  onPlayPausePress: () => void; 
}

// --- Sample Data --- 
const STREAM_DATA: StreamData[] = [
  {
    id: 'sonic-drift',
    title: 'SONIC DRIFT RADIO',
    emoji: '📡',
    description: 'The main station feed.',
    imageUrl: require('../assets/images/moods/sonic-drift.png'),
    streamUrl: 'http://51.75.200.205/listen/tangerine_radio/radio.mp3', 
    metadataUrl: 'http://51.75.200.205/api/nowplaying/tangerine_radio',
  },
  {
    id: 'slow-focus',
    title: 'THE BIG CALM',
    emoji: '🧘',
    description: 'Meditation, relax and focus',
    imageUrl: require('../assets/images/moods/slow-focus.png'),
    streamUrl: 'http://51.75.200.205/listen/the_big_calm/radio.mp3',
    metadataUrl: 'http://51.75.200.205/api/nowplaying/the_big_calm',
},
{
    id: 'poolside',
    title: 'HIGH ENERGY',
    emoji: '☀️',
    description: 'Uplifting, energetic and fun',
    imageUrl: require('../assets/images/moods/poolside.png'),
    streamUrl: 'http://51.75.200.205/listen/high_energy/radio.mp3', 
    metadataUrl: 'http://51.75.200.205/api/nowplaying/high_energy',
  },
  {
    id: 'low-key',
    title: 'RAGE',
    emoji: '🔑',
    description: 'Angry, aggressive and intense',
    imageUrl: require('../assets/images/moods/low-key.png'),
    streamUrl: 'http://51.75.200.205/listen/rage/radio.mp3',
    metadataUrl: 'http://51.75.200.205/api/nowplaying/rage',
  },
  {
    id: 'melancholia',
    title: 'MELANCHOLIA',
    emoji: '🌙',
    description: 'Dark, moody and melancholic',
    imageUrl: require('../assets/images/moods/melancholia.png'),
    streamUrl: 'http://51.75.200.205/listen/melancholia/radio.mp3',
    metadataUrl: 'http://51.75.200.205/api/nowplaying/melancholia',
  },
  {
    id: 'memory-lane',
    title: 'COSMICS TRIP',
    emoji: '📼',
    description: 'Futuristic, experimental and cosmic',
    imageUrl: require('../assets/images/moods/memory-lane.png'),
    streamUrl: 'http://51.75.200.205/listen/cosmics_trip/radio.mp3',
  },
];

// --- Stream Item Component ---
const StreamItem: React.FC<StreamItemProps> = ({ item, onPlayPress, isActive, isPlaying }) => {
  const [isHovered, setIsHovered] = useState(false);
  const styles = getStyles(useColorScheme() === 'dark');

  const handlePress = () => {
    onPlayPress(item);
  };

  const canHover = Platform.OS === 'web';

  // Conditionally define hover props for web
  const webHoverProps = canHover ? {
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
  } : {};

  return (
    // @ts-ignore - Spread web-specific props
    <View 
      style={styles.itemOuterContainer}
      {...webHoverProps} // Spread the conditional props
    >
      <ImageBackground source={item.imageUrl} style={styles.itemImageBackground} resizeMode="cover">
        {/* Always render play button, positioned absolutely */}
        <TouchableOpacity onPress={handlePress} style={styles.playButton}>
          <Ionicons 
            name={isActive && isPlaying ? "pause" : "play"} 
            size={24} 
            color="#000000"
          />
        </TouchableOpacity>

        {/* Conditionally render hover overlay OR non-hover text */}
        {canHover && isHovered ? (
          <View style={styles.hoverOverlay}>
            <View style={styles.hoverTitleContainer}> 
              <Text style={styles.itemEmoji}>{item.emoji}</Text> 
              <Text style={styles.hoverTitle}>{item.title}</Text>
            </View>
            <Text style={styles.hoverDescription}>{item.description}</Text>
          </View>
        ) : (
          <View style={styles.itemOverlay}> 
            {/* Play button removed from here */}
            <View style={styles.itemTitleContainer}>
                <Text style={styles.itemEmoji}>{item.emoji}</Text>
                <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text> 
            </View>
          </View>
        )}
      </ImageBackground>
    </View>
  );
};

// --- Mini Player Component ---
const MiniPlayer: React.FC<MiniPlayerProps> = ({ activeStream, metadata, isPlaying, onPlayPausePress }) => {
  if (!activeStream) return null;

  const styles = getStyles(useColorScheme() === 'dark');
  let imageSource: ImageSourcePropType;
  if (metadata?.artUrl) {
    imageSource = { uri: metadata.artUrl }; 
  } else {
    imageSource = activeStream.imageUrl; 
  }
  const trackInfo = metadata?.song || (isPlaying ? "Playing..." : "Paused");

  return (
    <View style={styles.miniPlayerContainer}>
      {metadata?.artUrl ? (
        <ImageBackground 
          source={{ uri: metadata.artUrl }} 
          style={styles.miniPlayerArt} 
          resizeMode="cover" 
        >
          <View style={styles.miniPlayerArtOverlay} />
        </ImageBackground>
      ) : (
        <View style={styles.miniPlayerArtPlaceholder}>
          <Ionicons name="musical-note" size={20} color="#555" />
        </View>
      )}
      <View style={styles.miniPlayerInfo}>
        <Text style={styles.miniPlayerStreamTitle} numberOfLines={1}>{activeStream.title}</Text>
        <Text style={styles.miniPlayerTrackInfo} numberOfLines={1}>{trackInfo}</Text>
      </View>
      <TouchableOpacity onPress={onPlayPausePress} style={styles.miniPlayerPlayButton}>
        <Ionicons 
          name={isPlaying ? "pause" : "play"} 
          size={24} 
          color="#FFFFFF" 
        />
      </TouchableOpacity>
    </View>
  );
}


// --- Main Screen Component --- <<<<< ENSURE THIS IS EXPORTED AS DEFAULT >>>>>
export default function InfiniteScreen() { 
  const colorScheme = useColorScheme();
  const { width } = useWindowDimensions();
  const isDarkMode = colorScheme === 'dark';

  // Updated column calculation logic
  let numColumns = 1; // Default to 1 column for smallest screens
  if (width > 1200) { // Very large screens
    numColumns = 4;
  } else if (width > 768) { // Large screens
    numColumns = 3;
  } else if (width > 480) { // Small/Medium screens
     numColumns = 2;
  }
  // If width <= 480, numColumns remains 1

  // --- Debugging Log --- 
  console.log(`Screen Width: ${width}, Calculated Columns: ${numColumns}`);
  // ---------------------

  const styles = getStyles(isDarkMode, numColumns);

  const [activeStream, setActiveStream] = useState<StreamData | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMetadata, setCurrentMetadata] = useState<StreamMetadata | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const metadataIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // --- Audio & Metadata Logic ---
  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
    });
  }, []);

  const cleanupAudio = async () => {
    console.log("Cleaning up audio...");
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    if (metadataIntervalRef.current) {
      clearInterval(metadataIntervalRef.current);
      metadataIntervalRef.current = null;
    }
    setIsPlaying(false);
    setCurrentMetadata(null);
  };

  const fetchMetadata = async (url: string | undefined) => {
    if (!url) {
      setCurrentMetadata(null);
      return;
    }
    console.log(`Fetching metadata from: ${url}`);
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.now_playing) {
        const track = data.now_playing.song;
        const newMetadata: StreamMetadata = {
          title: track.title || 'Unknown Title',
          artist: track.artist || 'Unknown Artist',
          album: track.album || 'Unknown Album',
          song: track.text || `${track.artist} - ${track.title}`,
          artUrl: track.art || undefined,
        };
        setCurrentMetadata(newMetadata);
        console.log("Metadata updated:", newMetadata);
      }
    } catch (error) {
      console.error('Error fetching metadata:', error);
      setCurrentMetadata(null); 
    }
  };

  const playStream = async (stream: StreamData) => {
    console.log(`Attempting to play stream: ${stream.title}`);
    await cleanupAudio(); 

    if (stream.streamUrl === 'placeholder') {
      console.warn("Placeholder stream selected, cannot play.");
      setActiveStream(stream); 
      setIsPlaying(false);
      setCurrentMetadata({ title: stream.title, artist: "(No Stream URL)" }); 
      return;
    }

    try {
      console.log(`Loading sound: ${stream.streamUrl}`);
      const { sound } = await Audio.Sound.createAsync(
        { uri: stream.streamUrl },
        { shouldPlay: true }
      );
      soundRef.current = sound;
      
      soundRef.current.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded) {
              setIsPlaying(status.isPlaying);
          } else {
              if (status.error) {
                  console.error(`Playback Error: ${status.error}`);
                  cleanupAudio(); 
                  setActiveStream(null); 
              }
          }
      });
      
      console.log("Sound loaded and playing.");
      setActiveStream(stream);
      setIsPlaying(true);

      if (stream.metadataUrl) {
        fetchMetadata(stream.metadataUrl);
        metadataIntervalRef.current = setInterval(() => fetchMetadata(stream.metadataUrl), 5000); 
      } else {
        setCurrentMetadata(null); 
      }

    } catch (error) {
      console.error('Error playing stream:', error);
      cleanupAudio();
      setActiveStream(null); 
    }
  };

  const handlePlayPress = (item: StreamData) => {
    if (activeStream?.id === item.id) {
      if (soundRef.current) {
        if (isPlaying) {
          soundRef.current.pauseAsync();
        } else {
          soundRef.current.playAsync();
        }
        setIsPlaying(!isPlaying); 
      } else {
        playStream(item); 
      }
    } else {
      playStream(item);
    }
  };

  const handleMiniPlayerPlayPause = () => {
    if (activeStream) {
      handlePlayPress(activeStream); 
    }
  };

  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Main content container */}
      <View style={styles.container}>
        <ThemedText type="title" style={styles.pageTitle}>INFINITE RADIO</ThemedText>
        <ThemedText style={styles.pageSubtitle}>
          Listen to your ❤️
        </ThemedText>
        <View style={styles.listWrapper}>
          {STREAM_DATA.map((item) => (
            <StreamItem 
              key={item.id}
              item={item}
              onPlayPress={handlePlayPress} 
              isActive={activeStream?.id === item.id}
              isPlaying={activeStream?.id === item.id && isPlaying}
            />
          ))}
        </View>
        {/* MiniPlayer removed from here */}
      </View>

      {/* Sticky MiniPlayer at the bottom */}
      <MiniPlayer 
          activeStream={activeStream}
          metadata={currentMetadata}
          isPlaying={isPlaying}
          onPlayPausePress={handleMiniPlayerPlayPause}
      />
    </SafeAreaView>
  );
}

// --- Styles ---
const getStyles = (isDarkMode: boolean, numColumns: number = 2) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  container: {
    flex: 1,
    padding: 10,
    paddingBottom: 75, // Add padding for sticky MiniPlayer (65 height + 10 margin)
  },
  pageTitle: {
    color: '#FFFFFF',
    textAlign: 'center',
    marginVertical: 10,
  },
  pageSubtitle: {
    color: '#BBBBBB',
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 14,
  },
  listWrapper: {
    flexDirection: numColumns === 1 ? 'column' : 'row',
    flexWrap: 'wrap',
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
  },
  itemOuterContainer: {
    width: `${100 / numColumns}%`,
    ...(numColumns === 1 ? {
      paddingHorizontal: 0,
      marginVertical: 3,
    } : {
      padding: 3,
    }),
    height: 150,
    overflow: 'hidden',
  },
  itemImageBackground: {
    height: '100%',
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  itemOverlay: { // Style for non-hover state text
    flexDirection: 'row',
    alignItems: 'center',
    // Position it towards the bottom to avoid the play button
    position: 'absolute',
    bottom: 10,
    // Add background for better text readability if needed
    // backgroundColor: 'rgba(0, 0, 0, 0.5)', 
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4, 
  },
  playButton: {
    position: 'absolute', // Position absolutely
    // Center the button - adjust as needed
    top: '50%',
    left: '50%',
    transform: [{ translateX: -15 }, { translateY: -15 }], // Offset by half size
    zIndex: 1, // Ensure it's above the overlay
    backgroundColor: '#FFFFFF',
    borderRadius: 15, 
    width: 30, 
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    // marginRight: 8, // Removed
  },
  itemTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1, 
  },
  itemTitle: { // Title style for non-hover state
    color: '#FFFFFF',
    fontSize: 13, 
    fontWeight: 'bold',
    marginRight: 4,
    flexShrink: 1,
    // Text shadow for better visibility on complex backgrounds
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  itemEmoji: { // Emoji style (used in both states)
    color: '#FFFFFF',
    fontSize: 13,
    marginRight: 5,
    // Text shadow for better visibility
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  hoverOverlay: { 
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hoverTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    paddingHorizontal: 5,
  },
  hoverTitle: { // Title style for hover state
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  hoverDescription: {
    color: '#E0E0E0',
    fontSize: 12, 
    textAlign: 'center',
    paddingHorizontal: 5,
  },
  miniPlayerContainer: {
    position: 'absolute', // Make it absolute
    bottom: 0,            // Stick to bottom
    left: 0,              // Stick to left
    right: 0,             // Stick to right
    flexDirection: 'row',
    height: 65,
    backgroundColor: '#111111',
    borderTopWidth: 1,
    borderTopColor: '#333',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  miniPlayerArt: {
    width: 45,
    height: 45,
    overflow: 'hidden',
  },
  miniPlayerArtPlaceholder: { 
      width: 45,
      height: 45,
      backgroundColor: '#282828', 
      justifyContent: 'center',
      alignItems: 'center',
  },
  miniPlayerArtOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.2)'
  },
  miniPlayerInfo: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',
  },
  miniPlayerStreamTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  miniPlayerTrackInfo: {
    color: '#AAAAAA', 
    fontSize: 12,
  },
  miniPlayerPlayButton: {
    padding: 10,
    marginLeft: 10,
  },
});