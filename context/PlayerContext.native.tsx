import React, { createContext, useState, useRef, useContext, useEffect, ReactNode } from 'react';
import TrackPlayer, {
  Capability,
  Event,
  State,
  usePlaybackState,
  useProgress,
  useTrackPlayerEvents,
  Track,
} from 'react-native-track-player';
import { StreamData, StreamMetadata } from '@/types/player';
import { METADATA_REFRESH_INTERVAL_MS } from '../config';
import { AzuraCastApiResponse } from '@/types/api';

interface PlayerContextProps {
  activeStream: StreamData | null;
  currentMetadata: StreamMetadata | null;
  isPlaying: boolean;
  isLoading: boolean;
  playStream: (stream: StreamData) => Promise<void>;
  togglePlayPause: () => Promise<void>;
}

const PlayerContext = createContext<PlayerContextProps | undefined>(undefined);

interface PlayerProviderProps {
  children: ReactNode;
}

export const PlayerProvider: React.FC<PlayerProviderProps> = ({ children }) => {
  const [activeStream, setActiveStream] = useState<StreamData | null>(null);
  const [currentMetadata, setCurrentMetadata] = useState<StreamMetadata | null>(null);
  const metadataIntervalRef = useRef<any>(null);

  const { state: playbackState } = usePlaybackState();
  const isPlaying = playbackState === State.Playing;
  const isLoading = playbackState === State.Buffering || playbackState === State.Connecting;

  useEffect(() => {
    const setupPlayer = async () => {
      await TrackPlayer.setupPlayer();
      await TrackPlayer.updateOptions({
        capabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.Stop,
        ],
        compactCapabilities: [Capability.Play, Capability.Pause, Capability.Stop],
      });
    };
    setupPlayer();

    return () => {
      if (metadataIntervalRef.current) {
        clearInterval(metadataIntervalRef.current);
      }
      TrackPlayer.reset();
    };
  }, []);

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
          const currentTrack = await TrackPlayer.getTrack(0);
          if (currentTrack) {
            await TrackPlayer.updateMetadataForTrack(0, {
              title: newMetadata.song,
              artwork: newMetadata.artUrl,
              artist: activeStream?.title || 'Mood Radio'
            });
          }
        }
      }
    } catch (error) {
      console.error(`Error fetching metadata from ${url}:`, error);
    }
  };

  const playStream = async (stream: StreamData) => {
    if (!stream.streamUrl) {
      console.error(`Stream "${stream.title}" has no streamUrl.`);
      return;
    }

    if (activeStream?.id === stream.id) {
      togglePlayPause();
      return;
    }

    await TrackPlayer.reset();
    setActiveStream(stream);
    setCurrentMetadata(null);

    const track: Track = {
      url: stream.streamUrl,
      title: stream.title,
      artist: 'Live Stream',
      artwork: currentMetadata?.artUrl, 
    };

    await TrackPlayer.add([track]);
    await TrackPlayer.play();

    if (stream.metadataUrl) {
      if (metadataIntervalRef.current) {
        clearInterval(metadataIntervalRef.current);
      }
      fetchMetadata(stream.metadataUrl);
      metadataIntervalRef.current = setInterval(
        () => fetchMetadata(stream.metadataUrl),
        METADATA_REFRESH_INTERVAL_MS
      );
    }
  };

  const togglePlayPause = async () => {
    if (isPlaying) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  };
  
  const value = {
    activeStream,
    currentMetadata,
    isPlaying,
    isLoading,
    playStream,
    togglePlayPause,
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
};

export const usePlayerContext = () => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayerContext must be used within a PlayerProvider');
  }
  return context;
}; 