import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PaginationMeta } from '../../types/api';

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (newPage: number) => void;
}

export function Pagination({ meta, onPageChange }: PaginationProps) {
  const { page, totalPages, total } = meta;

  if (totalPages <= 1 && total <= meta.limit) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginTop: '2rem',
        padding: '0.75rem 0',
      }}
    >
      <div style={{ fontSize: '0.875rem', color: '#666666' }}>
        Showing page <span style={{ color: '#222222', fontWeight: 600 }}>{page}</span> of{' '}
        <span style={{ color: '#222222', fontWeight: 600 }}>{totalPages || 1}</span> (
        {total} total jobs)
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 8px',
            fontSize: '12px',
            fontFamily: 'inherit',
            borderRadius: '4px',
            border: '1px solid #cccccc',
            backgroundColor: '#f8f9fa',
            color: '#333333',
            cursor: page <= 1 ? 'not-allowed' : 'pointer',
            opacity: page <= 1 ? 0.6 : 1,
          }}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
          <span>Previous</span>
        </button>

        <div style={{ display: 'flex', gap: '0.25rem' }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
            .map((p, idx, arr) => {
              const prev = arr[idx - 1];
              return (
                <React.Fragment key={p}>
                  {prev && p - prev > 1 && (
                    <span
                      style={{
                        padding: '0.2rem 0.5rem',
                        color: '#888888',
                        fontSize: '0.85rem',
                      }}
                    >
                      ...
                    </span>
                  )}
                  <button
                    onClick={() => onPageChange(p)}
                    style={{
                      minWidth: '32px',
                      padding: '4px 8px',
                      fontSize: '12px',
                      fontFamily: 'inherit',
                      borderRadius: '4px',
                      backgroundColor: p === page ? '#0066cc' : '#ffffff',
                      color: p === page ? '#ffffff' : '#333333',
                      border: p === page ? '1px solid #0052a3' : '1px solid #cccccc',
                      cursor: 'pointer',
                    }}
                  >
                    {p}
                  </button>
                </React.Fragment>
              );
            })}
        </div>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 8px',
            fontSize: '12px',
            fontFamily: 'inherit',
            borderRadius: '4px',
            border: '1px solid #cccccc',
            backgroundColor: '#f8f9fa',
            color: '#333333',
            cursor: page >= totalPages ? 'not-allowed' : 'pointer',
            opacity: page >= totalPages ? 0.6 : 1,
          }}
          aria-label="Next page"
        >
          <span>Next</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
