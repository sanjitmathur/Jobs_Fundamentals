import React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
      }}
    >
      <div style={{ marginBottom: '1.25rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', color: '#0066cc' }}>Job Management App</h1>
      </div>

      <div style={{ width: '100%', maxWidth: '380px' }}>
        {children}
      </div>
    </div>
  );
}
