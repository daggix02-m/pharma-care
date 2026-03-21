import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

/**
 * Shared hook: fetches pharmacies with caching.
 * Uses correct Convex query based on user's role:
 * - admin  → api.admin.queries.getPharmacies
 * - manager → api.manager.queries.getBranches
 */
export function usePharmacies() {
  const { pharmacyId, userId, userRole } = useAuth();

  const isAdmin = userRole === 'admin';

  const pharmacies = useQuery(isAdmin ? api.admin.queries.getPharmacies : api.manager.queries.getBranches);

  let normalizedPharmacies = [];
  if (pharmacies) {
    normalizedPharmacies = pharmacies.map(p => ({
      ...p,
      id: p.id ?? p.branch_id ?? p.branchId,
      pharmacy_name: p.pharmacy_name ?? p.branch_name ?? p.branchName ?? p.name ?? 'Unnamed Pharmacy',
      branch_name: p.branch_name ?? p.branchName ?? p.name,
    }));
  }

  const loading = pharmacies === undefined;

  const filteredPharmacies = isAdmin 
    ? normalizedPharmacies 
    : filterPharmaciesByManager(normalizedPharmacies, pharmacyId, userId);

  return { pharmacies: filteredPharmacies, loading };
}

function filterPharmaciesByManager(pharmacies, pharmacyId, userId) {
  if (!pharmacies.length) return pharmacies;

  if (pharmacyId) {
    const byPharmacy = pharmacies.filter(p => String(p.pharmacy_id) === String(pharmacyId));
    if (byPharmacy.length > 0) return byPharmacy;
  }

  if (userId) {
    const byManager = pharmacies.filter(p => String(p.manager_id) === String(userId));
    if (byManager.length > 0) return byManager;
  }

  return [];
}
