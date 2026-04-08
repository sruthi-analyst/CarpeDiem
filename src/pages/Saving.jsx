import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { Wallet, Landmark, TrendingUp, ShieldCheck, Plane, Car, Home } from "lucide-react";

const COLORS = ["#4B3F2F", "#D1A46D", "#8E6E53", "#F6C7B4", "#FFD700", "#B5651D"];

const GOAL_ICONS = {
  emergency: <ShieldCheck size={18} className="text-red-600" />,
  vacation: <Plane size={18} className="text-blue-600" />,
  car: <Car size={18} className="text-gray-600" />,
  house: <Home size={18} className="text-green-600" />,
  investments: <TrendingUp size={18} className="text-indigo-600" />,
  other: <Landmark size={18} className="text-amber-600" />
};

export default function Saving() {
  const [total, setTotal] = useState(10000);
  const [funds, setFunds] = useState({
    emergency: 2000,
    vacation: 3000,
    investments: 5000,
  });
  const [locked, setLocked] = useState({});
  const [newName, setNewName] = useState("");
  const [expectedRate, setExpectedRate] = useState(7); // 7% annual returns
  const [years, setYears] = useState(5);

  const percentage = (value) => {
    if (!total || isNaN(value) || value <= 0) return 0;
    return ((value / total) * 100).toFixed(0);
  };

  const toggleLock = (name) => {
    setLocked((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleChange = (name, value) => {
    value = Number(value);
    const lockedKeys = Object.keys(funds).filter((k) => locked[k]);
    const unlockedKeys = Object.keys(funds).filter((k) => !locked[k] && k !== name);
    const lockedTotal = lockedKeys.reduce((sum, k) => sum + (k === name ? 0 : funds[k]), 0);
    
    value = Math.min(value, total - lockedTotal);
    let newFunds = { ...funds, [name]: value };
    const remainingTotal = total - lockedTotal - value;
    const unlockedSum = unlockedKeys.reduce((sum, k) => sum + funds[k], 0);

    unlockedKeys.forEach((key) => {
      newFunds[key] = unlockedSum > 0 ? Math.round((funds[key] / unlockedSum) * remainingTotal) : 0;
    });

    setFunds(newFunds);
  };

  const calculateFutureValue = (pmt, rate, yrs) => {
    const r = rate / 100 / 12;
    const n = yrs * 12;
    if (r === 0) return pmt * n;
    return Math.round(pmt * ((Math.pow(1 + r, n) - 1) / r));
  };

  const handleAddSaving = () => {
    if (!newName.trim()) return;
    const key = newName.toLowerCase().replace(/\s+/g, '_');
    if (funds[key]) return;
    setFunds({ ...funds, [key]: 0 });
    setNewName("");
  };

  const data = Object.keys(funds).map((key, i) => ({
    name: key.replace(/_/g, ' '),
    id: key,
    value: funds[key],
    color: COLORS[i % COLORS.length],
  }));

  const totalFutureValue = calculateFutureValue(total, expectedRate, years);

  return (
    <div className="min-h-screen bg-[#fdf6f0] p-6 text-[#4b2e23]">
      <div className="max-w-6xl mx-auto">
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-4xl font-extrabold mb-8 text-center flex items-center justify-center gap-3">
          <Wallet className="text-[#a0522d]" size={40} /> Wealth Builder
        </motion.h1>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left: Settings & Allocation */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-amber-100">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">💰 Monthly Saving Amount</h2>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  value={total}
                  onChange={(e) => setTotal(Number(e.target.value))}
                  className="text-3xl font-bold border-b-2 border-amber-200 outline-none w-full py-2 bg-transparent"
                />
                <span className="text-2xl font-bold text-gray-400">₹</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-amber-100">
              <h2 className="text-xl font-bold mb-4">🎯 Your Goals</h2>
              <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  placeholder="New goal (e.g. Retirement)"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="flex-1 border rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-amber-200"
                />
                <button onClick={handleAddSaving} className="bg-[#4b2e23] text-white px-6 py-2 rounded-xl hover:opacity-90">Add</button>
              </div>

              <div className="space-y-4">
                {data.map((item) => (
                  <div key={item.id} className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2 font-bold capitalize">
                        {GOAL_ICONS[item.id] || GOAL_ICONS.other} {item.name}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold">₹{item.value.toLocaleString()}</span>
                        <button 
                         onClick={() => toggleLock(item.id)}
                         className={`text-xs px-2 py-1 rounded transition ${locked[item.id] ? "bg-red-500 text-white" : "bg-white text-gray-400"}`}
                        >
                          {locked[item.id] ? "Locked" : "Lock"}
                        </button>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={total}
                      value={item.value}
                      disabled={locked[item.id]}
                      onChange={(e) => handleChange(item.id, e.target.value)}
                      className="w-full accent-[#4b2e23]"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Insights & Projections */}
          <div className="space-y-6">
            <div className="bg-[#4b2e23] text-white p-6 rounded-2xl shadow-xl">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><TrendingUp size={20}/> 2026 Growth Projector</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs opacity-70">Estimated Returns (%)</label>
                  <input type="range" min="1" max="25" value={expectedRate} onChange={(e) => setExpectedRate(e.target.value)} className="w-full" />
                  <div className="text-right font-bold">{expectedRate}%</div>
                </div>
                <div>
                  <label className="text-xs opacity-70">Duration (Years)</label>
                  <input type="range" min="1" max="40" value={years} onChange={(e) => setYears(e.target.value)} className="w-full" />
                  <div className="text-right font-bold">{years} yrs</div>
                </div>
                <div className="pt-4 border-t border-white/20">
                  <p className="text-xs opacity-70">Estimated wealth at end of period:</p>
                  <p className="text-3xl font-extrabold text-yellow-400">₹{totalFutureValue.toLocaleString()}</p>
                  <p className="text-[10px] mt-1 opacity-50">*Based on monthly compounding at {expectedRate}%</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-amber-100 flex flex-col items-center">
              <h3 className="text-lg font-bold mb-4">Allocation Split</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {data.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4 w-full">
                {data.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="truncate max-w-[80px] capitalize">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
