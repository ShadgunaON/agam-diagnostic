import React from 'react';
import { Card } from '@/components/ui';
import { Avatar } from '@/components/ui';

export interface TeamMemberCardProps {
  name: string;
  role: string;
  bio?: string;
  imageUrl?: string;
  socialLinks?: { icon: React.ReactNode; url: string; label: string }[];
  className?: string;
}

/**
 * Reusable composite component for displaying a team member profile.
 */
export function TeamMemberCard({ name, role, bio, imageUrl, socialLinks, className = '' }: TeamMemberCardProps) {
  return (
    <Card className={`flex flex-col items-center text-center p-6 ${className}`}>
      <Card.Header className="items-center p-0 mb-4">
        <Avatar src={imageUrl} alt={name} fallback={name.charAt(0)} className="w-24 h-24 shadow-sm" />
      </Card.Header>
      <Card.Content className="p-0 flex flex-col items-center flex-grow w-full">
        <Card.Title className="mb-1 text-xl">{name}</Card.Title>
        <p className="text-primary font-medium text-sm mt-0 mb-3">{role}</p>
        {bio && <p className="text-muted-foreground text-sm mt-0 mb-4 leading-relaxed">{bio}</p>}
      </Card.Content>
      {socialLinks && socialLinks.length > 0 && (
        <Card.Footer className="p-0 mt-auto pt-4 border-t border-border/50 w-full justify-center gap-3">
          {socialLinks.map((link, idx) => (
            <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" aria-label={link.label} className="text-muted-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm">
              {link.icon}
            </a>
          ))}
        </Card.Footer>
      )}
    </Card>
  );
}
