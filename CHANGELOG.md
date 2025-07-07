# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [3.27.0] - 2025-07-07

### Added
- **Mobile Header Logo**: Replaced text header with branded logo on mobile app
  - Added logo display in mobile header using logo1.png
  - Implemented sticky header that remains visible during scrolling
  - Centered logo positioning for professional appearance

### Changed
- **Splash Screen Optimization**: Improved splash screen display and timing
  - Extended splash screen duration from 1 second to 2 seconds for better loading experience
  - Changed splash screen resizeMode from "contain" to "native" for proper logo sizing
  - Eliminated oversized logo display on splash screen
- **Navigation Transitions**: Enhanced app navigation with smooth fade transitions
  - Replaced default slide transition with elegant fade animation
  - Applied fade transition to all screen navigation for consistent UX
  - Improved visual continuity between screens

### Technical Improvements
- **App Launch Optimization**: Enhanced app startup experience and performance
  - Optimized splash screen timing and visual presentation
  - Improved header rendering with sticky positioning
  - Better mobile layout consistency across different screen sizes

## [3.26.0] - 2025-07-06

### Added
- **Professional App Icons Ecosystem**: Implemented comprehensive icon set across all platforms
  - Complete iOS AppIcon.appiconset with all required sizes (60pt, 40pt, 29pt at @1x, @2x, @3x)
  - Android launcher icons for all densities (mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi)
  - Professional web favicon ecosystem with multiple sizes (16x16, 32x32)
  - PWA manifest icons (192x192, 512x512) for standalone app experience
  - Future-ready macOS and watchOS icon sets for platform expansion
- **Enhanced Splash Screen**: Updated app startup experience
  - New horizontal splash screen design (404x147) optimized for mobile displays
  - RGBA format with transparency support for refined visual presentation
  - Improved aspect ratio eliminates excessive padding on mobile devices

### Changed
- **App Icon Configuration**: Updated platform-specific icon configurations
  - iOS now uses complete AppIcon.appiconset for optimal native experience
  - Android configured with high-resolution launcher icons
  - Web PWA icons properly referenced in site.webmanifest
  - Consistent branding across all platforms and app stores
- **Asset Organization**: Streamlined icon asset structure
  - Organized icons by platform (iOS, Android, web, macOS, watchOS)
  - Eliminated redundancy between assets/ and public/ directories
  - Professional icon hierarchy ensures consistent visual identity

### Removed
- **Legacy Icon Assets**: Cleaned up outdated icon files
  - Removed old mood_radio_ios_icon.png and mood_radio_android_icon.png
  - Eliminated redundant favicon.png from assets/images/
  - Removed obsolete android-chrome-*.png files (replaced with icon-*.png)
  - Cleaned up unused React logo assets and outdated global images

### Technical Improvements
- **Build Optimization**: Enhanced app build configuration for better icon handling
  - Updated app.json to use AppIcon.appiconset for iOS builds
  - Configured Android with platform-specific launcher icons
  - Optimized file sizes while maintaining quality across all icon variants
  - Future-proofed icon structure supports additional platforms (macOS, watchOS)

## [3.25.0] - 2025-07-06

### Changed
- **Mobile Navigation Simplification**: Completely removed tab bar navigation for a cleaner single-screen mobile experience
  - Eliminated bottom tab bar with multiple tabs (Live, Mixes, Settings)
  - Simplified mobile navigation to focus solely on the Live radio screen
  - Reduced navigation complexity and improved user focus on core functionality
- **Architecture Optimization**: Streamlined mobile app structure for better performance
  - Removed unused tab-related components and configurations
  - Simplified `(tabs)/_layout.tsx` from 53 lines to 12 lines of code
  - Cleaned up navigation logic across all platforms

### Removed
- **Tab Bar Components**: Removed all tab bar related UI components
  - Deleted `TabBarBackground.tsx` and `TabBarBackground.ios.tsx` components
  - Removed tab navigation imports and configurations
  - Eliminated tab-specific styling and background blur effects
- **Multi-tab Navigation**: Removed Settings and Mixes tabs from mobile navigation
  - Disabled `href` for settings and mixcloud tabs
  - Focused mobile experience on Live radio streaming only

### Technical Improvements
- **Code Cleanup**: Significant reduction in mobile navigation complexity
  - Removed unused imports (Tabs, Ionicons, Platform from tab layout)
  - Eliminated redundant tab bar styling and configuration
  - Streamlined mobile layout rendering with universal `<Slot />` approach

