import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { getTracks, deleteTrack, Track } from '../../services/trackService';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '../../hooks/useColorScheme';

export default function AdminTracksScreen() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const colorScheme = useColorScheme();

  // Charger les pistes au montage du composant
  useEffect(() => {
    loadTracks();
  }, []);

  // Fonction pour charger les pistes
  const loadTracks = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedTracks = await getTracks();
      setTracks(fetchedTracks);
    } catch (err) {
      setError('Erreur lors du chargement des pistes');
      console.error('Error loading tracks:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour supprimer une piste
  const handleDeleteTrack = async (track: Track) => {
    Alert.alert(
      'Confirmer la suppression',
      `Êtes-vous sûr de vouloir supprimer "${track.title}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTrack(track.id);
              // Recharger la liste après suppression
              loadTracks();
            } catch (err) {
              Alert.alert('Erreur', 'Impossible de supprimer la piste');
              console.error('Error deleting track:', err);
            }
          },
        },
      ]
    );
  };

  // Fonction pour formater la durée
  const formatDuration = (duration: number) => {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Chargement...</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.errorText}>{error}</ThemedText>
        <TouchableOpacity style={styles.retryButton} onPress={loadTracks}>
          <ThemedText>Réessayer</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Gestion des pistes</ThemedText>
      </View>

      <ScrollView style={styles.trackList}>
        {tracks.map((track) => (
          <View key={track.id} style={styles.trackItem}>
            <View style={styles.trackInfo}>
              <ThemedText style={styles.trackTitle}>{track.title}</ThemedText>
              <ThemedText style={styles.trackDetails}>
                Durée: {formatDuration(track.duration)} • Ajouté le: {new Date(track.addedAt).toLocaleDateString()}
              </ThemedText>
            </View>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteTrack(track)}
            >
              <Ionicons 
                name="trash-outline" 
                size={24} 
                color={colorScheme === 'dark' ? '#ff4444' : '#cc0000'} 
              />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  trackList: {
    flex: 1,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  trackDetails: {
    fontSize: 14,
    opacity: 0.7,
  },
  deleteButton: {
    padding: 8,
  },
  errorText: {
    color: '#ff4444',
    marginBottom: 16,
  },
  retryButton: {
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 8,
    alignItems: 'center',
  },
}); 