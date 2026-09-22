import React from 'react';
import { Loader2 } from 'lucide-react';

interface SpinnerProps {
  size?: number;
  style?: React.CSSProperties;
}

export function Spinner({ size = 20, style }: SpinnerProps) {
  return (
    <Loader2
      size={size}
      style={{
        display: 'inline-block',
        animation: 'spin 0.8s linear infinite',
        ...style,
      }}
      aria-label="Loading..."
    />
  );
}
