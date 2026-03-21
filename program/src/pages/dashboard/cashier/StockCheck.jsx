import React, { useState } from 'react';
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
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { toast } from 'sonner';

export function StockCheck() {
  const [searchTerm, setSearchTerm] = useState('');

  const products = useQuery(api.cashier.queries.searchMedicines, searchTerm ? searchTerm : undefined) || [];

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (products === undefined) {
    return (
      <div className='space-y-4 sm:space-y-6 p-4 sm:p-6'>
        <h1 className='text-3xl font-bold'>Stock Check</h1>
        <div className='flex justify-center items-center h-64'>
          <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary'></div>
        </div>
      </div>
    );
  }

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
                onChange={(e) => setSearchTerm(e.target.value)}
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
