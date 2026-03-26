'use client'

import { useState } from 'react'
import { trpc } from '@lustre/api'
import { AdminGuard } from '../admin-guard'

const CARD_STYLE: React.CSSProperties = {
  backgroundColor: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '8px',
  padding: '20px 24px',
}

const SECTION_TITLE_STYLE: React.CSSProperties = {
  color: '#f1f5f9',
  fontSize: '16px',
  fontWeight: 600,
  margin: '0 0 16px 0',
}

const STAT_LABEL_STYLE: React.CSSProperties = {
  color: '#94a3b8',
  fontSize: '12px',
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '6px',
}

const STAT_VALUE_STYLE: React.CSSProperties = {
  color: '#f1f5f9',
  fontSize: '28px',
  fontWeight: 700,
  lineHeight: 1,
}

const TABLE_HEADER_STYLE: React.CSSProperties = {
  padding: '8px 12px',
  textAlign: 'left',
  color: '#94a3b8',
  fontSize: '11px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  borderBottom: '1px solid #334155',
}

const TABLE_CELL_STYLE: React.CSSProperties = {
  padding: '8px 12px',
  fontSize: '13px',
  color: '#e2e8f0',
  borderBottom: '1px solid #1e293b',
}

const DAY_OPTIONS = [7, 30, 90]

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={CARD_STYLE}>
      <div style={STAT_LABEL_STYLE}>{label}</div>
      <div style={STAT_VALUE_STYLE}>{value}</div>
    </div>
  )
}

