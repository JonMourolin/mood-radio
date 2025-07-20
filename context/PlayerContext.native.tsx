import React, { createContext, useState, useRef, useContext, useEffect, ReactNode } from 'react';
import { Audio } from 'expo-av';
import { StreamData, StreamMetadata } from '@/types/player';
import { METADATA_REFRESH_INTERVAL_MS } from '../config';
import { AzuraCastApiResponse } from '@/types/api';

interface PlayerContextProps {
  activeStream: StreamData | null;
  currentMetadata: StreamMetadata | null;
  isPlaying: boolean;
  isLoading: boolean;
  soundRef: React.MutableRefObject<Audio.Sound | null>;
  playStream: (stream: StreamData) => Promise<void>;
  togglePlayPause: () => Promise<void>;
  cleanupAudio: () => Promise<void>;
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
  const soundRef = useRef<Audio.Sound | null>(null);
  const metadataIntervalRef = useRef<NodeJS.Timeout | number | null>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | number | null>(null);

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
    });

    return () => {
      cleanupAudio(); 
    };
  }, []);

  const cleanupAudio = async () => {
    if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
    if (metadataIntervalRef.current) clearInterval(metadataIntervalRef.current);
    
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch (error) {
          console.warn("Context: Error during sound cleanup:", error);
      }
      soundRef.current = null;
    }
    
    setIsPlaying(false);
    setIsLoading(false);
    setActiveStream(null);
  };

  const fetchMetadata = async (url: string | undefined) => {
     if (!url) {
      return;
    }
    console.log(`Context: Fetching metadata from: ${url}`);
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
            console.log("Context: Metadata updated:", newMetadata);
        }
      } else {
          console.log("Context: Metadata fetch returned no song data.");
      }
    } catch (error) {
      console.error(`Context: Error fetching metadata from ${url}:`, error);
    }
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
    
    await cleanupAudio();
    setActiveStream(stream);
    setCurrentMetadata(null);
    setIsLoading(true);

    loadingTimeoutRef.current = setTimeout(() => {
      console.warn("Stream loading timeout after 10 seconds");
      setIsLoading(false);
    }, 10000);

    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: stream.streamUrl },
        { shouldPlay: true },
        (status) => {
          if (status.isLoaded) {
              setIsPlaying(status.isPlaying);
              if (status.isPlaying) {
                setIsLoading(false);
                if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
              }
          } else {
              if (status.error) {
                  console.error(`Playback Error: ${status.error}`);
                  cleanupAudio(); 
              }
          }
        }
      );
      soundRef.current = sound;
    } catch (error) {
      console.error('Error playing stream:', error);
      cleanupAudio();
    }
    
    if (stream.metadataUrl) {
      fetchMetadata(stream.metadataUrl);
      metadataIntervalRef.current = setInterval(() => fetchMetadata(stream.metadataUrl), METADATA_REFRESH_INTERVAL_MS);
    }
  };

  const togglePlayPause = async () => {
    if (isLoading || !soundRef.current) return;
    
    try {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded) {
            if (status.isPlaying) {
                await soundRef.current.pauseAsync();
            } else {
                await soundRef.current.playAsync();
            }
        }
    } catch (error) {
        console.error("Error toggling play/pause:", error);
    }
  };

  const value = {
    activeStream,
    currentMetadata,
    isPlaying,
    isLoading,
    soundRef,
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