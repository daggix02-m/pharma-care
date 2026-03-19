import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/ui';
import { PharmacySelector } from './components/PharmacySelector';
import { ChapaPaymentModal } from '@/components/ChapaPaymentModal';
import {
  Search,
  Plus,
  Minus,
  ShoppingCart,
  CreditCard,
  DollarSign,
  Receipt,
  Package,
  Trash2,
  Loader2,
  AlertTriangle,
  Pill,
  X,
} from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { toast } from 'sonner';

export function ManagerPOSSales() {
  const branches = useQuery(api.manager.queries.getBranches) || [];
  const pharmacyLoading = branches === undefined;
  
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [processing, setProcessing] = useState(false);
  const [isChapaModalOpen, setIsChapaModalOpen] = useState(false);

  // Convex query for products
  const products = useQuery(api.manager.queries.getAllMedicines) || [];
  const loading = products === undefined;

  const createSaleMutation = useMutation(api.manager.mutations.createSale);

  const filteredByBranch = useMemo(() => {
    if (!selectedBranchId) return [];
    return products.filter(p => p.branchId === selectedBranchId);
  }, [products, selectedBranchId]);

  const filteredProducts = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return filteredByBranch.filter(p => 
      p.name.toLowerCase().includes(term) || 
      p.category.toLowerCase().includes(term)
    );
  }, [filteredByBranch, searchTerm]);

  const addToCart = (product) => {
    const existingItem = cart.find((item) => item._id === product._id);
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        setCart(
          cart.map((item) =>
            item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
          )
        );
      } else {
        toast.error('Not enough stock available');
      }
    } else {
      if (product.stock > 0) {
        setCart([...cart, { ...product, quantity: 1 }]);
      } else {
        toast.error('Product is out of stock');
      }
    }
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity <= 0) {
      setCart(cart.filter((item) => item._id !== id));
      return;
    }
    const product = products.find((p) => p._id === id);
    if (product && newQuantity <= product.stock) {
      setCart(cart.map((item) => (item._id === id ? { ...item, quantity: newQuantity } : item)));
    } else {
      toast.error('Not enough stock available');
    }
  };

  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item._id !== id));
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
  };

  const subtotal = useMemo(() => cart.reduce((total, item) => total + (item.price || 0) * item.quantity, 0), [cart]);
  const discountAmount = useMemo(() => (subtotal * discount) / 100, [subtotal, discount]);
  const total = useMemo(() => subtotal - discountAmount, [subtotal, discountAmount]);

  const handleProcessSale = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    if (!selectedBranchId) {
      toast.error('Please select a branch first');
      return;
    }

    if (paymentMethod === 'chapa') {
        setIsChapaModalOpen(true);
        return;
    }

    try {
      setProcessing(true);
      const response = await createSaleMutation({
        branchId: selectedBranchId,
        items: cart.map((item) => ({
          medicineId: item._id,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: total,
        paymentMethod,
      });

      if (response?.success) {
        toast.success('Sale processed successfully');
        setCart([]);
        setDiscount(0);
      }
    } catch (error) {
      toast.error(error?.message || 'Failed to process sale');
    } finally {
      setProcessing(false);
    }
  };

  const handleChapaPaymentSuccess = async (paymentData) => {
    try {
      setProcessing(true);
      const response = await createSaleMutation({
        branchId: selectedBranchId,
        items: cart.map((item) => ({
          medicineId: item._id,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: total,
        paymentMethod: 'chapa',
        chapaTransactionId: paymentData.transactionId,
        chapaPaymentMethod: paymentData.paymentMethod,
        chapaReference: paymentData.referenceNumber,
      });

      if (response?.success) {
        toast.success('Sale processed successfully');
        setIsChapaModalOpen(false);
        setCart([]);
        setDiscount(0);
      }
    } catch (error) {
      toast.error(error?.message || 'Failed to process sale');
    } finally {
      setProcessing(false);
    }
  };

  const getStockBadge = (product) => {
    if (product.stock <= 0) return <Badge className="bg-red-100 text-red-700">Out of Stock</Badge>;
    if (product.stock <= 10) return <Badge className="bg-yellow-100 text-yellow-700">Low: {product.stock}</Badge>;
    return <Badge className="bg-green-100 text-green-700">In Stock: {product.stock}</Badge>;
  };

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">POS Sales</h2>
        <p className="text-muted-foreground mt-1">Process sales and manage transactions</p>
      </div>

      <PharmacySelector
        pharmacies={branches}
        selectedId={selectedBranchId}
        onChange={setSelectedBranchId}
        loading={pharmacyLoading}
      />

      {selectedBranchId && !loading && (
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{filteredByBranch.length}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cart Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">ETB {total.toFixed(2)}</div></CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search medicines..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              ) : !selectedBranchId ? (
                <div className="text-center py-16 text-muted-foreground">Please select a branch to view products</div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-16">No products found</div>
              ) : (
                <div className="max-h-[500px] overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead className="w-[80px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.map((p) => (
                        <TableRow key={p._id} className={p.stock <= 0 ? 'opacity-50' : 'cursor-pointer hover:bg-muted/50'}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center"><Pill className="h-4 w-4 text-primary" /></div>
                              <div className="font-medium text-sm">{p.name}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">{p.category}</TableCell>
                          <TableCell className="text-right font-medium">ETB {p.price.toFixed(2)}</TableCell>
                          <TableCell>{getStockBadge(p)}</TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline" disabled={p.stock <= 0} onClick={() => addToCart(p)}><Plus className="h-4 w-4" /></Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><ShoppingCart className="h-5 w-5" /> Cart</CardTitle></CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground text-sm">Cart is empty</div>
              ) : (
                <div className="space-y-4">
                  <div className="max-h-72 overflow-y-auto space-y-2">
                    {cart.map((item) => (
                      <div key={item._id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground">ETB {item.price.toFixed(2)} x {item.quantity}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQuantity(item._id, item.quantity - 1)}><Minus className="h-3 w-3" /></Button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQuantity(item._id, item.quantity + 1)}><Plus className="h-3 w-3" /></Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => removeFromCart(item._id)}><Trash2 className="h-3 w-3" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 pt-3 border-t">
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>ETB {subtotal.toFixed(2)}</span></div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Discount (%)</span>
                      <Input type="number" min="0" max="100" value={discount} onChange={e => setDiscount(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))} className="w-20 h-8 text-right" />
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-1 border-t"><span>Total</span><span>ETB {total.toFixed(2)}</span></div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Payment Method</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant={paymentMethod === 'cash' ? 'default' : 'outline'} onClick={() => setPaymentMethod('cash')} className="w-full">Cash</Button>
                      <Button variant={paymentMethod === 'card' ? 'default' : 'outline'} onClick={() => setPaymentMethod('card')} className="w-full">Card</Button>
                      <Button variant={paymentMethod === 'mobile' ? 'default' : 'outline'} onClick={() => setPaymentMethod('mobile')} className="w-full">Mobile</Button>
                      <Button variant={paymentMethod === 'chapa' ? 'default' : 'outline'} onClick={() => setPaymentMethod('chapa')} className="w-full">Chapa</Button>
                    </div>
                  </div>

                  <Button className="w-full" size="lg" onClick={handleProcessSale} disabled={cart.length === 0 || processing}>
                     {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Receipt className="h-4 w-4 mr-2" />}
                     {processing ? 'Processing...' : `Process Sale - ETB ${total.toFixed(2)}`}
                   </Button>
                 </div>
               )}
             </CardContent>
           </Card>
           
           <ChapaPaymentModal
             open={isChapaModalOpen}
             onClose={() => setIsChapaModalOpen(false)}
             amount={total}
             onSuccess={handleChapaPaymentSuccess}
           />
         </div>
       </div>
    </div>
  );
}
