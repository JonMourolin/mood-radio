# Tech Stack Overview

This document provides a concise and exhaustive overview of the technology stack used in the Web Radio Mobile project. It's intended for developers and technical stakeholders.

## Core Framework & Platform

*   **[Expo](https://expo.dev/):** The core platform for development. We use the Expo managed workflow to build and run the application across iOS, Android, and Web from a single TypeScript codebase.
*   **[React Native](https://reactnative.dev/):** The UI framework for building native components. We are using React 19.
*   **[TypeScript](https://www.typescriptlang.org/):** The primary programming language, providing static typing for better code quality and maintainability.

## Navigation & Routing

*   **[Expo Router](https://docs.expo.dev/router/introduction/):** Handles all app navigation. It uses a file-system-based routing convention, where directories and files in the `/app` folder define the routes.
*   **[React Navigation](https://reactnavigation.org/):** Used for native navigation components like bottom tabs (`@react-navigation/bottom-tabs`) and stack navigators (`@react-navigation/native-stack`).

## Audio Playback

*   **[React Native Track Player](https://react-native-track-player.js.org/):** The primary library for audio playback on native platforms, offering background audio support, notifications, and lock-screen controls.
*   **[Expo AV](https://docs.expo.dev/versions/latest/sdk/av/):** Used for simpler audio/video playback needs and complements `react-native-track-player`.
*   **[Howler.js](https://howlerjs.com/):** Used for robust and reliable audio playback on the Web platform, providing a consistent experience.
*   **[HLS.js](https://github.com/video-dev/hls.js/) & [Shaka Player](https://github.com/shaka-project/shaka-player):** Integrated for handling advanced streaming formats like HLS and DASH on the web.

## UI & Styling

*   **React Native Core Components:** Standard components like `View`, `Text`, and `StyleSheet` are used for the base layout and styling.
*   **[React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/):** Powers complex animations and gestures, used alongside **[React Native Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/docs/)**.
*   **Icons:**
    *   **[Expo Vector Icons](https://docs.expo.dev/guides/icons/):** Provides a comprehensive library of icons.
    *   **[Expo Symbols](https://docs.expo.dev/versions/latest/sdk/symbols/):** For using native SF Symbols on iOS.
    *   **[Lucide React Native](https://lucide.dev/):** For clean and consistent SVG-based icons.
*   **Special Effects:** Libraries like `expo-blur` and `expo-linear-gradient` are used for visual enhancements.
*   **[React Native WebView](https://github.com/react-native-webview/react-native-webview):** Used to embed web content within the native application.

## State Management & Data Persistence

*   **[React Context](https://react.dev/learn/passing-data-deeply-with-context):** The primary mechanism for global client-side state management. The `PlayerContext` is a key example.
*   **[@react-native-async-storage/async-storage](https://react-native-async-storage.github.io/async-storage/):** For persisting data on the user's device.
*   **[@vercel/kv](https://vercel.com/docs/storage/vercel-kv):** A serverless Redis database used for persistent data storage on the backend.

## Data Fetching & Services

*   **[Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API):** Standard API used for making network requests.
*   **[OpenAI API](https://openai.com/docs):** Integrated for AI-powered features within the application.
*   **Services Layer:** A dedicated `/services` directory abstracts external API interactions (e.g., `mixcloudService.ts`).
*   **[node-id3](https://github.com/Zazama/node-id3):** Used for reading and writing ID3 metadata tags from audio files.

## Tooling & Workflow

*   **[NPM](https://www.npmjs.com/):** The package manager for handling project dependencies.
*   **[Jest](https://jestjs.io/) & [Jest Expo](https://github.com/expo/jest-expo):** The framework for unit and component testing.
*   **[Expo Lint](https://docs.expo.dev/more/expo-cli/#lint):** Enforces code style and catches potential errors.
*   **[Git & GitHub](https://github.com/):** Used for version control and source code management. 