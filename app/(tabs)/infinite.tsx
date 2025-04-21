import React from 'react';
// Importer le composant partagé (le chemin est correct depuis app/(tabs)/)
import { InfiniteScreen } from '../infinite';

// L'écran pour l'onglet mobile rend simplement le composant partagé
export default function InfiniteTabScreen() {
  return <InfiniteScreen />;
} 