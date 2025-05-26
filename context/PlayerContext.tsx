import React, { createContext, useState, useRef, useContext, useEffect, ReactNode } from 'react';
import { Audio } from 'expo-av';
import { StreamData, StreamMetadata } from '@/types/player';

interface PlayerContextProps {
  activeStream: StreamData | null;
  currentMetadata: StreamMetadata | null;
  isPlaying: boolean;
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
  const [currentMetadata, setCurrentMetadata] = useState<StreamMetadata | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const metadataIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
    if (metadataIntervalRef.current) {
      clearInterval(metadataIntervalRef.current);
      metadataIntervalRef.current = null;
    }
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
    // Don't clear metadata here, keep it until a new stream starts
    // setCurrentMetadata(null); 
    // Don't clear active stream here? Or maybe we should?
    // setActiveStream(null);
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
      const data = await response.json();
      if (data.now_playing && data.now_playing.song) { // Ensure song object exists
        const track = data.now_playing.song;
        const newMetadata: StreamMetadata = {
          // title: track.title || 'Unknown Title',
          // artist: track.artist || 'Unknown Artist',
          // album: track.album || 'Unknown Album',
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
    if (soundRef.current && activeStream?.id === stream.id) {
        console.log("Context: Stream already loaded. Toggling play/pause instead.");
        await togglePlayPause();
        return;
    }
    
    await cleanupAudio(); // Clean previous stream first
    setActiveStream(stream); // Set active stream immediately
    setCurrentMetadata(null); // Clear old metadata

    // // Placeholder for testing UI without actual streaming
    // if (stream.streamUrl === 'placeholder') {
    //   console.warn("Context: Placeholder stream selected, cannot play.");
    //   setIsPlaying(false); 
    //   setCurrentMetadata({ song: stream.title, artist: "(No Stream URL)" }); 
    //   return;
    // }

    try {
      console.log(`Context: Loading sound: ${stream.streamUrl}`);
      const { sound } = await Audio.Sound.createAsync(
        { uri: stream.streamUrl },
        { shouldPlay: true },
        (status) => { // onPlaybackStatusUpdate
          if (status.isLoaded) {
              setIsPlaying(status.isPlaying);
          } else {
              if (status.error) {
                  console.error(`Context Playback Error: ${status.error}`);
                  cleanupAudio(); 
                  setActiveStream(null); // Clear stream if playback fails
                  setCurrentMetadata(null);
              }
          }
        }
      );
      soundRef.current = sound;
      console.log("Context: Sound loaded and playing.");
      // isPlaying state is set by the status listener above

      // Initial metadata fetch + interval
      if (stream.metadataUrl) {
        fetchMetadata(stream.metadataUrl); // Fetch immediately
        metadataIntervalRef.current = setInterval(() => fetchMetadata(stream.metadataUrl), 7000); // Fetch every 7s
      } else {
        setCurrentMetadata(null); // No metadata URL
      }

    } catch (error) {
      console.error('Context: Error playing stream:', error);
      cleanupAudio();
      setActiveStream(null); 
      setCurrentMetadata(null);
    }
  };

  const togglePlayPause = async () => {
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