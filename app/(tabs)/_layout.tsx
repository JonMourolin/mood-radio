import React from 'react';
import { Slot } from 'expo-router';

console.log('[TabsLayout] File loaded (no tabs - single screen)');

export default function TabLayout() {
  console.log('[TabsLayout] Component rendering (no tabs - single screen)');
  
  // Since we only have one active screen (live), we don't need tabs
  // Return Slot for all platforms to remove the tab bar completely
  return <Slot />;
} 