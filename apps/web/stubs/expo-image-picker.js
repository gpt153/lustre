// Stub for expo-image-picker on web
export const launchImageLibraryAsync = async () => ({ canceled: true, assets: [] })
export const launchCameraAsync = async () => ({ canceled: true, assets: [] })
export const requestMediaLibraryPermissionsAsync = async () => ({ status: 'denied' })
export const requestCameraPermissionsAsync = async () => ({ status: 'denied' })
export const MediaTypeOptions = { All: 'All', Videos: 'Videos', Images: 'Images' }
export const UIImagePickerPresentationStyle = { AUTOMATIC: 0, FULL_SCREEN: 1, PAGE_SHEET: 2 }
export default {}
