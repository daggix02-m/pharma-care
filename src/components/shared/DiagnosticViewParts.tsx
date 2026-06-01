import { AlertTriangle } from "lucide-react";

export function StartSessionForm({
  startReason,
  setStartReason,
}: {
  startReason: string;
  setStartReason: (value: string) => void;
}) {
  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Reason for Diagnostic Session
        </label>
        <textarea
          value={startReason}
          onChange={(e) => setStartReason(e.target.value)}
          placeholder="Explain why you're starting this diagnostic session..."
          rows={4}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
        />
      </div>

      <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
        <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-orange-900">
            Important Notice
          </p>
          <p className="text-xs text-orange-700 mt-1">
            This is a read-only diagnostic view. All actions will be logged and
            blocked. The user will be notified that an admin is viewing their
            session.
          </p>
        </div>
      </div>
    </div>
  );
}

export function SessionSummaryItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
}
