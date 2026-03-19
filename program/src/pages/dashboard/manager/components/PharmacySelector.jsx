import React, { useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const STORAGE_KEY = 'pharmacare_selected_pharmacy';

/**
 * Safely extract pharmacy ID regardless of API field name.
 * The API may return `id`, `branch_id`, or `pharmacyId` depending on the endpoint.
 */
function getPharmacyId(pharmacy) {
  return String(pharmacy._id ?? pharmacy.id ?? pharmacy.branch_id ?? pharmacy.pharmacyId ?? '');
}

/**
 * PharmacySelector - Pharmacy selector dropdown component
 * Persists selected pharmacy in sessionStorage across page navigation.
 * Always requires a specific pharmacy to be selected.
 *
 * Props:
 *   pharmacies    - Array of pharmacy objects [{ id|branch_id, branch_name, location, ... }]
 *   selectedId  - Currently selected pharmacy ID (string or number)
 *   onChange     - Callback when pharmacy changes: (pharmacyId) => void
 *   loading      - Boolean, show skeleton while pharmacies load
 */
export function PharmacySelector({ pharmacies = [], selectedId, onChange, loading = false }) {
  // On mount, restore persisted pharmacy or default to first
  useEffect(() => {
    if (!pharmacies.length) return;

    const saved = sessionStorage.getItem(STORAGE_KEY);
    const ids = pharmacies.map((b) => getPharmacyId(b));

    // Restore saved selection if it's still valid
    if (saved && ids.includes(saved) && String(selectedId) !== saved) {
      onChange(saved);
    } else if (!selectedId || !ids.includes(String(selectedId))) {
      // Default to first pharmacy if nothing selected or invalid
      onChange(getPharmacyId(pharmacies[0]));
    }
  }, [pharmacies]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (pharmacyId) => {
    sessionStorage.setItem(STORAGE_KEY, String(pharmacyId));
    onChange(String(pharmacyId));
  };

  if (loading) {
    return <Skeleton className="h-10 w-full sm:w-[300px]" />;
  }

  if (!pharmacies.length) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
        <Building2 className="h-4 w-4" />
        No pharmacies available
      </div>
    );
  }

  const currentValue = String(selectedId);

  return (
    <Select value={currentValue} onValueChange={handleChange}>
      <SelectTrigger className="w-full sm:w-[300px]">
        <div className="flex items-center gap-2 overflow-hidden">
          <Building2 className="h-4 w-4 shrink-0" />
          <SelectValue placeholder="Select a pharmacy" />
        </div>
      </SelectTrigger>
      <SelectContent>
        {pharmacies.map((pharmacy) => {
          const id = getPharmacyId(pharmacy);
          const name = pharmacy.branch_name || pharmacy.name;
          const location = pharmacy.location;
          return (
            <SelectItem key={id} value={id}>
              {location ? `${name} — ${location}` : name}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
