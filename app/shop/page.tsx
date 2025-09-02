"use client";

import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import Swal from 'sweetalert2';

export default function Shop() {
  const router = useRouter();
  const defcountries = [
    "Iceland", "Ireland", "Latvia", "Lithuania",
    "Norway", "Sweden", "United Kingdom", "Austria", "Belgium",
    "Liechtenstein", "Luxembourg", "Monaco", "Netherlands", "Albania",
    "Andorra", "Bosnia and Herzegovina", "Croatia", "Greece", "Italy", "Malta",
    "Montenegro", "North Macedonia", "Portugal", "San Marino", "Serbia", "Slovenia",
    "Spain", "Vatican City", "Belarus", "Bulgaria", "Czechia", "Hungary", "Moldova",
    "Poland", "Romania", "Slovakia", "Ukraine"
  ].map(c => c.toLowerCase());

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
    const savedList = JSON.parse(localStorage.getItem("countryList") || "[]")
  .map((c: string) => c.charAt(0).toUpperCase() + c.slice(1));
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

  const buttonDesc = "cursor-pointer rounded-lg px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 text-sm transition m-1";

  const handleUndoClick = () => {
    Swal.fire({
      title: "Purchase 'Undo'?",
      html: `
        Are you sure you want to buy the <b>Undo</b> feature?
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Proceed",
      cancelButtonText: "Cancel",
      reverseButtons: true, // optional → puts "Cancel" on the left
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire("✅ Purchased!", "You bought the Undo feature.", "success");
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire("❌ Cancelled", "Purchase aborted.", "error");
      }
    });
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className='flex justify-baseline'>
      <button
          onClick={() => router.push("/")}
          className="cursor-pointer px-2  text-xs sm:text-lg rounded-lg text-white bg-green-600 hover:bg-green-700 transition-all duration-300 transform hover:scale-105"
          >
          🏠 Home
        </button>
        <h1 className="text-2xl font-bold px-2 text-center items-center">SHOP</h1>
      </div>



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
                className="cursor-pointer w-full border p-2 rounded"
              >
               <option value="">-- Select Country --</option>
                {availableCountries.map((c) => (
                  <option className='cursor-pointer' key={c} value={c}>
                    {c.replace(/\b\w/g, (char) => char.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
          ))}

          <button
            type="button"
            onClick={addCountry}
            className="cursor-pointer bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
          >
            ➕ Add Country
          </button>
        </div>
       <section className='flex flex-col'>
       {/* <button className={buttonDesc}></button> */}
       <section className="flex justify-around">
       <button className={buttonDesc}>undo</button>
       <button className={buttonDesc}>Multi-Select</button>
        <button className={buttonDesc}>Auto-Solve Whole</button>
        <button className={buttonDesc}>Auto-Place (piece)</button>
        </section>
        <section className="flex justify-around">
        <button className={buttonDesc}>Upgrade Turbo Duration</button>
        <button className={buttonDesc}>Upgrade Turbo Multiplier</button>
        <button className={buttonDesc}>Upgrade Streak Multiplier</button>
        </section>
       </section>
        <button
          type="submit"
          className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Purchase
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
