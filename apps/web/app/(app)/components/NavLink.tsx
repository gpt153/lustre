'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ReactNode } from 'react'

interface NavLinkProps {
  href: string
  children: ReactNode
  label: string
}

export function NavLink({ href, children, label }: NavLinkProps) {
  const pathname = usePathname()
  const isActive = pathname === href || pathname.startsWith(href + '/')

  return (
    <Link
      href={href}
      style={{
        color: isActive ? '#D4A843' : '#F5EDE4',
        textDecoration: 'none',
        fontFamily: 'var(--font-general-sans, system-ui)',
        fontWeight: 500,
        fontSize: '15px',
        opacity: isActive ? 1 : 0.8,
        transition: 'all 200ms ease-in-out',
        borderBottom: isActive ? '2px solid #D4A843' : '2px solid transparent',
        paddingBottom: '4px',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          (e.currentTarget as HTMLElement).style.color = '#F5EDE4'
          ;(e.currentTarget as HTMLElement).style.opacity = '1'
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          (e.currentTarget as HTMLElement).style.color = '#F5EDE4'
          ;(e.currentTarget as HTMLElement).style.opacity = '0.8'
        }
      }}
    >
      {children}
    </Link>
  )
}
