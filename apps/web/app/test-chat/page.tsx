'use client'

import { useState } from 'react'
import ConversationList, { Conversation } from '@/components/chat/ConversationList'
import ChatRoom from '@/components/chat/ChatRoom'
import MiniProfile, { MiniProfileData } from '@/components/chat/MiniProfile'
import { Message } from '@/components/chat/MessageBubble'
import styles from './page.module.css'

/* ─── Mock Data ─── */

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-emma',
    participantName: 'Emma',
    participantPhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
    lastMessage: 'That record store we talked about...',
    lastMessageAt: '2026-03-29T14:30:00Z',
    unread: true,
  },
  {
    id: 'conv-sophie',
    participantName: 'Sophie',
    participantPhoto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
    lastMessage: 'It was so lovely meeting you yesterday.',
    lastMessageAt: '2026-03-29T12:00:00Z',
    unread: false,
  },
  {
    id: 'conv-liam',
    participantName: 'Liam',
    participantPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face',
    lastMessage: 'How was the jazz club? I heard the tenor...',
    lastMessageAt: '2026-03-28T18:00:00Z',
    unread: false,
  },
  {
    id: 'conv-clara',
    participantName: 'Clara',
    participantPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face',
    lastMessage: 'Definitely! Let\'s aim for Thursday then.',
    lastMessageAt: '2026-03-27T10:00:00Z',
    unread: false,
  },
]

const MOCK_MESSAGES: Record<string, Message[]> = {
  'conv-emma': [
    { id: 'm1', senderId: 'emma', body: 'Hey! Loved your profile. Your collection of film cameras is actually insane. Which one is your favorite to shoot with?', createdAt: '2026-03-29T13:00:00Z', type: 'TEXT' },
    { id: 'm2', senderId: 'current-user', body: 'Thanks Emma! Honestly, the Olympus PEN-F is my daily driver. It\'s so tactile.', createdAt: '2026-03-29T13:05:00Z', type: 'TEXT' },
    { id: 'm3', senderId: 'emma', body: 'The half-frame! Great choice. I\'m more of a Leica M6 girl myself when I can afford the development costs haha.', createdAt: '2026-03-29T13:12:00Z', type: 'TEXT' },
    { id: 'm4', senderId: 'current-user', body: 'That record store we talked about was great. Finally found that original press of \'Blue\' I\'ve been hunting for.', createdAt: '2026-03-29T14:30:00Z', type: 'TEXT' },
  ],
  'conv-sophie': [
    { id: 's1', senderId: 'sophie', body: 'Hey! Thanks for the lovely evening yesterday.', createdAt: '2026-03-29T10:00:00Z', type: 'TEXT' },
    { id: 's2', senderId: 'current-user', body: 'It was wonderful! That restaurant was a great pick.', createdAt: '2026-03-29T10:30:00Z', type: 'TEXT' },
    { id: 's3', senderId: 'sophie', body: 'It was so lovely meeting you yesterday.', createdAt: '2026-03-29T12:00:00Z', type: 'TEXT' },
  ],
  'conv-liam': [
    { id: 'l1', senderId: 'current-user', body: 'Hey Liam, do you know any good jazz clubs around here?', createdAt: '2026-03-28T16:00:00Z', type: 'TEXT' },
    { id: 'l2', senderId: 'liam', body: 'Oh absolutely! Glenn Miller Cafe is legendary. You should also check out Stampen.', createdAt: '2026-03-28T16:15:00Z', type: 'TEXT' },
    { id: 'l3', senderId: 'current-user', body: 'Went to Glenn Miller last night, it was incredible!', createdAt: '2026-03-28T17:45:00Z', type: 'TEXT' },
    { id: 'l4', senderId: 'liam', body: 'How was the jazz club? I heard the tenor sax player is phenomenal on Fridays.', createdAt: '2026-03-28T18:00:00Z', type: 'TEXT' },
  ],
  'conv-clara': [
    { id: 'c1', senderId: 'clara', body: 'Should we try that new brunch place on Sodermalm?', createdAt: '2026-03-27T09:00:00Z', type: 'TEXT' },
    { id: 'c2', senderId: 'current-user', body: 'Yes! I\'ve been wanting to go there. When are you free?', createdAt: '2026-03-27T09:30:00Z', type: 'TEXT' },
    { id: 'c3', senderId: 'clara', body: 'Definitely! Let\'s aim for Thursday then.', createdAt: '2026-03-27T10:00:00Z', type: 'TEXT' },
  ],
}

