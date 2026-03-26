'use client'

import { useState } from 'react'
import { trpc } from '@lustre/api'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const resetMutation = trpc.auth.requestPasswordReset.useMutation({
    onSuccess: () => setSubmitted(true),
    onError: (err) => setError(err.message),
  })

  if (submitted) {
    return (
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-bold text-primary">Kolla din e-post</h1>
        <p className="text-muted-foreground">
          Om e-postadressen finns i systemet har vi skickat instruktioner för
          lösenordsåterställning.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-primary">Glömt lösenord?</h1>
        <p className="text-muted-foreground mt-2">
          Ange din e-postadress så skickar vi återställningsinstruktioner.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          setError(null)
          resetMutation.mutate({ email })
        }}
        className="space-y-4"
      >
        <input
          type="email"
          placeholder="E-postadress"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={resetMutation.isPending}
          className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 disabled:opacity-50"
        >
          {resetMutation.isPending ? 'Skickar...' : 'Skicka återställningslänk'}
        </button>
      </form>
    </div>
  )
}
