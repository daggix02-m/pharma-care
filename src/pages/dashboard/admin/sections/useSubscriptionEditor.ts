import { useState, useMemo, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { toast } from "sonner";
import type {
  PlanRecord,
  PlanDraft,
  TemplateRecord,
} from "./subscriptionTypes";
import {
  EMPTY_PLAN_DRAFT,
  DEFAULT_CODES,
  CODE_PATTERN,
} from "./subscriptionTypes";

export function useSubscriptionEditor(
  sessionToken: string | null,
  allPlans: PlanRecord[],
  planUsage: any[] | undefined,
) {
  const createPlan = useMutation(api.admin.mutations.createSubscriptionPlan);
  const updatePlan = useMutation(api.admin.mutations.updateSubscriptionPlan);
  const normalizeCurrencies = useMutation(
    api.admin.mutations.normalizeSubscriptionCurrenciesToETB,
  );
  const syncPlansFromSignupDefaults = useMutation(
    api.admin.mutations.syncPlansFromSignupDefaults,
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [selectedPlanId, setSelectedPlanId] =
    useState<Id<"subscription_plans"> | null>(null);
  const [mode, setMode] = useState<"create" | "edit">("edit");
  const [draft, setDraft] = useState<PlanDraft>(EMPTY_PLAN_DRAFT);
  const [baselineDraft, setBaselineDraft] =
    useState<PlanDraft>(EMPTY_PLAN_DRAFT);
  const [saving, setSaving] = useState(false);
  const [syncingPlans, setSyncingPlans] = useState(false);
  const [currencyNormalized, setCurrencyNormalized] = useState(false);

  const filteredPlans = useMemo(() => {
    return allPlans
      .filter((plan) => {
        if (statusFilter === "active") return plan.isActive;
        if (statusFilter === "inactive") return !plan.isActive;
        return true;
      })
      .filter((plan) =>
        `${plan.name} ${plan.code}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()),
      )
      .sort((a, b) => a.price - b.price);
  }, [allPlans, searchTerm, statusFilter]);

  const selectedPlan = useMemo(() => {
    if (!selectedPlanId) return null;
    return allPlans.find((plan) => plan._id === selectedPlanId) || null;
  }, [allPlans, selectedPlanId]);

  const usageByCode = useMemo(() => {
    const map = new Map<string, number>();
    (planUsage || []).forEach((item: any) =>
      map.set(item.code, item.pharmacyCount || 0),
    );
    return map;
  }, [planUsage]);

  const stats = useMemo(() => {
    const activeCount = allPlans.filter((p) => p.isActive).length;
    const avgPrice =
      allPlans.length > 0
        ? Math.round(
            allPlans.reduce((sum, p) => sum + p.price, 0) / allPlans.length,
          )
        : 0;
    return {
      total: allPlans.length,
      active: activeCount,
      inactive: allPlans.length - activeCount,
      averagePrice: avgPrice,
    };
  }, [allPlans]);

  const isDirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(baselineDraft),
    [draft, baselineDraft],
  );

  const isDefaultCodeLocked =
    mode === "edit" && selectedPlan
      ? DEFAULT_CODES.has(selectedPlan.code)
      : false;

  useEffect(() => {
    if (allPlans.length === 0) {
      setSelectedPlanId(null);
      setMode("create");
      setDraft(EMPTY_PLAN_DRAFT);
      setBaselineDraft(EMPTY_PLAN_DRAFT);
      return;
    }
    if (!selectedPlanId) {
      setSelectedPlanId(allPlans[0]._id);
      setMode("edit");
    }
  }, [allPlans, selectedPlanId]);

  useEffect(() => {
    if (mode !== "edit" || !selectedPlan) return;
    const hydrated: PlanDraft = {
      name: selectedPlan.name,
      code: selectedPlan.code,
      price: String(selectedPlan.price),
      currency: "ETB",
      maxBranches: String(selectedPlan.maxBranches),
      maxUsers: String(selectedPlan.maxUsers),
      description: selectedPlan.description || "",
      features: selectedPlan.features || [],
      isActive: Boolean(selectedPlan.isActive),
    };
    setDraft(hydrated);
    setBaselineDraft(hydrated);
  }, [mode, selectedPlan]);

  useEffect(() => {
    if (!sessionToken || currencyNormalized) return;
    let cancelled = false;
    const run = async () => {
      try {
        await normalizeCurrencies({ sessionToken });
      } catch (e) {
        console.error("Failed to normalize subscription currencies", e);
      } finally {
        if (!cancelled) setCurrencyNormalized(true);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [sessionToken, currencyNormalized, normalizeCurrencies]);

  const safelySwitchContext = (next: () => void) => {
    if (!isDirty) {
      next();
      return;
    }
    if (
      window.confirm(
        "You have unsaved changes. Continue and discard the draft?",
      )
    )
      next();
  };

  const openCreateDraft = () => {
    safelySwitchContext(() => {
      setMode("create");
      setSelectedPlanId(null);
      setDraft(EMPTY_PLAN_DRAFT);
      setBaselineDraft(EMPTY_PLAN_DRAFT);
    });
  };

  const selectPlan = (planId: Id<"subscription_plans">) => {
    safelySwitchContext(() => {
      setMode("edit");
      setSelectedPlanId(planId);
    });
  };

  const handleDraftChange = (updates: Partial<PlanDraft>) => {
    setDraft((prev) => ({ ...prev, ...updates }));
  };

  const discardChanges = () => {
    setDraft(baselineDraft);
  };

  const validateDraft = () => {
    if (!draft.name.trim()) return "Plan name is required";
    if (!draft.code.trim()) return "Plan code is required";
    if (!CODE_PATTERN.test(draft.code.trim()))
      return "Plan code must use lowercase letters, numbers, or hyphens";
    const price = Number(draft.price),
      maxBranches = Number(draft.maxBranches),
      maxUsers = Number(draft.maxUsers);
    if (Number.isNaN(price) || price < 0)
      return "Price must be a valid non-negative number";
    if (Number.isNaN(maxBranches) || maxBranches < 1)
      return "Max branches must be at least 1";
    if (Number.isNaN(maxUsers) || maxUsers < 1)
      return "Max users must be at least 1";
    if (draft.features.length === 0) return "Add at least one feature";
    return null;
  };

  const savePlan = async () => {
    const validationError = validateDraft();
    if (validationError) {
      toast.error(validationError);
      return;
    }
    setSaving(true);
    const payload = {
      name: draft.name.trim(),
      code: draft.code.trim().toLowerCase(),
      price: Number(draft.price),
      currency: "ETB",
      features: draft.features,
      maxBranches: Number(draft.maxBranches),
      maxUsers: Number(draft.maxUsers),
      description: draft.description.trim() || undefined,
      isActive: draft.isActive,
    };
    try {
      if (mode === "create") {
        const result = await createPlan({
          name: payload.name,
          code: payload.code,
          price: payload.price,
          currency: payload.currency,
          features: payload.features,
          maxBranches: payload.maxBranches,
          maxUsers: payload.maxUsers,
          description: payload.description,
        });
        toast.success("Subscription plan created");
        setMode("edit");
        setSelectedPlanId(result.planId);
      } else if (selectedPlanId) {
        const result = await updatePlan({ id: selectedPlanId, data: payload });
        toast.success(
          result?.remappedPharmacies > 0
            ? `Plan updated. ${result.remappedPharmacies} pharmacies remapped to new code.`
            : "Subscription plan updated",
        );
      }
      setBaselineDraft({ ...draft, code: payload.code });
    } catch (error: any) {
      toast.error(error?.message || "Failed to save subscription plan");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async () => {
    if (mode !== "edit" || !selectedPlanId) return;
    const nextState = !draft.isActive;
    try {
      await updatePlan({ id: selectedPlanId, data: { isActive: nextState } });
      setDraft((prev) => ({ ...prev, isActive: nextState }));
      setBaselineDraft((prev) => ({ ...prev, isActive: nextState }));
      toast.success(nextState ? "Plan activated" : "Plan deactivated");
    } catch {
      toast.error("Failed to update plan status");
    }
  };

  const syncFromSignup = async () => {
    setSyncingPlans(true);
    try {
      const result = await syncPlansFromSignupDefaults({
        sessionToken: sessionToken!,
      });
      toast.success(
        `Synced plans from signup defaults. Created ${result.created}, updated ${result.updated}.`,
      );
    } catch (error: any) {
      toast.error(
        error?.message || "Failed to sync plans from signup defaults",
      );
    } finally {
      setSyncingPlans(false);
    }
  };

  const handleApplyTemplate = (template: TemplateRecord) => {
    safelySwitchContext(() => {
      setDraft({
        ...draft,
        name: template.name,
        price: String(template.price),
        currency: "ETB",
        maxBranches: String(template.maxBranches),
        maxUsers: String(template.maxUsers),
        description: template.description || "",
        features: template.features,
        isActive: template.isActiveDefault,
      });
      toast.success(`Applied template: ${template.name}`);
    });
  };

  return {
    searchTerm,
    statusFilter,
    setSearchTerm,
    setStatusFilter,
    filteredPlans,
    selectedPlanId,
    usageByCode,
    stats,
    draft,
    mode,
    isDirty,
    isDefaultCodeLocked,
    saving,
    syncingPlans,
    openCreateDraft,
    selectPlan,
    handleDraftChange,
    discardChanges,
    savePlan,
    toggleStatus,
    syncFromSignup,
    handleApplyTemplate,
  };
}
