import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from './ThemedText';
import { usePlayerContext } from '@/context/PlayerContext';

export const Footer = () => {
  const { currentMetadata, openDiscoveryModal } = usePlayerContext();

  const handlePress = () => {
    if (currentMetadata && currentMetadata.song) {
      openDiscoveryModal();
    }
  };

  const isDiscoveryAvailable = !!(currentMetadata && currentMetadata.song);

  return (
    <TouchableOpacity onPress={handlePress} disabled={!isDiscoveryAvailable}>
      <View style={styles.footerContainer}>
        <ThemedText style={[styles.logo, !isDiscoveryAvailable && styles.logoDisabled]}>∞</ThemedText>
        <ThemedText style={styles.copyrightText}>
          Copyright © 2025 Mood Radio - All rights reserved.
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  footerContainer: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
    cursor: 'pointer',
  },
  logoDisabled: {
    color: '#555555',
    cursor: 'default',
  },
  copyrightText: {
    fontSize: 12,
    color: '#888888',
  },
}); 