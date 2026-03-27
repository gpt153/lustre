'use client'

import { useState } from 'react'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import Card from '@/components/common/Card'
import Modal from '@/components/common/Modal'
import { ToastContainer } from '@/components/common/Toast'
import { addToast } from '@/lib/toast-store'
import { SkeletonBox, SkeletonText, SkeletonCircle } from '@/components/common/Skeleton'
import EmptyState from '@/components/common/EmptyState'

export default function ComponentsDemoPage() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div style={{ padding: 'var(--space-xl)', display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
      <h1 className="text-section">Components Demo</h1>

      {/* Buttons */}
      <section data-testid="buttons">
        <h2 className="text-card-title">Buttons</h2>
        <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap', marginTop: 'var(--space-md)' }}>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="primary" loading>Loading</Button>
          <Button variant="primary" disabled>Disabled</Button>
        </div>
      </section>

      {/* Input */}
      <section data-testid="inputs">
        <h2 className="text-card-title">Inputs</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', maxWidth: 400, marginTop: 'var(--space-md)' }}>
          <Input label="Email" type="email" placeholder="din@email.se" />
          <Input label="Password" type="password" placeholder="Lösenord" />
          <Input label="Med fel" error errorMessage="Fältet är obligatoriskt" />
          <Input label="Meddelande" as="textarea" placeholder="Skriv något..." />
        </div>
      </section>

      {/* Card */}
      <section data-testid="cards">
        <h2 className="text-card-title">Cards</h2>
        <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap', marginTop: 'var(--space-md)' }}>
          <Card hoverable>
            <p>Hoverable card with copper shadow</p>
          </Card>
          <Card header={<span>Card Header</span>} footer={<Button size="sm">Action</Button>}>
            <p>Card with header and footer</p>
          </Card>
        </div>
      </section>

      {/* Modal */}
      <section data-testid="modal-section">
        <h2 className="text-card-title">Modal</h2>
        <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Example Modal">
          <p>This is a modal with focus trap and spring animation.</p>
          <div style={{ marginTop: 'var(--space-md)' }}>
            <Button onClick={() => setModalOpen(false)}>Close</Button>
          </div>
        </Modal>
      </section>

      {/* Toast */}
      <section data-testid="toasts">
        <h2 className="text-card-title">Toasts</h2>
        <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap', marginTop: 'var(--space-md)' }}>
          <Button variant="primary" onClick={() => addToast('Success!', 'success')}>Success Toast</Button>
          <Button variant="danger" onClick={() => addToast('Error occurred', 'error')}>Error Toast</Button>
          <Button variant="ghost" onClick={() => addToast('Warning message', 'warning')}>Warning Toast</Button>
          <Button variant="secondary" onClick={() => addToast('Info message', 'info')}>Info Toast</Button>
        </div>
      </section>

      {/* Skeleton */}
      <section data-testid="skeletons">
        <h2 className="text-card-title">Skeletons</h2>
        <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'start', marginTop: 'var(--space-md)' }}>
          <SkeletonCircle width={48} height={48} />
          <div style={{ flex: 1 }}>
            <SkeletonText lines={3} />
          </div>
          <SkeletonBox width={120} height={80} />
        </div>
      </section>

      {/* EmptyState */}
      <section data-testid="empty-state">
        <h2 className="text-card-title">Empty State</h2>
        <EmptyState
          title="Inga resultat"
          description="Prova att ändra dina filter för att se fler profiler."
          action={{ label: 'Rensa filter', onClick: () => {} }}
        />
      </section>

      <ToastContainer />
    </div>
  )
}
