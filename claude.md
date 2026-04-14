You are a senior full-stack engineer and product designer.

Build a modern, production-ready stock portfolio analysis and prediction web application focused on the Indian stock market (NSE/BSE).

## 🧠 Core Goal
Create a platform where users can upload their portfolio (CSV/XLS/XLSX), and the system analyzes their holdings and provides:
- Current valuation
- Profit/Loss
- Portfolio allocation
- Risk insights
- Future predictions (basic ML/statistical models)

---

## ⚙️ Tech Stack
- Next.js (App Router)
- TypeScript
- Tailwind CSS (with a premium, modern theme)
- ShadCN/UI or similar component system
- Charting: Recharts or Tremor
- Backend: Next.js API routes (or server actions)
- Data fetching: TanStack Query
- File parsing: Papaparse (CSV), SheetJS (XLS/XLSX)

---

## 📊 Data Integration (IMPORTANT)
Integrate with Indian stock APIs:
- NSE India (via unofficial APIs or scraping layer)
- Optionally: Alpha Vantage / Twelve Data / Yahoo Finance (fallback)
- Create an abstraction layer:
  - `getStockQuote(symbol)`
  - `getHistoricalData(symbol)`
  - `getMarketNews(symbol)`
  - `getSectorPerformance()`

Handle:
- Rate limiting
- API fallbacks
- Caching (Redis or in-memory)

---

## 📂 File Upload Feature
Users upload CSV/XLS like:

Symbol | Quantity | Buy Price | Buy Date

Parse and normalize:
- Map stock symbols to NSE format
- Validate incorrect entries
- Show preview before processing

---

## 📈 Dashboard Features

### 1. Portfolio Overview
- Total investment
- Current value
- Total P&L (absolute + %)
- Day change

### 2. Allocation Charts
- Sector allocation
- Stock distribution
- Pie + bar charts

### 3. Individual Stock Cards
- Current price
- Gain/loss
- Mini sparkline chart

### 4. Performance Charts
- Portfolio growth over time
- Comparison with NIFTY 50 benchmark

---

## 🔮 Prediction & Insights (Differentiator)
Add simple but useful intelligence:

- Moving averages (50 DMA, 200 DMA)
- RSI indicator
- Volatility score
- Risk classification (Low / Medium / High)
- Basic prediction:
  - Linear regression OR time-series trend
  - Show "Projected Trend" (not financial advice)

---

## 🧠 Smart Insights (IMPORTANT ADDITION)
Generate insights like:
- "Overexposed to IT sector (45%)"
- "High dependency on top 2 stocks"
- "Portfolio volatility is high"
- "Consider diversification"

---

## 🎨 UI/UX (VERY IMPORTANT)
- Dark premium theme (default)
- Glassmorphism + subtle gradients
- Clean dashboard layout
- Smooth animations (Framer Motion)
- Responsive design

Pages:
- Landing page (marketing style)
- Upload page
- Dashboard page
- Stock detail page

---

## 🔐 Optional (Bonus)
- Auth (Clerk / NextAuth)
- Save multiple portfolios
- Export reports (PDF)
- Watchlist feature

---

## 🧩 Architecture
- Modular folder structure
- Hooks for data fetching
- Services layer for APIs
- Reusable UI components
- Clean separation of concerns

---

## ⚡ Performance
- Server-side rendering where needed
- Lazy loading charts
- Debounced API calls

---

## 🧪 Edge Cases
- Invalid symbols
- Missing prices
- API failures
- Large file uploads

---

## 📦 Output Expectation
- Full folder structure
- Key components implemented
- Sample API integration
- Sample CSV parsing logic
- Example charts
- Clean, readable, scalable code

---

## ✨ Extra Credit (If possible)
- Add AI-powered commentary:
  "Your portfolio is moderately risky with strong IT exposure and underweight in FMCG."

---

IMPORTANT:
Focus on clean UI, scalable architecture, and realistic stock data handling.
Avoid fake/mock implementations unless clearly marked.
