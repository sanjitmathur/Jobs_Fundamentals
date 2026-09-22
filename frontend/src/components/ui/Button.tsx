import React from 'react';
import { Spinner } from './Spinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const sizeStyles: Record<'sm' | 'md' | 'lg', React.CSSProperties> = {
    sm: { padding: '4px 8px', fontSize: '12px' },
    md: { padding: '6px 12px', fontSize: '13px' },
    lg: { padding: '8px 16px', fontSize: '14px' },
  };

  const variantStyles: Record<'primary' | 'secondary' | 'danger' | 'ghost', React.CSSProperties> = {
    primary: {
      backgroundColor: '#0066cc',
      borderColor: '#0052a3',
      color: '#ffffff',
      border: '1px solid #0052a3',
    },
    secondary: {
      backgroundColor: '#f8f9fa',
      borderColor: '#cccccc',
      color: '#333333',
      border: '1px solid #cccccc',
    },
    danger: {
      backgroundColor: '#d9534f',
      borderColor: '#d43f3a',
      color: '#ffffff',
      border: '1px solid #d43f3a',
    },
    ghost: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      color: '#555555',
      border: '1px solid transparent',
    },
  };

  const buttonStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    fontFamily: 'inherit',
    borderRadius: '4px',
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    textDecoration: 'none',
    textAlign: 'center',
    verticalAlign: 'middle',
    opacity: disabled || isLoading ? 0.6 : 1,
    boxSizing: 'border-box',
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...style,
  };

  return (
    <button
      style={buttonStyle}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Spinner size={size === 'sm' ? 14 : 18} />
          <span>{children}</span>
        </>
      ) : (
        <>
          {leftIcon && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{rightIcon}</span>}
        </>
      )}
    </button>
  );
}
