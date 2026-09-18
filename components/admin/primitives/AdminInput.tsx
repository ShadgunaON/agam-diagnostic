import React, { useState } from 'react';

export interface AdminInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
  wrapperClassName?: string;
  label?: string;
  multiline?: boolean;
  rows?: number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const AdminInput = React.forwardRef<HTMLInputElement | HTMLTextAreaElement, AdminInputProps>(
  ({ className = '', wrapperClassName = '', icon, rightElement, disabled, onFocus, onBlur, label, multiline, rows, ...props }, ref) => {
    
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = (e: any) => {
      setIsFocused(true);
      if (onFocus) onFocus(e);
    };

    const handleBlur = (e: any) => {
      setIsFocused(false);
      if (onBlur) onBlur(e);
    };

    // Premium styling applied to the wrapper
    const wrapperBase = "flex items-center w-full min-h-[40px] transition-all duration-200 border";
    const wrapperDefault = "bg-slate-50 border-slate-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.01)]";
    const wrapperHover = !disabled && !isFocused ? "hover:bg-slate-100/50 hover:border-slate-300/80" : "";
    const wrapperFocus = isFocused ? "bg-white border-slate-300 ring-4 ring-slate-900/5 shadow-sm" : "";
    const wrapperDisabled = disabled ? "opacity-50 bg-slate-100 cursor-not-allowed" : "";
    
    // Default shape is rounded-md, but can be overridden by wrapperClassName (e.g. rounded-full)
    const shapeClasses = wrapperClassName.includes('rounded-') ? '' : 'rounded-md';

    const inputWrapper = (
      <div className={`${wrapperBase} ${wrapperDefault} ${wrapperHover} ${wrapperFocus} ${wrapperDisabled} ${shapeClasses} ${wrapperClassName}`}>
        {icon && (
          <div className="pl-3.5 pr-1.5 flex items-center justify-center shrink-0 text-slate-400">
            {icon}
          </div>
        )}
        {multiline ? (
          <textarea
            ref={ref as React.Ref<HTMLTextAreaElement>}
            disabled={disabled}
            onFocus={handleFocus as any}
            onBlur={handleBlur as any}
            rows={rows}
            className={`flex-1 bg-transparent border-none outline-none text-[13px] text-slate-900 placeholder:text-slate-400 min-w-0 py-2.5 resize-y ${icon ? 'pl-1' : 'pl-3.5'} ${rightElement ? 'pr-1' : 'pr-3.5'} ${className}`}
            style={{ boxShadow: 'none', background: 'transparent' }}
            {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input
            ref={ref as React.Ref<HTMLInputElement>}
            disabled={disabled}
            onFocus={handleFocus as any}
            onBlur={handleBlur as any}
            className={`flex-1 bg-transparent border-none outline-none text-[13px] text-slate-900 placeholder:text-slate-400 min-w-0 h-full py-2 ${icon ? 'pl-1' : 'pl-3.5'} ${rightElement ? 'pr-1' : 'pr-3.5'} ${className}`}
            style={{ boxShadow: 'none', background: 'transparent' }}
            {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
          />
        )}
        {rightElement && (
          <div className="pr-2 pl-1.5 flex items-center shrink-0">
            {rightElement}
          </div>
        )}
      </div>
    );

    if (label) {
      return (
        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-xs font-semibold text-slate-700">{label}</label>
          {inputWrapper}
        </div>
      );
    }
    
    return inputWrapper;
  }
);

AdminInput.displayName = 'AdminInput';
