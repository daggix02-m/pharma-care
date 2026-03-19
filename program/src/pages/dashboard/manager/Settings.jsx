import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Input,
} from '@/components/ui/ui';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { ProfileSettings } from '@/components/shared/ProfileSettings';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { toast } from 'sonner';
import { Shield, Loader2, RotateCcw, Save, ReceiptText, Building2, Copy, Share2, Key, Check } from 'lucide-react';

export function Settings() {
  // Convex Hooks
  const branches = useQuery(api.manager.queries.getBranches) || [];
  const inviteCodeQuery = useQuery(api.manager.queries.getPharmacyCode);
  const refundPolicyQuery = useQuery(api.manager.queries.getRefundPolicy);
  const loading = branches === undefined || inviteCodeQuery === undefined || refundPolicyQuery === undefined;

  const generateCodeMutation = useMutation(api.manager.mutations.generatePharmacyCode);
  const updatePolicyMutation = useMutation(api.manager.mutations.updateRefundPolicy);

  const [pharmacyName, setPharmacyName] = useState('');
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);

  const [refundPolicy, setRefundPolicy] = useState({
    allow_refunds: false,
    refund_window_days: 7,
    allow_discounts: false,
    max_discount_percent: 0,
    require_manager_approval: false,
  });

  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Use the first branch as the primary "pharmacy" context for name
  useEffect(() => {
    if (branches.length > 0) {
      setPharmacyName(branches[0].name || '');
    }
  }, [branches]);

  useEffect(() => {
    if (refundPolicyQuery) {
      setRefundPolicy(refundPolicyQuery);
    }
  }, [refundPolicyQuery]);

  const handleGeneratePharmacyCode = async () => {
    try {
      setIsGeneratingCode(true);
      const response = await generateCodeMutation();
      if (response.success) {
        toast.success('Pharmacy code generated successfully!');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to generate pharmacy code');
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const handleCopyCode = async () => {
    if (!inviteCodeQuery) return;
    try {
      await navigator.clipboard.writeText(inviteCodeQuery);
      setCopiedToClipboard(true);
      toast.success('Code copied to clipboard');
      setTimeout(() => setCopiedToClipboard(false), 2000);
    } catch (error) {
      toast.error('Failed to copy code');
    }
  };

  const handlePolicyChange = (field, value) => {
    setRefundPolicy((prev) => {
      const updated = { ...prev, [field]: value };
      setHasChanges(JSON.stringify(updated) !== JSON.stringify(refundPolicyQuery));
      return updated;
    });
  };

  const handleSavePolicy = async () => {
    try {
      setSaving(true);
      const response = await updatePolicyMutation({ data: refundPolicy });
      if (response.success) {
        toast.success('Refund & discount policy updated successfully');
        setHasChanges(false);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update policy');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (refundPolicyQuery) {
      setRefundPolicy({ ...refundPolicyQuery });
      setHasChanges(false);
    }
  };

  if (loading) {
     return (
        <div className="space-y-6 p-4 md:p-8">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
        </div>
     );
  }

  return (
    <div className='space-y-6 p-4 md:p-8'>
      <div>
        <h2 className='text-3xl font-bold tracking-tight'>Settings</h2>
        <p className='text-muted-foreground mt-1'>
          Manage your profile and pharmacy policies.
        </p>
      </div>

      {/* Profile Settings */}
      <ProfileSettings userRole='Manager' />

      {/* Pharmacy Invite Code */}
      <Card className="mt-6">
          <CardHeader>
            <div className='flex items-center gap-2'>
              <Key className='h-5 w-5 text-primary' />
              <div>
                <CardTitle>Pharmacy Invite Code</CardTitle>
                <CardDescription>
                  Generate a code for other managers to join your pharmacy.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='pharmacy-code'>Your Pharmacy Code</Label>
              <div className='flex gap-2 flex-wrap'>
                <Input
                  id='pharmacy-code'
                  value={inviteCodeQuery || ''}
                  readOnly
                  placeholder='No code generated yet'
                  className='max-w-md font-mono tracking-widest text-center text-lg font-bold bg-muted/50'
                />
                <Button 
                  onClick={handleCopyCode}
                  disabled={!inviteCodeQuery}
                  variant='outline'
                >
                  {copiedToClipboard ? <Check className='h-4 w-4 mr-2' /> : <Copy className='h-4 w-4 mr-2' />}
                  {copiedToClipboard ? 'Copied!' : 'Copy'}
                </Button>
                <Button 
                  onClick={handleGeneratePharmacyCode}
                  disabled={isGeneratingCode}
                >
                  {isGeneratingCode ? <Loader2 className='h-4 w-4 animate-spin mr-2' /> : <Share2 className='h-4 w-4 mr-2' />}
                  {isGeneratingCode ? 'Generating...' : 'Generate New Code'}
                </Button>
              </div>
              <div className='bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 mt-4'>
                <div className='flex items-start gap-3'>
                  <Shield className='h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5' />
                  <div className='space-y-1'>
                    <p className='text-sm font-medium text-blue-900 dark:text-blue-100'>
                      Security Notice
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      Only share this code with trusted administrators. Generating a new code will invalidate the previous one.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

      {/* Refund & Discount Policy */}
      <Card>
        <CardHeader>
          <div className='flex items-center gap-2'>
            <ReceiptText className='h-5 w-5 text-primary' />
            <div>
              <CardTitle>Refund & Discount Policy</CardTitle>
              <CardDescription>
                Configure how cashiers can process refunds and apply discounts.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* Allow Refunds */}
          <div className='flex items-start gap-4 p-4 border rounded-lg'>
            <div className='pt-0.5'>
              <input
                type='checkbox'
                id='allow-refunds'
                className='rounded border-gray-300 h-4 w-4'
                checked={refundPolicy.allow_refunds}
                onChange={(e) => handlePolicyChange('allow_refunds', e.target.checked)}
              />
            </div>
            <div className='flex-1'>
              <Label htmlFor='allow-refunds' className='font-medium cursor-pointer'>
                Allow Cashiers to Process Refunds
              </Label>
              <p className='text-sm text-muted-foreground mt-1'>
                When enabled, cashiers can initiate refund requests from the POS.
              </p>

              {refundPolicy.allow_refunds && (
                <div className='mt-4 grid gap-4 sm:grid-cols-2'>
                  <div className='space-y-2'>
                    <Label htmlFor='refund-window'>Refund Window (days)</Label>
                    <Input
                      id='refund-window'
                      type='number'
                      min='1'
                      max='365'
                      value={refundPolicy.refund_window_days}
                      onChange={(e) =>
                        handlePolicyChange('refund_window_days', parseInt(e.target.value) || 1)
                      }
                      className='w-32'
                    />
                  </div>

                  <div className='flex items-start gap-3'>
                    <div className='pt-0.5'>
                      <input
                        type='checkbox'
                        id='require-approval'
                        className='rounded border-gray-300 h-4 w-4'
                        checked={refundPolicy.require_manager_approval}
                        onChange={(e) =>
                          handlePolicyChange('require_manager_approval', e.target.checked)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor='require-approval' className='font-medium cursor-pointer'>
                        Require Manager Approval
                      </Label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Allow Discounts */}
          <div className='flex items-start gap-4 p-4 border rounded-lg'>
            <div className='pt-0.5'>
              <input
                type='checkbox'
                id='allow-discounts'
                className='rounded border-gray-300 h-4 w-4'
                checked={refundPolicy.allow_discounts}
                onChange={(e) => handlePolicyChange('allow_discounts', e.target.checked)}
              />
            </div>
            <div className='flex-1'>
              <Label htmlFor='allow-discounts' className='font-medium cursor-pointer'>
                Allow Cashiers to Apply Discounts
              </Label>
              {refundPolicy.allow_discounts && (
                <div className='mt-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='max-discount'>Maximum Discount (%)</Label>
                    <Input
                      id='max-discount'
                      type='number'
                      min='0'
                      max='100'
                      value={refundPolicy.max_discount_percent}
                      onChange={(e) =>
                        handlePolicyChange('max_discount_percent', parseInt(e.target.value) || 0)
                      }
                      className='w-32'
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex items-center justify-between pt-2'>
            <p className='text-sm text-muted-foreground'>
              {hasChanges ? 'You have unsaved changes.' : 'All changes saved.'}
            </p>
            <div className='flex gap-2'>
              <Button
                variant='outline'
                onClick={handleReset}
                disabled={!hasChanges || saving}
              >
                <RotateCcw className='h-4 w-4 mr-2' />
                Reset
              </Button>
              <Button
                onClick={handleSavePolicy}
                disabled={!hasChanges || saving}
              >
                {saving ? (
                  <Loader2 className='h-4 w-4 animate-spin mr-2' />
                ) : (
                  <Save className='h-4 w-4 mr-2' />
                )}
                {saving ? 'Saving...' : 'Save Policy'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
