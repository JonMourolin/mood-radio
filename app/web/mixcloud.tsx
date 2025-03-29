import React, { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, Image, ActivityIndicator, Text, Linking, Platform } from 'react-native';
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

  useEffect(() => {
    async function loadMixes() {
      try {
        setLoading(true);
        const mixesData = await getMixes();
        setMixes(mixesData);
      } catch (err) {
        setError('Erreur lors du chargement des mixes');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadMixes();
  }, []);

  const handleSelectMix = (mix: SimplifiedMix) => {
    setSelectedMix(mix);
  };

  const openInBrowser = (url: string) => {
    Linking.openURL(url);
  };

  const renderMix = ({ item }: { item: SimplifiedMix }) => (
    <TouchableOpacity
      onPress={() => handleSelectMix(item)}
      style={{
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <Image
        source={{ uri: item.coverUrl }}
        style={{ width: 60, height: 60, borderRadius: 5 }}
      />
      <View style={{ marginLeft: 15, flex: 1 }}>
        <ThemedText style={{ fontSize: 16, fontWeight: 'bold' }}>
          {item.title}
        </ThemedText>
        <ThemedText style={{ fontSize: 14, color: '#666' }}>
          {formatDuration(item.durationInSeconds)}
        </ThemedText>
      </View>
      <TouchableOpacity onPress={() => openInBrowser(item.url)}>
        <Ionicons name="open-outline" size={24} color="#666" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ThemedText style={{ color: 'red' }}>{error}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <StatusBar style="auto" />
      <FlatList
        data={mixes}
        renderItem={renderMix}
        keyExtractor={(item) => item.url}
        contentContainerStyle={{ padding: 15 }}
      />
    </ThemedView>
  );
} 