const MOCK_PROFILES: Record<string, MiniProfileData> = {
  'conv-emma': {
    name: 'Emma',
    age: 28,
    location: 'East Village, NY',
    about: 'Curating a life of analog moments in a digital world. Usually found hunting for rare vinyl or over-analyzing French New Wave cinema.',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=800&fit=crop&crop=face',
    photoCaption: "Paris, Autumn '23",
    sharedInterests: ['Analog Photography', 'Vintage Vinyl'],
    otherInterests: ['Cozy Cafes', 'Jazz'],
  },
  'conv-sophie': {
    name: 'Sophie',
    age: 26,
    location: 'Sodermalm, Stockholm',
    about: 'Architecture student by day, sunset chaser by night. If you can make me laugh, you\'ve won half the battle.',
    photoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&h=800&fit=crop&crop=face',
    photoCaption: 'Summer in Gotland',
    sharedInterests: ['Architecture', 'Travel'],
    otherInterests: ['Yoga', 'Reading'],
  },
  'conv-liam': {
    name: 'Liam',
    age: 31,
    location: 'Ostermalm, Stockholm',
    about: 'Jazz pianist and coffee snob. Looking for someone who appreciates both silence and chaos.',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&h=800&fit=crop&crop=face',
    photoCaption: 'At the studio',
    sharedInterests: ['Jazz', 'Coffee'],
    otherInterests: ['Piano', 'Cycling'],
  },
  'conv-clara': {
    name: 'Clara',
    age: 29,
    location: 'Vasastan, Stockholm',
    about: 'Food stylist who believes every meal deserves to be art. Will judge you by your bookshelf.',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=800&fit=crop&crop=face',
    photoCaption: 'Cookbook shoot',
    sharedInterests: ['Cooking', 'Art'],
    otherInterests: ['Books', 'Wine'],
  },
}

const AVATARS: Record<string, string> = {
  'conv-emma': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
  'conv-sophie': 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
  'conv-liam': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
  'conv-clara': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
}

/* ─── Styles ─── */

/* ─── Page Component ─── */

export default function TestChatPage() {
  const [activeConvId, setActiveConvId] = useState('conv-emma')

  const activeProfile = MOCK_PROFILES[activeConvId]
  const activeMessages = MOCK_MESSAGES[activeConvId] ?? []
  const activeConv = MOCK_CONVERSATIONS.find((c) => c.id === activeConvId)
  const activeAvatar = AVATARS[activeConvId]

  return (
    <div className={styles.root}>
      {/* Conversation List (30%) */}
      <div className={styles.convList}>
        <ConversationList
          activeConversationId={activeConvId}
          conversations={MOCK_CONVERSATIONS}
          onSelectConversation={setActiveConvId}
        />
      </div>

      {/* Active Chat Panel (45%) */}
      <div className={styles.chatPanel}>
        <ChatRoom
          conversationId={activeConvId}
          participantName={activeConv?.participantName}
          participantAge={activeProfile?.age}
          participantAvatar={activeAvatar}
          messages={activeMessages}
          currentUserId="current-user"
          isTyping={activeConvId === 'conv-emma'}
        />
      </div>

      {/* Mini Profile (25%) — hidden below 1200px via CSS */}
      <div className={styles.miniProfile}>
        {activeProfile && (
          <MiniProfile profile={activeProfile} />
        )}
      </div>
    </div>
  )
}
