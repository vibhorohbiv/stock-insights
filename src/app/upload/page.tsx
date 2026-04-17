"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, X, CheckCircle, AlertCircle, Download, ArrowRight } from "lucide-react";
import { parsePortfolioFile, generateSampleCSV } from "@/lib/parsers";
import { ParsedPortfolioRow } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function UploadPage() {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsed, setParsed] = useState<ParsedPortfolioRow[] | null>(null);
  const [fileName, setFileName] = useState("");

  const processFile = useCallback(async (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["csv", "xls", "xlsx"].includes(ext ?? "")) {
      setError("Only CSV, XLS, and XLSX files are supported.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setFileName(file.name);

    try {
      const rows = await parsePortfolioFile(file);
      if (rows.length === 0) {
        setError("No valid holdings found. Check your file format.");
        return;
      }
      setParsed(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse file.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const onFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleAnalyze = () => {
    if (!parsed) return;
    localStorage.setItem("stock_insights_portfolio", JSON.stringify(parsed));
    router.push("/dashboard");
  };

  const downloadSample = () => {
    const csv = generateSampleCSV();
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample_portfolio.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-3">
            Upload Your <span className="gradient-text">Portfolio</span>
          </h1>
          <p className="text-muted-foreground">
            Import your stock holdings from any Indian broker in CSV or Excel format.
          </p>
        </div>

        {/* Upload Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          className={cn(
            "relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200",
            isDragging
              ? "border-primary bg-primary/10 scale-[1.01]"
              : "border-border hover:border-primary/50 hover:bg-card/50",
            parsed ? "bg-emerald-500/5 border-emerald-500/40" : ""
          )}
        >
          <input
            type="file"
            accept=".csv,.xls,.xlsx"
            onChange={onFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          {isLoading ? (
            <div className="space-y-3">
              <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-muted-foreground">Parsing your portfolio...</p>
            </div>
          ) : parsed ? (
            <div className="space-y-3">
              <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
              <p className="font-semibold text-foreground">
                {parsed.length} holdings loaded from{" "}
                <span className="text-primary">{fileName}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Drop a new file to replace, or proceed to analysis
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-lg">
                  Drop your portfolio file here
                </p>
                <p className="text-muted-foreground text-sm mt-1">
                  or click to browse — CSV, XLS, XLSX supported
                </p>
              </div>
              <div className="flex items-center gap-4 justify-center text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <FileText className="w-3 h-3" /> CSV
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="w-3 h-3" /> XLS
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="w-3 h-3" /> XLSX
                </span>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Preview Table */}
        {parsed && parsed.length > 0 && (
          <div className="mt-6 glass-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
              <span className="text-sm font-medium">Preview ({parsed.length} holdings)</span>
              <button
                onClick={() => { setParsed(null); setFileName(""); }}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Symbol</th>
                    <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">Qty</th>
                    <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">Buy Price</th>
                    <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">Invested</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Buy Date</th>
                  </tr>
                </thead>
                <tbody>
                  {parsed.slice(0, 10).map((row, i) => (
                    <tr key={i} className="border-b border-border/30 hover:bg-secondary/30">
                      <td className="px-4 py-2.5 font-semibold text-primary">{row.symbol}</td>
                      <td className="px-4 py-2.5 text-right text-foreground">{row.quantity}</td>
                      <td className="px-4 py-2.5 text-right text-foreground">{formatCurrency(row.buyPrice)}</td>
                      <td className="px-4 py-2.5 text-right text-foreground">
                        {formatCurrency(row.quantity * row.buyPrice)}
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">{row.buyDate}</td>
                    </tr>
                  ))}
                  {parsed.length > 10 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-2.5 text-center text-xs text-muted-foreground">
                        + {parsed.length - 10} more holdings
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={downloadSample}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-border hover:bg-secondary text-sm font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            Download Sample CSV
          </button>

          {parsed && (
            <button
              onClick={handleAnalyze}
              className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-2.5 rounded-xl transition-all hover:scale-105 shadow-lg shadow-primary/25 ml-auto"
            >
              Analyze Portfolio
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Format Guide */}
        <div className="mt-8 glass-card p-5">
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">
            Expected Format
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground">
                  <th className="text-left py-1 pr-6">Symbol</th>
                  <th className="text-right py-1 pr-6">Quantity</th>
                  <th className="text-right py-1 pr-6">Buy Price</th>
                  <th className="text-left py-1">Buy Date</th>
                </tr>
              </thead>
              <tbody className="text-foreground">
                {[
                  ["RELIANCE", "10", "2450.00", "2023-01-15"],
                  ["TCS", "5", "3200.00", "2023-03-20"],
                  ["INFY", "20", "1450.50", "2022-11-10"],
                ].map((row, i) => (
                  <tr key={i} className="border-t border-border/30">
                    <td className="py-1 pr-6 font-medium text-primary">{row[0]}</td>
                    <td className="py-1 pr-6 text-right">{row[1]}</td>
                    <td className="py-1 pr-6 text-right">{row[2]}</td>
                    <td className="py-1">{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Column names are flexible — we auto-detect &quot;Stock&quot;, &quot;Ticker&quot;, &quot;Qty&quot;, &quot;Price&quot;, etc.
          </p>
        </div>
      </div>
    </div>
  );
}
