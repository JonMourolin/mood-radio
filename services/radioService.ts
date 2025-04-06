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
// Supprimé car nous utilisons maintenant AzuraCast
// const SERVER_IP = '51.75.200.205';
// const SERVER_PORT = '8000';

// Liste des flux disponibles
export const AVAILABLE_STREAMS: Stream[] = [
  {
    id: 'tangerine_radio',
    title: 'Tangerine Radio',
    artist: 'AzuraCast AutoDJ',
    url: 'http://51.75.200.205/listen/tangerine_radio/radio.mp3',
    genre: 'Mixed',
    description: 'Live stream from AzuraCast',
    bitrate: 192
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
  private onPlaybackStatusUpdateCallback?: (status: PlaybackStatus) => void;
  
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
    this.onPlaybackStatusUpdateCallback = onPlaybackStatusUpdate;
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
          console.log('Web: Audio metadata loaded');
        };
        
        audioElement.oncanplay = () => {
          console.log('Web: Audio can play, attempting playback');
          // Démarrage automatique de la lecture
          const playPromise = audioElement.play();
          if (playPromise !== undefined) {
            playPromise.catch(error => {
              console.error('Web: Autoplay error:', error);
              if (this.onPlaybackStatusUpdateCallback) {
                this.onPlaybackStatusUpdateCallback({
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
          console.log('Web: Audio is now playing');
           if (this.onPlaybackStatusUpdateCallback) {
            this.onPlaybackStatusUpdateCallback({
              isLoaded: true,
              isPlaying: true,
              isBuffering: false
            });
          }
        };
        
        audioElement.onwaiting = () => {
          console.log('Web: Audio is buffering');
           if (this.onPlaybackStatusUpdateCallback) {
            this.onPlaybackStatusUpdateCallback({
              isLoaded: true,
              isPlaying: false,
              isBuffering: true
            });
          }
        };
        
        audioElement.onpause = () => {
           console.log('Web: Audio paused');
           if (this.onPlaybackStatusUpdateCallback) {
             this.onPlaybackStatusUpdateCallback({
               isLoaded: true,
               isPlaying: false,
               isBuffering: false
             });
           }
        };
        
        audioElement.onerror = (e) => {
          console.error('Web: Audio error:', e);
           if (this.onPlaybackStatusUpdateCallback) {
            this.onPlaybackStatusUpdateCallback({
              isLoaded: false,
              isPlaying: false,
              isBuffering: false,
              error: 'Error loading or playing audio'
            });
          }
          this.stopPlayback();
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
      if (this.onPlaybackStatusUpdateCallback) {
         this.onPlaybackStatusUpdateCallback({
            isLoaded: false,
            isPlaying: false,
            isBuffering: false,
            error: error instanceof Error ? error.message : 'Unknown error during playStream'
         });
      }
      await this.stopPlayback();
      throw error;
    }
  }

  // Créer un callback pour les mises à jour du statut
  private createStatusUpdateCallback(
    callback?: (status: PlaybackStatus) => void
  ) {
    return (status: any) => {
      if (!this.sound) return;

      let playbackStatus: PlaybackStatus = {
        isLoaded: false,
        isPlaying: false,
        isBuffering: false,
      };

      if (status.isLoaded) {
        playbackStatus = {
          isLoaded: status.isLoaded,
          isPlaying: status.isPlaying,
          isBuffering: status.isBuffering
        };
      } 
      
      if (status.error) {
        console.error(`Mobile Playback error: ${status.error}`);
        playbackStatus.error = status.error;
      }

      if (this.onPlaybackStatusUpdateCallback) {
        this.onPlaybackStatusUpdateCallback(playbackStatus);
      }
    };
  }

  // Mettre en pause ou reprendre la lecture
  async togglePlayback(): Promise<boolean> {
    if (Platform.OS === 'web') {
      if (webAudioElement) {
        if (webAudioElement.paused) {
          console.log('Web: Attempting to play...');
          try {
            await webAudioElement.play();
            return true;
          } catch (error) {
            console.error('Web: Error playing audio:', error);
            // Notifier l'UI de l'erreur
            if (this.onPlaybackStatusUpdateCallback) {
               this.onPlaybackStatusUpdateCallback({ isLoaded: false, isPlaying: false, isBuffering: false, error: error instanceof Error ? error.message : 'Error playing' });
            }
            return false;
          }
        } else {
          console.log('Web: Attempting to pause...');
          webAudioElement.pause();
          return false;
        }
      } else {
        console.warn('Web: togglePlayback called but no audio element exists.');
        return false;
      }
    } else {
      // --- Logique Mobile SIMPLE --- 
      console.log('Mobile: togglePlayback called.');
      if (this.sound) {
         console.log('Mobile: this.sound object exists.'); 
         try {
           console.log('Mobile: Attempting getStatusAsync...'); 
           const status = await this.sound.getStatusAsync();
           console.log('Mobile: getStatusAsync successful.');

           // @ts-ignore - Vérification directe 
           if (status.isLoaded) {
              console.log('Mobile: Sound is loaded.'); 
              // @ts-ignore - Vérification directe
              if (status.isPlaying) {
                 console.log('Mobile: Sound is playing, attempting pauseAsync...'); 
                 await this.sound.pauseAsync();
                 console.log('Mobile: pauseAsync successful.');
                 return false; // Devrait être en pause
              } else {
                 console.log('Mobile: Sound is paused or stopped, attempting playAsync...'); 
                 await this.sound.playAsync();
                 console.log('Mobile: playAsync successful.');
                 return true; // Devrait être en lecture
              }
           } else {
              console.warn('Mobile: togglePlayback - Sound is NOT loaded (status.isLoaded is false).'); 
              // Notifier l'UI
              if (this.onPlaybackStatusUpdateCallback) {
                 this.onPlaybackStatusUpdateCallback({ isLoaded: false, isPlaying: false, isBuffering: false, error: 'Sound not loaded' });
              }
              return false;
           }
         } catch (error) {
            console.error('Mobile: Error during togglePlayback:', error);
            // Notifier l'UI
            if (this.onPlaybackStatusUpdateCallback) {
               this.onPlaybackStatusUpdateCallback({
                  isLoaded: false, 
                  isPlaying: false,
                  isBuffering: false,
                  error: error instanceof Error ? error.message : 'Error toggling playback'
               });
            }
            return false;
         }
      } else {
        console.warn('Mobile: togglePlayback called but no sound object exists.');
        return false;
      }
    }
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
    console.log('Stopping playback (simple version)...');
    // Arrêter l'audio web si actif
    if (Platform.OS === 'web' && webAudioElement) {
      console.log('Web: Stopping and cleaning up audio element...');
      webAudioElement.pause();
      webAudioElement.src = ''; // Vider la source
      webAudioElement.load(); // Annuler le chargement
      // Optionnel: Retirer du DOM si vous le recréez à chaque fois
      // if (webAudioElement.parentNode) {
      //   webAudioElement.parentNode.removeChild(webAudioElement);
      // }
      // webAudioElement = null;
    }

    // Arrêter l'audio Expo si actif
    if (this.sound) {
      console.log('Mobile: Stopping and unloading sound...');
      try {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
        this.sound = null;
        console.log('Mobile: Sound unloaded.');
      } catch (error) {
        console.error('Mobile: Error stopping/unloading playback:', error);
        this.sound = null; // S'assurer qu'il est nul même en cas d'erreur
      }
    }

    this.currentStream = null;
    isPlaybackInProgress = false;
    // Mettre à jour l'interface utilisateur pour refléter l'arrêt
    if (this.onPlaybackStatusUpdateCallback) {
      this.onPlaybackStatusUpdateCallback({ isLoaded: false, isPlaying: false, isBuffering: false });
    }
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