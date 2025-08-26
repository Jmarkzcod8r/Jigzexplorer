"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Flag, User, Trophy, Settings as SettingsIcon, ArrowLeft } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [menu, setMenu] = useState<"main" | "countries">("main");

  const available_countries = ["Denmark", "Estonia", "Finland", "France", "Germany", "Switzerland"];

  const countries = [
    "Denmark", "Estonia", "Finland", "Iceland", "Ireland", "Latvia", "Lithuania",
    "Norway", "Sweden", "United Kingdom", "Austria", "Belgium", "France", "Germany",
    "Liechtenstein", "Luxembourg", "Monaco", "Netherlands", "Switzerland", "Albania",
    "Andorra", "Bosnia and Herzegovina", "Croatia", "Greece", "Italy", "Malta",
    "Montenegro", "North Macedonia", "Portugal", "San Marino", "Serbia", "Slovenia",
    "Spain", "Vatican City", "Belarus", "Bulgaria", "Czechia", "Hungary", "Moldova",
    "Poland", "Romania", "Slovakia", "Ukraine"
  ];

  return (
    <div
      className="font-sans flex flex-col items-center justify-center
                 min-h-screen p-8 pb-20 sm:p-20
                 bg-[url('/Bg.png')] bg-cover bg-center"
    >
      {/* MAIN MENU */}
      {menu === "main" && (
        <div className="flex flex-col gap-4 items-center">
          <button
            onClick={() => setMenu("countries")}
            className="flex items-center gap-2 px-6 py-3 bg-white opacity-80 text-gray-800 rounded-lg
                       shadow hover:bg-blue-600 hover:text-white transition duration-300"
          >
            <Flag className="w-5 h-5" />
            Start
          </button>

          <button
            onClick={() => setMenu("countries")}
            className="flex items-center gap-2 px-6 py-3 bg-white opacity-80 text-gray-800 rounded-lg
                       shadow hover:bg-blue-600 hover:text-white transition duration-300"
          >
            <User className="w-5 h-5" />
            Profile
          </button>

          <button
            onClick={() => router.push("/leaderboard")}
            className="flex items-center gap-2 px-6 py-3 bg-white opacity-80 text-gray-800 rounded-lg
                       shadow hover:bg-blue-600 hover:text-white transition duration-300"
          >
            <Trophy className="w-5 h-5" />
            Leaderboard
          </button>

          <button
            onClick={() => router.push("/settings")}
            className="flex items-center gap-2 px-6 py-3 bg-white opacity-80 text-gray-800 rounded-lg
                       shadow hover:bg-blue-600 hover:text-white transition duration-300"
          >
            <SettingsIcon className="w-5 h-5" />
            Settings
          </button>
        </div>
      )}

      {/* COUNTRIES GRID */}
      {menu === "countries" && (
        <div
          className="grid grid-rows-12 grid-cols-4 items-center justify-items-center
                     gap-1 w-full"
        >
          {/* Back button */}
          <button
            onClick={() => setMenu("main")}
            className="col-span-4 mb-4 flex items-center gap-2 px-4 py-2 bg-gray-200
                       text-gray-700 rounded-lg shadow hover:bg-gray-400 transition duration-300"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          {countries.map((country, index) => {
            const isAvailable = available_countries.includes(country);

            return (
              <button
              key={index}
              onClick={() =>
                isAvailable &&
                router.push(`/country/${encodeURIComponent(country.toLowerCase().replace(/\s+/g, "-"))}`)
              }
              disabled={!isAvailable}
              className={`px-4 py-2 rounded-lg shadow transition duration-300 transform
                ${isAvailable
                  ? "bg-white opacity-80 text-gray-800 hover:bg-blue-600 hover:text-white hover:scale-110"
                  : " text-gray-400 bg-white cursor-not-allowed shadow-none"
                }`}
            >
              {country}
            </button>

            );
          })}
        </div>
      )}
    </div>
  );
}
