import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useAuth } from '@/contexts/AuthContext';
import * as React from 'react';

// Types
interface Pharmacy {
  id: string;
  pharmacy_name: string;
  branch_name?: string;
  pharmacy_id?: string;
  manager_id?: string;
  branchId?: string;
  branchName?: string;
  name?: string;
  [key: string]: unknown;
}

interface UsePharmaciesReturn {
  pharmacies: Pharmacy[];
  loading: boolean;
}

/**
 * Normalize pharmacy data from different API responses
 * Memoized to prevent unnecessary recalculations
 */
const normalizePharmacies = (pharmacies: unknown[]): Pharmacy[] => {
  if (!pharmacies?.length) return [];

  return pharmacies.map((p: any) => ({
    ...p,
    id: p.id ?? p.branch_id ?? p.branchId ?? crypto.randomUUID(),
    pharmacy_name: p.pharmacy_name ?? p.branch_name ?? p.branchName ?? p.name ?? 'Unnamed Pharmacy',
    branch_name: p.branch_name ?? p.branchName ?? p.name,
  }));
};

/**
 * Filter pharmacies by manager - extracted for testability and performance
 */
const filterPharmaciesByManager = (
  pharmacies: Pharmacy[],
  pharmacyId: string | undefined,
  userId: string | undefined
): Pharmacy[] => {
  if (!pharmacies.length) return pharmacies;

  // Filter by pharmacy ID if available
  if (pharmacyId) {
    const byPharmacy = pharmacies.filter((p) => String(p.pharmacy_id) === String(pharmacyId));
    if (byPharmacy.length > 0) return byPharmacy;
  }

  // Filter by manager ID if available
  if (userId) {
    const byManager = pharmacies.filter((p) => String(p.manager_id) === String(userId));
    if (byManager.length > 0) return byManager;
  }

  return [];
};

/**
 * Shared hook: fetches pharmacies with caching and optimizations.
 *
 * Uses correct Convex query based on user's role:
 * - admin  → api.admin.queries.getPharmacies
 * - manager → api.manager.queries.getBranches
 *
 * Performance optimizations:
 * - Memoized data normalization to prevent unnecessary recalculations
 * - Memoized filtering based on dependencies
 * - Early returns for loading states
 */
export function usePharmacies(): UsePharmaciesReturn {
  const { pharmacyId, userId, userRole, sessionToken } = useAuth();

  const isAdmin = userRole === 'admin';

  // Select correct query based on role with session token
  const pharmaciesData = useQuery(
    isAdmin ? api.admin.queries.getPharmacies : api.manager.queries.getBranches,
    sessionToken ? { sessionToken } : 'skip'
  );

  // Memoize normalized pharmacies to prevent recalculation on every render
  const normalizedPharmacies = React.useMemo(() => {
    return normalizePharmacies(pharmaciesData ?? []);
  }, [pharmaciesData]);

  // Memoize filtered results
  const filteredPharmacies = React.useMemo(() => {
    if (isAdmin) {
      return normalizedPharmacies;
    }
    return filterPharmaciesByManager(normalizedPharmacies, pharmacyId, userId);
  }, [isAdmin, normalizedPharmacies, pharmacyId, userId]);

  // Loading state - Convex returns undefined while loading
  const loading = pharmaciesData === undefined;

  // Return stable reference using memo
  return React.useMemo(
    () => ({
      pharmacies: filteredPharmacies,
      loading,
    }),
    [filteredPharmacies, loading]
  );
}

// Export helper functions for testing
export { normalizePharmacies, filterPharmaciesByManager };
