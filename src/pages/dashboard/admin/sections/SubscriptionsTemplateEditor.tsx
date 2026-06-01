import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { PlanDraft, TemplateRecord } from "./subscriptionTypes";
import { useTemplateEditor } from "./useTemplateEditor";

interface TemplateEditorProps {
  sessionToken: string | null;
  currentPlanDraft: PlanDraft;
  onApplyTemplate: (template: TemplateRecord) => void;
}

export function SubscriptionsTemplateEditor({
  sessionToken,
  currentPlanDraft,
  onApplyTemplate,
}: TemplateEditorProps) {
  const {
    allTemplates,
    selectedTemplateId,
    selectedTemplate,
    templateDraft,
    templateSaving,
    templateFeatureInput,
    setSelectedTemplateId,
    setTemplateFeatureInput,
    addTemplateFeature,
    removeTemplateFeature,
    saveTemplate,
    handleApplyTemplate,
    createTemplateFromCurrentDraft,
    removeTemplate,
    updateTemplateDraft,
  } = useTemplateEditor(sessionToken, currentPlanDraft, onApplyTemplate);

  return (
    <div className="border-t border-border/60 pt-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">Template Library</h4>
        <Button
          size="sm"
          variant="outline"
          className="h-8"
          onClick={createTemplateFromCurrentDraft}
        >
          From Draft
        </Button>
      </div>

      <div className="space-y-2 max-h-44 overflow-y-auto">
        {allTemplates.length === 0 ? (
          <div className="p-3 rounded-lg border border-dashed text-xs text-muted-foreground">
            No templates yet.
          </div>
        ) : (
          allTemplates.map((template) => {
            const selected = selectedTemplateId === template._id;
            return (
              <button
                key={template._id}
                type="button"
                onClick={() => setSelectedTemplateId(template._id)}
                className={cn(
                  "w-full text-left p-2.5 rounded-lg border transition-all",
                  selected
                    ? "border-primary bg-primary/5"
                    : "border-border/50 hover:border-border",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold truncate">
                    {template.name}
                  </p>
                  {template.isBuiltIn && (
                    <Badge variant="secondary" className="text-[10px]">
                      Built-in
                    </Badge>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>

      <div className="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-3">
        <p className="text-xs font-medium">Template Editor</p>
        <Input
          value={templateDraft.name}
          onChange={(e) => updateTemplateDraft({ name: e.target.value })}
          placeholder="Template name"
        />
        <Textarea
          rows={2}
          value={templateDraft.description}
          onChange={(e) => updateTemplateDraft({ description: e.target.value })}
          placeholder="Template description"
        />
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            min={0}
            value={templateDraft.price}
            onChange={(e) => updateTemplateDraft({ price: e.target.value })}
            placeholder="Price"
          />
          <div className="h-10 px-3 rounded-md border border-border bg-muted/30 flex items-center text-sm font-medium">
            ETB
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            min={1}
            value={templateDraft.maxBranches}
            onChange={(e) =>
              updateTemplateDraft({ maxBranches: e.target.value })
            }
            placeholder="Max branches"
          />
          <Input
            type="number"
            min={1}
            value={templateDraft.maxUsers}
            onChange={(e) => updateTemplateDraft({ maxUsers: e.target.value })}
            placeholder="Max users"
          />
        </div>
        <div className="flex gap-2">
          <Input
            value={templateFeatureInput}
            onChange={(e) => setTemplateFeatureInput(e.target.value)}
            placeholder="Add template feature"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTemplateFeature();
              }
            }}
          />
          <Button variant="outline" size="sm" onClick={addTemplateFeature}>
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {templateDraft.features.map((feature) => (
            <Badge
              key={feature}
              variant="outline"
              className="cursor-pointer text-[10px]"
              onClick={() => removeTemplateFeature(feature)}
            >
              {feature} ×
            </Badge>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button size="sm" variant="secondary" onClick={handleApplyTemplate}>
            Apply
          </Button>
          <Button size="sm" onClick={saveTemplate} disabled={templateSaving}>
            {templateSaving ? "Saving..." : "Save Template"}
          </Button>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="w-full"
          onClick={removeTemplate}
          disabled={!selectedTemplate || selectedTemplate.isBuiltIn}
        >
          Delete Template
        </Button>
      </div>
    </div>
  );
}
