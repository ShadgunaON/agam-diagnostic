import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

/**
 * Card
 * The root container. Responsible for surface, borders, shadows, and interactive state.
 */
export const CardRoot = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "div";
    return (
      <Comp
        ref={ref}
        className={cn(
          "rounded-[24px] border border-[rgba(226,232,240,0.4)] bg-white text-slate-900 shadow-[0_4px_20px_-2px_rgba(11,27,61,0.05)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-[0_24px_48px_-12px_rgba(11,27,61,0.15),0_8px_16px_-6px_rgba(11,27,61,0.08)] hover:border-[rgba(226,232,240,0.8)] flex flex-col h-full overflow-hidden",
          className
        )}
        {...props}
      />
    );
  }
);
CardRoot.displayName = "Card";

/**
 * CardHeader
 * Standard wrapper for titles, badges, and top-level icons.
 */
export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-6 pb-4", className)}
      {...props}
    />
  )
);
CardHeader.displayName = "CardHeader";

/**
 * CardTitle
 * Semantic heading for the card.
 */
export const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        "text-lg font-bold leading-none tracking-tight text-foreground",
        className
      )}
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle";

/**
 * CardContent
 * The main body of the card.
 */
export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0 flex-grow", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

/**
 * CardFooter
 * Optional bottom section, often separated by a border or used for actions.
 */
export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center p-6 pt-0 mt-auto", className)}
      {...props}
    />
  )
);
CardFooter.displayName = "CardFooter";

/**
 * CardMedia
 * Handles full-bleed images at the top of a card.
 */
export const CardMedia = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("relative w-full overflow-hidden rounded-t-[24px]", className)}
      {...props}
    />
  )
);
CardMedia.displayName = "CardMedia";

export const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Title: CardTitle,
  Content: CardContent,
  Footer: CardFooter,
  Media: CardMedia,
});

export default Card;
