import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cashierAPI } from '@/api';
import { toast } from 'sonner';
import {
  RotateCcw,
  Search,
  Package,
  Trash2,
  Loader2,
  ShoppingCart,
  ArrowRightLeft,
  Calendar,
} from 'lucide-react';

export function Returns() {
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState(null);
  const [selectedItems, setSelectedItems] = useState({});
  const [returnReason, setReturnReason] = useState('');
  const [returnCondition, setReturnCondition] = useState('good');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchReturnableSales();
  }, []);

  const fetchReturnableSales = async () => {
    try {
      setLoading(true);
      const response = await cashierService.getReturnableSales();

      if (response.success) {
        const salesList = response.data || response.sales || [];
        setSales(Array.isArray(salesList) ? salesList : []);
      } else {
        toast.error(response.message || 'Failed to fetch sales for return');
        setSales([]);
      }
    } catch (error) {
      console.error('Error fetching returnable sales:', error);
      toast.error('Failed to fetch sales for return');
      setSales([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchReturnableSales();
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = sales.filter(
      (s) => s.sale_id?.toString().includes(query) || s.customer_name?.toLowerCase().includes(query)
    );
    setFilteredSales(filtered);
  };

  const handleSelectSale = async (sale) => {
    try {
      setLoading(true);
      const response = await cashierService.getReturnableItems(sale.sale_id);

      if (response.success) {
        const itemsList = response.data || response.items || [];
        setSelectedSale(sale);
        setSelectedItems(itemsList);
      } else {
        toast.error(response.message || 'Failed to fetch sale items');
      }
    } catch (error) {
      console.error('Error fetching sale items:', error);
      toast.error('Failed to fetch sale items');
    } finally {
      setLoading(false);
    }
  };

  const handleItemSelect = (itemId) => {
    setSelectedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    setSelectedItems((prev) => ({
      ...prev,
      [itemId]: Math.max(1, Math.min(newQuantity, prev[itemId]?.max_quantity || 1)),
    }));
  };

  const handleProcessReturn = async (e) => {
    e.preventDefault();

    const selectedItemsList = Object.entries(selectedItems)
      .filter(([_, quantity]) => quantity)
      .map(([itemId, quantity]) => ({ medicine_id: itemId, quantity_returned: quantity }));

    if (selectedItemsList.length === 0) {
      toast.error('Please select at least one item to return');
      return;
    }

    if (!returnReason.trim()) {
      toast.error('Please provide a return reason');
      return;
    }

    try {
      setProcessing(true);

      const returnData = {
        sale_id: selectedSale.sale_id,
        items: selectedItemsList,
        return_reason: returnReason,
        return_condition: returnCondition,
      };

      const response = await cashierService.processRefund(returnData);

      if (response.success) {
        toast.success('Return processed successfully!');
        setSelectedSale(null);
        setSelectedItems({});
        setReturnReason('');
        setReturnCondition('good');
        fetchReturnableSales();
      } else {
        toast.error(response.message || 'Failed to process return');
      }
    } catch (error) {
      console.error('Error processing return:', error);
      toast.error('Failed to process return');
    } finally {
      setProcessing(false);
    }
  };

  const getConditionBadge = (condition) => {
    const badges = {
      good: { label: 'Good', color: 'bg-green-100 text-green-800' },
      damaged: { label: 'Damaged', color: 'bg-red-100 text-red-800' },
      opened: { label: 'Opened', color: 'bg-yellow-100 text-yellow-800' },
      expired: { label: 'Expired', color: 'bg-orange-100 text-orange-800' },
    };
    const badge = badges[condition] || { label: 'Unknown', color: 'bg-gray-100 text-gray-800' };

    return <Badge className={badge.color}>{badge.label}</Badge>;
  };

  if (loading && !selectedSale) {
    return (
      <div className='flex justify-center items-center h-64'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
      </div>
    );
  }

  return (
    <div className='space-y-6 p-4 md:p-8'>
      <div className='space-y-2'>
        <h2 className='text-3xl font-bold tracking-tight'>Returns</h2>
        <p className='text-muted-foreground'>Process product returns and issue refunds</p>
      </div>

      <Card>
        <CardContent className='pt-6'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4' />
            <Input
              placeholder='Search sales by ID or customer name...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className='pl-10'
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Sales for Return
            <span className='text-sm font-normal text-muted-foreground ml-2'>
              ({filteredSales.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredSales.length === 0 ? (
            <div className='text-center py-12'>
              <ShoppingCart className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
              <p className='text-muted-foreground'>No sales found</p>
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead>
                  <tr className='border-b'>
                    <th className='text-left py-3 px-4 text-sm font-medium text-muted-foreground'>
                      Sale ID
                    </th>
                    <th className='text-left py-3 px-4 text-sm font-medium text-muted-foreground'>
                      Customer
                    </th>
                    <th className='text-left py-3 px-4 text-sm font-medium text-muted-foreground'>
                      Date
                    </th>
                    <th className='text-left py-3 px-4 text-sm font-medium text-muted-foreground'>
                      Items
                    </th>
                    <th className='text-left py-3 px-4 text-sm font-medium text-muted-foreground'>
                      Total
                    </th>
                    <th className='text-right py-3 px-4 text-sm font-medium text-muted-foreground'>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.map((sale) => (
                    <tr key={sale.sale_id} className='border-b hover:bg-muted/50'>
                      <td className='py-3 px-4 font-medium'>#{sale.sale_id}</td>
                      <td className='py-3 px-4 text-sm'>{sale.customer_name || 'Walk-in'}</td>
                      <td className='py-3 px-4 text-sm'>
                        <div className='flex items-center gap-2'>
                          <Calendar className='h-4 w-4 text-muted-foreground' />
                          {sale.sale_date ? new Date(sale.sale_date).toLocaleString() : 'N/A'}
                        </div>
                      </td>
                      <td className='py-3 px-4 text-sm'>{sale.item_count || 0} items</td>
                      <td className='py-3 px-4'>
                        <div className='flex items-center gap-2'>
                          <Package className='h-4 w-4 text-muted-foreground' />
                          <span className='font-medium'>ETB {sale.total_amount?.toFixed(2)}</span>
                        </div>
                      </td>
                      <td className='py-3 px-4 text-right'>
                        <Button variant='outline' size='sm' onClick={() => handleSelectSale(sale)}>
                          <RotateCcw className='h-4 w-4' />
                          Process Return
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedSale && (
        <Card className='mt-6'>
          <CardHeader>
            <CardTitle>
              <ArrowRightLeft className='h-5 w-5 mr-2' />
              Process Return - Sale #{selectedSale.sale_id}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProcessReturn}>
              <div className='space-y-4'>
                <div>
                  <p className='text-sm text-muted-foreground mb-2'>Sale Information</p>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <p className='text-sm text-muted-foreground'>Customer</p>
                      <p className='font-medium'>{selectedSale.customer_name || 'Walk-in'}</p>
                    </div>
                    <div>
                      <p className='text-sm text-muted-foreground'>Sale Date</p>
                      <p className='font-medium'>
                        {selectedSale.sale_date
                          ? new Date(selectedSale.sale_date).toLocaleString()
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className='text-sm text-muted-foreground'>Total Amount</p>
                      <p className='font-medium'>ETB {selectedSale.total_amount?.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className='text-sm text-muted-foreground mb-2'>Select Items to Return</p>
                  <div className='space-y-2 max-h-64 overflow-y-auto'>
                    {selectedSale.items && selectedSale.items.length > 0 ? (
                      selectedSale.items.map((item) => (
                        <div
                          key={item.medicine_id}
                          className='flex items-center justify-between p-3 border rounded-lg'
                        >
                          <div className='flex-1'>
                            <p className='font-medium'>{item.medicine_name}</p>
                            <p className='text-sm text-muted-foreground'>
                              Available: {item.max_quantity} | Price: ETB{' '}
                              {item.unit_price?.toFixed(2)}
                            </p>
                          </div>
                          <div className='flex items-center gap-3'>
                            <input
                              type='checkbox'
                              checked={selectedItems[item.medicine_id] || false}
                              onChange={() => handleItemSelect(item.medicine_id)}
                              className='h-4 w-4'
                            />
                            <input
                              type='number'
                              min='1'
                              max={item.max_quantity || 1}
                              value={selectedItems[item.medicine_id]?.quantity || 1}
                              onChange={(e) =>
                                handleQuantityChange(item.medicine_id, parseInt(e.target.value))
                              }
                              className='w-20 px-2 py-1 border rounded'
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className='text-center text-muted-foreground'>No items available</p>
                    )}
                  </div>
                </div>

                <div className='space-y-3'>
                  <div>
                    <label className='block text-sm font-medium mb-2'>Return Reason</label>
                    <select
                      value={returnReason}
                      onChange={(e) => setReturnReason(e.target.value)}
                      className='w-full px-3 py-2 border border-input bg-background rounded-md text-sm'
                      required
                    >
                      <option value=''>Select a reason...</option>
                      <option value='wrong_product'>Wrong product</option>
                      <option value='damaged'>Damaged</option>
                      <option value='expired'>Expired</option>
                      <option value='customer_request'>Customer request</option>
                      <option value='other'>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className='block text-sm font-medium mb-2'>Condition</label>
                    <div className='flex gap-4'>
                      {['good', 'damaged', 'opened', 'expired'].map((condition) => (
                        <button
                          key={condition}
                          type='button'
                          onClick={() => setReturnCondition(condition)}
                          className={`px-4 py-2 rounded-md border-2 transition-colors ${
                            returnCondition === condition
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-input bg-background hover:bg-muted'
                          }`}
                        >
                          {getConditionBadge(condition)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className='flex gap-2 pt-4'>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => {
                      setSelectedSale(null);
                      setSelectedItems({});
                      setReturnReason('');
                      setReturnCondition('good');
                    }}
                    disabled={processing}
                  >
                    Cancel
                  </Button>
                  <Button
                    type='submit'
                    disabled={
                      processing || Object.values(selectedItems).filter((v) => v).length === 0
                    }
                  >
                    {processing ? (
                      <Loader2 className='h-4 w-4 animate-spin mr-2' />
                    ) : (
                      <Trash2 className='h-4 w-4 mr-2' />
                    )}
                    Process Return
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
