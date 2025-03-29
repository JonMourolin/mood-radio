import config from '../app/config';

export interface Track {
  id: string;
  title: string;
  duration: number;
  addedAt: string;
  path?: string;
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
      path: track.path
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