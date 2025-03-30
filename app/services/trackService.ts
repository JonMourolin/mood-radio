import config from '../config';

export interface Track {
  id: string;
  title: string;
  duration: number;
  addedAt: string;
  path?: string;
  discogsData?: {
    title: string;
    artist: string;
    album: string;
    year: string;
  };
}

export interface DiscogsSearchResult {
  title: string;
  artist: string;
  album: string;
  year: string;
}

export async function getTracks(): Promise<Track[]> {
  try {
    const response = await fetch(`${config.API_URL}/tracks`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const tracks = await response.json();
    return tracks.map((track: Track) => ({
      ...track,
      duration: track.duration || 0,
      addedAt: track.addedAt || new Date().toISOString()
    }));
  } catch (error) {
    console.error('Error fetching tracks:', error);
    throw error;
  }
}

export async function deleteTrack(id: string): Promise<void> {
  try {
    const response = await fetch(`${config.API_URL}/tracks/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error deleting track:', error);
    throw error;
  }
}

export async function updateTrackMetadata(trackId: string, metadata: {
  path: string;
  title: string;
  artist: string;
  album: string;
  year: string;
}): Promise<void> {
  try {
    const response = await fetch(`${config.API_URL}/tracks/${trackId}/metadata`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metadata),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error updating metadata:', error);
    throw error;
  }
}
