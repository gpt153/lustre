/**
 * Phoenix WebSocket client wrapper — Lustre Chat
 *
 * Provides a thin abstraction over Phoenix Channels for real-time chat.
 * The real Phoenix integration via the 'phoenix' npm package will connect
 * to ws.lovelustre.com when that service is available.
 *
 * For now this module exports the full interface with a stub implementation
 * so the UI works with mock data in development.
 */

export type MessageHandler = (payload: SocketMessage) => void
export type TypingHandler = (payload: TypingPayload) => void

export interface SocketMessage {
  id: string
  conversationId: string
  senderId: string
  body: string
  type: 'TEXT' | 'IMAGE' | 'VIDEO'
  createdAt: string
}

export interface TypingPayload {
  userId: string
  conversationId: string
  isTyping: boolean
}

export interface LustreChannel {
  topic: string
  push: (event: string, payload: Record<string, unknown>) => void
  on: (event: string, handler: (payload: unknown) => void) => void
  leave: () => void
}

export interface LustreSocket {
  connect: () => void
  disconnect: () => void
  isConnected: () => boolean
}

/** Internal stub implementation used when Phoenix is unavailable */
class StubSocket implements LustreSocket {
  private connected = false

  connect() {
    this.connected = true
  }

  disconnect() {
    this.connected = false
  }

  isConnected() {
    return this.connected
  }
}

class StubChannel implements LustreChannel {
  readonly topic: string
  private handlers: Map<string, ((payload: unknown) => void)[]> = new Map()

  constructor(topic: string) {
    this.topic = topic
  }

  push(event: string, payload: Record<string, unknown>) {
    // Stub: no-op in development. Real implementation pushes over Phoenix socket.
    void event
    void payload
  }

  on(event: string, handler: (payload: unknown) => void) {
    const existing = this.handlers.get(event) ?? []
    this.handlers.set(event, [...existing, handler])
  }

  emit(event: string, payload: unknown) {
    const handlers = this.handlers.get(event) ?? []
    handlers.forEach((h) => h(payload))
  }

  leave() {
    this.handlers.clear()
  }
}

/**
 * Creates a Phoenix WebSocket connection authenticated with the given JWT.
 *
 * In production this connects to `wss://ws.lovelustre.com/socket`.
 * In development (or when phoenix package is absent) returns a stub socket.
 */
export function createSocket(token: string): LustreSocket {
  void token
  return new StubSocket()
}

/**
 * Joins a Phoenix channel for a given topic.
 *
 * Topics follow the pattern:
 *   `conversation:{conversationId}` — for chat rooms
 *   `user:{userId}` — for user-level events (new conversations, etc.)
 */
export function joinChannel(
  _socket: LustreSocket,
  topic: string
): LustreChannel {
  const channel = new StubChannel(topic)
  return channel
}

/**
 * Leaves (unsubscribes from) a Phoenix channel.
 */
export function leaveChannel(channel: LustreChannel) {
  channel.leave()
}

/**
 * Sends a chat message over a joined conversation channel.
 */
export function sendMessage(
  channel: LustreChannel,
  body: string,
  type: 'TEXT' | 'IMAGE' | 'VIDEO' = 'TEXT'
) {
  channel.push('send_message', { body, type })
}

/**
 * Broadcasts typing state to other participants.
 */
export function broadcastTyping(channel: LustreChannel, isTyping: boolean) {
  channel.push(isTyping ? 'typing_start' : 'typing_stop', {})
}
