'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header
      style={{
        backgroundColor: '#ffffff',
        borderBottom: '2px solid #0066cc',
        padding: '12px 0',
        marginBottom: '20px',
      }}
    >
      <div
        style={{
          maxWidth: '960px',
          margin: '0 auto',
          padding: '0 15px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Link
          href="/jobs"
          style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#0066cc',
            textDecoration: 'none',
          }}
        >
          Job Management App
        </Link>

        {isAuthenticated && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '13px', color: '#555555' }}>
              {user?.email || 'User'}
              <span
                style={{
                  backgroundColor: '#e2e8f0',
                  color: '#333333',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  marginLeft: '4px',
                }}
              >
                {user?.role}
              </span>
            </span>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => logout('Logged out successfully')}
            >
              Logout
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
