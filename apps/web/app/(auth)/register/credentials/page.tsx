'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from '@lustre/api'
import { useAuthStore } from '@lustre/app'

export default function RegisterCredentialsPage() {
  const router = useRouter()
  const setTokens = useAuthStore((state) => state.setTokens)
  const tempToken = useAuthStore((state) => state.tempRegistrationToken)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const completeMutation = trpc.auth.completeRegistration.useMutation({
    onSuccess: (data) => {
      setTokens(data.accessToken, data.refreshToken)
      router.push('/register/display-name')
    },
    onError: (err) => setError(err.message),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!tempToken) {
      setError('Verifieringstoken saknas — börja om registreringen')
      return
    }

    if (password.length < 8) {
      setError('Lösenordet måste vara minst 8 tecken')
      return
    }

    completeMutation.mutate({ tempToken, email, password })
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-primary">Skapa inloggning</h1>
        <p className="text-muted-foreground mt-2">Välj e-post och lösenord.</p>
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
          placeholder="Lösenord (minst 8 tecken)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          required
          minLength={8}
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={completeMutation.isPending}
          className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 disabled:opacity-50"
        >
          {completeMutation.isPending ? 'Skapar konto...' : 'Skapa konto'}
        </button>
      </form>
    </div>
  )
}
