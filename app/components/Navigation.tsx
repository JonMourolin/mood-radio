import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Link, usePathname } from 'expo-router';
import { Feather } from '@expo/vector-icons';

export default function Navigation() {
  const pathname = usePathname();

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <View style={styles.logoContainer}>
          <Feather name="radio" size={24} color="#ff8000" style={styles.logoIcon} />
          <Text style={styles.logoText}>
            tangerine<Text style={styles.logoUnderscore}>_</Text>radio
          </Text>
        </View>
        
        <View style={styles.nav}>
          <Link href="/radio" asChild>
            <TouchableOpacity style={styles.navItem}>
              <Text style={[
                styles.navText,
                pathname === '/radio' && styles.navTextActive
              ]}>
                Radio
              </Text>
            </TouchableOpacity>
          </Link>

          <Link href="/mixcloud" asChild>
            <TouchableOpacity style={styles.navItem}>
              <Feather 
                name="disc" 
                size={16} 
                color={pathname === '/mixcloud' ? '#ff8000' : '#646b7a'} 
                style={styles.mixesIcon}
              />
              <Text style={[
                styles.navText,
                pathname === '/mixcloud' && styles.navTextActive
              ]}>
                Mixes
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#121418',
    borderBottomWidth: 1,
    borderBottomColor: '#1e2126',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 32,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    marginRight: 8,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
  },
  logoUnderscore: {
    color: '#ff8000',
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navText: {
    fontSize: 16,
    color: '#646b7a',
    fontWeight: '500',
  },
  navTextActive: {
    color: '#ff8000',
  },
  mixesIcon: {
    marginRight: 6,
  },
}); 