## [3.24.1] - 2025-07-05

### Fixed
- **Safari Mobile Status Bar**: Fixed red status bar background on Safari mobile iOS by updating theme-color meta tag from #D22F49 to #000000 for consistent black theme
- **Footer Layout**: Optimized footer spacing for better visual balance
  - Reduced paddingTop from 60px to 20px (67% reduction)
  - Reduced paddingBottom from 40px to 10px (75% reduction)  
  - Decreased logo size from 32px to 26px for more compact design
  - Reduced copyright text size from 12px to 10px for better hierarchy
- **Loading State Messages**: Improved audio loading feedback in player components
  - Replaced confusing "Paused" text with informative "Connecting..." during stream initialization
  - Enhanced loading state logic with proper text progression: "Connecting..." → "Streaming..." → "Ready"
  - Updated MiniPlayer, FullScreenPlayer, and navigation params for consistent messaging

### Changed
- **Visual Consistency**: Enhanced overall interface cohesion by addressing mobile Safari theming issues and optimizing spacing throughout the application

## [3.24.0] - 2025-07-05

### Added
- **Audio Loading Feedback System**: Implemented comprehensive loading indicators during audio stream initialization.
  - Added ActivityIndicator spinner that replaces play button during loading
  - Real-time visual feedback on user interaction for better perceived performance
  - Smart loading state management prevents UI flickering between states
- **Complete Favicon Support**: Added comprehensive favicon implementation for all browsers and devices.
  - ICO, PNG favicons in multiple sizes (16x16, 32x32)
  - Apple Touch Icon for iOS devices
  - Android Chrome icons (192x192, 512x512) for PWA support
  - Web App Manifest for proper PWA integration

### Changed
- **Enhanced Audio UX**: Improved audio streaming user experience with immediate visual feedback.
  - Smooth state transitions: Play → Loading Spinner → Pause/Stop
  - Eliminated confusing delays and loading uncertainty
- **SEO and Branding**: Enhanced web application branding with proper favicon ecosystem.
  - Updated site.webmanifest with "Mood Radio" branding
  - Dynamic favicon injection via SEOHead component

### Fixed
- **Edge Case Handling**: Implemented robust edge case management for audio loading.
  - Prevents double-click issues during loading (ignores subsequent clicks)
  - Smart stream switching (last request priority for rapid station changes)
  - Disabled toggle functionality during loading to prevent race conditions
  - 10-second timeout with automatic fallback to normal state
- **Loading State Synchronization**: Fixed timing issues between loading indicators and actual audio playback.
  - Loading spinner only disappears when audio actually starts playing
  - Eliminated brief flash of play button before pause button appears

### Technical Improvements
- **PlayerContext Enhancement**: Extended player context with isLoading state for centralized loading management
- **Component Architecture**: Improved StreamItem component with loading state props and conditional rendering
- **State Management**: Better synchronization between audio status callbacks and UI state updates

## [3.23.0] - 2025-06-29

### Changed
- **Wording Improvements**: Refined mood descriptions for better clarity and conciseness.
- Updated "FOCUS" description from "Meditation, relax and focus" to "Relax and focus".
- Updated "HIGH ENERGY" description from "Uplifting, energetic and fun" to "Uplifting and energetic".
- Updated "MELANCHOLIC" description from "Dark, moody and melancholic" to "Moody and melancholic".
- Updated "RAVE" description from "Angry, aggressive and intense" to "Fast and intense".
- Updated "EXPLORE" description from "Futuristic, experimental and cosmic" to "Futuristic and experimental".
- Updated main mix title from "MOOD RADIO MAIN MIX" to "MOODS MAIN MIX".
- Updated main mix description for better readability.

### Refactoring
- **Code Deduplication**: Eliminated duplicate stream data definitions between native and web platforms.
- Introduced centralized `commonStreamData` structure to maintain single source of truth for mood information.
- Refactored asset loading with platform-specific mapping to avoid require() dynamic path issues.
- Improved code maintainability by reducing redundancy from ~120 lines to ~80 lines of data definitions.

## [3.22.0] - 2025-06-28

### Changed
- **URL Structure Update**: Changed main navigation URL from `/moods` to `/live` for better semantic meaning.
- Renamed all mood-related routes and components to reflect live streaming focus.
- Updated SEO meta tags to emphasize "Live Electronic Music Radio" branding.
- Removed automatic "| Mood Radio" suffix from page titles for cleaner SEO presentation.

