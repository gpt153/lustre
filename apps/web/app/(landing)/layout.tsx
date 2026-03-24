import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Lustre — Dejting designat för dig som förtjänar bättre',
  description: 'Sveriges första moderna plattform för vuxna som vill mer. Intelligent filtrering, verifierade användare, inbyggd trygghet. Få tidig tillgång.',
  openGraph: {
    title: 'Lustre — Dejting designat för dig som förtjänar bättre',
    description: 'Sveriges första moderna plattform för vuxna som vill mer. Intelligent filtrering, verifierade användare, inbyggd trygghet.',
    type: 'website',
    locale: 'sv_SE',
    siteName: 'Lustre',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lustre — Dejting designat för dig som förtjänar bättre',
    description: 'Sveriges första moderna plattform för vuxna som vill mer.',
  },
}

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      {children}
    </div>
  )
}
