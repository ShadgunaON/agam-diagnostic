"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Drawer } from '@/components/ui';

export interface MobileNavigationProps {
  className?: string;
}

export function MobileNavigation({ className = '' }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

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

  const closeMenu = () => setIsOpen(false);

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
            
            <div className="flex flex-col gap-3">
              <span className="text-muted-foreground text-sm font-bold uppercase tracking-wider">Packages</span>
              <Link href="/health-packages" className="pl-4 hover:text-primary transition-colors" onClick={closeMenu}>All Packages</Link>
              <Link href="/men-health" className="pl-4 hover:text-primary transition-colors" onClick={closeMenu}>Men Health</Link>
              <Link href="/women-health" className="pl-4 hover:text-primary transition-colors" onClick={closeMenu}>Women Health</Link>
              <Link href="/lifestyle-health" className="pl-4 hover:text-primary transition-colors" onClick={closeMenu}>Lifestyle Health</Link>
            </div>

            <div className="flex flex-col gap-3">
              <span className="text-muted-foreground text-sm font-bold uppercase tracking-wider">Tests</span>
              <Link href="/tests" className="pl-4 hover:text-primary transition-colors" onClick={closeMenu}>All Lab Tests</Link>
            </div>

            <Link href="/blog" className="hover:text-primary transition-colors" onClick={closeMenu}>Blog</Link>
            
            <div className="flex flex-col gap-3">
              <span className="text-muted-foreground text-sm font-bold uppercase tracking-wider">Contact</span>
              <Link href="/contact" className="pl-4 hover:text-primary transition-colors" onClick={closeMenu}>Location & Help</Link>
              <Link href="/faq" className="pl-4 hover:text-primary transition-colors" onClick={closeMenu}>FAQ</Link>
            </div>
          </nav>
        </Drawer.Body>
      </Drawer.Content>
    </Drawer>
  );
}