### Refactoring
- Renamed `InfiniteScreen` component to `LiveScreen` for better naming consistency.
- Updated tab navigation labels from "Moods" to "Live".
- Refactored component imports and exports to match new naming convention.

## [3.21.0] - 2025-01-28

### Fixed
- Fixed mobile web video display issue by implementing conditional rendering based on device type.
- Replaced video backgrounds with static images on mobile web to prevent black screens.
- Maintained video hover functionality on desktop while providing proper fallback for mobile browsers.

### Changed
- Enhanced user agent detection to differentiate between desktop and mobile web experiences.
- Improved performance on mobile devices by avoiding unnecessary video loading.

## [3.20.0] - 2025-01-28

### Added
- Implemented comprehensive SEO optimization with meta tags, Open Graph, and Twitter Cards.
- Added structured data (JSON-LD) for better search engine understanding as a RadioStation.
- Created centralized SEO component (`SEOHead`) for managing all meta tags.
- Added robots.txt file to guide search engine crawling.

### Changed
- Updated site URL from Vercel deployment to custom domain `https://moodradio.fr`.
- Configured international SEO with English content (`en`) and French hosting (`geo.region=FR`).
- Added support for multiple English locales (US, GB, FR) for better international reach.
- Enhanced keywords with additional genres including "drum & bass" and "jungle".
- Updated site title to "Mood Radio - Listen to your moods" for better branding.

### SEO Improvements
- Optimized meta descriptions for electronic music streaming and mood-based radio stations.
- Implemented proper canonical URLs and favicon configuration.
- Added theme color and mobile app meta tags for better mobile experience.
- Configured music-specific Open Graph properties for social media sharing.

## [3.19.0] - 2025-01-23

### Changed
- Simplified header navigation by hiding the "Moods" section and burger menu for a cleaner interface.
- Centered the logo in the header for better visual balance.
- Commented out footer navigation links (ABOUT, FAQ, CONTACT) to reduce clutter.
- Reduced footer infinity logo size from 48px to 32px for better proportions.

### UI/UX
- Streamlined navigation experience by removing redundant header navigation elements.
- Improved header layout with centered logo positioning.
- Cleaned up footer design with smaller logo and hidden navigation links.

## [3.18.0] - 2025-06-25

### Added
- Configured custom domain `moodradio.fr` for production deployment on Vercel.
- Set up SSL certificate with Let's Encrypt for the AzuraCast server using subdomain `radio.moodradio.fr`.

### Changed
- Migrated from IP-based audio streaming (`51.75.200.205`) to domain-based HTTPS streaming (`radio.moodradio.fr`).
- Updated `AZURACAST_BASE_URL` configuration to use HTTPS with the new domain.
- Resolved Mixed Content security issues by serving all resources over HTTPS.

### Fixed
- Fixed SSL certificate authority validation errors by implementing proper domain-based SSL certificates.
- Eliminated browser security warnings related to mixed HTTP/HTTPS content.

## [3.17.0] - 2025-06-24

### Added
- Added a non-sticky footer to the Moods page with a logo and navigation links.

### Changed
- The "Mixes" section is now temporarily hidden from all navigation (mobile tab bar and web header) without deleting the underlying code.

## [3.16.0] - 2025-06-24

### Changed
- Reordered mood tiles to a new default layout.
- Renamed "MELANCHOLIA" mood to "MELANCHOLIC".
- Hid the vertical scroll indicator on the Moods screen.

### Performance
- Implemented a new asset loading strategy for the web using a `public` directory to serve static media files. This drastically improves initial page load speed and removes the white screen flash.
- Updated `ARCHITECTURE.md` to document the new asset strategy and the role of the `public` directory.

## [3.15.0] - 2025-06-22

### Refactoring
- Centralized AzuraCast configuration (`AZURACAST_BASE_URL`, `METADATA_REFRESH_INTERVAL_MS`) into `config.ts`.
- Refactored Mixcloud service to centralize its configuration and add strong typing for the API response.
- Created dedicated type files (`types/api.ts`, `types/mix.ts`) to separate external API contracts from internal data models, improving type safety and code clarity.
- Removed dead code: the unused `app/web/mixcloud.tsx` screen.

