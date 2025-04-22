import { Stack } from 'expo-router';
import { View, Platform } from 'react-native';
import Navigation from './components/Navigation';

export default function Layout() {
  return (
    <View style={{ flex: 1, backgroundColor: '#121418' }}>
      {Platform.OS === 'web' && <Navigation />}
      <Stack 
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#121418' }
        }}
      />
    </View>
  );
}
