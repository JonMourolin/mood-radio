import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import TrackPlayer, {
  Event,
  State,
  Track,
  useTrackPlayerEvents,
  Capability,
  PitchAlgorithm
} from 'react-native-track-player';

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
  preloading?: boolean; // Ajout d'un indicateur de préchargement
  preloadProgress?: number; // Progression du préchargement (0-100)
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
    description: 'Long mixes by Costa DJ',
    bitrate: 192
  },
  {
    id: 'mamene-break',
    title: 'Mamene Break',
    artist: 'DJ Mamene',
    url: `http://${SERVER_IP}:${SERVER_PORT}/mamene-break.mp3`,
    genre: 'Tech House',
    description: 'Tech house mixes by DJ Mamene',
    bitrate: 256
  },
  {
    id: 'mamene-break-2',
    title: 'Mamene Break 2',
    artist: 'DJ Mamene',
    url: `http://${SERVER_IP}:${SERVER_PORT}/mamene2.mp3`,
    genre: 'Breakbeat',
    description: 'Breakbeat mixes by DJ Mamene',
    bitrate: 128
  },
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

// Variable pour stocker l'élément audio HTML pour le web (pour la radio uniquement)
let webAudioElement: HTMLAudioElement | null = null;

// Variable pour suivre si une lecture est en cours (pour éviter les doubles lectures)
let isPlaybackInProgress = false;

// Variable pour suivre si TrackPlayer a été configuré
let isTrackPlayerSetup = false;

// Fonction pour générer une URL avec un timestamp pour éviter la mise en cache
function getNoCacheUrl(baseUrl: string): string {
  return `${baseUrl}?t=${Date.now()}`;
}

// Configuration de TrackPlayer
async function setupTrackPlayer() {
  if (isTrackPlayerSetup) return;
  
  try {
    // Configuration de base de TrackPlayer avec des options adaptées selon la plateforme
    const setupOptions = Platform.OS === 'web' 
      ? {
          // Options pour le web optimisées pour le préchargement
          minBuffer: 5, // 5 secondes suffisent pour démarrer
          maxBuffer: 50, // 50 secondes en avance c'est bien
          waitForBuffer: true, // Important : attendre avant de commencer
        } 
      : {
          minBuffer: 5, // 5 secondes suffisent pour démarrer sur mobile aussi
          maxBuffer: 60, // 1 minute de buffer maximum
          backBuffer: 5, // 5 secondes de buffer arrière
          waitForBuffer: true, // Attendre le chargement du buffer avant de commencer la lecture
        };
    
    await TrackPlayer.setupPlayer(setupOptions);
    
    // Configuration des capacités du lecteur
    await TrackPlayer.updateOptions({
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.Stop,
      ],
      compactCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.Stop,
      ],
      progressUpdateEventInterval: 1, // Intervalle de mise à jour de la progression (secondes)
    });
    
    isTrackPlayerSetup = true;
    console.log('TrackPlayer setup complete for audio playback');
  } catch (error) {
    console.error('Failed to setup TrackPlayer:', error);
    throw error;
  }
}

// Classe de service pour gérer la radio
class RadioService {
  private sound: Audio.Sound | null = null;
  private currentStream: Stream | null = null;
  private isDJSet = false;
  private preloadedDJSet: string | null = null; // Pour suivre quel DJ set est préchargé
  
