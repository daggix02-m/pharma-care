import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { toast } from "sonner";
import type {
  PlanDraft,
  TemplateRecord,
  TemplateDraft,
} from "./subscriptionTypes";
import { EMPTY_TEMPLATE_DRAFT } from "./subscriptionTypes";

export function useTemplateEditor(
  sessionToken: string | null,
  currentPlanDraft: PlanDraft,
  onApplyTemplate: (template: TemplateRecord) => void,
) {
  const templates = useQuery(
    api.admin.queries.getSubscriptionPlanTemplates,
    sessionToken ? { sessionToken } : "skip",
  );
  const ensureTemplates = useMutation(
    api.admin.mutations.ensureSubscriptionPlanTemplates,
  );
  const createTemplate = useMutation(
    api.admin.mutations.createSubscriptionPlanTemplate,
  );
  const updateTemplate = useMutation(
    api.admin.mutations.updateSubscriptionPlanTemplate,
  );
  const deleteTemplate = useMutation(
    api.admin.mutations.deleteSubscriptionPlanTemplate,
  );

  const allTemplates = (templates || []) as TemplateRecord[];
  const [selectedTemplateId, setSelectedTemplateId] =
    useState<Id<"subscription_plan_templates"> | null>(null);
  const [templateSaving, setTemplateSaving] = useState(false);
  const [templatesSeeded, setTemplatesSeeded] = useState(false);
  const [templateFeatureInput, setTemplateFeatureInput] = useState("");
  const [templateDraft, setTemplateDraft] =
    useState<TemplateDraft>(EMPTY_TEMPLATE_DRAFT);

  const selectedTemplate = useMemo(() => {
    if (!selectedTemplateId) return null;
    return allTemplates.find((t) => t._id === selectedTemplateId) || null;
  }, [allTemplates, selectedTemplateId]);

  useEffect(() => {
    if (!templates || templatesSeeded) return;
    if (templates.length > 0) {
      setTemplatesSeeded(true);
      return;
    }
    let cancelled = false;
    const seed = async () => {
      try {
        await ensureTemplates({ sessionToken });
      } catch (e) {
        console.error("Failed to seed templates", e);
      } finally {
        if (!cancelled) setTemplatesSeeded(true);
      }
    };
    void seed();
    return () => {
      cancelled = true;
    };
  }, [templates, templatesSeeded, ensureTemplates, sessionToken]);

  useEffect(() => {
    if (allTemplates.length === 0) {
      setSelectedTemplateId(null);
      return;
    }
    if (!selectedTemplateId) setSelectedTemplateId(allTemplates[0]._id);
  }, [allTemplates, selectedTemplateId]);

  useEffect(() => {
    if (!selectedTemplate) {
      setTemplateDraft(EMPTY_TEMPLATE_DRAFT);
      setTemplateFeatureInput("");
      return;
    }
    setTemplateDraft({
      name: selectedTemplate.name,
      description: selectedTemplate.description || "",
      price: String(selectedTemplate.price),
      currency: "ETB",
      maxBranches: String(selectedTemplate.maxBranches),
      maxUsers: String(selectedTemplate.maxUsers),
      features: selectedTemplate.features || [],
      isActiveDefault: selectedTemplate.isActiveDefault,
    });
    setTemplateFeatureInput("");
  }, [selectedTemplate]);

  const addTemplateFeature = () => {
    const value = templateFeatureInput.trim();
    if (!value) return;
    if (templateDraft.features.includes(value)) {
      toast.error("Template feature already added");
      return;
    }
    setTemplateDraft((prev) => ({
      ...prev,
      features: [...prev.features, value],
    }));
    setTemplateFeatureInput("");
  };

  const removeTemplateFeature = (f: string) =>
    setTemplateDraft((prev) => ({
      ...prev,
      features: prev.features.filter((i) => i !== f),
    }));

  const saveTemplate = async () => {
    if (!templateDraft.name.trim()) {
      toast.error("Template name is required");
      return;
    }
    if (templateDraft.features.length === 0) {
      toast.error("Add at least one template feature");
      return;
    }
    const price = Number(templateDraft.price);
    const maxBranches = Number(templateDraft.maxBranches);
    const maxUsers = Number(templateDraft.maxUsers);
    if (Number.isNaN(price) || price < 0) {
      toast.error("Template price must be a valid non-negative number");
      return;
    }
    if (Number.isNaN(maxBranches) || maxBranches < 1) {
      toast.error("Template max branches must be at least 1");
      return;
    }
    if (Number.isNaN(maxUsers) || maxUsers < 1) {
      toast.error("Template max users must be at least 1");
      return;
    }

    setTemplateSaving(true);
    try {
      if (selectedTemplate) {
        await updateTemplate({
          id: selectedTemplate._id,
          data: {
            name: templateDraft.name.trim(),
            description: templateDraft.description.trim() || undefined,
            price,
            currency: "ETB",
            features: templateDraft.features,
            maxBranches,
            maxUsers,
            isActiveDefault: templateDraft.isActiveDefault,
          },
          sessionToken,
        });
        toast.success("Template updated");
      } else {
        const result = await createTemplate({
          name: templateDraft.name.trim(),
          description: templateDraft.description.trim() || undefined,
          price,
          currency: "ETB",
          features: templateDraft.features,
          maxBranches,
          maxUsers,
          isActiveDefault: templateDraft.isActiveDefault,
          sessionToken,
        });
        setSelectedTemplateId(result.templateId);
        toast.success("Template created");
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to save template");
    } finally {
      setTemplateSaving(false);
    }
  };

  const handleApplyTemplate = () => {
    if (!selectedTemplate) {
      toast.error("Select a template first");
      return;
    }
    onApplyTemplate(selectedTemplate);
  };

  const createTemplateFromCurrentDraft = () => {
    setSelectedTemplateId(null);
    setTemplateDraft({
      name: `${currentPlanDraft.name || "Custom"} Template`,
      description: currentPlanDraft.description,
      price: currentPlanDraft.price,
      currency: "ETB",
      maxBranches: currentPlanDraft.maxBranches,
      maxUsers: currentPlanDraft.maxUsers,
      features: currentPlanDraft.features,
      isActiveDefault: currentPlanDraft.isActive,
    });
    setTemplateFeatureInput("");
    toast.info("Template draft prefilled from current plan draft");
  };

  const removeTemplate = async () => {
    if (!selectedTemplate) {
      toast.error("Select a template first");
      return;
    }
    if (selectedTemplate.isBuiltIn) {
      toast.error("Built-in templates cannot be deleted");
      return;
    }
    if (
      !window.confirm(
        `Delete template "${selectedTemplate.name}"? This cannot be undone.`,
      )
    )
      return;
    try {
      await deleteTemplate({ id: selectedTemplate._id, sessionToken });
      toast.success("Template deleted");
      setSelectedTemplateId(null);
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete template");
    }
  };

  const updateTemplateDraft = (updates: Partial<TemplateDraft>) =>
    setTemplateDraft((prev) => ({ ...prev, ...updates }));

  return {
    allTemplates,
    selectedTemplateId,
    selectedTemplate,
    templateDraft,
    templateSaving,
    templateFeatureInput,
    setSelectedTemplateId,
    setTemplateDraft,
    setTemplateFeatureInput,
    addTemplateFeature,
    removeTemplateFeature,
    saveTemplate,
    handleApplyTemplate,
    createTemplateFromCurrentDraft,
    removeTemplate,
    updateTemplateDraft,
  };
}
