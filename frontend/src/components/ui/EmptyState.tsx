import React from 'react';
import { Button } from './Button';
import { FolderSearch } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3.5rem 1.5rem',
        textAlign: 'center',
        background: 'rgba(17, 24, 39, 0.4)',
        borderRadius: '6px',
        border: '1px dashed #cccccc',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'rgba(99, 102, 241, 0.1)',
          color: '#0066cc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem',
        }}
      >
        {icon || <FolderSearch size={26} />}
      </div>
      <h3 style={{ fontSize: '1.1rem', marginBottom: '0.4rem', color: '#222222' }}>{title}</h3>
      <p
        style={{
          color: '#666666',
          fontSize: '0.9rem',
          maxWidth: '380px',
          marginBottom: actionLabel ? '1.25rem' : '0',
        }}
      >
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
