import { StyleSheet, FlatList, Image, TouchableOpacity, Dimensions, ActivityIndicator, View } from 'react-native';
import React, { useState, useEffect } from 'react';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import { StatusBar } from 'expo-status-bar';
import { SimplifiedMix, getMixes } from '@/services/mixcloudService';
import MiniPlayer from '@/components/MiniPlayer';
import { MaterialIcons } from '@expo/vector-icons';

// Composant pour afficher un mix
const MixCard = ({ mix, onPress, isPlaying }: { mix: SimplifiedMix; onPress: () => void; isPlaying: boolean }) => {
  // Formater la durée en format lisible
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}min`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${minutes}min`;
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.mixCard, isPlaying && styles.playingCard]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Image 
        source={{ uri: mix.coverUrl }}
        style={styles.mixCover}
        resizeMode="cover"
      />
      <ThemedView style={styles.mixInfo}>
        <ThemedView>
          <ThemedText type="subtitle">{mix.title}</ThemedText>
          <ThemedText>{mix.username}</ThemedText>
        </ThemedView>
        <ThemedView style={styles.mixMeta}>
          <ThemedText style={styles.duration}>{formatDuration(mix.durationInSeconds)}</ThemedText>
          <ThemedView style={styles.tagsContainer}>
            {mix.tags.map((tag, index) => (
              <ThemedView key={index} style={styles.tag}>
                <ThemedText style={styles.tagText}>{tag}</ThemedText>
              </ThemedView>
            ))}
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </TouchableOpacity>
  );
};

export default function LongMixsScreen() {
  const [mixs, setMixs] = useState<SimplifiedMix[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [currentMix, setCurrentMix] = useState<SimplifiedMix | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Configurer l'audio
  useEffect(() => {
    const configureAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          interruptionModeIOS: InterruptionModeIOS.DuckOthers,
          interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
        });
      } catch (error) {
        console.error('Failed to configure audio:', error);
        setError('Impossible de configurer l\'audio');
      }
    };

    configureAudio();

    // Nettoyage lors du démontage du composant
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  // Charger les mixs depuis Mixcloud
  useEffect(() => {
    const loadMixs = async () => {
      try {
        setIsLoading(true);
        const loadedMixs = await getMixes();
        setMixs(loadedMixs);
        setError(null);
      } catch (error) {
        console.error('Error loading mixes:', error);
        setError('Impossible de charger les mixs depuis Mixcloud');
      } finally {
        setIsLoading(false);
      }
    };

    loadMixs();
  }, []);

  // Fonction pour jouer un mix
  const playMix = async (mix: SimplifiedMix) => {
    try {
      // Arrêter le mix en cours s'il y en a un
      if (sound) {
        await sound.stopAsync();
        sound.unloadAsync();
      }
      
      // Réinitialiser l'erreur précédente
      setError(null);
      
      // Afficher les détails pour le débogage
      console.log('=== INFORMATIONS DE DEBUG ===');
      console.log(`URL audio: ${mix.url}`);
      console.log(`URL couverture: ${mix.coverUrl}`);
      console.log('============================');
      
      // Créer une nouvelle instance de son
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: mix.url },
        { shouldPlay: true },
        (status) => {
          if (status.isLoaded) {
            if (status.didJustFinish) {
              setIsPlaying(false);
              setCurrentMix(null);
              console.log(`Lecture terminée pour: ${mix.title}`);
            } else {
              setIsPlaying(!status.isPlaying);
            }
          }
        }
      );
      
      // Configurer le nouvel objet son
      setSound(newSound);
      setIsPlaying(true);
      setCurrentMix(mix);
      
      // Obtenir le statut initial pour vérifier la durée
      const initialStatus = await newSound.getStatusAsync();
      console.log(`Son chargé avec succès: ${mix.title}`);
      if (initialStatus.isLoaded) {
        console.log(`Durée: ${initialStatus.durationMillis ? initialStatus.durationMillis / 1000 : 'inconnue'} secondes`);
      } else {
        console.log('Statut non chargé, impossible d\'obtenir la durée');
      }
      
    } catch (error) {
      console.error("Erreur lors de la lecture du mix:", error);
      setError(`Impossible de lire ${mix.title}. Vérifiez l'URL du fichier audio: ${mix.url}`);
      setIsPlaying(false);
      setCurrentMix(null);
    }
  };

  // Fonction pour arrêter la lecture
  const stopPlayback = async () => {
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
      setCurrentMix(null);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar style="auto" />
      <ThemedView style={styles.header}>
        <ThemedText type="title">Long Mixs</ThemedText>
        <ThemedText>Mixs musicaux de longue durée</ThemedText>
      </ThemedView>

      {error && (
        <ThemedView style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </ThemedView>
      )}

      {isLoading ? (
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <ThemedText style={styles.loadingText}>Chargement des mixs...</ThemedText>
        </ThemedView>
      ) : (
        <FlatList
          data={mixs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MixCard 
              mix={item} 
              onPress={() => playMix(item)}
              isPlaying={currentMix?.id === item.id}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <ThemedView style={styles.emptyContainer}>
              <ThemedText>Aucun mix disponible pour le moment</ThemedText>
            </ThemedView>
          }
        />
      )}

      {/* Mini Player */}
      {currentMix && (
        <MiniPlayer 
          mix={currentMix}
          sound={sound}
          onClose={stopPlayback}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 15,
  },
  listContent: {
    padding: 15,
  },
  mixCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  playingCard: {
    borderColor: '#3b82f6',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  mixCover: {
    width: 120,
    height: 120,
  },
  mixInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  mixMeta: {
    marginTop: 8,
  },
  duration: {
    fontSize: 14,
    opacity: 0.7,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tag: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#3b82f6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
  },
  errorContainer: {
    margin: 15,
    padding: 15,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
  },
  errorText: {
    color: '#ef4444',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
}); 