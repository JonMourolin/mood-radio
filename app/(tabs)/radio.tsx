import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Audio } from 'expo-av';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';

// Type pour les métadonnées
interface StreamMetadata {
  title: string;
  artist: string;
  album: string;
  song: string;
  artUrl?: string;
}

// Simple dark theme for brutalist design
const theme = {
  background: '#000000',
  foreground: '#FFFFFF',
  cardBackground: '#FFFFFF',
  cardForeground: '#000000',
  primary: '#FFFFFF', // White for icons/separators
  mutedForeground: '#A0A0A0', // Grayish for less important text like album
};

// --- Responsive Threshold --- START
const { width } = Dimensions.get('window');
const isSmallScreen = width < 400; // Target screens narrower than 400px
// --- Responsive Threshold --- END

export default function RadioScreen() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showPlayButton, setShowPlayButton] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);
  const navigation = useNavigation();

  const [currentTrack, setCurrentTrack] = useState<StreamMetadata>({
    title: 'Loading...',
    artist: '...',
    album: '...',
    song: 'Loading...',
    artUrl: undefined,
  });

  useEffect(() => {
    navigation.setOptions({
      headerTitle: 'SONIC DRIFT RADIO',
    });
  }, [navigation]);

  const updateMetadata = async () => {
    try {
      const response = await fetch('http://51.75.200.205/api/nowplaying/tangerine_radio');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      if (data.now_playing) {
        const track = data.now_playing;
        console.log('Received artUrl from API:', track.song.art);
        setCurrentTrack({
          title: track.song.title || 'Unknown Title',
          artist: track.song.artist || 'Unknown Artist',
          album: track.song.album || '',
          song: track.song.title || 'Unknown Title',
          artUrl: track.song.art || undefined,
        });
      } else {
        console.log('No now_playing data received from API.');
        setCurrentTrack({
          title: 'Sonic Drift Radio',
          artist: 'Live Stream / No track info',
          album: '',
          song: 'Sonic Drift Radio',
          artUrl: undefined,
        });
      }

      if (soundRef.current) {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error fetching metadata:', error);
      setCurrentTrack({
        title: 'Error',
        artist: 'Could not load metadata',
        album: '',
        song: 'Error',
        artUrl: undefined,
      });
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      allowsRecordingIOS: false,
      interruptionModeIOS: 2,
      shouldDuckAndroid: true,
      interruptionModeAndroid: 1,
      playThroughEarpieceAndroid: false,
    });

    async function setupAudio() {
      if (!isMounted) return;
      setIsLoading(true);
      try {
        const { sound } = await Audio.Sound.createAsync(
          { uri: 'http://51.75.200.205/listen/tangerine_radio/radio.mp3' },
          { shouldPlay: false, volume: 1.0 }
        );
        if (!isMounted) {
          sound.unloadAsync();
          return;
        }
        soundRef.current = sound;
        await updateMetadata();
      } catch (error) {
        console.error('Error setting up audio:', error);
        if (isMounted) {
          setCurrentTrack({ title: 'Audio Error', artist: 'Cannot load stream', album: '', song: 'Audio Error', artUrl: undefined });
          setIsLoading(false);
        }
      }
    }

    setupAudio();

    const metadataInterval = setInterval(updateMetadata, 10000);

    return () => {
      isMounted = false;
      clearInterval(metadataInterval);
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const togglePlay = async () => {
    if (!soundRef.current || isLoading) return;

    try {
      if (isPlaying) {
        await soundRef.current.pauseAsync();
      } else {
        await soundRef.current.playAsync();
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error('Error toggling playback:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={'light-content'} />
       <View style={styles.centeredContent}>

            <View style={styles.albumArtContainer}>
              <Image
                source={{ uri: currentTrack.artUrl || 'https://via.placeholder.com/600/000000/111111/?text=+' }}
                style={styles.albumArt}
                resizeMode="cover"
              />
              {isLoading ? (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color={theme.primary} />
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.playButtonOverlay}
                  onPress={togglePlay}
                  activeOpacity={0.7}
                >
                  <View style={styles.playButtonBackground}>
                    <Feather name={isPlaying ? 'pause' : 'play'} size={isSmallScreen ? 30 : 40} color={theme.background} />
                  </View>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.infoBlockContainer}>
              <View style={styles.infoBlock}>
                <Text style={styles.nowPlayingText}>NOW PLAYING:</Text>
                <Text style={styles.titleText} numberOfLines={1}>{isLoading ? ' ' : currentTrack.title}</Text>
                <Text style={styles.artistText} numberOfLines={1}>{isLoading ? ' ' : currentTrack.artist}</Text>
                {!isLoading && currentTrack.album ? (
                  <Text style={styles.albumText} numberOfLines={1}>{currentTrack.album}</Text>
                ) : null}
              </View>
            </View>

        </View>
    </SafeAreaView>
  );
}

// Styles with more aggressive conditional values for small screens
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  centeredContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 30,
      backgroundColor: theme.background,
  },
  albumArtContainer: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: isSmallScreen ? 6 : 15, // Final reduction (was 8:15)
  },
  albumArt: {
    width: '100%',
    height: '100%',
    backgroundColor: '#111',
  },
  playButtonOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonBackground: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 50,
    padding: isSmallScreen ? 10 : 15, // More reduced padding for small screens
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5,
  },
  loadingOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  infoBlockContainer: {
    width: '100%', // Takes width from parent padding
  },
  infoBlock: {
    backgroundColor: theme.cardBackground,
    paddingVertical: isSmallScreen ? 8 : 15, // Final reduction (was 10:15)
    paddingHorizontal: 20,
  },
  nowPlayingText: {
    color: theme.cardForeground,
    fontSize: isSmallScreen ? 10 : 12,
    fontWeight: 'bold',
    marginBottom: isSmallScreen ? 4 : 8, // Final reduction (was 5:8)
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  titleText: {
    color: theme.cardForeground,
    fontSize: isSmallScreen ? 20 : 26,
    fontWeight: 'bold',
    marginBottom: isSmallScreen ? 2 : 4, // Final reduction (was 3:4)
  },
  artistText: {
    color: theme.cardForeground,
    fontSize: isSmallScreen ? 14 : 17,
    marginBottom: isSmallScreen ? 2 : 4, // Final reduction (was 3:4)
  },
  albumText: {
    color: theme.mutedForeground,
    fontSize: isSmallScreen ? 12 : 15,
  },
}); 