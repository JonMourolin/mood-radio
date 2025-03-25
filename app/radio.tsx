import { StyleSheet } from 'react-native';
import React from 'react';
import { ThemedView } from '../components/ThemedView';
import RadioPlayer from '../components/RadioPlayer';

export default function RadioScreen() {
  return (
    <ThemedView style={styles.container}>
      <RadioPlayer />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
}); 