## [3.14.0] - 2025-06-22

### Refactoring
- Performed a major cleanup of the project structure.
- Removed numerous unused components, configuration files, scripts, and old documentation (`ParallaxScrollView`, `Collapsible`, `Header.tsx`, `app/config.ts`, `reset-project.js`, etc.).
- Deleted obsolete type definition files (`expo-env.d.ts`, `types/env.d.ts`).

### Chore
- Improved and cleaned up the `.gitignore` file.
- Centralized versioning in `package.json` and removed the redundant `VERSION` file.
- Updated project version to `3.14.0`.

### Documentation
- Created a new `docs/` directory to centralize all project documentation.
- Renamed documentation files to uppercase (`ARCHITECTURE.md`, `STACK.md`).
- Added a comprehensive `STACK.md` file detailing the project's tech stack.

## [3.13.0] - 2025-06-21

### Documentation
- Completed and enriched the `architecture.md` file with a comprehensive overview of the project structure.
- Documented the role of each directory (`/app`, `/components`, `/context`, `/hooks`, etc.).
- Detailed the purpose of key configuration files (`package.json`, `config.ts`, etc.).

## [3.12.0] - 2025-06-20

### Documentation
- Added detailed descriptions of all root-level configuration files and primary project directories to `architecture.md`.
- Clarified the roles and relationships between key concepts like React Hooks and Context.
- Identified and documented architectural points for future improvement (e.g., config vs. constants).

## [3.11.0] - 2025-06-20

### Fixed
- Corrected the mini-player close button functionality. It now properly stops the audio stream and hides the player by clearing the active stream state in the PlayerContext.
- Resolved a related TypeScript error for `NodeJS.Timeout` in the PlayerContext.

## [3.10.0] - 2025-06-20

### Added
- Added video backgrounds to mood tiles, which play on hover on web.
- Implemented a looping video player for a more dynamic user interface.

### Changed
- Replaced static mood images with dynamic video assets.
- Refactored hover logic to manage video playback state.

### Fixed
- Corrected video `resizeMode` to `COVER` to ensure it fills the tile.

## [3.9.2] - 2025-06-04

### Changed
- Upgraded to Expo SDK 53.
- Ensured React 19 compatibility and updated related dependencies.
- Addressed EAS Build issues related to `package-lock.json`.

### Fixed
- Resolved the missing tab bar issue by correcting the initial route redirection to properly load the tabs layout.
- Ensured the `TabLayout` component in `app/(tabs)/_layout.tsx` executes correctly.
- Cleaned up routing by ensuring `app/(tabs)/moods.tsx` correctly imports and renders the main `InfiniteScreen` component from `app/moods.tsx`.

## [3.9.1] - 2025-05-27

### Fixed
- Resolved critical app crashes occurring in EAS Preview builds, related to JavaScript exceptions and component rendering.
- Investigated and addressed issues causing the tab bar to be missing in Preview builds.
- Corrected default export/import issues for screen components.
- Ensured new architecture was disabled to maintain stability.
- Cleaned up `app.json` configurations, including `UIBackgroundModes`.
- Removed unused `react-native-track-player` dependency.
- Simplified `expo-av` initialization options.

## [3.9.0] - 2025-04-27

### Added
- Initial native splash screen configuration and hiding logic.
- Scrolling text ticker (`react-native-text-ticker`) for MiniPlayer track info.
- Embedded Mixcloud player using `WebView` within a modal on the Mixes screen (native only).

### Changed
- Updated Mixes screen UI: removed card borders, duration/play count; changed tag colors; hid default header; replicated Moods screen header style.
- Updated active tab bar tint color.

### Fixed
- Corrected splash screen image path in `app.json`.
- Addressed native build issues by regenerating native folders.

## [3.8.0] - 2025-04-26

### Added
- Implemented full-screen player modal accessible from mini player (native only).
- Centralized player state management using React Context (`PlayerContext`).
- Added scrollable header title ("Listen to your mood") to Moods screen (native only).

### Changed
- Refactored MiniPlayer to use two lines for metadata (track/station) with updated styling.
- Positioned MiniPlayer play/pause button on the right side.
- Updated "DJ Sets" tab title to "Mixes" and changed icon to `headset-sharp`.
- Adjusted status bar background color on Moods screen (native only).
- Updated MiniPlayer navigation to be native-only.

