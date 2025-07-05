import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';

export const Footer = () => {
  return (
    <View style={styles.footerContainer}>
      <ThemedText style={styles.logo}>∞</ThemedText>
      {/* <View style={styles.linksContainer}>
        <ThemedText style={styles.link}>ABOUT</ThemedText>
        <ThemedText style={styles.link}>FAQ</ThemedText>
        <ThemedText style={styles.link}>CONTACT</ThemedText>
      </View> */}
      <ThemedText style={styles.copyrightText}>
        Copyright © 2025 Mood Radio - All rights reserved.
      </ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  footerContainer: {
    paddingTop: 20,
    paddingBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  logo: {
    fontSize: 26,
    color: '#b30000',
    marginBottom: 10,
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
    fontSize: 10,
    color: '#6c757d',
  },
}); 