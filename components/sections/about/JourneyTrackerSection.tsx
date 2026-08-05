'use client';

import React, { useState, useEffect } from 'react';
import { Section, Container } from '@/components/ui';

export interface MilestoneItem {
  year: string;
  title: string;
  progress: number;
  description: string;
  bg: string;
  color: string;
}

export interface JourneyTrackerSectionProps {
  data: MilestoneItem[];
  className?: string;
}

export function JourneyTrackerSection({ data, className = '' }: JourneyTrackerSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Set initial value
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const activeMilestone = data[activeIndex] || data[0];
  const progress = activeMilestone.progress;

  return (
    <section className={`section bg-mesh journey-tracker-section ${className}`}>
      <div className="container">
        <div className="section-header section-header--center" style={{ marginBottom: 'var(--sp-10)' }}>
          <div className="section-header__overline">Milestones</div>
          <h2 className="section-header__title">Our Journey</h2>
        </div>

        <div className="jt-container">
          {/* Tracker */}
          <div className="jt-tracker">
            <div className="jt-line-bg"></div>
            <div 
              className="jt-line-fill"
              style={{
                width: isMobile ? '2px' : `${progress}%`,
                height: isMobile ? `${progress}%` : '2px'
              }}
            ></div>

            {data.map((item, idx) => (
              <div 
                key={idx}
                className={`jt-node ${activeIndex === idx ? 'is-active' : ''}`}
                onClick={() => setActiveIndex(idx)}
                onMouseEnter={() => setActiveIndex(idx)}
              >
                <div className="jt-year">{item.year}</div>
                <div className="jt-dot"></div>
                <div className="jt-title">{item.title}</div>
              </div>
            ))}
          </div>

          {/* Panel Container */}
          <div className="jt-panel-container">
            {data.map((item, idx) => {
              // Map icons exactly like about.html panels
              let icon = <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>;
              if (idx === 1) icon = <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>;
              if (idx === 2) icon = <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>;
              if (idx === 3) icon = <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>;

              return (
                <div 
                  key={idx}
                  className={`jt-panel ${activeIndex === idx ? 'is-active' : ''}`}
                >
                  <div 
                    className="jt-panel-icon"
                    style={{ background: item.bg, color: item.color }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      {icon}
                    </svg>
                  </div>
                  <div className="jt-panel-content">
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
