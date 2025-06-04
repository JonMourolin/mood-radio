import React from 'react';
import { Tabs, Slot } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';

console.log('[TabsLayout] File loaded (full config)');

export default function TabLayout() {
  console.log('[TabsLayout] Component rendering (full config)');
  const activeTabColor = '#D22F49'; 
  
  if (Platform.OS === 'web') {
    return <Slot />;
  }
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeTabColor,
        headerShown: true,
        tabBarStyle: {
          backgroundColor: '#111111',
          borderTopColor: '#333333',
        },
      }}
    >
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