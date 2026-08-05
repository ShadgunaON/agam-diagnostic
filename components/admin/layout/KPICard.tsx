'use client';

import React, { useEffect, useState } from 'react';
import { AdminIcon, AdminIconName } from '../navigation/AdminIcons';

interface KPICardProps {
  title: string;
  value: string | number;
  icon?: AdminIconName;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  index?: number;
}

// Custom hook for smooth count-up animation
function useCountUp(endStr: string | number, duration: number = 800) {
  const [displayValue, setDisplayValue] = useState<string | number>(endStr);

  useEffect(() => {
    const valStr = String(endStr);
    // Parse formatting (e.g. "₹18,450" -> prefix "₹", number 18450, suffix "")
    const numMatch = valStr.match(/^([^0-9]*)([0-9,.]+)([^0-9]*)$/);

    if (!numMatch) return;

    const prefix = numMatch[1];
    const numStr = numMatch[2].replace(/,/g, '');
    const suffix = numMatch[3];
    const endNum = parseFloat(numStr);
    const hasCommas = numMatch[2].includes(',');

    if (isNaN(endNum)) return;

    let startTimestamp: number | null = null;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);

      // easeOutQuart easing function for smooth deceleration
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      const currentNum = easeProgress * endNum;

      let formattedNum = currentNum % 1 === 0
        ? Math.floor(currentNum).toString()
        : currentNum.toFixed(endNum % 1 === 0 ? 0 : 1);

      if (hasCommas) {
        formattedNum = Number(formattedNum).toLocaleString('en-IN');
      }

      setDisplayValue(`${prefix}${formattedNum}${suffix}`);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayValue(endStr);
      }
    };

    window.requestAnimationFrame(step);
  }, [endStr, duration]);

  return displayValue;
}

export function KPICard({
  title,
  value,
  icon,
  trend,
  index
}: KPICardProps) {
  const animatedValue = useCountUp(value, 850);
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isPositive = trend?.isPositive ?? true;

  // Infer index for stagger animation if not provided via props
  const indexMap: Record<string, number> = {
    "Today's Bookings": 0,
    "Pending": 1,
    "Home Collections": 2,
    "Revenue Today": 3
  };
  const cardIndex = index !== undefined ? index : (indexMap[title] || 0);

  // Theme logic for the 2px accent line and icon background
  let theme = { color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe', text: '#2563eb' }; // Default Blue
  if (icon === 'clock' || title.includes('Pending')) theme = { color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', text: '#d97706' }; // Amber
  if (icon === 'mapPin' || title.includes('Home')) theme = { color: '#10b981', bg: '#ecfdf5', border: '#a7f3d0', text: '#059669' }; // Emerald
  if (icon === 'creditCard' || title.includes('Revenue')) theme = { color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe', text: '#7c3aed' }; // Violet

  return (
    <div
      style={{
        position: 'relative',
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        border: `1px solid ${isHovered ? '#CBD5E1' : '#EAECEF'}`,
        borderRadius: '12px',
        boxShadow: isHovered ? '0 8px 24px rgba(0,0,0,0.06)' : '0 2px 10px rgba(0,0,0,0.02)',
        transform: isHovered ? 'translateY(-2px)' : (mounted ? 'translateY(0)' : 'translateY(12px)'),
        opacity: mounted ? 1 : 0,
        transition: 'all 300ms ease-out',
        transitionDelay: mounted && !isHovered ? `${cardIndex * 80}ms` : '0ms',
        overflow: 'hidden',
        cursor: 'pointer'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 2px Top Accent Line */}
      <div style={{ height: '2px', width: '100%', backgroundColor: theme.color, position: 'absolute', top: 0, left: 0 }} />

      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', height: '100%' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          {/* Label */}
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>
            {title}
          </div>

          {/* Icon Container */}
          {icon && (
            <div
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                width: '36px', height: '36px', borderRadius: '10px',
                backgroundColor: theme.bg, border: `1px solid ${theme.border}`,
                color: theme.text,
                transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                transition: 'transform 300ms ease-out'
              }}
            >
              <AdminIcon name={icon} style={{ width: '16px', height: '16px' }} strokeWidth={2.5} />
            </div>
          )}
        </div>

        {/* Large Metric */}
        <div style={{ fontSize: '32px', fontWeight: 700, color: '#0f172a', lineHeight: '1', marginBottom: '12px' }}>
          {animatedValue}
        </div>

        {/* Trend Pill & Supporting Text */}
        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {trend && (
            <>
              <div
                style={{
                  display: 'flex', alignItems: 'center',
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? 'translateY(0)' : 'translateY(4px)',
                  transition: 'all 700ms ease-out',
                  transitionDelay: `${(cardIndex * 80) + 300}ms`
                }}
              >
                <span
                  style={{
                    display: 'inline-flex', alignItems: 'center', padding: '3px 6px', borderRadius: '6px',
                    fontSize: '12px', fontWeight: 700,
                    backgroundColor: isPositive ? '#ecfdf5' : '#fef2f2',
                    color: isPositive ? '#059669' : '#dc2626'
                  }}
                >
                  {isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                </span>
              </div>
              {trend.label && (
                <span
                  style={{
                    fontSize: '13px', fontWeight: 500, color: '#94a3b8',
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? 'translateY(0)' : 'translateY(4px)',
                    transition: 'all 700ms ease-out',
                    transitionDelay: `${(cardIndex * 80) + 400}ms`
                  }}
                >
                  {trend.label}
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
