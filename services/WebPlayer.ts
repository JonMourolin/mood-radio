import Hls from 'hls.js/dist/hls.light'; // Import the light version

// Define the callbacks that the WebPlayer will use to communicate with the PlayerContext
export interface WebPlayerCallbacks {
  onPlay: () => void;
  onPause: () => void;
  onError: (error: any) => void;
  onLoading: () => void;
}

class WebPlayer {
  private audio: HTMLAudioElement | null = null;
  private hls: Hls | null = null;
  private callbacks: WebPlayerCallbacks;

  constructor(callbacks: WebPlayerCallbacks) {
    this.callbacks = callbacks;
    if (typeof window !== 'undefined') {
      this.initializePlayer();
    }
  }

  private initializePlayer() {
    this.audio = document.createElement('audio');
    this.audio.crossOrigin = "anonymous"; // Add crossOrigin attribute for CORS
    
    // Listen to the audio element's events to update context state
    this.audio.addEventListener('playing', this.handlePlaying);
    this.audio.addEventListener('pause', this.handlePause);
    this.audio.addEventListener('error', this.handleError);
  }

  // Event handlers that call the context callbacks
  private handlePlaying = () => this.callbacks.onPlay();
  private handlePause = () => this.callbacks.onPause();
  private handleError = (e: Event | string) => {
    console.error('HTML Audio Element Error:', e);
    this.callbacks.onError('HTML Audio Element Error');
  }

  public play(streamUrl: string) {
    if (!this.audio) return;
    
    this.callbacks.onLoading();

    if (this.audio.canPlayType('application/vnd.apple.mpegurl')) {
      this.audio.src = streamUrl;
      this.audio.play().catch(this.handleError);
    } else if (Hls.isSupported()) {
      if (this.hls) {
        this.hls.destroy();
      }
      
      // Add robust HLS configuration
      const hlsConfig = {
        xhrSetup: (xhr: any, url: string) => {
          xhr.withCredentials = false; // Important for some CORS setups
        },
        // Force start playing even if buffer is not full
        startFragPrefetch: true,
      };

      this.hls = new Hls(hlsConfig);
      
      this.hls.loadSource(streamUrl);
      this.hls.attachMedia(this.audio);
      
      this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
        this.audio?.play().catch(this.handleError);
      });

      this.hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS.js Error Event:', event, 'Data:', data);
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.error('Fatal network error encountered, trying to recover...');
              this.hls?.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.error('Fatal media error encountered, trying to recover...');
              this.hls?.recoverMediaError();
              break;
            default:
              console.error('Unrecoverable fatal error, destroying HLS instance');
              this.hls?.destroy();
              break;
          }
        }
        this.callbacks.onError(data);
      });
    } else {
        this.callbacks.onError('HLS not supported');
    }
  }

  public togglePlayPause(isPlaying: boolean) {
    if (!this.audio) return;

    if (isPlaying) {
      this.audio.pause();
    } else {
      this.audio.play().catch(this.handleError);
    }
  }

  public destroy() {
    if (this.hls) {
      this.hls.destroy();
      this.hls = null;
    }
    if (this.audio) {
      // Remove event listeners to prevent memory leaks
      this.audio.removeEventListener('playing', this.handlePlaying);
      this.audio.removeEventListener('pause', this.handlePause);
      this.audio.removeEventListener('error', this.handleError);
      
      this.audio.pause();
      this.audio.src = '';
      this.audio = null;
    }
  }
}

export default WebPlayer; 