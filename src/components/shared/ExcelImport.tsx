import { useState, useRef } from "react";
import { FileSpreadsheet, AlertCircle, CheckCircle } from "lucide-react";

interface ExcelImportProps {
  onImport?: (data: any[]) => void;
}

export function ExcelImport({ onImport }: ExcelImportProps) {
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError("");
    setSuccess("");

    if (file) {
      if (
        file.type !==
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" &&
        file.type !== "application/vnd.ms-excel" &&
        !file.name.endsWith(".xlsx") &&
        !file.name.endsWith(".xls")
      ) {
        setError("Please upload a valid Excel file (.xlsx or .xls)");
        setFileName("");
        return;
      }
      setFileName(file.name);
      parseExcel(file);
    }
  };

  const parseExcel = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const result = e.target?.result;
        if (!result || typeof result === "string") {
          setError("Failed to read file.");
          return;
        }

        const ExcelJS = await import("exceljs");
        const data = new Uint8Array(result as ArrayBuffer);
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(data.buffer as ArrayBuffer);

        const worksheet = workbook.getWorksheet(1); // Get first worksheet
        if (!worksheet) {
          setError("The Excel file appears to be empty or invalid.");
          return;
        }

        // Convert worksheet to JSON
        const jsonData: any[] = [];
        let headers: any[] = [];

        worksheet.eachRow((row, rowNumber) => {
          const rowValues = row.values as any[]; // row.values is 1-indexed, so skip index 0
          if (rowNumber === 1) {
            // Use first row as headers
            headers = Array.from(rowValues).slice(1);
          } else {
            const rowData: any = {};
            headers.forEach((header: any, index: number) => {
              rowData[header] = rowValues[index + 1] || "";
            });
            jsonData.push(rowData);
          }
        });

        if (jsonData.length === 0) {
          setError("The Excel file appears to be empty.");
          return;
        }

        setSuccess(`Successfully parsed ${jsonData.length} rows.`);
        if (onImport) {
          onImport(jsonData);
        }
      } catch (err) {
        setError(
          "Failed to parse Excel file. Please ensure it is formatted correctly.",
        );
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <input
        type="file"
        accept=".xlsx, .xls"
        onChange={handleFileChange}
        className="hidden"
        ref={fileInputRef}
      />

      <div className="flex flex-col gap-4">
        <div
          className="border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={triggerFileInput}
        >
          <div className="bg-primary/10 p-4 rounded-full mb-4">
            <FileSpreadsheet className="h-8 w-8 text-primary" />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">
            {fileName || "Click to upload or drag and drop"}
          </p>
          <p className="text-xs text-muted-foreground">
            Excel files only (XLSX, XLS)
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
            <CheckCircle size={16} />
            {success}
          </div>
        )}
      </div>
    </div>
  );
}
