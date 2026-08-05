import React from 'react';
import { Link, Card } from '@/components/ui';

export interface ContactCardProps {
  title: string;
  description: string;
  email?: string;
  phone?: string;
  address?: string;
  icon?: React.ReactNode;
  className?: string;
}

/**
 * Reusable composite component for displaying contact information blocks.
 */
export function ContactCard({ title, description, email, phone, address, icon, className = '' }: ContactCardProps) {
  return (
    <Card className={`flex flex-col ${className}`}>
      {icon && (
        <Card.Header className="pb-2">
          <div className="text-primary">{icon}</div>
        </Card.Header>
      )}
      <Card.Content className={icon ? "pt-0" : ""}>
        <Card.Title className="mb-2 text-xl">{title}</Card.Title>
        <p className="text-muted-foreground mt-0 mb-6">{description}</p>
      
      </Card.Content>
      <Card.Footer className="pt-0">
        <div className="space-y-3 w-full">
          {email && (
            <div className="flex items-center text-sm">
              <span className="font-semibold w-20 shrink-0">Email:</span>
              <Link href={`mailto:${email}`} className="truncate hover:text-primary transition-colors">{email}</Link>
            </div>
          )}
          {phone && (
            <div className="flex items-center text-sm">
              <span className="font-semibold w-20 shrink-0">Phone:</span>
              <Link href={`tel:${phone}`} className="hover:text-primary transition-colors">{phone}</Link>
            </div>
          )}
          {address && (
            <div className="flex items-start text-sm">
              <span className="font-semibold w-20 shrink-0">Address:</span>
              <span className="text-muted-foreground leading-relaxed">{address}</span>
            </div>
          )}
        </div>
      </Card.Footer>
    </Card>
  );
}
