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

// Data structure for the discovery modal content
interface DiscoveryData {
  track: string | null;
  artist: string | null;
  artUrl: string | null;
  moodImageUrl: string | null;
  description: string | null;
}

// PlayerContext: Manages the state of the audio player for the native application.
interface PlayerContextProps {
  activeStream: StreamData | null;
  currentMetadata: StreamMetadata | null;
  isPlaying: boolean;
  isLoading: boolean;
  playStream: (stream: StreamData) => Promise<void>;
  togglePlayPause: () => Promise<void>;
  
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
  const [currentMetadata, setCurrentMetadata] = useState<StreamMetadata | null>(null);
  const metadataIntervalRef = useRef<any>(null);

  // State for Discovery Modal
  const [isDiscoveryModalVisible, setDiscoveryModalVisible] = useState(false);
  const [discoveryData, setDiscoveryData] = useState<DiscoveryData | null>(null);
  const [isDiscoveryLoading, setDiscoveryLoading] = useState(false);
  const [discoveryError, setDiscoveryError] = useState<string | null>(null);


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
    // Add discovery modal state and functions to the context value
    isDiscoveryModalVisible,
    discoveryData,
    isDiscoveryLoading,
    discoveryError,
    openDiscoveryModal,
    closeDiscoveryModal,
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