import { BookingStatus } from '../../data/bookings';
import { BadgeStatus } from '../../components/admin/feedback/StatusBadge';

/**
 * Maps a BookingStatus to the corresponding StatusBadge variant.
 * Used by BookingsTable, BookingDetailsDrawer, and any future booking status display.
 */
export function getStatusBadgeType(status: BookingStatus): BadgeStatus {
  switch (status) {
    case 'Completed': return 'success';
    case 'Confirmed': return 'info';
    case 'Assigned': return 'info';
    case 'Sample Collected': return 'warning';
    case 'Processing': return 'warning';
    case 'Pending': return 'neutral';
    case 'Cancelled': return 'danger';
    default: return 'neutral';
  }
}
