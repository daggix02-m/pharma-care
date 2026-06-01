import { useState, useEffect, useRef } from "react";
import { Pencil, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Field } from "./SubscriptionsField";
import type { PlanDraft } from "./subscriptionTypes";

interface PlanEditorProps {
  draft: PlanDraft;
  onDraftChange: (updates: Partial<PlanDraft>) => void;
  mode: "create" | "edit";
  isDirty: boolean;
  isDefaultCodeLocked: boolean;
  saving: boolean;
  onSave: () => void;
  onDiscard: () => void;
  onToggleStatus: () => void;
}

export function SubscriptionsPlanEditor({
  draft,
  onDraftChange,
  mode,
  isDirty,
  isDefaultCodeLocked,
  saving,
  onSave,
  onDiscard,
  onToggleStatus,
}: PlanEditorProps) {
  const [newFeature, setNewFeature] = useState("");
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  const addFeature = () => {
    const value = newFeature.trim();
    if (!value) return;
    if (draft.features.includes(value)) {
      toast.error("Feature already added");
      return;
    }
    onDraftChange({ features: [...draft.features, value] });
    setNewFeature("");
  };

  const removeFeature = (feature: string) => {
    onDraftChange({
      features: draft.features.filter((item) => item !== feature),
    });
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isSaveCombo =
        (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s";
      if (!isSaveCombo) return;
      event.preventDefault();
      if (saving) return;
      void onSaveRef.current();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [saving]);

  return (
    <Card className="border border-border/60">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="text-base">
              {mode === "create" ? "Create Plan" : "Edit Plan"}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {mode === "create"
                ? "Build a new subscription tier with limits and features."
                : "Edit this plan. Changes in the preview update instantly."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isDirty && (
              <Badge
                variant="outline"
                className="text-amber-600 border-amber-300"
              >
                Unsaved changes
              </Badge>
            )}
            {mode === "edit" && (
              <Button
                size="sm"
                variant={draft.isActive ? "secondary" : "default"}
                className="gap-1.5"
                onClick={onToggleStatus}
                disabled={saving}
              >
                <Power className="w-3.5 h-3.5" />
                {draft.isActive ? "Deactivate" : "Activate"}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Plan Name" required>
            <Input
              value={draft.name}
              onChange={(e) => onDraftChange({ name: e.target.value })}
              placeholder="Growth"
            />
          </Field>
          <Field
            label="Plan Code"
            required
            hint={
              isDefaultCodeLocked
                ? "System default codes are locked for safety"
                : "Used in system mapping; lowercase and hyphenated"
            }
          >
            <Input
              value={draft.code}
              onChange={(e) =>
                onDraftChange({ code: e.target.value.toLowerCase() })
              }
              placeholder="growth"
              disabled={isDefaultCodeLocked}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Monthly Price" required>
            <Input
              type="number"
              min={0}
              value={draft.price}
              onChange={(e) => onDraftChange({ price: e.target.value })}
            />
          </Field>
          <Field label="Currency">
            <div className="h-10 px-3 rounded-md border border-border bg-muted/30 flex items-center text-sm font-medium">
              ETB
            </div>
          </Field>
          <Field label="Status">
            <div className="h-10 px-3 rounded-md border border-border bg-muted/30 flex items-center">
              <Badge variant={draft.isActive ? "default" : "secondary"}>
                {draft.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </Field>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Max Branches" required>
            <Input
              type="number"
              min={1}
              value={draft.maxBranches}
              onChange={(e) => onDraftChange({ maxBranches: e.target.value })}
            />
          </Field>
          <Field label="Max Users" required>
            <Input
              type="number"
              min={1}
              value={draft.maxUsers}
              onChange={(e) => onDraftChange({ maxUsers: e.target.value })}
            />
          </Field>
        </div>

        <Field label="Description">
          <Textarea
            rows={3}
            value={draft.description}
            onChange={(e) => onDraftChange({ description: e.target.value })}
            placeholder="Best for fast-growing pharmacies with multiple branches"
          />
        </Field>

        <Field label="Features" required>
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={newFeature}
                placeholder="Add feature and press Enter"
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addFeature();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addFeature}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {draft.features.length === 0 ? (
                <span className="text-xs text-muted-foreground">
                  No features yet.
                </span>
              ) : (
                draft.features.map((feature) => (
                  <Badge
                    key={feature}
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => removeFeature(feature)}
                  >
                    {feature} ×
                  </Badge>
                ))
              )}
            </div>
          </div>
        </Field>

        <div className="pt-2 border-t border-border/50 flex flex-wrap items-center justify-end gap-2">
          <Button
            variant="outline"
            onClick={onDiscard}
            disabled={!isDirty || saving}
          >
            Discard
          </Button>
          <Button onClick={onSave} disabled={saving} className="gap-2">
            {mode === "edit" && <Pencil className="w-4 h-4" />}
            {saving
              ? "Saving..."
              : mode === "create"
                ? "Create Plan"
                : "Save Changes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
