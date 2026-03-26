'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navLinks = [
  { href: '/users', label: 'Users' },
  { href: '/reports', label: 'Reports' },
  { href: '/analytics', label: 'Analytics' },
]

export function AdminSidebar() {
  const pathname = usePathname()

  if (pathname === '/login') {
    return null
  }

  return (
    <aside style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '240px',
      height: '100vh',
      backgroundColor: '#1e293b',
      borderRight: '1px solid #334155',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 100,
    }}>
      <div style={{
        padding: '24px 20px',
        borderBottom: '1px solid #334155',
      }}>
        <span style={{
          color: '#f1f5f9',
          fontSize: '18px',
          fontWeight: 700,
          letterSpacing: '-0.02em',
        }}>
          Lustre Admin
        </span>
      </div>
      <nav style={{ padding: '16px 0', flex: 1 }}>
        {navLinks.map((link) => {
          const isActive = pathname.startsWith(link.href)
          return (
            <Link
              key={link.href}
              href={link.href}
              style={{
                display: 'block',
                padding: '10px 20px',
                color: isActive ? '#f1f5f9' : '#94a3b8',
                backgroundColor: isActive ? '#3b82f6' : 'transparent',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: isActive ? 600 : 400,
                borderRadius: '6px',
                margin: '2px 8px',
                transition: 'background-color 0.15s, color 0.15s',
              }}
            >
              {link.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
