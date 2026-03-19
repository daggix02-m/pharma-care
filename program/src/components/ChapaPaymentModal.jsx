import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { chapaService } from '@/services/chapa.service';
import {
  CheckCircle2,
  Loader2,
  ArrowRight,
  ArrowLeft,
  CreditCard,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

const PAYMENT_STEPS = ['method', 'details', 'processing', 'success'];

export function ChapaPaymentModal({ open, onClose, amount, onSuccess }) {
  const [currentStep, setCurrentStep] = useState('method');
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState({});
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);

  const paymentMethods = chapaService.getSupportedPaymentMethods();

  const resetForm = () => {
    setCurrentStep('method');
    setSelectedMethod(null);
    setPaymentDetails({});
    setErrors({});
    setProcessing(false);
    setPaymentResult(null);
  };

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
    setCurrentStep('details');
  };

  const handleDetailsChange = (field, value) => {
    setPaymentDetails((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const validateAndProceed = () => {
    const validation = chapaService.validatePaymentDetails(selectedMethod.id, paymentDetails);
    
    if (!validation.valid) {
      setErrors({ general: validation.error });
      toast.error(validation.error);
      return;
    }

    setCurrentStep('processing');
    processPayment();
  };

  const processPayment = async () => {
    try {
      setProcessing(true);
      
      const result = await chapaService.processPayment({
        amount,
        paymentMethod: selectedMethod.id,
        paymentDetails,
      });

      setPaymentResult(result);
      setCurrentStep('success');
      
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (error) {
      setErrors({ general: error.message });
      setCurrentStep('details');
      toast.error(error.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleClose = () => {
    if (processing) return;
    resetForm();
    onClose();
  };

  const handleBack = () => {
    if (currentStep === 'details') {
      setCurrentStep('method');
      setSelectedMethod(null);
      setPaymentDetails({});
      setErrors({});
    } else if (currentStep === 'processing') {
      return;
    } else if (currentStep === 'success') {
      handleClose();
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'method':
        return (
          <div className="space-y-6">
            <div className="text-center py-4">
              <p className="text-sm text-slate-500 mb-2">Total Amount</p>
              <p className="text-3xl font-black text-slate-900">{chapaService.formatAmount(amount)}</p>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-700 mb-4">Select Payment Method</p>
              <div className="grid grid-cols-2 gap-3">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => handleMethodSelect(method)}
                    className="group relative p-4 rounded-2xl border-2 border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{method.icon}</span>
                      <span className="font-bold text-slate-900">{method.name}</span>
                    </div>
                    <Badge className="bg-slate-100 text-slate-600 text-[10px] uppercase tracking-wider">
                      {method.type.replace('_', ' ')}
                    </Badge>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className="w-4 h-4 text-indigo-500" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'details':
        return (
          <div className="space-y-6">
            <div className="text-center py-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-2xl">{selectedMethod.icon}</span>
                <span className="font-bold text-lg text-slate-900">{selectedMethod.name}</span>
              </div>
              <p className="text-2xl font-black text-slate-900">{chapaService.formatAmount(amount)}</p>
            </div>

            <div className="space-y-4">
              {selectedMethod.fields.map((field) => (
                <div key={field.name} className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    {field.label}
                    {field.required && <span className="text-rose-500 ml-1">*</span>}
                  </label>
                  
                  {field.type === 'select' ? (
                    <select
                      value={paymentDetails[field.name] || ''}
                      onChange={(e) => handleDetailsChange(field.name, e.target.value)}
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                    >
                      <option value="">Select {field.label}</option>
                      {field.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      type={field.type}
                      placeholder={field.placeholder}
                      value={paymentDetails[field.name] || ''}
                      onChange={(e) => handleDetailsChange(field.name, e.target.value)}
                      className="h-12"
                    />
                  )}
                  
                  {errors[field.name] && (
                    <p className="text-xs text-rose-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors[field.name]}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {errors.general && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <p className="text-xs text-rose-700 font-medium">{errors.general}</p>
              </div>
            )}
          </div>
        );

      case 'processing':
        return (
          <div className="space-y-6 text-center py-8">
            <div className="flex justify-center">
              <div className="relative">
                <Loader2 className="w-16 h-16 animate-spin text-indigo-600" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl">{selectedMethod.icon}</span>
                </div>
              </div>
            </div>
            
            <div>
              <p className="text-lg font-bold text-slate-900 mb-2">Processing Payment</p>
              <p className="text-sm text-slate-500">Please wait while we verify your payment...</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Method</span>
                <span className="font-medium">{selectedMethod.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Amount</span>
                <span className="font-medium">{chapaService.formatAmount(amount)}</span>
              </div>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="space-y-6 text-center py-8">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>
            </div>

            <div>
              <p className="text-xl font-bold text-emerald-600 mb-2">Payment Successful!</p>
              <p className="text-sm text-slate-500">Your transaction has been completed</p>
            </div>

            {paymentResult && (
              <div className="space-y-3 p-4 bg-slate-50 rounded-xl">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Transaction ID</span>
                  <span className="font-mono font-medium text-slate-900">{paymentResult.transactionId}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Reference</span>
                  <span className="font-mono font-medium text-slate-900">{paymentResult.referenceNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Amount</span>
                  <span className="font-medium">{chapaService.formatAmount(paymentResult.amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Method</span>
                  <span className="font-medium">{paymentResult.paymentMethod}</span>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
     }
   };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-600" />
            Payment
          </DialogTitle>
          <DialogDescription>
            {currentStep === 'method' && 'Select your preferred payment method'}
            {currentStep === 'details' && 'Enter payment details'}
            {currentStep === 'processing' && 'Processing your payment'}
            {currentStep === 'success' && 'Payment completed successfully'}
          </DialogDescription>
        </DialogHeader>

        {renderStepContent()}

        <DialogFooter className="gap-2">
          {currentStep === 'details' && (
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          
          {currentStep === 'details' && (
            <Button
              onClick={validateAndProceed}
              disabled={processing}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Pay {chapaService.formatAmount(amount)}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          )}

          {currentStep === 'success' && (
            <Button
              onClick={handleClose}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              Done
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
