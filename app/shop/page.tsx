"use client";

import React, { useState, useEffect } from "react";

export default function Shop() {
  const defcountries = [
    "Iceland", "Ireland", "Latvia", "Lithuania",
    "Norway", "Sweden", "United Kingdom", "Austria", "Belgium",
    "Liechtenstein", "Luxembourg", "Monaco", "Netherlands", "Albania",
    "Andorra", "Bosnia and Herzegovina", "Croatia", "Greece", "Italy", "Malta",
    "Montenegro", "North Macedonia", "Portugal", "San Marino", "Serbia", "Slovenia",
    "Spain", "Vatican City", "Belarus", "Bulgaria", "Czechia", "Hungary", "Moldova",
    "Poland", "Romania", "Slovakia", "Ukraine"
  ];

  const [tickets, setTickets] = useState(0);
  const [overallScore, setOverallScore] = useState(0);
  const [scores, setScores] = useState<any[]>([]);

  // ✅ Countries state
  const [countries, setCountries] = useState<
    { name: string; unlock: boolean; score: number; datePlayed: string }[]
  >([{ name: "", unlock: true, score: 0, datePlayed: "" }]);

  // ✅ Dropdown options state (shrinks over time)
  const [availableCountries, setAvailableCountries] = useState<string[]>(defcountries);

  // 🔹 Load filtered list on mount
  useEffect(() => {
    const savedList = JSON.parse(localStorage.getItem("countryList") || "[]");
    if (savedList.length > 0) {
      const filtered = defcountries.filter((c) => !savedList.includes(c));
      setAvailableCountries(filtered);
    }
  }, []);

  const addCountry = () => {
    setCountries([
      ...countries,
      { name: "", unlock: true, score: 0, datePlayed: "" },
    ]);
  };

  const updateCountry = (index: number, field: string, value: any) => {
    const updated = [...countries];
    updated[index] = { ...updated[index], [field]: value };
    setCountries(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const countriesPayload: Record<string, any> = {};
    countries.forEach((c) => {
      if (c.name.trim()) {
        countriesPayload[c.name] = {
          unlock: true,
          score: c.score,
          datePlayed: c.datePlayed ? new Date(c.datePlayed) : null,
        };
      }
    });
    const email = (localStorage.getItem("email") || "").replace(/^"+|"+$/g, "");
      if (!email) return;


    const payload = {
      email: email,
      tickets,
      overallScore,
      countries: countriesPayload,
    };

    const res = await fetch("/api/post/score", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (data.success) {
      alert("✅ Score saved!");

      if (data.success && data.data?.countries) {
        const countryList = Object.keys(data.data.countries);

        // 🔹 Merge new countries with old saved list
        const existing = JSON.parse(localStorage.getItem("countryList") || "[]");
        const updatedList = Array.from(new Set([...existing, ...countryList]));

        // 🔹 Save updated list to localStorage
        localStorage.setItem("countryList", JSON.stringify(updatedList));

        // 🔹 Filter available countries again
        const filtered = defcountries.filter((c) => !updatedList.includes(c));
        setAvailableCountries(filtered);

        // 🔹 Reset form
        setScores((prev) => [...prev, data.data]);
        setCountries([{ name: "", unlock: true, score: 0, datePlayed: "" }]);
      }
    } else {
      alert("❌ Failed to save score.");
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">SHOP</h1>

      {/* Score Form */}
      <form
        onSubmit={handleSubmit}
        className="mb-6 bg-white shadow rounded-lg p-4 space-y-3"
      >
        {/* Country Section */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">🌍 Countries</h2>

          {countries.map((country, index) => (
            <div
              key={index}
              className="p-3 border rounded bg-gray-50 space-y-2"
            >
              {/* Country dropdown */}
              <select
                value={country.name}
                onChange={(e) => updateCountry(index, "name", e.target.value)}
                className="w-full border p-2 rounded"
              >
                <option value="">-- Select Country --</option>
                {availableCountries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          ))}

          <button
            type="button"
            onClick={addCountry}
            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
          >
            ➕ Add Country
          </button>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Save Score
        </button>
      </form>

      {/* Score List */}
      <div className="space-y-3">
        {scores.length === 0 ? (
          <p className="text-gray-500">No scores yet.</p>
        ) : (
          scores.map((s, i) => (
            <div key={i} className="p-3 border rounded bg-gray-50">
              <p>
                <strong>Email:</strong> {s.email}
              </p>
              <p>
                <strong>Tickets:</strong> {s.tickets}
              </p>
              <p>
                <strong>Overall Score:</strong> {s.overallScore}
              </p>
              <div className="mt-2">
                <strong>Countries:</strong>
                <ul className="list-disc pl-5">
                  {s.countries &&
                    Object.entries(s.countries).map(
                      ([country, details]: [string, any]) => (
                        <li key={country}>
                          {country} — Score: {details.score}, Unlock:{" "}
                          {details.unlock ? "✅" : "❌"}, Date:{" "}
                          {details.datePlayed
                            ? new Date(details.datePlayed).toLocaleDateString()
                            : "N/A"}
                        </li>
                      )
                    )}
                </ul>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
