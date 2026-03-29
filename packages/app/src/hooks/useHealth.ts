import { useState, useEffect } from 'react'

export function useHealth(apiUrl = 'https://api.lovelustre.com') {
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading')
  const [timestamp, setTimestamp] = useState<string | null>(null)

  useEffect(() => {
    fetch(`${apiUrl}/health`)
      .then((res) => res.json())
      .then((data) => {
        setStatus('ok')
        setTimestamp(data.timestamp)
      })
      .catch(() => setStatus('error'))
  }, [apiUrl])

  return { status, timestamp }
}
