import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';

export const Footer = () => {
  return (
    <View style={styles.footerContainer}>
      <ThemedText style={styles.logo}>∞</ThemedText>
      <View style={styles.linksContainer}>
        <ThemedText style={styles.link}>ABOUT</ThemedText>
        <ThemedText style={styles.link}>FAQ</ThemedText>
        <ThemedText style={styles.link}>CONTACT</ThemedText>
      </View>
      <ThemedText style={styles.copyrightText}>
        Copyright © 2025 - All rights reserved. Made with ☕️ by Jon.
      </ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  footerContainer: {
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  logo: {
    fontSize: 48,
    color: '#b30000',
    marginBottom: 20,
  },
  linksContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  link: {
    marginHorizontal: 15,
    fontSize: 14,
    color: '#a0a0a0',
  },
  copyrightText: {
    fontSize: 12,
    color: '#6c757d',
  },
}); 