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
  ActivityIndicator,
} from 'react-native';
import { Audio, Video, ResizeMode } from 'expo-av';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText'; 
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { StreamData, StreamMetadata } from '@/types/player';
import { usePlayerContext } from '@/context/PlayerContext';
import { StatusBar } from 'expo-status-bar';
import { AZURACAST_BASE_URL } from '../config';
import { Footer } from '@/components/Footer';


// --- Interfaces --- 
interface StreamItemProps {
  item: StreamData;
  onPlayPress: (item: StreamData) => void;
  isActive: boolean;
  isPlaying: boolean;
  isLoading: boolean;
}

interface MiniPlayerProps {
  activeStream: StreamData | null;
  metadata: StreamMetadata | null;
  isPlaying: boolean;
  isLoading: boolean;
  onPlayPausePress: () => void; 
  onClosePress?: () => void;
}

// --- Sample Data --- 
// Asset mappings for native (require needs static paths)
const nativeAssets = {
  'slow-focus': {
    image: require('../assets/images/moods/slow-focus.jpg'),
    video: require('../assets/images/moods_videos/slow-focus.mp4'),
  },
  'poolside': {
    image: require('../assets/images/moods/poolside.jpg'),
    video: require('../assets/images/moods_videos/poolside.mp4'),
  },
  'melancholia': {
    image: require('../assets/images/moods/melancholia.jpg'),
    video: require('../assets/images/moods_videos/melancholia.mp4'),
  },
  'low-key': {
    image: require('../assets/images/moods/low-key.jpg'),
    video: require('../assets/images/moods_videos/low-key.mp4'),
  },
  'memory-lane': {
    image: require('../assets/images/moods/memory-lane.jpg'),
    video: require('../assets/images/moods_videos/memory-lane.mp4'),
  },
  'sonic-drift': {
    image: require('../assets/images/moods/sonic-drift.jpg'),
    video: require('../assets/images/moods_videos/sonic-drift.mp4'),
  },
};

// Common data structure to avoid duplication
const commonStreamData = [
  {
    id: 'slow-focus',
    title: 'FOCUS',
    emoji: '🧘',
    description: 'Relax and focus',
    stationSlug: 'the_big_calm',
  },
  {
    id: 'poolside',
    title: 'HIGH ENERGY',
    emoji: '☀️',
    description: 'Uplifting and energetic',
    stationSlug: 'high_energy', 
  },
  {
    id: 'melancholia',
    title: 'MELANCHOLIC',
    emoji: '🌙',
    description: 'Moody and melancholic',
    stationSlug: 'melancholia',
  },
  {
    id: 'low-key',
    title: 'RAVE',
    emoji: '💥',
    description: 'Fast and intense',
    stationSlug: 'rage',
  },
  {
    id: 'memory-lane',
    title: 'EXPLORE',
    emoji: '🔮',
    description: 'Futuristic and experimental',
    stationSlug: 'cosmics_trip',
  },
  {
    id: 'sonic-drift',
    title: 'MOODS MAIN MIX',
    emoji: '♾️',
    description: 'The main feed, a bit of everything, right in the middle',
    stationSlug: 'tangerine_radio',
  },
];

// Generate platform-specific data
const generateStreamData = (isWeb: boolean) => {
  return commonStreamData.map(item => ({
    ...item,
    imageUrl: isWeb 
      ? `/images/moods/${item.id}.jpg`
      : nativeAssets[item.id as keyof typeof nativeAssets].image,
    videoUrl: isWeb 
      ? `/images/moods_videos/${item.id}.mp4`
      : nativeAssets[item.id as keyof typeof nativeAssets].video,
  }));
};

const rawStreamData = generateStreamData(Platform.OS === 'web');

const STREAM_DATA: StreamData[] = rawStreamData.map(item => ({
  ...item,
  streamUrl: `${AZURACAST_BASE_URL}/listen/${item.stationSlug}/radio.mp3`,
  metadataUrl: `${AZURACAST_BASE_URL}/api/nowplaying/${item.stationSlug}`,
}));

