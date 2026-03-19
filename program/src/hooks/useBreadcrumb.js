import { useLocation } from 'react-router-dom';

/**
 * Static route name mapping
 * Extend this as your app grows
 */
const routeNameMap = {
  dashboard: 'Dashboard',
  admin: 'Admin',
  overview: 'Overview',
  users: 'Users',
  managers: 'Managers',
  pharmacies: 'Pharmacies',
  settings: 'Settings',
};

/**
 * Routes where breadcrumbs should NOT be shown
 */
const hiddenRoutes = ['/auth/login', '/auth/signup', '/auth/forgot-password'];

/**
 * Detect dynamic route segments (IDs, UUIDs)
 */
const isDynamicSegment = (segment) =>
  /^\d+$/.test(segment) || // numeric IDs
  /^[0-9a-fA-F-]{36}$/.test(segment); // UUIDs

/**
 * Format unknown route segments nicely
 * e.g. "sale-creation" → "Sale Creation"
 */
const formatSegment = (segment) =>
  segment
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

/**
 * useBreadcrumbs hook
 * @param {Object} overrides - Optional custom breadcrumb labels by full path
 * @returns {Array<{ name: string, href: string }>}
 */
export const useBreadcrumbs = (overrides = {}) => {
  const { pathname } = useLocation();

  // Hide breadcrumbs for specific routes
  if (hiddenRoutes.includes(pathname)) {
    return [];
  }

  const segments = pathname.split('/').filter(Boolean);

  return segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/');

    let name;

    if (overrides[href]) {
      name = overrides[href];
    } else if (routeNameMap[segment]) {
      name = routeNameMap[segment];
    } else if (isDynamicSegment(segment)) {
      name = 'Details';
    } else {
      name = formatSegment(segment);
    }

    return { name, href };
  });
};
