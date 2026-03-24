import { create } from 'zustand'

interface ProfileState {
  hasProfile: boolean
  needsOnboarding: boolean
  setHasProfile: (v: boolean) => void
  setNeedsOnboarding: (v: boolean) => void
}

export const useProfileStore = create<ProfileState>((set) => ({
  hasProfile: false,
  needsOnboarding: true,
  setHasProfile: (v) => set({ hasProfile: v, needsOnboarding: !v }),
  setNeedsOnboarding: (v) => set({ needsOnboarding: v }),
}))
