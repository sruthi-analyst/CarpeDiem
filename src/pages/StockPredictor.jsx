import React, { useState } from "react";
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

export default function StockPredictor() {
  const [symbol, setSymbol] = useState("");
  const [predictionData, setPredictionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const popularStocks = [
    { name: "Apple", symbol: "AAPL", color: "bg-pink-100" },
    { name: "Microsoft", symbol: "MSFT", color: "bg-blue-100" },
    { name: "TypeScript / Tata", symbol: "TATAMOTORS", color: "bg-orange-100" }
  ];

  const fetchPrediction = async (stockSymbol) => {
    const finalSymbol = stockSymbol || symbol;
    if (!finalSymbol.trim()) return;
    setLoading(true);
    setError("");
    setPredictionData(null);

    try {
      const res = await fetch(`http://localhost:3001/api/stock-predict/${finalSymbol}`);
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setPredictionData(data);
      }
    } catch {
      setError("Failed to fetch prediction data (Ensure Backend is running).");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-b from-[#fff8f3] to-[#fdf6f0] text-[#4b2e23]">
      <div className="max-w-6xl mx-auto">
        {!predictionData && !loading && (
          <>
            <div className="text-center mb-10">
              <h1 className="text-5xl font-extrabold mb-3">AI Stock Trend Predictor</h1>
              <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                Uses Machine Learning (Linear Regression & Moving Average) to predict stock prices for the next 5 days based on recent history.
              </p>
            </div>

            <div className="flex justify-center gap-4 mb-8">
              {popularStocks.map((s) => (
                <button
                  key={s.symbol}
                  onClick={() => fetchPrediction(s.symbol)}
                  className={`${s.color} px-6 py-4 rounded-xl shadow hover:scale-105 transition`}
                >
                  <span className="font-bold block">{s.name}</span>
                  <span className="text-gray-600 text-sm">{s.symbol}</span>
                </button>
              ))}
            </div>
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
            onClick={() => fetchPrediction()}
            className="bg-[#4b2e23] text-white px-6 py-2 rounded-lg hover:opacity-90 shadow-md transition"
          >
            Predict
          </button>
        </div>

        {loading && (
          <div className="text-center mt-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4b2e23] mx-auto mb-4"></div>
            <p className="font-semibold animate-pulse">Running ML Models...</p>
          </div>
        )}

        {error && <p className="text-center text-red-500 mt-4">{error}</p>}

        {predictionData && (
          <div className="bg-white p-8 mt-6 rounded-2xl shadow-xl space-y-6">
            <div className="border-b pb-6">
              <h2 className="text-4xl font-bold text-gray-800">
                Prediction for {predictionData.symbol}
              </h2>
              {/* {predictionData.isMock && (
                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded ml-2">Simulated Data</span>
              )} */}
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-6 bg-gray-50 rounded-xl shadow-inner border border-gray-100 text-center">
                <p className="text-gray-500 uppercase tracking-wide text-sm font-semibold mb-1">Current Price</p>
                <p className="text-3xl font-bold text-gray-900">{predictionData.currentPrice.toFixed(2)}</p>
              </div>
              <div className={`p-6 rounded-xl shadow-inner text-center ${predictionData.slope > 0 ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
                <p className="text-gray-500 uppercase tracking-wide text-sm font-semibold mb-1">Estimated Trend</p>
                <p className={`text-2xl font-bold ${predictionData.slope > 0 ? "text-green-700" : "text-red-700"}`}>{predictionData.trend}</p>
                <p className="text-xs mt-2 opacity-70">Slope: {predictionData.slope.toFixed(4)}</p>
              </div>
              <div className="p-6 bg-blue-50 border border-blue-200 rounded-xl shadow-inner text-center">
                <p className="text-gray-500 uppercase tracking-wide text-sm font-semibold mb-1">Day 5 Forecast</p>
                <p className="text-3xl font-bold text-blue-700">
                  {predictionData.predictions[4].predictedPrice.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="font-bold text-2xl text-gray-800 mb-6">📈 5-Day Forecast Chart</h3>
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 h-80">
                <Line
                  data={{
                    labels: ["Today", ...predictionData.predictions.map(p => new Date(p.date).toLocaleDateString())],
                    datasets: [
                      {
                        label: "Predicted Price",
                        data: [predictionData.currentPrice, ...predictionData.predictions.map((p) => p.predictedPrice)],
                        borderColor: predictionData.slope > 0 ? "#10b981" : "#ef4444", // green or red
                        backgroundColor: "#fdf6f0",
                        pointBackgroundColor: "#fdf6f0",
                        pointRadius: 6,
                        borderWidth: 3,
                        tension: 0.3
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        backgroundColor: '#1f2937',
                        padding: 12,
                        titleFont: { size: 14 },
                        bodyFont: { size: 14 }
                      }
                    },
                    scales: {
                      y: {
                        grid: { color: '#e5e7eb' },
                        ticks: { font: { size: 12 } }
                      },
                      x: {
                        grid: { display: false }
                      }
                    }
                  }}
                />
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl text-blue-800 text-sm flex items-start">
              <span className="text-xl mr-3">ℹ️</span>
              <p><strong>Disclaimer:</strong> This prediction is based on a simple combination of linear regression and moving average applied to historical data. It does not consider external market forces, news, or macroeconomic events. Do not use this as your sole tool for financial investments.</p>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
