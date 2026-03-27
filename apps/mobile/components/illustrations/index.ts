import { ComponentType } from 'react'
import { NoMatches } from './NoMatches'
import { NoMessages } from './NoMessages'
import { NoEvents } from './NoEvents'
import { NoBadges } from './NoBadges'
import { EmptyFeed } from './EmptyFeed'
import { NoResults } from './NoResults'
import { Offline } from './Offline'
import { ErrorState } from './ErrorState'
import { CheckBackTomorrow } from './CheckBackTomorrow'

export { NoMatches } from './NoMatches'
export { NoMessages } from './NoMessages'
export { NoEvents } from './NoEvents'
export { NoBadges } from './NoBadges'
export { EmptyFeed } from './EmptyFeed'
export { NoResults } from './NoResults'
export { Offline } from './Offline'
export { ErrorState } from './ErrorState'
export { CheckBackTomorrow } from './CheckBackTomorrow'

export type IllustrationKey =
  | 'no-matches'
  | 'no-messages'
  | 'no-events'
  | 'no-badges'
  | 'empty-feed'
  | 'no-results'
  | 'offline'
  | 'error'
  | 'check-back-tomorrow'

export const ILLUSTRATIONS: Record<
  IllustrationKey,
  ComponentType<{ size?: number }>
> = {
  'no-matches': NoMatches,
  'no-messages': NoMessages,
  'no-events': NoEvents,
  'no-badges': NoBadges,
  'empty-feed': EmptyFeed,
  'no-results': NoResults,
  'offline': Offline,
  'error': ErrorState,
  'check-back-tomorrow': CheckBackTomorrow,
}
