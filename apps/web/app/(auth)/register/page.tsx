'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()

  return (
    <div className="space-y-6 text-center">
      <div>
        <h1 className="text-3xl font-bold text-primary">Skapa konto</h1>
        <p className="text-muted-foreground mt-2">
          Gå med i Lustre — en trygg och positiv plats för kärlek och kontakt
        </p>
      </div>

      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          För att skapa konto behöver vi verifiera din identitet och ålder via Swish.
        </p>
        <p className="text-sm text-muted-foreground">
          En engångsbetalning på 10 kr bekräftar ditt namn och telefonnummer. Beloppet
          återbetalas inte men är en engångskostnad för kontoaktivering.
        </p>
        <button
          onClick={() => router.push('/register/swish')}
          className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90"
        >
          Börja registrering med Swish
        </button>
        <Link href="/login" className="text-muted-foreground text-sm hover:underline block">
          Har du redan ett konto? Logga in
        </Link>
      </div>
    </div>
  )
}
