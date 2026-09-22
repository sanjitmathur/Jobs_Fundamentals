import React from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  style?: React.CSSProperties;
}

export function Skeleton({
  width = '100%',
  height = '1rem',
  borderRadius = '4px',
  style,
}: SkeletonProps) {
  return (
    <div
      style={{
        backgroundColor: '#e0e0e0',
        borderRadius,
        width,
        height,
        ...style,
      }}
      aria-hidden="true"
    />
  );
}

export function JobCardSkeleton() {
  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #cccccc',
        borderRadius: '4px',
        padding: '16px',
        marginBottom: '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Skeleton width="60%" height="1.4rem" />
        <Skeleton width="80px" height="1.4rem" borderRadius="9999px" />
      </div>
      <Skeleton width="90%" height="0.9rem" />
      <Skeleton width="45%" height="0.9rem" />
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '0.5rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid #eeeeee',
        }}
      >
        <Skeleton width="100px" height="0.8rem" />
        <Skeleton width="70px" height="1.8rem" />
      </div>
    </div>
  );
}
