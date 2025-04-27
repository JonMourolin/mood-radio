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
import { Link } from 'expo-router';
import { StreamData, StreamMetadata } from '@/types/player';
import { usePlayerContext } from '@/context/PlayerContext';
import { StatusBar } from 'expo-status-bar';
import TextTicker from 'react-native-text-ticker';

// --- Interfaces --- 
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
      
      {/* Info Section */}
      <View style={styles.miniPlayerInfo}>
        {/* Red Icon */}
        <View style={styles.nowPlayingIcon} />
        {/* Text Container (Now Column) */}
        <View style={styles.miniPlayerTextContainer}>
          {/* Wrap Ticker in a View */}
          <View style={{ overflow: 'hidden' }}> 
            <TextTicker
              style={styles.miniPlayerTrackInfo} 
              duration={15000} 
              loop
              bounce={false} 
              repeatSpacer={50} 
              marqueeDelay={1000} 
              shouldAnimateTreshold={0} // Keep this for testing
            >
              {trackInfo}
            </TextTicker>
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
export function InfiniteScreen() { 
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
      >
        {/* Header Content Inside ScrollView (Mobile Only) */}
        {!isWeb && (
            <View style={styles.scrollHeaderContainer}>
              <Text style={styles.scrollHeaderText}>Listen to your mood</Text>
              <Ionicons name="infinite-outline" size={26} color="#D22F49" />
            </View>
        )}

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

      {/* Sticky MiniPlayer Area - Conditionally Clickable */}
      {activeStream && (
        isWeb ? (
          // Web: Render MiniPlayer directly, not clickable for navigation
           <MiniPlayer 
                activeStream={activeStream}
                metadata={currentMetadata}
                isPlaying={isPlaying}
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
                trackInfo: currentMetadata?.song || (isPlaying ? 'Playing...' : 'Paused'),
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
        justifyContent: 'flex-start', // Align items to the left
        backgroundColor: '#000000', // Change background back to black
    },
    scrollHeaderText: {
        color: '#FFFFFF',
        fontSize: 22, // Increased font size
        fontWeight: '600',
        marginRight: 8,
    },
  });
};