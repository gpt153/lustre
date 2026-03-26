// Stub for expo-location on web
export const getCurrentPositionAsync = async () => null
export const requestForegroundPermissionsAsync = async () => ({ status: 'denied' })
export const watchPositionAsync = async () => ({ remove: () => {} })
export const Accuracy = { Balanced: 3, High: 4, Highest: 5, Low: 2, Lowest: 1, BestForNavigation: 6 }
export const LocationAccuracy = { Balanced: 3, High: 4, Highest: 5, Low: 2, Lowest: 1, BestForNavigation: 6 }
export default {}
