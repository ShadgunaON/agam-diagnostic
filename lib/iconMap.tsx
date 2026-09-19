/**
 * CMS Icon Resolver
 * Maps Lucide icon name strings (stored in DynamoDB) to actual React components.
 * Used wherever CMS content passes icon: "Award" instead of <Award /> React nodes.
 */
import React from 'react';
import {
  Award,
  MapPin,
  Clock,
  TestTube2,
  Heart,
  Users,
  Shield,
  Star,
  CheckCircle,
  Phone,
  Calendar,
  FileText,
  Activity,
  Microscope,
  Home,
  Beaker,
  Dna,
  Stethoscope,
  ThumbsUp,
  Zap,
  Globe,
  Mail,
  type LucideIcon,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  Award,
  MapPin,
  Clock,
  TestTube: TestTube2,
  TestTube2,
  Heart,
  Users,
  Shield,
  Star,
  CheckCircle,
  Phone,
  Calendar,
  FileText,
  Activity,
  Microscope,
  Home,
  Beaker,
  Dna,
  Stethoscope,
  ThumbsUp,
  Zap,
  Globe,
  Mail,
};

/**
 * Resolves a CMS icon value to a React node.
 * - If already a ReactNode (static data), returns as-is.
 * - If a string, looks up the Lucide icon and renders it.
 * - Falls back to a neutral circle SVG if name is unknown.
 */
export function resolveIcon(
  icon: React.ReactNode | string | undefined,
  size = 24
): React.ReactNode {
  if (!icon) return null;
  if (typeof icon !== 'string') return icon as React.ReactNode;

  const Icon = ICON_MAP[icon];
  if (Icon) {
    return React.createElement(Icon, { size, strokeWidth: 1.75 });
  }

  // Fallback: neutral circle
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      width={size}
      height={size}
    >
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}
