import React, { useState } from 'react';
import { ExcelImport } from '@/components/shared/ExcelImport';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Button,
} from '@/components/ui/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Database, Upload, AlertTriangle, Loader2 } from 'lucide-react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { toast } from 'sonner';

const DATA_TYPES = {
  medications: {
    label: 'Medications',
    schema: ['name', 'category', 'price', 'stock'],
  },
  employees: {
    label: 'Employees',
    schema: ['firstName', 'lastName', 'email', 'role'],
  },
  pharmacies: {
    label: 'Branch Locations',
    schema: ['name', 'address'],
  },
};

export function ImportData() {
  const [importedData, setImportedData] = useState([]);
  const [selectedType, setSelectedType] = useState('medications');
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const branches = useQuery(api.manager.queries.getBranches) || [];
  const bulkImportMutation = useMutation(api.manager.mutations.bulkImport);

  const handleImport = (data) => {
    setValidationError('');
    setImportedData([]);

    if (!data || data.length === 0) return;

    const fileHeaders = Object.keys(data[0]);
    const requiredHeaders = DATA_TYPES[selectedType].schema;

    const missingHeaders = requiredHeaders.filter((header) => !fileHeaders.includes(header));

    if (missingHeaders.length > 0) {
      setValidationError(`Invalid file format. Missing columns: ${missingHeaders.join(', ')}`);
      toast.error(`Invalid format. Missing columns: ${missingHeaders.join(', ')}`);
      return;
    }

    setImportedData(data);
    toast.success(`Successfully parsed ${data.length} rows.`);
  };

  const handleSubmit = async () => {
    if (importedData.length === 0) return;
    if (selectedType === 'medications' && !selectedBranchId) {
      toast.error('Please select a branch for medication import');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await bulkImportMutation({
        type: selectedType,
        data: importedData,
        branchId: selectedType === 'medications' ? selectedBranchId : undefined,
      });

      if (result.success) {
        toast.success(result.message);
        setImportedData([]);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to import data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='space-y-4 sm:space-y-6 p-4 md:p-8'>
      <div>
        <h2 className='text-3xl font-bold tracking-tight'>Import Data</h2>
        <p className='text-muted-foreground mt-1'>Bulk upload system data via Excel files.</p>
      </div>

      <div className='grid gap-6 grid-cols-1 lg:grid-cols-3'>
        <div className='lg:col-span-2 space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'><Database className='h-5 w-5' /> Configuration</CardTitle>
              <CardDescription>Configure your import settings before uploading.</CardDescription>
            </CardHeader>
            <CardContent className='grid gap-6 sm:grid-cols-2'>
              <div className='space-y-2'>
                <label className='text-sm font-medium'>Data Type</label>
                <Select
                  value={selectedType}
                  onValueChange={(value) => {
                    setSelectedType(value);
                    setImportedData([]);
                    setValidationError('');
                  }}
                >
                  <SelectTrigger><SelectValue placeholder='Select data type' /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(DATA_TYPES).map(([key, value]) => (
                      <SelectItem key={key} value={key}>{value.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedType === 'medications' && (
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>Target Branch</label>
                  <Select value={selectedBranchId} onValueChange={setSelectedBranchId}>
                    <SelectTrigger><SelectValue placeholder='Select branch' /></SelectTrigger>
                    <SelectContent>
                      {branches.map((b) => (
                        <SelectItem key={b._id} value={b._id}>{b.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'><Upload className='h-5 w-5' /> Upload File</CardTitle>
              <CardDescription>Drop your .xlsx or .csv file here.</CardDescription>
            </CardHeader>
            <CardContent>
              <ExcelImport onImport={handleImport} />
              {validationError && (
                 <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-600">
                    <AlertTriangle className="h-4 w-4" />
                    {validationError}
                 </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className='lg:col-span-1'>
          <Card className='h-full'>
            <CardHeader>
              <CardTitle>Guidelines</CardTitle>
              <CardDescription>Template requirements for {DATA_TYPES[selectedType].label}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4 text-sm'>
                <div>
                   <p className='font-medium mb-2'>Required Columns:</p>
                   <div className="bg-muted p-3 rounded-md font-mono text-xs space-y-1">
                      {DATA_TYPES[selectedType].schema.map(col => <div key={col}>- {col}</div>)}
                   </div>
                </div>
                <div className='text-muted-foreground'>
                  <p>Column headers must match exactly (case-sensitive) and be present in the first row of your sheet.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {importedData.length > 0 && (
        <Card className="animate-in fade-in duration-500">
          <CardHeader className='flex flex-row items-center justify-between border-b pb-4'>
            <div>
               <CardTitle>Data Preview</CardTitle>
               <CardDescription>Showing first 10 of {importedData.length} records detected.</CardDescription>
            </div>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
              {isSubmitting ? 'Importing...' : 'Confirm Import'}
            </Button>
          </CardHeader>
          <CardContent className="pt-6">
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    {Object.keys(importedData[0]).map((key) => <TableHead key={key}>{key}</TableHead>)}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {importedData.slice(0, 10).map((row, index) => (
                    <TableRow key={index}>
                      {Object.values(row).map((value, i) => <TableCell key={i}>{String(value)}</TableCell>)}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
