"use client";

import React, { useEffect, useState } from "react";
import { ChevronUp, ChevronDown, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { db } from "../api/firebase/firebase-config";
import { doc, onSnapshot } from "firebase/firestore";

interface PlayerScore {
  tickets?: number;
  overallscore?: number;
}

const Page = () => {
  const [profile, setProfile] = useState<any>(null);
  const [score, setScore] = useState<PlayerScore | null>(null); // Firestore values
  const [countries, setCountries] = useState<Record<string, { score: number; datePlayed?: string }> | null>(null); // MongoDB
  const [sortType, setSortType] = useState<"country" | "score" | "date">("country");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [photoURL, setPhotoURL] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const uid = localStorage.getItem("uid");
    const email = localStorage.getItem("email");

    // ✅ If no email, auto logout
    if (!email) {
      localStorage.clear();
      router.push("/");
      return;
    }

    if (!uid) return;

    const cleanUid = uid.replace(/^"+|"+$/g, "");
    const cleanEmail = email.replace(/^"+|"+$/g, "");

    if (!cleanUid || !cleanEmail) {
      localStorage.clear();
      router.push("/");
      return;
    }

    // ✅ Firestore listener (tickets + overallscore)
    const unsubscribe = onSnapshot(
      doc(db, "Firebase-jigzexplorer-profiles", cleanUid),
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          console.log("📥 Firestore data:", data);

          setScore({
            tickets: data?.tickets ?? 0,
            overallscore: data?.overallscore ?? 0,
          });

          setProfile({
            displayName: data.displayName,
            email: data.email,
            photoURL: data.photoURL,
          });
        } else {
          console.log("❌ No Firestore document found for UID:", cleanUid);
        }
      }
    );

    // ✅ Fetch MongoDB countries
    const fetchCountries = async () => {
      try {
        const res = await fetch("/api/get/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: cleanEmail }),
        });

        const data = await res.json();
        if (data.success && data.score?.countries) {
          setCountries(data.score.countries);

          // Save discovered countries to localStorage
          const countryList = Object.keys(data.score.countries).map(
            (c) => c.charAt(0).toUpperCase() + c.slice(1)
          );
          const savedList = JSON.parse(localStorage.getItem("countryList") || "[]");
          const updatedList = Array.from(new Set([...savedList, ...countryList]));
          localStorage.setItem("countryList", JSON.stringify(updatedList));
        }
      } catch (err) {
        console.error("❌ Error fetching MongoDB countries:", err);
      }
    };

    fetchCountries();
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    setPhotoURL(localStorage.getItem("photoURL"));
  }, []);

  // Sorting logic
  const sortEntries = (entries: [string, any][]) => {
    const sorted = [...entries].sort((a, b) => {
      switch (sortType) {
        case "score":
          return (a[1].score || 0) - (b[1].score || 0);
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

  // Total score from MongoDB
  const totalScore = countries
    ? Object.values(countries).reduce((sum, c) => sum + (c.score || 0), 0)
    : 0;

  return (
    <div
      className="font-sans flex flex-col items-center justify-center
                 min-h-screen p-8 pb-20 sm:p-20
                 bg-[url('/Bg.png')] bg-cover bg-center"
    >
      {/* {profile ? ( */}
        <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-md text-center">
          {/* Header */}
          <div className="flex justify-around items-center">
            <button
              onClick={() => router.push("/")}
              className="cursor-pointer px-2 py-2 text-xs sm:text-lg rounded-lg text-white bg-green-600 hover:bg-green-700 transition-all duration-300 transform hover:scale-105"
            >
              🏠 Home
            </button>
            <div>
              {photoURL ? (
                <img
                  src={photoURL.replace(/"/g, "")}
                  alt="Profile"
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
              ) : (
                <User className="w-5 h-5" />
              )}
            </div>
            <button
              onClick={() => {
                localStorage.clear();
                router.push("/");
              }}
              className="cursor-pointer px-2 py-2 text-xs sm:text-lg rounded-lg text-white bg-green-600 hover:bg-green-700 transition-all duration-300 transform hover:scale-105"
            >
              ➡️ Logout
            </button>
          </div>

          {/* Info */}
          <h1 className="text-gray-700 mt-2">Email: {profile?.email}</h1>
          <p className="text-gray-700 font-medium">🎟️ Tickets: {score?.tickets ?? 0}</p>
          <p className="text-gray-700 font-medium">⭐ Overall Score: {score?.overallscore ?? 0}</p>
          <p className="text-gray-700 font-medium">🏆 Total Country Score: {totalScore}</p>

          {/* Countries */}
          <h2 className="text-lg font-semibold mt-4">Countries:</h2>

          {countries && Object.keys(countries).length > 0 ? (
            <>
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
                {sortEntries(Object.entries(countries)).map(([country, details]: any) => (
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
                        <span className="font-medium text-blue-600">{details.score}</span> | Last Played:{" "}
                        <span className="font-medium text-green-600">
                          {details.datePlayed ? new Date(details.datePlayed).toLocaleDateString() : "N/A"}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-gray-500 mt-3">Loading...</p>
          )}
        </div>
      {/* // ) : (
      //   <p className="text-white">Loading profile...</p>
      // )} */}
    </div>
  );
};

export default Page;


// "use client";

// export default function Login() {
//   return <>Login</>;
// }
