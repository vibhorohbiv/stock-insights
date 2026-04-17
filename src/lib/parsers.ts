import Papa from "papaparse";
import * as XLSX from "xlsx";
import { ParsedPortfolioRow } from "@/types";
import { normalizeSymbol } from "./utils";

function normalizeRow(raw: Record<string, string>): ParsedPortfolioRow | null {
  const keys = Object.keys(raw).map((k) => k.toLowerCase().trim());

  const get = (names: string[]): string => {
    for (const name of names) {
      const key = Object.keys(raw).find((k) => k.toLowerCase().trim() === name);
      if (key && raw[key]) return raw[key].toString().trim();
    }
    return "";
  };

  const symbol = normalizeSymbol(
    get(["symbol", "stock", "ticker", "scrip", "isin"])
  );
  const quantityStr = get(["quantity", "qty", "shares", "units"]);
  const buyPriceStr = get([
    "buy price",
    "buyprice",
    "purchase price",
    "avg price",
    "average price",
    "price",
  ]);
  const buyDate = get(["buy date", "buydate", "date", "purchase date"]);

  const quantity = parseFloat(quantityStr);
  const buyPrice = parseFloat(buyPriceStr.replace(/[₹,]/g, ""));

  if (!symbol || isNaN(quantity) || isNaN(buyPrice)) return null;

  return {
    symbol,
    quantity,
    buyPrice,
    buyDate: buyDate || new Date().toISOString().split("T")[0],
  };
}

export async function parseCSV(file: File): Promise<ParsedPortfolioRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data
          .map(normalizeRow)
          .filter((r): r is ParsedPortfolioRow => r !== null);
        resolve(rows);
      },
      error: (err) => reject(err),
    });
  });
}

export async function parseExcel(file: File): Promise<ParsedPortfolioRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, {
          raw: false,
        });
        const rows = json
          .map(normalizeRow)
          .filter((r): r is ParsedPortfolioRow => r !== null);
        resolve(rows);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

export async function parsePortfolioFile(
  file: File
): Promise<ParsedPortfolioRow[]> {
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "csv") return parseCSV(file);
  if (ext === "xls" || ext === "xlsx") return parseExcel(file);
  throw new Error(`Unsupported file type: ${ext}`);
}

export function generateSampleCSV(): string {
  return [
    "Symbol,Quantity,Buy Price,Buy Date",
    "RELIANCE,10,2450.00,2023-01-15",
    "TCS,5,3200.00,2023-03-20",
    "INFY,20,1450.50,2022-11-10",
    "HDFCBANK,8,1600.00,2023-06-05",
    "ICICIBANK,15,850.00,2023-02-28",
    "WIPRO,25,420.00,2022-08-15",
    "SBIN,30,520.00,2023-04-01",
    "BAJFINANCE,3,6800.00,2023-07-10",
    "ASIANPAINT,6,3100.00,2022-12-20",
    "TATAMOTORS,40,580.00,2023-09-05",
  ].join("\n");
}
