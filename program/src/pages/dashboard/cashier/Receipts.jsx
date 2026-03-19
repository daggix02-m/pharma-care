import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cashierAPI } from '@/api';
import { toast } from 'sonner';
import {
  Receipt,
  Search,
  Printer,
  Eye,
  Loader2,
  DollarSign,
  Calendar,
  CreditCard,
} from 'lucide-react';

export function Receipts() {
  const [receipts, setReceipts] = useState([]);
  const [filteredReceipts, setFilteredReceipts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const response = await cashierService.getTransactions();

      if (response.success) {
        const receiptsList = response.data || response.transactions || [];
        setReceipts(Array.isArray(receiptsList) ? receiptsList : []);
      } else {
        toast.error(response.message || 'Failed to fetch receipts');
        setReceipts([]);
      }
    } catch (error) {
      console.error('Error fetching receipts:', error);
      toast.error('Failed to fetch receipts');
      setReceipts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchReceipts();
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = receipts.filter(
      (r) =>
        r.sale_id?.toString().includes(query) || r.receipt_number?.toLowerCase().includes(query)
    );
    setFilteredReceipts(filtered);
  };

  const handleViewDetails = (receipt) => {
    setSelectedReceipt(receipt);
  };

  const handlePrint = (receipt) => {
    toast.info(`Printing receipt for sale #${receipt.sale_id}...`);
  };

  const getPaymentMethodBadge = (paymentMethod) => {
    const methods = {
      cash: { label: 'Cash', icon: DollarSign, color: 'bg-green-100 text-green-800' },
      card: { label: 'Card', icon: CreditCard, color: 'bg-blue-100 text-blue-800' },
      mobile: { label: 'Mobile', icon: CreditCard, color: 'bg-purple-100 text-purple-800' },
      bank_transfer: {
        label: 'Bank Transfer',
        icon: CreditCard,
        color: 'bg-orange-100 text-orange-800',
      },
    };
    const method = methods[paymentMethod] || {
      label: 'Unknown',
      icon: CreditCard,
      color: 'bg-gray-100 text-gray-800',
    };
    const Icon = method.icon;

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${method.color}`}>
        <Icon className='h-3 w-3 mr-1' />
        {method.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
      </div>
    );
  }

  return (
    <div className='space-y-6 p-4 md:p-8'>
      <div className='space-y-2'>
        <h2 className='text-3xl font-bold tracking-tight'>Receipts</h2>
        <p className='text-muted-foreground'>View and print receipts for completed sales</p>
      </div>

      <Card>
        <CardContent className='pt-6'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4' />
            <Input
              placeholder='Search by sale ID or receipt number...'
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
            All Receipts
            <span className='text-sm font-normal text-muted-foreground ml-2'>
              ({filteredReceipts.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredReceipts.length === 0 ? (
            <div className='text-center py-12'>
              <Receipt className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
              <p className='text-muted-foreground'>No receipts found</p>
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead>
                  <tr className='border-b'>
                    <th className='text-left py-3 px-4 text-sm font-medium text-muted-foreground'>
                      Receipt #
                    </th>
                    <th className='text-left py-3 px-4 text-sm font-medium text-muted-foreground'>
                      Sale ID
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
                    <th className='text-left py-3 px-4 text-sm font-medium text-muted-foreground'>
                      Payment
                    </th>
                    <th className='text-right py-3 px-4 text-sm font-medium text-muted-foreground'>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReceipts.map((receipt) => (
                    <tr key={receipt.sale_id} className='border-b hover:bg-muted/50'>
                      <td className='py-3 px-4 font-medium'>
                        {receipt.receipt_number || `REC-${receipt.sale_id}`}
                      </td>
                      <td className='py-3 px-4'>#{receipt.sale_id}</td>
                      <td className='py-3 px-4'>
                        <div className='flex items-center gap-2'>
                          <Calendar className='h-4 w-4 text-muted-foreground' />
                          {receipt.sale_date ? new Date(receipt.sale_date).toLocaleString() : 'N/A'}
                        </div>
                      </td>
                      <td className='py-3 px-4'>
                        <div className='flex items-center gap-2'>
                          <span className='font-medium'>{receipt.item_count || 0} items</span>
                        </div>
                      </td>
                      <td className='py-3 px-4'>
                        <div className='flex items-center gap-2'>
                          <DollarSign className='h-4 w-4 text-muted-foreground' />
                          <span className='font-medium'>
                            ETB {receipt.total_amount?.toFixed(2)}
                          </span>
                        </div>
                      </td>
                      <td className='py-3 px-4'>{getPaymentMethodBadge(receipt.payment_method)}</td>
                      <td className='py-3 px-4 text-right'>
                        <div className='flex justify-end gap-2'>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleViewDetails(receipt)}
                          >
                            <Eye className='h-4 w-4' />
                          </Button>
                          <Button variant='outline' size='sm' onClick={() => handlePrint(receipt)}>
                            <Printer className='h-4 w-4' />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedReceipt && (
        <Card className='mt-6'>
          <CardHeader>
            <CardTitle>
              Receipt Details - {selectedReceipt.receipt_number || `REC-${selectedReceipt.sale_id}`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='text-center py-4 border-b'>
                <h3 className='text-xl font-bold'>PharmaCare</h3>
                <p className='text-sm text-muted-foreground'>Receipt</p>
                <p className='text-sm'>
                  {selectedReceipt.receipt_number || `REC-${selectedReceipt.sale_id}`}
                </p>
                <p className='text-sm text-muted-foreground'>
                  {selectedReceipt.sale_date
                    ? new Date(selectedReceipt.sale_date).toLocaleString()
                    : 'N/A'}
                </p>
              </div>

              <div className='grid grid-cols-2 gap-4 py-4'>
                <div>
                  <p className='text-sm text-muted-foreground'>Sale ID</p>
                  <p className='font-medium'>#{selectedReceipt.sale_id}</p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>Cashier</p>
                  <p className='font-medium'>{selectedReceipt.cashier_name || 'N/A'}</p>
                </div>
              </div>

              <div className='py-4 border-t'>
                <h4 className='font-semibold mb-3'>Items</h4>
                <div className='space-y-2'>
                  {selectedReceipt.items && selectedReceipt.items.length > 0 ? (
                    selectedReceipt.items.map((item, index) => (
                      <div key={index} className='flex justify-between py-2 border-b last:border-0'>
                        <span className='flex-1'>
                          {item.medicine_name} x {item.quantity}
                        </span>
                        <span className='font-medium'>
                          ETB {(item.unit_price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className='text-muted-foreground'>No items available</p>
                  )}
                </div>
              </div>

              <div className='py-4 border-t space-y-2'>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Subtotal</span>
                  <span className='font-medium'>
                    ETB {(selectedReceipt.subtotal || 0).toFixed(2)}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Discount</span>
                  <span className='font-medium'>
                    ETB {(selectedReceipt.discount || 0).toFixed(2)}
                  </span>
                </div>
                <div className='flex justify-between text-lg font-bold pt-2 border-t'>
                  <span>Total</span>
                  <span className='text-primary'>
                    ETB {(selectedReceipt.total_amount || 0).toFixed(2)}
                  </span>
                </div>
                <div className='flex justify-between text-sm text-muted-foreground'>
                  <span>Payment Method</span>
                  <span>{getPaymentMethodBadge(selectedReceipt.payment_method)}</span>
                </div>
                {selectedReceipt.reference_number && (
                  <div className='flex justify-between text-sm text-muted-foreground'>
                    <span>Reference</span>
                    <span>{selectedReceipt.reference_number}</span>
                  </div>
                )}
              </div>

              <div className='text-center py-4 border-t'>
                <p className='text-sm text-muted-foreground'>Thank you for your purchase!</p>
              </div>

              <div className='flex justify-end gap-2 pt-4'>
                <Button
                  variant='outline'
                  onClick={() => {
                    setSelectedReceipt(null);
                  }}
                >
                  Close
                </Button>
                <Button onClick={() => handlePrint(selectedReceipt)}>
                  <Printer className='h-4 w-4 mr-2' />
                  Print Receipt
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
