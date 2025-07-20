import { StyleSheet } from 'react-native';

export const getStyles = (isDarkMode: boolean) => StyleSheet.create({
  miniPlayerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 75,
    backgroundColor: isDarkMode ? '#1C1C1E' : '#F2F2F7',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: isDarkMode ? '#2C2C2E' : '#D1D1D6',
  },
  miniPlayerArt: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  miniPlayerArtOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  miniPlayerArtPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniPlayerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  nowPlayingIcon: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D22F49',
    marginRight: 8,
  },
  miniPlayerTextContainer: {
    flex: 1,
  },
  miniPlayerTrackInfo: {
    color: isDarkMode ? '#FFFFFF' : '#000000',
    fontSize: 14,
    fontWeight: '600',
  },
  miniPlayerStreamTitle: {
    color: isDarkMode ? '#8E8E93' : '#6D6D72',
    fontSize: 12,
  },
  miniPlayerButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniPlayerPlayButton: {
    padding: 10,
  },
  miniPlayerSeparator: {
    width: 1,
    height: 20,
    backgroundColor: isDarkMode ? '#2C2C2E' : '#D1D1D6',
    marginHorizontal: 5,
  },
  miniPlayerCloseButton: {
    padding: 10,
  },
}); 