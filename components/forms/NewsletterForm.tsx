import React from 'react';
import { Input, Button, Typography } from '@/components/ui';

export interface NewsletterFormProps {
  className?: string;
}

/**
 * Reusable Newsletter Form structure.
 */
export function NewsletterForm({ className = '' }: NewsletterFormProps) {
  return (
    <form className={`flex flex-col space-y-3 ${className}`}>
      <Typography variant="h4" className="text-foreground">Subscribe to our newsletter</Typography>
      <Typography variant="p" className="text-sm text-muted-foreground m-0">Get the latest health tips and news directly to your inbox.</Typography>
      <div className="flex w-full max-w-sm items-center space-x-2 mt-4">
        <Input type="email" name="email" placeholder="Email address" required className="flex-1" />
        <Button type="submit">Subscribe</Button>
      </div>
    </form>
  );
}
