import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Pagination, usePagination } from '@/components/ui/pagination';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import {
  Pill,
  Search,
  Filter,
  Eye,
  AlertTriangle,
  Clock,
  Loader2,
  Package,
  Calendar,
  DollarSign,
} from 'lucide-react';

export function Medicines() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedMedicineId, setSelectedMedicineId] = useState(null);

  const medicines = useQuery(api.pharmacist.queries.getMedicines) || [];
  const loading = medicines === undefined;

  const categories = useMemo(() => {
    return [...new Set(medicines.map((m) => m.category).filter(Boolean))];
  }, [medicines]);

  // Pagination state
  const { currentPage, itemsPerPage, setCurrentPage, setItemsPerPage, paginate } = usePagination({
    initialPage: 1,
    initialItemsPerPage: 10,
  });

  const filteredMedicines = useMemo(() => {
    let filtered = [...medicines];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.name?.toLowerCase().includes(query) ||
          m.barcode?.toLowerCase().includes(query) ||
          m.manufacturer?.toLowerCase().includes(query)
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((m) => m.category === selectedCategory);
    }

    return filtered;
  }, [medicines, searchQuery, selectedCategory]);

  const selectedMedicine = useMemo(() => {
      return medicines.find(m => m._id === selectedMedicineId);
  }, [medicines, selectedMedicineId]);

  const getStockStatus = (medicine) => {
    if (medicine.stock <= 10) {
      return (
        <Badge className='bg-red-100 text-red-800 border-red-300 rounded-lg py-1 px-3'>
          <AlertTriangle className='w-3 h-3 mr-1' />
          Low Stock
        </Badge>
      );
    }
    
    if (medicine.expiryDate) {
        const expiryDate = new Date(medicine.expiryDate);
        const today = new Date();
        const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

        if (daysUntilExpiry <= 30) {
        return (
            <Badge className='bg-orange-100 text-orange-800 border-orange-300 rounded-lg py-1 px-3'>
            <Clock className='w-3 h-3 mr-1' />
            Expiring Soon
            </Badge>
        );
        }
    }

    return <Badge className='bg-green-100 text-green-800 border-green-300 rounded-lg py-1 px-3'>In Stock</Badge>;
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
      </div>
    );
  }

  return (
    <div className='space-y-6 p-4 md:p-8 animate-fade-in'>
      <div className='space-y-2'>
        <h2 className='text-3xl font-bold tracking-tight'>Medicine Inventory</h2>
        <p className='text-muted-foreground'>Real-time inventory management for your branch.</p>
      </div>

      {/* Search and Filter Bar */}
      <Card className="rounded-[2rem] shadow-sm border-slate-100 overflow-hidden">
        <CardContent className='pt-6'>
          <div className='flex flex-col md:flex-row gap-4'>
            <div className='flex-1 relative'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4' />
              <Input
                placeholder='Search by name, barcode, or manufacturer...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='pl-10 h-11 rounded-xl border-slate-200 focus:ring-indigo-500'
              />
            </div>

            <div className='md:w-64'>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className='w-full h-11 px-3 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E")] bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] bg-no-repeat'
              >
                <option value=''>All Categories</option>
                {categories.map((category, index) => (
                  <option key={index} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medicines Table */}
      <Card className="rounded-[2.5rem] shadow-sm border-slate-100 overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Inventory List</span>
            <span className='text-[10px] font-black uppercase tracking-widest text-slate-400'>
              {filteredMedicines.length} Records Detected
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredMedicines.length === 0 ? (
            <div className='text-center py-20'>
              <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Pill className='h-8 w-8 text-slate-300' />
              </div>
              <p className='text-slate-500 font-bold'>No items found matching your criteria</p>
            </div>
          ) : (
            <>
              <div className='overflow-x-auto'>
                <table className='w-full text-left border-collapse'>
                  <thead>
                    <tr className='bg-slate-50/50'>
                      <th className='py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400'>Medicine</th>
                      <th className='py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400'>Category</th>
                      <th className='py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400'>Details</th>
                      <th className='py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400'>Stock</th>
                      <th className='py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400'>Unit Price</th>
                      <th className='py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400'>Status</th>
                      <th className='py-4 px-6 text-right text-[10px] font-black uppercase tracking-widest text-slate-400'>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {paginate(filteredMedicines).map((medicine) => (
                      <tr key={medicine._id} className='hover:bg-slate-50/80 transition-colors group'>
                        <td className='py-4 px-6'>
                          <div className='flex items-center gap-4'>
                            <div className='h-10 w-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-lg group-hover:scale-110 transition-transform'>
                              {medicine.name.charAt(0)}
                            </div>
                            <div className="flex flex-col">
                                <span className='font-black text-slate-900'>{medicine.name}</span>
                                <span className='text-[10px] font-bold text-slate-400 uppercase tracking-tight'>{medicine.manufacturer || 'N/A'}</span>
                            </div>
                          </div>
                        </td>
                        <td className='py-4 px-6'>
                            <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200 border-none px-3 py-1 rounded-lg font-bold text-[10px] uppercase">
                                {medicine.category}
                            </Badge>
                        </td>
                        <td className='py-4 px-6'>
                            <div className="flex flex-col text-[10px] font-bold text-slate-500 space-y-0.5">
                                <span>TYPE: {medicine.type || 'N/A'}</span>
                                <span>BARCODE: {medicine.barcode || 'N/A'}</span>
                            </div>
                        </td>
                        <td className='py-4 px-6'>
                          <div className='flex items-center gap-2'>
                            <span className={`text-sm font-black ${medicine.stock <= 10 ? 'text-red-600' : 'text-slate-900'}`}>{medicine.stock}</span>
                            {medicine.stock <= 10 && <AlertTriangle className='h-3 w-3 text-red-500' />}
                          </div>
                        </td>
                        <td className='py-4 px-6'>
                          <span className='font-black text-slate-900 text-sm'>ETB {medicine.price.toFixed(2)}</span>
                        </td>
                        <td className='py-4 px-6'>{getStockStatus(medicine)}</td>
                        <td className='py-4 px-6 text-right'>
                          <Button
                            variant='ghost'
                            size='icon'
                            className="rounded-xl hover:bg-white hover:shadow-sm"
                            onClick={() => setSelectedMedicineId(medicine._id)}
                          >
                            <Eye className='h-4 w-4 text-slate-400 group-hover:text-indigo-600' />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className='p-6 border-t border-slate-50 bg-slate-50/20'>
                <Pagination
                  currentPage={currentPage}
                  totalItems={filteredMedicines.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                  onItemsPerPageChange={(newSize) => {
                    setItemsPerPage(newSize);
                    setCurrentPage(1);
                  }}
                  itemsPerPageOptions={[10, 25, 50]}
                  showPageSizeSelector={true}
                  showTotalItems={true}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Medicine Details Modal - Premium Implementation */}
      {selectedMedicine && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
            <Card className='w-full max-w-2xl rounded-[3rem] shadow-2xl border-none overflow-hidden animate-in zoom-in-95 duration-300'>
                <CardHeader className="bg-indigo-600 p-8 text-white relative">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute right-6 top-6 text-white/50 hover:text-white hover:bg-white/10 rounded-full"
                        onClick={() => setSelectedMedicineId(null)}
                    >
                        ✕
                    </Button>
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                            <Package className="w-10 h-10 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-3xl font-black">{selectedMedicine.name}</CardTitle>
                            <CardDescription className="text-white/70 font-bold uppercase tracking-widest text-xs mt-1">
                                Product Intelligence Overview
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-10 space-y-10">
                    <div className="grid grid-cols-2 gap-10">
                        <div className="space-y-6">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Classification</label>
                                <p className="font-bold text-slate-900">{selectedMedicine.category}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Manufacturer</label>
                                <p className="font-bold text-slate-900">{selectedMedicine.manufacturer || 'Information Pending'}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Form / Type</label>
                                <p className="font-bold text-slate-900">{selectedMedicine.type || 'Standard'}</p>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Inventory Status</label>
                                <div className="flex items-center gap-3">
                                    <span className="text-4xl font-black text-slate-900">{selectedMedicine.stock}</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase leading-none">Units<br/>Available</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pricing Data</label>
                                <p className="text-2xl font-black text-indigo-600">ETB {selectedMedicine.price.toFixed(2)}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Expiration Profile</label>
                                <p className="font-bold text-slate-900 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-slate-400" />
                                    {selectedMedicine.expiryDate ? new Date(selectedMedicine.expiryDate).toLocaleDateString() : 'No data available'}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="pt-6 border-t border-slate-100 flex gap-4">
                        <div className="flex-1 bg-slate-50 rounded-2xl p-4 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Unique Identifier</p>
                                <p className="font-mono text-xs font-bold text-slate-600 mt-1">{selectedMedicine.barcode || 'N/A'}</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                                <History className="w-5 h-5 text-slate-400" />
                            </div>
                        </div>
                        <Button className="h-full px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200" onClick={() => setSelectedMedicineId(null)}>
                            Dismiss
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
      )}
    </div>
  );
}
