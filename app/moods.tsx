import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Platform,
  useWindowDimensions,
  ImageSourcePropType,
  SafeAreaView,
  ScrollView,
  Image,
  ViewStyle,
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
    title: 'MOOD RADIO MAIN MIX',
    emoji: '♾️',
    description: 'The main station feed, a bit of everything, right in the middle',
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
    emoji: '💥',
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
    emoji: '🔮',
    description: 'Futuristic, experimental and cosmic',
    imageUrl: require('../assets/images/moods/memory-lane.jpg'),
    streamUrl: 'http://51.75.200.205/listen/cosmics_trip/radio.mp3',
  },
];

// --- Stream Item Component ---
const StreamItem: React.FC<StreamItemProps> = ({ item, onPlayPress, isActive, isPlaying }) => {
  const [isHovered, setIsHovered] = useState(false);
  const styles = getStyles(useColorScheme() === 'dark', Platform.OS === 'web' && useWindowDimensions().width >= 480 ? 2 : 1);

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
        {shouldShowIcon && (
          <TouchableOpacity style={styles.playButton} onPress={handlePress}> 
            <Ionicons 
              name={showPauseIcon ? "stop-sharp" : "play-sharp"} 
              size={48}
              color="#FFFFFF"
              style={styles.playIcon}
            />
          </TouchableOpacity>
        )}

        {canHover && isHovered ? (
          <>
            <View style={styles.blendLayer as any} /> 
            <View style={styles.hoverOverlay}>
              <View style={styles.hoverTitleContainer}> 
                <Text style={styles.itemEmoji}>{item.emoji}</Text> 
                <Text style={styles.hoverTitle}>{item.title}</Text>
              </View>
              <Text style={styles.hoverDescription}>{item.description}</Text>
            </View>
          </>
        ) : (
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

  const styles = getStyles(useColorScheme() === 'dark', Platform.OS === 'web' ? 2 : 1);
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
        {/* Track Info */}
        <View style={styles.miniPlayerTextContainer}>
          {/* Track Title & Artist */}
          <Text style={styles.miniPlayerTrackInfo} numberOfLines={1} ellipsizeMode="tail">
            {trackInfo}
          </Text>
          {/* Separator */} 
          <View style={styles.miniPlayerTextSeparator} />
          {/* Playlist Title */}
          <Text style={styles.miniPlayerStreamTitle} numberOfLines={1}>{activeStream.title}</Text>
        </View>
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


// --- Main Screen Component: Conditionally render Root ---
export function InfiniteScreen() { 
  const colorScheme = useColorScheme();
  const { width } = useWindowDimensions();
  const isDarkMode = colorScheme === 'dark';
  const isWeb = Platform.OS === 'web';
  
  // Restore breakpoint logic for numColumns
  const numColumns = isWeb && width >= 480 ? 2 : 1;

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

  // Restore root component logic
  const RootComponent = isWeb ? View : SafeAreaView;

  return (
    <RootComponent style={styles.safeArea}> 
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContentContainer}
      >
        <View style={styles.listWrapper}>
          {STREAM_DATA.map((item) => ( 
            <StreamItem 
              key={item.id} 
              item={item}
              isActive={activeStream?.id === item.id}
              isPlaying={activeStream?.id === item.id && isPlaying}
              onPlayPress={handlePlayPress}
            />
          ))}
        </View>
      </ScrollView>

      {/* Sticky MiniPlayer */}
      <MiniPlayer 
          activeStream={activeStream}
          metadata={currentMetadata}
          isPlaying={isPlaying}
          onPlayPausePress={handleMiniPlayerPlayPause}
          onClosePress={handleCloseMiniPlayer}
      />
    </RootComponent>
  );
}

// --- Styles: Ensure explicit conditionals, remove scroll padding H ---
const getStyles = ( 
  isDarkMode: boolean,
  numColumns: number = 2, 
) => { 
  const isWeb = Platform.OS === 'web'; 

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
      // Remove all horizontal padding from scroll container
      paddingHorizontal: 0, 
    },
    listWrapper: { 
      flexDirection: numColumns === 1 ? 'column' : 'row',
      flexWrap: numColumns === 1 ? undefined : 'wrap', 
      width: '100%',
      // Add padding here ONLY for web 2-col to space from edges
      paddingHorizontal: numColumns === 1 ? 0 : 7, // 10 - 3 item padding = 7
    },
    itemOuterContainer: { // Renamed from itemBase
      // Explicit conditional styles based EXACTLY on numColumns
      width: numColumns === 1 ? '100%' : '50%', 
      height: numColumns === 1 ? 200 : 230,
      padding: numColumns === 1 ? 0 : 3, // Padding only for 2-col items
      marginBottom: numColumns === 1 ? 6 : 0, // Margin only for 1-col items
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
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'flex-end', 
      alignItems: 'flex-start', 
      padding: 10, 
      zIndex: 2,
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
      marginBottom: 5,
      flexShrink: 1, 
    },
    itemTitle: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: 'bold',
      marginRight: 4,
      flexShrink: 1,
      textShadowColor: 'rgba(0, 0, 0, 0.75)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    itemEmoji: {
      color: '#FFFFFF',
      fontSize: 15,
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
    miniPlayerTextContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    miniPlayerTrackInfo: {
      color: '#FFFFFF', 
      fontSize: 13,
      fontWeight: '500', 
      flexShrink: 1, 
      marginRight: 6, 
      textTransform: 'uppercase',
    },
    // Restore Text Separator
    miniPlayerTextSeparator: {
        width: 1,
        height: 12, // Smaller height for text separator
        backgroundColor: '#555555', // Slightly lighter grey separator
        marginHorizontal: 6, // Spacing around separator
    },
    // Restore Stream Title
    miniPlayerStreamTitle: {
      color: '#AAAAAA', 
      fontSize: 13,
      fontWeight: 'normal', 
      flexShrink: 1, 
      textTransform: 'uppercase',
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