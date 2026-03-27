export const APP_STORE_URL = 'https://apps.apple.com/app/lustre/id1234567890'
export const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.lovelustre.app'

export function getAppStoreLink(): string {
  if (typeof navigator === 'undefined') return APP_STORE_URL
  const ua = navigator.userAgent
  if (/android/i.test(ua)) return PLAY_STORE_URL
  if (/iphone|ipad|ipod/i.test(ua)) return APP_STORE_URL
  return APP_STORE_URL
}

export function isDesktop(): boolean {
  if (typeof navigator === 'undefined') return true
  return !/android|iphone|ipad|ipod/i.test(navigator.userAgent)
}

export function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

export function isAndroid(): boolean {
  if (typeof navigator === 'undefined') return false
  return /android/i.test(navigator.userAgent)
}
