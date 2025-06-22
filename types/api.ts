/**
 * Describes the structure of the "song" object from the AzuraCast "Now Playing" API response.
 */
export interface AzuraCastSong {
  text: string;
  art?: string;
  artist?: string;
  title?: string;
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