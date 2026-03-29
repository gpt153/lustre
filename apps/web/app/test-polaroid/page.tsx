import PolaroidCard from '@/components/common/PolaroidCard'
import PolaroidMasonryGrid from '@/components/common/PolaroidMasonryGrid'
import FilterBar from '@/components/discover/FilterBar'
import DiscoverFAB from '@/components/discover/DiscoverFAB'

const PROFILES = [
  { name: 'Emma, 28', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=750&fit=crop' },
  { name: 'Sofia, 31', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=750&fit=crop' },
  { name: 'Lina, 25', img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&h=750&fit=crop' },
  { name: 'Alex, 33', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=750&fit=crop' },
  { name: 'Maja, 27', img: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&h=750&fit=crop' },
  { name: 'Julia, 30', img: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=600&h=750&fit=crop' },
  { name: 'Klara, 26', img: 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=600&h=750&fit=crop' },
  { name: 'Ida, 29', img: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&h=750&fit=crop' },
  { name: 'Daniel, 30', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&h=750&fit=crop' },
  { name: 'Chloe, 24', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&h=750&fit=crop' },
  { name: 'Liam, 28', img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&h=750&fit=crop' },
  { name: 'Maya, 26', img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=750&fit=crop' },
]

export default function TestPolaroidPage() {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #fff8f6 0%, #faebe6 50%, #f4e5e0 100%)',
      minHeight: '100vh',
    }}>
      {/* Wave 2: FilterBar */}
      <FilterBar profileCount={PROFILES.length} />

      <div style={{ padding: '48px' }}>
        {/* Wave 2: Discovery title */}
        <h1 style={{
          fontFamily: 'var(--font-epilogue, sans-serif)',
          fontSize: '48px',
          fontWeight: 800,
          letterSpacing: '-0.05em',
          color: '#211a17',
          marginBottom: '8px',
        }}>
          Daily Discoveries
        </h1>
        <p style={{
          fontSize: '14px',
          color: '#524439',
          fontStyle: 'italic',
          marginBottom: '40px',
        }}>
          Hittade {PROFILES.length} matchningar idag
        </p>

        {/* Wave 2: Discovery masonry grid with profile cards */}
        <PolaroidMasonryGrid>
          {PROFILES.map((profile, i) => (
            <PolaroidCard
              key={i}
              imageUrl={profile.img}
              imageAlt={`${profile.name}s profilbild`}
              caption={profile.name}
              stack={i < 3}
              hoverable
            />
          ))}
        </PolaroidMasonryGrid>
      </div>

      {/* Wave 2: FAB */}
      <DiscoverFAB />
    </div>
  )
}
