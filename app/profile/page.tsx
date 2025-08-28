"use client";

import React, { useEffect, useState } from "react";

const Page = () => {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const email = localStorage.getItem("email");
    if (!email) return;

    const cleanEmail = email ? email.replace(/^"+|"+$/g, '') : '';
    if (!email) return;

    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/get/profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: cleanEmail }),
        });

        const data = await res.json();

        if (data.success) {
          setProfile(data.data);
        } else {
          console.error("Profile fetch failed:", data.error);
        }
      } catch (err) {
        console.error("❌ Error fetching profile:", err);
      }
    };

    fetchProfile();
  }, []);

  return (
    <div
      className="font-sans flex flex-col items-center justify-center
                 min-h-screen p-8 pb-20 sm:p-20
                 bg-[url('/Bg.png')] bg-cover bg-center"
    >
      {profile ? (
        <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-md text-center">
          <h1 className="text-2xl font-bold mb-2">{profile.email}</h1>
          <p className="text-gray-700">Tickets: {profile.tickets}</p>
          <p className="text-gray-700">Overall Score: {profile.overallScore}</p>
          <h2 className="text-lg font-semibold mt-4">Countries:</h2>
          <ul className="mt-2 text-left">
            {profile.countries &&
              Object.entries(profile.countries).map(([country, details]: any) => (
                <li key={country} className="mb-1">
                  <span className="font-bold">{country}:</span>{" "}
                  {details.unlock ? "Unlocked" : "Locked"}, Score: {details.score},{" "}
                  Last Played: {details.datePlayed
                    ? new Date(details.datePlayed).toLocaleDateString()
                    : "N/A"}
                </li>
              ))}
          </ul>
        </div>
      ) : (
        <p className="text-white">Loading profile...</p>
      )}
    </div>
  );
};

export default Page;
