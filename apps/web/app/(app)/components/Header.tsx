'use client'

import { useAuthStore } from '@lustre/app'
import { LustreLogo } from '@lustre/ui'
import { NavLink } from './NavLink'
import { AvatarDropdown } from './AvatarDropdown'
import { BellIcon } from './BellIcon'

export function Header() {
  const { logout, user } = useAuthStore()

  const handleLogout = async () => {
    logout()
  }

  // CSS @supports fallback for browsers without backdrop-filter support
  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 24px',
    // Glassmorphism background with semi-transparent charcoal
    backgroundColor: 'rgba(44, 36, 33, 0.85)',
    // Glassmorphism effect
    backdropFilter: 'blur(12px) saturate(150%)',
    WebkitBackdropFilter: 'blur(12px) saturate(150%)',
    // Copper-tinted border
    borderBottom: '1px solid rgba(184, 115, 51, 0.3)',
    // Sticky positioning
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxSizing: 'border-box',
    width: '100%',
  }

  // Fallback style for @supports not (backdrop-filter)
  const fallbackStyle = `
    @supports not (backdrop-filter: blur(1px)) {
      header {
        background-color: rgba(44, 36, 33, 0.95) !important;
      }
    }
  `

  return (
    <>
      <style>{fallbackStyle}</style>
      <header style={headerStyle}>
        {/* Left Section: Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            minWidth: '200px',
          }}
        >
          <LustreLogo variant="dark" height={32} />
        </div>

        {/* Center Section: Navigation Links */}
        <nav
          style={{
            display: 'flex',
            gap: '32px',
            alignItems: 'center',
            flex: 1,
            justifyContent: 'center',
          }}
        >
          <NavLink href="/discover" label="Discover">
            Discover
          </NavLink>
          <NavLink href="/chat" label="Connect">
            Connect
          </NavLink>
          <NavLink href="/events" label="Explore">
            Explore
          </NavLink>
          <NavLink href="/learn" label="Learn">
            Learn
          </NavLink>
        </nav>

        {/* Right Section: Notification Bell + Avatar Dropdown */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            minWidth: '200px',
            justifyContent: 'flex-end',
          }}
        >
          {/* Notification Bell */}
          <button
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#F5EDE4',
              fontSize: '20px',
              transition: 'all 200ms ease-in-out',
              opacity: 0.8,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.opacity = '1'
              ;(e.currentTarget as HTMLElement).style.color = '#D4A843'
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.opacity = '0.8'
              ;(e.currentTarget as HTMLElement).style.color = '#F5EDE4'
            }}
            aria-label="Notifications"
            title="Notifications"
          >
            <BellIcon />
          </button>

          {/* Avatar Dropdown */}
          <AvatarDropdown
            avatarUrl={user?.profilePhotoUrl}
            userName={user?.displayName || 'User'}
            onLogout={handleLogout}
          />
        </div>
      </header>
    </>
  )
}
