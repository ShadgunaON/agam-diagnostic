import React from 'react';

export type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * Reusable Skeleton primitive.
 * Used as a placeholder while content is loading.
 */
export function Skeleton({ className = '', ...props }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-md bg-muted ${className}`}
      {...props}
    />
  );
}