  constructor() {
    // Configuration de l'audio pour le mode arrière-plan
    this.setupAudioMode();
    
    // Initialiser TrackPlayer
    setupTrackPlayer().catch(error => {
      console.error('Error initializing TrackPlayer:', error);
    });
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

  // NOUVEAU: Précharger un DJ set avant de le lire
  async preloadDJSet(
    stream: Stream,
    onProgressUpdate?: (progress: number) => void
  ): Promise<boolean> {
    if (stream.id === 'radio' || this.preloadedDJSet === stream.id) {
      // Pas besoin de précharger la radio ou un DJ set déjà préchargé
      return true;
    }
    
    try {
      // S'assurer que TrackPlayer est configuré
      if (!isTrackPlayerSetup) {
        await setupTrackPlayer();
      }
      
      // URL avec cache-busting
      const playUrl = `${stream.url}?nocache=${Date.now()}`;
      console.log(`Preloading DJ set: ${stream.title} (${playUrl})`);
      
      // Effacer la file d'attente actuelle
      await TrackPlayer.reset();
      
      // Créer la piste pour le DJ set
      const track: Track = {
        id: stream.id,
        url: playUrl,
        title: stream.title,
        artist: stream.artist,
        genre: stream.genre || '',
        artwork: '',
        pitchAlgorithm: Platform.OS !== 'web' ? PitchAlgorithm.Music : undefined,
      };
      
      // Ajouter la piste à la file d'attente
      await TrackPlayer.add(track);
      
      // Simuler le progrès de préchargement (car TrackPlayer ne fournit pas d'API pour cela)
      // En réalité, nous préchargeons juste les premières secondes
      if (onProgressUpdate) {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 5;
          onProgressUpdate(Math.min(progress, 100));
          if (progress >= 100) {
            clearInterval(interval);
          }
        }, 200);
        
        // Attendre un peu pour simuler le préchargement
        await new Promise(resolve => setTimeout(resolve, 4000));
        
        clearInterval(interval);
        onProgressUpdate(100);
      }
      
      this.preloadedDJSet = stream.id;
      return true;
    } catch (error) {
      console.error('Error preloading DJ set:', error);
      return false;
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
      
      // URL de base du flux avec cache-busting pour tous les flux
      let playUrl = stream.url;
      
      if (stream.id !== 'radio') {
        playUrl = `${playUrl}?nocache=${Date.now()}`;
        console.log(`Generated no-cache URL: ${playUrl}`);
      }
      
      // Arrêter la lecture en cours
      await this.stopPlayback();
      
      // Déterminer si c'est un DJ set ou la radio
      this.isDJSet = stream.id !== 'radio';
      
      // Pour les DJ sets, utiliser TrackPlayer
      if (this.isDJSet) {
        try {
          // Si ce n'est pas le DJ set préchargé, le précharger maintenant
          if (this.preloadedDJSet !== stream.id) {
            if (onPlaybackStatusUpdate) {
              onPlaybackStatusUpdate({
                isLoaded: false,
                isPlaying: false,
                isBuffering: true,
                preloading: true,
                preloadProgress: 0
              });
            }
            
            await this.preloadDJSet(stream, (progress) => {
              if (onPlaybackStatusUpdate) {
                onPlaybackStatusUpdate({
                  isLoaded: false,
                  isPlaying: false,
                  isBuffering: true,
                  preloading: true,
                  preloadProgress: progress
                });
              }
            });
          }
          
          // Maintenant, le fichier est préchargé, lancer la lecture
          await TrackPlayer.play();
          
          // Mettre à jour l'état
          this.currentStream = stream;
          await this.saveLastPlayedStream(stream.id);
          
          // Mettre à jour le callback
          if (onPlaybackStatusUpdate) {
            onPlaybackStatusUpdate({
              isLoaded: true,
              isPlaying: true,
              isBuffering: false,
              preloading: false,
              preloadProgress: 100,
              error: undefined
            });
          }
          
          console.log(`Now playing DJ set via TrackPlayer: ${stream.title} by ${stream.artist}`);
        } catch (error) {
          console.error('Error playing with TrackPlayer:', error);
          
          // En cas d'erreur, revenir à la méthode standard
          await this.playWithStandardMethod(stream, playUrl, onPlaybackStatusUpdate);
        }
      }
      // Pour la radio, utiliser la méthode standard
      else {
        await this.playWithStandardMethod(stream, playUrl, onPlaybackStatusUpdate);
      }
      
      isPlaybackInProgress = false;
    } catch (error) {
      isPlaybackInProgress = false;
      console.error('Error playing stream:', error);
      throw error;
    }
  }

  // Méthode standard de lecture (pour la radio et fallback)
  private async playWithStandardMethod(
    stream: Stream, 
    playUrl: string, 
    onPlaybackStatusUpdate?: (status: PlaybackStatus) => void
  ): Promise<void> {
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
      audioElement.preload = 'auto'; // Forcer le préchargement
      
      // Pour les DJ sets sur le web, ajouter plus de fonctionnalités de préchargement
      if (stream.id !== 'radio') {
        // Ajouter un attribut de données personnalisé pour suivre l'état du préchargement
        audioElement.dataset.preloaded = 'false';
        
        // Simuler un préchargement pour montrer un progrès à l'utilisateur
        if (onPlaybackStatusUpdate) {
          onPlaybackStatusUpdate({
            isLoaded: false,
            isPlaying: false,
            isBuffering: true,
            preloading: true,
            preloadProgress: 0
          });
          
          let progress = 0;
          const preloadInterval = setInterval(() => {
            progress += 5;
            if (progress <= 100) {
              onPlaybackStatusUpdate({
                isLoaded: false,
                isPlaying: false,
                isBuffering: true,
                preloading: true,
                preloadProgress: progress
              });
            } else {
              clearInterval(preloadInterval);
            }
          }, 200);
          
          // Arrêter la simulation après un certain temps si l'audio n'a pas encore chargé
          setTimeout(() => {
            clearInterval(preloadInterval);
            if (audioElement.dataset.preloaded === 'false') {
              audioElement.dataset.preloaded = 'true';
              if (onPlaybackStatusUpdate) {
                onPlaybackStatusUpdate({
                  isLoaded: true,
                  isPlaying: false,
                  isBuffering: false,
                  preloading: false,
                  preloadProgress: 100
                });
              }
            }
          }, 4000);
        }
      }
      
      document.body.appendChild(audioElement);
      webAudioElement = audioElement;
      
      // Configurer les événements
      audioElement.onloadedmetadata = () => {
        console.log('Audio metadata loaded');
      };
      
      audioElement.oncanplay = () => {
        console.log('Audio can play, starting playback');
        
        // Marquer comme préchargé
        if (stream.id !== 'radio') {
          audioElement.dataset.preloaded = 'true';
          if (onPlaybackStatusUpdate) {
            onPlaybackStatusUpdate({
              isLoaded: true,
              isPlaying: false,
              isBuffering: false,
              preloading: false,
              preloadProgress: 100
            });
          }
        }
        
        const playPromise = audioElement.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error('Playback error:', error);
            if (onPlaybackStatusUpdate) {
              onPlaybackStatusUpdate({
                isLoaded: false,
                isPlaying: false,
                isBuffering: false,
                preloading: false,
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
            isBuffering: false,
            preloading: false
          });
        }
      };
      
      audioElement.onwaiting = () => {
        console.log('Audio is buffering');
        if (onPlaybackStatusUpdate) {
          onPlaybackStatusUpdate({
            isLoaded: true,
            isPlaying: false,
            isBuffering: true,
            preloading: false
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
            preloading: false,
            error: 'Error loading audio'
          });
        }
      };
      
      // Définir la source et charger le fichier
      audioElement.src = playUrl;
      audioElement.load();
      
      // Mettre à jour l'état
      this.currentStream = stream;
      await this.saveLastPlayedStream(stream.id);
      
      console.log(`Now playing via Web Audio API: ${stream.title} by ${stream.artist}`);
    } else {
      // Pour les plateformes mobiles, utiliser Expo AV
      console.log('Using Expo AV implementation');
      const { sound } = await Audio.Sound.createAsync(
        { uri: playUrl },
        { shouldPlay: true, volume: 1.0 },
        this.createStatusUpdateCallback(onPlaybackStatusUpdate)
      );
      
      this.sound = sound;
      this.currentStream = stream;
      
      // Sauvegarder l'ID du flux
      await this.saveLastPlayedStream(stream.id);
      
      console.log(`Now playing via Expo AV: ${stream.title} by ${stream.artist}`);
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
          isBuffering: status.isBuffering,
          preloading: false
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
          preloading: false,
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
    // Pour les DJ sets, utiliser TrackPlayer
    if (this.isDJSet && isTrackPlayerSetup) {
      try {
        const playerState = await TrackPlayer.getState();
        
        if (playerState === State.Playing) {
          await TrackPlayer.pause();
          return false;
        } else {
          await TrackPlayer.play();
          return true;
        }
      } catch (error) {
        console.error('Error toggling TrackPlayer playback:', error);
      }
    }
    // Pour la radio, utiliser la méthode standard
    else if (Platform.OS === 'web' && webAudioElement) {
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
    
    // Pour les DJ sets, utiliser TrackPlayer
    if (this.isDJSet && isTrackPlayerSetup) {
      try {
        await TrackPlayer.setVolume(safeVolume);
      } catch (error) {
        console.error('Error setting TrackPlayer volume:', error);
      }
    }
    // Pour la radio, utiliser la méthode standard
    else if (Platform.OS === 'web' && webAudioElement) {
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
    // Arrêter TrackPlayer si actif
    if (isTrackPlayerSetup) {
      try {
        await TrackPlayer.reset();
      } catch (error) {
        console.error('Error stopping TrackPlayer:', error);
      }
    }
    
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
    this.isDJSet = false;
  }

  // Obtenir le flux actuel
  getCurrentStream(): Stream | null {
    return this.currentStream;
  }

  // Vérifier si un flux est en cours de lecture
  async isPlaying(): Promise<boolean> {
    // Pour les DJ sets, utiliser TrackPlayer
    if (this.isDJSet && isTrackPlayerSetup) {
      try {
        const playerState = await TrackPlayer.getState();
        return playerState === State.Playing;
      } catch (error) {
        console.error('Error checking TrackPlayer state:', error);
        return false;
      }
    }
    // Pour la radio, utiliser la méthode standard
    else if (Platform.OS === 'web' && webAudioElement) {
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
  
  // Obtenir la position actuelle en secondes (pour les DJ sets)
  async getPosition(): Promise<number> {
    if (this.isDJSet && isTrackPlayerSetup) {
      try {
        return await TrackPlayer.getPosition();
      } catch (error) {
        console.error('Error getting TrackPlayer position:', error);
        return 0;
      }
    }
    return 0;
  }
  
  // Obtenir la durée totale en secondes (pour les DJ sets)
  async getDuration(): Promise<number> {
    if (this.isDJSet && isTrackPlayerSetup) {
      try {
        return await TrackPlayer.getDuration();
      } catch (error) {
        console.error('Error getting TrackPlayer duration:', error);
        return 0;
      }
    }
    return 0;
  }
  
  // Chercher à une position spécifique (pour les DJ sets)
  async seekTo(position: number): Promise<void> {
    if (this.isDJSet && isTrackPlayerSetup) {
      try {
        await TrackPlayer.seekTo(position);
      } catch (error) {
        console.error('Error seeking in TrackPlayer:', error);
      }
    }
  }
}

// Hook pour écouter les événements de TrackPlayer (à utiliser dans les composants React)
export function usePlaybackState(callback?: (status: PlaybackStatus) => void) {
  useTrackPlayerEvents([Event.PlaybackState, Event.PlaybackError], async (event: any) => {
    if (event.type === Event.PlaybackState) {
      const state = await TrackPlayer.getState();
      
      if (callback) {
        callback({
          isLoaded: state !== State.None && state !== State.Error,
          isPlaying: state === State.Playing,
          isBuffering: state === State.Buffering || state === State.Connecting,
          preloading: false,
          error: undefined
        });
      }
    } else if (event.type === Event.PlaybackError && callback) {
      callback({
        isLoaded: false,
        isPlaying: false,
        isBuffering: false,
        preloading: false,
        error: event.message
      });
    }
  });
}

// Exporter une instance unique du service
export const radioService = new RadioService();