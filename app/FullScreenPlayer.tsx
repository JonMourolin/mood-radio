import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router'; // Import useRouter
import { Ionicons } from '@expo/vector-icons';
// import { BlurView } from 'expo-blur'; // BlurView might not be needed if Image blurRadius works well
import { usePlayerContext } from '@/context/PlayerContext'; // Import player context

console.log('[FullScreenPlayer] File loaded');

export default function FullScreenPlayer() {
  console.log('[FullScreenPlayer] Component rendering');
  const router = useRouter(); // Hook for navigation actions like goBack
  const {
    activeStream,
    currentMetadata,
    isPlaying,
    togglePlayPause
  } = usePlayerContext();

  // Use data from context instead of params
  const trackInfo = String(currentMetadata?.song || (isPlaying ? "Playing..." : "Paused"));
  const streamTitle = activeStream?.title || 'Unknown Station';
  const artUrl = currentMetadata?.artUrl;
  const imageUrl = typeof activeStream?.imageUrl === 'object' && 
                   !Array.isArray(activeStream?.imageUrl) && 
                   activeStream?.imageUrl?.uri 
                   ? activeStream.imageUrl.uri 
                   : undefined; 
  const displayArtUrl = artUrl || imageUrl; 

  // Connect the button directly to the context function
  const handlePlayPause = () => {
    togglePlayPause();
  };

  // Function to go back
  const handleGoBack = () => {
      if (router.canGoBack()) {
          router.back();
      } else {
          // Fallback if cannot go back (e.g., deep link)
          router.replace('/moods'); // Or your main tab screen
      }
  };

  // Render null or a placeholder if no active stream exists
  if (!activeStream) {
      // Optional: Navigate back automatically or show a message
      // useEffect(() => { handleGoBack(); }, []);
      return (
          <SafeAreaView style={styles.safeArea}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.container}><Text style={styles.stationTitle}>No active stream.</Text></View>
          </SafeAreaView>
      );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} /> 
      {/* Background Image with Blur */}
      {displayArtUrl && (
        <Image 
          source={{ uri: displayArtUrl }} 
          style={StyleSheet.absoluteFill} 
          blurRadius={50} // Increased blur
          resizeMode="cover"
        />
      )}
       {/* Dark overlay for better text contrast */}
       <View style={[StyleSheet.absoluteFill, styles.overlay]} />

        {/* Header with Back Button */}
        <View style={styles.header}>
            <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                <Ionicons name="chevron-down" size={32} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{streamTitle}</Text>
            <View style={{ width: 40 }} />
        </View>

      <View style={styles.container}>
        {/* Album Art */}
        {displayArtUrl ? (
          <Image source={{ uri: displayArtUrl }} style={styles.albumArt} />
        ) : (
          <View style={styles.albumArtPlaceholder}>
             <Ionicons name="musical-note" size={80} color="#555" />
          </View>
        )}

        {/* Track Info */}
        <View style={styles.trackInfoContainer}>
            <Text style={styles.trackTitle} numberOfLines={2}>{trackInfo}</Text>
        </View>

        {/* Controls */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity onPress={handlePlayPause} style={styles.playButton}>
            <Ionicons 
              name={isPlaying ? "pause-circle-outline" : "play-circle-outline"} // Using outline icons
              size={80} 
              color="#FFFFFF" 
            />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000', // Fallback background
  },
  overlay: {
     backgroundColor: 'rgba(0, 0, 0, 0.7)', // Darker overlay
  },
   header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: Platform.OS === 'ios' ? 10 : 20, // Adjust for status bar
    paddingBottom: 10,
    width: '100%',
  },
  backButton: {
    padding: 5, // Increase touchable area
  },
  headerTitle: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between', // Push content apart more
    paddingTop: 10, // Reduced top padding
    paddingBottom: 50, // Increased bottom padding
    paddingHorizontal: 20,
  },
  albumArt: {
    width: '85%', 
    aspectRatio: 1, // Make it square
    borderRadius: 12,
    // Removed marginBottom, rely on justifyContent
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 10, // for Android shadow
  },
   albumArtPlaceholder: {
    width: '85%',
    aspectRatio: 1,
    borderRadius: 12,
    // Removed marginBottom
    backgroundColor: '#282828',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackInfoContainer: {
    alignItems: 'center',
    // Removed marginBottom
    paddingHorizontal: 10, // Prevent text sticking to edges
    width: '100%', // Ensure text centering works
  },
  trackTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  stationTitle: {
    fontSize: 18,
    color: '#AAAAAA',
    textAlign: 'center',
  },
  controlsContainer: {
    width: '100%', // Ensure controls are part of the layout flow
    alignItems: 'center', // Center the play button
    // Removed marginBottom
  },
  playButton: {
    // Style if needed, but size is set on the icon
  },
}); 