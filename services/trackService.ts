import config from '../app/config';

const DISCOGS_TOKEN = 'TJmLXAOganjkyfpLYSDwPdgxqFjcjglPlHrUaNjt';

// Interface pour les résultats de recherche Discogs
export interface DiscogsSearchResult {
  id: string;
  title: string;
  artist: string;
  album: string;
  year: string;
  coverUrl: string;
}

export interface Track {
  id: string;
  title: string;
  duration: number;
  addedAt: string;
  path: string; // Chemin du fichier audio
  // Nouvelles propriétés Discogs
  discogsData?: {
    title: string;
    artist: string;
    album: string;
    year: string;
    coverUrl: string;
    releaseId: string;
  }
}

async function fetchFromDiscogs(url: string, method: string = 'GET'): Promise<any> {
  try {
    const response = await fetch(url, {
      method,
      headers: {
        'User-Agent': 'WebRadioApp/1.0',
        'Authorization': `Discogs token=${DISCOGS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Discogs error:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching from Discogs:', error);
    throw error;
  }
}

export async function searchDiscogsReleases(query: string): Promise<DiscogsSearchResult[]> {
  try {
    const data = await fetchFromDiscogs(
      `https://api.discogs.com/database/search?q=${encodeURIComponent(query)}&type=release`
    );
    
    // Transformer les résultats au format attendu
    return data.results.map((result: any) => ({
      id: result.id.toString(),
      title: result.title.split(' - ')[1] || result.title,
      artist: result.title.split(' - ')[0] || 'Unknown Artist',
      album: result.title,
      year: result.year?.toString() || '',
      coverUrl: result.cover_image || ''
    }));
  } catch (error) {
    console.error('Error searching Discogs:', error);
    throw error;
  }
}

export async function getTracks(): Promise<Track[]> {
  try {
    console.log('Fetching tracks from:', `${config.API_URL}/tracks`);
    const response = await fetch(`${config.API_URL}/tracks`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('API Response:', data);
    
    // Si la réponse est un tableau, l'utiliser directement
    // Sinon, chercher la propriété qui contient le tableau de pistes
    const tracksData = Array.isArray(data) ? data : data.tracks || data.items || [];
    
    console.log('Tracks found:', tracksData.length);
    
    return tracksData.map((track: any) => ({
      id: track.id || track._id,
      title: track.title || track.name,
      duration: track.duration || 0,
      addedAt: track.addedAt || track.created_at || new Date().toISOString(),
      path: track.path || track.file_path || '', // Assurez-vous que le chemin est toujours présent
      discogsData: track.discogsData
    }));
  } catch (error) {
    console.error('Error fetching tracks:', error);
    throw error;
  }
}

export async function enrichTrack(track: Track, discogsData: DiscogsSearchResult): Promise<void> {
  try {
    // Envoyer les métadonnées au serveur
    const response = await fetch(`${config.API_URL}/tracks/${track.id}/metadata`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        path: track.path,
        metadata: {
          title: discogsData.title,
          artist: discogsData.artist,
          album: discogsData.album,
          year: discogsData.year,
          coverUrl: discogsData.coverUrl,
          releaseId: discogsData.id
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error updating metadata:', error);
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