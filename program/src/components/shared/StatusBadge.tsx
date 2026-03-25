import { Badge } from '@/components/ui/badge';
import { STATUS_COLORS } from '@/constants';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const normalizedStatus = status?.toLowerCase();
  const colors = STATUS_COLORS[normalizedStatus] || {};

  const displayStatus = normalizedStatus
    ? normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1)
    : 'Unknown';

  if (!STATUS_COLORS[normalizedStatus]) {
    return <Badge variant='outline'>{displayStatus}</Badge>;
  }

  return (
    <Badge
      className={`${colors.bg} ${colors.text} ${colors.border}`}
      aria-label={`Status: ${displayStatus}`}
    >
      {displayStatus}
    </Badge>
  );
};
