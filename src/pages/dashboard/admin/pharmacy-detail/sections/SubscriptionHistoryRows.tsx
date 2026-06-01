import { FileText, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PaymentRowProps {
  payment: {
    id: string;
    date: string;
    amount: number;
    status: string;
    method: string;
    invoice: string;
  };
}

export function PaymentRow({ payment }: PaymentRowProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex-1">
        <p className="text-sm font-medium">{payment.invoice}</p>
        <p className="text-xs text-muted-foreground">
          {new Date(payment.date).toLocaleDateString()}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-semibold">ETB {payment.amount}</p>
          <p className="text-xs text-muted-foreground">{payment.method}</p>
        </div>
        <Badge
          variant={payment.status === "paid" ? "default" : "destructive"}
          className="text-xs"
        >
          {payment.status}
        </Badge>
      </div>
    </div>
  );
}

export function InvoiceRow({ payment }: PaymentRowProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-[hsl(var(--medical-teal))]" />
          <p className="text-sm font-medium">{payment.invoice}</p>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {new Date(payment.date).toLocaleDateString()}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Badge
          variant={payment.status === "paid" ? "default" : "destructive"}
          className="text-xs"
        >
          {payment.status}
        </Badge>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-1" />
          PDF
        </Button>
      </div>
    </div>
  );
}

export type { PaymentRowProps };
