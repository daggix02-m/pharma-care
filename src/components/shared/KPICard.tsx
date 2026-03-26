import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface KPICardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  iconColor?: string;
  valueColor?: string;
  trend?: string;
  loading?: boolean;
}

export const KPICard = ({
  title,
  value,
  icon: Icon,
  iconColor,
  valueColor,
  trend,
  loading,
}: KPICardProps) => {
  if (loading) {
    return (
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <div className='h-4 w-24 bg-muted animate-pulse rounded' />
          <div className='h-4 w-4 bg-muted animate-pulse rounded' />
        </CardHeader>
        <CardContent>
          <div className='h-8 w-12 bg-muted animate-pulse rounded' />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-sm font-medium'>{title}</CardTitle>
        {Icon && (
          <Icon className={`h-4 w-4 ${iconColor || 'text-muted-foreground'}`} aria-hidden='true' />
        )}
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${valueColor || ''}`}>{value}</div>
        {trend && <p className='text-xs text-muted-foreground mt-1'>{trend}</p>}
      </CardContent>
    </Card>
  );
};
