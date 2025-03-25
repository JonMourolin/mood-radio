import { StyleSheet } from 'react-native';
import React from 'react';
import { ThemedView } from '@/components/ThemedView';
import { StatusBar } from 'expo-status-bar';
import RadioPlayer from '@/components/RadioPlayer';

export default function RadioScreen() {
  return (
    <ThemedView style={styles.container}>
      <StatusBar style="auto" />
      <RadioPlayer />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
}); 