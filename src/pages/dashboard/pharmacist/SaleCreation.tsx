import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { toast } from "sonner";
import { ChapaPaymentModal } from "@/components/shared/ChapaPaymentModal";
import { Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  MedicineSearchList,
  CheckoutSidebar,
  type Medicine,
  type CartItem,
} from "./SaleCreationParts";

interface PaymentData {
  transactionId: string;
  paymentMethod: string;
  referenceNumber: string;
}

export function SaleCreation() {
  const { sessionToken } = useAuth();
  const medicines =
    useQuery(
      api.pharmacist.queries.getMedicines,
      sessionToken ? { sessionToken } : "skip",
    ) || [];
  const loading = medicines === undefined;
  const createSaleMutation = useMutation(
    (api as any).pharmacist.mutations.createSale,
  );

  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [isChapaModalOpen, setIsChapaModalOpen] = useState(false);
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
  const [prescriptionId, setPrescriptionId] = useState("");

  const filteredMedicines = useMemo(() => {
    return (medicines as Medicine[]).filter(
      (m: Medicine) =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.barcode?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [medicines, searchQuery]);

  const addToCart = (medicine: Medicine) => {
    const existingItem = cart.find((item) => item.medicineId === medicine._id);
    const stock = medicine.stock;

    if (existingItem) {
      if (existingItem.quantity < stock) {
        setCart(
          cart.map((item) =>
            item.medicineId === medicine._id
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          ),
        );
      } else {
        toast.error("Insufficient stock");
      }
    } else {
      if (stock > 0) {
        setCart([
          ...cart,
          {
            medicineId: medicine._id,
            name: medicine.name,
            price: medicine.price,
            quantity: 1,
            maxQuantity: stock,
            prescriptionRequired: medicine.prescriptionRequired || false,
          },
        ]);
        toast.success(`${medicine.name} added to cart`);
      } else {
        toast.error("Item out of stock");
      }
    }
  };

  const updateCartQuantity = (medicineId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      setCart(cart.filter((item) => item.medicineId !== medicineId));
      return;
    }

    setCart(
      cart.map((item) =>
        item.medicineId === medicineId
          ? { ...item, quantity: newQuantity }
          : item,
      ),
    );
  };

  const removeFromCart = (medicineId: string) => {
    setCart(cart.filter((item) => item.medicineId !== medicineId));
  };

  const clearCart = () => {
    setCart([]);
    setPrescriptionFile(null);
    setPrescriptionId("");
    setCustomerName("");
    setCustomerPhone("");
  };

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart],
  );
  const requiresPrescription = useMemo(
    () => cart.some((item) => item.prescriptionRequired),
    [cart],
  );

  const handleCreateSale = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    if (requiresPrescription && !prescriptionFile && !prescriptionId) {
      toast.error("Prescription required for controlled substances");
      return;
    }

    if (paymentMethod === "chapa") {
      setIsChapaModalOpen(true);
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await createSaleMutation({
        items: cart.map((item) => ({
          medicineId: item.medicineId,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: total,
        customerName: customerName || "Walk-in Customer",
        customerPhone: customerPhone || undefined,
        paymentMethod,
        prescriptionId: prescriptionId || undefined,
      });

      if (res.success) {
        toast.success(`Sale completed successfully! ID: ${res.saleId}`);
        clearCart();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to complete sale");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChapaPaymentSuccess = async (paymentData: PaymentData) => {
    try {
      setIsSubmitting(true);
      const res = await createSaleMutation({
        items: cart.map((item) => ({
          medicineId: item.medicineId,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: total,
        customerName: customerName || "Walk-in Customer",
        customerPhone: customerPhone || undefined,
        paymentMethod: "chapa",
        prescriptionId: prescriptionId || undefined,
        chapaTransactionId: paymentData.transactionId,
        chapaPaymentMethod: paymentData.paymentMethod,
        chapaReference: paymentData.referenceNumber,
      });

      if (res.success) {
        toast.success(`Sale completed successfully! ID: ${res.saleId}`);
        setIsChapaModalOpen(false);
        clearCart();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to complete sale");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 p-4 md:p-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-black tracking-tight text-slate-900">
            Point of Sale
          </h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">
            Real-time Pharmacy Transaction Terminal
          </p>
        </div>
        <Button
          variant="outline"
          onClick={clearCart}
          disabled={cart.length === 0}
          className="rounded-2xl h-12 px-6 border-slate-200 hover:bg-slate-50 font-black uppercase text-[10px]"
        >
          <Trash2 className="w-4 h-4 mr-2" /> Reset Terminal
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <MedicineSearchList
          loading={loading}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filteredMedicines={filteredMedicines as Medicine[]}
          onAddToCart={addToCart as (m: Medicine) => void}
        />

        <CheckoutSidebar
          cart={cart}
          total={total}
          requiresPrescription={requiresPrescription}
          customerName={customerName}
          paymentMethod={paymentMethod}
          prescriptionId={prescriptionId}
          onUpdateQuantity={updateCartQuantity}
          onRemoveFromCart={removeFromCart}
          onCustomerNameChange={setCustomerName}
          onPaymentMethodChange={setPaymentMethod}
          onPrescriptionIdChange={setPrescriptionId}
          onSubmit={handleCreateSale}
          isSubmitting={isSubmitting}
        />
      </div>

      <ChapaPaymentModal
        open={isChapaModalOpen}
        onClose={() => setIsChapaModalOpen(false)}
        amount={total}
        onSuccess={handleChapaPaymentSuccess}
      />
    </div>
  );
}
