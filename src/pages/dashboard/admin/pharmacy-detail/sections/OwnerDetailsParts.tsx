import { FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DetailSectionProps {
  title: string;
  icon: React.ElementType;
  data: Array<{ label: string; value: string }>;
}

export function DetailSection({ title, icon: Icon, data }: DetailSectionProps) {
  return (
    <Card className="border-2 border-border">
      <CardHeader>
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Icon className="h-4 w-4 text-[hsl(var(--medical-teal))]" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((item, idx) => (
            <div
              key={idx}
              className="flex justify-between items-start py-2 border-b border-border/50 last:border-0"
            >
              <span className="text-sm text-muted-foreground">
                {item.label}
              </span>
              <span className="text-sm font-medium text-right ml-4">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface SecurityCardProps {
  title: string;
  icon: React.ElementType;
  value: string;
  status: "active" | "warning" | "neutral";
}

export function SecurityCard({
  title,
  icon: Icon,
  value,
  status,
}: SecurityCardProps) {
  const statusConfig = {
    active: {
      bg: "bg-green-500/10",
      text: "text-green-600",
      border: "border-green-500/30",
    },
    warning: {
      bg: "bg-yellow-500/10",
      text: "text-yellow-600",
      border: "border-yellow-500/30",
    },
    neutral: {
      bg: "bg-muted/30",
      text: "text-muted-foreground",
      border: "border-border",
    },
  };

  const config = statusConfig[status];

  return (
    <Card
      className={`border-2 ${config.border} hover:border-[hsl(var(--medical-teal))]/30 transition-all duration-300`}
    >
      <CardContent className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className={`p-2 rounded-lg ${config.bg}`}>
            <Icon className={`h-5 w-5 ${config.text}`} />
          </div>
          <span className="text-sm font-medium">{title}</span>
        </div>
        <p className={`text-lg font-semibold ${config.text}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

export function DocumentItem({ label, date }: { label: string; date: string }) {
  return (
    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3">
        <FileText className="h-4 w-4 text-[hsl(var(--medical-teal))]" />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="text-right">
        <p className="text-xs text-muted-foreground">Uploaded</p>
        <p className="text-sm font-medium">{date}</p>
      </div>
    </div>
  );
}
