'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { trpc } from '@lustre/api'

export default function ResetPasswordTokenPage() {
  const { token } = useParams<{ token: string }>()
  const router = useRouter()
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const resetMutation = trpc.auth.resetPassword.useMutation({
    onSuccess: () => router.replace('/login'),
    onError: (err) => setError(err.message),
  })

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-primary">Nytt lösenord</h1>
        <p className="text-muted-foreground mt-2">Ange ditt nya lösenord.</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          setError(null)
          resetMutation.mutate({ token, newPassword })
        }}
        className="space-y-4"
      >
        <input
          type="password"
          placeholder="Nytt lösenord (minst 8 tecken)"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          required
          minLength={8}
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={resetMutation.isPending}
          className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 disabled:opacity-50"
        >
          {resetMutation.isPending ? 'Uppdaterar...' : 'Uppdatera lösenord'}
        </button>
      </form>
    </div>
  )
}
