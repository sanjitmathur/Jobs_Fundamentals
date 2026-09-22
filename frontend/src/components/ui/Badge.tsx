import React from 'react';
import { JobStatus } from '../../types/job';

interface BadgeProps {
  status: JobStatus | string;
  style?: React.CSSProperties;
}

export function Badge({ status, style }: BadgeProps) {
  const label = status ? status.replace('_', ' ') : 'Unknown';

  return (
    <span
      style={{
        display: 'inline',
        fontSize: '13px',
        color: '#000000',
        fontWeight: 'normal',
        textTransform: 'capitalize',
        ...style,
      }}
    >
      {label}
    </span>
  );
}
