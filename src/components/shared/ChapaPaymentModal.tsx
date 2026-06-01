import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { chapaService } from "@/services/chapa.service";
import {
  MethodStep,
  DetailsStep,
  ProcessingStep,
  SuccessStep,
} from "./ChapaPaymentSteps";

interface ChapaPaymentModalProps {
  open: boolean;
  onClose: () => void;
  amount: number;
  onSuccess?: (result: any) => void;
}

type PaymentStep = "method" | "details" | "processing" | "success";

export function ChapaPaymentModal({
  open,
  onClose,
  amount,
  onSuccess,
}: ChapaPaymentModalProps) {
  const [currentStep, setCurrentStep] = useState<PaymentStep>("method");
  const [selectedMethod, setSelectedMethod] = useState<any>(null);
  const [paymentDetails, setPaymentDetails] = useState<Record<string, string>>(
    {},
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<any>(null);

  const paymentMethods = chapaService.getSupportedPaymentMethods();

  const resetForm = () => {
    setCurrentStep("method");
    setSelectedMethod(null);
    setPaymentDetails({});
    setErrors({});
    setProcessing(false);
    setPaymentResult(null);
  };

  const handleMethodSelect = (method: any) => {
    setSelectedMethod(method);
    setCurrentStep("details");
  };

  const handleDetailsChange = (field: string, value: string) => {
    setPaymentDetails((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateAndProceed = () => {
    const validation = chapaService.validatePaymentDetails(
      selectedMethod?.id || "",
      paymentDetails,
    );

    if (!validation.valid) {
      setErrors({ general: validation.error || "Validation failed" });
      toast.error(validation.error || "Validation failed");
      return;
    }

    setCurrentStep("processing");
    processPayment();
  };

  const processPayment = async () => {
    try {
      setProcessing(true);

      const result = await chapaService.processPayment({
        amount,
        paymentMethod: selectedMethod?.id,
        paymentDetails,
      });

      setPaymentResult(result);
      setCurrentStep("success");

      if (onSuccess) {
        onSuccess(result);
      }
    } catch (error: any) {
      setErrors({ general: error.message });
      setCurrentStep("details");
      toast.error(error.message || "Payment failed");
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
    if (currentStep === "details") {
      setCurrentStep("method");
      setSelectedMethod(null);
      setPaymentDetails({});
      setErrors({});
    } else if (currentStep === "processing") {
      return;
    } else if (currentStep === "success") {
      handleClose();
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
            {currentStep === "method" && "Select your preferred payment method"}
            {currentStep === "details" && "Enter payment details"}
            {currentStep === "processing" && "Processing your payment"}
            {currentStep === "success" && "Payment completed successfully"}
          </DialogDescription>
        </DialogHeader>

        {currentStep === "method" && (
          <MethodStep
            amount={amount}
            paymentMethods={paymentMethods}
            onSelectMethod={handleMethodSelect}
          />
        )}

        {currentStep === "details" && selectedMethod && (
          <DetailsStep
            amount={amount}
            selectedMethod={selectedMethod}
            paymentDetails={paymentDetails}
            errors={errors}
            onDetailsChange={handleDetailsChange}
          />
        )}

        {currentStep === "processing" && selectedMethod && (
          <ProcessingStep
            amount={amount}
            selectedMethod={selectedMethod}
            chapaService={chapaService}
          />
        )}

        {currentStep === "success" && paymentResult && (
          <SuccessStep
            paymentResult={paymentResult}
            amount={amount}
            chapaService={chapaService}
          />
        )}

        <DialogFooter className="gap-2">
          {currentStep === "details" && (
            <Button variant="outline" onClick={handleBack} className="flex-1">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}

          {currentStep === "details" && (
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

          {currentStep === "success" && (
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
