'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { ApiError } from '../../../lib/api/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();

  const validate = (): boolean => {
    const errs: { email?: string; password?: string } = {};
    if (!email.trim()) {
      errs.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'Please enter a valid email address';
    }

    if (!password) {
      errs.password = 'Password is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      await login({ email: email.trim(), password });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.details && err.details.length > 0) {
          const fieldErrs: { email?: string; password?: string; general?: string } = {};
          err.details.forEach((d) => {
            if (d.field.includes('email')) fieldErrs.email = d.message;
            else if (d.field.includes('password')) fieldErrs.password = d.message;
          });
          setErrors(fieldErrs);
        } else {
          setErrors({ general: err.message });
        }
      } else if (err instanceof Error) {
        setErrors({ general: err.message });
      } else {
        setErrors({ general: 'Failed to sign in. Please verify your credentials.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #cccccc',
        borderRadius: '4px',
        padding: '20px',
        marginBottom: '14px',
      }}
    >
      <h2 style={{ marginBottom: '1rem', textAlign: 'center', color: '#222222', fontSize: '1.25rem' }}>
        Login
      </h2>

      {errors.general && (
        <div
          style={{
            padding: '8px 12px',
            marginBottom: '1rem',
            background: '#f8d7da',
            border: '1px solid #f5c6cb',
            color: '#721c24',
            borderRadius: '4px',
            fontSize: '0.85rem',
          }}
          role="alert"
        >
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          autoComplete="email"
          autoFocus
        />

        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          autoComplete="current-password"
        />

        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          style={{ width: '100%', marginTop: '0.5rem' }}
        >
          Sign In
        </Button>
      </form>

      <div
        style={{
          marginTop: '1.25rem',
          paddingTop: '1rem',
          borderTop: '1px solid #dddddd',
          textAlign: 'center',
          fontSize: '0.85rem',
          color: '#666666',
        }}
      >
        Don&apos;t have an account?{' '}
        <Link href="/register" style={{ color: '#0066cc', textDecoration: 'none' }}>
          Register here
        </Link>
      </div>
    </div>
  );
}
