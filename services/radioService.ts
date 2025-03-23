import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export interface Stream {
  id: string;
  title: string;
  artist: string;
  url: string;
  genre?: string;
  description?: string;
}

export interface PlaybackStatus {
  isLoaded: boolean;
  isPlaying: boolean;
  isBuffering: boolean;
  error?: string;
}

// Configuration du serveur
const SERVER_IP = '51.75.200.205';
const SERVER_PORT = '8000';

// Liste des flux disponibles
export const AVAILABLE_STREAMS: Stream[] = [
  {
    id: 'costa-arenbi',
    title: 'Costa Arenbi Mix',
    artist: 'Costa DJ',
    url: `http://${SERVER_IP}:${SERVER_PORT}/costa-arenbi.mp3`,
    genre: 'DJ Sets',
    description: 'Long mixes by Costa DJ'
  },
  {
    id: 'mamene-break',
    title: 'Mamene Break',
    artist: 'DJ Mamene',
    url: `http://${SERVER_IP}:${SERVER_PORT}/mamene-break.mp3`,
    genre: 'Tech House',
    description: 'Tech house mixes by DJ Mamene'
  },
  {
    id: 'mamene-break-2',
    title: 'Mamene Break 2',
    artist: 'DJ Mamene',
    url: `http://${SERVER_IP}:${SERVER_PORT}/mamene-break-2.mp3`,
    genre: 'Breakbeat',
    description: 'Breakbeat mixes by DJ Mamene'
  },
  {
    id: 'radio',
    title: 'Web Radio Mixes',
    artist: 'Various Artists',
    url: `http://${SERVER_IP}:${SERVER_PORT}/radio.mp3`,
    genre: 'Mixed',
    description: 'Rotation of all DJ mixes'
  }
];

// Clé pour le stockage
const LAST_PLAYED_STREAM_KEY = 'lastPlayedStreamId';

// Classe de service pour gérer la radio
class RadioService {
  private sound: Audio.Sound | null = null;
  private currentStream: Stream | null = null;
  
  constructor() {
    // Configuration de l'audio pour le mode arrière-plan
    this.setupAudioMode();
  }

  private async setupAudioMode() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
        playThroughEarpieceAndroid: false
      });
      console.log('Audio mode configured for background playback');
    } catch (error) {
      console.error('Failed to configure audio mode:', error);
    }
  }

  // Obtenir tous les flux disponibles
  getAvailableStreams(): Stream[] {
    return AVAILABLE_STREAMS;
  }

  // Obtenir le dernier flux joué (depuis le stockage local)
  async getLastPlayedStream(): Promise<Stream | null> {
    try {
      const savedStreamId = await AsyncStorage.getItem(LAST_PLAYED_STREAM_KEY);
      if (savedStreamId) {
        const stream = AVAILABLE_STREAMS.find(s => s.id === savedStreamId);
        return stream || null;
      }
      return null;
    } catch (error) {
      console.error('Error retrieving last played stream:', error);
      return null;
    }
  }

  // Sauvegarder le dernier flux joué
  async saveLastPlayedStream(streamId: string): Promise<void> {
    try {
      await AsyncStorage.setItem(LAST_PLAYED_STREAM_KEY, streamId);
    } catch (error) {
      console.error('Error saving last played stream:', error);
    }
  }

  // Jouer un flux
  async playStream(stream: Stream, 
    onPlaybackStatusUpdate?: (status: PlaybackStatus) => void): Promise<void> {
    try {
      console.log(`Loading stream: ${stream.url}`);

      // Arrêter la lecture en cours s'il y en a une
      if (this.sound) {
        await this.sound.unloadAsync();
        this.sound = null;
      }

      // Créer et charger le nouveau son
      const { sound } = await Audio.Sound.createAsync(
        { uri: stream.url },
        { shouldPlay: true, volume: 1.0 },
        this.createStatusUpdateCallback(onPlaybackStatusUpdate)
      );
      
      this.sound = sound;
      this.currentStream = stream;
      
      // Sauvegarder l'ID du flux
      await this.saveLastPlayedStream(stream.id);
      
      console.log(`Now playing: ${stream.title} by ${stream.artist}`);
    } catch (error) {
      console.error('Error playing stream:', error);
      throw error;
    }
  }

  // Créer un callback pour les mises à jour du statut
  private createStatusUpdateCallback(
    callback?: (status: PlaybackStatus) => void
  ) {
    return (status: any) => {
      if (status.isLoaded) {
        const playbackStatus: PlaybackStatus = {
          isLoaded: status.isLoaded,
          isPlaying: status.isPlaying,
          isBuffering: status.isBuffering
        };
        
        if (callback) {
          callback(playbackStatus);
        }
      } else if (status.error) {
        console.error(`Playback error: ${status.error}`);
        const errorStatus: PlaybackStatus = {
          isLoaded: false,
          isPlaying: false,
          isBuffering: false,
          error: status.error
        };
        
        if (callback) {
          callback(errorStatus);
        }
      }
    };
  }

  // Mettre en pause ou reprendre la lecture
  async togglePlayback(): Promise<boolean> {
    if (!this.sound) return false;
    
    try {
      const status = await this.sound.getStatusAsync();
      
      if (status.isLoaded) {
        if (status.isPlaying) {
          await this.sound.pauseAsync();
          return false;
        } else {
          await this.sound.playAsync();
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error toggling playback:', error);
      return false;
    }
  }

  // Arrêter la lecture
  async stopPlayback(): Promise<void> {
    if (this.sound) {
      try {
        await this.sound.unloadAsync();
        this.sound = null;
        this.currentStream = null;
      } catch (error) {
        console.error('Error stopping playback:', error);
      }
    }
  }

  // Obtenir le flux actuel
  getCurrentStream(): Stream | null {
    return this.currentStream;
  }

  // Vérifier si un flux est en cours de lecture
  async isPlaying(): Promise<boolean> {
    if (!this.sound) return false;
    
    try {
      const status = await this.sound.getStatusAsync();
      return status.isLoaded && status.isPlaying;
    } catch (error) {
      console.error('Error checking playback status:', error);
      return false;
    }
  }
}

// Exporter une instance unique du service
export const radioService = new RadioService(); 