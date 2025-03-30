import { useState, useEffect } from 'react';
import { metadataService, TrackMetadata } from '../services/metadataService';

export function useMetadata() {
  const [metadata, setMetadata] = useState<TrackMetadata | null>(
    metadataService.getCurrentMetadata()
  );

  useEffect(() => {
    // S'abonner aux mises à jour des métadonnées
    const unsubscribe = metadataService.subscribe((newMetadata) => {
      setMetadata(newMetadata);
    });

    // Cleanup lors du démontage du composant
    return () => {
      unsubscribe();
    };
  }, []);

  return metadata;
} 