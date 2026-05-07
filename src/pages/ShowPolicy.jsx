import React, { useState } from "react";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", 
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", 
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", 
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", 
  "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", 
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", 
  "Ladakh", "Lakshadweep", "Puducherry"
];

export default function Policies() {
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [occupation, setOccupation] = useState("");
  const [income, setIncome] = useState("");
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchPolicies = async () => {
    if (!state || !age) {
      setError("Please select both State and Age.");
      return;
    }

    if (age < 0 || age > 120) {
      setError("Please enter a valid age between 0 and 120.");
      return;
    }

    setError("");
    setLoading(true);
    setPolicies([]);

    try {
      const res = await fetch("/api/policies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city, state, age, gender, occupation, income })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch policies");
      }

      setPolicies(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            📜 Government Schemes & Insurance
          </h1>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Discover personalized government benefits and insurance policies tailored to your profile.
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Section */}
          <aside className="w-full lg:w-80 bg-white p-6 rounded-2xl shadow-xl border border-slate-100 h-fit sticky top-8">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
              Your Profile
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">State *</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                >
                  <option value="">Select State</option>
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">City (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Mumbai"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Age *</label>
                <input
                  type="number"
                  placeholder="Age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other / All</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Occupation</label>
                <select
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                >
                  <option value="">Select Occupation</option>
                  <option value="Student">Student</option>
                  <option value="Salaried">Salaried</option>
                  <option value="Self-Employed">Self-Employed</option>
                  <option value="Farmer">Farmer</option>
                  <option value="Retired">Retired</option>
                  <option value="Business Owner">Business Owner</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Income Category</label>
                <select
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                >
                  <option value="">Select Income</option>
                  <option value="BPL">Below Poverty Line (BPL)</option>
                  <option value="Low">Low Income (&lt; 3L)</option>
                  <option value="Middle">Middle Income (3L - 10L)</option>
                  <option value="High">High Income (&gt; 10L)</option>
                </select>
              </div>

              <button
                onClick={fetchPolicies}
                disabled={loading}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-blue-700 hover:shadow-blue-200 transition-all disabled:bg-slate-400 mt-4"
              >
                {loading ? "Searching..." : "Find Schemes"}
              </button>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                ⚠️ {error}
              </div>
            )}
          </aside>

          {/* Results Section */}
          <main className="flex-1">
            {loading ? (
              <div className="grid gap-6 md:grid-cols-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-white p-6 rounded-2xl shadow-sm animate-pulse border border-slate-100">
                    <div className="h-6 bg-slate-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-slate-100 rounded w-full mb-2"></div>
                    <div className="h-4 bg-slate-100 rounded w-5/6"></div>
                  </div>
                ))}
              </div>
            ) : policies.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                {policies.map((policy, index) => (
                  <div 
                    key={index} 
                    className="group bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl border border-slate-100 transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="mb-4">
                      <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full mb-2 uppercase tracking-wider">
                        Recommended
                      </span>
                      <h2 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                        {policy.name}
                      </h2>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex gap-2">
                        <span className="text-sm font-bold text-slate-500 whitespace-nowrap">Eligibility:</span>
                        <p className="text-sm text-slate-600 leading-relaxed">{policy.eligibility}</p>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-sm font-bold text-slate-500 whitespace-nowrap">Benefits:</span>
                        <p className="text-sm text-slate-600 leading-relaxed">{policy.benefits}</p>
                      </div>
                    </div>

                    <a
                      href={policy.official_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:gap-3 transition-all"
                    >
                      Visit Official Site <span className="text-lg">→</span>
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-200">
                <div className="text-6xl mb-4">🔎</div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">No results yet</h3>
                <p className="text-slate-500">
                  Fill in your details and click search to find relevant government policies.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
