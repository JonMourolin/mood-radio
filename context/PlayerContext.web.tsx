import React, { createContext, useState, useRef, useContext, useEffect, ReactNode } from 'react';
import { StreamData, StreamMetadata } from '@/types/player';
import { METADATA_REFRESH_INTERVAL_MS } from '../config';
import { AzuraCastApiResponse } from '@/types/api';
import WebPlayer, { WebPlayerCallbacks } from '../services/WebPlayer';

// NOTE: This interface must stay in sync with the native version
interface PlayerContextProps {
  activeStream: StreamData | null;
  currentMetadata: StreamMetadata | null;
  isPlaying: boolean;
  isLoading: boolean;
  // soundRef is a no-op on web, but kept for interface compatibility
  soundRef: React.MutableRefObject<null>; 
  playStream: (stream: StreamData) => Promise<void>;
  togglePlayPause: () => Promise<void>;
  cleanupAudio: () => void; // Changed from Promise<void> to void
}

const PlayerContext = createContext<PlayerContextProps | undefined>(undefined);

interface PlayerProviderProps {
  children: ReactNode;
}

export const PlayerProvider: React.FC<PlayerProviderProps> = ({ children }) => {
  const [activeStream, setActiveStream] = useState<StreamData | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentMetadata, setCurrentMetadata] = useState<StreamMetadata | null>(null);
  
  const webPlayerRef = useRef<WebPlayer | null>(null);
  const metadataIntervalRef = useRef<NodeJS.Timeout | number | null>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | number | null>(null);

  // This effect now ONLY creates the player instance once.
  useEffect(() => {
    const webPlayerCallbacks: WebPlayerCallbacks = {
      onPlay: () => {
        setIsPlaying(true);
        setIsLoading(false);
        if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
      },
      onPause: () => setIsPlaying(false),
      onLoading: () => setIsLoading(true),
      onError: (error) => {
        console.error('WebPlayer error in context:', error);
        // On error, we should clean up to allow a fresh start.
        cleanupAudio();
      },
    };
    webPlayerRef.current = new WebPlayer(webPlayerCallbacks);

    return () => {
      webPlayerRef.current?.destroy();
    };
  }, []);

  // Simplified and more robust cleanup
  const cleanupAudio = () => { // No longer async
    if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
    if (metadataIntervalRef.current) clearInterval(metadataIntervalRef.current);
    
    webPlayerRef.current?.destroy();
    
    setIsPlaying(false);
    setIsLoading(false);
    setActiveStream(null);
    setCurrentMetadata(null); // Also clear metadata on cleanup
  };

  const fetchMetadata = async (url: string | undefined) => {
    if (!url) return;
    try {
      const response = await fetch(url);
      const data: AzuraCastApiResponse = await response.json();
      if (data.now_playing && data.now_playing.song) {
        const track = data.now_playing.song;
        const newMetadata: StreamMetadata = {
          song: track.text || `${track.artist || 'Unknown Artist'} - ${track.title || 'Unknown Title'}`,
          artUrl: track.art || undefined,
        };
        if (newMetadata.song !== currentMetadata?.song) {
          setCurrentMetadata(newMetadata);
          updateMediaSession(newMetadata, activeStream?.title);
        }
      }
    } catch (error) {
      console.error(`Error fetching metadata from ${url}:`, error);
    }
  };

  const updateMediaSession = (metadata: StreamMetadata | null, streamTitle?: string) => {
    if (!('mediaSession' in navigator)) {
      return;
    }

    const { song, artUrl } = metadata || {};
    
    // Default values
    let title = 'Unknown Title';
    let artist = streamTitle || 'Mood Radio';

    if (song) {
        // Simple parsing, assuming "Artist - Title" format
        const parts = song.split(' - ');
        if (parts.length > 1) {
            artist = parts[0].trim();
            title = parts[1].trim();
        } else {
            title = song;
        }
    }

    navigator.mediaSession.metadata = new MediaMetadata({
      title: title,
      artist: artist,
      album: streamTitle || 'Live Stream',
      artwork: artUrl ? [{ src: artUrl, sizes: '512x512', type: 'image/jpeg' }] : [],
    });
  };

  const playStream = async (stream: StreamData) => {
    if (!stream.streamUrl) {
      console.error(`Stream "${stream.title}" has no streamUrl.`);
      return;
    }

    if (activeStream?.id === stream.id) {
      await togglePlayPause();
      return;
    }
    
    // --- KEY CHANGE: Ensure player is ready for a new stream ---
    // Destroy the *current* player instance and create a fresh one.
    // This is more robust than trying to reuse the old instance.
    if (webPlayerRef.current) {
      webPlayerRef.current.destroy();
    }
    const webPlayerCallbacks: WebPlayerCallbacks = {
      onPlay: () => {
        setIsPlaying(true);
        setIsLoading(false);
        if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
      },
      onPause: () => setIsPlaying(false),
      onLoading: () => setIsLoading(true),
      onError: (error) => {
        console.error('WebPlayer error in context:', error);
        cleanupAudio();
      },
    };
    webPlayerRef.current = new WebPlayer(webPlayerCallbacks);
    // --- END KEY CHANGE ---

    // Now, set the new stream state
    setActiveStream(stream);
    setCurrentMetadata(null);
    updateMediaSession(null, stream.title); // Update with default info immediately
    setIsLoading(true);

    loadingTimeoutRef.current = setTimeout(() => {
      console.warn("Stream loading timeout after 10 seconds");
      if (isLoading) {
        cleanupAudio(); // Cleanup if it's still loading
      }
    }, 10000);

    webPlayerRef.current.play(stream.streamUrl);
    
    if (stream.metadataUrl) {
      fetchMetadata(stream.metadataUrl);
      if (metadataIntervalRef.current) clearInterval(metadataIntervalRef.current);
      metadataIntervalRef.current = setInterval(() => fetchMetadata(stream.metadataUrl), METADATA_REFRESH_INTERVAL_MS);
    }
  };

  const togglePlayPause = async () => {
    if (isLoading) return;
    webPlayerRef.current?.togglePlayPause(isPlaying);
  };

  const value = {
    activeStream,
    currentMetadata,
    isPlaying,
    isLoading,
    soundRef: useRef(null), // Provide a dummy ref for compatibility
    playStream,
    togglePlayPause,
    cleanupAudio,
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayerContext = () => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayerContext must be used within a PlayerProvider');
  }
  return context;
}; 