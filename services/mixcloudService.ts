import { Platform } from 'react-native';

// Types pour les données Mixcloud
export interface MixcloudTrack {
  id: string;
  key: string;
  url: string;
  name: string;
  description?: string;
  pictures: {
    medium?: string;
    large?: string;
    "320wx320h"?: string;
    "640wx640h"?: string;
    "768wx768h"?: string;
    "1024wx1024h"?: string;
  };
  created_time: string;
  audio_length: number;
  slug: string;
  user: {
    username: string;
    name: string;
    pictures?: {
      medium?: string;
      "320wx320h"?: string;
    };
  };
  tags: Array<{
    key: string;
    name: string;
  }>;
  play_count?: number;
  listener_count?: number;
}

export interface SimplifiedMix {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  durationInSeconds: number;
  username: string;
  url: string;
  embedUrl: string;
  tags: string[];
  playCount: number;
}

// Configuration de l'API Mixcloud
const MIXCLOUD_USERNAME = 'jonprod18';
const MIXCLOUD_API_BASE = 'https://api.mixcloud.com';

/**
 * Récupère les mixes d'un utilisateur Mixcloud
 */
export async function fetchUserMixes(username: string = MIXCLOUD_USERNAME): Promise<SimplifiedMix[]> {
  try {
    const response = await fetch(`${MIXCLOUD_API_BASE}/${username}/cloudcasts/`);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.data || !Array.isArray(data.data)) {
      console.error('Unexpected response format:', data);
      return [];
    }
    
    // Transformer les données de l'API en format simplifié
    const mixes: SimplifiedMix[] = data.data.map((mix: MixcloudTrack) => {
      // Construire l'URL d'intégration
      const embedUrl = Platform.OS === 'web'
        ? `https://www.mixcloud.com/widget/iframe/?hide_cover=1&feed=${encodeURIComponent(mix.key)}`
        : `https://www.mixcloud.com${mix.key}`;
      
      // Extraire les tags
      const tags = mix.tags ? mix.tags.map(tag => tag.name) : [];
      
      return {
        id: mix.slug || mix.key.split('/').pop() || '',
        title: mix.name || 'Untitled Mix',
        description: mix.description || '',
        coverUrl: mix.pictures?.large || mix.pictures?.medium || '',
        durationInSeconds: mix.audio_length || 0,
        username: mix.user.username,
        url: `https://www.mixcloud.com${mix.key}`,
        embedUrl,
        tags,
        playCount: mix.play_count || 0
      };
    });
    
    return mixes;
  } catch (error) {
    console.error('Error fetching Mixcloud mixes:', error);
    throw error;
  }
}

/**
 * Récupère les détails d'un mix spécifique
 */
export async function fetchMixDetails(username: string, mixKey: string): Promise<SimplifiedMix | null> {
  try {
    const response = await fetch(`${MIXCLOUD_API_BASE}/${username}/${mixKey}/`);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    const mix: MixcloudTrack = await response.json();
    
    // Construire l'URL d'intégration
    const embedUrl = Platform.OS === 'web'
      ? `https://www.mixcloud.com/widget/iframe/?hide_cover=1&feed=${encodeURIComponent(mix.key)}`
      : `https://www.mixcloud.com${mix.key}`;
    
    // Extraire les tags
    const tags = mix.tags ? mix.tags.map(tag => tag.name) : [];
    
    return {
      id: mix.slug || mix.key.split('/').pop() || '',
      title: mix.name || 'Untitled Mix',
      description: mix.description || '',
      coverUrl: mix.pictures?.large || mix.pictures?.medium || '',
      durationInSeconds: mix.audio_length || 0,
      username: mix.user.username,
      url: `https://www.mixcloud.com${mix.key}`,
      embedUrl,
      tags,
      playCount: mix.play_count || 0
    };
  } catch (error) {
    console.error(`Error fetching mix details for ${username}/${mixKey}:`, error);
    return null;
  }
}

/**
 * Transforme les secondes en format lisible (h:mm:ss)
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}

/**
 * Récupère les mixes mis en cache ou force une actualisation
 */
export async function getMixes(forceRefresh = false): Promise<SimplifiedMix[]> {
  // Ici, on pourrait ajouter une logique de mise en cache si nécessaire
  return fetchUserMixes();
} 