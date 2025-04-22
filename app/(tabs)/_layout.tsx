import React from 'react';
import { Tabs, Slot } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '../../hooks/useThemeColor';
import { Platform, View } from 'react-native';

export default function TabLayout() {
  const tintColor = useThemeColor({ light: '#3b82f6', dark: '#60a5fa' }, 'tint');
  
  if (Platform.OS === 'web') {
    return <Slot />;
  }
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: tintColor,
        headerShown: true,
        tabBarStyle: {
          backgroundColor: '#000000',
          borderTopColor: '#333333',
        },
      }}
    >
      <Tabs.Screen
        name="radio"
        options={{
          title: 'Radio',
          tabBarIcon: ({ color }) => <Ionicons name="radio" size={24} color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="infinite"
        options={{
          title: 'Infinite',
          tabBarIcon: ({ color }) => <Ionicons name="infinite-outline" size={24} color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="mixcloud"
        options={{
          title: 'DJ Sets',
          tabBarIcon: ({ color }) => <Ionicons name="musical-notes" size={24} color={color} />,
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