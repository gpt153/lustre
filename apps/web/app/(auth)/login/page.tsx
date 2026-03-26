'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { trpc } from '@lustre/api'
import { useAuthStore } from '@lustre/app'

export default function LoginPage() {
  const router = useRouter()
  const setTokens = useAuthStore((state) => state.setTokens)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const loginMutation = trpc.auth.loginWithEmail.useMutation({
    onSuccess: (data) => {
      setTokens(data.accessToken, data.refreshToken)
      router.replace('/home')
    },
    onError: (err) => setError(err.message),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!email || !password) {
      setError('Fyll i alla fält')
      return
    }
    loginMutation.mutate({ email, password })
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary">Logga in</h1>
        <p className="text-muted-foreground mt-2">Välkommen tillbaka till Lustre</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="E-postadress"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
        <input
          type="password"
          placeholder="Lösenord"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 disabled:opacity-50"
        >
          {loginMutation.isPending ? 'Loggar in...' : 'Logga in'}
        </button>
      </form>

      <div className="space-y-3">
        <button
          type="button"
          className="w-full py-3 rounded-lg border border-border hover:bg-muted font-semibold"
          onClick={() => alert('Google OAuth — kommer snart')}
        >
          Fortsätt med Google
        </button>
        <button
          type="button"
          className="w-full py-3 rounded-lg border border-border hover:bg-muted font-semibold"
          onClick={() => alert('Apple Sign In — kommer snart')}
        >
          Fortsätt med Apple
        </button>
      </div>

      <div className="text-center space-y-2">
        <Link href="/reset-password" className="text-primary text-sm hover:underline block">
          Glömt lösenord?
        </Link>
        <Link href="/register" className="text-muted-foreground text-sm hover:underline block">
          Inget konto? Registrera dig
        </Link>
      </div>
    </div>
  )
}
