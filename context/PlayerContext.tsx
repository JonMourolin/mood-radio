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
  console.log('[PlayerContext] PlayerProvider component rendering');
  const [activeStream, setActiveStream] = useState<StreamData | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentMetadata, setCurrentMetadata] = useState<StreamMetadata | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const metadataIntervalRef = useRef<NodeJS.Timeout | number | null>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | number | null>(null);

  useEffect(() => {
    console.log('[PlayerContext] PlayerProvider useEffect running for setAudioModeAsync');
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
    });

    // Cleanup on unmount
    return () => {
      console.log("PlayerProvider unmounting, cleaning up audio.");
      cleanupAudio(); 
    };
  }, []);

  const cleanupAudio = async () => {
    console.log("Context: Cleaning up audio...");
    
    // Clear loading timeout
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
    
    // Clear metadata interval
    if (metadataIntervalRef.current) {
      clearInterval(metadataIntervalRef.current);
      metadataIntervalRef.current = null;
    }
    
    // Clean up sound
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch (error) {
          console.warn("Context: Error during sound cleanup:", error);
      }
      soundRef.current = null;
    }
    
    // Reset states
    setIsPlaying(false);
    setIsLoading(false);
    setActiveStream(null);
  };

  const fetchMetadata = async (url: string | undefined) => {
     if (!url) {
      // Keep existing metadata if no URL
      // setCurrentMetadata(null); 
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
        // Only update if song text actually changed
        if (newMetadata.song !== currentMetadata?.song) {
            setCurrentMetadata(newMetadata);
            console.log("Context: Metadata updated:", newMetadata);
        }
      } else {
          // If no song data, maybe keep the old metadata for a bit?
          // Or clear it: setCurrentMetadata(null);
          console.log("Context: Metadata fetch returned no song data.");
      }
    } catch (error) {
      console.error(`Context: Error fetching metadata from ${url}:`, error);
      // Don't clear metadata on fetch error, keep the last known
      // setCurrentMetadata(null); 
    }
  };

  const playStream = async (stream: StreamData) => {
    console.log(`Context: Attempting to play stream: ${stream.title}`);
    if (!stream.streamUrl) {
      console.error(`Context: Stream "${stream.title}" has no streamUrl. Cannot play.`);
      return;
    }

    // Edge case 1: Ignore if already loading (except for same stream toggle)
    if (isLoading && activeStream?.id !== stream.id) {
      console.log("Context: Already loading another stream, ignoring request.");
      return;
    }

    // Edge case 3: Ignore toggle during loading
    if (soundRef.current && activeStream?.id === stream.id) {
        if (isLoading) {
          console.log("Context: Stream is loading, ignoring toggle.");
          return;
        }
        console.log("Context: Stream already loaded. Toggling play/pause instead.");
        await togglePlayPause();
        return;
    }
    
    // Edge case 2: Last request priority - cleanup previous attempt
    await cleanupAudio(); // Clean previous stream first
    setActiveStream(stream); // Set active stream immediately
    setCurrentMetadata(null); // Clear old metadata
    setIsLoading(true); // Start loading state

    // // Placeholder for testing UI without actual streaming
    // if (stream.streamUrl === 'placeholder') {
    //   console.warn("Context: Placeholder stream selected, cannot play.");
    //   setIsPlaying(false); 
    //   setCurrentMetadata({ song: stream.title, artist: "(No Stream URL)" }); 
    //   return;
    // }

    // Edge case 4: Set loading timeout (10 seconds)
    loadingTimeoutRef.current = setTimeout(() => {
      console.warn("Context: Stream loading timeout after 10 seconds");
      setIsLoading(false);
    }, 10000);

    try {
      console.log(`Context: Loading sound: ${stream.streamUrl}`);
      const { sound } = await Audio.Sound.createAsync(
        { uri: stream.streamUrl },
        { shouldPlay: true },
        (status) => { // onPlaybackStatusUpdate
          if (status.isLoaded) {
              setIsPlaying(status.isPlaying);
              // Clear loading state only when actually playing
              if (status.isPlaying) {
                setIsLoading(false);
                if (loadingTimeoutRef.current) {
                  clearTimeout(loadingTimeoutRef.current);
                  loadingTimeoutRef.current = null;
                }
              }
          } else {
              if (status.error) {
                  console.error(`Context Playback Error: ${status.error}`);
                  setIsLoading(false);
                  cleanupAudio(); 
                  setActiveStream(null);
                  setCurrentMetadata(null);
              }
          }
        }
      );
      soundRef.current = sound;
      console.log("Context: Sound loaded and playing.");
      
      // Don't clear loading state here - wait for status callback to confirm playing
      // isPlaying state is set by the status listener above

      // Initial metadata fetch + interval
      if (stream.metadataUrl) {
        fetchMetadata(stream.metadataUrl); // Fetch immediately
        metadataIntervalRef.current = setInterval(() => fetchMetadata(stream.metadataUrl), METADATA_REFRESH_INTERVAL_MS); // Fetch every 7s
      } else {
        setCurrentMetadata(null); // No metadata URL
      }

    } catch (error) {
      console.error('Context: Error playing stream:', error);
      setIsLoading(false);
      cleanupAudio();
      setActiveStream(null); 
      setCurrentMetadata(null);
    }
  };

  const togglePlayPause = async () => {
    // Edge case 3: Ignore toggle during loading
    if (isLoading) {
      console.log("Context: Cannot toggle while loading.");
      return;
    }
    
    if (!soundRef.current) {
        console.log("Context: No sound loaded to toggle.");
        // Optionally, try to replay the active stream if it exists? 
        // if (activeStream) await playStream(activeStream);
        return;
    };
    
    try {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded) {
            if (status.isPlaying) {
                console.log("Context: Pausing stream.");
                await soundRef.current.pauseAsync();
            } else {
                console.log("Context: Resuming stream.");
                await soundRef.current.playAsync();
            }
            // isPlaying state is set by the status listener
        }
    } catch (error) {
        console.error("Context: Error toggling play/pause:", error);
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

// Custom hook to use the PlayerContext
export const usePlayerContext = () => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayerContext must be used within a PlayerProvider');
  }
  return context;
}; 