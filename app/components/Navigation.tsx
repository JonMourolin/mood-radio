import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, useWindowDimensions } from 'react-native';
import { Link, usePathname } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';

const NAV_BREAKPOINT = 768;
const HEADER_HEIGHT = 65; // Estimate or calculate header height (paddingVert*2 + logoHeight)

export default function Navigation() {
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isMobileLayout = width < NAV_BREAKPOINT;

  const handleLinkPress = () => {
    setIsMenuOpen(false);
  };

  const renderNavLinks = (mobile = false) => (
    <View style={mobile ? styles.mobileNav : styles.nav}>
      <Link href="/moods" asChild onPress={handleLinkPress}>
        <TouchableOpacity style={mobile ? styles.mobileNavItem : styles.navItem}>
          <Ionicons 
            name="infinite"
            size={mobile ? 20 : 16} 
            color={(pathname === '/moods' || pathname.startsWith('/(tabs)/moods')) ? '#ffffff' : '#888888'}
            style={mobile ? styles.mobileMoodsIcon : styles.moodsIcon}
          />
          <Text style={[
            mobile ? styles.mobileNavText : styles.navText,
            (pathname === '/moods' || pathname.startsWith('/(tabs)/moods')) && (mobile ? styles.mobileNavTextActive : styles.navTextActive)
          ]}>
            Moods
          </Text>
        </TouchableOpacity>
      </Link>

      <Link href="/mixcloud" asChild onPress={handleLinkPress}>
        <TouchableOpacity style={mobile ? styles.mobileNavItem : styles.navItem}>
          <Feather 
            name="disc" 
            size={mobile ? 20 : 16} 
            color={(pathname === '/mixcloud' || pathname.startsWith('/(tabs)/mixcloud')) ? '#ffffff' : '#888888'}
            style={mobile ? styles.mobileMixesIcon : styles.mixesIcon}
          />
          <Text style={[
            mobile ? styles.mobileNavText : styles.navText,
            (pathname === '/mixcloud' || pathname.startsWith('/(tabs)/mixcloud')) && (mobile ? styles.mobileNavTextActive : styles.navTextActive)
          ]}>
            Mixes
          </Text>
        </TouchableOpacity>
      </Link>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/images/logo/logo1.png')}
            style={styles.logoImage} 
            resizeMode="contain"
          />
        </View>
        
        {!isMobileLayout && renderNavLinks()}
      </View>

      {isMobileLayout && (
        <TouchableOpacity onPress={() => setIsMenuOpen(!isMenuOpen)} style={styles.burgerButton}>
          <Feather name={isMenuOpen ? "x" : "menu"} size={28} color="#ffffff" />
        </TouchableOpacity>
      )}

      {isMobileLayout && isMenuOpen && (
        <View style={styles.dropdownMenu}>
          {renderNavLinks(true)} 
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8, // Reduced from 12
    backgroundColor: '#000000',
    zIndex: 10, // Ensure header is above dropdown if positioning gets tricky
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
    height: 40,
  },
  logoImage: {
    height: '100%',
    width: 200,
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
    color: '#888888',
    fontWeight: '500',
  },
  navTextActive: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  moodsIcon: {
    marginRight: 6,
  },
  mixesIcon: {
    marginRight: 6,
  },
  burgerButton: {
    padding: 8,
  },
  dropdownMenu: {
    position: 'absolute',
    top: HEADER_HEIGHT, // Position below header
    left: 0,
    right: 0,
    backgroundColor: '#000000', // Match header background
    paddingVertical: 15,
    paddingHorizontal: 16,
    zIndex: 5, // Below header container but above page content
  },
  mobileNav: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 15,
  },
  mobileNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  mobileNavText: {
    fontSize: 18,
    color: '#888888',
    fontWeight: '500',
  },
  mobileNavTextActive: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  mobileMoodsIcon: {
    marginRight: 10,
  },
  mobileMixesIcon: {
    marginRight: 10,
  },
}); 