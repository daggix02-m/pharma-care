import type { EscalationOption } from "@/services/ai.service";
import { Button } from "@/components/ui/button";
import { Phone, Mail, AlertTriangle, X } from "lucide-react";

interface EscalationPanelProps {
  onEscalation: (escalation: EscalationOption) => void;
  onClose: () => void;
}

export function EscalationPanel({
  onEscalation,
  onClose,
}: EscalationPanelProps) {
  const escalationOptions: EscalationOption[] = [
    {
      type: "phone",
      label: "Phone Support",
      description: "Speak with a representative immediately",
    },
    {
      type: "email",
      label: "Email Support",
      description: "Send a detailed inquiry via email",
    },
    {
      type: "complaint",
      label: "File a Complaint",
      description: "Submit a formal complaint with tracking",
    },
  ];

  return (
    <div className="px-4 py-3 bg-amber-50/50 border-b border-amber-200">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-amber-900 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Escalation Options
        </h4>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-6 w-6"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {escalationOptions.map((option) => (
          <button
            key={option.type}
            onClick={() => onEscalation(option)}
            className="flex items-center gap-3 p-2.5 bg-white rounded-lg border border-amber-200 hover:bg-amber-50 transition-colors text-left"
          >
            {option.type === "phone" && (
              <Phone className="h-4 w-4 text-amber-600" />
            )}
            {option.type === "email" && (
              <Mail className="h-4 w-4 text-amber-600" />
            )}
            {option.type === "complaint" && (
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            )}
            <div>
              <p className="text-sm font-medium text-amber-900">
                {option.label}
              </p>
              <p className="text-xs text-amber-700">{option.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
