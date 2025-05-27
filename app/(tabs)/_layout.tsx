import React from 'react';
import { Tabs, Slot } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
// import { useThemeColor } from '../../hooks/useThemeColor'; // No longer needed for tint
import { Platform, View } from 'react-native';

console.log('[TabsLayout] File loaded');

export default function TabLayout() {
  console.log('[TabsLayout] Component rendering');
  // const tintColor = useThemeColor({ light: '#3b82f6', dark: '#60a5fa' }, 'tint'); // Remove this line
  const activeTabColor = '#D22F49'; // Define the desired color
  
  if (Platform.OS === 'web') {
    return <Slot />;
  }
  
  return (
    <Tabs
      screenOptions={{
        // tabBarActiveTintColor: tintColor, // Use the new static color
        tabBarActiveTintColor: activeTabColor,
        headerShown: true,
        tabBarStyle: {
          backgroundColor: '#111111',
          borderTopColor: '#333333',
        },
      }}
    >
      {/* <Tabs.Screen
        name="radio"
        options={{
          title: 'Radio',
          tabBarIcon: ({ color }) => <Ionicons name="radio" size={24} color={color} />,
          headerShown: false,
        }}
      /> */}
      <Tabs.Screen
        name="moods"
        options={{
          title: 'Moods',
          tabBarIcon: ({ color }) => <Ionicons name="infinite-outline" size={24} color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="mixcloud"
        options={{
          title: 'Mixes',
          tabBarIcon: ({ color }) => <Ionicons name="headset-sharp" size={24} color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Paramètres',
          tabBarIcon: ({ color }) => <Ionicons name="settings" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
} 