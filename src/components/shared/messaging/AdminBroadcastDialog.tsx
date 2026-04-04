import * as React from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Megaphone,
  Users,
  Shield,
  Building2,
  CheckCircle2,
  X,
  Send,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface AdminBroadcastDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type TargetAudience =
  | "all_users"
  | "all_owners"
  | "specific_plan"
  | "specific_pharmacy";

type MessageType =
  | "announcement"
  | "newsletter"
  | "compliance_alert"
  | "subscription_reminder"
  | "security_notice";

interface SubscriptionPlan {
  _id: string;
  name: string;
  code: string;
  isActive: boolean;
}

interface PharmacyOption {
  _id: string;
  name: string;
}

const TARGET_OPTIONS: {
  value: TargetAudience;
  icon: React.ElementType;
  label: string;
  description: string;
}[] = [
  {
    value: "all_users",
    icon: Users,
    label: "All Users",
    description: "Send to every user in the platform",
  },
  {
    value: "all_owners",
    icon: Shield,
    label: "All Pharmacy Owners",
    description: "Send to all pharmacy owners only",
  },
  {
    value: "specific_plan",
    icon: CheckCircle2,
    label: "Specific Subscription Plan",
    description: "Target users on a specific plan",
  },
  {
    value: "specific_pharmacy",
    icon: Building2,
    label: "Specific Pharmacy",
    description: "Target a specific pharmacy",
  },
];

const MESSAGE_TYPES: {
  value: MessageType;
  icon: React.ElementType;
  label: string;
  color: string;
}[] = [
  {
    value: "announcement",
    icon: Megaphone,
    label: "Announcement",
    color: "bg-blue-100 text-blue-700 hover:bg-blue-200",
  },
  {
    value: "newsletter",
    icon: Megaphone,
    label: "Newsletter",
    color: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
  },
  {
    value: "compliance_alert",
    icon: Megaphone,
    label: "Compliance Alert",
    color: "bg-red-100 text-red-700 hover:bg-red-200",
  },
  {
    value: "subscription_reminder",
    icon: Megaphone,
    label: "Subscription Reminder",
    color: "bg-amber-100 text-amber-700 hover:bg-amber-200",
  },
  {
    value: "security_notice",
    icon: Megaphone,
    label: "Security Notice",
    color: "bg-purple-100 text-purple-700 hover:bg-purple-200",
  },
];

