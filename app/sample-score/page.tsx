"use client";

import React, { useState, useEffect } from "react";

export default function ScoresPage() {
  const [email, setEmail] = useState("");
  const [tickets, setTickets] = useState(0);
  const [overallScore, setOverallScore] = useState(0);
  const [scores, setScores] = useState<any[]>([]);
  const [countries, setCountries] = useState<
    { name: string; unlock: boolean; score: number; datePlayed: string }[]
  >([]);

  // ✅ Fetch all scores on load
//   useEffect(() => {
//     fetch("/api/post/score")
//       .then((res) => res.json())
//       .then((data) => setScores(data))
//       .catch((err) => console.error("❌ Fetch error:", err));
//   }, []);

  // ✅ Handle country add
  const addCountry = () => {
    setCountries([
      ...countries,
      { name: "", unlock: false, score: 0, datePlayed: "" },
    ]);
  };

  // ✅ Handle country field update
  const updateCountry = (index: number, field: string, value: any) => {
    const updated = [...countries];
    updated[index] = { ...updated[index], [field]: value };
    setCountries(updated);
  };

  // ✅ Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // convert countries array into object (key: country name)
    const countriesPayload: Record<string, any> = {};
    countries.forEach((c) => {
      if (c.name.trim()) {
        countriesPayload[c.name] = {
          unlock: c.unlock,
          score: c.score,
          datePlayed: c.datePlayed ? new Date(c.datePlayed) : null,
        };
      }
    });

    const payload = {
      email,
      tickets,
      overallScore,
      countries: countriesPayload,
    };

    const res = await fetch("/api/post/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });


    const data = await res.json();

    if (data.success) {
      alert("✅ Score saved!");
      setScores((prev) => [...prev, data.data]); // update list
      setCountries([]); // reset countries
    } else {
      alert("❌ Failed to save score.");
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🎮 Scores</h1>

      {/* Score Form */}
      <form
        onSubmit={handleSubmit}
        className="mb-6 bg-white shadow rounded-lg p-4 space-y-3"
      >
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border p-2 rounded"
        />

        <input
          type="number"
          placeholder="Tickets"
          value={tickets}
          onChange={(e) => setTickets(Number(e.target.value))}
          className="w-full border p-2 rounded"
        />

        <input
          type="number"
          placeholder="Overall Score"
          value={overallScore}
          onChange={(e) => setOverallScore(Number(e.target.value))}
          className="w-full border p-2 rounded"
        />

        {/* Country Section */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">🌍 Countries</h2>

          {countries.map((country, index) => (
            <div
              key={index}
              className="p-3 border rounded bg-gray-50 space-y-2"
            >
              <input
                type="text"
                placeholder="Country Name"
                value={country.name}
                onChange={(e) =>
                  updateCountry(index, "name", e.target.value)
                }
                className="w-full border p-2 rounded"
              />

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={country.unlock}
                  onChange={(e) =>
                    updateCountry(index, "unlock", e.target.checked)
                  }
                />
                Unlock
              </label>

              <input
                type="number"
                placeholder="Score"
                value={country.score}
                onChange={(e) =>
                  updateCountry(index, "score", Number(e.target.value))
                }
                className="w-full border p-2 rounded"
              />

              <input
                type="date"
                value={country.datePlayed}
                onChange={(e) =>
                  updateCountry(index, "datePlayed", e.target.value)
                }
                className="w-full border p-2 rounded"
              />
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
