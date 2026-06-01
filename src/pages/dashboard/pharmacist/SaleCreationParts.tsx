import { Id } from "../../../../convex/_generated/dataModel";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Loader2,
  AlertCircle,
  History,
  Search,
  Package,
  Zap,
} from "lucide-react";
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

interface Medicine {
  _id: Id<"medicines">;
  _creationTime: number;
  branchId: Id<"branches">;
  name: string;
  category: string;
  stock: number;
  price: number;
  minStock?: number;
  type?: string;
  manufacturer?: string;
  barcode?: string;
  expiryDate?: number;
  status?: string;
  genericName?: string;
  prescriptionRequired?: boolean;
}

interface CartItem {
  medicineId: string;
  name: string;
  price: number;
  quantity: number;
  maxQuantity: number;
  prescriptionRequired: boolean;
}

interface MedicineSearchListProps {
  loading: boolean;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filteredMedicines: Medicine[];
  onAddToCart: (medicine: Medicine) => void;
}

export function MedicineSearchList({
  loading,
  searchQuery,
  onSearchChange,
  filteredMedicines,
  onAddToCart,
}: MedicineSearchListProps) {
  return (
    <Card className="lg:col-span-2 rounded-[2.5rem] border-slate-100 shadow-sm overflow-hidden min-h-[700px] flex flex-col">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <CardTitle className="text-xl font-black">
              Substance Inventory
            </CardTitle>
            <CardDescription className="text-xs font-bold text-slate-400 mt-1 uppercase">
              Select items for transaction
            </CardDescription>
          </div>
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
            <Input
              placeholder="Search name or barcode..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-12 h-14 rounded-2xl border-slate-100 bg-white shadow-inner focus-visible:ring-indigo-600 focus:bg-white text-lg font-medium"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
          </div>
        ) : filteredMedicines.length === 0 ? (
          <div className="text-center py-40">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Package className="h-10 w-10 text-slate-200" />
            </div>
            <p className="font-black text-slate-400 uppercase tracking-widest">
              No matching units detected
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {filteredMedicines.map((m: Medicine) => (
              <div
                key={m._id}
                className="flex items-center justify-between p-6 hover:bg-indigo-50/30 transition-all group cursor-pointer border-l-4 border-transparent hover:border-indigo-600"
                onClick={() => onAddToCart(m)}
              >
                <div className="flex items-center gap-6 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:scale-110">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-slate-900 text-lg truncate">
                      {m.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="secondary"
                        className={`text-[9px] uppercase px-2 py-0.5 rounded-lg font-black border-none ${m.stock > 10 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}
                      >
                        AVAIL: {m.stock}
                      </Badge>
                      {m.prescriptionRequired && (
                        <Badge className="bg-amber-50 text-amber-600 border-amber-100 text-[9px] uppercase px-2 py-0.5 rounded-lg font-black">
                          RX REQ
                        </Badge>
                      )}
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                        {m.category}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right flex items-center gap-8">
                  <div className="flex flex-col">
                    <p className="font-black text-slate-900 text-xl">
                      ETB {m.price.toFixed(2)}
                    </p>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      Unit Price
                    </span>
                  </div>
                  <Button
                    size="icon"
                    className="h-12 w-12 rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all"
                  >
                    <Plus className="h-6 w-6" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface CheckoutSidebarProps {
  cart: CartItem[];
  total: number;
  requiresPrescription: boolean;
  customerName: string;
  paymentMethod: string;
  prescriptionId: string;
  onUpdateQuantity: (medicineId: string, quantity: number) => void;
  onRemoveFromCart: (medicineId: string) => void;
  onCustomerNameChange: (value: string) => void;
  onPaymentMethodChange: (value: string) => void;
  onPrescriptionIdChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

export function CheckoutSidebar({
  cart,
  total,
  requiresPrescription,
  customerName,
  paymentMethod,
  prescriptionId,
  onUpdateQuantity,
  onRemoveFromCart,
  onCustomerNameChange,
  onPaymentMethodChange,
  onPrescriptionIdChange,
  onSubmit,
  isSubmitting,
}: CheckoutSidebarProps) {
  return (
    <div className="space-y-8">
      <Card className="rounded-[2.5rem] border-none shadow-xl overflow-hidden flex flex-col h-full bg-slate-900 text-white">
        <CardHeader className="bg-slate-800/50 p-8 border-b border-white/5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-black flex items-center gap-3">
              <ShoppingCart className="h-6 w-6 text-indigo-400" /> ACTIVE
              TERMINAL
            </CardTitle>
            <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30 px-3 py-1 font-black text-[10px]">
              {cart.length} UNITS
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0 flex-1 flex flex-col">
          <div className="flex-1 max-h-[400px] overflow-y-auto divide-y divide-white/5">
            {cart.length === 0 ? (
              <div className="text-center py-20 opacity-30">
                <ShoppingCart className="h-16 w-16 mx-auto mb-4" />
                <p className="font-black uppercase tracking-widest text-xs">
                  Terminal Standby
                </p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.medicineId}
                  className="p-6 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="min-w-0">
                      <p className="font-black text-white text-md truncate">
                        {item.name}
                      </p>
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">
                        @ ETB {item.price.toFixed(2)}
                      </p>
                    </div>
                    <p className="font-black text-indigo-400">
                      ETB {(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center bg-white/5 rounded-xl p-1 gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg hover:bg-white/10 text-white"
                        onClick={() =>
                          onUpdateQuantity(item.medicineId, item.quantity - 1)
                        }
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-10 text-center text-sm font-black">
                        {item.quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg hover:bg-white/10 text-white"
                        onClick={() =>
                          onUpdateQuantity(item.medicineId, item.quantity + 1)
                        }
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveFromCart(item.medicineId)}
                      className="h-10 w-10 p-0 text-white/20 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-10 bg-indigo-600/10 border-t border-white/5 space-y-4">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
              <span>Internal Subtotal</span>
              <span>ETB {total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-sm font-black uppercase tracking-widest text-white/60">
                Grand Total
              </span>
              <span className="text-4xl font-black text-indigo-400 leading-none">
                ETB {total.toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[2.5rem] border-slate-100 shadow-sm overflow-hidden">
        <CardHeader className="p-8 border-b border-slate-50">
          <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400">
            Transaction Authorization
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="customer_name"
                className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1"
              >
                Customer Identifier
              </Label>
              <Input
                id="customer_name"
                placeholder="FULL NAME"
                value={customerName}
                onChange={(e) => onCustomerNameChange(e.target.value)}
                className="rounded-2xl h-14 border-slate-100 bg-slate-50/50 font-bold uppercase tracking-tight"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="payment_method"
                className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1"
              >
                Settlement Mode
              </Label>
              <select
                id="payment_method"
                value={paymentMethod}
                onChange={(e) => onPaymentMethodChange(e.target.value)}
                className="flex h-14 w-full rounded-2xl border border-slate-100 bg-slate-50/50 px-4 py-2 text-sm font-black uppercase tracking-widest focus:ring-2 focus:ring-indigo-600/20 appearance-none"
              >
                <option value="cash">Physical Cash</option>
                <option value="card">Digital Card</option>
                <option value="mobile">Mobile Commerce</option>
                <option value="chapa">Chapa Payment</option>
              </select>
            </div>
          </div>

          {requiresPrescription && (
            <div className="pt-2 animate-in slide-in-from-bottom-5">
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-3xl flex gap-4">
                <AlertCircle className="w-6 h-6 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-black text-rose-700 uppercase tracking-widest">
                    Controlled Substance Regulation
                  </p>
                  <p className="text-[10px] text-rose-600 mt-1 font-bold leading-relaxed">
                    System requires valid Prescription ID for these units.
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                  Verification ID / Scan
                </Label>
                <div className="relative">
                  <Input
                    placeholder="RX-SERIAL-NUMBER"
                    value={prescriptionId}
                    onChange={(e) => onPrescriptionIdChange(e.target.value)}
                    className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 text-center font-black text-xs uppercase tracking-widest focus:ring-rose-500/20"
                  />
                </div>
              </div>
            </div>
          )}

          <Button
            onClick={onSubmit}
            disabled={cart.length === 0 || isSubmitting}
            className="w-full h-20 rounded-[2rem] bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-[0.2em] transition-all transform hover:-translate-y-1 active:scale-95 text-lg"
          >
            {isSubmitting ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : (
              <>
                Authorize Sale <History className="w-6 h-6 ml-4" />
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export type { Medicine, CartItem };
