import * as React from "react";
import { useMutation } from "convex/react";
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
  Mail,
  Building2,
  Users,
  User,
  Send,
  CheckCircle2,
  X,
  Loader2,
  AtSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface OwnerInternalMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type TargetType =
  | "all_managers"
  | "specific_branch"
  | "specific_role"
  | "specific_individual";

const TARGET_OPTIONS: {
  value: TargetType;
  icon: React.ElementType;
  label: string;
  description: string;
}[] = [
  {
    value: "all_managers",
    icon: Users,
    label: "All Managers",
    description: "Send to all managers in your pharmacy",
  },
  {
    value: "specific_branch",
    icon: Building2,
    label: "Specific Branch",
    description: "Send to managers at a specific branch",
  },
  {
    value: "specific_role",
    icon: User,
    label: "Specific Role",
    description: "Send to all staff with a specific role",
  },
  {
    value: "specific_individual",
    icon: User,
    label: "Specific Person",
    description: "Send to a specific staff member",
  },
];

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
        <div className="relative h-[700px] flex flex-col">
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
                      <Mail className="relative h-12 w-12 text-emerald-600" />
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
                        value={targetType}
                        onValueChange={handleTargetTypeChange}
                      >
                        <div className="grid grid-cols-2 gap-3">
                          {TARGET_OPTIONS.map((option) => (
                            <div
                              key={option.value}
                              className={cn(
                                "relative p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer group",
                                "bg-white/80 backdrop-blur-sm hover:bg-white/95",
                                targetType === option.value
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
                                        targetType === option.value
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

                      {targetType === "specific_branch" && (
                        <div className="space-y-2">
                          <Label htmlFor="branch-input">Branch Name</Label>
                          <Input
                            id="branch-input"
                            placeholder="Enter branch name..."
                            value={specificValue}
                            onChange={(e) => setSpecificValue(e.target.value)}
                            className="h-12"
                          />
                        </div>
                      )}

                      {targetType === "specific_role" && (
                        <div className="space-y-2">
                          <Label htmlFor="role-input">Role</Label>
                          <select
                            id="role-input"
                            value={specificValue}
                            onChange={(e) => setSpecificValue(e.target.value)}
                            className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 bg-white/80 backdrop-blur-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                          >
                            <option value="">Select role...</option>
                            <option value="manager">Manager</option>
                            <option value="pharmacist">Pharmacist</option>
                            <option value="cashier">Cashier</option>
                            <option value="inventory_clerk">
                              Inventory Clerk
                            </option>
                            <option value="delivery_staff">
                              Delivery Staff
                            </option>
                          </select>
                        </div>
                      )}

                      {targetType === "specific_individual" && (
                        <div className="space-y-2">
                          <Label htmlFor="email-input">Staff Email</Label>
                          <Input
                            id="email-input"
                            type="email"
                            placeholder="Enter staff email..."
                            value={specificValue}
                            onChange={(e) => setSpecificValue(e.target.value)}
                            className="h-12"
                          />
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
                        <Mail className="h-5 w-5 text-emerald-600" />
                        <h3 className="font-display text-xl font-semibold text-slate-800">
                          Compose your message
                        </h3>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message-title">
                          Title <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="message-title"
                          placeholder="Enter message title..."
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="h-12"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message-content">
                          Message <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                          id="message-content"
                          placeholder="Enter your message content..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          rows={6}
                          className="resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Priority</Label>
                          <Button
                            type="button"
                            variant={isUrgent ? "destructive" : "outline"}
                            onClick={() => setIsUrgent(!isUrgent)}
                            className="w-full justify-start"
                          >
                            {isUrgent ? (
                              <>
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Urgent
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Normal
                              </>
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Delivery Method</Label>
                        <Button
                          type="button"
                          variant={
                            includeEmailNotification ? "default" : "outline"
                          }
                          onClick={() =>
                            setIncludeEmailNotification(
                              !includeEmailNotification,
                            )
                          }
                          className="w-full justify-start"
                        >
                          <AtSign className="h-4 w-4 mr-2" />
                          {includeEmailNotification
                            ? "Email + In-App"
                            : "In-App Only"}
                        </Button>
                        <p className="text-xs text-slate-500">
                          {includeEmailNotification
                            ? "Staff will receive this message in-app and via email"
                            : "Staff will receive this message in-app only"}
                        </p>
                      </div>
                    </div>

                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-slate-100/80">
                      <p className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wider">
                        Preview
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-emerald-600" />
                          <span className="text-xs text-slate-500">
                            to:{" "}
                            {
                              TARGET_OPTIONS.find((t) => t.value === targetType)
                                ?.label
                            }
                          </span>
                          {isUrgent && (
                            <Badge variant="destructive" className="text-xs">
                              URGENT
                            </Badge>
                          )}
                        </div>
                        <h4 className="font-semibold text-slate-900">
                          {title || "<Untitled>"}
                        </h4>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">
                          {message || "<Your message here>"}
                        </p>
                        {includeEmailNotification && (
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <AtSign className="h-3 w-3" />
                            <span>+ Email notification will be sent</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="border-t border-slate-200 bg-white/95 backdrop-blur-sm px-6 py-4">
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep(Math.max(1, step - 1) as 1 | 2 | 3)}
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
