import { ProfileViewClientPage } from './ProfileViewClientPage'

interface Props {
  params: Promise<{ id: string }>
}

export default async function PublicProfilePage({ params }: Props) {
  const { id } = await params
  return <ProfileViewClientPage userId={id} />
}
