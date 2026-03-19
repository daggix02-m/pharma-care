import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

const STORAGE_KEY = 'pharmacare_selected_branch';

/**
 * BranchTabs - Branch tab selector component
 * Persists selected branch in sessionStorage across page navigation.
 * Allows quick switching between branches for inventory management.
 *
 * Props:
 *   branches    - Array of branch objects [{ id|_id, name, address, status, ... }]
 *   activeTab   - Currently selected branch ID (string or null)
 *   onTabChange  - Callback when branch changes: (branchId) => void
 *   loading     - Boolean, show skeleton while branches load
 */
export function BranchTabs({ branches = [], activeTab, onTabChange, loading = false }) {
  const handleTabChange = (branchId) => {
    if (branchId === 'all') {
      sessionStorage.setItem(STORAGE_KEY, 'all');
    } else {
      sessionStorage.setItem(STORAGE_KEY, String(branchId));
    }
    onTabChange(branchId === 'all' ? 'all' : branchId);
  };

  if (loading) {
    return <Skeleton className="h-12 w-full" />;
  }

  if (!branches.length) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
        <Building2 className="h-4 w-4" />
        No branches available
      </div>
    );
  }

  const activeBranches = branches.filter(b => b.status === 'active');

  return (
    <Tabs value={String(activeTab)} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 h-auto p-1">
        <TabsTrigger 
          value="all" 
          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          <span className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span>All Branches</span>
          </span>
          <Badge variant="secondary" className="ml-auto">
            {allBranchesTotalMedicines(branches)}
          </Badge>
        </TabsTrigger>
        
        {activeBranches.map((branch) => {
          const branchMedicines = getBranchMedicineCount(branches, branch._id);
          return (
            <TabsTrigger 
              key={branch._id} 
              value={String(branch._id)}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <span className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span className="truncate">{branch.name}</span>
              </span>
              <Badge variant="secondary" className="ml-auto">
                {branchMedicines}
              </Badge>
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}

// Helper function to count medicines per branch
function getBranchMedicineCount(branches, branchId) {
  const branch = branches.find(b => b._id === branchId);
  return branch?.medicineCount || 0;
}

// Helper function to get total medicines across all branches
function allBranchesTotalMedicines(branches) {
  return branches.reduce((total, branch) => total + (branch.medicineCount || 0), 0);
}

export default BranchTabs;