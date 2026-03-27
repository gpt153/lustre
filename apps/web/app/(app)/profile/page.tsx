'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from '@lustre/api'
import { useAuthStore } from '@lustre/app'
import { ProfileView, type ProfileViewData } from '@/components/profile/ProfileView'
import { ProfileEdit, type ProfileEditData, type ProfileEditPrompt } from '@/components/profile/ProfileEdit'
import styles from '@/components/profile/ProfileView.module.css'

export default function ProfilePage() {
  const router = useRouter()
  const authLogout = useAuthStore((state) => state.logout)
  const { data: profile, isLoading } = trpc.profile.get.useQuery()
  const { data: promptsData } = trpc.profile.getPrompts.useQuery()
  const logoutMutation = trpc.auth.logout.useMutation()
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    if (!isLoading && !profile) {
      router.push('/onboarding')
    }
  }, [isLoading, profile, router])

  if (isLoading) {
    return <div className={styles.loadingState}>Laddar profil…</div>
  }

  if (!profile) {
    return null
  }

  if (editing) {
    const editData: ProfileEditData = {
      id: profile.id,
      displayName: profile.displayName,
      bio: profile.bio,
      photos: profile.photos.map((p) => ({
        id: p.id,
        url: p.url,
        position: p.position,
      })),
    }

    const editPrompts: ProfileEditPrompt[] = (promptsData ?? []).map((p) => ({
      id: p.id,
      promptKey: p.promptKey,
      response: p.response,
      order: p.order,
    }))

    return (
      <ProfileEdit
        profile={editData}
        prompts={editPrompts}
        onBack={() => setEditing(false)}
      />
    )
  }

  const viewData: ProfileViewData = {
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
    prompts: (promptsData ?? []).map((p) => ({
      id: p.id,
      promptKey: p.promptKey,
      response: p.response,
      order: p.order,
    })),
  }

  function handleLogout() {
    logoutMutation.mutate(undefined, {
      onSuccess: () => { authLogout(); router.push('/auth') },
      onError: () => { authLogout(); router.push('/auth') },
    })
  }

  return (
    <ProfileView
      profile={viewData}
      isOwnProfile
      onEdit={() => setEditing(true)}
    />
  )
}
