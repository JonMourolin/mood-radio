# Tech Stack Overview

This document provides a concise and exhaustive overview of the technology stack used in the Web Radio Mobile project. It's intended for developers and technical stakeholders.

## Core Framework & Platform

*   **[Expo](https://expo.dev/):** The core platform for development. We use the Expo managed workflow to build and run the application across iOS, Android, and Web from a single TypeScript codebase.
*   **[React Native](https://reactnative.dev/):** The UI framework for building native components. We are using React 19.
*   **[TypeScript](https://www.typescriptlang.org/):** The primary programming language, providing static typing for better code quality and maintainability.

## Navigation & Routing

*   **[Expo Router](https://docs.expo.dev/router/introduction/):** Handles all app navigation. It uses a file-system-based routing convention, where directories and files in the `/app` folder define the routes.

## Audio Playback

*   **[Expo AV](https://docs.expo.dev/versions/latest/sdk/av/):** The primary library for managing audio playback (playing, pausing, seeking) on native platforms (iOS & Android).
*   **[Howler.js](https://howlerjs.com/):** Used for robust and reliable audio playback on the Web platform, providing a consistent experience.

## UI & Styling

*   **React Native Core Components:** Standard components like `View`, `Text`, and `StyleSheet` are used for the base layout and styling.
*   **[React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/):** Powers complex animations and gestures.
*   **[Expo Vector Icons](https://docs.expo.dev/guides/icons/):** Provides a comprehensive library of icons used throughout the application.
*   **Special Effects:** Libraries like `expo-blur` and `expo-linear-gradient` are used for visual enhancements.

## State Management

*   **[React Context](https://react.dev/learn/passing-data-deeply-with-context):** The primary mechanism for global state management. The `PlayerContext` is a key example, managing the state of the audio player (current track, play/pause status) across the entire application.

## Data Fetching & Services

*   **[Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API):** Standard browser/native API used for making network requests, for example, to the Mixcloud API.
*   **Services Layer:** A dedicated `/services` directory abstracts external API interactions (e.g., `mixcloudService.ts`).

## Tooling & Workflow

*   **[NPM](https://www.npmjs.com/):** The package manager for handling project dependencies.
*   **[Jest](https://jestjs.io/) & [Jest Expo](https://github.com/expo/jest-expo):** The framework for unit and component testing.
*   **[Expo Lint](https://docs.expo.dev/more/expo-cli/#lint):** Enforces code style and catches potential errors.
*   **[Git & GitHub](https://github.com/):** Used for version control and source code management. 