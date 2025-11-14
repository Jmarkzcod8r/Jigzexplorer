"use client";

import { useRouter } from "next/navigation";
import React, { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";
import { db } from "../api/firebase/firebase-config";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import Logo from "../component/logo";

interface PlayerScore {
  tickets?: number;
  countries?: Record<string, { score: number; datePlayed?: string }>;
}

export default function Shop() {
  const [profile, setProfile] = useState<any>(null);
  const [score, setScore] = useState<PlayerScore | null>(null); // tickets + countries
  const router = useRouter();
  const defcountries = ["Denmark",
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

    // Save to Mongodb
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

        // ✅ Update localStorage + ownedCountries state
        localStorage.setItem("countryList", JSON.stringify(updatedList));
        setOwnedCountries(updatedList);

        const filtered = defcountries.filter((c) => !updatedList.includes(c));
        setAvailableCountries(filtered);

        setScores((prev) => [...prev, data.data]);
        setCountries([{ name: "", unlock: true, score: 0, datePlayed: "" }]);
        // window.location.reload()
      }
    }
     else {
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
    <div
    className="font-sans flex flex-col items-center justify-center
      min-h-screen p-6 sm:p-10 bg-[url('/Bg.png')] bg-cover bg-center"
  >
    <Logo/>
    {/* Top Bar */}
    <div className="flex items-center justify-between w-full max-w-3xl bg-white/80 backdrop-blur-sm rounded-lg shadow-md px-4 py-2 mb-6">
      <button
        onClick={() => router.push("/")}
        className="cursor-pointer flex items-center gap-1 px-3 py-1.5 text-sm sm:text-base rounded-lg text-white bg-green-600 hover:bg-green-700 transition-all duration-300 transform hover:scale-105 shadow-sm"
      >
        🏠 Home
      </button>
      <h1 className="text-xl sm:text-2xl font-bold text-gray-800">🛍️ Shop</h1>
      <h2 className="text-base sm:text-lg font-semibold text-gray-700">
        🎟️ Tickets: <span className="text-blue-600">{score?.tickets ?? 0}</span>
      </h2>
    </div>

    {/* Score Form */}
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-3xl bg-white shadow-lg rounded-2xl p-6 space-y-6"
    >
      <div className="space-y-4">
        <h3 className="text-center">Solve puzzles and gain tickets to unlock more countries</h3>
        <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
          🌍 Countries
          <span className="text-sm font-normal text-gray-500">
            (Cost: {calculatedCost} 🎟️)
          </span>
        </h2>

        {countries.map((country, index) => (
          <div
            key={index}
            className="p-4 border rounded-xl bg-gray-50 flex flex-col sm:flex-row gap-3 items-center shadow-sm"
          >
            <select
              value={country.name}
              onChange={(e) => updateCountry(index, "name", e.target.value)}
              className="cursor-pointer w-full sm:w-1/2 border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
            >
              <option value="">-- Select Country --</option>
              {availableCountries
                .filter(
                  (c) =>
                    !ownedCountries.includes(c) &&
                    !countries.some(
                      (selected, idx) => selected.name === c && idx !== index
                    )
                )
                .sort((a, b) => a.localeCompare(b)) // ✅ Alphabetical order
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
          className="cursor-pointer bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 shadow-md transition-transform transform hover:scale-105"
        >
          ➕ Add Country
        </button>
        <button
    type="button"
    onClick={() =>
      setCountries([{ name: "", unlock: true, score: 0, datePlayed: "" }])
    }
    className="cursor-pointer bg-orange-500 text-white mx-2 px-4 py-2 rounded-lg hover:bg-red-700 shadow-md transition-transform transform hover:scale-105"
  >
    🔄 Reset
  </button>
      </div>

      <button
  // onClick={() => window.location.reload()}
  type="submit"
  className="w-full sm:w-auto cursor-pointer bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 shadow-lg transition-transform transform hover:scale-105"
>
  Purchase
</button>

      <div className="flex items-center justify-center flex-col">

</div>
    </form>
    <div className="flex items-center flex-col justify-between w-full max-w-3xl bg-gray-100 backdrop-blur-sm rounded-2xl shadow-md px-4 py-2 mt-6"  >
    <h1>Accelerate Your Account with these premium offers:</h1>
  <button onClick={() => {router.push('/shop/pricing')}}
    className="cursor-pointer px-6 py-3 mt-2 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold shadow-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300">
  🚀 All Access
  </button>

    </div>


  </div>

  );
}
