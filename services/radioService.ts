import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Types
export interface Stream {
  id: string;
  title: string;
  artist: string;
  url: string;
  genre?: string;
  description?: string;
  bitrate?: number;
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
    id: 'radio',
    title: 'Web Radio Mixes',
    artist: 'Various Artists',
    url: `http://${SERVER_IP}:${SERVER_PORT}/webradio.mp3`,
    genre: 'Mixed',
    description: 'Rotation of all DJ mixes',
    bitrate: 320
  }
];

// Clé pour le stockage
const LAST_PLAYED_STREAM_KEY = 'lastPlayedStreamId';

// Variable pour stocker l'élément audio HTML pour le web
let webAudioElement: HTMLAudioElement | null = null;

// Variable pour suivre si une lecture est en cours (pour éviter les doubles lectures)
let isPlaybackInProgress = false;

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
  async playStream(
    stream: Stream, 
    onPlaybackStatusUpdate?: (status: PlaybackStatus) => void
  ): Promise<void> {
    try {
      // Protection contre les appels multiples
      if (isPlaybackInProgress) {
        console.log('Playback already in progress, ignoring call');
        return;
      }
      
      isPlaybackInProgress = true;
      
      console.log(`Starting playback of: ${stream.title}`);
      
      // Arrêter la lecture en cours
      await this.stopPlayback();
      
      // Gestion spéciale pour la plateforme web
      if (Platform.OS === 'web') {
        console.log('Using web-specific audio implementation');
        
        // Nettoyer l'ancien élément audio s'il existe
        if (webAudioElement) {
          webAudioElement.pause();
          webAudioElement.src = '';
          webAudioElement.load();
          if (webAudioElement.parentNode) {
            webAudioElement.parentNode.removeChild(webAudioElement);
          }
          webAudioElement = null;
        }
        
        // Créer un nouvel élément audio
        const audioElement = document.createElement('audio');
        audioElement.id = 'web-radio-player';
        audioElement.style.display = 'none';
        audioElement.preload = 'auto';
        
        document.body.appendChild(audioElement);
        webAudioElement = audioElement;
        
        // Configurer les événements
        audioElement.onloadedmetadata = () => {
          console.log('Audio metadata loaded');
        };
        
        audioElement.oncanplay = () => {
          console.log('Audio can play, starting playback');
          const playPromise = audioElement.play();
          if (playPromise !== undefined) {
            playPromise.catch(error => {
              console.error('Playback error:', error);
              if (onPlaybackStatusUpdate) {
                onPlaybackStatusUpdate({
                  isLoaded: false,
                  isPlaying: false,
                  isBuffering: false,
                  error: error.message
                });
              }
            });
          }
        };
        
        audioElement.onplaying = () => {
          console.log('Audio is now playing');
          if (onPlaybackStatusUpdate) {
            onPlaybackStatusUpdate({
              isLoaded: true,
              isPlaying: true,
              isBuffering: false
            });
          }
        };
        
        audioElement.onwaiting = () => {
          console.log('Audio is buffering');
          if (onPlaybackStatusUpdate) {
            onPlaybackStatusUpdate({
              isLoaded: true,
              isPlaying: false,
              isBuffering: true
            });
          }
        };
        
        audioElement.onerror = (e) => {
          console.error('Audio error:', e);
          if (onPlaybackStatusUpdate) {
            onPlaybackStatusUpdate({
              isLoaded: false,
              isPlaying: false,
              isBuffering: false,
              error: 'Error loading audio'
            });
          }
        };
        
        // Définir la source et charger le fichier
        audioElement.src = stream.url;
        audioElement.load();
      } else {
        // Pour les plateformes mobiles, utiliser Expo AV
        console.log('Using Expo AV implementation');
        const { sound } = await Audio.Sound.createAsync(
          { uri: stream.url },
          { shouldPlay: true, volume: 1.0 },
          this.createStatusUpdateCallback(onPlaybackStatusUpdate)
        );
        
        this.sound = sound;
      }
      
      // Mettre à jour l'état
      this.currentStream = stream;
      await this.saveLastPlayedStream(stream.id);
      
      console.log(`Now playing: ${stream.title} by ${stream.artist}`);
      
      isPlaybackInProgress = false;
    } catch (error) {
      isPlaybackInProgress = false;
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
    if (Platform.OS === 'web' && webAudioElement) {
      if (webAudioElement.paused) {
        webAudioElement.play();
        return true;
      } else {
        webAudioElement.pause();
        return false;
      }
    } else if (this.sound) {
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
      } catch (error) {
        console.error('Error toggling playback:', error);
      }
    }
    return false;
  }

  // Régler le volume (0 à 1)
  async setVolume(volume: number): Promise<void> {
    const safeVolume = Math.max(0, Math.min(1, volume));
    
    if (Platform.OS === 'web' && webAudioElement) {
      webAudioElement.volume = safeVolume;
    } else if (this.sound) {
      try {
        await this.sound.setVolumeAsync(safeVolume);
      } catch (error) {
        console.error('Error setting volume:', error);
        throw error;
      }
    }
  }

  // Arrêter la lecture
  async stopPlayback(): Promise<void> {
    // Arrêter l'audio web si actif
    if (Platform.OS === 'web' && webAudioElement) {
      webAudioElement.pause();
      webAudioElement.src = '';
      webAudioElement.load();
      if (webAudioElement.parentNode) {
        webAudioElement.parentNode.removeChild(webAudioElement);
      }
      webAudioElement = null;
    }
    
    // Arrêter l'audio Expo si actif
    if (this.sound) {
      try {
        await this.sound.unloadAsync();
        this.sound = null;
      } catch (error) {
        console.error('Error stopping playback:', error);
      }
    }
    
    this.currentStream = null;
  }

  // Obtenir le flux actuel
  getCurrentStream(): Stream | null {
    return this.currentStream;
  }

  // Vérifier si un flux est en cours de lecture
  async isPlaying(): Promise<boolean> {
    if (Platform.OS === 'web' && webAudioElement) {
      return !webAudioElement.paused;
    } else if (this.sound) {
      try {
        const status = await this.sound.getStatusAsync();
        return status.isLoaded && status.isPlaying;
      } catch (error) {
        console.error('Error checking playback status:', error);
      }
    }
    return false;
  }
}

// Exporter une instance unique du service
export const radioService = new RadioService();