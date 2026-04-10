import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

export default function StockAnalysis() {
  const [symbol, setSymbol] = useState("");
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [topMovers, setTopMovers] = useState([]);

  const popularStocks = [
    { name: "Apple", symbol: "AAPL", color: "bg-pink-100" },
    { name: "Microsoft", symbol: "MSFT", color: "bg-blue-100" },
    { name: "Tesla", symbol: "TSLA", color: "bg-red-100" },
    { name: "Amazon", symbol: "AMZN", color: "bg-yellow-100" },
    { name: "Google", symbol: "GOOG", color: "bg-green-100" },
    { name: "Reliance", symbol: "RELIANCE.NS", color: "bg-purple-100" },
    { name: "Tata Motors", symbol: "TATAMOTORS.NS", color: "bg-orange-100" }
  ];

  const fetchStock = async (stockSymbol) => {
    const finalSymbol = stockSymbol || symbol;
    if (!finalSymbol.trim()) return;
    setLoading(true);
    setError("");
    setStockData(null);

    try {
      const res = await fetch(`/api/stock/${finalSymbol}`);
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setStockData(data);
      }
    } catch {
      setError("Failed to fetch stock data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function fetchMovers() {
      try {
        const movers = await Promise.all(
          ["AAPL", "MSFT", "TSLA", "AMZN", "GOOG"].map((sym) =>
            fetch(`/api/stock/${sym}`).then((r) => r.json())
          )
        );
        setTopMovers(movers.sort((a, b) => b.changePercent - a.changePercent));
      } catch {
        console.warn("Could not fetch movers");
      }
    }
    fetchMovers();
  }, []);

  const getPerformanceMessage = () => {
    if (!stockData?.changePercent) return "";
    if (stockData.changePercent > 0) {
      return `📈 The stock is up ${stockData.changePercent.toFixed(2)}% today — positive momentum.`;
    } else if (stockData.changePercent < 0) {
      return `📉 The stock is down ${Math.abs(stockData.changePercent).toFixed(2)}% today — be cautious.`;
    }
    return "No major change today.";
  };

  const getPERating = (pe) => {
    if (!pe) return { label: "N/A", color: "bg-gray-100", tip: "No P/E data available." };
    if (pe < 15) return { label: "Low (Value)", color: "bg-green-100", tip: "Might be undervalued." };
    if (pe <= 25) return { label: "Fair", color: "bg-yellow-100", tip: "Reasonably priced." };
    return { label: "High (Expensive)", color: "bg-red-100", tip: "Priced high vs. earnings." };
  };

  const getDividendInfo = (yieldPct) => {
    if (!yieldPct) return { label: "None", color: "bg-gray-100", tip: "No dividends paid." };
    if (yieldPct > 5) return { label: `${yieldPct}% (High)`, color: "bg-green-100", tip: "Strong income potential." };
    if (yieldPct >= 2) return { label: `${yieldPct}% (Moderate)`, color: "bg-yellow-100", tip: "Good steady income." };
    return { label: `${yieldPct}% (Low)`, color: "bg-orange-100", tip: "Small dividends." };
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-b from-[#fff8f3] to-[#fdf6f0] text-[#4b2e23]">
      <div className="max-w-6xl mx-auto">
        {!stockData && !loading && (
          <>
            <div className="text-center mb-10">
              <h1 className="text-5xl font-extrabold mb-3">Easy Stock Coach</h1>
              <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                No finance degree needed — type a stock or click below to get simple, clear insights.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5 mb-10">
              {popularStocks.map((s) => (
                <button
                  key={s.symbol}
                  onClick={() => fetchStock(s.symbol)}
                  className={`${s.color} px-4 py-6 rounded-xl shadow hover:scale-105 transition flex flex-col items-center`}
                >
                  <p className="text-xl font-bold">{s.name}</p>
                  <p className="text-gray-600">{s.symbol}</p>
                </button>
              ))}
            </div>

            {topMovers.length > 0 && (
              <div>
                <h2 className="font-bold mb-4 text-xl">🔥 Top Movers Today</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {topMovers.map((m) => (
                    <div
                      key={m.symbol}
                      className={`p-4 rounded-lg text-center font-semibold ${m.changePercent > 0 ? "bg-green-100" : "bg-red-100"
                        }`}
                    >
                      <p>{m.symbol}</p>
                      <p>{m.changePercent?.toFixed(2)}%</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <div className="flex justify-center gap-3 mb-8 mt-8">
          <input
            type="text"
            placeholder="Enter Stock Symbol (e.g. AAPL)"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="p-3 border rounded-lg w-72 shadow-md focus:ring-2 focus:ring-[#4b2e23] outline-none"
          />
          <button
            onClick={() => fetchStock()}
            className="bg-[#4b2e23] text-white px-6 py-2 rounded-lg hover:opacity-90 shadow-md"
          >
            Search
          </button>
        </div>

        {loading && <p className="text-center mt-4">📡 Fetching stock data...</p>}
        {error && <p className="text-center text-red-500 mt-4">{error}</p>}

        {stockData && (
          <div className="bg-white p-6 mt-6 rounded-xl shadow-lg space-y-6">
            <h2 className="text-3xl font-bold">
              {stockData.shortName} ({stockData.symbol})
            </h2>

            <div
              className={`p-4 rounded-lg ${stockData.changePercent > 0
                  ? "bg-green-100"
                  : stockData.changePercent < 0
                    ? "bg-red-100"
                    : "bg-gray-100"
                }`}
            >
              <p className="text-lg font-semibold">{getPerformanceMessage()}</p>
              <p>
                💵 Current Price: {stockData.currentPrice} {stockData.currency}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <MetricCard title="Day Range" value={`${stockData.dayLow} - ${stockData.dayHigh}`} note="Lowest & highest price today." />
              <MetricCard title="Market Cap" value={stockData.marketCap?.toLocaleString()} note="Total value of all shares." />
              {(() => {
                const pe = getPERating(stockData.peRatio);
                return <MetricCard title="P/E Ratio" value={pe.label} note={pe.tip} color={pe.color} />;
              })()}
              {(() => {
                const div = getDividendInfo(stockData.dividendYield);
                return <MetricCard title="Dividend Yield" value={div.label} note={div.tip} color={div.color} />;
              })()}
              <MetricCard title="Target Price" value={stockData.targetMeanPrice || "N/A"} note="Analyst projection." />
              <MetricCard title="Recommendation" value={stockData.recommendation || "N/A"} note="Buy / Hold / Sell." />
            </div>

            {stockData.history && (
              <div className="mt-6">
                <h3 className="font-bold mb-4 text-xl">📈 Price Trend (Last 30 Days)</h3>
                <Line
                  data={{
                    labels: stockData.history.map((h) => new Date(h.date).toLocaleDateString()),
                    datasets: [
                      {
                        label: "Closing Price",
                        data: stockData.history.map((h) => h.close),
                        borderColor: "#4b2e23",
                        backgroundColor: "#fdf6f0"
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    plugins: { legend: { display: false } }
                  }}
                />
                <p className="mt-2 text-gray-600">
                  {stockData.history[0].close < stockData.history.at(-1).close
                    ? "Trend is upward over the past month."
                    : "Trend is downward over the past month."}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({ title, value, note, color }) {
  return (
    <div className={`p-4 border rounded-lg shadow-sm ${color || ""}`}>
      <p className="font-bold">{title}</p>
      <p>{value}</p>
      <small className="text-gray-500">{note}</small>
    </div>
  );
}
