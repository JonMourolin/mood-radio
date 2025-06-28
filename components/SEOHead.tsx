import React from 'react';
import { Head } from 'expo-head';
import { Platform } from 'react-native';

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'music.radio_station' | 'music.playlist';
  keywords?: string;
}

const DEFAULT_TITLE = 'Mood Radio - Listen to your moods';
const DEFAULT_DESCRIPTION = 'Discover and listen to curated electronic music radio stations. From focus and meditation to high energy and melancholic vibes. Stream 24/7 electronic music for every mood.';
const DEFAULT_KEYWORDS = 'electronic music, radio, ambient, focus music, meditation music, electronic radio, online radio, streaming music, mood music, chill music, techno, house, experimental music, drum & bass, jungle';
const BASE_URL = 'https://moodradio.fr';
const DEFAULT_OG_IMAGE = '/images/logo/mood_logo_test.svg';

export default function SEOHead({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_OG_IMAGE,
  url = BASE_URL,
  type = 'website',
  keywords = DEFAULT_KEYWORDS,
}: SEOHeadProps) {
  // Only render on web platform
  if (Platform.OS !== 'web') {
    return null;
  }

  const fullTitle = title ? `${title} | Mood Radio` : DEFAULT_TITLE;
  const fullImageUrl = image.startsWith('http') ? image : `${BASE_URL}${image}`;
  const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="Mood Radio" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="robots" content="index, follow" />
      
      {/* Theme and App Meta */}
      <meta name="theme-color" content="#D22F49" />
      <meta name="application-name" content="Mood Radio" />
      <meta name="apple-mobile-web-app-title" content="Mood Radio" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content="Mood Radio" />
      <meta property="og:locale" content="en" />
      <meta property="og:locale:alternate" content="en_US" />
      <meta property="og:locale:alternate" content="en_GB" />
      <meta property="og:locale:alternate" content="en_FR" />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      
      {/* Music-specific Open Graph (when type is music related) */}
      {type.startsWith('music.') && (
        <>
          <meta property="music:creator" content="Mood Radio" />
          <meta property="music:genre" content="Electronic" />
        </>
      )}
      
      {/* Additional SEO Meta Tags */}
      <meta name="language" content="en" />
      <meta name="geo.region" content="FR" />
      <meta name="geo.placename" content="France" />
      <meta name="revisit-after" content="7 days" />
      <meta name="distribution" content="global" />
      <meta name="rating" content="general" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />
      
      {/* Favicon and Icons */}
      <link rel="icon" type="image/png" href="/favicon.png" />
      <link rel="apple-touch-icon" href="/images/icon.png" />
      
      {/* Structured Data for Music Service */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "RadioStation",
          "name": "Mood Radio",
          "description": description,
          "url": fullUrl,
          "logo": fullImageUrl,
          "genre": ["Electronic", "Ambient", "Techno", "House", "Experimental", "Drum & Bass"],
          "broadcastServiceTier": "Free",
          "inLanguage": "en",
          "audience": {
            "@type": "Audience",
            "audienceType": "Music Lovers"
          }
        })}
      </script>
    </Head>
  );
} 