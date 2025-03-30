import NodeID3 from 'node-id3';
import { DiscogsSearchResult } from './trackService';

export interface AudioMetadata {
  title: string;
  artist: string;
  album: string;
  year: string;
  coverUrl: string;
}

export async function writeMetadataToFile(filePath: string, metadata: AudioMetadata): Promise<void> {
  try {
    // Créer les tags ID3
    const tags = {
      title: metadata.title,
      artist: metadata.artist,
      album: metadata.album,
      year: metadata.year,
      // On peut ajouter d'autres tags si nécessaire
    };

    // Écrire les tags dans le fichier
    NodeID3.write(tags, filePath);

    // TODO: Gérer la cover si nécessaire
    // Pour l'instant, on se concentre sur les métadonnées textuelles

    console.log('Métadonnées écrites avec succès dans:', filePath);
  } catch (error) {
    console.error('Erreur lors de l\'écriture des métadonnées:', error);
    throw error;
  }
}

export async function readMetadataFromFile(filePath: string): Promise<AudioMetadata | null> {
  try {
    const tags = NodeID3.read(filePath);
    
    if (!tags) {
      return null;
    }

    return {
      title: tags.title || '',
      artist: tags.artist || '',
      album: tags.album || '',
      year: tags.year || '',
      coverUrl: '', // On ne gère pas la cover pour l'instant
    };
  } catch (error) {
    console.error('Erreur lors de la lecture des métadonnées:', error);
    return null;
  }
} 