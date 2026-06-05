import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Users, User } from "lucide-react";
import { cn } from "@/lib/utils";

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

interface TargetSelectionStepProps {
  targetType: TargetType;
  specificValue: string;
  onTargetTypeChange: (value: TargetType) => void;
  onSpecificValueChange: (value: string) => void;
  canProceed: boolean;
  isAnimating: boolean;
}

export function TargetSelectionStep({
  targetType,
  specificValue,
  onTargetTypeChange,
  onSpecificValueChange,
  isAnimating,
}: TargetSelectionStepProps) {
  return (
    <div
      className={cn(
        "space-y-6",
        "transition-all duration-700 delay-200 ease-out",
        isAnimating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
      )}
      style={{ transitionDelay: isAnimating ? "200ms" : "0ms" }}
    >
      <div className="space-y-4">
        <h3 className="font-display text-xl font-semibold text-slate-800">
          Who should receive this message?
        </h3>

        <RadioGroup
          value={targetType}
          onValueChange={(v) => onTargetTypeChange(v as TargetType)}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              onChange={(e) => onSpecificValueChange(e.target.value)}
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
              onChange={(e) => onSpecificValueChange(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 bg-white/80 backdrop-blur-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="">Select role...</option>
              <option value="manager">Manager</option>
              <option value="pharmacist">Pharmacist</option>
              <option value="cashier">Cashier</option>
              <option value="inventory_clerk">Inventory Clerk</option>
              <option value="delivery_staff">Delivery Staff</option>
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
              onChange={(e) => onSpecificValueChange(e.target.value)}
              className="h-12"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export { TARGET_OPTIONS, type TargetType };
