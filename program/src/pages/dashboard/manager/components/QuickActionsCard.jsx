import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowRight } from 'lucide-react';

export const QuickActionsCard = ({
  title,
  icon: Icon,
  items = [],
  emptyMessage = 'No items to display',
  onItemClick,
  onViewAll,
  viewAllText = 'View All',
  badgeColor = 'default',
  iconColor = 'text-primary',
}) => {
  return (
    <Card className='shadow-sm'>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <CardTitle className={`flex items-center gap-2 text-lg font-semibold ${iconColor}`}>
            {Icon && <Icon className='h-5 w-5' />}
            {title}
          </CardTitle>
          {items.length > 0 && (
            <Badge variant='outline' className={badgeColor}>
              {items.length} {items.length === 1 ? 'Item' : 'Items'}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className='text-center py-8 text-muted-foreground'>
            <p className='text-sm'>{emptyMessage}</p>
          </div>
        ) : (
          <>
            <ScrollArea className='h-[200px] pr-4'>
              <div className='space-y-3'>
                {items.map((item, index) => (
                  <div
                    key={item.id || index}
                    className='flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0'
                  >
                    <div className='space-y-1 flex-1'>
                      <p className='text-sm font-medium leading-none'>{item.title}</p>
                      <p className='text-xs text-muted-foreground'>{item.subtitle}</p>
                    </div>
                    <div className='flex items-center gap-2'>
                      {item.badge && (
                        <Badge variant={item.badgeVariant || 'secondary'} className='text-xs'>
                          {item.badge}
                        </Badge>
                      )}
                      {onItemClick && (
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-8 w-8 text-muted-foreground hover:text-primary'
                          onClick={() => onItemClick(item)}
                        >
                          <ArrowRight className='h-4 w-4' />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            {onViewAll && (
              <div className='mt-4 pt-4 border-t border-border'>
                <Button variant='outline' className='w-full' onClick={onViewAll}>
                  {viewAllText}
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
