import React from 'react';
import { AdminIcon, AdminIconName } from '../navigation/AdminIcons';

export interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  icon?: AdminIconName;
  status?: 'success' | 'warning' | 'danger' | 'neutral' | 'info';
  actor?: string;
}

interface TimelineProps {
  events: TimelineEvent[];
}

const statusColors = {
  success: 'bg-green-100 text-green-600 border-green-200',
  warning: 'bg-amber-100 text-amber-600 border-amber-200',
  danger: 'bg-red-100 text-red-600 border-red-200',
  info: 'bg-blue-100 text-blue-600 border-blue-200',
  neutral: 'bg-slate-100 text-slate-600 border-slate-200',
};

export function Timeline({ events }: TimelineProps) {
  if (!events || events.length === 0) return null;

  return (
    <div className="flow-root">
      <ul role="list" className="-mb-8">
        {events.map((event, eventIdx) => (
          <li key={event.id}>
            <div className="relative pb-8">
              {eventIdx !== events.length - 1 ? (
                <span 
                  className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-[var(--admin-border)]" 
                  aria-hidden="true" 
                />
              ) : null}
              <div className="relative flex space-x-3">
                <div>
                  <span 
                    className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-[var(--admin-surface)] border ${
                      statusColors[event.status || 'neutral']
                    }`}
                  >
                    <AdminIcon name={event.icon || 'check'} className="w-4 h-4" />
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                  <div>
                    <p className="text-sm font-medium text-[var(--admin-text-main)]">
                      {event.title}{' '}
                      {event.actor && (
                        <span className="font-normal text-[var(--admin-text-muted)]">by {event.actor}</span>
                      )}
                    </p>
                    {event.description && (
                      <p className="mt-1 text-sm text-[var(--admin-text-muted)]">{event.description}</p>
                    )}
                  </div>
                  <div className="whitespace-nowrap text-right text-xs text-[var(--admin-text-muted)]">
                    <time dateTime={event.timestamp}>{event.timestamp}</time>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
