'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function ScrollRevealInit() {
  const pathname = usePathname();

  useEffect(() => {
    // 1. Scroll Reveal Observer
    const revealEls = document.querySelectorAll('.reveal, .fade-in, .premium-card-anim');
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target.classList.contains('fade-in')) {
              (entry.target as HTMLElement).style.opacity = '1';
              (entry.target as HTMLElement).style.animation = 'fadeInUp 0.6s var(--ease) forwards';
              entry.target.classList.remove('fade-in');
            } else {
              entry.target.classList.add('is-visible');
            }
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px -20px 0px' }
    );

    revealEls.forEach((el) => {
      if (el.classList.contains('fade-in')) {
        (el as HTMLElement).style.opacity = '0';
      }
      // Check if already in viewport on load
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add('is-visible');
      } else {
        revealObserver.observe(el);
      }
    });

    // 2. 3D Tilt Interaction
    const premiumCards = document.querySelectorAll('.card--service-premium');
    const mouseMoveHandlers: Array<{ el: HTMLElement; handler: (e: MouseEvent) => void; leaveHandler: () => void }> = [];

    premiumCards.forEach((card) => {
      const el = card as HTMLElement;
      const handler = (e: MouseEvent) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -3;
        const rotateY = ((x - centerX) / centerX) * 3;
        el.style.transform = `translateY(-6px) perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        el.style.transition = 'transform 0.1s ease';
      };

      const leaveHandler = () => {
        el.style.transform = '';
        el.style.transition = 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
      };

      el.addEventListener('mousemove', handler);
      el.addEventListener('mouseleave', leaveHandler);
      mouseMoveHandlers.push({ el, handler, leaveHandler });
    });

    return () => {
      revealObserver.disconnect();
      mouseMoveHandlers.forEach(({ el, handler, leaveHandler }) => {
        el.removeEventListener('mousemove', handler);
        el.removeEventListener('mouseleave', leaveHandler);
      });
    };
  }, [pathname]);

  return null;
}
