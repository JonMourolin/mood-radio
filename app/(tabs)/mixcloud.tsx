import { StyleSheet, View, FlatList, TouchableOpacity, Image, ActivityIndicator, Text, Linking, Platform, Modal, SafeAreaView } from 'react-native';
import React, { useState, useEffect } from 'react';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { getMixes, formatDuration } from '../../services/mixcloudService';
import { SimplifiedMix } from '@/types/mix';
import { WebView } from 'react-native-webview';

export default function MixcloudScreen() {
  const [mixes, setMixes] = useState<SimplifiedMix[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMix, setSelectedMix] = useState<SimplifiedMix | null>(null);
  const isWeb = Platform.OS === 'web';
  const styles = useStyles();

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

  // Function to render the list header (mobile only)
  const renderListHeader = () => {
    if (isWeb) return null; // Don't render header on web
    
    return (
      <View style={styles.listHeaderContainer}>
        <Text style={styles.listHeaderText}>Selected mixes</Text>
        <Ionicons name="headset-sharp" size={22} color="#D22F49" />
      </View>
    );
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
          
          {item.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {item.tags.slice(0, 3).map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <ThemedText style={styles.tagText}>{tag}</ThemedText>
                </View>
              ))}
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const RootComponent = isWeb ? ThemedView : SafeAreaView;

  return (
    <RootComponent style={styles.container}>
      {!isWeb && <StatusBar style="light" />}
      
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
          ListHeaderComponent={renderListHeader}
          contentContainerStyle={styles.mixList}
          showsVerticalScrollIndicator={false}
        />
      )}
      
      <Modal
        animationType="slide"
        transparent={true}
        visible={!!selectedMix}
        onRequestClose={() => {
          setSelectedMix(null);
        }}
      >
        <View style={styles.modalContainer}> 
          <View style={styles.modalPlayerContent}> 
            <View style={styles.modalHeader}>
                <ThemedText style={styles.modalTitle} numberOfLines={1}>{selectedMix?.title || 'Mix Player'}</ThemedText>
                <TouchableOpacity onPress={() => setSelectedMix(null)} style={styles.closeButton}>
                    <Ionicons name="close-circle" size={30} color="#ccc" />
                </TouchableOpacity>
            </View>
            
            {selectedMix && (
              Platform.OS === 'web' ? (
          <iframe
            title={selectedMix.title}
            width="100%"
            height="100%"
            src={selectedMix.embedUrl}
            frameBorder="0"
            allow="autoplay"
          ></iframe>
              ) : (
                <WebView
                  style={{ flex: 1 }} 
                  source={{ uri: selectedMix.embedUrl }}
                  allowsInlineMediaPlayback={true}
                  mediaPlaybackRequiresUserAction={false}
                  onError={(syntheticEvent) => {
                    const { nativeEvent } = syntheticEvent;
                    console.warn('WebView error: ', nativeEvent);
                    setError(`Erreur chargement player: ${nativeEvent.description}`);
                    setSelectedMix(null);
                  }}
                  onLoadProgress={({ nativeEvent }) => {
                     console.log("WebView Load Progress: ", nativeEvent.progress);
                  }}
                  onLoadEnd={() => console.log("WebView finished loading")}
                />
              )
            )}
          </View>
        </View>
      </Modal>

    </RootComponent>
  );
}

const useStyles = () => {
    const isWeb = Platform.OS === 'web';
    return StyleSheet.create({
  container: {
    flex: 1,
        paddingTop: 0, 
        backgroundColor: '#000000',
      },
      listHeaderContainer: {
          paddingHorizontal: 15,
          paddingVertical: 15,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-start', 
          backgroundColor: '#000000', 
      },
      listHeaderText: {
          color: '#FFFFFF',
          fontSize: 22, 
          fontWeight: '600',
          marginRight: 8,
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
        paddingHorizontal: 0,
        paddingBottom: 75,
  },
  mixCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  selectedMixCard: {
    borderColor: '#3b82f6',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 1,
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
        marginBottom: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tag: {
        backgroundColor: 'rgba(210, 47, 73, 0.2)',
        paddingHorizontal: 10,
        paddingVertical: 5,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
        color: '#FFFFFF',
  },
      playerContainer: {
        height: 160,
    marginTop: 12,
        marginHorizontal: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
        borderWidth: 1,
        borderColor: '#333',
      },
      modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
      },
      modalPlayerContent: {
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: '#1C1C1E',
      },
      modalHeader: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 15,
          paddingVertical: 10,
          paddingTop: Platform.OS === 'ios' ? 50 : 20,
          borderBottomWidth: 1,
          borderBottomColor: '#333',
          backgroundColor: '#1C1C1E',
      },
      modalTitle: {
          flex: 1,
          fontSize: 16,
          fontWeight: 'bold',
          marginRight: 10,
      },
      closeButton: {
  },
}); 
}; 