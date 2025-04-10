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
          <Feather name="activity" size={24} color="#ffffff" style={styles.logoIcon} />
          <Text style={styles.logoText}>
            SONIC DRIFT RADIO
          </Text>
        </View>
        
        <View style={styles.nav}>
          <Link href="/radio" asChild>
            <TouchableOpacity style={styles.navItem}>
              <Text style={[
                styles.navText,
                (pathname === '/radio' || pathname.startsWith('/(tabs)/radio')) && styles.navTextActive
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
                color={(pathname === '/mixcloud' || pathname.startsWith('/(tabs)/mixcloud')) ? '#ffffff' : '#888888'}
                style={styles.mixesIcon}
              />
              <Text style={[
                styles.navText,
                (pathname === '/mixcloud' || pathname.startsWith('/(tabs)/mixcloud')) && styles.navTextActive
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flexShrink: 1,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    marginRight: 10,
    color: '#ffffff',
  },
  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navText: {
    fontSize: 16,
    color: '#888888',
    fontWeight: '500',
  },
  navTextActive: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  mixesIcon: {
    marginRight: 6,
  },
}); 