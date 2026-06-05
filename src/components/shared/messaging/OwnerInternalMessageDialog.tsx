import * as React from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { TargetSelectionStep, type TargetType } from "./TargetSelectionStep";
import { ComposeStep } from "./ComposeStep";
import { Loader2, Send, CheckCircle2, X } from "lucide-react";

interface OwnerInternalMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OwnerInternalMessageDialog({
  open,
  onOpenChange,
}: OwnerInternalMessageDialogProps) {
  const [targetType, setTargetType] =
    React.useState<TargetType>("all_managers");
  const [specificValue, setSpecificValue] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [includeEmailNotification, setIncludeEmailNotification] =
    React.useState(false);
  const [isUrgent, setIsUrgent] = React.useState(false);
  const [step, setStep] = React.useState<1 | 2 | 3>(1);
  const [isAnimating, setIsAnimating] = React.useState(false);
  const [isSending, setIsSending] = React.useState(false);

  const sendOwnerMessage = useMutation((api.owner as any).sendOwnerMessage);

  React.useEffect(() => {
    if (open) {
      setIsAnimating(true);
      setStep(1);
      setTargetType("all_managers");
      setTitle("");
      setMessage("");
      setSpecificValue("");
      setIncludeEmailNotification(false);
      setIsUrgent(false);
    }
  }, [open]);

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error("Please enter both title and message");
      return;
    }

    setIsSending(true);

    try {
      await sendOwnerMessage({
        message: message.trim(),
        isUrgent,
      });

      toast.success("Message sent successfully!");
      handleClose();
    } catch (error) {
      toast.error("Failed to send message");
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleTargetTypeChange = (value: string) => {
    setTargetType(value as TargetType);
  };

  const canProceed = () => {
    if (step === 1) {
      return (
        targetType !== "specific_branch" &&
        targetType !== "specific_role" &&
        targetType !== "specific_individual"
      );
    }
    return specificValue.trim().length > 0;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden bg-white">
        <DialogHeader className="sr-only">
          <DialogTitle>Owner Internal Message</DialogTitle>
          <DialogDescription>
            Compose and send one-way internal messages to managers and staff.
          </DialogDescription>
        </DialogHeader>
        <div className="relative h-[700px] max-h-[85vh] flex flex-col">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 h-8 w-8 hover:bg-slate-100"
          >
            <X className="h-4 w-4 text-slate-500" />
          </Button>

          <div className="relative overflow-hidden flex-1">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50" />
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-emerald-200/40 to-transparent rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-teal-200/40 to-transparent rounded-full blur-3xl" />
            </div>
            <div className="relative h-full overflow-y-auto px-8 py-6">
              <div
                className={cn(
                  "max-w-2xl mx-auto space-y-8",
                  "transition-all duration-700 ease-out",
                  isAnimating
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4",
                )}
              >
                <div
                  className={cn(
                    "text-center space-y-2",
                    "transition-all duration-700 delay-100 ease-out",
                    isAnimating
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-4",
                  )}
                  style={{ transitionDelay: isAnimating ? "100ms" : "0ms" }}
                >
                  <div className="inline-flex items-center gap-2">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full blur-xl opacity-40 animate-pulse" />
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="relative text-emerald-600"
                      >
                        <rect width="20" height="16" x="2" y="4" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                    </div>
                    <h2 className="font-display text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-700 bg-clip-text text-transparent">
                      Internal Message
                    </h2>
                  </div>
                  <p className="text-lg text-slate-600">
                    Send one-way messages to your staff and managers
                  </p>
                </div>

                {step === 1 && (
                  <TargetSelectionStep
                    targetType={targetType}
                    specificValue={specificValue}
                    onTargetTypeChange={handleTargetTypeChange}
                    onSpecificValueChange={setSpecificValue}
                    canProceed={canProceed()}
                    isAnimating={isAnimating}
                  />
                )}

                {step === 2 && (
                  <ComposeStep
                    title={title}
                    message={message}
                    isUrgent={isUrgent}
                    includeEmailNotification={includeEmailNotification}
                    targetType={targetType}
                    onTitleChange={setTitle}
                    onMessageChange={setMessage}
                    onUrgentToggle={() => setIsUrgent(!isUrgent)}
                    onEmailNotificationToggle={() =>
                      setIncludeEmailNotification(!includeEmailNotification)
                    }
                    isAnimating={isAnimating}
                  />
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="border-t border-slate-200 bg-white/95 backdrop-blur-sm px-6 py-4">
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep(Math.max(1, step - 1) as 1 | 2)}
                disabled={step === 1 || isSending}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={
                  step === 2
                    ? handleSend
                    : () => {
                        if (canProceed()) {
                          setStep((step + 1) as 1 | 2);
                        }
                      }
                }
                disabled={
                  (step === 2 && (!title.trim() || !message.trim())) ||
                  !canProceed() ||
                  isSending
                }
                className={cn(
                  "flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium transition-all duration-300",
                  !canProceed() && step < 2 && "opacity-50",
                )}
              >
                {isSending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : step === 2 ? (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </>
                ) : (
                  <>
                    Continue
                    <CheckCircle2 className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
