"use client";

import { useRouter } from "next/navigation";
import React, { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";
import { db } from "../api/firebase/firebase-config";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";

interface PlayerScore {
  tickets?: number;
  countries?: Record<string, { score: number; datePlayed?: string }>;
}

export default function Shop() {
  const [profile, setProfile] = useState<any>(null);
  const [score, setScore] = useState<PlayerScore | null>(null); // tickets + countries
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

  const [countries, setCountries] = useState<
    { name: string; unlock: boolean; score: number; datePlayed: string }[]
  >([{ name: "", unlock: true, score: 0, datePlayed: "" }]);

  const [availableCountries, setAvailableCountries] = useState<string[]>(defcountries);

  const default_countries = [
    "estonia",
    "finland",
    "france",
    "germany",
    "switzerland"
  ];

  useEffect(() => {
    const savedList = JSON.parse(localStorage.getItem("countryList") || "[]").map(
      (c: string) => c.charAt(0).toUpperCase() + c.slice(1)
    );
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

  // ✅ Dynamic ticket cost calculation
  const [ownedCountries, setOwnedCountries] = useState<string[]>([]);

useEffect(() => {
  if (typeof window !== "undefined") {
    const stored = JSON.parse(localStorage.getItem("countryList") || "[]");
    setOwnedCountries(stored);
  }
}, []);

const calculatedCost = useMemo(() => {
  const alreadyPurchased = ownedCountries.filter(
    (c) => !default_countries.includes(c.toLowerCase())
  ).length;

  const numCountries = countries.filter((c) => c.name.trim()).length;

  let cost = 0;
  for (let i = 0; i < numCountries; i++) {
    cost += 10 + alreadyPurchased + i; // progressive cost
  }
  return cost;
}, [countries, ownedCountries, default_countries]);

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
    const uid = (localStorage.getItem("uid") || "").replace(/^"+|"+$/g, "");
    if (!email || !uid) return;

    if ((score?.tickets ?? 0) < calculatedCost) {
      alert("❌ Not enough tickets.");
      setCountries([{ name: "", unlock: true, score: 0, datePlayed: "" }]); // reset
      return;
    }

    const payload = {
      email,
      tickets: (score?.tickets ?? 0) - calculatedCost,
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
      alert(`✅ Purchase Successful! You spent ${calculatedCost} tickets.`);

      await updateDoc(doc(db, "Firebase-jigzexplorer-profiles", uid), {
        tickets: (score?.tickets ?? 0) - calculatedCost,
      });

      if (data.data?.countries) {
        const countryList = Object.keys(data.data.countries);
        const existing = JSON.parse(localStorage.getItem("countryList") || "[]");
        const updatedList = Array.from(new Set([...existing, ...countryList]));
        localStorage.setItem("countryList", JSON.stringify(updatedList));

        const filtered = defcountries.filter((c) => !updatedList.includes(c));
        setAvailableCountries(filtered);

        setScores((prev) => [...prev, data.data]);
        setCountries([{ name: "", unlock: true, score: 0, datePlayed: "" }]);
      }
    } else {
      alert("❌ Failed to save score.");
    }
  };

  useEffect(() => {
    const uid = localStorage.getItem("uid");
    const email = localStorage.getItem("email");
    if (!uid || !email) return;

    const cleanUid = uid.replace(/^"+|"+$/g, "");
    const cleanEmail = email.replace(/^"+|"+$/g, "");
    if (!cleanUid || !cleanEmail) return;

    const unsubscribe = onSnapshot(
      doc(db, "Firebase-jigzexplorer-profiles", cleanUid),
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setScore((prev) => ({
            tickets: data?.tickets ?? 0,
            countries: prev?.countries ?? {},
          }));
          setProfile({
            displayName: data.displayName,
            email: data.email,
            photoURL: data.photoURL,
          });
        }
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex justify-baseline">
        <button
          onClick={() => router.push("/")}
          className="cursor-pointer px-2 text-xs sm:text-lg rounded-lg text-white bg-green-600 hover:bg-green-700 transition-all duration-300 transform hover:scale-105"
        >
          🏠 Home
        </button>
        <h1 className="text-2xl font-bold px-2 text-center items-center">SHOP</h1>
        <h2 className="text-2xl font-bold px-2 text-center items-center">
          🎟️ Tickets: {score?.tickets ?? 0}
        </h2>
      </div>

      {/* Score Form */}
      <form
        onSubmit={handleSubmit}
        className="mb-6 bg-white shadow rounded-lg p-4 space-y-3"
      >
        <div className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            🌍 Countries
            <span className="text-sm font-normal text-gray-600">
              (Cost: {calculatedCost} 🎟️)
            </span>
          </h2>

          {countries.map((country, index) => (
            <div key={index} className="p-3 border rounded bg-gray-50 space-y-2">
             <select
  value={country.name}
  onChange={(e) => updateCountry(index, "name", e.target.value)}
  className="cursor-pointer w-full border p-2 rounded"
>
  <option value="">-- Select Country --</option>
  {availableCountries
    .filter(
      (c) =>
        // 🔹 Hide countries already purchased
        !ownedCountries.includes(c) &&
        // 🔹 Hide countries already selected in this form
        !countries.some(
          (selected, idx) => selected.name === c && idx !== index
        )
    )
    .map((c) => (
      <option key={c} value={c}>
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

        <button
          type="submit"
          className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Purchase
        </button>
      </form>
    </div>
  );
}
