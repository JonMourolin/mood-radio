import React, { useEffect } from 'react';
import { Platform } from 'react-native';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
}

const DEFAULT_TITLE = 'Mood Radio - Listen to your moods';
const DEFAULT_DESCRIPTION = 'Listen to your moods : Focus, High Energy, Melancholic, Rave, Explore. Stream curated electronic radio stations 24/7.';
const DEFAULT_KEYWORDS = 'electronic music, radio, ambient, focus music, meditation music, electronic radio, online radio, streaming music, mood music, chill music, techno, house, experimental music, drum & bass, jungle';

export default function SEOHead({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
}: SEOHeadProps) {
  useEffect(() => {
    // Only run on web platform
    if (Platform.OS !== 'web' || typeof document === 'undefined') {
      return;
    }

    const fullTitle = title || DEFAULT_TITLE;

    // Update document title
    document.title = fullTitle;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, property = false) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta');
        if (property) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Basic meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updateMetaTag('author', 'Mood Radio');
    updateMetaTag('robots', 'index, follow');
    updateMetaTag('theme-color', '#D22F49');
    updateMetaTag('language', 'en');
    updateMetaTag('geo.region', 'FR');
    updateMetaTag('geo.placename', 'France');

    // Open Graph tags
    updateMetaTag('og:title', fullTitle, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:type', 'music.radio_station', true);
    updateMetaTag('og:url', 'https://moodradio.fr', true);
    updateMetaTag('og:site_name', 'Mood Radio', true);
    updateMetaTag('og:image', 'https://moodradio.fr/images/logo/mood_logo_test.svg', true);
    updateMetaTag('og:locale', 'en', true);

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', fullTitle);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', 'https://moodradio.fr/images/logo/mood_logo_test.svg');

    // Favicon links
    const createOrUpdateLinkTag = (rel: string, href: string, type?: string, sizes?: string) => {
      let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
      
      if (!link) {
        link = document.createElement('link');
        link.rel = rel;
        document.head.appendChild(link);
      }
      
      link.href = href;
      if (type) link.setAttribute('type', type);
      if (sizes) link.setAttribute('sizes', sizes);
    };

    // Add all favicon links
    createOrUpdateLinkTag('icon', '/favicon.ico');
    createOrUpdateLinkTag('icon', '/favicon-16x16.png', 'image/png', '16x16');
    createOrUpdateLinkTag('icon', '/favicon-32x32.png', 'image/png', '32x32');
    createOrUpdateLinkTag('apple-touch-icon', '/apple-touch-icon.png');
    createOrUpdateLinkTag('manifest', '/site.webmanifest');

    // Cleanup function
    return () => {
      // No cleanup needed for meta tags as they should persist
    };
  }, [title, description, keywords]);

  return null; // This component doesn't render anything
} 