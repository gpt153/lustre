'use client'

import { useParams, useRouter } from 'next/navigation'
import { YStack, XStack, Text, Spinner, Button } from 'tamagui'
import { useCampaigns, useAnalytics, useActivateCampaign, usePauseCampaign } from '@lustre/app/src/hooks/useAds'

type CampaignStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'EXHAUSTED' | 'COMPLETED'

const STATUS_LABELS: Record<CampaignStatus, string> = {
  DRAFT: 'Utkast',
  ACTIVE: 'Aktiv',
  PAUSED: 'Pausad',
  EXHAUSTED: 'Budget slut',
  COMPLETED: 'Avslutad',
}

const STATUS_COLORS: Record<CampaignStatus, string> = {
  DRAFT: '#9E9E9E',
  ACTIVE: '#4CAF50',
  PAUSED: '#FF9800',
  EXHAUSTED: '#F44336',
  COMPLETED: '#607D8B',
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 140,
        backgroundColor: '#fff',
        borderRadius: 12,
        border: '1px solid #e5e5e5',
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <span style={{ fontSize: 13, color: '#757575', fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 28, fontWeight: 700, color: '#1a1a1a' }}>{value}</span>
    </div>
  )
}

function ProgressBar({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#757575' }}>
        <span>{label}</span>
        <span>
          {Number(value).toFixed(2)} / {max} kr
        </span>
      </div>
      <div
        style={{
          height: 10,
          borderRadius: 5,
          backgroundColor: '#e5e5e5',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            backgroundColor: pct >= 90 ? '#F44336' : '#9b59b6',
            borderRadius: 5,
            transition: 'width 0.3s ease',
          }}
        />
      </div>
      <span style={{ fontSize: 12, color: '#9E9E9E' }}>{pct.toFixed(1)}% förbrukat</span>
    </div>
  )
}

export default function CampaignDetailPage() {
  const params = useParams<{ campaignId: string }>()
  const router = useRouter()
  const campaignId = params.campaignId

  const { data: campaigns, isLoading: campaignsLoading } = useCampaigns()
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics(campaignId)
  const activateCampaign = useActivateCampaign()
  const pauseCampaign = usePauseCampaign()

  const campaign = campaigns?.find((c) => c.id === campaignId)

  if (campaignsLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" minHeight="60vh">
        <Spinner color="$primary" />
      </YStack>
    )
  }

  if (!campaign) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" padding="$8">
        <Text color="$textSecondary" fontSize="$4">
          Kampanjen hittades inte
        </Text>
        <Button
          marginTop="$4"
          borderRadius="$3"
          variant="outlined"
          onPress={() => router.push('/ads')}
        >
          <Text color="$primary">Tillbaka till kampanjer</Text>
        </Button>
      </YStack>
    )
  }

  const status = campaign.status as CampaignStatus

  function handleActivate() {
    activateCampaign.mutate(
      { campaignId },
      {
        onError: (err) => alert(err.message),
      },
    )
  }

  function handlePause() {
    pauseCampaign.mutate(
      { campaignId },
      {
        onError: (err) => alert(err.message),
      },
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Campaign header */}
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: 12,
          border: '1px solid #e5e5e5',
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#1a1a1a' }}>
              {campaign.name}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span
                style={{
                  display: 'inline-block',
                  backgroundColor: STATUS_COLORS[status],
                  color: 'white',
                  borderRadius: 20,
                  padding: '3px 12px',
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {STATUS_LABELS[status]}
              </span>
              <span style={{ fontSize: 13, color: '#757575' }}>
                {campaign.format === 'FEED' ? 'Flöde' : campaign.format === 'STORY' ? 'Story' : 'Evenemangssponsor'}
                {' · '}
                {campaign.billingModel}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            {status === 'DRAFT' && (
              <button
                onClick={handleActivate}
                disabled={activateCampaign.isPending}
                style={{
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 20px',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: activateCampaign.isPending ? 'not-allowed' : 'pointer',
                  opacity: activateCampaign.isPending ? 0.7 : 1,
                }}
              >
                {activateCampaign.isPending ? 'Aktiverar...' : 'Aktivera'}
              </button>
            )}
            {status === 'ACTIVE' && (
              <button
                onClick={handlePause}
                disabled={pauseCampaign.isPending}
                style={{
                  backgroundColor: '#FF9800',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 20px',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: pauseCampaign.isPending ? 'not-allowed' : 'pointer',
                  opacity: pauseCampaign.isPending ? 0.7 : 1,
                }}
              >
                {pauseCampaign.isPending ? 'Pausar...' : 'Pausa'}
              </button>
            )}
          </div>
        </div>

        {/* Budget progress */}
        <ProgressBar
          value={campaign.spentSEK}
          max={campaign.dailyBudgetSEK}
          label="Daglig budget"
        />
        {campaign.totalBudgetSEK && (
          <ProgressBar
            value={campaign.spentSEK}
            max={campaign.totalBudgetSEK}
            label="Totalbudget"
          />
        )}
      </div>

      {/* Analytics section */}
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: 12,
          border: '1px solid #e5e5e5',
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#1a1a1a' }}>
          Statistik
        </h3>

        {analyticsLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
            <Spinner color="$primary" />
          </div>
        ) : analytics ? (
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <StatCard label="Visningar" value={analytics.impressions.toLocaleString('sv-SE')} />
            <StatCard label="Klick" value={analytics.clicks.toLocaleString('sv-SE')} />
            <StatCard label="CTR" value={`${analytics.ctr}%`} />
            <StatCard
              label="Förbrukat"
              value={`${Number(analytics.spentSEK).toFixed(2)} kr`}
            />
          </div>
        ) : (
          <p style={{ color: '#757575', fontSize: 14 }}>Ingen statistik tillgänglig ännu.</p>
        )}
      </div>

      {/* Creatives list */}
      {campaign.creatives && campaign.creatives.length > 0 && (
        <div
          style={{
            backgroundColor: '#fff',
            borderRadius: 12,
            border: '1px solid #e5e5e5',
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#1a1a1a' }}>
            Annonser ({campaign.creatives.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {campaign.creatives.map((creative) => (
              <div
                key={creative.id}
                style={{
                  borderRadius: 8,
                  border: '1px solid #e5e5e5',
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
              >
                <span style={{ fontWeight: 700, fontSize: 15, color: '#1a1a1a' }}>
                  {creative.headline}
                </span>
                {creative.body && (
                  <span style={{ fontSize: 13, color: '#757575' }}>{creative.body}</span>
                )}
                <a
                  href={creative.ctaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: 13, color: '#9b59b6', wordBreak: 'break-all' }}
                >
                  {creative.ctaUrl}
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <button
          onClick={() => router.push('/ads')}
          style={{
            background: 'none',
            border: '1px solid #ddd',
            borderRadius: 8,
            padding: '10px 20px',
            fontSize: 14,
            color: '#757575',
            cursor: 'pointer',
          }}
        >
          Tillbaka till kampanjer
        </button>
      </div>
    </div>
  )
}
