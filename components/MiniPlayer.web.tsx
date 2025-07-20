import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ImageSourcePropType, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StreamData, StreamMetadata } from '@/types/player';
import { useColorScheme } from '@/hooks/useColorScheme';
import { getStyles } from './MiniPlayer.styles'; // We will create this file next

interface MiniPlayerProps {
  activeStream: StreamData | null;
  metadata: StreamMetadata | null;
  isPlaying: boolean;
  isLoading: boolean;
  onPlayPausePress: () => void;
  onClosePress?: () => void;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({ activeStream, metadata, isPlaying, isLoading, onPlayPausePress, onClosePress }) => {
  if (!activeStream) return null;

  const styles = getStyles(useColorScheme() === 'dark');
  const trackInfo = metadata?.song || (isLoading ? "Connecting..." : (isPlaying ? "Streaming..." : "Ready"));

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
        activeStream.imageUrl ? (
           <Image 
            source={activeStream.imageUrl as ImageSourcePropType}
            style={styles.miniPlayerArt} 
            resizeMode="cover" 
          />
        ) : (
          <View style={styles.miniPlayerArtPlaceholder}>
             <Ionicons name="musical-note" size={20} color="#555" />
          </View>
        )
      )}
      
      <View style={styles.miniPlayerInfo}>
        <View style={styles.nowPlayingIcon} />
        <View style={styles.miniPlayerTextContainer}>
          <View style={{ overflow: 'hidden' }}> 
            <Text 
              style={styles.miniPlayerTrackInfo} 
              numberOfLines={1} 
              ellipsizeMode="tail"
            >
              {trackInfo}
            </Text>
          </View>
          <Text style={styles.miniPlayerStreamTitle} numberOfLines={1} ellipsizeMode="tail">
             {activeStream.title}
          </Text>
        </View>
      </View>
      
      <View style={styles.miniPlayerButtonsContainer}>
        <TouchableOpacity onPress={onPlayPausePress} style={styles.miniPlayerPlayButton}>
            <Ionicons
            name={isPlaying ? "stop-sharp" : "play-sharp"}
            size={24}
            color="#FFFFFF"
            />
        </TouchableOpacity>

        {onClosePress && (
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