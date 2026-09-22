import React from 'react';

interface JobFilterBarProps {
  currentStatus: string;
  onStatusChange: (status: string) => void;
  limit: number;
  onLimitChange: (limit: number) => void;
  totalJobs?: number;
}

const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Failed', value: 'FAILED' },
];

export function JobFilterBar({
  currentStatus,
  onStatusChange,
  limit,
  onLimitChange,
  totalJobs,
}: JobFilterBarProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        margin: '1rem 0',
        padding: '0.6rem 0.8rem',
        background: '#ffffff',
        border: '1px solid #cccccc',
        borderRadius: '4px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, marginRight: '0.3rem' }}>
          Status:
        </span>
        {STATUS_FILTERS.map((tab) => {
          const isActive = currentStatus === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => onStatusChange(tab.value)}
              style={{
                display: 'inline-block',
                padding: '4px 8px',
                fontSize: '12px',
                fontFamily: 'inherit',
                borderRadius: '4px',
                border: isActive ? '1px solid #0052a3' : '1px solid #cccccc',
                backgroundColor: isActive ? '#0066cc' : '#f8f9fa',
                color: isActive ? '#ffffff' : '#333333',
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {totalJobs !== undefined && (
          <span style={{ fontSize: '0.85rem', color: '#666' }}>
            Total: <strong>{totalJobs}</strong>
          </span>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ fontSize: '0.85rem', color: '#666' }}>Show:</span>
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            style={{
              width: 'auto',
              padding: '3px 8px',
              fontSize: '0.85rem',
              fontFamily: 'inherit',
              border: '1px solid #cccccc',
              borderRadius: '4px',
              backgroundColor: '#ffffff',
              color: '#333333',
              outline: 'none',
            }}
          >
            <option value={6}>6</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>
      </div>
    </div>
  );
}
