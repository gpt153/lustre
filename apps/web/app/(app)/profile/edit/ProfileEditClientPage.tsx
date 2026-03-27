'use client'

import { useRouter } from 'next/navigation'
import { trpc } from '@lustre/api'
import { ProfileEdit, type ProfileEditData, type ProfileEditPrompt } from '@/components/profile/ProfileEdit'
import editStyles from '@/components/profile/ProfileEdit.module.css'

export function ProfileEditClientPage() {
  const router = useRouter()
  const { data: profile, isLoading } = trpc.profile.get.useQuery()
  const { data: promptsData } = trpc.profile.getPrompts.useQuery()

  if (isLoading) {
    return <div className={editStyles.loadingState}>Laddar…</div>
  }

  if (!profile) {
    return null
  }

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
      onBack={() => router.push('/profile')}
    />
  )
}
