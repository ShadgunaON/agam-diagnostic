import React, { useState } from 'react';

export interface AdminInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
  wrapperClassName?: string;
}

export const AdminInput = React.forwardRef<HTMLInputElement, AdminInputProps>(
  ({ className = '', wrapperClassName = '', icon, rightElement, disabled, onFocus, onBlur, ...props }, ref) => {
    
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      if (onFocus) onFocus(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      if (onBlur) onBlur(e);
    };

    // Premium styling applied to the wrapper
    const wrapperBase = "flex items-center w-full transition-all duration-200 border";
    const wrapperDefault = "bg-slate-50 border-slate-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.01)]";
    const wrapperHover = !disabled && !isFocused ? "hover:bg-slate-100/50 hover:border-slate-300/80" : "";
    const wrapperFocus = isFocused ? "bg-white border-slate-300 ring-4 ring-slate-900/5 shadow-sm" : "";
    const wrapperDisabled = disabled ? "opacity-50 bg-slate-100 cursor-not-allowed" : "";
    
    // Default shape is rounded-md, but can be overridden by wrapperClassName (e.g. rounded-full)
    const shapeClasses = wrapperClassName.includes('rounded-') ? '' : 'rounded-md';

    return (
      <div className={`${wrapperBase} ${wrapperDefault} ${wrapperHover} ${wrapperFocus} ${wrapperDisabled} ${shapeClasses} ${wrapperClassName}`}>
        {icon && (
          <div className="pl-3.5 pr-1.5 flex items-center justify-center shrink-0 text-slate-400">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          disabled={disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={`flex-1 bg-transparent border-none outline-none text-[13px] text-slate-900 placeholder:text-slate-400 py-2 min-w-0 ${icon ? 'pl-1' : 'pl-3.5'} ${rightElement ? 'pr-1' : 'pr-3.5'} ${className}`}
          // Reset global CSS that might override padding or bg
          style={{ boxShadow: 'none', background: 'transparent' }}
          {...props}
        />
        {rightElement && (
          <div className="pr-2 pl-1.5 flex items-center shrink-0">
            {rightElement}
          </div>
        )}
      </div>
    );
  }
);

AdminInput.displayName = 'AdminInput';
