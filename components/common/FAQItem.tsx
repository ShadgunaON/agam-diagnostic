'use client';

import React, { useState } from 'react';

export interface FAQItemProps {
  question: string;
  answer: string;
  isOpen?: boolean;
  defaultOpen?: boolean;
  onToggle?: () => void;
  className?: string;
}

/**
 * FAQ Accordion Item — matches approved HTML wireframe index.html lines 521-549.
 * Each item is an INDIVIDUAL rounded card with its own border and background.
 * Items are separated by gap, NOT by internal border-bottom dividers.
 *
 * HTML reference: .accordion__item { bg: var(--color-bg-alt), border: 1px solid var(--color-border), border-radius: var(--radius-lg) }
 * Open state: { bg: #fff, shadow: var(--shadow-premium), transform: translateY(-2px) }
 */
export function FAQItem({ question, answer, isOpen, defaultOpen = false, onToggle, className = '' }: FAQItemProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(defaultOpen);
  
  const isControlled = isOpen !== undefined && onToggle !== undefined;
  const currentIsOpen = isControlled ? isOpen : internalIsOpen;
  
  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    }
    if (!isControlled) {
      setInternalIsOpen(!internalIsOpen);
    }
  };

  return (
    <div className={`accordion__item ${currentIsOpen ? 'is-open' : ''} ${className}`}>
      <button className="accordion__header" onClick={handleToggle}>
        {question}
        <svg className="accordion__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      <div className="accordion__body" style={{ maxHeight: currentIsOpen ? '1000px' : '0', overflow: 'hidden', transition: 'max-height 0.4s ease' }}>
        <div className="accordion__content">{answer}</div>
      </div>
    </div>
  );
}
