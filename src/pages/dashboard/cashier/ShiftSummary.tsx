import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Clock,
  Loader2,
  FileText,
  ArrowUpRight,
  User,
  Building2,
  Download,
} from "lucide-react";

interface Category {
  name: string;
  value: number;
}

interface ShiftSummaryData {
  total_sales?: number;
  transaction_count?: number;
  average_sale?: number;
  duration?: string;
  cash_sales?: number;
  card_sales?: number;
  mobile_sales?: number;
  categories?: Category[];
  cashier_name?: string;
  cashier_id?: string;
  branch_name?: string;
  start_time?: number;
}

export function ShiftSummary() {
  const { sessionToken } = useAuth();
  const summary = useQuery(
    api.cashier.queries.getShiftSummary,
    sessionToken ? { sessionToken } : "skip",
  ) as ShiftSummaryData | undefined;

  const isLoading = summary === undefined;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const metrics = [
    {
      label: "Total Sales",
      value: `ETB ${(summary.total_sales || 0).toFixed(2)}`,
      icon: DollarSign,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Transactions",
      value: summary.transaction_count || 0,
      icon: ShoppingCart,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Avg Sale",
      value: `ETB ${(summary.average_sale || 0).toFixed(2)}`,
      icon: TrendingUp,
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      label: "Shift Time",
      value: summary.duration || "0h 0m",
      icon: Clock,
      color: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <div className="space-y-6 p-4 md:p-8 animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Shift Summary</h2>
          <p className="text-muted-foreground mt-1">
            Real-time performance metrics for your current session
          </p>
        </div>
        <Button variant="outline" className="rounded-xl h-11 border-slate-200">
          <Download className="w-4 h-4 mr-2" /> Export Report
        </Button>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m, i) => (
          <Card
            key={i}
            className="rounded-[2rem] border-slate-200 shadow-sm overflow-hidden group hover:shadow-md transition-all"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-2xl ${m.color} flex items-center justify-center transition-transform group-hover:scale-110`}
                >
                  <m.icon className="w-6 h-6" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-300" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  {m.label}
                </p>
                <p className="text-2xl font-black text-slate-900">{m.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <Card className="lg:col-span-2 rounded-[2.5rem] border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-indigo-600" /> Sales
                  Breakdown
                </CardTitle>
                <CardDescription>
                  Performance by payment method and category
                </CardDescription>
              </div>
              <Badge className="bg-indigo-100 text-indigo-700 border-0 py-1 px-3">
                Live Updates
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-8">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
                  By Payment Method
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">
                      Cash
                    </p>
                    <p className="text-lg font-black text-slate-900">
                      ETB {(summary.cash_sales || 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">
                      Card
                    </p>
                    <p className="text-lg font-black text-slate-900">
                      ETB {(summary.card_sales || 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">
                      Mobile
                    </p>
                    <p className="text-lg font-black text-slate-900">
                      ETB {(summary.mobile_sales || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
                  Product Category Mix
                </h4>
                <div className="space-y-4">
                  {(
                    summary?.categories || [
                      { name: "Prescription", value: 45 },
                      { name: "OTC Medicines", value: 30 },
                      { name: "Supplements", value: 15 },
                      { name: "Others", value: 10 },
                    ]
                  ).map((cat: Category, i: number) => (
                    <div key={i} className="space-y-1.5">
                      <div className="flex justify-between text-sm font-medium">
                        <span className="text-slate-700">{cat.name}</span>
                        <span className="text-slate-400">{cat.value}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                          style={{ width: `${cat.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-[2.5rem] border-slate-200 shadow-sm overflow-hidden bg-slate-900 text-white">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-400" /> Cashier Info
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-2xl font-bold">
                  {(summary.cashier_name || "C")[0]}
                </div>
                <div>
                  <p className="text-xl font-bold">
                    {summary.cashier_name || "Current Cashier"}
                  </p>
                  <p className="text-xs text-indigo-300 font-medium">
                    Staff ID: PC-
                    {String(summary.cashier_id || "000").padStart(4, "0")}
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-white/10">
                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4 text-indigo-400" />
                  <div>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                      Branch
                    </p>
                    <p className="text-sm font-medium">
                      {summary.branch_name || "Main Branch"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  <div>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                      Start Time
                    </p>
                    <p className="text-sm font-medium">
                      {summary.start_time
                        ? new Date(summary.start_time).toLocaleTimeString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2.5rem] border-slate-200 shadow-sm p-8 bg-indigo-50 border-indigo-100 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-indigo-600 shadow-sm mb-4">
              <FileText className="w-7 h-7" />
            </div>
            <h4 className="font-bold text-slate-900 mb-2">
              Need a printed report?
            </h4>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Generate a physical shift report for manual reconciliation and
              audit filing.
            </p>
            <Button className="w-full rounded-xl h-12 bg-white text-indigo-600 border-indigo-100 hover:bg-indigo-50 shadow-sm">
              Print Shift Report
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
