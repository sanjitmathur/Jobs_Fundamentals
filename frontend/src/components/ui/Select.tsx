import React, { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Option[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, id, style, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    const selectStyle: React.CSSProperties = {
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
            htmlFor={selectId}
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
        <select
          id={selectId}
          ref={ref}
          style={selectStyle}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
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
      </div>
    );
  }
);

Select.displayName = 'Select';
