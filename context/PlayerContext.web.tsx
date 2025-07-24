import React, { createContext, useState, useRef, useContext, useEffect, ReactNode } from 'react';
import { StreamData, StreamMetadata } from '@/types/player';
import { METADATA_REFRESH_INTERVAL_MS } from '../config';
import { AzuraCastApiResponse } from '@/types/api';
import WebPlayer, { WebPlayerCallbacks } from '../services/WebPlayer';

// Data structure for the discovery modal content
interface DiscoveryData {
  track: string | null;
  artist: string | null;
  artUrl: string | null;
  moodImageUrl: string | null;
  description: string | null;
}

// PlayerContext: Manages the state of the audio player for the web application.
interface PlayerContextProps {
  activeStream: StreamData | null;
  currentMetadata: StreamMetadata | null;
  isPlaying: boolean;
  isLoading: boolean;
  soundRef: React.MutableRefObject<null>; 
  playStream: (stream: StreamData) => Promise<void>;
  togglePlayPause: () => Promise<void>;
  cleanupAudio: () => void;
  
  isDiscoveryModalVisible: boolean;
  discoveryData: DiscoveryData | null;
  isDiscoveryLoading: boolean;
  discoveryError: string | null;
  openDiscoveryModal: () => void;
  closeDiscoveryModal: () => void;
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
  
  // State for Discovery Modal
  const [isDiscoveryModalVisible, setDiscoveryModalVisible] = useState(false);
  const [discoveryData, setDiscoveryData] = useState<DiscoveryData | null>(null);
  const [isDiscoveryLoading, setDiscoveryLoading] = useState(false);
  const [discoveryError, setDiscoveryError] = useState<string | null>(null);

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
        cleanupAudio();
      },
    };
    webPlayerRef.current = new WebPlayer(webPlayerCallbacks);

    return () => {
      webPlayerRef.current?.destroy();
    };
  }, []);

  const cleanupAudio = () => { 
    if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
    if (metadataIntervalRef.current) clearInterval(metadataIntervalRef.current);
    
    webPlayerRef.current?.destroy();
    
    setIsPlaying(false);
    setIsLoading(false);
    setActiveStream(null);
    setCurrentMetadata(null);
  };
  
  const openDiscoveryModal = async () => {
    if (!currentMetadata || !currentMetadata.song || !activeStream) return;

    // Immediately parse and set the data we already have
    const songParts = currentMetadata.song.split(' - ');
    const artist = songParts[0]?.trim() || activeStream.title;
    const track = songParts.length > 1 ? songParts.slice(1).join(' - ').trim() : 'Unknown Title';

    setDiscoveryData({
        track,
        artist,
        artUrl: currentMetadata.artUrl || null,
        moodImageUrl: activeStream.moodImageUrl || null,
        description: null, // The description is what we're fetching
    });

    setDiscoveryModalVisible(true);
    setDiscoveryLoading(true);
    setDiscoveryError(null);

    try {
      const response = await fetch(`/api/getTrackInfo?artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(track)}`);

      if (!response.ok) {
        if (response.status === 504) {
          setDiscoveryError("No data found. This track might be too recent or underground. Dig it !");
        } else {
          const errorData = await response.json();
          setDiscoveryError(errorData.error || 'Failed to fetch description');
        }
      } else {
        const data = await response.json();
        // Update existing data with the fetched description
        setDiscoveryData(prevData => ({
          ...prevData!,
          description: data.description,
        }));
      }
    } catch (err) {
      setDiscoveryError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setDiscoveryLoading(false);
    }
  };

  const closeDiscoveryModal = () => {
    setDiscoveryModalVisible(false);
    setDiscoveryData(null);
    setDiscoveryError(null);
    setDiscoveryLoading(false);
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
    soundRef: useRef(null),
    playStream,
    togglePlayPause,
    cleanupAudio,
    // Add discovery modal state and functions to the context value
    isDiscoveryModalVisible,
    discoveryData,
    isDiscoveryLoading,
    discoveryError,
    openDiscoveryModal,
    closeDiscoveryModal,
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