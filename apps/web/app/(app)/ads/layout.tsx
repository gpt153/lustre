'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface BreadcrumbItem {
  label: string
  href: string
}

function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 14 }}>
      {items.map((item, index) => (
        <span key={item.href} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {index > 0 && <span style={{ color: '#9E9E9E' }}>/</span>}
          <Link
            href={item.href}
            style={{
              color: index === items.length - 1 ? '#333' : '#9b59b6',
              textDecoration: 'none',
              fontWeight: index === items.length - 1 ? 600 : 400,
            }}
          >
            {item.label}
          </Link>
        </span>
      ))}
    </nav>
  )
}

function useBreadcrumbs(): BreadcrumbItem[] {
  const pathname = usePathname()

  const base: BreadcrumbItem[] = [{ label: 'Annonsportal', href: '/ads' }]

  if (pathname === '/ads/create') {
    return [...base, { label: 'Skapa kampanj', href: '/ads/create' }]
  }

  if (pathname.startsWith('/ads/') && pathname !== '/ads/create') {
    return [...base, { label: 'Kampanjdetaljer', href: pathname }]
  }

  return base
}

export default function AdsLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbs = useBreadcrumbs()

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '24px 24px 0',
        }}
      >
        <div style={{ marginBottom: 24 }}>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: '#1a1a1a',
              margin: '0 0 8px',
            }}
          >
            Annonsportal
          </h1>
          <Breadcrumbs items={breadcrumbs} />
        </div>
      </div>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 40px' }}>
        {children}
      </div>
    </div>
  )
}
