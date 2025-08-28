"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Flag, User, Trophy, Settings as SettingsIcon, ArrowLeft, ShoppingCart } from "lucide-react";
import Swal from "sweetalert2";

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

  const handleClick = () => {
    const email = localStorage.getItem("email");

    if (email) {
      // 👈 if email exists in localStorage, go to profile
      router.push("/profile");
    } else {
      // 👈 if no email, show SweetAlert
      Swal.fire({
        title: "Sign In Required",
        text: "Proceed to Login page?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Proceed",
        cancelButtonText: "Stay",
        confirmButtonColor: "#2563eb", // Tailwind blue-600
        cancelButtonColor: "#6b7280",  // Tailwind gray-500
      }).then((result) => {
        if (result.isConfirmed) {
          router.push("/login"); // 👈 redirect if proceed
        }
      });
    }
  };


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
                    shadow hover:bg-blue-600 hover:text-white transition duration-300 cursor-pointer"
       >
         <Flag className="w-5 h-5" />
         Start
       </button>

       <button
        //  onClick={() => router.push("/profile")}
        onClick={handleClick}
        className="flex items-center gap-2 px-6 py-3 bg-white opacity-80 text-gray-800 rounded-lg
                    shadow hover:bg-blue-600 hover:text-white transition duration-300 cursor-pointer"
       >
         <User className="w-5 h-5" />
         Profile
       </button>

       <button
         onClick={() => router.push("/leaderboard")}
         className="flex items-center gap-2 px-6 py-3 bg-white opacity-80 text-gray-800 rounded-lg
                    shadow hover:bg-blue-600 hover:text-white transition duration-300 cursor-pointer"
       >
         <Trophy className="w-5 h-5" />
         Leaderboard
       </button>

       <button
         onClick={() => router.push("/settings")}
         className="flex items-center gap-2 px-6 py-3 bg-white opacity-80 text-gray-800 rounded-lg
                    shadow hover:bg-blue-600 hover:text-white transition duration-300 cursor-pointer"
       >
         <SettingsIcon className="w-5 h-5" />
         Settings
       </button>

       <button
         onClick={() => router.push("/shop")}
         className="flex items-center gap-2 px-6 py-3 bg-white opacity-80 text-gray-800 rounded-lg
                    shadow hover:bg-blue-600 hover:text-white transition duration-300 cursor-pointer"
       >
         <ShoppingCart className="w-5 h-5" />
         Shop
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
                  ? "bg-white opacity-80 text-gray-800 hover:bg-blue-600 hover:text-white hover:scale-110 cursor-pointer"
                  : "text-gray-400 bg-white cursor-not-allowed shadow-none"
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
