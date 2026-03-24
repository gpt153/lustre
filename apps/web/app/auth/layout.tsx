export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#1a1a1a',
        padding: '16px',
      }}
    >
      <div
        style={{
          backgroundColor: '#2a2a2a',
          borderRadius: '12px',
          padding: '48px',
          maxWidth: '400px',
          width: '100%',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        }}
      >
        {children}
      </div>
    </div>
  )
}
