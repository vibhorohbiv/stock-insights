import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";
import { Navbar } from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "StockInsights — Indian Portfolio Analyzer",
  description:
    "Analyze your NSE/BSE portfolio with AI-powered insights, real-time quotes, and smart predictions.",
  keywords: ["stock portfolio", "NSE", "BSE", "India", "portfolio tracker"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>
        <Providers>
          <Navbar />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
