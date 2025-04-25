import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Platform,
  useWindowDimensions,
  SafeAreaView,
  ImageSourcePropType,
  ScrollView,
  Image,
} from 'react-native';
import { Audio } from 'expo-av';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText'; 
import { Ionicons } from '@expo/vector-icons';

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
  onClosePress?: () => void;
}

// --- Sample Data --- 
const STREAM_DATA: StreamData[] = [
  {
    id: 'sonic-drift',
    title: 'M00D RADIO',
    emoji: '📡',
    description: 'The main station feed.',
    imageUrl: require('../assets/images/moods/sonic-drift.jpg'),
    streamUrl: 'http://51.75.200.205/listen/tangerine_radio/radio.mp3', 
    metadataUrl: 'http://51.75.200.205/api/nowplaying/tangerine_radio',
  },
  {
    id: 'slow-focus',
    title: 'FOCUS',
    emoji: '🧘',
    description: 'Meditation, relax and focus',
    imageUrl: require('../assets/images/moods/slow-focus.jpg'),
    streamUrl: 'http://51.75.200.205/listen/the_big_calm/radio.mp3',
    metadataUrl: 'http://51.75.200.205/api/nowplaying/the_big_calm',
},
{
    id: 'poolside',
    title: 'HIGH ENERGY',
    emoji: '☀️',
    description: 'Uplifting, energetic and fun',
    imageUrl: require('../assets/images/moods/poolside.jpg'),
    streamUrl: 'http://51.75.200.205/listen/high_energy/radio.mp3', 
    metadataUrl: 'http://51.75.200.205/api/nowplaying/high_energy',
  },
  {
    id: 'low-key',
    title: 'RAGE / RAVE',
    emoji: '🔑',
    description: 'Angry, aggressive and intense',
    imageUrl: require('../assets/images/moods/low-key.jpg'),
    streamUrl: 'http://51.75.200.205/listen/rage/radio.mp3',
    metadataUrl: 'http://51.75.200.205/api/nowplaying/rage',
  },
  {
    id: 'melancholia',
    title: 'MELANCHOLIA',
    emoji: '🌙',
    description: 'Dark, moody and melancholic',
    imageUrl: require('../assets/images/moods/melancholia.jpg'),
    streamUrl: 'http://51.75.200.205/listen/melancholia/radio.mp3',
    metadataUrl: 'http://51.75.200.205/api/nowplaying/melancholia',
  },
  {
    id: 'memory-lane',
    title: 'EXPLORE',
    emoji: '📼',
    description: 'Futuristic, experimental and cosmic',
    imageUrl: require('../assets/images/moods/memory-lane.jpg'),
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

  // Determine icon visibility
  const showPauseIcon = isActive && isPlaying;
  const showPlayIcon = !showPauseIcon && (!canHover || isHovered);
  const shouldShowIcon = showPauseIcon || showPlayIcon;

  const webHoverProps = canHover ? {
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
  } : {};

  return (
    <TouchableOpacity 
      style={styles.itemOuterContainer}
      {...webHoverProps} 
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <ImageBackground source={item.imageUrl} style={styles.itemImageBackground} resizeMode="cover">
        {/* Conditionally render the button based on visibility logic */}
        {shouldShowIcon && (
          <TouchableOpacity style={styles.playButton}>
            <Ionicons 
              name={showPauseIcon ? "stop-sharp" : "play-sharp"} 
              size={48}
              color="#FFFFFF"
              style={styles.playIcon}
            />
          </TouchableOpacity>
        )}

        {/* Conditionally render hover effects OR non-hover text */}
        {canHover && isHovered ? (
          <>
            {/* Web-only blend layer for negative effect */}
            <View style={styles.blendLayer as any} /> 
            {/* Existing hover text overlay */}
            <View style={styles.hoverOverlay}>
              <View style={styles.hoverTitleContainer}> 
                <Text style={styles.itemEmoji}>{item.emoji}</Text> 
                <Text style={styles.hoverTitle}>{item.title}</Text>
              </View>
              <Text style={styles.hoverDescription}>{item.description}</Text>
            </View>
          </>
        ) : (
          /* Non-hover text overlay */
          <View style={styles.itemOverlay}> 
            <View style={styles.itemTitleContainer}>
                <Text style={styles.itemEmoji}>{item.emoji}</Text>
                <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text> 
            </View>
          </View>
        )}
      </ImageBackground>
    </TouchableOpacity>
  );
};

// --- Mini Player Component ---
const MiniPlayer: React.FC<MiniPlayerProps> = ({ activeStream, metadata, isPlaying, onPlayPausePress, onClosePress }) => {
  if (!activeStream) return null;

  const styles = getStyles(useColorScheme() === 'dark');
  let imageSource: ImageSourcePropType;
  if (metadata?.artUrl) {
    imageSource = { uri: metadata.artUrl }; 
  } else {
    imageSource = activeStream.imageUrl; 
  }
  const trackInfo = metadata?.song || (isPlaying ? "Playing..." : "Paused");
  const isWeb = Platform.OS === 'web'; // Check if web

  return (
    <View style={styles.miniPlayerContainer}>
      {/* Album Art Section */}
      {metadata?.artUrl ? (
        <ImageBackground 
          source={{ uri: metadata.artUrl }} 
          style={styles.miniPlayerArt} 
          resizeMode="cover" 
        >
          <View style={styles.miniPlayerArtOverlay} />
        </ImageBackground>
      ) : (
        activeStream.imageUrl ? (
           <Image 
            source={activeStream.imageUrl}
            style={styles.miniPlayerArt} 
            resizeMode="cover" 
          />
        ) : (
          <View style={styles.miniPlayerArtPlaceholder}>
             <Ionicons name="musical-note" size={20} color="#555" />
          </View>
        )
      )}
      
      {/* Play/Pause Button (Moved Left) */}
      <TouchableOpacity onPress={onPlayPausePress} style={styles.miniPlayerPlayButton}>
        <Ionicons 
          name={isPlaying ? "stop-sharp" : "play-sharp"}
          size={24} 
          color="#FFFFFF" 
        />
      </TouchableOpacity>

      {/* Info Section */}
      <View style={styles.miniPlayerInfo}>
        {/* Red Icon */}  
        <View style={styles.nowPlayingIcon} />
        {/* "Now playing:" Label */}
        <Text style={styles.miniPlayerNowPlayingLabel}>Now playing: </Text>
        {/* Track Info */}
        <Text style={styles.miniPlayerTrackInfo} numberOfLines={1}>{trackInfo}</Text>
        {/* Separator */}  
        <View style={styles.miniPlayerTextSeparator} />
        {/* Playlist Title */}  
        <Text style={styles.miniPlayerStreamTitle} numberOfLines={1}>{activeStream.title}</Text>
      </View>
      
      {/* Right Buttons Container (Separator & Close) */}
      <View style={styles.miniPlayerButtonsContainer}>
        {/* Close Button (Web Only) with Separator */}
        {isWeb && onClosePress && (
          <>
            <View style={styles.miniPlayerSeparator} />
            <TouchableOpacity onPress={onClosePress} style={styles.miniPlayerCloseButton}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}


// --- Main Screen Component ---
export function InfiniteScreen() { 
  const colorScheme = useColorScheme();
  const { width } = useWindowDimensions();
  const isDarkMode = colorScheme === 'dark';

  // Set numColumns to 2 unconditionally
  const numColumns = 2;

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
          console.log("Pausing stream via main control");
          soundRef.current.pauseAsync();
        } else {
          console.log("Resuming stream via main control");
          soundRef.current.playAsync();
        }
      } else {
         console.log("Playing new stream (or stopped stream) via main control");
        playStream(item);
      }
    } else {
      console.log("Switching to new stream via main control");
      playStream(item);
    }
  };

  const handleMiniPlayerPlayPause = () => {
     console.log("Mini player play/pause pressed");
    if (activeStream) {
      handlePlayPress(activeStream);
    }
  };
  
  const handleCloseMiniPlayer = () => {
    console.log("Closing mini player and stopping audio via close button.");
    cleanupAudio();
    setActiveStream(null);
    setCurrentMetadata(null);
  };

  useEffect(() => {
    return () => {
       console.log("InfiniteScreen unmounting, cleaning up audio.");
      cleanupAudio();
    };
  }, []);

  // Inject scrollbar styles for web
  useEffect(() => {
    if (Platform.OS === 'web') {
      const styleElement = document.createElement('style');
      styleElement.id = 'custom-scrollbar-styles'; // Add ID for cleanup
      styleElement.innerHTML = `
        /* Dark Scrollbar Styles */
        ::-webkit-scrollbar {
          width: 8px; /* Width of the scrollbar */
          height: 8px; /* Height for horizontal scrollbar */
        }

        ::-webkit-scrollbar-track {
          background: #2c2c2c; /* Dark track background */
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb {
          background-color: #555555; /* Darker grey thumb */
          border-radius: 4px;
          border: 1px solid #2c2c2c; /* Optional: border matching track */
        }

        ::-webkit-scrollbar-thumb:hover {
          background-color: #777777; /* Slightly lighter on hover */
        }
      `;
      document.head.appendChild(styleElement);

      // Cleanup function to remove the style tag when component unmounts
      return () => {
        const existingStyleElement = document.getElementById('custom-scrollbar-styles');
        if (existingStyleElement) {
          document.head.removeChild(existingStyleElement);
        }
      };
    }
  }, []); // Empty dependency array ensures this runs only once on mount/unmount

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Wrap content in ScrollView */}
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContentContainer}
      >
        {/* Restore original container View */}
        <View style={styles.container}>
          {/* Restore original listWrapper View and map */}
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
        </View>
      </ScrollView>

      {/* Sticky MiniPlayer remains outside ScrollView */}
      <MiniPlayer 
          activeStream={activeStream}
          metadata={currentMetadata}
          isPlaying={isPlaying}
          onPlayPausePress={handleMiniPlayerPlayPause}
          onClosePress={handleCloseMiniPlayer}
      />
    </SafeAreaView>
  );
}

