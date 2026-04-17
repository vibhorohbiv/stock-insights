import Link from "next/link";
import {
  TrendingUp,
  BarChart2,
  Shield,
  Zap,
  Upload,
  Brain,
  ArrowRight,
  ChevronRight,
} from "lucide-react";

const features = [
  {
    icon: Upload,
    title: "Upload CSV/XLS Portfolio",
    desc: "Import your holdings from any broker. We support ZERODHA, GROWW, ANGEL, IIFL and more.",
  },
  {
    icon: TrendingUp,
    title: "Real-Time NSE/BSE Quotes",
    desc: "Live prices from Indian markets with fallback data sources for maximum reliability.",
  },
  {
    icon: BarChart2,
    title: "Rich Analytics Dashboard",
    desc: "Sector allocation, P&L charts, NIFTY 50 benchmark comparison, and stock-level analysis.",
  },
  {
    icon: Brain,
    title: "AI-Powered Insights",
    desc: "Smart alerts like 'Overexposed to IT sector' or 'High concentration in top 2 stocks'.",
  },
  {
    icon: Zap,
    title: "Technical Indicators",
    desc: "50 DMA, 200 DMA, RSI, volatility score, and linear regression price projections.",
  },
  {
    icon: Shield,
    title: "Risk Classification",
    desc: "Portfolio-level risk scoring — Low, Medium, or High — based on volatility and concentration.",
  },
];

const stats = [
  { label: "NSE Stocks Supported", value: "2000+" },
  { label: "Data Sources", value: "3" },
  { label: "Avg Analysis Time", value: "<5s" },
  { label: "Charts & Indicators", value: "10+" },
];

export default function LandingPage() {
  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="relative min-h-[88vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/8 rounded-full blur-[120px]" />
          <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-purple-600/6 rounded-full blur-[80px]" />
          <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-pink-600/5 rounded-full blur-[80px]" />
        </div>

        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-primary text-sm font-medium mb-6">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          Indian Market Analytics — NSE & BSE
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight max-w-4xl">
          Analyze Your{" "}
          <span className="gradient-text">Stock Portfolio</span>
          <br />
          Like a Pro
        </h1>

        <p className="mt-6 text-lg text-muted-foreground max-w-2xl">
          Upload your portfolio CSV/XLS and get instant insights — real-time valuations, sector
          allocation, risk analysis, technical indicators, and AI-powered smart alerts. Built for
          Indian investors.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/upload"
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-3.5 rounded-xl transition-all hover:scale-105 shadow-lg shadow-primary/25"
          >
            <Upload className="w-5 h-5" />
            Upload Portfolio
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 text-foreground font-semibold px-8 py-3.5 rounded-xl transition-all border border-border"
          >
            <BarChart2 className="w-5 h-5" />
            View Demo Dashboard
          </Link>
        </div>

        {/* Stats bar */}
        <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl w-full">
          {stats.map((s) => (
            <div key={s.label} className="glass-card p-4 text-center">
              <div className="text-3xl font-extrabold gradient-text">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold">
            Everything you need to{" "}
            <span className="gradient-text">master your portfolio</span>
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            Built specifically for Indian retail investors with real NSE/BSE data integration.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="glass-card-hover p-6 group">
                <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center mb-4 group-hover:bg-primary/25 transition-colors">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="glass-card p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-purple-600/10 -z-0" />
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-3">Ready to analyze your portfolio?</h2>
            <p className="text-muted-foreground mb-8">
              It takes less than 30 seconds. Upload your CSV and get instant insights.
            </p>
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-3.5 rounded-xl transition-all hover:scale-105 shadow-lg shadow-primary/25"
            >
              Get Started Free
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            StockInsights — Built for Indian investors. Data from NSE/BSE via Yahoo Finance.
          </p>
          <p className="mt-1 text-xs opacity-60">
            Not SEBI registered. Not financial advice. Use at your own discretion.
          </p>
        </div>
      </footer>
    </div>
  );
}
