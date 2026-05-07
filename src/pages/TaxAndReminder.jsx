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
  const [regime, setRegime] = useState("new");

  // --- Deductions State ---
  // Old Regime Deductions
  const [old80C, setOld80C] = useState(150000);
  const [old80D, setOld80D] = useState(25000);
  const [oldHRA, setOldHRA] = useState(0);
  const [oldHomeLoan, setOldHomeLoan] = useState(0); // Section 24b self-occupied
  const [oldEduLoan, setOldEduLoan] = useState(0); // Section 80E
  const [oldOther, setOldOther] = useState(0); // 80G, 80TTA, etc.

  // New Regime Deductions (FY 2026-27)
  const [newNPS, setNewNPS] = useState(0); // 80CCD(2)
  const [newHomeLoanLetOut, setNewHomeLoanLetOut] = useState(0); // Section 24b let-out

  const [payments, setPayments] = useState([
    { category: "Utilities", name: "Electricity Bill", amount: 1200, date: "2026-04-10" },
    { category: "Rent", name: "Apartment Rent", amount: 25000, date: "2026-04-05" },
  ]);

  const [completed, setCompleted] = useState([]);

  // --- FY 2026-27 New Tax Regime Logic ---
  const calculateTaxNew = (grossIncome) => {
    const stdDeduction = 75000;
    // Section 80CCD(2) and Section 24b (let-out) are allowed in New Regime
    const totalDeductions = stdDeduction + Number(newNPS) + Number(newHomeLoanLetOut);
    const taxable = Math.max(0, grossIncome - totalDeductions);

    // Rebate 87A for New Regime FY 2026-27: Zero tax if taxable income <= 12,00,000
    if (taxable <= 1200000) return 0;

    let tax = 0;
    // Slabs (FY 2026-27 estimated based on current trends/user request)
    if (taxable > 300000) tax += Math.min(taxable - 300000, 400000) * 0.05; // 3L - 7L
    if (taxable > 700000) tax += Math.min(taxable - 700000, 300000) * 0.10; // 7L - 10L
    if (taxable > 1000000) tax += Math.min(taxable - 1000000, 200000) * 0.15; // 10L - 12L
    if (taxable > 1200000) tax += Math.min(taxable - 1200000, 300000) * 0.20; // 12L - 15L
    if (taxable > 1500000) tax += (taxable - 1500000) * 0.30; // > 15L

    return tax + (tax * 0.04); // 4% Cess
  };

  // --- Old Tax Regime Logic ---
  const calculateTaxOld = (grossIncome) => {
    const stdDeduction = 50000;
    const total80C = Math.min(150000, Number(old80C));
    const totalDeductions = stdDeduction + total80C + Number(old80D) + Number(oldHRA) +
      Math.min(200000, Number(oldHomeLoan)) + Number(oldEduLoan) + Number(oldOther);

    const taxable = Math.max(0, grossIncome - totalDeductions);

    // Rebate 87A for Old Regime: Zero tax if taxable income <= 5,00,000
    if (taxable <= 500000) return 0;

    let tax = 0;
    if (taxable > 250000) tax += Math.min(taxable - 250000, 250000) * 0.05;
    if (taxable > 500000) tax += Math.min(taxable - 500000, 500000) * 0.20;
    if (taxable > 1000000) tax += (taxable - 1000000) * 0.30;

    return tax + (tax * 0.04);
  };

  const currentTax = regime === "new" ? calculateTaxNew(income) : calculateTaxOld(income);

  return (
    <div className="min-h-screen bg-[#fdf6f0] p-4 md:p-8 text-[#4b2e23]">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">

        {/* Left Section: Real Tax Calculator */}
        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="bg-white rounded-3xl shadow-xl p-6 md:p-8 border border-amber-50">
          <div className="flex items-center gap-3 mb-6">
            <CalculatorIcon className="h-8 w-8 text-amber-700" />
            <h2 className="text-2xl font-bold">FY 2026-27 Tax Planner</h2>
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

            <div className="grid md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs font-bold uppercase text-gray-400">Annual Gross Income (₹)</label>
                <input
                  type="number"
                  value={income}
                  onChange={(e) => setIncome(Number(e.target.value))}
                  className="w-full text-3xl font-extrabold border-b-2 border-amber-100 outline-none pb-2 mt-1 focus:border-amber-400 transition"
                />
              </div>

              {regime === "new" ? (
                <>
                  <div className="bg-blue-50 p-3 rounded-xl">
                    <label className="text-[10px] font-bold uppercase text-blue-400">Employer NPS (80CCD-2)</label>
                    <input
                      type="number"
                      value={newNPS}
                      onChange={(e) => setNewNPS(e.target.value)}
                      className="w-full bg-transparent font-bold border-none outline-none"
                    />
                  </div>
                  <div className="bg-blue-50 p-3 rounded-xl">
                    <label className="text-[10px] font-bold uppercase text-blue-400">Home Loan (Let-out)</label>
                    <input
                      type="number"
                      value={newHomeLoanLetOut}
                      onChange={(e) => setNewHomeLoanLetOut(e.target.value)}
                      className="w-full bg-transparent font-bold border-none outline-none"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-amber-50 p-3 rounded-xl">
                    <label className="text-[10px] font-bold uppercase text-amber-400">Section 80C (Max ₹1.5L)</label>
                    <p className="text-[9px] text-amber-300 mb-1">PPF, ELSS, LIC, EPF, SSY, 5yr FD, Home Loan Principal</p>
                    <input type="number" value={old80C} onChange={(e) => setOld80C(e.target.value)} className="w-full bg-transparent font-bold border-none outline-none" />
                  </div>
                  <div className="bg-amber-50 p-3 rounded-xl">
                    <label className="text-[10px] font-bold uppercase text-amber-400">Section 80D (Medical)</label>
                    <p className="text-[9px] text-amber-300 mb-1">Self ₹25K, Parents extra ₹25K (₹50K if senior)</p>
                    <input type="number" value={old80D} onChange={(e) => setOld80D(e.target.value)} className="w-full bg-transparent font-bold border-none outline-none" />
                  </div>
                  <div className="bg-amber-50 p-3 rounded-xl">
                    <label className="text-[10px] font-bold uppercase text-amber-400">HRA Exemption</label>
                    <p className="text-[9px] text-amber-300 mb-1">Subject to rent paid, city, and salary conditions</p>
                    <input type="number" value={oldHRA} onChange={(e) => setOldHRA(e.target.value)} className="w-full bg-transparent font-bold border-none outline-none" />
                  </div>
                  <div className="bg-amber-50 p-3 rounded-xl">
                    <label className="text-[10px] font-bold uppercase text-amber-400">Home Loan Interest (Sec 24b)</label>
                    <p className="text-[9px] text-amber-300 mb-1">Self-occupied: Max ₹2L; Let-out: No limit</p>
                    <input type="number" value={oldHomeLoan} onChange={(e) => setOldHomeLoan(e.target.value)} className="w-full bg-transparent font-bold border-none outline-none" />
                  </div>
                  <div className="bg-amber-50 p-3 rounded-xl">
                    <label className="text-[10px] font-bold uppercase text-amber-400">Education Loan (Sec 80E)</label>
                    <p className="text-[9px] text-amber-300 mb-1">Full interest deduction for 8 years</p>
                    <input type="number" value={oldEduLoan} onChange={(e) => setOldEduLoan(e.target.value)} className="w-full bg-transparent font-bold border-none outline-none" />
                  </div>
                  <div className="bg-amber-50 p-3 rounded-xl">
                    <label className="text-[10px] font-bold uppercase text-amber-400">Others (80G / 80TTA / 80TTB)</label>
                    <p className="text-[9px] text-amber-300 mb-1">Donations, savings interest (max ₹10K/₹50K for seniors)</p>
                    <input type="number" value={oldOther} onChange={(e) => setOldOther(e.target.value)} className="w-full bg-transparent font-bold border-none outline-none" />
                  </div>
                </>
              )}
            </div>

            {/* Live Deduction Breakdown */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs space-y-1.5">
              <p className="text-xs font-bold text-slate-500 uppercase mb-2">📊 Deduction Breakdown</p>
              {regime === "new" ? (
                <>
                  <div className="flex justify-between"><span className="text-slate-500">Standard Deduction</span><span className="font-bold text-green-600">- ₹75,000</span></div>
                  {Number(newNPS) > 0 && <div className="flex justify-between"><span className="text-slate-500">Employer NPS (80CCD-2)</span><span className="font-bold text-green-600">- ₹{Number(newNPS).toLocaleString()}</span></div>}
                  {Number(newHomeLoanLetOut) > 0 && <div className="flex justify-between"><span className="text-slate-500">Home Loan Interest (Let-out)</span><span className="font-bold text-green-600">- ₹{Number(newHomeLoanLetOut).toLocaleString()}</span></div>}
                  <div className="border-t pt-1.5 flex justify-between font-bold"><span>Taxable Income</span><span>₹{Math.max(0, income - 75000 - Number(newNPS) - Number(newHomeLoanLetOut)).toLocaleString()}</span></div>
                </>
              ) : (
                <>
                  <div className="flex justify-between"><span className="text-slate-500">Standard Deduction</span><span className="font-bold text-green-600">- ₹50,000</span></div>
                  {Number(old80C) > 0 && <div className="flex justify-between"><span className="text-slate-500">80C</span><span className="font-bold text-green-600">- ₹{Math.min(150000, Number(old80C)).toLocaleString()}</span></div>}
                  {Number(old80D) > 0 && <div className="flex justify-between"><span className="text-slate-500">80D (Medical)</span><span className="font-bold text-green-600">- ₹{Number(old80D).toLocaleString()}</span></div>}
                  {Number(oldHRA) > 0 && <div className="flex justify-between"><span className="text-slate-500">HRA Exemption</span><span className="font-bold text-green-600">- ₹{Number(oldHRA).toLocaleString()}</span></div>}
                  {Number(oldHomeLoan) > 0 && <div className="flex justify-between"><span className="text-slate-500">Home Loan Interest (24b)</span><span className="font-bold text-green-600">- ₹{Math.min(200000, Number(oldHomeLoan)).toLocaleString()}</span></div>}
                  {Number(oldEduLoan) > 0 && <div className="flex justify-between"><span className="text-slate-500">Education Loan (80E)</span><span className="font-bold text-green-600">- ₹{Number(oldEduLoan).toLocaleString()}</span></div>}
                  {Number(oldOther) > 0 && <div className="flex justify-between"><span className="text-slate-500">Others (80G/80TTA)</span><span className="font-bold text-green-600">- ₹{Number(oldOther).toLocaleString()}</span></div>}
                  <div className="border-t pt-1.5 flex justify-between font-bold">
                    <span>Taxable Income</span>
                    <span>₹{Math.max(0, income - 50000 - Math.min(150000, Number(old80C)) - Number(old80D) - Number(oldHRA) - Math.min(200000, Number(oldHomeLoan)) - Number(oldEduLoan) - Number(oldOther)).toLocaleString()}</span>
                  </div>
                </>
              )}
            </div>

            <div className="bg-amber-900 text-white p-6 rounded-2xl shadow-inner relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm opacity-80">Estimated Yearly Tax</p>
                  <h3 className="text-4xl font-black">₹{currentTax.toLocaleString()}</h3>
                </div>
                <div className="text-right">
                  <p className="text-[10px] opacity-60">Regime: {regime === "new" ? "New" : "Old"}</p>
                  <p className="text-[10px] opacity-60">4% Cess Included</p>
                </div>
              </div>
              <p className="text-[10px] mt-2 opacity-50">Monthly: ₹{Math.round(currentTax / 12).toLocaleString()}</p>
              <CheckBadgeIcon className="absolute -bottom-2 -right-2 h-20 w-20 opacity-10" />
            </div>

            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3 text-sm">
              <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 shrink-0" />
              <div>
                <p className="font-bold">Key Note (FY 2026-27):</p>
                <p className="text-xs text-gray-600 mt-1">
                  {regime === "new"
                    ? "Zero tax!! up to ₹12 Lakh (Rebate 87A). ₹75,000 standard deduction + Employer NPS (80CCD-2) are the main deductions."
                    : "Traditional regime with HRA, 80C (max ₹1.5L), 80D, home loan interest, education loan & donation deductions. Rebate 87A up to ₹5L."}
                </p>
              </div>
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