### Refactoring
- Moved `StreamData` and `StreamMetadata` types to `types/player.ts`.
- Refactored `moods.tsx` and created `FullScreenPlayer.native.tsx` to use `PlayerContext`.

## [3.7.2] - 2025-04-27

### Fixed
- Resolved network errors by reverting metadata URLs to HTTP and ensuring App Transport Security (ATS) allows HTTP connections for the stream/metadata domain.
- Corrected text rendering errors in FullScreenPlayer.
- Adjusted padding on Mixcloud page to match Moods page.

### Added
- Configured custom app icons for iOS and Android.
- Added headset icon next to title on Mixcloud page.

### Changed
- Set Mixcloud headset icon color to match Moods infinite icon color.

## [3.7.1] - 2025-04-26

### Fixed
- Removed duplicate `infinite.tsx` file within `app/(tabs)` that caused an import error after renaming the main screen to `moods.tsx`.

## [3.7.0] - 2025-04-26

### Removed
- Removed `/radio` route, associated components (`app/(tabs)/radio.tsx`, `app/web/radio.tsx`), and tab navigator entry.

### Changed
- Renamed `/infinite` route and associated files to `/moods`.
- Updated MiniPlayer text, removing the explicit "NOW PLAYING" label.
- Corrected historical version dates in CHANGELOG.md based on git history.

### Refactoring
- Updated tab layout (`app/(tabs)/_layout.tsx`), index redirect (`app/index.tsx`), and header navigation (`app/components/Navigation.tsx`) to reflect route changes.
- Added `app/(tabs)/moods.tsx` to explicitly link the tab to the screen component.

## [3.6.0] - 2025-04-22

### Changed
- Forced 2-column layout for infinite mixtapes screen on all screen sizes (`app/infinite.tsx`).
- Made custom header web-only, removed from mobile (`app/_layout.tsx`).
- Styled bottom tab bar background to black (`app/(tabs)/_layout.tsx`).

### Fixed
- Removed redundant default header from infinite mixtapes screen on mobile (`app/(tabs)/_layout.tsx`).
- Corrected scroll behavior on mixtape screen when MiniPlayer is active (`app/infinite.tsx`).

## [3.5.0] - 2025-04-22

### Added
- Responsive header navigation with dropdown menu for smaller screens (`app/components/Navigation.tsx`).
- Custom dark scrollbar theme for web (`app/infinite.tsx`).

### Changed
- Updated header "Radio" link to "Moods" and changed target route to `/infinite` (`app/components/Navigation.tsx`).
- Refined play/stop icons, sizes, and visibility logic on mixtape tiles (`app/infinite.tsx`, `app/(tabs)/radio.tsx`).

### Fixed
- Corrected scroll behavior on mixtape screen when MiniPlayer is active (`app/infinite.tsx`).

## [3.4.0] - 2024-07-27

### Added
- Background image added to the infinite mixtapes screen (`app/infinite.tsx`).

### Changed
- Made entire stream tile tappable on the infinite mixtapes screen (`app/infinite.tsx`).
- Refined responsive layout for infinite mixtapes grid (`app/infinite.tsx`).

### Fixed
- Ensured unique keys for streams and implemented single-column layout for small screens (`app/infinite.tsx`).
- Resolved background image path error (`app/infinite.tsx`).

### Removed
- Header title and subtitle from the infinite mixtapes screen (`app/infinite.tsx`).
- Global background image from infinite mixtapes screen (reverted in d58e2f6).

### Technical
- Added various image assets for mixtape moods.

## [3.3.4] - 2025-04-26

### Changed
- Adjusted stream tile height on mobile to 200px.
- Added responsive web layout: Single column below 480px, two columns at 480px and above.

### Fixed
- Resolved layout issue where single-column stream tiles did not fill the full screen width on mobile and small web breakpoints.

### Refactoring
- Reverted `useSafeAreaInsets` hook usage back to standard `SafeAreaView` component.
- Simplified styling logic for grid layout based on platform/breakpoint.

## [3.3.3] - 2025-04-26

### Changed
- Updated stream grid to display single column on mobile (`numColumns=1`) and two columns on web (`numColumns=2`).
- Removed horizontal padding from grid container on mobile to attempt full-width layout.

### Refactoring
- Attempted refactor from `ScrollView` + `.map` to `FlatList` for stream grid.
- Reverted grid implementation back to `ScrollView` + `.map` due to rendering issues with `FlatList` on web.

