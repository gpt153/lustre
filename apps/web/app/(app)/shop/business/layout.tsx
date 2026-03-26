'use client'

import { useState } from 'react'
import { trpc } from '@lustre/api'
import { CartSidebar } from './components/CartSidebar'
import { useAuthStore } from '@lustre/app/src/stores/authStore'

export default function BusinessShopLayout({ children }: { children: React.ReactNode }) {
  const [cartOpen, setCartOpen] = useState(false)
  const user = useAuthStore((s) => s.user)

  const cartQuery = trpc.shop.cart.add.useMutation()

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {children}

      <button
        onClick={() => setCartOpen(true)}
        style={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          backgroundColor: '#9b59b6',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: 56,
          height: 56,
          fontSize: 24,
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          zIndex: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        aria-label="Öppna varukorg"
      >
        🛒
      </button>

      <CartSidebar
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={[]}
        total={0}
        swishPhone=""
      />
    </div>
  )
}
