import { StyleSheet, FlatList, Image, TouchableOpacity, Dimensions, ActivityIndicator, View } from 'react-native';
import React, { useState, useEffect } from 'react';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import { StatusBar } from 'expo-status-bar';
import { LongMix, fetchLongMixs, buildCloudinaryAudioUrl } from '@/services/cloudinaryService';
import MiniPlayer from '@/components/MiniPlayer';
import { MaterialIcons } from '@expo/vector-icons';

// Composant pour afficher un mix
const MixCard = ({ mix, onPress, isPlaying }: { mix: LongMix; onPress: () => void; isPlaying: boolean }) => {
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
          <ThemedText>{mix.artist}</ThemedText>
          <ThemedText style={styles.folderName}>Dossier: {mix.folder}</ThemedText>
        </ThemedView>
        <ThemedView style={styles.mixMeta}>
          <ThemedText style={styles.duration}>{formatDuration(mix.duration)}</ThemedText>
          <ThemedView style={styles.tagsContainer}>
            {mix.tags.map(tag => (
              <ThemedView key={tag.id} style={styles.tag}>
                <ThemedText style={styles.tagText}>{tag.name}</ThemedText>
              </ThemedView>
            ))}
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </TouchableOpacity>
  );
};

export default function LongMixsScreen() {
  const [mixs, setMixs] = useState<LongMix[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [currentMix, setCurrentMix] = useState<LongMix | null>(null);
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

  // Charger les mixs depuis notre service
  useEffect(() => {
    const loadMixs = async () => {
      try {
        setIsLoading(true);
        const loadedMixs = await fetchLongMixs();
        setMixs(loadedMixs);
        setError(null);
      } catch (error) {
        console.error('Error loading mixes:', error);
        setError('Impossible de charger les mixs');
      } finally {
        setIsLoading(false);
      }
    };

    loadMixs();
  }, []);

  // Fonction pour jouer un mix avec plus de logs
  const playMix = async (mix: LongMix) => {
    try {
      // Arrêter le mix en cours s'il y en a un
      if (sound) {
        await sound.stopAsync();
        sound.unloadAsync();
      }
      
      // Réinitialiser l'erreur précédente
      setError(null);
      
      // Utiliser directement l'URL audio pré-construite
      const audioUrl = mix.audioUrl;
      
      // Afficher les détails pour le débogage
      console.log('=== INFORMATIONS DE DEBUG ===');
      console.log(`URL audio: ${audioUrl}`);
      console.log(`URL couverture: ${mix.coverUrl}`);
      console.log(`Dossier: ${mix.folder}`);
      console.log('============================');
      
      // Créer une nouvelle instance de son
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
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
      setError(`Impossible de lire ${mix.title}. Vérifiez l'URL du fichier audio: ${mix.audioUrl}`);
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

      <ThemedView style={styles.infoContainer}>
        <ThemedText style={styles.infoTitle}>Configuration Cloudinary</ThemedText>
        <ThemedText style={styles.infoText}>
          Structure sur Cloudinary:
        </ThemedText>
        <ThemedText style={styles.infoText}>
          • Dossier principal: web-radio/longmixs/
        </ThemedText>
        <ThemedText style={styles.infoText}>
          • Sous-dossiers: costa-arenbi, mamene-break, etc.
        </ThemedText>
        <ThemedText style={styles.infoText}>
          • Dans chaque sous-dossier: un fichier MP3 et une image
        </ThemedText>
        <ThemedText style={styles.infoText}>
          • Les noms des fichiers doivent être 'mix' et 'cover'
        </ThemedText>
        <ThemedText style={styles.infoText}>
          En cas d'erreur, vérifiez les URLs dans la console de debug.
        </ThemedText>
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

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
  },
  errorContainer: {
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    padding: 12,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorText: {
    color: '#dc2626',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100, // Extra space for mini player
  },
  mixCard: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  playingCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6', // Blue color for currently playing
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  duration: {
    fontSize: 14,
    opacity: 0.7,
  },
  tagsContainer: {
    flexDirection: 'row',
  },
  tag: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#3b82f6',
  },
  folderName: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 2,
  },
  infoContainer: {
    margin: 16,
    padding: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 8,
    marginBottom: 12,
  },
  infoTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    marginBottom: 4,
  },
  codePath: {
    fontFamily: 'monospace',
    fontSize: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingHorizontal: 4,
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingHorizontal: 4,
  },
}); 