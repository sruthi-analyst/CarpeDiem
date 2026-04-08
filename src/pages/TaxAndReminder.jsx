import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  BellAlertIcon, 
  CalendarDaysIcon, 
  CreditCardIcon, 
  CalculatorIcon,
  ExclamationTriangleIcon,
  CheckBadgeIcon
} from "@heroicons/react/24/solid";

export default function TaxAndReminder() {
  const [income, setIncome] = useState(1200000);
  const [deductions, setDeductions] = useState(150000);
  const [regime, setRegime] = useState("new");
  
  const [payments, setPayments] = useState([
    { category: "Utilities", name: "Electricity Bill", amount: 1200, date: "2026-04-10" },
    { category: "Rent", name: "Apartment Rent", amount: 25000, date: "2026-04-05" },
  ]);

  const [completed, setCompleted] = useState([]);

  // --- Real India Tax Slab Logic (FY 2024-25 New Regime) ---
  const calculateTaxNew = (inc) => {
    let tax = 0;
    const taxable = Math.max(0, inc - 75000); // Standard deduction
    if (taxable <= 700000) return 0; // Rebate under 87A

    if (taxable > 300000) tax += Math.min(taxable - 300000, 300000) * 0.05;
    if (taxable > 600000) tax += Math.min(taxable - 600000, 300000) * 0.10;
    if (taxable > 900000) tax += Math.min(taxable - 900000, 300000) * 0.15;
    if (taxable > 1200000) tax += Math.min(taxable - 1200000, 300000) * 0.20;
    if (taxable > 1500000) tax += (taxable - 1500000) * 0.30;
    
    return tax + (tax * 0.04); // Plus 4% Cess
  };

  const calculateTaxOld = (inc, ded) => {
    let tax = 0;
    const taxable = Math.max(0, inc - ded - 50000); // Base deduction + 80C etc
    if (taxable <= 500000) return 0;

    if (taxable > 250000) tax += Math.min(taxable - 250000, 250000) * 0.05;
    if (taxable > 500000) tax += Math.min(taxable - 500000, 500000) * 0.20;
    if (taxable > 1000000) tax += (taxable - 1000000) * 0.30;

    return tax + (tax * 0.04);
  };

  const currentTax = regime === "new" ? calculateTaxNew(income) : calculateTaxOld(income, deductions);

  return (
    <div className="min-h-screen bg-[#fdf6f0] p-4 md:p-8 text-[#4b2e23]">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">
        
        {/* Left Section: Real Tax Calculator */}
        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="bg-white rounded-3xl shadow-xl p-8 border border-amber-50">
          <div className="flex items-center gap-3 mb-6">
            <CalculatorIcon className="h-8 w-8 text-amber-700" />
            <h2 className="text-2xl font-bold">2026 Tax Planner</h2>
          </div>

          <div className="space-y-6">
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button 
                onClick={() => setRegime("new")}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${regime === "new" ? "bg-white shadow text-[#4b2e23]" : "text-gray-500"}`}
              >
                New Regime (Default)
              </button>
              <button 
                onClick={() => setRegime("old")}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${regime === "old" ? "bg-white shadow text-[#4b2e23]" : "text-gray-500"}`}
              >
                Old Regime
              </button>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-gray-400">Annual Gross Income (₹)</label>
              <input 
                type="number" 
                value={income} 
                onChange={(e) => setIncome(Number(e.target.value))} 
                className="w-full text-4xl font-extrabold border-b-2 border-amber-100 outline-none pb-2 mt-1 focus:border-amber-400 transition"
              />
            </div>

            {regime === "old" && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}>
                <label className="text-xs font-bold uppercase text-gray-400">Total Deductions (80C, 80D, etc)</label>
                <input 
                  type="number" 
                  value={deductions} 
                  onChange={(e) => setDeductions(Number(e.target.value))} 
                  className="w-full text-2xl font-bold border-b border-gray-200 outline-none mt-1"
                />
              </motion.div>
            )}

            <div className="bg-amber-900 text-white p-6 rounded-2xl shadow-inner relative overflow-hidden">
              <p className="text-sm opacity-80">Estimated Yearly Tax</p>
              <h3 className="text-4xl font-black">₹{currentTax.toLocaleString()}</h3>
              <p className="text-[10px] mt-2 opacity-50">Monthly: ₹{Math.round(currentTax / 12).toLocaleString()}</p>
              <CheckBadgeIcon className="absolute -bottom-2 -right-2 h-20 w-20 opacity-10" />
            </div>

            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3 text-sm">
              <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 shrink-0" />
              <p>
                {regime === "new" 
                  ? "Rebate applies for income up to ₹7 Lakhs. Standard deduction of ₹75,000 is included."
                  : "Old regime requires proof of investments like LIC, PPF, or HRA."}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Right Section: Bill Reminders */}
        <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-6">
          <div className="bg-white rounded-3xl shadow-lg p-8 border border-amber-50">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <BellAlertIcon className="h-6 w-6 text-amber-600" /> Upcoming Deadlines
            </h2>
            <div className="space-y-4">
              {payments.map((p, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-[#fff8ef] border border-amber-50 hover:shadow-md transition">
                  <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                   {p.category === "Rent" ? <CalendarDaysIcon className="h-6 w-6 text-amber-800" /> : <CreditCardIcon className="h-6 w-6 text-blue-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm">{p.name}</p>
                    <p className="text-xs text-gray-500">Due: {p.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black">₹{p.amount}</p>
                    <button className="text-[10px] bg-white px-2 py-1 rounded-full shadow border text-gray-400 hover:text-green-600">Pay Now</button>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-3 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 font-bold hover:border-amber-200 hover:text-amber-600 transition">
              + Add Reminder
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-indigo-600 text-white p-6 rounded-3xl shadow-lg">
              <p className="text-xs opacity-70">Tax Efficiency</p>
              <h4 className="text-2xl font-bold">{currentTax > 0 ? "84%" : "100%"}</h4>
            </div>
            <div className="bg-green-600 text-white p-6 rounded-3xl shadow-lg">
              <p className="text-xs opacity-70">On-time Payouts</p>
              <h4 className="text-2xl font-bold">100%</h4>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
