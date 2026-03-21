import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { toast } from 'sonner';
import {
  Clock,
  Check,
  CreditCard,
  DollarSign,
  User,
  Calendar,
  Loader2,
  Package,
} from 'lucide-react';

export function PendingPayments() {
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [referenceNumber, setReferenceNumber] = useState('');

  const payments = useQuery(api.cashier.queries.getPendingPayments) || [];

  const processPayment = useMutation(api.cashier.mutations.processPayment);

  const handleProcessPayment = async (e) => {
    e.preventDefault();

    if (!selectedPayment) return;

    try {
      setActionLoading(selectedPayment.sale_id);

      await processPayment({
        saleId: selectedPayment.sale_id,
        amount: selectedPayment.total_amount,
        paymentMethod: paymentMethod,
        referenceNumber: referenceNumber || undefined,
      });

      toast.success('Payment processed successfully!');
      setPaymentMethod('cash');
      setReferenceNumber('');
      setSelectedPayment(null);
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Failed to process payment');
    } finally {
      setActionLoading(null);
    }
  };

  const openProcessModal = (payment) => {
    setSelectedPayment(payment);
  };

  const getStatusBadge = (status) => {
    return status === 'pending_payment' ? (
      <Badge className='bg-yellow-100 text-yellow-800 border-yellow-300'>
        <Clock className='w-3 h-3 mr-1' />
        Pending Payment
      </Badge>
    ) : (
      <Badge className='bg-green-100 text-green-800 border-green-300'>
        <Check className='w-3 h-3 mr-1' />
        Completed
      </Badge>
    );
  };

  return (
    <div className='space-y-6 p-4 md:p-8'>
      <div className='space-y-2'>
        <h2 className='text-3xl font-bold tracking-tight'>Pending Payments</h2>
        <p className='text-muted-foreground'>
          Process pending payments from sales created by pharmacists
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Pending Payments
            <span className='text-sm font-normal text-muted-foreground ml-2'>
              ({payments.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className='text-center py-12'>
              <Clock className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
              <p className='text-muted-foreground'>No pending payments found</p>
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
                      Pharmacist
                    </th>
                    <th className='text-left py-3 px-4 text-sm font-medium text-muted-foreground'>
                      Items
                    </th>
                    <th className='text-left py-3 px-4 text-sm font-medium text-muted-foreground'>
                      Total
                    </th>
                    <th className='text-left py-3 px-4 text-sm font-medium text-muted-foreground'>
                      Date
                    </th>
                    <th className='text-left py-3 px-4 text-sm font-medium text-muted-foreground'>
                      Status
                    </th>
                    <th className='text-right py-3 px-4 text-sm font-medium text-muted-foreground'>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.sale_id} className='border-b hover:bg-muted/50'>
                      <td className='py-3 px-4 font-medium'>#{payment.sale_id}</td>
                      <td className='py-3 px-4'>
                        <div className='flex items-center gap-2'>
                          <User className='h-4 w-4 text-muted-foreground' />
                          {payment.pharmacist_name || 'Unknown'}
                        </div>
                      </td>
                      <td className='py-3 px-4'>
                        <div className='flex items-center gap-2'>
                          <Package className='h-4 w-4 text-muted-foreground' />
                          <span className='font-medium'>{payment.item_count || 0} items</span>
                        </div>
                      </td>
                      <td className='py-3 px-4'>
                        <div className='flex items-center gap-2'>
                          <DollarSign className='h-4 w-4 text-muted-foreground' />
                          <span className='font-medium'>
                            ETB {payment.total_amount?.toFixed(2)}
                          </span>
                        </div>
                      </td>
                      <td className='py-3 px-4 text-sm text-muted-foreground'>
                        <div className='flex items-center gap-2'>
                          <Calendar className='h-4 w-4' />
                          {payment.sale_date ? new Date(payment.sale_date).toLocaleString() : 'N/A'}
                        </div>
                      </td>
                      <td className='py-3 px-4'>{getStatusBadge(payment.status)}</td>
                      <td className='py-3 px-4 text-right'>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => openProcessModal(payment)}
                          disabled={actionLoading === payment.sale_id}
                        >
                          {actionLoading === payment.sale_id ? (
                            <Loader2 className='h-4 w-4 animate-spin' />
                          ) : (
                            <CreditCard className='h-4 w-4' />
                          )}
                          <span className='ml-2'>Process</span>
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

      {selectedPayment && (
        <Card className='mt-6'>
          <CardHeader>
            <CardTitle>Process Payment - Sale #{selectedPayment.sale_id}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProcessPayment}>
              <div className='space-y-4'>
                <div className='p-4 bg-muted/50 rounded-lg'>
                  <h3 className='font-semibold mb-3'>Sale Details</h3>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <p className='text-sm text-muted-foreground'>Total Amount</p>
                      <p className='text-2xl font-bold text-primary'>
                        ETB {selectedPayment.total_amount?.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className='text-sm text-muted-foreground'>Items</p>
                      <p className='text-lg font-medium'>{selectedPayment.item_count || 0} items</p>
                    </div>
                  </div>
                </div>

                <div className='space-y-4'>
                  <div>
                    <label className='block text-sm font-medium mb-2'>Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
                    >
                      <option value='cash'>Cash</option>
                      <option value='card'>Card</option>
                      <option value='mobile'>Mobile Payment</option>
                      <option value='bank_transfer'>Bank Transfer</option>
                    </select>
                  </div>
                  <div>
                    <label className='block text-sm font-medium mb-2'>
                      Reference Number (Optional)
                    </label>
                    <input
                      type='text'
                      placeholder='Enter reference number'
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                      className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
                    />
                  </div>
                </div>

                <div className='flex gap-2 pt-4'>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => {
                      setSelectedPayment(null);
                      setPaymentMethod('cash');
                      setReferenceNumber('');
                    }}
                    disabled={actionLoading !== null}
                  >
                    Cancel
                  </Button>
                  <Button type='submit' disabled={actionLoading !== null}>
                    {actionLoading === selectedPayment.sale_id ? (
                      <Loader2 className='h-4 w-4 animate-spin mr-2' />
                    ) : (
                      <Check className='h-4 w-4 mr-2' />
                    )}
                    Process Payment
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
