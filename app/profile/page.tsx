"use client";

import React, { useState } from "react";
import { ChevronUp, ChevronDown, User } from "lucide-react";
import { useRouter } from "next/navigation";
import Logo from "../component/logo";
import { useUpdateUserProfile } from "../lib/zustand/updateUserProfile";

const Page = () => {
  const router = useRouter();
  const { user, updateCountryScore, updatezCountry, resetUserProfile } = useUpdateUserProfile();
  const [sortType, setSortType] = useState<"country" | "score" | "ATH" | "lastplayed">("country");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  if (!user) return <p>Loading...</p>;

  const countries = user.countries;
  const score = { tickets: user.tickets, overallscore: user.overallscore };
  const photoURL = user.photoURL;

  // Sorting logic
  const sortEntries = (entries: [string, any][]) => {
    const sorted = [...entries].sort((a, b) => {
      switch (sortType) {
        case "score":
          return (a[1].score || 0) - (b[1].score || 0);
        case "ATH":
          return (a[1].ATH || 0) - (b[1].ATH || 0);
        case "lastplayed":
          return (a[1].lastplayed || 0) - (b[1].lastplayed || 0);
        case "country":

        default:
          return a[0].localeCompare(b[0]);
      }
    });
    return sortOrder === "asc" ? sorted : sorted.reverse();
  };

  const toggleSort = (type: "country" | "score" | "ATH" | "lastplayed") => {
    if (sortType === type) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortType(type);
      setSortOrder("asc");
    }
  };

  return (
    <div className="font-sans flex flex-col items-center min-h-screen p-8 pb-20 sm:p-20 bg-[url('/Bg.png')] bg-cover bg-center">
      {/* Logo */}
      <Logo />

      {/* Header */}
      <div className="flex justify-around items-center w-full max-w-lg mb-4">
        <button
          onClick={() => router.push("/")}
          className="cursor-pointer px-2 py-2 text-xs sm:text-lg rounded-lg text-white bg-green-600 hover:bg-green-700 transition-all duration-300 transform hover:scale-105"
        >
          🏠 Home
        </button>
        <button className="cursor-pointer hover:scale-140" onClick={() => router.push("/profile/info")}>
          {photoURL ? (
            <img
              src={photoURL.replace(/"/g, "")}
              alt="Profile"
              width={60}
              height={60}
              className="rounded-full object-cover"
            />
          ) : (
            <User className="w-5 h-5" />
          )}
        </button>
        <button
          onClick={() => {
            localStorage.clear();
            router.push("/");
            resetUserProfile();
          }}
          className="cursor-pointer px-2 py-2 text-xs sm:text-lg rounded-lg text-white bg-green-600 hover:bg-green-700 transition-all duration-300 transform hover:scale-105"
        >
          ➡️ Logout
        </button>
      </div>

      {/* Tickets & Overall */}
      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-lg text-center mb-4">
      <p className="text-gray-700 font-medium">🔥 Status: {user.premium.status}</p>
        <p className="text-gray-700 font-medium">🎟️ Tickets: {score.tickets}</p>
        <p className="text-gray-700 font-medium">⭐ Overall Score: {score.overallscore}</p>
      </div>

      {/* Countries */}
      <div className="p-4 bg-white shadow rounded max-h-[500px] overflow-y-auto w-full max-w-lg">
        <h2 className="text-xl font-semibold mb-2">Country Scores</h2>

        {Object.keys(countries).length === 0 ? (
          <p className="text-gray-500">No country scores yet. Start playing to earn scores!</p>
        ) : (
          <>
            {/* Sort Buttons */}
<div className="flex justify-between items-center mb-2 font-medium">
  <button
    className="flex items-center gap-1 text-blue-600 cursor-pointer"
    onClick={() => toggleSort("country")}
  >
    Country
    {sortType === "country" && (sortOrder === "asc" ? <ChevronUp /> : <ChevronDown />)}
  </button>
  <button
    className="flex items-center gap-1 text-blue-600 cursor-pointer"
    onClick={() => toggleSort("score")}
  >
    Score
    {sortType === "score" && (sortOrder === "asc" ? <ChevronUp /> : <ChevronDown />)}
  </button>
  <button
    className="flex items-center gap-1 text-blue-600 cursor-pointer"
    onClick={() => toggleSort("ATH")}
  >
    ATH
    {sortType === "ATH" && (sortOrder === "asc" ? <ChevronUp /> : <ChevronDown />)}
  </button>
  <button
    className="flex items-center gap-1 text-blue-600 cursor-pointer"
    onClick={() => toggleSort("lastplayed")}
  >
    Last Played
    {sortType === "lastplayed" && (sortOrder === "asc" ? <ChevronUp /> : <ChevronDown />)}
  </button>
</div>



            {/* Country List */}
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-2">
              {sortEntries(Object.entries(countries)).map(([country, data]) => (
                <div
                  key={country}
                  className="flex flex-row gap-1 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  <div className="font-semibold text-blue-600 capitalize">
                    {country.replace(/_/g, " ")}
                  </div>

                    <div>
                      Score: <span className="font-medium">{data.score}</span>
                    </div>
                    <div>
                      ATH: <span className="font-medium">{data.ATH}</span>
                    </div>

                    <div>
                        Last Played:{" "}
                        {data.lastplayed > 0
                          ? new Date(data.lastplayed).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "—"}
                      </div>


                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Page;


// "use client";

// export default function Login() {
//   return <>Login</>;
// }
