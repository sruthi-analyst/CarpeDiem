import React, { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import Tesseract from "tesseract.js";
import * as pdfjsLib from "pdfjs-dist";
import { motion } from "framer-motion";
import { Upload, PlusCircle, TrendingUp, PieChart as PieIcon, FileText, RefreshCcw } from "lucide-react";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export default function Pricing() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pendingAmount, setPendingAmount] = useState(null);
  const [pendingText, setPendingText] = useState("");
  const [pendingCategory, setPendingCategory] = useState("Essentials");
  const [showConfirmForm, setShowConfirmForm] = useState(false);

  const COLORS = ["#4b2e23", "#F44336", "#2196F3", "#FFC107", "#9C27B0", "#00BCD4"];

  const budgetLimits = {
    Essentials: 10000,
    Discretionary: 5000,
    Investments: 7000,
    Debt: 4000,
    Savings: 8000,
    Misc: 2000
  };

  const categoryKeywords = {
    Essentials: ["grocery", "rent", "electricity", "water", "milk", "gas"],
    Discretionary: ["restaurant", "swiggy", "zomato", "movie", "shopping", "mall"],
    Investments: ["mutual fund", "stock", "equity", "sip", "investment"],
    Debt: ["loan", "emi", "credit card bill", "debt"],
    Savings: ["rd", "fd", "savings", "deposit"],
    Misc: []
  };

  const detectCategory = (desc) => {
    const lowerDesc = desc.toLowerCase();
    for (const [cat, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some((kw) => lowerDesc.includes(kw))) return cat;
    }
    return "Misc";
  };

  const fetchUPIExpenses = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/fetch-upi");
      const data = await res.json();
      const processed = data.map((item) => ({
        ...item,
        category: detectCategory(item.desc || "")
      }));
      setExpenses((prev) => [...prev, ...processed]);
    } catch (err) {
      console.error("UPI Fetch Error:", err);
    }
    setLoading(false);
  };

  const uploadReceipt = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    try {
      let text = "";
      if (file.type === "application/pdf") {
        const pdfData = await file.arrayBuffer();
        const pdfDoc = await pdfjsLib.getDocument({ data: pdfData }).promise;
        for (let i = 1; i <= pdfDoc.numPages; i++) {
          const page = await pdfDoc.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map((item) => item.str).join(" ") + " ";
        }
      } else {
        const result = await Tesseract.recognize(file, "eng");
        text = result.data.text;
      }
      processExtractedText(text);
    } catch (err) {
      console.error("Receipt Upload Error:", err);
    }
    setLoading(false);
  };

  const processExtractedText = (text) => {
    let amount = null;
    const lowerText = text.toLowerCase();
    const totalMatch = lowerText.match(/total\s*[:\-]?\s*(\d+(\.\d{1,2})?)/);
    if (totalMatch) {
      amount = parseFloat(totalMatch[1]);
    } else {
      const matches = text.match(/\d+(\.\d{1,2})?/g);
      if (matches) amount = Math.max(...matches.map(parseFloat));
    }
    if (amount) {
      setPendingAmount(amount);
      setPendingText("Receipt Purchase");
      setPendingCategory(detectCategory(text));
      setShowConfirmForm(true);
    } else {
      alert("Could not detect amount. Please enter manually.");
    }
  };

  const addExpense = (desc, amount, category) => {
    setExpenses((prev) => [...prev, { desc, amount, category, date: new Date().toISOString().split("T")[0] }]);
  };

  const dataForChart = Object.keys(budgetLimits).map((cat) => ({
    name: cat,
    value: expenses.filter((e) => e.category === cat).reduce((sum, e) => sum + e.amount, 0)
  }));

  const trendData = [];
  const groupedByDate = {};
  expenses.forEach((e) => {
    if (!groupedByDate[e.date]) groupedByDate[e.date] = 0;
    groupedByDate[e.date] += e.amount;
  });
  for (const [date, total] of Object.entries(groupedByDate)) {
    trendData.push({ date, total });
  }

  return (
    <div className="mx-auto min-w-screen bg-[#fdf6f0]">
    <div className="p-6 max-w-6xl mx-auto bg-[#fdf6f0] min-h-screen">
      <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold mb-6 text-[#4b2e23] flex items-center gap-2">
        💰 Smart Expense Tracker
      </motion.h1>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <button onClick={fetchUPIExpenses} className="flex items-center gap-2 bg-[#4b2e23] text-white px-5 py-2 rounded-lg shadow-md hover:scale-105 transition-transform">
          <RefreshCcw size={18} /> {loading ? "Fetching..." : "Connect UPI & Fetch"}
        </button>
        <label className="flex items-center gap-2 bg-[#4b2e23] text-white px-5 py-2 rounded-lg shadow-md cursor-pointer hover:scale-105 transition-transform">
          <Upload size={18} /> Upload Receipt
          <input type="file" accept="image/*,application/pdf" className="hidden" onChange={uploadReceipt} />
        </label>
      </div>

      {/* Confirm Form */}
      {showConfirmForm && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#fdf6f0] border border-[#4b2e23] p-4 rounded-xl shadow-md mb-6">
          <h2 className="text-lg font-semibold mb-3 text-[#4b2e23]">📥 Confirm Extracted Expense</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addExpense(pendingText, parseFloat(pendingAmount), pendingCategory);
              setShowConfirmForm(false);
            }}
            className="grid md:grid-cols-4 gap-3"
          >
            <input type="text" value={pendingText} onChange={(e) => setPendingText(e.target.value)} className="p-2 border rounded-lg" required />
            <input type="number" value={pendingAmount} onChange={(e) => setPendingAmount(e.target.value)} step="0.01" className="p-2 border rounded-lg" required />
            <select value={pendingCategory} onChange={(e) => setPendingCategory(e.target.value)} className="p-2 border rounded-lg">
              {Object.keys(budgetLimits).map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <button className="flex-1 bg-[#4b2e23] text-white px-4 py-2 rounded-lg hover:opacity-90">Save</button>
              <button type="button" onClick={() => setShowConfirmForm(false)} className="flex-1 bg-gray-400 text-white px-4 py-2 rounded-lg">Cancel</button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Manual Entry */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#fdf6f0] border border-[#4b2e23] p-4 rounded-xl shadow-md mb-6">
        <h2 className="text-lg font-semibold mb-3 text-[#4b2e23] flex items-center gap-2">
          <PlusCircle size={18} /> Add Expense Manually
        </h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const desc = e.target.desc.value;
            const amount = parseFloat(e.target.amount.value);
            const category = e.target.category.value;
            addExpense(desc, amount, category);
            e.target.reset();
          }}
          className="grid md:grid-cols-4 gap-3"
        >
          <input type="text" name="desc" placeholder="Description" required className="p-2 border rounded-lg" />
          <input type="number" name="amount" placeholder="Amount" step="0.01" required className="p-2 border rounded-lg" />
          <select name="category" className="p-2 border rounded-lg">
            {Object.keys(budgetLimits).map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <button className="bg-[#4b2e23] text-white px-4 py-2 rounded-lg shadow-md hover:scale-105 transition-transform">Add</button>
        </form>
      </motion.div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#fdf6f0] border border-[#4b2e23] p-4 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold mb-2 text-[#4b2e23] flex items-center gap-2"><PieIcon size={18} /> Expense Breakdown</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={dataForChart} cx="50%" cy="50%" outerRadius={100} dataKey="value" label>
                {dataForChart.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#fdf6f0] border border-[#4b2e23] p-4 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold mb-2 text-[#4b2e23] flex items-center gap-2"><TrendingUp size={18} /> Spending Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#4b2e23" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Expense List */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#fdf6f0] border border-[#4b2e23] p-4 rounded-xl shadow-md mt-6">
        <h2 className="text-lg font-semibold mb-2 text-[#4b2e23] flex items-center gap-2"><FileText size={18} /> All Expenses</h2>
        <ul>
          {expenses.map((e, i) => {
            const categoryTotal = expenses.filter((x) => x.category === e.category).reduce((sum, x) => sum + x.amount, 0);
            const overBudget = categoryTotal > budgetLimits[e.category];
            return (
              <li key={i} className="border-b py-3 flex justify-between items-center text-sm md:text-base hover:bg-[#f0e7e0] rounded-lg px-2 transition-colors">
                <div>
                  <span className="font-medium text-[#4b2e23]">{e.desc}</span>{" "}
                  <span className="text-gray-600">— ₹{e.amount} ({e.category})</span>
                  {overBudget && <span className="ml-2 text-red-500 font-semibold">⚠ Over budget!</span>}
                </div>
                <button onClick={() => setExpenses((prev) => prev.filter((_, idx) => idx !== i))} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-xs shadow-md">
                  Delete
                </button>
              </li>
            );
          })}
        </ul>
      </motion.div>
    </div>
    </div>
  );
}
