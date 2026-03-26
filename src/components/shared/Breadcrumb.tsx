import { Link } from 'react-router-dom';
import { useBreadcrumbs } from '@/hooks/useBreadcrumb';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import * as React from 'react';

interface BreadcrumbProps {
  className?: string;
  showHome?: boolean;
}

// Memoized breadcrumb item
const BreadcrumbItem = React.memo(function BreadcrumbItem({
  href,
  name,
  isLast,
  isFirst,
}: {
  href: string;
  name: string;
  isLast: boolean;
  isFirst: boolean;
}) {
  if (isLast) {
    return (
      <span className='text-sm font-semibold text-foreground tracking-tight' aria-current='page'>
        {name}
      </span>
    );
  }

  return (
    <>
      {isFirst ? (
        <Link
          to={href}
          className={cn(
            'inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground',
            'hover:text-foreground transition-colors duration-200'
          )}
        >
          <Home className='w-3.5 h-3.5' />
          <span className='sr-only'>{name}</span>
        </Link>
      ) : (
        <Link
          to={href}
          className={cn(
            'text-sm font-medium text-muted-foreground',
            'hover:text-foreground transition-colors duration-200'
          )}
        >
          {name}
        </Link>
      )}
    </>
  );
});

// Memoized separator
const BreadcrumbSeparator = React.memo(function BreadcrumbSeparator() {
  return <ChevronRight className='w-3.5 h-3.5 text-muted-foreground/50 mx-1' />;
});

export const Breadcrumb = React.memo(function Breadcrumb({
  className,
  showHome = true,
}: BreadcrumbProps) {
  const paths = useBreadcrumbs();

  // Don't render if there are no breadcrumbs
  if (!paths.length) return null;

  // Add Dashboard as first item if not present and showHome is true
  const breadcrumbPaths = React.useMemo(() => {
    if (showHome && paths.length > 0 && paths[0].name !== 'Dashboard') {
      return [{ name: 'Dashboard', href: '/dashboard' }, ...paths];
    }
    return paths;
  }, [paths, showHome]);

  return (
    <nav className={cn('flex items-center', className)} aria-label='Breadcrumb'>
      <ol className='flex flex-wrap items-center gap-1'>
        {breadcrumbPaths.map((path, index) => {
          const isLast = index === breadcrumbPaths.length - 1;
          const isFirst = index === 0;

          return (
            <li key={`${path.href}-${index}`} className='flex items-center'>
              <BreadcrumbItem
                href={path.href}
                name={path.name}
                isLast={isLast}
                isFirst={isFirst && showHome}
              />
              {!isLast && <BreadcrumbSeparator />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
});

// Default export for compatibility
export default Breadcrumb;
