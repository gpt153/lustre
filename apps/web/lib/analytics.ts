export function trackEvent(eventName: string, properties?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return

  if (window.umami) {
    window.umami.track(eventName, properties)
  }
}

export function trackAppOnlyPromptImpression(feature: string): void {
  trackEvent('app_only_prompt_impression', { feature })
}

export function trackAppOnlyPromptClick(feature: string, action: string): void {
  trackEvent('app_only_prompt_click', { feature, action })
}

declare global {
  interface Window {
    umami?: {
      track: (eventName: string, properties?: Record<string, unknown>) => void
    }
  }
}
