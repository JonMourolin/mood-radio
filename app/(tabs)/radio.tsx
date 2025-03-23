import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import RadioPlayer from '@/components/RadioPlayer';

export default function RadioScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <RadioPlayer />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 