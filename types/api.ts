/**
 * Describes the structure of the "song" object from the AzuraCast "Now Playing" API response.
 */
export interface AzuraCastSong {
  text: string;
  art?: string;
  artist?: string;
  title?: string;
  album?: string;
}

/**
 * Describes the structure of the "now_playing" object from the AzuraCast API response.
 */
export interface AzuraCastNowPlaying {
  song: AzuraCastSong;
  // Other potential properties like is_request, elapsed, remaining...
}

/**
 * Describes the root structure of the AzuraCast "Now Playing" API response.
 */
export interface AzuraCastApiResponse {
  now_playing: AzuraCastNowPlaying;
  // Other potential properties like station, listeners...
}

/**
 * Describes the structure of a single track/mix object from the Mixcloud API response.
 * This is an external API contract.
 */
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

/**
 * Describes the root structure of the Mixcloud /cloudcasts/ API response.
 */
export interface MixcloudApiResponse {
  data: MixcloudTrack[];
  // paging, name...
} 