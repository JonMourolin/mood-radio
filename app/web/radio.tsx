import React from 'react';
import { ThemedView } from '../../components/ThemedView';
import RadioPlayer from '../../components/RadioPlayer';

export default function RadioScreen() {
  return (
    <ThemedView style={{ padding: 20 }}>
      <RadioPlayer />
    </ThemedView>
  );
} 