import { StyleSheet, View, FlatList, TouchableOpacity, Image, ActivityIndicator, Text, Linking, Platform } from 'react-native';
import React, { useState, useEffect } from 'react';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { SimplifiedMix, getMixes, formatDuration } from '../../services/mixcloudService';

export default function MixcloudScreen() {
  const [mixes, setMixes] = useState<SimplifiedMix[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMix, setSelectedMix] = useState<SimplifiedMix | null>(null);

  // Charger les mixes depuis l'API Mixcloud
  useEffect(() => {
    async function loadMixes() {
      try {
        setLoading(true);
        const mixesData = await getMixes();
        setMixes(mixesData);
        setError(null);
      } catch (err: any) {
        setError(`Erreur lors du chargement des mixes: ${err.message}`);
        console.error('Failed to load mixes:', err);
      } finally {
        setLoading(false);
      }
    }

    loadMixes();
  }, []);

  // Sélectionner un mix
  const handleSelectMix = (mix: SimplifiedMix) => {
    setSelectedMix(mix);
  };

  // Ouvrir le mix dans le navigateur
  const openInBrowser = (url: string) => {
    Linking.openURL(url);
  };

  // Rendu des mixes
  const renderMix = ({ item }: { item: SimplifiedMix }) => {
    const isSelected = selectedMix?.id === item.id;
    
    return (
      <TouchableOpacity 
        style={[styles.mixCard, isSelected && styles.selectedMixCard]} 
        onPress={() => handleSelectMix(item)}
        activeOpacity={0.7}
      >
        <Image 
          source={{ uri: item.coverUrl || 'https://www.mixcloud.com/img/share/mixcloud-1200x630.png' }} 
          style={styles.mixCover} 
          resizeMode="cover"
        />
        <View style={styles.mixInfo}>
          <ThemedText style={styles.mixTitle}>{item.title}</ThemedText>
          <ThemedText style={styles.mixDetails}>
            {formatDuration(item.durationInSeconds)} • {item.playCount} écoutes
          </ThemedText>
          
          {item.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {item.tags.slice(0, 3).map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <ThemedText style={styles.tagText}>{tag}</ThemedText>
                </View>
              ))}
            </View>
          )}
          
          {isSelected && (
            <TouchableOpacity 
              style={styles.listenButton} 
              onPress={() => openInBrowser(item.url)}
            >
              <Ionicons name="headset" size={18} color="#fff" />
              <Text style={styles.listenButtonText}>Écouter sur Mixcloud</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar style="auto" />
      <ThemedView style={styles.header}>
        <ThemedText type="title">Mixcloud DJ Sets</ThemedText>
        <ThemedText>Découvrez mes mixes sur Mixcloud</ThemedText>
      </ThemedView>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <ThemedText style={styles.loadingText}>Chargement des mixes...</ThemedText>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#ef4444" />
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </View>
      ) : mixes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="musical-notes" size={48} color="#9ca3af" />
          <ThemedText style={styles.emptyText}>Aucun mix trouvé</ThemedText>
        </View>
      ) : (
        <FlatList
          data={mixes}
          keyExtractor={item => item.id}
          renderItem={renderMix}
          contentContainerStyle={styles.mixList}
          showsVerticalScrollIndicator={false}
        />
      )}
      
      {selectedMix && Platform.OS === 'web' && (
        <View style={styles.iframeContainer}>
          <iframe
            title={selectedMix.title}
            width="100%"
            height="100%"
            src={selectedMix.embedUrl}
            frameBorder="0"
            allow="autoplay"
          ></iframe>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  header: {
    padding: 16,
    marginBottom: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
    color: '#ef4444',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#9ca3af',
  },
  mixList: {
    padding: 12,
  },
  mixCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedMixCard: {
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
  mixTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  mixDetails: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
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
  listenButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  listenButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  iframeContainer: {
    height: 160,
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
}); 