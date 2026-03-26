'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { trpc } from '@lustre/api'
import { AdminGuard } from '../admin-guard'

const PAGE_STYLES = {
  padding: '32px',
}

const TABLE_HEADER_STYLE: React.CSSProperties = {
  padding: '10px 16px',
  textAlign: 'left' as const,
  color: '#94a3b8',
  fontSize: '12px',
  fontWeight: 600,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
  borderBottom: '1px solid #334155',
}

const TABLE_CELL_STYLE: React.CSSProperties = {
  padding: '12px 16px',
  fontSize: '14px',
  color: '#e2e8f0',
  borderBottom: '1px solid #1e293b',
}

function UsersContent() {
  const [inputValue, setInputValue] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(inputValue)
    }, 300)
    return () => clearTimeout(timer)
  }, [inputValue])

  const usersQuery = trpc.admin.searchUsers.useQuery(
    { query: searchTerm, limit: 20 },
    { enabled: true }
  )

  const suspendMutation = trpc.admin.suspendUser.useMutation({
    onSuccess: () => { usersQuery.refetch() },
  })

  const banMutation = trpc.admin.banUser.useMutation({
    onSuccess: () => { usersQuery.refetch() },
  })

  return (
    <div style={PAGE_STYLES}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ color: '#f1f5f9', fontSize: '24px', fontWeight: 700, margin: '0 0 4px 0' }}>
          Users
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>
          Search and manage platform users
        </p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          style={{
            width: '100%',
            maxWidth: '400px',
            padding: '10px 14px',
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '6px',
            color: '#f1f5f9',
            fontSize: '14px',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {usersQuery.isLoading && (
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>Loading...</p>
      )}

      {usersQuery.isError && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '6px',
          padding: '12px 16px',
          color: '#ef4444',
          fontSize: '14px',
        }}>
          Error loading users: {usersQuery.error.message}
        </div>
      )}

      {usersQuery.data && (
        <div style={{
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '8px',
          overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#0f172a' }}>
                <th style={TABLE_HEADER_STYLE}>Display Name</th>
                <th style={TABLE_HEADER_STYLE}>Email</th>
                <th style={TABLE_HEADER_STYLE}>Status</th>
                <th style={TABLE_HEADER_STYLE}>Banned</th>
                <th style={TABLE_HEADER_STYLE}>Warnings</th>
                <th style={TABLE_HEADER_STYLE}>Joined</th>
                <th style={TABLE_HEADER_STYLE}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {usersQuery.data.users.map((user, index) => (
                <tr
                  key={user.id}
                  style={{ backgroundColor: index % 2 === 0 ? '#1e293b' : '#172032' }}
                >
                  <td style={TABLE_CELL_STYLE}>
                    {user.displayName ?? <span style={{ color: '#64748b' }}>—</span>}
                  </td>
                  <td style={TABLE_CELL_STYLE}>{user.email}</td>
                  <td style={TABLE_CELL_STYLE}>
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 500,
                      backgroundColor: user.status === 'ACTIVE'
                        ? 'rgba(34, 197, 94, 0.15)'
                        : 'rgba(245, 158, 11, 0.15)',
                      color: user.status === 'ACTIVE' ? '#22c55e' : '#f59e0b',
                    }}>
                      {user.status}
                    </span>
                  </td>
                  <td style={TABLE_CELL_STYLE}>
                    {user.isBanned
                      ? <span style={{ color: '#ef4444', fontWeight: 500 }}>Yes</span>
                      : <span style={{ color: '#94a3b8' }}>No</span>
                    }
                  </td>
                  <td style={TABLE_CELL_STYLE}>{user.warningCount}</td>
                  <td style={TABLE_CELL_STYLE}>
                    {new Date(user.createdAt).toLocaleDateString('en-SE', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td style={TABLE_CELL_STYLE}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <Link
                        href={`/users/${user.id}`}
                        style={{
                          padding: '4px 10px',
                          backgroundColor: '#334155',
                          color: '#e2e8f0',
                          borderRadius: '4px',
                          fontSize: '12px',
                          textDecoration: 'none',
                          fontWeight: 500,
                        }}
                      >
                        View
                      </Link>
                      <button
                        onClick={() => suspendMutation.mutate({ userId: user.id, days: 7 })}
                        disabled={suspendMutation.isPending || user.isBanned}
                        style={{
                          padding: '4px 10px',
                          backgroundColor: 'rgba(245, 158, 11, 0.15)',
                          color: '#f59e0b',
                          border: '1px solid rgba(245, 158, 11, 0.3)',
                          borderRadius: '4px',
                          fontSize: '12px',
                          cursor: suspendMutation.isPending || user.isBanned ? 'not-allowed' : 'pointer',
                          opacity: user.isBanned ? 0.5 : 1,
                          fontWeight: 500,
                        }}
                      >
                        Suspend 7d
                      </button>
                      <button
                        onClick={() => banMutation.mutate({ userId: user.id })}
                        disabled={banMutation.isPending || user.isBanned}
                        style={{
                          padding: '4px 10px',
                          backgroundColor: 'rgba(239, 68, 68, 0.15)',
                          color: '#ef4444',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          borderRadius: '4px',
                          fontSize: '12px',
                          cursor: banMutation.isPending || user.isBanned ? 'not-allowed' : 'pointer',
                          opacity: user.isBanned ? 0.5 : 1,
                          fontWeight: 500,
                        }}
                      >
                        Ban
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {usersQuery.data.users.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ ...TABLE_CELL_STYLE, textAlign: 'center', color: '#64748b', padding: '32px' }}>
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default function UsersPage() {
  return (
    <AdminGuard>
      <UsersContent />
    </AdminGuard>
  )
}
