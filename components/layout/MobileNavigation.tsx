"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Drawer } from '@/components/ui';

export interface MobileNavigationProps {
  className?: string;
}

export function MobileNavigation({ className = '' }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Close menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 991) {
        setIsOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const closeMenu = () => {
    setIsOpen(false);
    // Optional: reset accordion state on close
    // setExpandedSection(null);
  };

  const toggleSection = (section: string) => {
    setExpandedSection(prev => prev === section ? null : section);
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <Drawer.Trigger asChild>
        <button 
          type="button"
          className={`lg:hidden bg-transparent border-none cursor-pointer flex flex-col justify-center items-center gap-1 w-10 h-10 relative ${className}`.trim()} 
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          <span className={`block w-6 h-0.5 bg-foreground transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
          <span className={`block w-6 h-0.5 bg-foreground transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`}></span>
          <span className={`block w-6 h-0.5 bg-foreground transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
        </button>
      </Drawer.Trigger>
      
      <Drawer.Content side="right" className="pt-20 px-6 pb-6 w-full max-w-none sm:max-w-none border-none">
        <Drawer.Body>
          <nav className="flex flex-col gap-6 text-lg font-medium mt-4">
            <Link href="/" className="hover:text-primary transition-colors" onClick={closeMenu}>Home</Link>
            <Link href="/about" className="hover:text-primary transition-colors" onClick={closeMenu}>About Us</Link>
            <Link href="/services" className="hover:text-primary transition-colors" onClick={closeMenu}>Diagnostic Services</Link>
            
            {/* Packages Accordion */}
            <div className="flex flex-col border-b border-border/50 pb-2">
              <button 
                type="button" 
                onClick={() => toggleSection('packages')}
                className="flex items-center justify-between w-full text-left bg-transparent border-none p-0 cursor-pointer text-muted-foreground hover:text-foreground transition-colors group"
              >
                <span className="text-sm font-bold uppercase tracking-wider group-hover:text-primary transition-colors">Packages</span>
                <svg 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  className={`w-4 h-4 transition-transform duration-200 ${expandedSection === 'packages' ? 'rotate-180 text-primary' : ''}`}
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              
              <div className={`flex flex-col gap-3 overflow-hidden transition-all duration-300 ${expandedSection === 'packages' ? 'max-h-48 mt-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                <Link href="/health-packages" className="pl-4 hover:text-primary transition-colors border-l-2 border-transparent hover:border-primary" onClick={closeMenu}>All Packages</Link>
                <Link href="/men-health" className="pl-4 hover:text-primary transition-colors border-l-2 border-transparent hover:border-primary" onClick={closeMenu}>Men Health</Link>
                <Link href="/women-health" className="pl-4 hover:text-primary transition-colors border-l-2 border-transparent hover:border-primary" onClick={closeMenu}>Women Health</Link>
                <Link href="/lifestyle-health" className="pl-4 hover:text-primary transition-colors border-l-2 border-transparent hover:border-primary" onClick={closeMenu}>Lifestyle Health</Link>
              </div>
            </div>

            {/* Tests Accordion */}
            <div className="flex flex-col border-b border-border/50 pb-2">
              <button 
                type="button" 
                onClick={() => toggleSection('tests')}
                className="flex items-center justify-between w-full text-left bg-transparent border-none p-0 cursor-pointer text-muted-foreground hover:text-foreground transition-colors group"
              >
                <span className="text-sm font-bold uppercase tracking-wider group-hover:text-primary transition-colors">Tests</span>
                <svg 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  className={`w-4 h-4 transition-transform duration-200 ${expandedSection === 'tests' ? 'rotate-180 text-primary' : ''}`}
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              
              <div className={`flex flex-col gap-3 overflow-hidden transition-all duration-300 ${expandedSection === 'tests' ? 'max-h-24 mt-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                <Link href="/tests" className="pl-4 hover:text-primary transition-colors border-l-2 border-transparent hover:border-primary" onClick={closeMenu}>All Lab Tests</Link>
              </div>
            </div>

            <Link href="/blog" className="hover:text-primary transition-colors" onClick={closeMenu}>Blog</Link>
            
            <div className="flex flex-col border-b border-border/50 pb-2">
              <button 
                type="button" 
                onClick={() => toggleSection('contact')}
                className="flex items-center justify-between w-full text-left bg-transparent border-none p-0 cursor-pointer text-muted-foreground hover:text-foreground transition-colors group"
              >
                <span className="text-sm font-bold uppercase tracking-wider group-hover:text-primary transition-colors">Contact</span>
                <svg 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  className={`w-4 h-4 transition-transform duration-200 ${expandedSection === 'contact' ? 'rotate-180 text-primary' : ''}`}
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              
              <div className={`flex flex-col gap-3 overflow-hidden transition-all duration-300 ${expandedSection === 'contact' ? 'max-h-24 mt-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                <Link href="/contact" className="pl-4 hover:text-primary transition-colors border-l-2 border-transparent hover:border-primary" onClick={closeMenu}>Location & Help</Link>
                <Link href="/faq" className="pl-4 hover:text-primary transition-colors border-l-2 border-transparent hover:border-primary" onClick={closeMenu}>FAQ</Link>
              </div>
            </div>
          </nav>
        </Drawer.Body>
      </Drawer.Content>
    </Drawer>
  );
}
