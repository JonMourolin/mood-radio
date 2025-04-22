import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  SafeAreaView,
  useWindowDimensions,
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

// Define breakpoints
const BREAKPOINTS = {
  sm: 400, // Small screens (phones portrait)
  md: 768, // Medium screens (tablets portrait / large phones)
  // Add lg, xl etc. as needed
};

export default function RadioScreen() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const soundRef = useRef<Audio.Sound | null>(null);
  const navigation = useNavigation();
  const { width } = useWindowDimensions(); // Get dynamic width

  // Determine current breakpoint category (optional helper)
  const getBreakpoint = (currentWidth: number) => {
    if (currentWidth < BREAKPOINTS.sm) return 'sm';
    if (currentWidth < BREAKPOINTS.md) return 'md';
    return 'lg'; // Default to largest category if not smaller
  };
  const breakpoint = getBreakpoint(width);

  const [currentTrack, setCurrentTrack] = useState<StreamMetadata>({
    title: 'Loading...',
    artist: '...',
    album: '...',
    song: 'Loading...',
    artUrl: undefined,
  });

  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <Image
          source={require('../../assets/images/logo/logo1.png')}
          style={{ height: 30, width: 150, resizeMode: 'contain' }}
        />
      ),
      headerTitleAlign: 'center',
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

  // Calculate dynamic style values based on width/breakpoint
  const { 
    albumArtMarginBottom,
    albumArtMaxWidth,
    playButtonPadding,
    playIconSize,
    infoBlockPaddingVertical,
    nowPlayingFontSize,
    nowPlayingMarginBottom,
    titleFontSize,
    titleMarginBottom,
    artistFontSize,
    artistMarginBottom,
    albumFontSize,
    infoBlockMaxWidth
  } = useMemo(() => {
    const isSmall = breakpoint === 'sm';
    const isMediumOrLarger = breakpoint === 'md' || breakpoint === 'lg';

    return {
      albumArtMarginBottom: isSmall ? 6 : 15,
      albumArtMaxWidth: isMediumOrLarger ? 500 : undefined,
      playButtonPadding: isSmall ? 10 : 15,
      playIconSize: isSmall ? 30 : 40,
      infoBlockPaddingVertical: isSmall ? 8 : 15,
      nowPlayingFontSize: isSmall ? 10 : 12,
      nowPlayingMarginBottom: isSmall ? 4 : 8,
      titleFontSize: isSmall ? 20 : 26,
      titleMarginBottom: isSmall ? 2 : 4,
      artistFontSize: isSmall ? 14 : 17,
      artistMarginBottom: isSmall ? 2 : 4,
      albumFontSize: isSmall ? 12 : 15,
      infoBlockMaxWidth: isMediumOrLarger ? 500 : undefined,
    };
  }, [breakpoint]); // Recompute only when breakpoint changes

  return (
    <SafeAreaView style={styles.container}>
      {/* Absolutely positioned background */}
      <ImageBackground 
        source={require('../../assets/images/background-swirl.jpg')}
        style={styles.backgroundImage} // New style for absolute positioning
        resizeMode="cover"
      />
      <StatusBar barStyle={'light-content'} />
      {/* Transparent View to center content on top of background */}
      <View style={styles.centeredContent}>
        <View style={[
          styles.albumArtContainer, 
          { 
            marginBottom: albumArtMarginBottom, 
            maxWidth: albumArtMaxWidth
          }
        ]}>
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
              <View style={[styles.playButtonBackground, { padding: playButtonPadding }]}>
                <Feather name={isPlaying ? 'pause' : 'play'} size={playIconSize} color={theme.background} />
              </View>
            </TouchableOpacity>
          )}
        </View>

        <View style={[styles.infoBlockContainer, { maxWidth: infoBlockMaxWidth }]}>
          <View style={[styles.infoBlock, { paddingVertical: infoBlockPaddingVertical }]}>
            <Text style={[styles.nowPlayingText, { fontSize: nowPlayingFontSize, marginBottom: nowPlayingMarginBottom }]}>NOW PLAYING:</Text>
            <Text style={[styles.titleText, { fontSize: titleFontSize, marginBottom: titleMarginBottom }]} numberOfLines={1}>{isLoading ? ' ' : currentTrack.title}</Text>
            <Text style={[styles.artistText, { fontSize: artistFontSize, marginBottom: artistMarginBottom }]} numberOfLines={1}>{isLoading ? ' ' : currentTrack.artist}</Text>
            {!isLoading && currentTrack.album ? (
              <Text style={[styles.albumText, { fontSize: albumFontSize }]} numberOfLines={1}>{currentTrack.album}</Text>
            ) : null}
          </View>
        </View>
      </View> { /* End centeredContent View */}
    </SafeAreaView>
  );
}

// Define static styles outside the component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflowX: 'hidden', // Prevent ONLY horizontal scrolling
  },
  backgroundImage: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  centeredContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 30,
      backgroundColor: 'transparent', // Ensure content container is transparent
  },
  albumArtContainer: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  albumArt: {
    width: '100%',
    height: '100%',
  },
  playButtonOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonBackground: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 50,
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
    width: '100%',
  },
  infoBlock: {
    backgroundColor: theme.cardBackground,
    paddingHorizontal: 20, // Keep horizontal padding consistent
  },
  nowPlayingText: {
    color: theme.cardForeground,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  titleText: {
    color: theme.cardForeground,
    fontWeight: 'bold',
  },
  artistText: {
    color: theme.cardForeground,
  },
  albumText: {
    color: theme.mutedForeground,
  },
}); 