## [3.3.2] - 2025-04-26

### Changed
- Updated MiniPlayer label to "NOW PLAYING |" using a grey separator.
- Made MiniPlayer text (label, track info, stream title) uppercase and slightly larger (13pt).
- Renamed "M00D RADIO" stream to "MOOD RADIO MAIN MIX" and updated its description and emoji.
- Renamed "RAGE / RAVE" stream emoji.
- Renamed "EXPLORE" stream emoji.
- Reduced header navigation vertical padding for a slightly smaller height.
- Adjusted stream tile grid positioning on web to remove gap below header.
- Matched default stream tile text size and position to the hover state.

### Fixed
- Removed accidental dark background overlay from the default stream tile text.
- Corrected MiniPlayer separator color after "NOW PLAYING" to grey.

## [3.3.1] - 2025-04-26

### Added
- Close button to MiniPlayer on web to stop audio and hide player.
- Vertical separator before the close button in MiniPlayer on web.

### Changed
- Rearranged MiniPlayer layout on web: Play button left, info middle, close button right.
- Reworked MiniPlayer metadata display: [Icon] Now playing: [Track Info] | [Playlist Title].

## [3.3.0] - 2024-04-16

### Added
- New mixtape streams in `app/infinite.tsx`: "THE BIG CALM", "HIGH ENERGY", "RAGE", "MELANCHOLIA", "COSMICS TRIP".

### Changed
- Reordered mixtape streams in `app/infinite.tsx` to: Sonic Drift Radio, The Big Calm, High Energy, Rage, Melancholia, Cosmics Trip.

## [3.2.0] - 2024-04-16

### Added
- Implemented hover effect on mixtape tiles on the web version (`app/infinite.tsx`), showing description on hover while keeping the play button visible.

### Changed
- Refactored the mixtape grid layout in `app/infinite.tsx` to use a standard `View` with `flexWrap` instead of `FlatList`. This ensures better web compatibility and consistent layout across different screen sizes.

### Fixed
- Resolved issue where only the first few mixtape grid items were displayed on larger screen sizes (web); all 5 items are now consistently visible.
- Corrected TypeScript errors related to web-specific hover event props (`onMouseEnter`, `onMouseLeave`) in `app/infinite.tsx`.

## [3.1.0] - 2025-04-26

### Added
- Background image added to the main radio screen.

### Changed
- Refactored layout logic to use `useWindowDimensions` for dynamic responsiveness.
- Implemented multiple breakpoints (`sm`, `md`) for more granular control.
- Constrained maximum width of album art and metadata block on larger screens.
- Prevented horizontal scrolling on web view.

### Fixed
- Updated background image path to use `.jpg` extension.
- Corrected background image positioning to fill entire viewport.

## [3.0.0] - 2024-04-10

### Changed (Modifié)
- Refonte complète de l'interface utilisateur avec des principes de design brutaliste.
- Changement de nom de "tangerine_radio" à "SONIC DRIFT RADIO".
- Interface du lecteur simplifiée pour une meilleure expérience utilisateur.
- Conception responsive améliorée pour les petits écrans.
- Nouveau schéma de couleurs en noir et blanc.
- Mise à jour du design de la barre de navigation et des icônes.

### Removed (Supprimé)
- Curseur de contrôle du volume.
- Visualisation de forme d'onde.
- Superpositions de dégradés complexes.
- Éléments d'interface utilisateur superflus pour une interface plus propre.

### Fixed (Corrigé)
- Détection de l'état actif de la navigation pour les routes à onglets.
- Gestion de l'état de chargement et des messages d'erreur.
- Gestion des images de remplacement (placeholder).
- Configuration de la lecture audio en arrière-plan.

## [2.8.0] - 2025-04-06

### Changed
- Interface utilisateur : Masquage du header redondant sur l'écran Radio (mobile).
- Interface utilisateur : Masquage de la barre d'onglets sur la plateforme Web (remplacée par `<Slot />` pour afficher le contenu).

## [2.7.0] - 2025-04-06

### Changed
- Refactoring majeur de la gestion du lecteur radio.
- Consolidation de la logique de lecture et d'affichage des métadonnées AzuraCast pour les plateformes mobile et web (`app/(tabs)/radio.tsx` et `app/web/radio.tsx`).
- Mise à jour de la documentation technique pour refléter l'architecture AzuraCast.

