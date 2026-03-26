'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface AvatarDropdownProps {
  avatarUrl?: string
  userName?: string
  onLogout: () => void | Promise<void>
}

export function AvatarDropdown({ avatarUrl, userName = 'User', onLogout }: AvatarDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen])

  const handleLogout = async () => {
    await onLogout()
    setIsOpen(false)
    router.push('/auth/login')
  }

  return (
    <div
      ref={dropdownRef}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          border: '2px solid #B87333',
          backgroundColor: avatarUrl ? 'transparent' : '#F5EDE4',
          backgroundImage: avatarUrl ? `url(${avatarUrl})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          transition: 'all 200ms ease-in-out',
          boxShadow: isOpen ? '0 0 0 2px rgba(212, 168, 67, 0.3)' : 'none',
        }}
        aria-label="Toggle user menu"
        title={userName}
      >
        {!avatarUrl && (
          <span
            style={{
              color: '#2C2421',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            {userName.charAt(0).toUpperCase()}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '8px',
            backgroundColor: '#2C2421',
            border: '1px solid rgba(184, 115, 51, 0.3)',
            borderRadius: '12px',
            minWidth: '160px',
            zIndex: 1000,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
          }}
        >
          {/* Dropdown Items */}
          <div style={{ display: 'flex', flexDirection: 'column', padding: '8px 0' }}>
            {/* Profile Link */}
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              style={{
                padding: '12px 16px',
                color: '#F5EDE4',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 500,
                transition: 'all 200ms ease-in-out',
                display: 'block',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(212, 168, 67, 0.15)'
                ;(e.currentTarget as HTMLElement).style.color = '#D4A843'
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
                ;(e.currentTarget as HTMLElement).style.color = '#F5EDE4'
              }}
            >
              Profile
            </Link>

            {/* Settings Link */}
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              style={{
                padding: '12px 16px',
                color: '#F5EDE4',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 500,
                transition: 'all 200ms ease-in-out',
                display: 'block',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(212, 168, 67, 0.15)'
                ;(e.currentTarget as HTMLElement).style.color = '#D4A843'
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
                ;(e.currentTarget as HTMLElement).style.color = '#F5EDE4'
              }}
            >
              Settings
            </Link>

            {/* SafeDate Link */}
            <Link
              href="/safedate"
              onClick={() => setIsOpen(false)}
              style={{
                padding: '12px 16px',
                color: '#F5EDE4',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 500,
                transition: 'all 200ms ease-in-out',
                display: 'block',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(212, 168, 67, 0.15)'
                ;(e.currentTarget as HTMLElement).style.color = '#D4A843'
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
                ;(e.currentTarget as HTMLElement).style.color = '#F5EDE4'
              }}
            >
              SafeDate
            </Link>

            {/* Vault Link */}
            <Link
              href="/consent"
              onClick={() => setIsOpen(false)}
              style={{
                padding: '12px 16px',
                color: '#F5EDE4',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 500,
                transition: 'all 200ms ease-in-out',
                display: 'block',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(212, 168, 67, 0.15)'
                ;(e.currentTarget as HTMLElement).style.color = '#D4A843'
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
                ;(e.currentTarget as HTMLElement).style.color = '#F5EDE4'
              }}
            >
              Vault
            </Link>

            {/* Divider */}
            <div
              style={{
                height: '1px',
                backgroundColor: 'rgba(184, 115, 51, 0.2)',
                margin: '8px 0',
              }}
            />

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              style={{
                padding: '12px 16px',
                color: '#F5EDE4',
                backgroundColor: 'transparent',
                border: 'none',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 200ms ease-in-out',
                display: 'block',
                width: '100%',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(233, 30, 99, 0.15)'
                ;(e.currentTarget as HTMLElement).style.color = '#B87333'
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
                ;(e.currentTarget as HTMLElement).style.color = '#F5EDE4'
              }}
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
