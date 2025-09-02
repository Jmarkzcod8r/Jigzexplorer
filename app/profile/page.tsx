"use client";

import React, { useEffect, useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react"; // icons
import { useParams, useRouter } from "next/navigation";


const Page = () => {
  const [profile, setProfile] = useState<any>(null);
  const [score, setScore] = useState<any>(null);
  const [sortType, setSortType] = useState<"country" | "score" | "date">("country");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const router = useRouter();
  useEffect(() => {
    const email = localStorage.getItem("email");
    if (!email) return;

    const cleanEmail = email ? email.replace(/^"+|"+$/g, "") : "";
    if (!email) return;

    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/get/profile", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: cleanEmail }),
        });

        const data = await res.json();

        if (data.success) {
          // Extract countries from response
          const countryList = Object.keys(data.score.countries).map(
            (c) => c.charAt(0) + c.slice(1) // Capitalize first letter
          );

          // Get existing list from localStorage (if any)
          const savedList = JSON.parse(localStorage.getItem("countryList") || "[]");

          // Merge and remove duplicates
          const updatedList = Array.from(new Set([...savedList, ...countryList]));

          // Save back to localStorage
          localStorage.setItem("countryList", JSON.stringify(updatedList));

          setProfile(data.profile);
          if (data.score) {
            setScore(data.score);
          }

        } else {
          console.error("Profile fetch failed:", data.error);
        }
      } catch (err) {
        console.error("❌ Error fetching profile:", err);
      }
    };

    fetchProfile();
  }, []);

  // Sorting function
  const sortEntries = (entries: [string, any][]) => {
    const sorted = [...entries].sort((a, b) => {
      switch (sortType) {
        case "score":
          return a[1].score - b[1].score;
        case "date": {
          const dateA = a[1].datePlayed ? new Date(a[1].datePlayed).getTime() : 0;
          const dateB = b[1].datePlayed ? new Date(b[1].datePlayed).getTime() : 0;
          return dateA - dateB;
        }
        case "country":
        default:
          return a[0].localeCompare(b[0]);
      }
    });

    return sortOrder === "asc" ? sorted : sorted.reverse();
  };

  return (
    <div
      className="font-sans flex flex-col items-center justify-center
                 min-h-screen p-8 pb-20 sm:p-20
                 bg-[url('/Bg.png')] bg-cover bg-center"
    >

      {profile ? (
        <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-md text-center">
          <div className="flex justify-around">
          <button
          onClick={() => router.push("/")}
          className="cursor-pointer px-2 py-2 text-xs sm:text-lg rounded-lg text-white bg-green-600 hover:bg-green-700 transition-all duration-300 transform hover:scale-105"
          >
          🏠 Home
        </button>
        <button
            onClick={()=>  {localStorage.clear();  router.push("/");}}
            className="cursor-pointer px-2 py-2 text-xs sm:text-lg rounded-lg text-white bg-green-600 hover:bg-green-700 transition-all duration-300 transform hover:scale-105"
          >➡️ Logout</button>
          </div>

          <h1 className="text-gray-700">Email: {profile.email}</h1>
          <p className="text-gray-700">Tickets: {score? score.tickets:''}</p>
          <p className="text-gray-700">Overall Score: {score? score.overallScore: ''}</p>

          <h2 className="text-lg font-semibold mt-4">Countries:</h2>

          {/* Sorting Controls */}
          <div className="flex gap-2 mt-3 mb-4 justify-center items-center">
            <button
              onClick={() => setSortType("country")}
              className={`cursor-pointer px-3 py-1 rounded-lg text-sm ${
                sortType === "country" ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              Sort by Name
            </button>
            <button
              onClick={() => setSortType("score")}
              className={`cursor-pointer px-3 py-1 rounded-lg text-sm ${
                sortType === "score" ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              Sort by Score
            </button>
            <button
              onClick={() => setSortType("date")}
              className={`cursor-pointer px-3 py-1 rounded-lg text-sm ${
                sortType === "date" ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              Sort by Last Played
            </button>

            {/* Asc/Desc Toggle */}
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="cursor-pointer ml-2 p-2 rounded-lg bg-gray-200 hover:bg-gray-300"
              title="Toggle ascending/descending"
            >
              {sortOrder === "asc" ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>

          {/* List */}
          <ul className="mt-2 text-left">
          {score && score.countries ? (
  sortEntries(Object.entries(score.countries)).map(([country, details]: any) => (
    <li
      key={country}
      className="mb-2 p-3 bg-white shadow rounded-lg flex justify-between items-center"
    >
      <div>
        <span className="font-semibold text-lg text-gray-800">
          {country.charAt(0).toUpperCase() + country.slice(1)}
        </span>
        <div className="text-sm text-gray-600">
          Score:{" "}
          <span className="font-medium text-blue-600">{details.score}</span> |{" "}
          Last Played:{" "}
          <span className="font-medium text-green-600">
            {details.datePlayed
              ? new Date(details.datePlayed).toLocaleDateString()
              : "N/A"}
          </span>
        </div>
      </div>
    </li>
  ))
) : (
  ""
)}

          </ul>
        </div>
      ) : (
        <p className="text-white">Loading profile...</p>
      )}
    </div>
  );
};

export default Page;
