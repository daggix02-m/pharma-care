import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/ui";
import { Card } from "@/components/ui/card";
import type { Medicine } from "./types";

interface MedicineTableProps {
  medicines: Medicine[];
  onEdit: (medicine: Medicine) => void;
  onDelete: (medicine: Medicine) => void;
}

function StockBadge({ stock }: { stock: number }) {
  if (stock <= 10)
    return (
      <Badge variant="destructive" className="text-[10px] px-2">
        Low
      </Badge>
    );
  if (stock <= 20)
    return (
      <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[10px] px-2">
        Medium
      </Badge>
    );
  return (
    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[10px] px-2">
      Good
    </Badge>
  );
}

export function MedicineTable({
  medicines,
  onEdit,
  onDelete,
}: MedicineTableProps) {
  return (
    <Card className="minimal-card overflow-x-auto">
      <Table>
        <TableHeader className="bg-secondary/20">
          <TableRow>
            <TableHead className="py-4 font-bold text-[11px] uppercase tracking-widest pl-6">
              Medicine
            </TableHead>
            <TableHead className="py-4 font-bold text-[11px] uppercase tracking-widest">
              Category
            </TableHead>
            <TableHead className="py-4 font-bold text-[11px] uppercase tracking-widest">
              Stock
            </TableHead>
            <TableHead className="py-4 font-bold text-[11px] uppercase tracking-widest">
              Price
            </TableHead>
            <TableHead className="py-4 font-bold text-[11px] uppercase tracking-widest text-right pr-6">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {medicines.map((medicine) => (
            <TableRow
              key={medicine._id}
              className="hover:bg-secondary/5 transition-colors"
            >
              <TableCell className="py-4 pl-6 font-semibold">
                {medicine.name}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {medicine.category}
              </TableCell>
              <TableCell>
                <StockBadge stock={medicine.stock} />
              </TableCell>
              <TableCell className="font-mono text-[13px]">
                ETB {medicine.price}
              </TableCell>
              <TableCell className="text-right pr-6">
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg"
                    onClick={() => onEdit(medicine)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg text-destructive"
                    onClick={() => onDelete(medicine)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
