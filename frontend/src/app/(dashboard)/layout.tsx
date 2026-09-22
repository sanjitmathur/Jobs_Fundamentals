'use client';

import React from 'react';
import { ProtectedRoute } from '../../components/layout/ProtectedRoute';
import { Navbar } from '../../components/layout/Navbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ flex: 1, padding: '2rem 0 4rem 0', position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 15px' }}>
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
