import React, { useState } from "react";

export default function Policies() {
  const [city, setCity] = useState("");
  const [age, setAge] = useState("");
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchPolicies = async () => {
    if (!city || !age) {
      setError("Please enter both city and age.");
      return;
    }

    setError("");
    setLoading(true);
    setPolicies([]);

    try {
      const res = await fetch("/api/policies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city, age })
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
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center mb-6">📜 Government Policies & Insurance</h1>

      <div className="bg-white p-4 rounded-xl shadow-md max-w-lg mx-auto flex gap-4 flex-wrap justify-center">
        <input
          type="text"
          placeholder="Enter City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="border p-2 rounded-md flex-1"
        />
        <input
          type="number"
          placeholder="Enter Age"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          className="border p-2 rounded-md w-24"
        />
        <button
          onClick={fetchPolicies}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Search
        </button>
      </div>

      {loading && <p className="text-center mt-6 text-gray-600">Fetching policies...</p>}
      {error && <p className="text-center mt-6 text-red-500">{error}</p>}

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {policies.map((policy, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition">
            <h2 className="text-xl font-bold mb-2">{policy.name}</h2>
            <p className="text-sm text-gray-600"><strong>Eligibility:</strong> {policy.eligibility}</p>
            <p className="text-sm text-gray-600 mt-1"><strong>Benefits:</strong> {policy.benefits}</p>
            <a
              href={policy.official_link}
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-3 text-blue-600 hover:underline"
            >
              View Official Link →
            </a>
          </div>
        ))}
      </div>

      {!loading && !error && policies.length === 0 && (
        <p className="text-center mt-6 text-gray-500">No policies found. Try entering city and age.</p>
      )}
    </div>
  );
}
