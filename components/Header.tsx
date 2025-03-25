import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link, usePathname } from 'expo-router';
import { ThemedView } from './ThemedView';
import { StatusBar } from 'expo-status-bar';

interface HeaderProps {
  onToggleTheme?: () => void;
}

export default function Header({ onToggleTheme }: HeaderProps) {
  const colorScheme = useColorScheme();
  const pathname = usePathname();
  const isDark = colorScheme === 'dark';
  
  // Déterminer quel onglet est actif
  const isRadioActive = pathname === '/' || pathname === '/radio';
  const isMixesActive = pathname === '/mixcloud';
  
  return (
    <ThemedView style={[
      styles.container, 
      { backgroundColor: isDark ? '#111' : '#000' }
    ]}>
      <StatusBar style="light" />
      
      {/* Logo et nom */}
      <View style={styles.logoContainer}>
        <Ionicons name="radio" size={22} color="#ff6b00" />
        <Text style={styles.logoText}>
          <Text style={styles.logoTextHighlight}>web</Text> radio
        </Text>
      </View>
      
      {/* Navigation */}
      <View style={styles.navContainer}>
        <Link href="/radio" asChild>
          <TouchableOpacity 
            style={[styles.navItem, isRadioActive && styles.activeNavItem]}
          >
            <Text 
              style={[
                styles.navText, 
                isRadioActive && styles.activeNavText
              ]}
            >
              Radio
            </Text>
          </TouchableOpacity>
        </Link>
        
        <Link href="/mixcloud" asChild>
          <TouchableOpacity 
            style={[styles.navItem, isMixesActive && styles.activeNavItem]}
          >
            <Text 
              style={[
                styles.navText, 
                isMixesActive && styles.activeNavText
              ]}
            >
              Mixes
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
      
      {/* Bouton de thème */}
      <TouchableOpacity 
        style={styles.themeButton} 
        onPress={onToggleTheme}
      >
        <Ionicons 
          name={isDark ? 'sunny' : 'moon'} 
          size={22} 
          color="#fff" 
        />
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  logoTextHighlight: {
    color: '#ff6b00',
  },
  navContainer: {
    flexDirection: 'row',
    position: 'absolute',
    left: 0,
    right: 0,
    justifyContent: 'center',
    zIndex: -1,
  },
  navItem: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginHorizontal: 2,
    borderRadius: 20,
  },
  activeNavItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  navText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 15,
    fontWeight: '500',
  },
  activeNavText: {
    color: '#fff',
  },
  themeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 