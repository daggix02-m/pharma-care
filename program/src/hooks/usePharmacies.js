import { useQuery } from '@tanstack/react-query';
import { managerAPI, adminAPI } from '@/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

/**
 * Shared hook: fetches pharmacies with caching.
 * Uses the correct API endpoint based on the user's role:
 * - admin  → /admin/branches (mapped to pharmacies)
 * - manager → /manager/branches (mapped to pharmacies)
 */
export function usePharmacies() {
  const { pharmacyId, userId, userRole } = useAuth();

  const isAdmin = userRole === 'admin';

  const { data: pharmacies = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['pharmacies', pharmacyId, userId, userRole],
    queryFn: async () => {
      const response = isAdmin
        ? await adminAPI.getPharmacies()
        : await managerAPI.getAllBranches();
      const data = response?.data || response?.branches || response || [];
      const allPharmacies = Array.isArray(data) ? data : [];

      const normalized = allPharmacies.map(p => ({
        ...p,
        id: p.id ?? p.branch_id ?? p.branchId,
        pharmacy_name: p.pharmacy_name ?? p.branch_name ?? p.branchName ?? p.name ?? 'Unnamed Pharmacy',
        branch_name: p.branch_name ?? p.branchName ?? p.name,
      }));

      // Admins see all pharmacies; managers see only their own
      if (isAdmin) return normalized;
      return filterPharmaciesByManager(normalized, pharmacyId, userId);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 2,
    onError: (error) => {
      console.error('Error fetching pharmacies:', error);
      toast.error('Failed to load pharmacies');
    },
  });

  return { pharmacies, loading, refetch };
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
