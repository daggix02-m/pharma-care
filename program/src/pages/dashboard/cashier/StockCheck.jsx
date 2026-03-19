import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Input,
} from '@/components/ui/ui';
import { Search } from 'lucide-react';
import { cashierAPI } from '@/api';
import { toast } from 'sonner';

export function StockCheck() {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async (search = '') => {
    try {
      setLoading(true);
      const response = await cashierService.checkStock({ search });

      if (response.success) {
        const productsData = response.data || response.products || [];
        setProducts(Array.isArray(productsData) ? productsData : []);
      } else {
        toast.error('Failed to load product data');
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load product data');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    // Debounced search would be better, but for now we'll search on every change
    fetchProducts(value);
  };

  if (loading) {
    return (
      <div className='space-y-4 sm:space-y-6 p-4 sm:p-6'>
        <h1 className='text-3xl font-bold'>Stock Check</h1>
        <div className='flex justify-center items-center h-64'>
          <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary'></div>
        </div>
      </div>
    );
  }

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className='space-y-4 sm:space-y-6 p-4 sm:p-6'>
      <div>
        <h2 className='text-3xl font-bold tracking-tight'>Stock Check</h2>
        <p className='text-muted-foreground'>Quickly check product availability and price.</p>
      </div>

      <Card>
        <CardHeader>
          <div className='flex items-center gap-4'>
            <div className='relative w-full md:max-w-md'>
              <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Search for a product...'
                className='pl-8'
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Location</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className='font-medium'>{product.name}</TableCell>
                      <TableCell>
                        <span
                          className={
                            product.stock < 100 ? 'text-red-600 font-medium' : 'text-green-600'
                          }
                        >
                          {product.stock} units
                        </span>
                      </TableCell>
                      <TableCell>{product.price || 'N/A'}</TableCell>
                      <TableCell>{product.location || 'N/A'}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className='text-center py-4 text-muted-foreground'>
                      No products found matching &quot;{searchTerm}&quot;
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
