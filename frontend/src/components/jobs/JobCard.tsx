import React from 'react';
import Link from 'next/link';
import { Job } from '../../types/job';
import { formatDate } from '../../lib/utils';

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  const statusLabel = job.status ? job.status.replace('_', ' ') : 'Pending';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '16px' }}>
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #cccccc',
          borderRadius: '4px',
          padding: '16px',
          marginBottom: '6px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ marginBottom: '0.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', margin: 0 }}>
            <Link href={`/jobs/${job.id}`} style={{ color: '#0066cc', textDecoration: 'none' }}>
              {job.title}
            </Link>
          </h3>
        </div>

        <p style={{ color: '#555', fontSize: '0.875rem', marginBottom: '1rem', minHeight: '40px' }}>
          {job.description || <span style={{ color: '#999' }}>No description</span>}
        </p>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '0.5rem',
            borderTop: '1px solid #eeeeee',
            fontSize: '0.8rem',
            color: '#777',
          }}
        >
          <span>Created: {formatDate(job.createdAt)}</span>
          <Link
            href={`/jobs/${job.id}`}
            style={{
              display: 'inline-block',
              padding: '4px 8px',
              fontSize: '12px',
              borderRadius: '4px',
              border: '1px solid #cccccc',
              backgroundColor: '#f8f9fa',
              color: '#333333',
              textDecoration: 'none',
            }}
          >
            View Details
          </Link>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '13px',
          color: '#000000',
          padding: '2px 2px',
        }}
      >
        <span style={{ fontWeight: 'bold', color: '#000000' }}>Status:</span>
        <span style={{ color: '#000000', fontWeight: 'normal', textTransform: 'capitalize' }}>
          {statusLabel}
        </span>
      </div>
    </div>
  );
}
