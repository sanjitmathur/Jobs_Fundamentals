import React, { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, id, style, rows = 3, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    const textareaStyle: React.CSSProperties = {
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
      resize: 'vertical',
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
        <textarea
          id={inputId}
          ref={ref}
          rows={rows}
          style={textareaStyle}
          {...props}
        />
        {error && (
          <div
            style={{
              color: '#d9534f',
              fontSize: '12px',
              marginTop: '3px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
            role="alert"
          >
            <AlertCircle size={14} />
            <span>{error}</span>
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

Textarea.displayName = 'Textarea';