export function AdminBroadcastDialog({
  open,
  onOpenChange,
}: AdminBroadcastDialogProps) {
  const { sessionToken } = useAuth();
  const [targetAudience, setTargetAudience] =
    React.useState<TargetAudience>("all_owners");
  const [selectedPlanCodes, setSelectedPlanCodes] = React.useState<string[]>(
    [],
  );
  const [selectedPharmacyIds, setSelectedPharmacyIds] = React.useState<
    string[]
  >([]);
  const [messageType, setMessageType] =
    React.useState<MessageType>("announcement");
  const [title, setTitle] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [step, setStep] = React.useState<1 | 2 | 3>(1);
  const [isAnimating, setIsAnimating] = React.useState(false);
  const [isSending, setIsSending] = React.useState(false);

  const sendAdminBroadcast = useMutation(
    api.admin.mutations.sendAdminBroadcast,
  );
  const plans =
    (useQuery(
      api.admin.queries.getAllSubscriptionPlans,
      sessionToken ? { sessionToken } : "skip",
    ) as SubscriptionPlan[] | undefined) || [];
  const pharmacies =
    (useQuery(
      api.admin.queries.getPharmacies,
      sessionToken ? { sessionToken } : "skip",
    ) as PharmacyOption[] | undefined) || [];

  React.useEffect(() => {
    if (open) {
      setIsAnimating(true);
      setStep(1);
      setTargetAudience("all_owners");
      setMessageType("announcement");
      setTitle("");
      setMessage("");
      setSelectedPlanCodes([]);
      setSelectedPharmacyIds([]);
    }
  }, [open]);

  const togglePlanSelection = (code: string) => {
    setSelectedPlanCodes((prev) =>
      prev.includes(code)
        ? prev.filter((value) => value !== code)
        : [...prev, code],
    );
  };

  const togglePharmacySelection = (pharmacyId: string) => {
    setSelectedPharmacyIds((prev) =>
      prev.includes(pharmacyId)
        ? prev.filter((value) => value !== pharmacyId)
        : [...prev, pharmacyId],
    );
  };

  const canProceedStepOne = () => {
    if (targetAudience === "specific_plan") {
      return selectedPlanCodes.length > 0;
    }

    if (targetAudience === "specific_pharmacy") {
      return selectedPharmacyIds.length > 0;
    }

    return true;
  };

  const canProceed = () => {
    if (step === 1) {
      return canProceedStepOne();
    }

    if (step === 2) {
      return true;
    }

    return title.trim().length > 0 && message.trim().length > 0;
  };

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error("Please enter both title and message");
      return;
    }

    if (!canProceedStepOne()) {
      toast.error("Please select at least one target before sending");
      return;
    }

    const targetIds =
      targetAudience === "specific_plan"
        ? selectedPlanCodes
        : targetAudience === "specific_pharmacy"
          ? selectedPharmacyIds
          : undefined;

    setIsSending(true);

    try {
      const result = await sendAdminBroadcast({
        title: title.trim(),
        message: message.trim(),
        targetType: targetAudience,
        targetIds,
        messageType,
        priority:
          messageType === "compliance_alert" ||
          messageType === "security_notice"
            ? "high"
            : "medium",
      });

      toast.success(
        `Broadcast sent to ${result.recipientCount} users across ${result.pharmacyCount} pharmacies`,
      );
      handleClose();
    } catch (error) {
      toast.error("Failed to send broadcast");
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleTargetAudienceChange = (value: string) => {
    setTargetAudience(value as TargetAudience);
    setSelectedPlanCodes([]);
    setSelectedPharmacyIds([]);
  };

  const activePlans = plans.filter((plan) => plan.isActive);
  const selectedTargetLabel =
    TARGET_OPTIONS.find((option) => option.value === targetAudience)?.label ||
    "Unknown audience";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl p-0 overflow-hidden bg-white">
        <DialogHeader className="sr-only">
          <DialogTitle>Admin Broadcast Message</DialogTitle>
          <DialogDescription>
            Send an administrative broadcast to selected audiences across the
            platform.
          </DialogDescription>
        </DialogHeader>
        <div className="relative h-[88vh] sm:h-[700px] flex flex-col">
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
            <div className="relative h-full overflow-y-auto px-4 sm:px-8 py-5 sm:py-6">
              <div className="max-w-2xl mx-auto space-y-8">
                <div
                  className={cn(
                    "text-center space-y-2",
                    "transition-all duration-700 ease-out",
                    isAnimating
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-4",
                  )}
                  style={{ transitionDelay: isAnimating ? "100ms" : "0ms" }}
                >
                  <div className="inline-flex items-center gap-2">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full blur-xl opacity-40 animate-pulse" />
                      <Megaphone className="relative h-12 w-12 text-emerald-600" />
                    </div>
                    <h2 className="font-display text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-700 bg-clip-text text-transparent">
                      Broadcast Message
                    </h2>
                  </div>
                  <p className="text-lg text-slate-600">
                    Send announcements to users across the platform
                  </p>
                </div>

                {step === 1 && (
                  <div
                    className={cn(
                      "space-y-6",
                      "transition-all duration-700 delay-200 ease-out",
                      isAnimating
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-4",
                    )}
                    style={{ transitionDelay: isAnimating ? "200ms" : "0ms" }}
                  >
                    <div className="space-y-4">
                      <h3 className="font-display text-xl font-semibold text-slate-800">
                        Who should receive this message?
                      </h3>

                      <RadioGroup
                        value={targetAudience}
                        onValueChange={handleTargetAudienceChange}
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {TARGET_OPTIONS.map((option) => (
                            <div
                              key={option.value}
                              className={cn(
                                "relative p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer group",
                                "bg-white/80 backdrop-blur-sm hover:bg-white/95",
                                targetAudience === option.value
                                  ? "border-emerald-500 shadow-md"
                                  : "border-slate-200",
                              )}
                            >
                              <RadioGroupItem
                                value={option.value}
                                className="sr-only"
                                id={`target-${option.value}`}
                              />
                              <label
                                htmlFor={`target-${option.value}`}
                                className="flex flex-col gap-2 cursor-pointer"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl blur-md opacity-0 group-hover:opacity-20 transition-opacity" />
                                    <div
                                      className={cn(
                                        "relative w-10 h-10 rounded-xl flex items-center justify-center",
                                        targetAudience === option.value
                                          ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm"
                                          : "bg-slate-100 text-slate-600",
                                      )}
                                    >
                                      <option.icon className="h-5 w-5" />
                                    </div>
                                  </div>
                                  <span className="font-display font-semibold text-slate-800">
                                    {option.label}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                  {option.description}
                                </p>
                              </label>
                            </div>
                          ))}
                        </div>
                      </RadioGroup>

                      {targetAudience === "specific_plan" && (
                        <div className="space-y-2">
                          <Label>Select one or more plans</Label>
                          <div className="rounded-xl border border-slate-200 bg-white/90 p-3">
                            {activePlans.length === 0 ? (
                              <p className="text-sm text-slate-500">
                                No active subscription plans found.
                              </p>
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                {activePlans.map((plan) => {
                                  const isSelected = selectedPlanCodes.includes(
                                    plan.code,
                                  );
                                  return (
                                    <button
                                      key={plan._id}
                                      type="button"
                                      onClick={() =>
                                        togglePlanSelection(plan.code)
                                      }
                                      className={cn(
                                        "rounded-full border px-3 py-1.5 text-sm transition-all",
                                        isSelected
                                          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                          : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300",
                                      )}
                                    >
                                      {plan.name} ({plan.code})
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {targetAudience === "specific_pharmacy" && (
                        <div className="space-y-2">
                          <Label>Select one or more pharmacies</Label>
                          <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white/90 p-3">
                            {pharmacies.length === 0 ? (
                              <p className="text-sm text-slate-500">
                                No pharmacies found.
                              </p>
                            ) : (
                              <div className="space-y-2">
                                {pharmacies.map((pharmacy) => {
                                  const isSelected =
                                    selectedPharmacyIds.includes(pharmacy._id);
                                  return (
                                    <button
                                      key={pharmacy._id}
                                      type="button"
                                      onClick={() =>
                                        togglePharmacySelection(pharmacy._id)
                                      }
                                      className={cn(
                                        "w-full rounded-lg border px-3 py-2 text-left text-sm transition-all",
                                        isSelected
                                          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                          : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300",
                                      )}
                                    >
                                      {pharmacy.name}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div
                    className={cn(
                      "space-y-6",
                      "transition-all duration-700 delay-300 ease-out",
                      isAnimating
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-4",
                    )}
                    style={{ transitionDelay: isAnimating ? "300ms" : "0ms" }}
                  >
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Megaphone className="h-5 w-5 text-emerald-600" />
                        <h3 className="font-display text-xl font-semibold text-slate-800">
                          What type of message is this?
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {MESSAGE_TYPES.map((type) => (
                          <button
                            key={type.value}
                            onClick={() => setMessageType(type.value)}
                            className={cn(
                              "relative p-3 rounded-xl border-2 transition-all duration-300 group",
                              "bg-white/80 backdrop-blur-sm hover:bg-white/95",
                              messageType === type.value
                                ? "border-emerald-500 shadow-md"
                                : "border-slate-200",
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={cn(
                                  "w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110",
                                  messageType === type.value
                                    ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm"
                                    : type.color,
                                )}
                              >
                                <type.icon className="h-4 w-4" />
                              </div>
                              <span className="font-medium text-sm text-slate-800">
                                {type.label}
                              </span>
                            </div>
                            {messageType === type.value && (
                              <CheckCircle2 className="absolute top-2 right-2 h-4 w-4 text-emerald-500" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div
                    className={cn(
                      "space-y-6",
                      "transition-all duration-700 delay-400 ease-out",
                      isAnimating
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-4",
                    )}
                    style={{ transitionDelay: isAnimating ? "400ms" : "0ms" }}
                  >
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Megaphone className="h-5 w-5 text-emerald-600" />
                        <h3 className="font-display text-xl font-semibold text-slate-800">
                          Compose your message
                        </h3>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="broadcast-title">
                          Title <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="broadcast-title"
                          placeholder="Enter message title..."
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="h-12"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="broadcast-message">
                          Message <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                          id="broadcast-message"
                          placeholder="Enter your message content..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          rows={6}
                          className="resize-none"
                        />
                      </div>

                      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-slate-100/80">
                        <p className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wider">
                          Preview
                        </p>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                              {
                                MESSAGE_TYPES.find(
                                  (t) => t.value === messageType,
                                )?.label
                              }
                            </Badge>
                            <span className="text-xs text-slate-500">
                              to: {selectedTargetLabel}
                            </span>
                          </div>
                          {(targetAudience === "specific_plan" ||
                            targetAudience === "specific_pharmacy") && (
                            <p className="text-xs text-slate-500">
                              {targetAudience === "specific_plan"
                                ? `${selectedPlanCodes.length} plan(s) selected`
                                : `${selectedPharmacyIds.length} pharmacy(s) selected`}
                            </p>
                          )}
                          <h4 className="font-semibold text-slate-900">
                            {title || "<Untitled>"}
                          </h4>
                          <p className="text-sm text-slate-700 whitespace-pre-wrap">
                            {message || "<Your message here>"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="border-t border-slate-200 bg-white/95 backdrop-blur-sm px-4 sm:px-6 py-4">
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button
                variant="outline"
                onClick={() =>
                  setStep(Math.max(1, (step - 1) as 1 | 2) as 1 | 2 | 3)
                }
                disabled={step === 1 || isSending}
                className="w-full sm:flex-1"
              >
                Back
              </Button>
              <Button
                onClick={
                  step === 3
                    ? handleSend
                    : () => {
                        if (canProceed()) {
                          setStep((step + 1) as 1 | 2 | 3);
                        }
                      }
                }
                disabled={!canProceed() || isSending}
                className={cn(
                  "w-full sm:flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium transition-all duration-300",
                  !canProceed() && step < 3 && "opacity-50",
                )}
              >
                {isSending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : step === 3 ? (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Broadcast
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
