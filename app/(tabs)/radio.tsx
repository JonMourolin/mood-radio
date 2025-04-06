import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Platform,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { Audio } from 'expo-av';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ThemedView } from '@/components/ThemedView';
import { useMetadata } from '@/app/hooks/useMetadata';

// Theme colors
const colors = {
  light: {
    background: '#f7f8fa',
    foreground: '#1a1c20',
    card: '#f7f8fa',
    cardForeground: '#1a1c20',
    primary: '#ff8000',
    primaryForeground: '#f7f8fa',
    secondary: '#ebedf0',
    secondaryForeground: '#1a1c20',
    muted: '#ebedf0',
    mutedForeground: '#646b7a',
    border: '#ebedf0',
  },
  dark: {
    background: '#121418',
    foreground: '#f7f8fa',
    card: '#121418',
    cardForeground: '#f7f8fa',
    primary: '#ff8000',
    primaryForeground: '#f7f8fa',
    secondary: '#1e2126',
    secondaryForeground: '#f7f8fa',
    muted: '#1e2126',
    mutedForeground: '#a3a9b8',
    border: '#1e2126',
  }
};

export default function RadioScreen() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const soundRef = useRef<Audio.Sound | null>(null);
  const waveformAnimation = useRef(new Animated.Value(0)).current;
  
  // Utiliser notre nouveau hook pour les métadonnées
  const metadata = useMetadata();
  
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? colors.dark : colors.light;

  // Initialize audio
  useEffect(() => {
    async function setupAudio() {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          allowsRecordingIOS: false,
          interruptionModeIOS: 2,
          shouldDuckAndroid: true,
          interruptionModeAndroid: 1,
          playThroughEarpieceAndroid: false,
        });
        
        const { sound } = await Audio.Sound.createAsync(
          { uri: 'http://51.75.200.205:8000/stream.mp3' },
          { shouldPlay: false, volume: volume / 100 }
        );
        
        soundRef.current = sound;
      } catch (error) {
        console.error("Error setting up audio:", error);
      }
    }
    
    setupAudio();
    
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  // Handle volume changes
  useEffect(() => {
    if (soundRef.current) {
      soundRef.current.setVolumeAsync(isMuted ? 0 : volume / 100);
    }
  }, [volume, isMuted]);

  // Waveform animation
  useEffect(() => {
    if (isPlaying) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(waveformAnimation, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true
          }),
          Animated.timing(waveformAnimation, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true
          })
        ])
      ).start();
    } else {
      waveformAnimation.setValue(0);
    }
    
    return () => {
      waveformAnimation.stopAnimation();
    };
  }, [isPlaying]);

  const togglePlay = async () => {
    if (!soundRef.current) return;
    
    try {
      if (isPlaying) {
        await soundRef.current.pauseAsync();
      } else {
        await soundRef.current.playAsync();
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error("Error toggling playback:", error);
    }
  };

  const toggleMute = async () => {
    if (!soundRef.current) return;
    
    try {
      await soundRef.current.setVolumeAsync(isMuted ? volume / 100 : 0);
      setIsMuted(!isMuted);
    } catch (error) {
      console.error("Error toggling mute:", error);
    }
  };

  const handleVolumeChange = async (value: number) => {
    setVolume(value);
    
    if (!soundRef.current) return;
    
    try {
      await soundRef.current.setVolumeAsync(value / 100);
      if (value === 0) {
        setIsMuted(true);
      } else if (isMuted) {
        setIsMuted(false);
      }
    } catch (error) {
      console.error("Error changing volume:", error);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.playerContainer}>
            {/* Album artwork or radio logo */}
            <View style={styles.artworkContainer}>
              <Image
                source={metadata?.artwork ? { uri: metadata.artwork } : { uri: 'https://via.placeholder.com/300x300.png?text=Web+Radio' }}
                style={styles.artwork}
              />
              
              {/* Waveform overlay */}
              <Animated.View style={[
                styles.waveformOverlay,
                { opacity: waveformAnimation }
              ]} />
            </View>
            
            {/* Track info */}
            <View style={styles.trackInfoOverlay}>
              <View style={styles.nowPlayingIndicator}>
                <View style={[styles.pulsingDot, { backgroundColor: theme.primary }]} />
                <Text style={[styles.nowPlayingText, { color: theme.primary }]}>
                  {isPlaying ? 'NOW PLAYING' : 'READY TO PLAY'}
                </Text>
              </View>
              <Text style={[styles.trackTitle, { color: theme.foreground }]}>
                {metadata?.title || 'Web Radio'}
              </Text>
              <View style={styles.trackMetaContainer}>
                <View style={styles.trackMetaItem}>
                  <Feather name="user" size={12} color={theme.primary} style={styles.trackMetaIcon} />
                  <Text style={[styles.trackMetaText, { color: theme.foreground }]}>
                    {metadata?.artist || 'Various Artists'}
                  </Text>
                </View>
                {metadata?.album && (
                  <View style={styles.trackMetaItem}>
                    <Feather name="disc" size={12} color={theme.primary} style={styles.trackMetaIcon} />
                    <Text style={[styles.trackMetaText, { color: theme.foreground }]}>
                      {metadata.album}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
          
          {/* Player controls */}
          <View style={styles.controlsContainer}>
            <View style={styles.transportControls}>
              <TouchableOpacity 
                style={[
                  styles.playButton, 
                  { 
                    borderColor: theme.primary,
                    backgroundColor: isPlaying ? `${theme.primary}20` : 'transparent'
                  }
                ]}
                onPress={togglePlay}
              >
                <Feather 
                  name={isPlaying ? "pause" : "play"} 
                  size={24} 
                  color={theme.primary} 
                />
              </TouchableOpacity>
            </View>
            
            <View style={styles.volumeControls}>
              <TouchableOpacity onPress={toggleMute} style={styles.muteButton}>
                <Feather 
                  name={isMuted ? "volume-x" : "volume-2"} 
                  size={16} 
                  color={theme.mutedForeground} 
                />
              </TouchableOpacity>
              
              <Slider
                style={styles.volumeSlider}
                value={volume}
                minimumValue={0}
                maximumValue={100}
                step={1}
                onValueChange={handleVolumeChange}
                minimumTrackTintColor={theme.primary}
                maximumTrackTintColor={theme.muted}
                thumbTintColor={theme.primary}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  playerContainer: {
    marginBottom: 16,
  },
  artworkContainer: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
    borderBottomWidth: 1,
  },
  artwork: {
    width: '100%',
    height: '100%',
  },
  waveformOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  trackInfoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  nowPlayingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  pulsingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  nowPlayingText: {
    fontSize: 12,
    textTransform: 'uppercase',
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  trackMetaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  trackMetaIcon: {
    marginRight: 4,
  },
  trackMetaText: {
    fontSize: 12,
  },
  controlsContainer: {
    padding: 16,
  },
  transportControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  volumeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  muteButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  volumeSlider: {
    flex: 1,
    height: 40,
  },
}); 