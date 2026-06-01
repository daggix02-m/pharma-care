import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Play,
  Square,
  DollarSign,
  History,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { Id } from "../../../../convex/_generated/dataModel";
import { useAuth } from "@/contexts/AuthContext";

interface Session {
  sessionId: Id<"users">;
  cashierName: string;
  startTime: number;
  endTime: number | null;
  totalSales: number;
  totalAmount: number;
  status: string;
  openingBalance: number;
  closingBalance: number;
  id: Id<"users">;
  cashier_name: string;
  cashier_id: Id<"users">;
  start_time: number;
  end_time: number | null;
  total_sales: number;
  opening_balance: number;
  closing_balance: number;
  created_at: number;
}

export function SessionManagement() {
  const [startingSession, setStartingSession] = useState(false);
  const [endingSession, setEndingSession] = useState(false);
  const [openingBalance, setOpeningBalance] = useState("0");
  const [closingBalance, setClosingBalance] = useState("");
  const [notes, setNotes] = useState("");

  // Fetch sessions from Convex
  const { sessionToken } = useAuth();
  const sessionData = useQuery(
    api.cashier.queries.getSessions,
    sessionToken ? { sessionToken } : "skip",
  ) as Session[] | undefined;
  const sessionLoading = sessionData === undefined;

  const activeSession = Array.isArray(sessionData)
    ? sessionData.find((s) => s.status === "active" || s.status === "open")
    : null;

  const startSessionMutation = useMutation(api.cashier.mutations.startSession);
  const endSessionMutation = useMutation(api.cashier.mutations.endSession);

  const handleStartSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setStartingSession(true);
    try {
      await startSessionMutation({});
      toast.success("Cashier session started");
    } catch (error: any) {
      toast.error(error.message || "Failed to start session");
    } finally {
      setStartingSession(false);
    }
  };

  const handleEndSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setEndingSession(true);
    try {
      await endSessionMutation({
        closingCash: parseFloat(closingBalance),
      });
      toast.success("Cashier session ended successfully");
      setClosingBalance("");
      setNotes("");
    } catch (error: any) {
      toast.error(error.message || "Failed to end session");
    } finally {
      setEndingSession(false);
    }
  };

  if (sessionLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-8 animate-fade-up">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Session Management
        </h2>
        <p className="text-muted-foreground mt-1">
          Start and end your daily cashier shift
        </p>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Active Session / Start Session */}
        <Card className="rounded-[2.5rem] border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <CardHeader
            className={`${activeSession ? "bg-emerald-600" : "bg-indigo-600"} text-white p-8`}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                {activeSession ? (
                  <CheckCircle2 className="w-8 h-8" />
                ) : (
                  <Play className="w-8 h-8" />
                )}
                {activeSession ? "Active Shift" : "New Shift"}
              </CardTitle>
              <Badge className="bg-white/20 text-white border-0 py-1 px-3 text-xs uppercase tracking-widest font-black">
                {activeSession ? "IN PROGRESS" : "READY"}
              </Badge>
            </div>
            <p className="mt-2 text-white/80 font-medium">
              {activeSession
                ? `Session started at ${new Date(activeSession.start_time || activeSession.created_at).toLocaleTimeString()}`
                : "Open a new session to begin processing sales"}
            </p>
          </CardHeader>
          <CardContent className="p-8 flex-1">
            {activeSession ? (
              <form onSubmit={handleEndSession} className="space-y-6">
                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      Opening Balance
                    </p>
                    <p className="text-2xl font-black text-slate-900">
                      ETB {activeSession.opening_balance?.toFixed(2)}
                    </p>
                  </div>
                  <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">
                      Current Sales
                    </p>
                    <p className="text-2xl font-black text-indigo-600">
                      ETB {(activeSession.total_sales || 0).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">
                      Expected Cash in Drawer
                    </Label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input
                        type="number"
                        value={closingBalance}
                        onChange={(e) => setClosingBalance(e.target.value)}
                        placeholder="Enter actual cash amount"
                        className="h-14 pl-12 rounded-2xl border-slate-200 text-lg font-bold"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">
                      Notes
                    </Label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any discrepancies or observations?"
                      className="w-full min-h-[100px] p-4 rounded-2xl border border-slate-200 bg-background text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={endingSession}
                  className="w-full h-14 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-widest"
                >
                  {endingSession ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    <Square className="w-5 h-5 mr-2" />
                  )}
                  End Shift & Reconcile
                </Button>
              </form>
            ) : (
              <form onSubmit={handleStartSession} className="space-y-8">
                <div className="p-8 bg-indigo-50 rounded-[2rem] border border-indigo-100 flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-indigo-600 shadow-sm">
                    <DollarSign className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">
                      Opening Cash
                    </h4>
                    <p className="text-sm text-slate-500">
                      Count the starting cash in your drawer
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">
                    Opening Balance (ETB)
                  </Label>
                  <Input
                    type="number"
                    value={openingBalance}
                    onChange={(e) => setOpeningBalance(e.target.value)}
                    className="h-16 text-center text-3xl font-black rounded-2xl border-slate-200 focus:ring-indigo-500/20"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={startingSession}
                  className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold uppercase tracking-widest"
                >
                  {startingSession ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    <Play className="w-5 h-5 mr-2" />
                  )}
                  Start Shift
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* History */}
        <div className="space-y-6">
          <Card className="rounded-[2.5rem] border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="pb-4 border-b border-slate-50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <History className="w-5 h-5 text-indigo-600" /> Shift
                    History
                  </CardTitle>
                  <CardDescription>
                    Your last few completed shifts
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-50">
                {Array.isArray(sessionData) &&
                  sessionData
                    .filter((s) => s.status !== "active")
                    .slice(0, 5)
                    .map((s, i) => (
                      <div
                        key={s.id || i}
                        className="p-6 hover:bg-slate-50/50 transition-colors group"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                              <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">
                                {new Date(
                                  s.start_time || s.created_at,
                                ).toLocaleDateString()}
                              </p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                {new Date(
                                  s.start_time || s.created_at,
                                ).toLocaleTimeString()}{" "}
                                -{" "}
                                {s.end_time
                                  ? new Date(s.end_time).toLocaleTimeString()
                                  : "N/A"}
                              </p>
                            </div>
                          </div>
                          <Badge className="bg-slate-100 text-slate-600 border-0 uppercase text-[9px] font-black tracking-tighter">
                            CLOSED
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-100/50">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                              Sales
                            </p>
                            <p className="text-sm font-bold text-slate-700">
                              ETB {s.total_sales?.toFixed(2)}
                            </p>
                          </div>
                          <div className="px-4 py-2 bg-indigo-50 rounded-xl border border-indigo-100/50">
                            <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-0.5">
                              Balance
                            </p>
                            <p className="text-sm font-bold text-indigo-600">
                              ETB {s.closing_balance?.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-slate-200 shadow-sm bg-indigo-600 text-white p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-lg mb-1">Shift Compliance</h4>
                <p className="text-sm text-white/80 leading-relaxed">
                  Always ensure your cash drawer matches the recorded
                  transactions. Reported discrepancies are audited daily by
                  management.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
