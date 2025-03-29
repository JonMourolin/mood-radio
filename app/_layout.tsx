import { Stack } from 'expo-router';
import { View } from 'react-native';
import Navigation from './components/Navigation';

export default function Layout() {
  return (
    <View style={{ flex: 1, backgroundColor: '#121418' }}>
      <Navigation />
      <Stack 
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#121418' }
        }}
      />
    </View>
  );
}
