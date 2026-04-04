import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import {
  Search,
  ArrowUpDown,
  DollarSign,
  CreditCard,
  Eye,
  Filter,
  ExternalLink,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface TransactionItem {
  medicineId: Id<"medicines">;
  medicineName?: string;
  quantity: number;
  unitPrice: number;
  price: number;
}

interface Transaction {
  _id: Id<"sales">;
  _creationTime: number;
  customerName?: string;
  customerPhone?: string;
  totalAmount: number;
  subtotal?: number;
  discount?: number;
  paymentMethod: string;
  cashierName?: string;
  referenceNumber?: string;
  items: TransactionItem[];
  status: string;
}

export function Transactions() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [filterType, setFilterType] = useState("all");
  const { sessionToken } = useAuth();

  const transactions =
    (useQuery(
      api.cashier.queries.getTransactions,
      sessionToken ? { sessionToken } : "skip",
    ) as Transaction[] | undefined) || [];

  const filteredTransactions = transactions.filter((t: Transaction) => {
    const matchesSearch =
      !searchQuery.trim() ||
      t._id?.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.customerName?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = filterType === "all" || t.status === filterType;

    return matchesSearch && matchesFilter;
  });

  const handleViewDetails = (transactionId: Id<"sales">) => {
    const found = transactions.find(
      (t: Transaction) => t._id === transactionId,
    );
    setSelectedTransaction(found || null);
  };

  const getTransactionTypeBadge = (status: string) => {
    const types: Record<string, { label: string; color: string }> = {
      completed: { label: "Completed", color: "bg-green-100 text-green-800" },
      pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
      cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800" },
      refunded: { label: "Refunded", color: "bg-orange-100 text-orange-800" },
    };
    const typeInfo = types[status] || {
      label: "Unknown",
      color: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`px-2 py-1 rounded text-xs font-medium ${typeInfo.color}`}
      >
        {typeInfo.label}
      </span>
    );
  };

  const getPaymentMethodBadge = (paymentMethod: string) => {
    const methods: Record<
      string,
      { label: string; icon: typeof DollarSign; color: string }
    > = {
      cash: {
        label: "Cash",
        icon: DollarSign,
        color: "bg-green-100 text-green-800",
      },
      card: {
        label: "Card",
        icon: CreditCard,
        color: "bg-blue-100 text-blue-800",
      },
      mobile: {
        label: "Mobile",
        icon: CreditCard,
        color: "bg-purple-100 text-purple-800",
      },
      bank_transfer: {
        label: "Bank Transfer",
        icon: CreditCard,
        color: "bg-orange-100 text-orange-800",
      },
    };
    const method = methods[paymentMethod] || {
      label: "Unknown",
      icon: CreditCard,
      color: "bg-gray-100 text-gray-800",
    };
    const Icon = method.icon;

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${method.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {method.label}
      </span>
    );
  };

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Transactions</h2>
        <p className="text-muted-foreground">
          View and manage all transactions
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="all">All Types</option>
                <option value="sale">Sales</option>
                <option value="return">Returns</option>
                <option value="refund">Refunds</option>
                <option value="payment">Payments</option>
              </select>
            </div>
          </div>
          <div className="mt-4 grid gap-2 md:grid-cols-3">
            <Button variant="outline" onClick={() => navigate("/cashier/pos")}>
              Open POS
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/cashier/receipts")}
            >
              Receipts
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/cashier/payments/pending")}
            >
              Pending Payments
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            All Transactions
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({filteredTransactions.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <ArrowUpDown className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No transactions found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTransactions.map((transaction: Transaction) => (
                <div
                  key={transaction._id}
                  className="rounded-lg border border-border/50 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <p className="font-medium break-all">
                        Transaction #{transaction._id}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.customerName || "Walk-in"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {transaction._creationTime
                          ? new Date(transaction._creationTime).toLocaleString()
                          : "N/A"}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold">
                        ETB {transaction.totalAmount?.toFixed(2)}
                      </p>
                      <div className="mt-1">
                        {getPaymentMethodBadge(transaction.paymentMethod)}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    {getTransactionTypeBadge(transaction.status)}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(transaction._id)}
                    >
                      <Eye className="h-4 w-4 mr-1" /> View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate("/cashier/receipts")}
                    >
                      <ExternalLink className="h-4 w-4 mr-1" /> Receipt
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedTransaction && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>
              Transaction Details - #{selectedTransaction._id}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Transaction Status
                  </p>
                  <p className="font-medium">
                    {getTransactionTypeBadge(selectedTransaction.status)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sale ID</p>
                  <p className="font-medium">
                    #{selectedTransaction._id || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {selectedTransaction._creationTime
                      ? new Date(
                          selectedTransaction._creationTime,
                        ).toLocaleString()
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-medium">
                    {selectedTransaction.customerName || "Walk-in"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-medium">
                    ETB {selectedTransaction.totalAmount?.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Payment Method
                  </p>
                  <p className="font-medium">
                    {getPaymentMethodBadge(selectedTransaction.paymentMethod)}
                  </p>
                </div>
                {selectedTransaction.referenceNumber && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Reference Number
                    </p>
                    <p className="font-medium">
                      {selectedTransaction.referenceNumber}
                    </p>
                  </div>
                )}
                {selectedTransaction.cashierName && (
                  <div>
                    <p className="text-sm text-muted-foreground">Cashier</p>
                    <p className="font-medium">
                      {selectedTransaction.cashierName}
                    </p>
                  </div>
                )}
              </div>

              {selectedTransaction.items &&
                selectedTransaction.items.length > 0 && (
                  <div className="pt-4 border-t">
                    <h4 className="font-semibold mb-3">Items</h4>
                    <div className="space-y-2">
                      {selectedTransaction.items.map(
                        (item: TransactionItem, index: number) => (
                          <div
                            key={index}
                            className="flex justify-between py-2 border-b last:border-0"
                          >
                            <span className="flex-1">
                              {item.medicineName || "Unknown"} x {item.quantity}
                            </span>
                            <span className="font-medium">
                              ETB {(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}

              <div className="flex justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedTransaction(null);
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
