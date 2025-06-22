/**
 * Describes the simplified, internal data model for a Mixcloud mix,
 * ready to be used by UI components.
 */
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