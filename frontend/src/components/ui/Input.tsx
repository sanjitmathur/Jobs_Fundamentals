import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, id, style, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    const inputStyle: React.CSSProperties = {
      width: '100%',
      padding: '7px 10px',
      fontSize: '13px',
      fontFamily: 'inherit',
      border: error ? '1px solid #d9534f' : '1px solid #cccccc',
      borderRadius: '4px',
      backgroundColor: '#ffffff',
      color: '#333333',
      boxSizing: 'border-box',
      outline: 'none',
      ...style,
    };

    return (
      <div style={{ marginBottom: '12px' }}>
        {label && (
          <label
            htmlFor={inputId}
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 'bold',
              color: '#333333',
              marginBottom: '4px',
            }}
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          style={inputStyle}
          {...props}
        />
        {error && (
          <div
            style={{
              color: '#d9534f',
              fontSize: '12px',
              marginTop: '3px',
            }}
            role="alert"
          >
            {error}
          </div>
        )}
        {helperText && !error && (
          <span style={{ fontSize: '0.8rem', color: '#666', marginTop: '3px', display: 'block' }}>
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
