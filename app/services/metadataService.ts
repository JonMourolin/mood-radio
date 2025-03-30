import { Platform } from 'react-native';

export interface TrackMetadata {
  title: string;
  artist: string;
  album?: string;
  artwork?: string;
  startedAt: number;
  duration?: number;
}

type MetadataCallback = (metadata: TrackMetadata) => void;

export class MetadataService {
  private ws: WebSocket | null = null;
  private retryCount: number = 0;
  private maxRetries: number = 5;
  private callbacks: Set<MetadataCallback> = new Set();
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private currentMetadata: TrackMetadata | null = null;

  // URL du serveur WebSocket mis à jour avec le port 3001
  private readonly wsUrl = Platform.select({
    web: 'ws://51.75.200.205:3001',
    default: 'ws://51.75.200.205:3001'
  });

  constructor() {
    this.initializeWebSocket();
  }

  private initializeWebSocket() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      this.ws = new WebSocket(this.wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connecté');
        this.retryCount = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const metadata: TrackMetadata = JSON.parse(event.data);
          this.currentMetadata = metadata;
          this.notifyCallbacks(metadata);
        } catch (error) {
          console.error('Erreur parsing metadata:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket erreur:', error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket fermé');
        this.retryConnection();
      };

    } catch (error) {
      console.error('Erreur création WebSocket:', error);
      this.retryConnection();
    }
  }

  private retryConnection() {
    if (this.retryCount >= this.maxRetries) {
      console.log('Nombre maximum de tentatives atteint');
      return;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    const delay = Math.min(1000 * Math.pow(2, this.retryCount), 30000);
    this.reconnectTimeout = setTimeout(() => {
      console.log(`Tentative de reconnexion ${this.retryCount + 1}/${this.maxRetries}`);
      this.retryCount++;
      this.initializeWebSocket();
    }, delay);
  }

  private notifyCallbacks(metadata: TrackMetadata) {
    this.callbacks.forEach(callback => {
      try {
        callback(metadata);
      } catch (error) {
        console.error('Erreur dans callback metadata:', error);
      }
    });
  }

  public subscribe(callback: MetadataCallback): () => void {
    this.callbacks.add(callback);
    
    // Envoyer les métadonnées actuelles immédiatement si disponibles
    if (this.currentMetadata) {
      callback(this.currentMetadata);
    }

    // Retourner une fonction de cleanup
    return () => {
      this.callbacks.delete(callback);
    };
  }

  public getCurrentMetadata(): TrackMetadata | null {
    return this.currentMetadata;
  }

  public disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.callbacks.clear();
  }
}

// Exporter une instance singleton
export const metadataService = new MetadataService(); 