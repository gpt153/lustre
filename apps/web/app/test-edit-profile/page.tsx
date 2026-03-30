'use client'

import ProfileEditPage from '@/components/profile/ProfileEditPage'
import type { PhotoItem } from '@/components/profile/PhotoGrid'

const MOCK_PHOTOS: PhotoItem[] = [
  {
    id: '1',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=600&fit=crop',
    alt: 'Profile photo of Emma at sunset',
    caption: 'Profile Masterpiece',
  },
  {
    id: '2',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop',
    alt: 'Emma in the city',
    caption: 'Stadsliv',
  },
  {
    id: '3',
    url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop',
    alt: 'Emma on a hike',
    caption: 'Fjallvandring',
  },
]

const MOCK_FORM_DATA = {
  firstName: 'Emma',
  location: 'Stockholm',
  bio: 'Kreativ sjal med passion for konst, matlagning och langa promenader langs vattnet. Jag tror pa att leva i nuet och hitta gladje i de sma sakerna. Soker nagon som vagar vara sann mot sig sjalv.',
  interests: ['Konst', 'Matlagning', 'Yoga'],
  lookingFor: ['Long-term connection'],
  showDistance: true,
  showAge: true,
  newMessages: true,
  discoveryAlerts: false,
}

export default function TestEditProfilePage() {
  return (
    <ProfileEditPage
      photos={MOCK_PHOTOS}
      initialData={MOCK_FORM_DATA}
      onSave={() => {
        console.log('Profil sparad (demo)')
      }}
      onAddPhoto={() => {
        console.log('Lagg till foto (demo)')
      }}
      onEditPhoto={(id) => {
        console.log(`Redigera foto ${id} (demo)`)
      }}
      onDeletePhoto={(id) => {
        console.log(`Ta bort foto ${id} (demo)`)
      }}
    />
  )
}
