import React, { useCallback, useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { View, Platform } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import Navigation from './components/Navigation';
import { PlayerProvider } from '@/context/PlayerContext';

console.log('[RootLayout] File loaded');

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  console.log('[RootLayout] Component rendering');
  // We'll use simple readiness flags for now
  const [appIsReady, setAppIsReady] = useState(false);
  const [rootViewRendered, setRootViewRendered] = useState(false);

  useEffect(() => {
    console.log('[RootLayout] useEffect running');
    // Simulate app preparation (e.g., loading assets, fonts)
    async function prepare() {
      try {
        // In a real app, you'd await things like Font.loadAsync here
        console.log("Simulating app preparation...");
        await new Promise(resolve => setTimeout(resolve, 1000)); // Example delay
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
        console.log("App is marked as ready.");
      }
    }
    prepare();
  }, []);

  // Callback for the root view's onLayout prop
  const onLayoutRootView = useCallback(async () => {
    console.log("Root view layout finished.");
    setRootViewRendered(true);
    if (appIsReady) {
      console.log("Hiding splash screen (onLayout). App was already ready.");
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]); // Depend on appIsReady

  // Hide splash if layout finishes *after* app is ready
  useEffect(() => {
    if (appIsReady && rootViewRendered) {
      console.log("Hiding splash screen (useEffect). Layout was already ready.");
      SplashScreen.hideAsync();
    }
  }, [appIsReady, rootViewRendered]);

  // Only render the main layout once the splash screen is ready to be hidden
  // or has already been hidden (appIsReady && rootViewRendered)
  if (!appIsReady || !rootViewRendered) {
     console.log(`App not ready/rendered yet: appIsReady=${appIsReady}, rootViewRendered=${rootViewRendered}. Splash should be visible.`);
    // Return null while the splash screen is visible and the app is preparing/rendering
    // We attach onLayout to a temporary View ONLY WHEN appIsReady is true but layout isn't
    // This ensures onLayout fires correctly after prepare() finishes
    return appIsReady ? <View style={{flex: 1}} onLayout={onLayoutRootView} /> : null;
  }

  // App is ready and root view has rendered, render the actual layout
  console.log("Rendering main app layout.");
  return (
    <PlayerProvider>
      {/* Attach onLayout here to the final root view */}
      <View style={{ flex: 1, backgroundColor: '#121418' }} onLayout={onLayoutRootView}>
        {Platform.OS === 'web' && <Navigation />}
        <Stack 
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#121418' }
          }}
        />
      </View>
    </PlayerProvider>
  );
}