### Removed
- Suppression du code obsolète lié à l'ancienne infrastructure Icecast/Liquidsoap.
- Suppression de l'ancien service `radioService.ts`.
- Suppression de l'ancien service `metadataService.ts` (WebSocket).
- Suppression de l'ancien service `trackService.ts`.
- Suppression de l'ancien composant `RadioPlayer.tsx`.
- Suppression de l'ancien serveur Node.js (`server/`).
- Suppression des constantes de configuration API et stream obsolètes.
- Suppression du hook `useMetadata`.

### Fixed
- Correction de l'incohérence de la logique radio entre les plateformes web et mobile.

## Roadmap

### [2.7.0] - Planned
- Récupération des métadonnées d'album depuis Liquidsoap
- Transmission des métadonnées d'album via l'endpoint /metadata
- Amélioration de l'affichage des informations d'album dans l'interface

## [2.6.0] - 2025-04-06

### Added
- Migration complète vers AzuraCast comme service de streaming
- Support des pochettes d'albums via l'API AzuraCast
- Intégration de l'endpoint nowplaying d'AzuraCast pour les métadonnées en temps réel
- Nouveau flux audio haute qualité via AzuraCast

### Changed
- Mise à jour de l'interface StreamMetadata pour inclure les pochettes d'albums
- Modification du composant Radio pour afficher les pochettes d'albums
- Optimisation de la récupération des métadonnées avec l'API AzuraCast
- Migration de l'URL du flux audio vers AzuraCast

### Technical
- Configuration de l'endpoint AzuraCast : http://51.75.200.205/api/nowplaying/tangerine_radio
- Mise à jour de l'URL du flux : http://51.75.200.205/listen/tangerine_radio/radio.mp3
- Amélioration de la gestion des métadonnées avec support des pochettes

## [2.5.0] - 2025-03-30

### Changed
- Simplification majeure de l'architecture de l'application
- Optimisation du service de gestion des pistes
- Focus sur les fonctionnalités essentielles de streaming radio

### Removed
- Suppression complète de l'intégration Discogs
- Nettoyage des composants et services non utilisés
- Retrait des fonctionnalités de gestion des métadonnées externes

## [2.4.1] - 2024-03-30

### Fixed
- Correction de l'architecture des fichiers pour maintenir la cohérence entre les versions web et mobile
- Restauration des fichiers de base essentiels dans le dossier /app
- Amélioration de la stabilité de l'application

### Technical
- Clarification de la structure du projet avec les composants de base dans /app
- Versions spécifiques dans /app/(tabs) pour mobile et /app/web pour la version web

## [2.3.0] - 2024-03-27

### Added
- Intégration du service de métadonnées Icecast
- Nouveau hook personnalisé `useIcecastMetadata` pour la gestion des métadonnées
- Service de métadonnées pour récupérer les informations des pistes en temps réel

### Changed
- Simplification de l'affichage des métadonnées (titre et artiste uniquement)
- Amélioration de la gestion des états de chargement
- Optimisation des performances avec mise en cache des métadonnées

### Removed
- Suppression de l'affichage du genre et du bitrate pour une meilleure expérience utilisateur

## [2.2.0] - 2024-03-29

### Added
- Configuration du serveur de streaming Icecast2
- Implémentation de Liquidsoap pour la gestion des playlists
- Nouveau point de montage pour le flux radio principal : `/stream.mp3`
- Système de gestion des fichiers audio avec permissions dédiées (groupe `radiogroup`)
- Page d'administration des pistes (/admin/tracks)
- Interface de gestion des pistes avec possibilité de suppression
- Service de tracks amélioré avec communication Telnet vers Liquidsoap

### Technical
- Icecast2 configuré sur le port `8000`
- Liquidsoap configuré pour lire les fichiers depuis `/var/liquidsoap/playlists/main`
- Permissions configurées pour permettre l'upload de fichiers via FTP
- Optimisation de la gestion des fichiers avec création du `radiogroup`

### Infrastructure
- Serveur de streaming déployé sur `51.75.200.205`
- Pare-feu configuré pour le port `8000`
- Mise en place des logs pour Icecast2 et Liquidsoap

### Fixed
- Correction des chemins d'importation dans les composants
- Amélioration de la récupération des pistes via Telnet

## [2.1.0] - 2025-03-25

### Ajouté
- Amélioration de l'intégration avec Mixcloud
- Nouveau design des cartes de mix avec une meilleure présentation des informations
- Affichage optimisé des tags et de la durée des mixes

