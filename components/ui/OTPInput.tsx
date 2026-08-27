import React, { useRef, KeyboardEvent, ClipboardEvent } from 'react';

export interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
}

export function OTPInput({ value, onChange, length = 6 }: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/[^0-9]/g, '');
    if (!inputValue) return;

    const newValue = value.split('');
    newValue[index] = inputValue[inputValue.length - 1]; // Take the last character
    const combinedValue = newValue.join('');
    
    onChange(combinedValue.slice(0, length));

    // Move to next input
    if (index < length - 1 && inputValue) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      const newValue = value.split('');
      if (newValue[index]) {
        // Clear current box
        newValue[index] = '';
        onChange(newValue.join(''));
      } else if (index > 0) {
        // Move to previous box
        inputRefs.current[index - 1]?.focus();
        newValue[index - 1] = '';
        onChange(newValue.join(''));
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').replace(/[^0-9]/g, '').slice(0, length);
    if (pastedData) {
      onChange(pastedData);
      const focusIndex = Math.min(pastedData.length, length - 1);
      inputRefs.current[focusIndex]?.focus();
    }
  };

  return (
    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => { inputRefs.current[index] = el; }}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          style={{
            width: '48px',
            height: '56px',
            fontSize: '24px',
            fontWeight: '600',
            textAlign: 'center',
            borderRadius: '12px',
            border: '1px solid rgba(14,165,233,0.3)',
            outline: 'none',
            color: 'var(--color-dark)',
            background: 'var(--color-white)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
            transition: 'all 0.2s ease',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--color-primary)';
            e.target.style.boxShadow = '0 0 0 3px rgba(14,165,233,0.15)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'rgba(14,165,233,0.3)';
            e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)';
          }}
        />
      ))}
    </div>
  );
}
