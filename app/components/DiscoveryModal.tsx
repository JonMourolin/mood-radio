import React from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, ScrollView, useWindowDimensions, Platform, ImageBackground, TouchableOpacity, Modal, Linking } from 'react-native';
import { usePlayerContext } from '@/context/PlayerContext';
import { Ionicons } from '@expo/vector-icons';

// Custom hook for typewriter effect
const useTypewriter = (text: string, speed: number = 20) => {
  const [displayedText, setDisplayedText] = React.useState('');

  React.useEffect(() => {
    setDisplayedText('');
    if (text) {
      let i = 0;
      const intervalId = setInterval(() => {
        if (i < text.length) {
          setDisplayedText(prev => prev + text.charAt(i));
          i++;
        } else {
          clearInterval(intervalId);
        }
      }, speed);
      return () => clearInterval(intervalId);
    }
  }, [text, speed]);

  return displayedText;
};

export default function DiscoveryModal() {
  const {
    isDiscoveryModalVisible,
    closeDiscoveryModal,
    discoveryData,
    isDiscoveryLoading,
    discoveryError,
  } = usePlayerContext();
  
  const { track, artist, artUrl, moodImageUrl, description } = discoveryData || {};
  
  const displayedDescription = useTypewriter(isDiscoveryLoading ? '' : description || '');
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
              <Image source={{ uri: artUrl }} style={[styles.coverImage, isMobileLayout && styles.coverImageMobile]} />
            )}
            <View style={[styles.textContainer, isMobileLayout && styles.textContainerMobile]}>
              <Text style={[styles.artistName, isMobileLayout && styles.artistNameMobile]}>{artist || 'Unknown Artist'}</Text>
              <Text style={[styles.trackTitle, isMobileLayout && styles.trackTitleMobile]}>{track || 'Unknown Track'}</Text>
              
              <View style={styles.descriptionContainer}>
                {isDiscoveryLoading ? (
                  <ActivityIndicator size="large" color="#FFFFFF" />
                ) : discoveryError ? (
                  <Text style={styles.errorText}>{discoveryError}</Text>
                ) : (
                  <Text style={[styles.descriptionText, isMobileLayout && styles.descriptionTextMobile]}>{displayedDescription}</Text>
                )}
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
  coverImageMobile: {
    width: '80%',
    height: undefined,
    aspectRatio: 1,
    marginRight: 0,
    marginBottom: 20,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  textContainerMobile: {
    alignItems: 'center',
    width: '100%',
  },
  artistName: {
    fontSize: 22, // Reduced size
    color: '#FFFFFF',
    fontWeight: '400',
  },
  artistNameMobile: {
    textAlign: 'center',
  },
  trackTitle: {
    fontSize: 18, // Reduced size
    color: '#FFFFFF',
    marginBottom: 15, // Reduced space
  },
  trackTitleMobile: {
    textAlign: 'center',
  },
  descriptionContainer: {
    marginTop: 10,
    minHeight: 120, // Adjusted min-height for the new button
  },
  descriptionText: {
    fontSize: 15,
    color: '#FFFFFF',
    lineHeight: 22,
  },
  descriptionTextMobile: {
    textAlign: 'center',
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
}); 