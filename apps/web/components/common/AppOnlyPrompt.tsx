'use client'

import { ReactNode, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from './Button'
import styles from './AppOnlyPrompt.module.css'
import { getAppStoreLink, isDesktop, isIOS, isAndroid } from '@/lib/app-store-links'
import { trackAppOnlyPromptImpression, trackAppOnlyPromptClick } from '@/lib/analytics'

interface AppOnlyPromptProps {
  icon: string
  title: string
  description: string
  feature: string
  showQRCode?: boolean
  showBackButton?: boolean
  onShowBackButton?: () => void
}

export function AppOnlyPrompt({
  icon,
  title,
  description,
  feature,
  showQRCode = false,
  showBackButton = true,
  onShowBackButton,
}: AppOnlyPromptProps) {
  const router = useRouter()

  useEffect(() => {
    trackAppOnlyPromptImpression(feature)
  }, [feature])

  const handleStoreClick = (platform: string) => {
    trackAppOnlyPromptClick(feature, `store_${platform}`)
  }

  const handleBackClick = () => {
    trackAppOnlyPromptClick(feature, 'back')
    if (onShowBackButton) {
      onShowBackButton()
    } else {
      router.back()
    }
  }

  const storeUrl = getAppStoreLink()
  const desktop = isDesktop()

  return (
    <div className={styles.appOnlyPrompt}>
      <div className={styles.icon}>{icon}</div>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.description}>{description}</p>

      <div className={styles.storeButtons}>
        {(desktop || isIOS()) && (
          <Link href="https://apps.apple.com/app/lustre/id1234567890">
            <button
              className={styles.storeBadge}
              onClick={() => handleStoreClick('ios')}
              aria-label="Öppna i App Store"
            >
              <svg
                viewBox="0 0 200 60"
                width="140"
                height="42"
                className={styles.storeBadgeImg}
              >
                <defs>
                  <linearGradient id="appleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#555', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#111', stopOpacity: 1 }} />
                  </linearGradient>
                </defs>
                <rect width="200" height="60" rx="10" fill="url(#appleGradient)" />
                <text
                  x="100"
                  y="38"
                  textAnchor="middle"
                  fill="white"
                  fontSize="18"
                  fontWeight="500"
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  App Store
                </text>
              </svg>
            </button>
          </Link>
        )}

        {(desktop || isAndroid()) && (
          <Link href="https://play.google.com/store/apps/details?id=com.lovelustre.app">
            <button
              className={styles.storeBadge}
              onClick={() => handleStoreClick('android')}
              aria-label="Öppna i Google Play"
            >
              <svg
                viewBox="0 0 200 60"
                width="140"
                height="42"
                className={styles.storeBadgeImg}
              >
                <defs>
                  <linearGradient id="googleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#fff', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#f0f0f0', stopOpacity: 1 }} />
                  </linearGradient>
                </defs>
                <rect
                  width="200"
                  height="60"
                  rx="10"
                  fill="url(#googleGradient)"
                  stroke="#ddd"
                  strokeWidth="1"
                />
                <text
                  x="100"
                  y="38"
                  textAnchor="middle"
                  fill="#1a1a1a"
                  fontSize="18"
                  fontWeight="500"
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  Google Play
                </text>
              </svg>
            </button>
          </Link>
        )}
      </div>

      {showQRCode && desktop && (
        <div>
          <svg
            className={styles.qrCode}
            viewBox="0 0 120 120"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="QR-kod för att ladda ned appen"
          >
            <rect width="120" height="120" fill="white" />
            <g fill="black">
              <rect x="10" y="10" width="30" height="30" />
              <rect x="13" y="13" width="24" height="24" fill="white" />
              <rect x="16" y="16" width="18" height="18" />

              <rect x="80" y="10" width="30" height="30" />
              <rect x="83" y="13" width="24" height="24" fill="white" />
              <rect x="86" y="16" width="18" height="18" />

              <rect x="10" y="80" width="30" height="30" />
              <rect x="13" y="83" width="24" height="24" fill="white" />
              <rect x="16" y="86" width="18" height="18" />

              <rect x="50" y="50" width="20" height="20" />
              <rect x="85" y="85" width="10" height="10" />
              <rect x="75" y="60" width="5" height="5" />
              <rect x="60" y="75" width="5" height="5" />
            </g>
          </svg>
          <span className={styles.qrLabel}>Scanna för att ladda ned</span>
        </div>
      )}

      {showBackButton && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBackClick}
          className={styles.backButton}
        >
          Tillbaka
        </Button>
      )}
    </div>
  )
}