// --- Styles ---
const getStyles = (isDarkMode: boolean, numColumns: number = 2) => {
  const isWeb = Platform.OS === 'web'; // Check platform

  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: '#000000',
    },
    scrollView: {
      flex: 1,
    },
    scrollContentContainer: {
      flexGrow: 1,
      paddingBottom: 75,
    },
    container: {
      padding: 10,
    },
    listWrapper: {
      flexDirection: numColumns === 1 ? 'column' : 'row',
      flexWrap: 'wrap',
      width: '100%',
    },
    itemOuterContainer: {
      width: `${100 / numColumns}%`,
      ...(numColumns === 1 ? {
        paddingHorizontal: 0,
        marginVertical: 3,
      } : {
        padding: 3,
      }),
      height: 230,
      overflow: 'hidden',
    },
    itemImageBackground: {
      height: '100%', 
      width: '100%',
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: '#000',
    },
    itemOverlay: {
      flexDirection: 'row',
      alignItems: 'center',
      position: 'absolute',
      bottom: 10,
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 4, 
    },
    playButton: {
      position: 'absolute', 
      top: '50%',
      left: '50%',
      transform: [{ translateX: -24 }, { translateY: -24 }], 
      zIndex: 3,
      width: 48,
      height: 48,
      justifyContent: 'center',
      alignItems: 'center',
    },
    playIcon: {
      textShadowColor: 'rgba(0, 0, 0, 0.6)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 3,
    },
    itemTitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flexShrink: 1, 
    },
    itemTitle: {
      color: '#FFFFFF',
      fontSize: 13, 
      fontWeight: 'bold',
      marginRight: 4,
      flexShrink: 1,
      textShadowColor: 'rgba(0, 0, 0, 0.75)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    itemEmoji: {
      color: '#FFFFFF',
      fontSize: 13,
      marginRight: 5,
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
      justifyContent: 'flex-end',
      alignItems: 'flex-start',
      padding: 10, 
      zIndex: 2,
    },
    hoverTitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 5,
      paddingHorizontal: 0,
    },
    hoverTitle: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: 'bold',
      textAlign: 'left',
    },
    hoverDescription: {
      color: '#E0E0E0',
      fontSize: 12, 
      textAlign: 'left',
      paddingHorizontal: 0,
    },
    miniPlayerContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      height: 65,
      backgroundColor: '#111111',
      borderTopWidth: 1,
      borderTopColor: '#333',
      alignItems: 'center',
      paddingLeft: 10, 
      paddingRight: 5, 
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
    miniPlayerPlayButton: {
      paddingHorizontal: 12, 
      paddingVertical: 10, 
    },
    miniPlayerInfo: {
      flex: 1, 
      flexDirection: 'row', // Arrange items horizontally
      alignItems: 'center', // Vertically center items
      marginLeft: 8, // Adjust margin as needed
      marginRight: 8, // Adjust margin as needed
      overflow: 'hidden',
    },
    // New Style: Red Dot Icon
    nowPlayingIcon: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: 'red',
      marginRight: 6,
    },
    // New Style: "Now playing:" Label
    miniPlayerNowPlayingLabel: {
        color: '#AAAAAA', // Grey color like track info
        fontSize: 12,
        marginRight: 3, // Small space before track info
    },
    miniPlayerTrackInfo: {
      color: '#FFFFFF', // White color for main track info
      fontSize: 12,
      fontWeight: '500', // Slightly bolder than label
      flexShrink: 1, // Allow track info to shrink if needed
      marginRight: 6, // Space before separator
    },
    // New Style: Text Separator
    miniPlayerTextSeparator: {
        width: 1,
        height: 12, // Smaller height for text separator
        backgroundColor: '#555555', // Slightly lighter grey separator
        marginHorizontal: 6, // Spacing around separator
    },
    miniPlayerStreamTitle: {
      color: '#AAAAAA', // Grey color for playlist title
      fontSize: 12,
      fontWeight: 'normal', // Normal weight
      flexShrink: 1, // Allow playlist title to shrink
    },
    miniPlayerButtonsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    miniPlayerSeparator: {
      width: 1,
      height: 24, 
      backgroundColor: '#444444', 
      marginHorizontal: 5, 
    },
    miniPlayerCloseButton: {
      paddingHorizontal: 12, 
      paddingVertical: 10, 
    },
    blendLayer: { // Blend effect layer
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#ffffff',
      // Conditionally apply mixBlendMode for web only
      ...(isWeb && { mixBlendMode: 'difference' as any }), // Use type assertion
      zIndex: 0,
    },
  });
};