// Cloudinary service pour gérer les requêtes à Cloudinary

// Le nom de votre cloud Cloudinary
const CLOUDINARY_CLOUD_NAME = 'dyom5zfbh';

// Chemin de base pour les mixs sur Cloudinary
const BASE_PATH = 'web-radio/longmixs/';

// Type pour les tags
export interface Tag {
  id: string;
  name: string;
}

// Type pour un Long Mix
export interface LongMix {
  id: string;
  title: string;
  artist: string;
  description: string;
  duration: number; // en secondes
  coverUrl: string;
  audioUrl: string;
  folder: string; // Nom du dossier contenant le mix
  tags: Tag[];
}

// Mapping des ressources pour chaque dossier
// Dans une vraie application, ces informations viendraient d'une API backend
// qui interrogerait Cloudinary pour obtenir les vraies ressources
interface ResourceMapping {
  [folder: string]: {
    audio: string; // ID public de la ressource audio (celui généré par Cloudinary)
    cover: string; // ID public de la couverture (celui généré par Cloudinary)
  }
}

// Simuler les IDs de ressources générés par Cloudinary
const cloudinaryResources: ResourceMapping = {
  'costa-arenbi': {
    audio: 'web-radio/longmixs/costa-arenbi/mix', // L'extension .mp3 est gérée par Cloudinary
    cover: 'web-radio/longmixs/costa-arenbi/cover'
  },
  'mamene-break': {
    audio: 'web-radio/longmixs/mamene-break/mix',
    cover: 'web-radio/longmixs/mamene-break/cover'
  },
  'mamene-break-2': {
    audio: 'web-radio/longmixs/mamene-break-2/mix',
    cover: 'web-radio/longmixs/mamene-break-2/cover'
  }
};

/**
 * Construit une URL Cloudinary pour un fichier audio
 * @param folder Le dossier contenant le mix
 * @returns L'URL complète vers le fichier audio
 */
export const buildCloudinaryAudioUrl = (folder: string): string => {
  const resourceId = cloudinaryResources[folder]?.audio || `${BASE_PATH}${folder}/mix`;
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/video/upload/${resourceId}`;
};

/**
 * Construit une URL Cloudinary pour une image
 * @param folder Le dossier contenant l'image
 * @param options Options de transformation (optionnel)
 * @returns L'URL complète vers l'image
 */
export const buildCloudinaryImageUrl = (folder: string, options: string = ''): string => {
  const resourceId = cloudinaryResources[folder]?.cover || `${BASE_PATH}${folder}/cover`;
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${options}${resourceId}`;
};

/**
 * Récupère la liste des mixs disponibles
 * Dans une application réelle, cela serait remplacé par un appel API à votre backend
 * qui récupérerait la liste des dossiers et leurs ressources depuis Cloudinary
 */
export const fetchLongMixs = async (): Promise<LongMix[]> => {
  // Simuler un délai réseau
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Définition des dossiers disponibles
  const folders = Object.keys(cloudinaryResources);
  
  // Résultat final
  const mixs: LongMix[] = [];
  
  // Pour chaque dossier, créer un mix
  folders.forEach((folder, index) => {
    // Génération d'un mix à partir du nom de dossier
    const formattedTitle = formatFolderName(folder);
    const durationMinutes = 60 + (index * 15); // Durée simulée
    
    mixs.push({
      id: (index + 1).toString(),
      title: formattedTitle,
      artist: determineArtistFromFolder(folder),
      description: `Mix de longue durée - ${formattedTitle}`,
      duration: durationMinutes * 60, // Conversion en secondes
      folder: folder,
      coverUrl: buildCloudinaryImageUrl(folder),
      audioUrl: buildCloudinaryAudioUrl(folder),
      tags: generateTagsFromFolderName(folder),
    });
  });
  
  return mixs;
};

/**
 * Formate le nom du dossier en titre présentable
 */
const formatFolderName = (folderName: string): string => {
  // Remplacer les tirets par des espaces et mettre en majuscule chaque mot
  return folderName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Détermine un nom d'artiste à partir du nom du dossier
 */
const determineArtistFromFolder = (folderName: string): string => {
  if (folderName.includes('costa')) {
    return 'Costa DJ';
  } else if (folderName.includes('mamene')) {
    return 'DJ Mamene';
  } else {
    return 'Unknown Artist';
  }
};

/**
 * Génère des tags en fonction du nom du dossier
 */
const generateTagsFromFolderName = (folderName: string): Tag[] => {
  const tags: Tag[] = [];
  
  if (folderName.includes('costa')) {
    tags.push({ id: 'costa', name: 'Balearic' });
    tags.push({ id: 'arenbi', name: 'Deep House' });
  }
  
  if (folderName.includes('mamene')) {
    tags.push({ id: 'mamene', name: 'Tech House' });
  }
  
  if (folderName.includes('break')) {
    tags.push({ id: 'break', name: 'Breakbeat' });
  }
  
  return tags;
}; 