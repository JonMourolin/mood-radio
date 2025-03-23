import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { radioService, Stream, PlaybackStatus, AVAILABLE_STREAMS } from '../services/radioService';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { Colors } from '../constants/Colors';
import { useColorScheme } from 'react-native';

export default function RadioPlayer() {
  const [currentStream, setCurrentStream] = useState<Stream | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const colorScheme = useColorScheme();

  // Charger le dernier flux joué au démarrage
  useEffect(() => {
    const loadLastPlayedStream = async () => {
      try {
        const lastStream = await radioService.getLastPlayedStream();
        if (lastStream) {
          setCurrentStream(lastStream);
        }
      } catch (error) {
        console.error('Erreur lors du chargement du dernier flux:', error);
      }
    };

    loadLastPlayedStream();
  }, []);

  // Fonction pour jouer un flux
  const playStream = async (stream: Stream) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await radioService.playStream(stream, handlePlaybackStatusUpdate);
      setCurrentStream(stream);
    } catch (error: any) {
      setError(`Erreur lors de la lecture: ${error.message || 'Erreur inconnue'}`);
      console.error('Erreur de lecture:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Gérer les mises à jour du statut de lecture
  const handlePlaybackStatusUpdate = (status: PlaybackStatus) => {
    setIsPlaying(status.isPlaying);
    
    if (status.error) {
      setError(`Erreur: ${status.error}`);
    }
  };

  // Mettre en pause ou reprendre la lecture
  const togglePlayback = async () => {
    if (isLoading) return;
    
    if (!currentStream) {
      // Si aucun flux n'est sélectionné, jouer le premier
      const defaultStream = AVAILABLE_STREAMS[0];
      await playStream(defaultStream);
      return;
    }
    
    try {
      const playing = await radioService.togglePlayback();
      setIsPlaying(playing);
    } catch (error: any) {
      setError(`Erreur lors de la lecture: ${error.message || 'Erreur inconnue'}`);
      console.error('Erreur de lecture:', error);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <ThemedView style={styles.infoBox}>
          <ThemedText style={styles.infoTitle}>Web Radio</ThemedText>
          <ThemedText style={styles.infoText}>
            Écoutez nos mixs en direct depuis notre serveur de streaming.
          </ThemedText>
        </ThemedView>
        
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        
        <ThemedText style={styles.sectionTitle}>Flux disponibles</ThemedText>
        
        {AVAILABLE_STREAMS.map((stream) => (
          <TouchableOpacity
            key={stream.id}
            style={[
              styles.streamItem,
              currentStream?.id === stream.id && styles.activeStreamItem
            ]}
            onPress={() => playStream(stream)}
            disabled={isLoading}
          >
            <View style={styles.streamIconContainer}>
              <Ionicons
                name="radio-outline"
                size={24}
                color={colorScheme === 'dark' ? Colors.dark.tint : Colors.light.tint}
              />
            </View>
            <View style={styles.streamInfo}>
              <ThemedText style={styles.streamTitle}>{stream.title}</ThemedText>
              <ThemedText style={styles.streamSubtitle}>{stream.artist}</ThemedText>
              {stream.genre && (
                <ThemedText style={styles.streamGenre}>{stream.genre}</ThemedText>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      {/* Lecteur audio fixe en bas */}
      <View style={[
        styles.playerContainer,
        { backgroundColor: colorScheme === 'dark' ? '#1A1A1A' : '#EAEAEA' }
      ]}>
        {currentStream ? (
          <>
            <View style={styles.nowPlayingInfo}>
              <ThemedText style={styles.nowPlayingTitle}>
                {currentStream.title}
              </ThemedText>
              <ThemedText style={styles.nowPlayingArtist}>
                {currentStream.artist}
              </ThemedText>
            </View>
            <TouchableOpacity
              style={styles.playButton}
              onPress={togglePlayback}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="large" color={colorScheme === 'dark' ? Colors.dark.tint : Colors.light.tint} />
              ) : (
                <Ionicons
                  name={isPlaying ? 'pause-circle' : 'play-circle'}
                  size={56}
                  color={colorScheme === 'dark' ? Colors.dark.tint : Colors.light.tint}
                />
              )}
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={styles.selectStreamButton}
            onPress={() => playStream(AVAILABLE_STREAMS[0])}
          >
            <ThemedText style={styles.selectStreamText}>
              Sélectionnez un flux pour commencer
            </ThemedText>
          </TouchableOpacity>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 15,
  },
  infoBox: {
    padding: 15,
    marginVertical: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  streamItem: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  activeStreamItem: {
    borderLeftWidth: 5,
    borderLeftColor: '#2f95dc',
  },
  streamIconContainer: {
    marginRight: 15,
    justifyContent: 'center',
  },
  streamInfo: {
    flex: 1,
  },
  streamTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  streamSubtitle: {
    fontSize: 14,
    marginBottom: 3,
  },
  streamGenre: {
    fontSize: 12,
    opacity: 0.7,
  },
  errorContainer: {
    padding: 10,
    backgroundColor: '#ffebee',
    borderRadius: 5,
    marginVertical: 10,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
  },
  playerContainer: {
    flexDirection: 'row',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nowPlayingInfo: {
    flex: 1,
  },
  nowPlayingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  nowPlayingArtist: {
    fontSize: 14,
    opacity: 0.8,
  },
  playButton: {
    marginLeft: 15,
  },
  selectStreamButton: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectStreamText: {
    fontSize: 16,
    opacity: 0.7,
  },
}); 