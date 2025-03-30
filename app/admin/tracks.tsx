import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Alert, Modal, TextInput, Image } from 'react-native';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { getTracks, deleteTrack, Track, searchDiscogsReleases, DiscogsSearchResult } from '../../services/trackService';
import { writeMetadataToFile } from '../../services/audioMetadataService';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '../../hooks/useColorScheme';
import { API_URL } from '../config';

export default function AdminTracksScreen() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DiscogsSearchResult[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [showSearchModal, setShowSearchModal] = useState(false);
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

  // Fonction pour rechercher sur Discogs
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      const results = await searchDiscogsReleases(searchQuery);
      setSearchResults(results);
    } catch (err) {
      Alert.alert('Erreur', 'Impossible de rechercher sur Discogs');
      console.error('Error searching Discogs:', err);
    }
  };

  // Fonction pour enrichir une piste
  const handleEnrichTrack = async (track: Track, discogsData: DiscogsSearchResult) => {
    try {
      console.log('Track data:', track);
      console.log('Discogs data:', discogsData);
      
      const requestData = {
        path: track.path || '',
        metadata: {
          title: discogsData.title,
          artist: discogsData.artist,
          album: discogsData.album,
          year: discogsData.year,
        }
      };
      
      console.log('Sending request data:', requestData);
      console.log('API URL:', `${API_URL}/tracks/${track.id}/metadata`);
      
      const response = await fetch(`${API_URL}/tracks/${track.id}/metadata`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Recharger la liste
      loadTracks();
      setShowSearchModal(false);
      setSelectedTrack(null);
      setSearchQuery('');
      setSearchResults([]);

      Alert.alert('Succès', 'Métadonnées mises à jour avec succès');
    } catch (err) {
      Alert.alert('Erreur', 'Impossible de mettre à jour les métadonnées');
      console.error('Error updating metadata:', err);
    }
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
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  setSelectedTrack(track);
                  setShowSearchModal(true);
                }}
              >
                <Ionicons 
                  name="search-outline" 
                  size={24} 
                  color={colorScheme === 'dark' ? '#4CAF50' : '#2E7D32'} 
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleDeleteTrack(track)}
              >
                <Ionicons 
                  name="trash-outline" 
                  size={24} 
                  color={colorScheme === 'dark' ? '#ff4444' : '#cc0000'} 
                />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Modal de recherche Discogs */}
      <Modal
        visible={showSearchModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>
                Enrichir "{selectedTrack?.title}"
              </ThemedText>
              <TouchableOpacity
                onPress={() => {
                  setShowSearchModal(false);
                  setSelectedTrack(null);
                  setSearchQuery('');
                  setSearchResults([]);
                }}
              >
                <Ionicons name="close" size={24} color={colorScheme === 'dark' ? '#fff' : '#000'} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Rechercher sur Discogs..."
                placeholderTextColor={colorScheme === 'dark' ? '#666' : '#999'}
                onSubmitEditing={handleSearch}
              />
              <TouchableOpacity
                style={styles.searchButton}
                onPress={handleSearch}
              >
                <Ionicons name="search" size={20} color={colorScheme === 'dark' ? '#fff' : '#000'} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.searchResults}>
              {searchResults.map((result) => (
                <TouchableOpacity
                  key={result.id}
                  style={styles.searchResultItem}
                  onPress={() => handleEnrichTrack(selectedTrack!, result)}
                >
                  <Image
                    source={{ uri: result.coverUrl }}
                    style={styles.resultCover}
                  />
                  <View style={styles.resultInfo}>
                    <ThemedText style={styles.resultTitle}>{result.title}</ThemedText>
                    <ThemedText style={styles.resultArtist}>{result.artist}</ThemedText>
                    <ThemedText style={styles.resultAlbum}>{result.album} ({result.year})</ThemedText>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
  },
  searchButton: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
  },
  searchResults: {
    flex: 1,
  },
  searchResultItem: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  resultCover: {
    width: 60,
    height: 60,
    borderRadius: 4,
    marginRight: 10,
  },
  resultInfo: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  resultArtist: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 2,
  },
  resultAlbum: {
    fontSize: 12,
    opacity: 0.6,
  },
}); 