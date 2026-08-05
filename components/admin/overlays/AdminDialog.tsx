'use client';

import React, { useEffect, useRef } from 'react';
import { AdminIcon } from '../navigation/AdminIcons';
import { AdminButton } from '../primitives/AdminButton';

interface AdminDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * AdminDialog — Reusable modal dialog for the admin portal.
 *
 * Usage:
 *   Confirm actions (cancel booking, delete record)
 *   Form submissions (quick edit, assignment)
 *   Informational alerts
 *
 * Sizes:
 *   sm (400px) — confirmation dialogs
 *   md (480px) — forms with a few fields
 *   lg (640px) — complex forms, previews
 */
export function AdminDialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'sm',
}: AdminDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Prevent background scrolling
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Focus trap: focus the dialog on open
  useEffect(() => {
    if (isOpen && dialogRef.current) {
      dialogRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-[400px]',
    md: 'max-w-[480px]',
    lg: 'max-w-[640px]',
  }[size];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Dialog Panel */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        tabIndex={-1}
        className={`relative w-full ${sizeClasses} bg-white rounded-lg shadow-[0_16px_48px_rgba(0,0,0,0.12)] border border-slate-200/50 focus:outline-none`}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 pb-0">
          <div>
            <h2 id="dialog-title" className="text-[16px] font-semibold text-slate-900 leading-snug">
              {title}
            </h2>
            {description && (
              <p className="text-[13px] text-slate-500 mt-1 leading-relaxed">{description}</p>
            )}
          </div>
          <AdminButton
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="-mt-1 -mr-1 shrink-0 ml-4"
          >
            <AdminIcon name="x" className="w-4 h-4" strokeWidth={2.5} />
          </AdminButton>
        </div>

        {/* Content */}
        {children && (
          <div className="p-5">
            {children}
          </div>
        )}

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-2.5 px-5 pb-5 pt-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Pre-built footer button helpers for common patterns.
 */
export function DialogFooterCancel({ onClose, label = 'Cancel' }: { onClose: () => void; label?: string }) {
  return (
    <AdminButton variant="secondary" onClick={onClose}>
      {label}
    </AdminButton>
  );
}

export function DialogFooterConfirm({
  onClick,
  label = 'Confirm',
  variant = 'primary',
  disabled = false,
}: {
  onClick: () => void;
  label?: string;
  variant?: 'primary' | 'danger';
  disabled?: boolean;
}) {
  return (
    <AdminButton
      variant={variant}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </AdminButton>
  );
}