function AnalyticsContent() {
  const [days, setDays] = useState(30)

  const overviewQuery = trpc.admin.getOverview.useQuery()
  const registrationsQuery = trpc.admin.getRegistrations.useQuery({ days })
  const genderRatioQuery = trpc.admin.getGenderRatio.useQuery()
  const revenueQuery = trpc.admin.getRevenue.useQuery({ days })
  const aiCostsQuery = trpc.admin.getAiCosts.useQuery({ days })

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ color: '#f1f5f9', fontSize: '24px', fontWeight: 700, margin: '0 0 4px 0' }}>
            Analytics
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>
            Platform metrics and usage statistics
          </p>
        </div>

        {/* Day range selector */}
        <div style={{
          display: 'flex',
          gap: '4px',
          backgroundColor: '#1e293b',
          padding: '4px',
          borderRadius: '8px',
          border: '1px solid #334155',
        }}>
          {DAY_OPTIONS.map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                backgroundColor: days === d ? '#3b82f6' : 'transparent',
                color: days === d ? '#fff' : '#94a3b8',
                transition: 'background-color 0.15s, color 0.15s',
              }}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* Overview Stats */}
      {overviewQuery.isLoading && (
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>Loading overview...</p>
      )}
      {overviewQuery.data && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          marginBottom: '32px',
        }}>
          <StatCard label="DAU" value={overviewQuery.data.dau.toLocaleString()} />
          <StatCard label="MAU" value={overviewQuery.data.mau.toLocaleString()} />
          <StatCard label="Total Users" value={overviewQuery.data.totalUsers.toLocaleString()} />
          <StatCard label="Pending Reports" value={overviewQuery.data.pendingReports.toLocaleString()} />
        </div>
      )}

      {/* Two-column grid for sections */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>

        {/* Registrations */}
        <div style={CARD_STYLE}>
          <h2 style={SECTION_TITLE_STYLE}>Registrations — last {days} days</h2>
          {registrationsQuery.isLoading && (
            <p style={{ color: '#94a3b8', fontSize: '13px' }}>Loading...</p>
          )}
          {registrationsQuery.data && (
            <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={TABLE_HEADER_STYLE}>Date</th>
                    <th style={{ ...TABLE_HEADER_STYLE, textAlign: 'right' }}>New Users</th>
                  </tr>
                </thead>
                <tbody>
                  {registrationsQuery.data.registrations.map((row: { date: string; count: number }) => (
                    <tr key={row.date}>
                      <td style={TABLE_CELL_STYLE}>{row.date}</td>
                      <td style={{ ...TABLE_CELL_STYLE, textAlign: 'right', color: '#22c55e', fontWeight: 500 }}>
                        {row.count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Gender Ratio */}
        <div style={CARD_STYLE}>
          <h2 style={SECTION_TITLE_STYLE}>Gender Ratio</h2>
          {genderRatioQuery.isLoading && (
            <p style={{ color: '#94a3b8', fontSize: '13px' }}>Loading...</p>
          )}
          {genderRatioQuery.data && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {genderRatioQuery.data.ratios.map((item: { gender: string; count: number; percentage: number }) => (
                <div key={item.gender}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: '#e2e8f0', fontSize: '13px' }}>{item.gender}</span>
                    <span style={{ color: '#94a3b8', fontSize: '13px' }}>
                      {item.count.toLocaleString()} ({item.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div style={{
                    height: '6px',
                    backgroundColor: '#334155',
                    borderRadius: '3px',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${item.percentage}%`,
                      backgroundColor: '#3b82f6',
                      borderRadius: '3px',
                      transition: 'width 0.3s',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Revenue */}
      <div style={{ ...CARD_STYLE, marginBottom: '24px' }}>
        <h2 style={SECTION_TITLE_STYLE}>Revenue — last {days} days</h2>
        {revenueQuery.isLoading && (
          <p style={{ color: '#94a3b8', fontSize: '13px' }}>Loading...</p>
        )}
        {revenueQuery.data && (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '16px',
              marginBottom: '20px',
              padding: '16px',
              backgroundColor: '#0f172a',
              borderRadius: '6px',
            }}>
              <div>
                <div style={STAT_LABEL_STYLE}>Total Revenue</div>
                <div style={{ ...STAT_VALUE_STYLE, fontSize: '20px', color: '#22c55e' }}>
                  {revenueQuery.data.totalSek.toLocaleString('sv-SE', { style: 'currency', currency: 'SEK' })}
                </div>
              </div>
              {revenueQuery.data.byType && Object.entries(revenueQuery.data.byType).map(([type, amount]) => (
                <div key={type}>
                  <div style={STAT_LABEL_STYLE}>{type}</div>
                  <div style={{ ...STAT_VALUE_STYLE, fontSize: '20px' }}>
                    {(amount as number).toLocaleString('sv-SE', { style: 'currency', currency: 'SEK' })}
                  </div>
                </div>
              ))}
            </div>

            {revenueQuery.data.byDay && revenueQuery.data.byDay.length > 0 && (
              <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={TABLE_HEADER_STYLE}>Date</th>
                      <th style={{ ...TABLE_HEADER_STYLE, textAlign: 'right' }}>Revenue (SEK)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {revenueQuery.data.byDay.map((row: { date: string; amountSek: number }) => (
                      <tr key={row.date}>
                        <td style={TABLE_CELL_STYLE}>{row.date}</td>
                        <td style={{ ...TABLE_CELL_STYLE, textAlign: 'right', color: '#22c55e' }}>
                          {row.amountSek.toLocaleString('sv-SE', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* AI Costs */}
      <div style={CARD_STYLE}>
        <h2 style={SECTION_TITLE_STYLE}>AI Costs — last {days} days</h2>
        {aiCostsQuery.isLoading && (
          <p style={{ color: '#94a3b8', fontSize: '13px' }}>Loading...</p>
        )}
        {aiCostsQuery.data && (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '16px',
              marginBottom: '20px',
              padding: '16px',
              backgroundColor: '#0f172a',
              borderRadius: '6px',
            }}>
              <div>
                <div style={STAT_LABEL_STYLE}>Total Tokens</div>
                <div style={{ ...STAT_VALUE_STYLE, fontSize: '20px' }}>
                  {aiCostsQuery.data.totalTokens.toLocaleString()}
                </div>
              </div>
              <div>
                <div style={STAT_LABEL_STYLE}>Estimated Cost</div>
                <div style={{ ...STAT_VALUE_STYLE, fontSize: '20px', color: '#f59e0b' }}>
                  ${aiCostsQuery.data.estimatedCostUsd?.toFixed(2) ?? '—'}
                </div>
              </div>
            </div>

            {aiCostsQuery.data.byType && aiCostsQuery.data.byType.length > 0 && (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={TABLE_HEADER_STYLE}>Type</th>
                    <th style={{ ...TABLE_HEADER_STYLE, textAlign: 'right' }}>Tokens</th>
                    <th style={{ ...TABLE_HEADER_STYLE, textAlign: 'right' }}>Requests</th>
                  </tr>
                </thead>
                <tbody>
                  {aiCostsQuery.data.byType.map((row: { type: string; tokens: number; requests: number }) => (
                    <tr key={row.type}>
                      <td style={TABLE_CELL_STYLE}>{row.type}</td>
                      <td style={{ ...TABLE_CELL_STYLE, textAlign: 'right' }}>
                        {row.tokens.toLocaleString()}
                      </td>
                      <td style={{ ...TABLE_CELL_STYLE, textAlign: 'right', color: '#94a3b8' }}>
                        {row.requests.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  return (
    <AdminGuard>
      <AnalyticsContent />
    </AdminGuard>
  )
}