// --- Stream Item Component ---
const StreamItem: React.FC<StreamItemProps> = ({ item, onPlayPress, isActive, isPlaying, isLoading }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [videoKey, setVideoKey] = useState(Date.now());
  const styles = getStyles(useColorScheme() === 'dark', Platform.OS === 'web' && useWindowDimensions().width >= 480 ? 2 : 1);

  const handlePress = () => {
    onPlayPress(item);
  };

  // Detect if it's mobile web
  const isMobileWeb = Platform.OS === 'web' && (
    typeof navigator !== 'undefined' && 
    (navigator.userAgent.includes('Mobile') || navigator.userAgent.includes('Android') || navigator.userAgent.includes('iPhone'))
  );

  const canHover = Platform.OS === 'web' && !isMobileWeb;

  const handleMouseEnter = () => {
    if (canHover) {
      setIsHovered(true);
      setVideoKey(Date.now()); // Change key to force remount and restart video
    }
  };

  const handleMouseLeave = () => {
    if (canHover) {
      setIsHovered(false);
      // By changing the key on leave as well, we force a remount to a paused state
      setVideoKey(Date.now()); 
    }
  };

  const webHoverProps = canHover ? {
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
  } : {};

  // Determine icon visibility
  const showSpinner = isLoading && isActive;
  const showPauseIcon = !showSpinner && isActive && isPlaying;
  const showPlayIcon = !showSpinner && !showPauseIcon && (!canHover || isHovered);
  const shouldShowIcon = showSpinner || showPauseIcon || showPlayIcon;

  return (
    <TouchableOpacity 
      style={styles.itemOuterContainer}
      {...webHoverProps} 
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {isMobileWeb ? (
        <Image
          source={item.imageUrl}
          style={styles.itemImageBackground}
          resizeMode="cover"
        />
      ) : (
        <Video
          key={videoKey}
          source={item.videoUrl}
          style={styles.itemImageBackground}
          resizeMode={ResizeMode.COVER}
          isLooping
          isMuted
          shouldPlay={isHovered}
        />
      )}
      <View style={StyleSheet.absoluteFill}>
        {shouldShowIcon && (
          <TouchableOpacity style={styles.playButton} onPress={handlePress}> 
            {showSpinner ? (
              <ActivityIndicator 
                size="large" 
                color="#FFFFFF"
              />
            ) : (
              <Ionicons 
                name={showPauseIcon ? "stop-sharp" : "play-sharp"} 
                size={48}
                color="#FFFFFF"
                style={styles.playIcon}
              />
            )}
          </TouchableOpacity>
        )}

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
            <View style={styles.itemTitleContainer}>
                <Text style={styles.itemEmoji}>{item.emoji}</Text>
                <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text> 
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

// --- Mini Player Component ---
const MiniPlayer: React.FC<MiniPlayerProps> = ({ activeStream, metadata, isPlaying, isLoading, onPlayPausePress, onClosePress }) => {
  if (!activeStream) return null;

  const styles = getStyles(useColorScheme() === 'dark', Platform.OS === 'web' ? 2 : 1);
  let imageSource: ImageSourcePropType;
  if (metadata?.artUrl) {
    imageSource = { uri: metadata.artUrl }; 
  } else {
    imageSource = activeStream.imageUrl; 
  }
  const trackInfo = metadata?.song || (isLoading ? "Connecting..." : (isPlaying ? "Streaming..." : "Ready"));
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
      
      {/* Info Section */}
      <View style={styles.miniPlayerInfo}>
        {/* Red Icon */}
        <View style={styles.nowPlayingIcon} />
        {/* Text Container (Now Column) */}
        <View style={styles.miniPlayerTextContainer}>
          {/* Wrap Ticker in a View */}
          <View style={{ overflow: 'hidden' }}> 
            <Text 
              style={styles.miniPlayerTrackInfo} 
              numberOfLines={1} 
              ellipsizeMode="tail"
            >
              {trackInfo}
            </Text>
          </View>
          {/* Playlist Title */}
          <Text style={styles.miniPlayerStreamTitle} numberOfLines={1} ellipsizeMode="tail">
             {activeStream.title}
          </Text>
        </View>
      </View>
      
      {/* Right Buttons Container (Play/Pause, Separator & Close) */}
      <View style={styles.miniPlayerButtonsContainer}>
         {/* Play/Pause Button (MOVED HERE) */}
        <TouchableOpacity onPress={onPlayPausePress} style={styles.miniPlayerPlayButton}>
            <Ionicons
            name={isPlaying ? "stop-sharp" : "play-sharp"}
            size={24}
            color="#FFFFFF"
            />
        </TouchableOpacity>

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
export default function LiveScreen() { 
  const colorScheme = useColorScheme();
  const { width } = useWindowDimensions();
  const isDarkMode = colorScheme === 'dark';
  const isWeb = Platform.OS === 'web';
  
  // Restore breakpoint logic for numColumns
  const numColumns = isWeb && width >= 480 ? 2 : 1;

  const styles = getStyles(isDarkMode, numColumns);

  // Get player state and controls from context
  const {
    activeStream,
    currentMetadata,
    isPlaying,
    isLoading,
    playStream,       // Use this to start a new stream
    togglePlayPause,  // Use this for the mini player's button
    cleanupAudio      // Use this for closing
  } = usePlayerContext();

  // --- Event Handlers --- 
  const handlePlayPress = (item: StreamData) => {
    // Use context functions directly
    if (activeStream?.id === item.id) {
      togglePlayPause(); 
    } else {
      playStream(item);
    }
  };

  const handleMiniPlayerPlayPause = () => {
    // Use context toggle function
    togglePlayPause();
  };
  
  const handleCloseMiniPlayer = () => {
    // Use context cleanup function
    console.log("Closing mini player via web button.");
    cleanupAudio();
    // activeStream and currentMetadata will be cleared by cleanupAudio in context if desired
  };

  // Restore root component logic
  const RootComponent = isWeb ? View : SafeAreaView;

  return (
    <RootComponent style={styles.safeArea}> 
      {/* Set Status Bar style */}
      {!isWeb && <StatusBar style="light" />}
      
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={!isWeb ? [0] : undefined}
      >
        {/* Header Content Inside ScrollView (Mobile Only) */}
        {!isWeb && (
            <View style={styles.scrollHeaderContainer}>
              <Image 
                source={require('../assets/images/logo/logo1.png')}
                style={styles.headerLogo} 
                resizeMode="contain"
              />
            </View>
        )}

        <View style={styles.itemsGridContainer}>
          {STREAM_DATA.map((item) => (
            <StreamItem
              key={item.id}
              item={item}
              onPlayPress={handlePlayPress}
              isActive={activeStream?.id === item.id}
              isPlaying={isPlaying && activeStream?.id === item.id}
              isLoading={isLoading && activeStream?.id === item.id}
            />
          ))}
        </View>

        {Platform.OS === 'web' && <Footer />}
      </ScrollView>

      {/* Sticky MiniPlayer Area - Conditionally Clickable */}
      {activeStream && (
        isWeb ? (
          // Web: Render MiniPlayer directly, not clickable for navigation
           <MiniPlayer 
                activeStream={activeStream}
                metadata={currentMetadata}
                isPlaying={isPlaying}
                isLoading={isLoading}
                onPlayPausePress={handleMiniPlayerPlayPause} 
                onClosePress={handleCloseMiniPlayer} // Web close button still works
            />
        ) : (
          // Native: Render MiniPlayer wrapped in Link and TouchableOpacity
          <Link 
            href={{
              pathname: "/FullScreenPlayer", // Route name stays the same
              // Params are only needed for native navigation now, but can stay
              params: { 
                artUrl: currentMetadata?.artUrl, 
                imageUrl: typeof activeStream.imageUrl === 'object' && 
                          !Array.isArray(activeStream.imageUrl) && 
                          activeStream.imageUrl.uri 
                          ? activeStream.imageUrl.uri 
                          : undefined,
                trackInfo: currentMetadata?.song || (isLoading ? 'Connecting...' : (isPlaying ? 'Streaming...' : 'Ready')),
                streamTitle: activeStream.title,
                isPlaying: isPlaying.toString(),
              }
            }} 
            asChild
          >
            <TouchableOpacity activeOpacity={0.8}>
              <MiniPlayer 
                  activeStream={activeStream}
                  metadata={currentMetadata}
                                  isPlaying={isPlaying}
                isLoading={isLoading}
                onPlayPausePress={handleMiniPlayerPlayPause} // Play/pause still works
                  onClosePress={undefined} // No close button on native MiniPlayer
              />
            </TouchableOpacity>
          </Link>
        )
      )}
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
      // Set background back to black for all platforms
      backgroundColor: '#000000', 
    },
    scrollView: { 
      flex: 1,
      backgroundColor: '#000000', // Explicitly set ScrollView background to black
    },
    scrollContentContainer: { 
      flexGrow: 1,
      paddingBottom: 75, 
      // Remove all horizontal padding from scroll container
      paddingHorizontal: 0, 
    },
    itemsGridContainer: {
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
      textShadowRadius: 10,
    },
    hoverOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'flex-end',
      alignItems: 'flex-start',
      padding: 10,
      zIndex: 2,
      // backgroundColor: 'rgba(0, 0, 0, 0.7)', // Effet d'assombrissement retiré
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
      flexDirection: 'row', // Arrange icon and text container horizontally
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
      flexDirection: 'column', // Stack text vertically
      justifyContent: 'center', // Center text vertically in the container
      marginLeft: 6, // Space between red dot and text block
    },
    miniPlayerTrackInfo: {
      color: '#FFFFFF',
      fontSize: 14, // Set font size to 14
      fontWeight: '500',
      // flexShrink: 1, // Keep shrinking if needed
      // marginRight: 6, // Remove margin as separator is gone
    },
    // Restore Stream Title
    miniPlayerStreamTitle: {
      color: '#AAAAAA',
      fontSize: 12, // Slightly smaller font size
      fontWeight: 'normal',
      // flexShrink: 1, // Keep shrinking if needed
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
    // Styles for Header Content inside ScrollView
    scrollHeaderContainer: {
        paddingHorizontal: 15,
        paddingVertical: 15, // Increased vertical padding
        paddingTop: 25,      // Slightly more top padding
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center', // Center the logo
        backgroundColor: '#000000', // Change background back to black
        width: '100%', // Ensure full width
        alignSelf: 'center', // Center the container itself
    },
    headerLogo: {
        width: 120,
        height: 40,
        alignSelf: 'center', // Center the logo itself
    },
    scrollHeaderText: {
        color: '#FFFFFF',
        fontSize: 22, // Increased font size
        fontWeight: '600',
        marginRight: 8,
    },
  });
};