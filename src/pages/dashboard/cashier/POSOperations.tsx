import * as React from 'react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { toast } from 'sonner';
import { Id } from '../../../../convex/_generated/dataModel';
import { ChapaPaymentModal } from '@/components/ChapaPaymentModal';
import {
  Search,
  Plus,
  Trash2,
  ShoppingCart,
  Loader2,
  DollarSign,
  Percent,
  CheckCircle,
  User,
  CreditCard,
} from 'lucide-react';

interface CartItem {
  medicineId: Id<'medicines'>;
  medicineName: string;
  quantity: number;
  unitPrice: number;
  stock: number;
}

interface Medicine {
  medicine_id: Id<'medicines'>;
  medicine_name: string;
  unit_price: number;
  stock: number;
  category?: string;
  manufacturer?: string;
  dosage?: string;
  _id: Id<'medicines'>;
  _creationTime: number;
  name: string;
  price: number;
}

export function POSOperations() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [isChapaModalOpen, setIsChapaModalOpen] = useState(false);

  const medicines = useQuery(
    api.cashier.queries.searchMedicines,
    searchQuery ? { query: searchQuery } : 'skip'
  ) as Medicine[] | undefined;

  const updateQuantity = (medicineId: Id<'medicines'>, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(medicineId);
      return;
    }

    setCart(
      cart.map((item) =>
        item.medicineId === medicineId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCart = (medicineId: Id<'medicines'>) => {
    setCart(cart.filter((item) => item.medicineId !== medicineId));
  };

  const addToCart = (medicine: Medicine) => {
    const existingItem = cart.find((item) => item.medicineId === medicine.medicine_id);

    if (existingItem) {
      updateQuantity(medicine.medicine_id, existingItem.quantity + 1);
    } else {
      setCart([
        ...cart,
        {
          medicineId: medicine.medicine_id,
          medicineName: medicine.name,
          quantity: 1,
          unitPrice: medicine.price,
          stock: medicine.stock,
        },
      ]);
    }

    toast.success(`${medicine.name} added to cart`);
    setSearchQuery('');
  };

  const applyDiscount = () => {
    if (discountPercent < 0 || discountPercent > 100) {
      toast.error('Discount must be between 0 and 100');
      return;
    }

    toast.success('Discount applied successfully');
  };

  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const discountAmount = subtotal * (discountPercent / 100);
    const total = subtotal - discountAmount;

    return { subtotal, discountAmount, total };
  };

  const { subtotal, discountAmount, total } = calculateTotals();

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    if (paymentMethod === 'chapa') {
      setIsChapaModalOpen(true);
      return;
    }

    if (paymentMethod !== 'cash' && !referenceNumber.trim()) {
      toast.error('Reference number is required for this payment method');
      return;
    }

    toast.success('Checkout completed successfully!');
    setCart([]);
    setCustomerName('');
    setDiscountPercent(0);
    setPaymentMethod('cash');
    setReferenceNumber('');
  };

  const handleChapaPaymentSuccess = () => {
    toast.success('Checkout completed successfully!');
    setIsChapaModalOpen(false);
    setCart([]);
    setCustomerName('');
    setDiscountPercent(0);
    setPaymentMethod('cash');
    setReferenceNumber('');
  };

  const getPaymentMethodIcon = (method: string) => {
    const icons: Record<string, React.ElementType> = {
      cash: DollarSign,
      card: CreditCard,
      mobile: CreditCard,
      bank_transfer: CreditCard,
    };
    return icons[method] || DollarSign;
  };

  return (
    <div className='space-y-6 p-4 md:p-8'>
      <div className='space-y-2'>
        <h2 className='text-3xl font-bold tracking-tight'>POS Operations</h2>
        <p className='text-muted-foreground'>Process sales and manage point of sale operations</p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='lg:col-span-2 space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>
                <Search className='h-5 w-5 mr-2' />
                Search Medicines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='relative'>
                <Input
                  placeholder='Search by name, barcode, or manufacturer...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='pl-10'
                />
              </div>

              {medicines === undefined && (
                <div className='flex justify-center py-4'>
                  <Loader2 className='h-6 w-6 animate-spin text-primary' />
                </div>
              )}

              {medicines && medicines.length > 0 && (
                <div className='mt-4 space-y-2 max-h-64 overflow-y-auto'>
                  {medicines.map((medicine: Medicine) => (
                    <div
                      key={medicine.medicine_id}
                      className='flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer'
                      onClick={() => addToCart(medicine)}
                    >
                      <div className='flex-1'>
                        <p className='font-medium'>{medicine.name}</p>
                        <p className='text-sm text-muted-foreground'>
                          Stock: {medicine.stock} | Price: ETB {medicine.price?.toFixed(2)}
                        </p>
                      </div>
                      <Button size='sm'>
                        <Plus className='h-4 w-4' />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <ShoppingCart className='h-5 w-5 mr-2' />
                Cart
                <span className='text-sm font-normal text-muted-foreground ml-2'>
                  ({cart.length} items)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <div className='text-center py-12'>
                  <ShoppingCart className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
                  <p className='text-muted-foreground'>Cart is empty</p>
                </div>
              ) : (
                <div className='space-y-3'>
                  {cart.map((item) => (
                    <div
                      key={item.medicineId}
                      className='flex items-center justify-between p-3 border rounded-lg'
                    >
                      <div className='flex-1'>
                        <p className='font-medium'>{item.medicineName}</p>
                        <p className='text-sm text-muted-foreground'>
                          ETB {item.unitPrice?.toFixed(2)} each
                        </p>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => updateQuantity(item.medicineId, item.quantity - 1)}
                        >
                          -
                        </Button>
                        <span className='w-8 text-center'>{item.quantity}</span>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => updateQuantity(item.medicineId, item.quantity + 1)}
                        >
                          +
                        </Button>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => removeFromCart(item.medicineId)}
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Customer Info</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <label className='block text-sm font-medium mb-2'>Customer Name</label>
                <div className='relative'>
                  <User className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4' />
                  <Input
                    placeholder='Enter customer name'
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className='pl-10'
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <label className='block text-sm font-medium mb-2'>Payment Method</label>
                <div className='grid grid-cols-2 gap-2'>
                  {['cash', 'card', 'mobile', 'bank_transfer', 'chapa'].map((method) => (
                    <button
                      key={method}
                      type='button'
                      onClick={() => setPaymentMethod(method)}
                      className={`px-4 py-3 rounded-lg border-2 transition-colors ${
                        paymentMethod === method
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-input bg-background hover:bg-muted'
                      }`}
                    >
                      <div className='flex items-center justify-center gap-2'>
                        {React.createElement(getPaymentMethodIcon(method), {
                          className: 'h-4 w-4',
                        })}
                        <span className='capitalize'>{method.replace('_', ' ')}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {paymentMethod !== 'cash' && paymentMethod !== 'chapa' && (
                <div>
                  <label className='block text-sm font-medium mb-2'>Reference Number</label>
                  <Input
                    placeholder='Enter reference number'
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                  />
                </div>
              )}

              <div>
                <label className='block text-sm font-medium mb-2'>Discount (%)</label>
                <div className='flex gap-2'>
                  <div className='relative flex-1'>
                    <Percent className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4' />
                    <Input
                      type='number'
                      min='0'
                      max='100'
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
                      className='pl-10'
                    />
                  </div>
                  <Button variant='outline' onClick={applyDiscount}>
                    Apply
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Subtotal</span>
                <span className='font-medium'>ETB {subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className='flex justify-between text-green-600'>
                  <span>Discount</span>
                  <span className='font-medium'>-ETB {discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className='flex justify-between text-lg font-bold pt-3 border-t'>
                <span>Total</span>
                <span className='text-primary'>ETB {total.toFixed(2)}</span>
              </div>
              <Button
                className='w-full'
                size='lg'
                onClick={handleCheckout}
                disabled={cart.length === 0}
              >
                <CheckCircle className='h-5 w-5 mr-2' />
                Complete Checkout
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <ChapaPaymentModal
        open={isChapaModalOpen}
        onClose={() => setIsChapaModalOpen(false)}
        amount={total}
        onSuccess={handleChapaPaymentSuccess}
      />
    </div>
  );
}
