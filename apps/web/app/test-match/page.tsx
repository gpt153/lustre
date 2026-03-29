'use client'

import { useState } from 'react'
import MatchModal from '@/components/common/MatchModal'

const mockUser1 = {
  name: 'Emma, 28',
  imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face',
}

const mockUser2 = {
  name: 'Daniel, 30',
  imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
}

export default function TestMatchPage() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#FDF8F3',
      }}
    >
      <button
        onClick={() => setIsOpen(true)}
        style={{
          padding: '16px 32px',
          background: '#B87333',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        Show Match
      </button>

      <MatchModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSendMessage={() => {
          alert('Send message clicked!')
          setIsOpen(false)
        }}
        user1={mockUser1}
        user2={mockUser2}
      />
    </div>
  )
}
