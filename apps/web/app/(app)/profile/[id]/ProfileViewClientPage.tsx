'use client'

import { trpc } from '@lustre/api'
import { ProfileView, type ProfileViewData, type ProfileViewKudos } from '@/components/profile/ProfileView'
import styles from '@/components/profile/ProfileView.module.css'

interface Props {
  userId: string
}

export function ProfileViewClientPage({ userId }: Props) {
  const { data: profile, isLoading, error } = trpc.profile.getPublic.useQuery({ userId })
  const kudosQuery = trpc.kudos.getProfileKudos.useQuery({ userId })

  if (isLoading) {
    return <div className={styles.loadingState}>Laddar profil…</div>
  }

  if (error || !profile) {
    return <div className={styles.errorState}>Profilen hittades inte</div>
  }

  const profileData: ProfileViewData = {
    id: profile.id,
    displayName: profile.displayName,
    age: profile.age,
    bio: profile.bio,
    photos: profile.photos.map((p) => ({
      id: p.id,
      url: p.url,
      thumbnailSmall: p.thumbnailSmall,
      position: p.position,
    })),
  }

  const kudosData: ProfileViewKudos | undefined = kudosQuery.data
    ? {
        totalCount: kudosQuery.data.totalCount,
        badges: kudosQuery.data.badges.map((b) => ({
          badgeId: b.badgeId,
          name: b.name,
          count: b.count,
        })),
      }
    : undefined

  return (
    <ProfileView
      profile={profileData}
      kudos={kudosData}
    />
  )
}
