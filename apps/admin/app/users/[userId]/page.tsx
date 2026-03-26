'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { trpc } from '@lustre/api'
import { AdminGuard } from '../../admin-guard'

const LABEL_STYLE: React.CSSProperties = {
  color: '#94a3b8',
  fontSize: '12px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '4px',
}

const VALUE_STYLE: React.CSSProperties = {
  color: '#f1f5f9',
  fontSize: '14px',
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={LABEL_STYLE}>{label}</div>
      <div style={VALUE_STYLE}>{children}</div>
    </div>
  )
}

function UserDetailContent() {
  const params = useParams()
  const userId = params.userId as string

  const userQuery = trpc.admin.getUser.useQuery({ userId })

  const suspendMutation = trpc.admin.suspendUser.useMutation({
    onSuccess: () => { userQuery.refetch() },
  })

  const banMutation = trpc.admin.banUser.useMutation({
    onSuccess: () => { userQuery.refetch() },
  })

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link
          href="/users"
          style={{
            color: '#94a3b8',
            fontSize: '13px',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            marginBottom: '16px',
          }}
        >
          &larr; Back to Users
        </Link>
        <h1 style={{ color: '#f1f5f9', fontSize: '24px', fontWeight: 700, margin: 0 }}>
          User Detail
        </h1>
      </div>

      {userQuery.isLoading && (
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>Loading user...</p>
      )}

      {userQuery.isError && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '6px',
          padding: '12px 16px',
          color: '#ef4444',
          fontSize: '14px',
        }}>
          Error: {userQuery.error.message}
        </div>
      )}

      {userQuery.data && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* User Info Card */}
          <div style={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '8px',
            padding: '24px',
          }}>
            <h2 style={{ color: '#f1f5f9', fontSize: '16px', fontWeight: 600, margin: '0 0 20px 0' }}>
              Account Information
            </h2>

            <FieldRow label="User ID">
              <code style={{ fontSize: '12px', color: '#94a3b8', fontFamily: 'monospace' }}>{userQuery.data.id}</code>
            </FieldRow>

            <FieldRow label="Display Name">
              {userQuery.data.displayName ?? <span style={{ color: '#64748b' }}>Not set</span>}
            </FieldRow>

            <FieldRow label="Email">{userQuery.data.email}</FieldRow>

            <FieldRow label="Status">
              <span style={{
                display: 'inline-block',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 500,
                backgroundColor: userQuery.data.status === 'ACTIVE'
                  ? 'rgba(34, 197, 94, 0.15)'
                  : 'rgba(245, 158, 11, 0.15)',
                color: userQuery.data.status === 'ACTIVE' ? '#22c55e' : '#f59e0b',
              }}>
                {userQuery.data.status}
              </span>
            </FieldRow>

            <FieldRow label="Banned">
              {userQuery.data.isBanned
                ? <span style={{ color: '#ef4444', fontWeight: 600 }}>Yes</span>
                : <span style={{ color: '#22c55e' }}>No</span>
              }
            </FieldRow>

            {userQuery.data.bannedUntil && (
              <FieldRow label="Banned Until">
                {new Date(userQuery.data.bannedUntil).toLocaleString('en-SE')}
              </FieldRow>
            )}

            <FieldRow label="Warning Count">
              <span style={{
                color: userQuery.data.warningCount > 0 ? '#f59e0b' : '#94a3b8',
                fontWeight: userQuery.data.warningCount > 0 ? 600 : 400,
              }}>
                {userQuery.data.warningCount}
              </span>
            </FieldRow>

            <FieldRow label="Filtered Messages Sent">
              {userQuery.data.filteredSentCount ?? 0}
            </FieldRow>

            <FieldRow label="Joined">
              {new Date(userQuery.data.createdAt).toLocaleString('en-SE')}
            </FieldRow>
          </div>

          {/* Actions Card */}
          <div>
            <div style={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              padding: '24px',
              marginBottom: '20px',
            }}>
              <h2 style={{ color: '#f1f5f9', fontSize: '16px', fontWeight: 600, margin: '0 0 16px 0' }}>
                Moderation Actions
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  onClick={() => suspendMutation.mutate({ userId, days: 7 })}
                  disabled={suspendMutation.isPending || userQuery.data.isBanned}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: 'rgba(245, 158, 11, 0.15)',
                    color: '#f59e0b',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: suspendMutation.isPending || userQuery.data.isBanned ? 'not-allowed' : 'pointer',
                    opacity: userQuery.data.isBanned ? 0.5 : 1,
                    textAlign: 'left',
                  }}
                >
                  {suspendMutation.isPending ? 'Suspending...' : 'Suspend (7 days)'}
                </button>

                <button
                  onClick={() => banMutation.mutate({ userId })}
                  disabled={banMutation.isPending || userQuery.data.isBanned}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    color: '#ef4444',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: banMutation.isPending || userQuery.data.isBanned ? 'not-allowed' : 'pointer',
                    opacity: userQuery.data.isBanned ? 0.5 : 1,
                    textAlign: 'left',
                  }}
                >
                  {banMutation.isPending ? 'Banning...' : 'Permanent Ban'}
                </button>
              </div>

              {(suspendMutation.isSuccess || banMutation.isSuccess) && (
                <p style={{ color: '#22c55e', fontSize: '13px', marginTop: '12px', marginBottom: 0 }}>
                  Action applied successfully.
                </p>
              )}
            </div>

            {/* Moderation History */}
            {userQuery.data.moderationActions && userQuery.data.moderationActions.length > 0 && (
              <div style={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
                padding: '24px',
              }}>
                <h2 style={{ color: '#f1f5f9', fontSize: '16px', fontWeight: 600, margin: '0 0 16px 0' }}>
                  Moderation History
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {userQuery.data.moderationActions.map((action: {
                    id: string
                    actionType: string
                    reason?: string | null
                    createdAt: Date | string
                  }) => (
                    <div
                      key={action.id}
                      style={{
                        padding: '10px 12px',
                        backgroundColor: '#0f172a',
                        borderRadius: '6px',
                        border: '1px solid #334155',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          color: action.actionType === 'PERMANENT_BAN'
                            ? '#ef4444'
                            : action.actionType === 'TEMP_BAN'
                              ? '#f59e0b'
                              : '#94a3b8',
                        }}>
                          {action.actionType}
                        </span>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>
                          {new Date(action.createdAt).toLocaleDateString('en-SE')}
                        </span>
                      </div>
                      {action.reason && (
                        <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>{action.reason}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function UserDetailPage() {
  return (
    <AdminGuard>
      <UserDetailContent />
    </AdminGuard>
  )
}
