import { StyleSheet, Switch, TouchableOpacity, Alert, Platform } from 'react-native';
import React, { useState, useEffect, ReactNode } from 'react';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { StatusBar } from 'expo-status-bar';
import * as Application from 'expo-application';
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import { MaterialIcons } from '@expo/vector-icons';

// Types pour les composants de paramètres
interface SettingsSectionProps {
  title: string;
  children: ReactNode;
}

interface SwitchSettingProps {
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

interface ButtonSettingProps {
  title: string;
  description: string;
  onPress: () => void;
  iconName?: React.ComponentProps<typeof MaterialIcons>['name']; // Optionnel
}

// Section de paramètres
const SettingsSection = ({ title, children }: SettingsSectionProps) => (
  <ThemedView style={styles.section}>
    <ThemedText type="subtitle" style={styles.sectionTitle}>{title}</ThemedText>
    <ThemedView style={styles.sectionContent}>
      {children}
    </ThemedView>
  </ThemedView>
);

// Élément de paramètre avec switch
const SwitchSetting = ({ title, description, value, onValueChange }: SwitchSettingProps) => (
  <ThemedView style={styles.settingItem}>
    <ThemedView style={styles.settingInfo}>
      <ThemedText type="defaultSemiBold">{title}</ThemedText>
      <ThemedText style={styles.settingDescription}>{description}</ThemedText>
    </ThemedView>
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ 
        false: '#d1d1d6', 
        true: Platform.select({ ios: '#34c759', android: '#4CAF50' }) 
      }}
      thumbColor={Platform.select({ 
        ios: '#fff',
        android: value ? '#4CAF50' : '#f4f3f4'
      })}
    />
  </ThemedView>
);

// Élément de paramètre avec touche
const ButtonSetting = ({ title, description, onPress, iconName }: ButtonSettingProps) => (
  <TouchableOpacity style={styles.settingItem} onPress={onPress}>
    <ThemedView style={styles.settingInfo}>
      <ThemedText type="defaultSemiBold">{title}</ThemedText>
      <ThemedText style={styles.settingDescription}>{description}</ThemedText>
    </ThemedView>
    {iconName ? (
      <MaterialIcons size={20} name={iconName} color="#8e8e93" />
    ) : (
      <MaterialIcons size={20} name="chevron-right" color="#8e8e93" />
    )}
  </TouchableOpacity>
);

export default function SettingsScreen() {
  const [backgroundAudioEnabled, setBackgroundAudioEnabled] = useState(true);
  const [highQualityStreaming, setHighQualityStreaming] = useState(false);
  const [saveDataMode, setSaveDataMode] = useState(false);
  const [appVersion, setAppVersion] = useState('');

  // Charger la version de l'application
  useEffect(() => {
    const getAppVersion = async () => {
      const version = await Application.nativeApplicationVersion;
      const build = await Application.nativeBuildVersion;
      setAppVersion(`${version || '1.0.0'} (${build || '1'})`);
    };

    getAppVersion();
  }, []);

  // Gérer le changement de paramètre audio en arrière-plan
  const handleBackgroundAudioChange = async (value: boolean) => {
    setBackgroundAudioEnabled(value);
    
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: value,
      staysActiveInBackground: value,
      interruptionModeIOS: InterruptionModeIOS.DuckOthers,
      interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
    });
  };

  // Simulation de nettoyage du cache
  const handleClearCache = () => {
    Alert.alert(
      "Clear Cache",
      "This will clear all temporary files and might resolve playback issues. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Clear", 
          style: "destructive",
          onPress: () => {
            // Simuler un nettoyage
            Alert.alert("Success", "Cache has been cleared.");
          }
        }
      ]
    );
  };

  // Afficher les informations sur l'application
  const showAbout = () => {
    Alert.alert(
      "Jon Sound Library",
      `Version: ${appVersion}\n\nYour personal music streaming app for all your favorite radio stations and mixes.`,
      [{ text: "OK" }]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar style="auto" />
      <ThemedView style={styles.header}>
        <ThemedText type="title">Settings</ThemedText>
        <ThemedText>Customize your radio experience</ThemedText>
      </ThemedView>

      <SettingsSection title="Playback">
        <SwitchSetting
          title="Background Audio"
          description="Continue playback when the app is in the background"
          value={backgroundAudioEnabled}
          onValueChange={handleBackgroundAudioChange}
        />
        <SwitchSetting
          title="High Quality Streaming"
          description="Stream audio in highest quality (uses more data)"
          value={highQualityStreaming}
          onValueChange={setHighQualityStreaming}
        />
        <SwitchSetting
          title="Data Saver Mode"
          description="Reduce audio quality to save mobile data"
          value={saveDataMode}
          onValueChange={setSaveDataMode}
        />
      </SettingsSection>

      <SettingsSection title="App">
        <ButtonSetting
          title="Clear Cache"
          description="Free up space by removing temporary files"
          onPress={handleClearCache}
          iconName="delete"
        />
        <ButtonSetting
          title="About"
          description="Version information and acknowledgements"
          onPress={showAbout}
          iconName="info"
        />
      </SettingsSection>

      <ThemedView style={styles.versionInfo}>
        <ThemedText style={styles.versionText}>Jon Sound Library v{appVersion}</ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginHorizontal: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  sectionContent: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  settingInfo: {
    flex: 1,
    marginRight: 8,
  },
  settingDescription: {
    fontSize: 13,
    opacity: 0.6,
    marginTop: 2,
  },
  versionInfo: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 20,
  },
  versionText: {
    fontSize: 12,
    opacity: 0.5,
  },
}); 