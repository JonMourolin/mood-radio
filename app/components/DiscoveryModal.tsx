import React from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, ScrollView, useWindowDimensions, Platform, ImageBackground, TouchableOpacity, Modal, Linking } from 'react-native';
import { usePlayerContext } from '@/context/PlayerContext';
import { Ionicons } from '@expo/vector-icons';

// The typewriter hook is removed as it causes layout shifts.

// Skeleton Loader Component
const SkeletonPlaceholder = () => (
  <View style={styles.skeletonContainer}>
    <View style={styles.skeletonBar} />
    <View style={styles.skeletonBar} />
    <View style={styles.skeletonBar} />
    <View style={[styles.skeletonBar, { width: '75%' }]} />
  </View>
);

export default function DiscoveryModal() {
  const {
    isDiscoveryModalVisible,
    closeDiscoveryModal,
    discoveryData,
    isDiscoveryLoading,
    discoveryError,
  } = usePlayerContext();
  
  const { track, artist, artUrl, moodImageUrl, description } = discoveryData || {};
  
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isMobileLayout = width < 768;

  const backgroundSource = typeof moodImageUrl === 'string' ? { uri: moodImageUrl } : undefined;

  const handleClose = () => {
    closeDiscoveryModal();
  };
  
  const content = (
    <View style={styles.modalContainer}>
      {backgroundSource && (
        <ImageBackground 
          source={backgroundSource}
          style={StyleSheet.absoluteFill}
          blurRadius={30}
          resizeMode="cover"
        >
          <View style={styles.overlay} />
        </ImageBackground>
      )}

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={[styles.card, isWeb && !isMobileLayout && styles.cardDesktop]}>
          <View style={[styles.mainContent, isMobileLayout && styles.mainContentMobile]}>
            {typeof artUrl === 'string' && (
              <Image 
                source={{ uri: artUrl }} 
                style={[
                  styles.coverImage, 
                  isWeb && isMobileLayout && { 
                    width: width * 0.35, 
                    height: width * 0.35, 
                    marginRight: 0, 
                    marginBottom: 20 
                  }
                ]} 
              />
            )}
            <View style={[styles.textContainer, isMobileLayout && styles.textContainerMobile]}>
              <Text style={[styles.artistName, isMobileLayout && styles.artistNameMobile]}>{artist || 'Unknown Artist'}</Text>
              <Text style={[styles.trackTitle, isMobileLayout && styles.trackTitleMobile]}>{track || 'Unknown Track'}</Text>
              
              <View style={styles.descriptionContainer}>
                {isDiscoveryLoading && <SkeletonPlaceholder />}
                <Text style={[styles.descriptionText, { color: isDiscoveryLoading ? 'transparent' : '#FFFFFF' }]}>
                  {isDiscoveryLoading ? 'Loading description, please wait... This text ensures the container has the correct height from the start.' : (discoveryError || description)}
                </Text>
              </View>
              
              <TouchableOpacity onPress={handleClose} style={styles.backButton}>
                <Text style={styles.backButtonText}>Back to Radio</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );

  if (isWeb) {
    if (!isDiscoveryModalVisible) return null;
    return <View style={styles.webModalOverlay}>{content}</View>;
  }

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isDiscoveryModalVisible}
      onRequestClose={handleClose}
    >
      {content}
    </Modal>
  );
}

const styles = StyleSheet.create({
  webModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    width: '100%',
  },
  card: {
    width: '90%',
    maxWidth: 900,
    minHeight: 300,
    backgroundColor: '#000000',
    borderRadius: 16,
    flexDirection: 'row',
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cardDesktop: {
    width: 900,
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 25,
  },
  mainContentMobile: {
    flexDirection: 'column',
    padding: 20,
    alignItems: 'center',
  },
  coverImage: {
    width: 250,
    height: 250,
    borderRadius: 12,
    marginRight: 25,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  textContainerMobile: {
    alignItems: 'flex-start', // Align text content to the left
    width: '100%',
  },
  artistName: {
    fontSize: 18, // Final font size adjustment
    color: '#FFFFFF',
    fontWeight: '400',
  },
  artistNameMobile: {
    // No longer centered
  },
  trackTitle: {
    fontSize: 16, // Further reduced size
    color: '#FFFFFF',
    marginBottom: 15,
  },
  trackTitleMobile: {
    // No longer centered
  },
  descriptionContainer: {
    marginTop: 10,
    position: 'relative', // Needed for absolute positioning of skeleton
    width: '100%',
  },
  descriptionText: {
    fontSize: 14, // Further reduced size
    color: '#FFFFFF',
    lineHeight: 20, // Adjusted line height
  },
  descriptionTextMobile: {
    // No longer centered
  },
  errorText: {
    fontSize: 15,
    color: '#E63946',
    fontStyle: 'italic',
  },
  backButton: {
    marginTop: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#A41623',
    borderRadius: 8,
    alignSelf: 'center',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  skeletonBar: {
    height: 14,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  }
}); 