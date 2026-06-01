import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  type TargetAudience,
  type SubscriptionPlan,
  type PharmacyOption,
  TARGET_OPTIONS,
} from "./broadcastTypes";

interface BroadcastStepTargetProps {
  targetAudience: TargetAudience;
  onTargetAudienceChange: (value: TargetAudience) => void;
  selectedPlanCodes: string[];
  onTogglePlan: (code: string) => void;
  selectedPharmacyIds: string[];
  onTogglePharmacy: (id: string) => void;
  plans: SubscriptionPlan[];
  pharmacies: PharmacyOption[];
  isAnimating: boolean;
}

export function BroadcastStepTarget({
  targetAudience,
  onTargetAudienceChange,
  selectedPlanCodes,
  onTogglePlan,
  selectedPharmacyIds,
  onTogglePharmacy,
  plans,
  pharmacies,
  isAnimating,
}: BroadcastStepTargetProps) {
  const activePlans = plans.filter((plan) => plan.isActive);

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
          value={targetAudience}
          onValueChange={(value) =>
            onTargetAudienceChange(value as TargetAudience)
          }
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
          <PlanSelector
            activePlans={activePlans}
            selectedPlanCodes={selectedPlanCodes}
            onTogglePlan={onTogglePlan}
          />
        )}

        {targetAudience === "specific_pharmacy" && (
          <PharmacySelector
            pharmacies={pharmacies}
            selectedPharmacyIds={selectedPharmacyIds}
            onTogglePharmacy={onTogglePharmacy}
          />
        )}
      </div>
    </div>
  );
}

function PlanSelector({
  activePlans,
  selectedPlanCodes,
  onTogglePlan,
}: {
  activePlans: SubscriptionPlan[];
  selectedPlanCodes: string[];
  onTogglePlan: (code: string) => void;
}) {
  return (
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
              const isSelected = selectedPlanCodes.includes(plan.code);
              return (
                <button
                  key={plan._id}
                  type="button"
                  onClick={() => onTogglePlan(plan.code)}
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
  );
}

function PharmacySelector({
  pharmacies,
  selectedPharmacyIds,
  onTogglePharmacy,
}: {
  pharmacies: PharmacyOption[];
  selectedPharmacyIds: string[];
  onTogglePharmacy: (id: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>Select one or more pharmacies</Label>
      <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white/90 p-3">
        {pharmacies.length === 0 ? (
          <p className="text-sm text-slate-500">No pharmacies found.</p>
        ) : (
          <div className="space-y-2">
            {pharmacies.map((pharmacy) => {
              const isSelected = selectedPharmacyIds.includes(pharmacy._id);
              return (
                <button
                  key={pharmacy._id}
                  type="button"
                  onClick={() => onTogglePharmacy(pharmacy._id)}
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
  );
}
