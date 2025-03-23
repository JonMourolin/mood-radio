import { StyleSheet, FlatList, Image, TouchableOpacity, Dimensions } from 'react-native';
import React, { useState, useEffect } from 'react';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import { StatusBar } from 'expo-status-bar';

// Type pour les Long Mixs
interface Tag {
  id: string;
  name: string;
}

interface LongMix {
  id: string;
  title: string;
  artist: string;
  description: string;
  duration: number;
  coverUrl: string;
  cloudinaryPublicId: string;
  tags: Tag[];
}

// Composant pour afficher un mix
const MixCard = ({ mix, onPress }: { mix: LongMix; onPress: () => void }) => {
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
    <TouchableOpacity style={styles.mixCard} onPress={onPress}>
      <Image 
        source={{ uri: mix.coverUrl }}
        style={styles.mixCover}
        resizeMode="cover"
      />
      <ThemedView style={styles.mixInfo}>
        <ThemedText type="subtitle">{mix.title}</ThemedText>
        <ThemedText>{mix.artist}</ThemedText>
        <ThemedView style={styles.mixMeta}>
          <ThemedText style={styles.duration}>{formatDuration(mix.duration)}</ThemedText>
          <ThemedView style={styles.tagsContainer}>
            {mix.tags.slice(0, 2).map(tag => (
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
  const [currentMixId, setCurrentMixId] = useState<string | null>(null);

  // Configurer l'audio
  useEffect(() => {
    const configureAudio = async () => {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        interruptionModeIOS: InterruptionModeIOS.DuckOthers,
        interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
      });
    };

    configureAudio();

    // Nettoyage lors du démontage du composant
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  // Fonction pour construire l'URL Cloudinary pour l'audio
  const buildCloudinaryUrl = (publicId: string) => {
    // Remplacer avec votre cloud name Cloudinary
    return `https://res.cloudinary.com/dyom5zfbh/video/upload/${publicId}`;
  };

  // Charger les mixs (simulation pour l'instant)
  useEffect(() => {
    // Simuler un chargement de données
    setTimeout(() => {
      setMixs([
        {
          id: '1',
          title: 'Deep House Journey',
          artist: 'DJ Ambient',
          description: 'A deep house mix for your coding sessions',
          duration: 5400, // 1h30
          coverUrl: 'https://res.cloudinary.com/dyom5zfbh/image/upload/v1742502488/default-cover.jpg',
          cloudinaryPublicId: 'sample-audio',
          tags: [{ id: '1', name: 'Deep House' }, { id: '2', name: 'Chill' }]
        },
        {
          id: '2',
          title: 'Techno Dreams',
          artist: 'TechMaster',
          description: 'Hard-hitting techno for intense focus',
          duration: 3600, // 1h
          coverUrl: 'https://res.cloudinary.com/dyom5zfbh/image/upload/v1742502488/default-cover.jpg',
          cloudinaryPublicId: 'sample-audio-2',
          tags: [{ id: '3', name: 'Techno' }, { id: '4', name: 'Dark' }]
        },
        // Ajouter plus de mixs ici
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Fonction pour jouer un mix
  const playMix = async (mix: LongMix) => {
    try {
      // Arrêter la lecture actuelle s'il y en a une
      if (sound) {
        await sound.unloadAsync();
      }

      // Créer une nouvelle instance de son
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: buildCloudinaryUrl(mix.cloudinaryPublicId) },
        { shouldPlay: true }
      );
      
      setSound(newSound);
      setCurrentMixId(mix.id);
      
      // Configurer les événements du son
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setCurrentMixId(null);
        }
      });
    } catch (error) {
      console.error('Error playing mix:', error);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar style="auto" />
      <ThemedView style={styles.header}>
        <ThemedText type="title">Long Mixs</ThemedText>
        <ThemedText>Extended sessions for continuous listening</ThemedText>
      </ThemedView>

      {isLoading ? (
        <ThemedView style={styles.loadingContainer}>
          <ThemedText>Loading mixes...</ThemedText>
        </ThemedView>
      ) : (
        <FlatList
          data={mixs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MixCard 
              mix={item} 
              onPress={() => playMix(item)} 
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Mini Player (à développer davantage) */}
      {currentMixId && (
        <ThemedView style={styles.miniPlayer}>
          <ThemedText>
            Now Playing: {mixs.find(m => m.id === currentMixId)?.title}
          </ThemedText>
          <TouchableOpacity
            onPress={async () => {
              if (sound) {
                await sound.unloadAsync();
                setCurrentMixId(null);
              }
            }}
          >
            <ThemedText>Stop</ThemedText>
          </TouchableOpacity>
        </ThemedView>
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
  listContent: {
    padding: 16,
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
    fontSize: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
  },
  tag: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 4,
  },
  tagText: {
    fontSize: 10,
  },
  miniPlayer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  }
}); 