### Modifié
- Refonte complète du composant MixCard pour une meilleure expérience utilisateur
- Optimisation du chargement des mixes depuis Mixcloud
- Amélioration de la gestion des erreurs lors du chargement des mixes

### Corrigé
- Correction des problèmes d'affichage des informations des mixes
- Amélioration de la stabilité lors du chargement des mixes
- Optimisation des performances de l'interface utilisateur

## [2.0.0] - 2024-03-25

### Ajouté
- Intégration avec l'API Mixcloud pour charger les DJ Sets directement depuis votre profil Mixcloud
- Affichage des informations détaillées des mixes (durée, tags, nombre d'écoutes)
- Possibilité d'ouvrir les mixes directement sur Mixcloud

### Modifié
- Refonte complète de l'interface utilisateur pour les DJ Sets
- Optimisation de l'expérience utilisateur sur web et mobile

### Supprimé
- Suppression de l'intégration avec Cloudinary
- Suppression du stockage local des DJ Sets (maintenant via Mixcloud)
- Suppression de la page LongMixs

## [1.1.1] - 2024-03-24

### Corrigé
- Correction des URLs de streaming pour "Mamene Break 2" et "Web Radio Mixes"
- Adaptation des points de montage aux noms réels sur le serveur Icecast (mamene2.mp3 et webradio.mp3)
- Amélioration de la fiabilité des connexions aux flux de streaming

## [1.1.0] - 2024-03-23

### Ajouté
- Intégration initiale avec TrackPlayer pour la lecture audio
- Support de la lecture en arrière-plan
- Interface utilisateur basique pour la webradio
- Nouvel onglet "Radio" permettant l'écoute de flux streaming en direct
- Service RadioService pour gérer la lecture des flux audio
- Composant RadioPlayer avec interface utilisateur pour la sélection et lecture des flux
- Affichage des informations détaillées pour chaque flux (artiste, genre, description)
- Sauvegarde du dernier flux écouté

### Technique
- Configuration d'expo-av pour la lecture audio en arrière-plan
- Mise en place des permissions nécessaires pour iOS et Android
- Gestion des états de lecture (chargement, lecture, pause, erreur)

## [1.0.0] - 2024-03-22

### Ajouté
- Interface utilisateur initiale avec deux onglets principaux : "Long Mixs" et "Settings"
- Écran des paramètres avec options de personnalisation
- Support pour l'écoute de mixs musicaux de longue durée
- Utilisation des Material Icons pour améliorer l'interface
- Déploiement web via EAS Hosting

### Technique
- Configuration du projet avec Expo et Expo Router
- Mise en place du déploiement avec EAS
- Publication du code source sur GitHub

## [0.2.0] - 2023-11-27

### Ajouts
- Implémentation d'un mécanisme de préchargement pour les DJ sets
- Intégration de TrackPlayer pour une meilleure gestion de l'audio
- Ajout d'une interface de progression pour le préchargement
- Support avancé pour les plateformes web et mobile

### Modifications
- Optimisation des paramètres de buffer pour TrackPlayer
- Configuration du serveur Icecast avec un burst-size augmenté (maintenant à 65535)
- Mise en œuvre du cache-busting pour éviter les problèmes de mise en cache
- Amélioration de la gestion des états audio (chargement, lecture, mise en tampon)

### Corrections
- Résolution partielle du problème de lecture depuis le début pour les DJ sets
- Amélioration de la fiabilité du streaming sur différentes plateformes
- Gestion améliorée des erreurs de lecture

## [0.1.0] - Version initiale

### Fonctionnalités
- Application React Native pour la lecture de flux radio web
- Support pour différents streams (webradio et DJ sets)
- Interface utilisateur de base pour la sélection et la lecture des flux
- Support multiplateforme (web, iOS, Android)

## [1.1.0] - 2024-03-29

### Added
- Admin tracks page for managing radio tracks
- Track service for handling API calls
- Configuration file for API endpoints
- Integration with Liquidsoap telnet server

### Changed
- Updated project structure with services directory
- Improved error handling for API calls

## [2.4.0] - 2024-03-30

### Removed
- Removed Discogs integration and all related components
- Cleaned up environment variables and type definitions related to Discogs

### Changed
- Simplified metadata handling to use only Icecast/Liquidsoap metadata
