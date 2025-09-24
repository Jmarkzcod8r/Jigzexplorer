"use client";


import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";import {
  Flag,
  User,
  Trophy,
  Settings as SettingsIcon,
  ArrowLeft,
  ShoppingCart,
  Plug, // ✅ added connect icon
  Globe
} from "lucide-react";
import Swal from "sweetalert2";
import Image from "next/image";
import Logo from "./component/logo";
import GlobeButton from "./component/globe";


export default function Home() {
  const router = useRouter();
  const [menu, setMenu] = useState<"main" | "countries">("main");
  const [photoURL, setPhotoURL] = useState<string | null>(null);

  // 🔹 Default countries
  const default_countries = [ "Estonia", "Finland", "France", "Germany", "Switzerland"];

  // 🔹 All available countries
  const countries = [
    "Denmark", "Estonia", "Finland", "Iceland", "Ireland", "Latvia", "Lithuania",
    "Norway", "Sweden", "United Kingdom", "Austria", "Belgium", "France", "Germany",
    "Liechtenstein", "Luxembourg", "Monaco", "Netherlands", "Switzerland", "Albania",
    "Andorra", "Bosnia and Herzegovina", "Croatia", "Greece", "Italy", "Malta",
    "Montenegro", "North Macedonia", "Portugal", "San Marino", "Serbia", "Slovenia",
    "Spain", "Vatican City", "Belarus", "Bulgaria", "Czechia", "Hungary", "Moldova",
    "Poland", "Romania", "Slovakia", "Ukraine"
  ];

  // 🔹 State for merged available countries
  const [availableCountries, setAvailableCountries] = useState<string[]>(default_countries);

  // 🔹 On mount, load localStorage countryList and merge
  useEffect(() => {
    setPhotoURL(localStorage.getItem("photoURL"));
    const storedList = localStorage.getItem("countryList");

    if (storedList) {
      try {
        const parsedList: string[] = JSON.parse(storedList);

            if (Array.isArray(parsedList)) {
              // Title Case: every word's first letter capitalized
              const normalizedList = parsedList.map((item: string) =>
                item
                  .trim()
                  .toLowerCase()
                  .split(" ")
                  .map(
                    (word) => word.charAt(0).toUpperCase() + word.slice(1)
                  )
                  .join(" ")
              );

              setAvailableCountries([
                ...new Set([...default_countries, ...normalizedList]),
              ]);
            }

      } catch (e) {
        console.error("Invalid countryList in localStorage:", e);
      }
    }
  }, []);


  const redirect_login_profile = () => {
    const email = localStorage.getItem("email");

    if (email) {
      router.push("/profile");
    } else {
      Swal.fire({
        title: "Sign In Required",
        text: "Proceed to Login page?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Proceed",
        cancelButtonText: "Stay",
        confirmButtonColor: "#2563eb",
        cancelButtonColor: "#6b7280",
      }).then((result) => {
        if (result.isConfirmed) {
          router.push("/login");
        }
      });
    }
  };

  const redirect_login_shop = () => {
    const email = localStorage.getItem("email");

    if (email) {
      router.push("/shop");
    } else {
      Swal.fire({
        title: "Sign In Required",
        text: "Proceed to Login page?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Proceed",
        cancelButtonText: "Stay",
        confirmButtonColor: "#2563eb",
        cancelButtonColor: "#6b7280",
      }).then((result) => {
        if (result.isConfirmed) {
          router.push("/login");
        }
      });
    }
  };


  // ✅ Map of country → emoji flag
const countryFlags: Record<string, string> = {
  "Denmark": "🇩🇰",
  "Estonia": "🇪🇪",
  "Finland": "🇫🇮",
  "Iceland": "🇮🇸",
  "Ireland": "🇮🇪",
  "Latvia": "🇱🇻",
  "Lithuania": "🇱🇹",
  "Norway": "🇳🇴",
  "Sweden": "🇸🇪",
  "United Kingdom": "🇬🇧",
  "Austria": "🇦🇹",
  "Belgium": "🇧🇪",
  "France": "🇫🇷",
  "Germany": "🇩🇪",
  "Liechtenstein": "🇱🇮",
  "Luxembourg": "🇱🇺",
  "Monaco": "🇲🇨",
  "Netherlands": "🇳🇱",
  "Switzerland": "🇨🇭",
  "Albania": "🇦🇱",
  "Andorra": "🇦🇩",
  "Bosnia and Herzegovina": "🇧🇦",
  "Croatia": "🇭🇷",
  "Greece": "🇬🇷",
  "Italy": "🇮🇹",
  "Malta": "🇲🇹",
  "Montenegro": "🇲🇪",
  "North Macedonia": "🇲🇰",
  "Portugal": "🇵🇹",
  "San Marino": "🇸🇲",
  "Serbia": "🇷🇸",
  "Slovenia": "🇸🇮",
  "Spain": "🇪🇸",
  "Vatican City": "🇻🇦",
  "Belarus": "🇧🇾",
  "Bulgaria": "🇧🇬",
  "Czechia": "🇨🇿",
  "Hungary": "🇭🇺",
  "Moldova": "🇲🇩",
  "Poland": "🇵🇱",
  "Romania": "🇷🇴",
  "Slovakia": "🇸🇰",
  "Ukraine": "🇺🇦",
};


  return (
    <div
      className="font-sans flex flex-col items-center
                 min-h-screen p-8 pb-20 sm:p-20
                 bg-[url('/Bg.png')] bg-cover bg-center"
    >
      <div onClick={()=> {if(menu=='countries') {setMenu('main')}}}
      > <Logo/></div>

      {/* MAIN MENU */}
{menu === "main" && (
  <div className="flex flex-col gap-4 justify-center mt-40 max-w-xs sm:max-w-md">
    <button
      onClick={() => setMenu("countries")}
      className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-white opacity-80
                 text-gray-800 rounded-lg text-lg sm:text-2xl shadow
                 hover:bg-blue-600 hover:text-white transition duration-300 cursor-pointer  justify-center"
    >
      <Flag className="w-4 h-4 sm:w-5 sm:h-5" />
      Start
    </button>

    <button
      onClick={redirect_login_profile}
      className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-white opacity-80
                 text-gray-800 rounded-lg text-lg sm:text-2xl shadow
                 hover:bg-blue-600 hover:text-white transition duration-300 cursor-pointer  justify-center"
    >
      {photoURL ? (
        <img
          src={photoURL.replace(/"/g, "")}
          alt="Profile"
          width={24}
          height={24}
          className="sm:w-[30px] sm:h-[30px] rounded-full object-cover"
        />
      ) : (
        <User className="w-4 h-4 sm:w-5 sm:h-5" />
      )}
      Profile
    </button>

    <button
      onClick={() => router.push("/leaderboard")}
      className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-white opacity-80
                 text-gray-800 rounded-lg text-lg sm:text-2xl shadow
                 hover:bg-blue-600 hover:text-white transition duration-300 cursor-pointer  justify-center"
    >
      <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
      Leaderboard
    </button>

    <button
      onClick={redirect_login_shop}
      className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-white opacity-80
                 text-gray-800 rounded-lg text-lg sm:text-2xl shadow
                 hover:bg-blue-600 hover:text-white transition duration-300 cursor-pointer  justify-center"
    >
      <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
      Shop
    </button>

    {/* <button
      onClick={() => router.push("/connect")}
      className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-white opacity-80
                 text-gray-800 rounded-lg text-lg sm:text-2xl shadow
                 hover:bg-green-600 hover:text-white transition duration-300 cursor-pointer  justify-center"
    >
      <Plug className="w-4 h-4 sm:w-5 sm:h-5" />
      Connect
    </button> */}
  </div>
)}


{/* COUNTRIES GRID */}
{menu === "countries" && (
  <div
    className="grid grid-cols-3 sm:grid-cols-4 items-center justify-items-center
               gap-1 "
  >
    {/* Top controls: Back + Marathon + Progress */}
    <div className="col-span-3 sm:col-span-4 flex justify-center gap-4 sm:gap-10 items-center  mb-4 px-2">
      {/* Back button */}
      <div
          // onClick={() => setMenu("main")}
          // className="cursor-pointer flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-200
          //           text-gray-700 rounded-lg shadow hover:bg-gray-400 transition duration-300 text-sm sm:text-base"
        >
          {/* <Globe className="w-4 h-4 sm:w-5 sm:h-5" /> */}
          <GlobeButton setMenu={function (menu: string): void {
                throw new Error("Function not implemented.");
              } }/>
        </div>

      {/* Marathon button */}
      {/* <button
        onClick={() => router.push("/marathon")}
        className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-yellow-400
                   text-gray-800 rounded-lg shadow hover:bg-yellow-500 transition duration-300 text-sm sm:text-base"
      >
        🏃 Marathon
      </button> */}

      {/* Progress label */}
      <span className="text-xs sm:text-sm  text-gray-800 bg-gray-300 p-3 rounded-md">
        {availableCountries.length}/{countries.length} (
        {((availableCountries.length / countries.length) * 100).toFixed(1)}%)
      </span>
    </div>

    {/* Country buttons */}
    {countries.map((country, index) => {
      const isAvailable = availableCountries.includes(country);
      const flagEmoji = countryFlags[country] || "🏳️"; // fallback flag

      return (
        <button
          key={index}
          onClick={() =>
            isAvailable &&
            router.push(
              `/country/${encodeURIComponent(
                country.toLowerCase().replace(/\s+/g, "-")
              )}`
            )
          }
          disabled={!isAvailable}
          className={`flex items-center gap-2 px-2 sm:px-4 py-2 rounded-lg shadow transition duration-300 transform text-xs sm:text-base
            ${
              isAvailable
                ? "bg-blue-200 opacity-95 text-gray-800 hover:bg-blue-600 hover:text-white hover:scale-105 cursor-pointer"
                : "text-gray-400 bg-white cursor-not-allowed shadow-none opacity-70"
            }`}
        >
          <span className="text-base sm:text-lg">{flagEmoji}</span>
          {country}
        </button>
      );
    })}
  </div>
)}

    </div>
  );
}
