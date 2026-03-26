'use client'

import { useState } from 'react'
import { trpc } from '@lustre/api'
import { AdminGuard } from '../admin-guard'

type ReportStatus = 'ALL' | 'PENDING' | 'REVIEWED' | 'DISMISSED'

const STATUS_TABS: { label: string; value: ReportStatus }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Reviewed', value: 'REVIEWED' },
  { label: 'Dismissed', value: 'DISMISSED' },
]

const TABLE_HEADER_STYLE: React.CSSProperties = {
  padding: '10px 16px',
  textAlign: 'left',
  color: '#94a3b8',
  fontSize: '12px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  borderBottom: '1px solid #334155',
}

const TABLE_CELL_STYLE: React.CSSProperties = {
  padding: '12px 16px',
  fontSize: '14px',
  color: '#e2e8f0',
  borderBottom: '1px solid #1e293b',
}

function ReportsContent() {
  const [selectedStatus, setSelectedStatus] = useState<ReportStatus>('PENDING')

  const reportsQuery = trpc.admin.getReports.useQuery({
    status: selectedStatus === 'ALL' ? undefined : selectedStatus,
    limit: 20,
  })

  const resolveMutation = trpc.admin.resolveReport.useMutation({
    onSuccess: () => { reportsQuery.refetch() },
  })

  const statusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }
      case 'REVIEWED': return { bg: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' }
      case 'DISMISSED': return { bg: 'rgba(148, 163, 184, 0.15)', color: '#94a3b8' }
      default: return { bg: 'rgba(148, 163, 184, 0.15)', color: '#94a3b8' }
    }
  }

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ color: '#f1f5f9', fontSize: '24px', fontWeight: 700, margin: '0 0 4px 0' }}>
          Reports
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>
          Review and resolve user-submitted reports
        </p>
      </div>

      {/* Status Tabs */}
      <div style={{
        display: 'flex',
        gap: '4px',
        marginBottom: '20px',
        backgroundColor: '#1e293b',
        padding: '4px',
        borderRadius: '8px',
        width: 'fit-content',
        border: '1px solid #334155',
      }}>
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setSelectedStatus(tab.value)}
            style={{
              padding: '6px 16px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              backgroundColor: selectedStatus === tab.value ? '#3b82f6' : 'transparent',
              color: selectedStatus === tab.value ? '#fff' : '#94a3b8',
              transition: 'background-color 0.15s, color 0.15s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {reportsQuery.isLoading && (
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>Loading reports...</p>
      )}

      {reportsQuery.isError && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '6px',
          padding: '12px 16px',
          color: '#ef4444',
          fontSize: '14px',
        }}>
          Error: {reportsQuery.error.message}
        </div>
      )}

      {reportsQuery.data && (
        <div style={{
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '8px',
          overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#0f172a' }}>
                <th style={TABLE_HEADER_STYLE}>Target Type</th>
                <th style={TABLE_HEADER_STYLE}>Category</th>
                <th style={TABLE_HEADER_STYLE}>Status</th>
                <th style={TABLE_HEADER_STYLE}>Submitted</th>
                <th style={TABLE_HEADER_STYLE}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reportsQuery.data.reports.map((report, index) => {
                const colors = statusColor(report.status)
                return (
                  <tr
                    key={report.id}
                    style={{ backgroundColor: index % 2 === 0 ? '#1e293b' : '#172032' }}
                  >
                    <td style={TABLE_CELL_STYLE}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 500,
                        backgroundColor: 'rgba(59, 130, 246, 0.15)',
                        color: '#3b82f6',
                      }}>
                        {report.targetType}
                      </span>
                    </td>
                    <td style={TABLE_CELL_STYLE}>{report.category}</td>
                    <td style={TABLE_CELL_STYLE}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 500,
                        backgroundColor: colors.bg,
                        color: colors.color,
                      }}>
                        {report.status}
                      </span>
                    </td>
                    <td style={TABLE_CELL_STYLE}>
                      {new Date(report.createdAt).toLocaleDateString('en-SE', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td style={TABLE_CELL_STYLE}>
                      {report.status === 'PENDING' && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => resolveMutation.mutate({ reportId: report.id, status: 'REVIEWED' })}
                            disabled={resolveMutation.isPending}
                            style={{
                              padding: '4px 10px',
                              backgroundColor: 'rgba(34, 197, 94, 0.15)',
                              color: '#22c55e',
                              border: '1px solid rgba(34, 197, 94, 0.3)',
                              borderRadius: '4px',
                              fontSize: '12px',
                              cursor: resolveMutation.isPending ? 'not-allowed' : 'pointer',
                              fontWeight: 500,
                            }}
                          >
                            Reviewed
                          </button>
                          <button
                            onClick={() => resolveMutation.mutate({ reportId: report.id, status: 'DISMISSED' })}
                            disabled={resolveMutation.isPending}
                            style={{
                              padding: '4px 10px',
                              backgroundColor: 'rgba(148, 163, 184, 0.15)',
                              color: '#94a3b8',
                              border: '1px solid rgba(148, 163, 184, 0.3)',
                              borderRadius: '4px',
                              fontSize: '12px',
                              cursor: resolveMutation.isPending ? 'not-allowed' : 'pointer',
                              fontWeight: 500,
                            }}
                          >
                            Dismiss
                          </button>
                        </div>
                      )}
                      {report.status !== 'PENDING' && (
                        <span style={{ color: '#64748b', fontSize: '12px' }}>Resolved</span>
                      )}
                    </td>
                  </tr>
                )
              })}
              {reportsQuery.data.reports.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ ...TABLE_CELL_STYLE, textAlign: 'center', color: '#64748b', padding: '32px' }}>
                    No reports found
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

export default function ReportsPage() {
  return (
    <AdminGuard>
      <ReportsContent />
    </AdminGuard>
  )
}
