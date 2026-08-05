/* eslint-disable @next/next/no-img-element */
import React, { forwardRef } from 'react';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
}

/**
 * Reusable Avatar primitive.
 * Displays user profile image or a fallback text/icon.
 */
export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className = '', src, alt = '', fallback, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted ${className}`}
        {...props}
      >
        {src ? (
          <img
            src={src}
            alt={alt}
            className="aspect-square h-full w-full object-cover"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center rounded-full bg-muted text-muted-foreground font-medium">
            {fallback}
          </span>
        )}
      </div>
    );
  }
);
Avatar.displayName = 'Avatar';
