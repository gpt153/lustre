import PolaroidCard from '@/components/common/PolaroidCard'
import PolaroidMasonryGrid from '@/components/common/PolaroidMasonryGrid'

export default function TestPolaroidPage() {
  return (
    <div style={{ background: '#fff8f6', minHeight: '100vh', padding: '48px' }}>
      <h1 style={{ fontFamily: 'var(--font-epilogue, sans-serif)', fontSize: '32px', fontWeight: 800, color: '#211a17', marginBottom: '32px' }}>
        Polaroid Component Test — Wave 1
      </h1>

      {/* Section 1: Single card at 280px */}
      <h2 style={{ fontFamily: 'var(--font-epilogue, sans-serif)', fontSize: '20px', color: '#524439', marginBottom: '16px' }}>
        Single Card (280px)
      </h2>
      <div style={{ display: 'flex', gap: '48px', marginBottom: '64px', flexWrap: 'wrap' }}>
        <div style={{ width: '280px' }}>
          <PolaroidCard
            imageUrl="https://picsum.photos/seed/lustre1/400/400"
            imageAlt="Test photo 1"
            caption="Emma, 28"
            rotation={-2}
            hoverable
          />
        </div>
        <div style={{ width: '280px' }}>
          <PolaroidCard
            imageUrl="https://picsum.photos/seed/lustre2/400/400"
            imageAlt="Test photo 2"
            caption="Alex, 32"
            rotation={3}
            stack
            hoverable
          />
        </div>
      </div>

      {/* Section 2: Masonry grid with 6 cards */}
      <h2 style={{ fontFamily: 'var(--font-epilogue, sans-serif)', fontSize: '20px', color: '#524439', marginBottom: '16px' }}>
        Masonry Grid (6 cards)
      </h2>
      <PolaroidMasonryGrid>
        {[1,2,3,4,5,6].map((i) => (
          <PolaroidCard
            key={i}
            imageUrl={`https://picsum.photos/seed/lustre${i}/400/${350 + i * 30}`}
            imageAlt={`Test photo ${i}`}
            caption={['Emma, 28', 'Alex, 32', 'Sofia, 25', 'Marcus, 29', 'Linnea, 31', 'Oscar, 27'][i-1]}
            hoverable
          />
        ))}
      </PolaroidMasonryGrid>
    </div>
  )
}
