// Stub for expo-av on web
export const Audio = {
  setAudioModeAsync: async () => {},
  Sound: {
    createAsync: async () => ({ sound: { playAsync: async () => {}, stopAsync: async () => {}, unloadAsync: async () => {}, setOnPlaybackStatusUpdate: () => {} } }),
  },
  requestPermissionsAsync: async () => ({ status: 'denied' }),
}
export const Video = {}
export const ResizeMode = { CONTAIN: 'contain', COVER: 'cover', STRETCH: 'stretch' }
export default {}
