import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View, Image, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { StreamData } from '@/types/player';

interface MiniPlayerProps {
  mix: StreamData | null;
  sound: Audio.Sound | null;
  onClose: () => void;
}

export default function MiniPlayer({ mix, sound, onClose }: MiniPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (sound) {
      // Configurer les événements du son
      const updatePlaybackStatus = async () => {
        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
          setIsPlaying(status.isPlaying);
          setPosition(status.positionMillis / 1000);
          setDuration(status.durationMillis ? status.durationMillis / 1000 : 0);
        }
      };

      // Mettre à jour toutes les secondes
      const interval = setInterval(updatePlaybackStatus, 1000);

      // Clean up
      return () => clearInterval(interval);
    }
  }, [sound]);

  // Formater la durée en format mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Calculer le pourcentage de progression
  const progressPercentage = duration > 0 ? (position / duration) * 100 : 0;

  const togglePlayPause = async () => {
    if (!sound) return;

    const status = await sound.getStatusAsync();
    if (status.isLoaded) {
      if (status.isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
    }
  };

  const handleClose = async () => {
    if (sound) {
      await sound.stopAsync();
    }
    onClose(); // Appelle la fonction originale pour fermer le lecteur
  };

  if (!mix) return null;

  return (
    <ThemedView style={styles.container}>
      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill, 
            { width: `${progressPercentage}%` }
          ]} 
        />
      </View>
      
      <View style={styles.content}>
        <Image 
          source={mix.imageUrl} 
          style={styles.cover} 
        />
        
        <View style={styles.info}>
          <ThemedText type="subtitle" numberOfLines={1}>
            {mix.title}
          </ThemedText>
          <ThemedText numberOfLines={1}>
            {mix.description}
          </ThemedText>
        </View>
        
        <View style={styles.controls}>
          <TouchableOpacity onPress={togglePlayPause}>
            <MaterialIcons 
              name={isPlaying ? "pause" : "play-arrow"} 
              size={32} 
              color="#fff" 
            />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.timeInfo}>
        <ThemedText style={styles.timeText}>
          {formatTime(position)}
        </ThemedText>
        <ThemedText style={styles.timeText}>
          {formatTime(duration)}
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#222',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingBottom: 20, // Extra padding for bottom safe area
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  progressBar: {
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: '100%',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6', // Blue color
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  cover: {
    width: 50,
    height: 50,
    borderRadius: 4,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeButton: {
    marginLeft: 16,
  },
  timeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginTop: -5,
    marginBottom: 5,
  },
  timeText: {
    fontSize: 12,
    color: '#999',
  }
}); 