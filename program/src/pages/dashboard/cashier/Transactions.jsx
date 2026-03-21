import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import {
  Search,
  ArrowUpDown,
  Calendar,
  DollarSign,
  CreditCard,
  Eye,
  Filter,
} from 'lucide-react';

export function Transactions() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [filterType, setFilterType] = useState('all');

  const transactions = useQuery(api.cashier.queries.getTransactions) || [];

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      !searchQuery.trim() ||
      t.transaction_id?.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.sale_id?.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.customer_name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = filterType === 'all' || t.type === filterType;

    return matchesSearch && matchesFilter;
  });

  const handleViewDetails = (transactionId) => {
    setSelectedTransaction(transactions.find(t => t.transaction_id === transactionId));
  };

  const getTransactionTypeBadge = (type) => {
    const types = {
      sale: { label: 'Sale', color: 'bg-green-100 text-green-800' },
      return: { label: 'Return', color: 'bg-red-100 text-red-800' },
      refund: { label: 'Refund', color: 'bg-orange-100 text-orange-800' },
      payment: { label: 'Payment', color: 'bg-blue-100 text-blue-800' },
    };
    const typeInfo = types[type] || { label: 'Unknown', color: 'bg-gray-100 text-gray-800' };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${typeInfo.color}`}>
        {typeInfo.label}
      </span>
    );
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

  return (
    <div className='space-y-6 p-4 md:p-8'>
      <div className='space-y-2'>
        <h2 className='text-3xl font-bold tracking-tight'>Transactions</h2>
        <p className='text-muted-foreground'>View and manage all transactions</p>
      </div>

      <Card>
        <CardContent className='pt-6'>
          <div className='flex flex-col md:flex-row gap-4'>
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4' />
              <Input
                placeholder='Search transactions...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='pl-10'
              />
            </div>
            <div className='flex items-center gap-2'>
              <Filter className='h-4 w-4 text-muted-foreground' />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className='px-3 py-2 border border-input bg-background rounded-md text-sm'
              >
                <option value='all'>All Types</option>
                <option value='sale'>Sales</option>
                <option value='return'>Returns</option>
                <option value='refund'>Refunds</option>
                <option value='payment'>Payments</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            All Transactions
            <span className='text-sm font-normal text-muted-foreground ml-2'>
              ({filteredTransactions.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className='text-center py-12'>
              <ArrowUpDown className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
              <p className='text-muted-foreground'>No transactions found</p>
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead>
                  <tr className='border-b'>
                    <th className='text-left py-3 px-4 text-sm font-medium text-muted-foreground'>
                      Transaction ID
                    </th>
                    <th className='text-left py-3 px-4 text-sm font-medium text-muted-foreground'>
                      Type
                    </th>
                    <th className='text-left py-3 px-4 text-sm font-medium text-muted-foreground'>
                      Sale ID
                    </th>
                    <th className='text-left py-3 px-4 text-sm font-medium text-muted-foreground'>
                      Date
                    </th>
                    <th className='text-left py-3 px-4 text-sm font-medium text-muted-foreground'>
                      Customer
                    </th>
                    <th className='text-left py-3 px-4 text-sm font-medium text-muted-foreground'>
                      Amount
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
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.transaction_id} className='border-b hover:bg-muted/50'>
                      <td className='py-3 px-4 font-medium'>#{transaction.transaction_id}</td>
                      <td className='py-3 px-4'>{getTransactionTypeBadge(transaction.type)}</td>
                      <td className='py-3 px-4'>#{transaction.sale_id || 'N/A'}</td>
                      <td className='py-3 px-4 text-sm'>
                        <div className='flex items-center gap-2'>
                          <Calendar className='h-4 w-4 text-muted-foreground' />
                          {transaction.transaction_date
                            ? new Date(transaction.transaction_date).toLocaleString()
                            : 'N/A'}
                        </div>
                      </td>
                      <td className='py-3 px-4 text-sm'>
                        {transaction.customer_name || 'Walk-in'}
                      </td>
                      <td className='py-3 px-4'>
                        <div className='flex items-center gap-2'>
                          <DollarSign className='h-4 w-4 text-muted-foreground' />
                          <span className='font-medium'>ETB {transaction.amount?.toFixed(2)}</span>
                        </div>
                      </td>
                      <td className='py-3 px-4'>
                        {getPaymentMethodBadge(transaction.payment_method)}
                      </td>
                      <td className='py-3 px-4 text-right'>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => handleViewDetails(transaction.transaction_id)}
                        >
                          <Eye className='h-4 w-4' />
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

      {selectedTransaction && (
        <Card className='mt-6'>
          <CardHeader>
            <CardTitle>Transaction Details - #{selectedTransaction.transaction_id}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm text-muted-foreground'>Transaction Type</p>
                  <p className='font-medium'>{getTransactionTypeBadge(selectedTransaction.type)}</p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>Sale ID</p>
                  <p className='font-medium'>#{selectedTransaction.sale_id || 'N/A'}</p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>Date</p>
                  <p className='font-medium'>
                    {selectedTransaction.transaction_date
                      ? new Date(selectedTransaction.transaction_date).toLocaleString()
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>Customer</p>
                  <p className='font-medium'>{selectedTransaction.customer_name || 'Walk-in'}</p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>Amount</p>
                  <p className='font-medium'>ETB {selectedTransaction.amount?.toFixed(2)}</p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>Payment Method</p>
                  <p className='font-medium'>
                    {getPaymentMethodBadge(selectedTransaction.payment_method)}
                  </p>
                </div>
                {selectedTransaction.reference_number && (
                  <div>
                    <p className='text-sm text-muted-foreground'>Reference Number</p>
                    <p className='font-medium'>{selectedTransaction.reference_number}</p>
                  </div>
                )}
                {selectedTransaction.cashier_name && (
                  <div>
                    <p className='text-sm text-muted-foreground'>Cashier</p>
                    <p className='font-medium'>{selectedTransaction.cashier_name}</p>
                  </div>
                )}
              </div>

              {selectedTransaction.items && selectedTransaction.items.length > 0 && (
                <div className='pt-4 border-t'>
                  <h4 className='font-semibold mb-3'>Items</h4>
                  <div className='space-y-2'>
                    {selectedTransaction.items.map((item, index) => (
                      <div key={index} className='flex justify-between py-2 border-b last:border-0'>
                        <span className='flex-1'>
                          {item.medicine_name} x {item.quantity}
                        </span>
                        <span className='font-medium'>
                          ETB {(item.unit_price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedTransaction.notes && (
                <div className='pt-4 border-t'>
                  <p className='text-sm text-muted-foreground'>Notes</p>
                  <p className='font-medium'>{selectedTransaction.notes}</p>
                </div>
              )}

              <div className='flex justify-end pt-4'>
                <Button
                  variant='outline'
                  onClick={() => {
                    setSelectedTransaction(null);
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
