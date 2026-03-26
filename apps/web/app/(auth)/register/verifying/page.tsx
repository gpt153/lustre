export default function RegisterVerifyingPage() {
  return (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>

      <h1 className="text-2xl font-bold text-primary">Verifierar din identitet</h1>

      <p className="text-muted-foreground">
        Vi kontrollerar din ålder och identitet via SPAR. Det tar bara några sekunder.
      </p>
    </div>
  )
}
