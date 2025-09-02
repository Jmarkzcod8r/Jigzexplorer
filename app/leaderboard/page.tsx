"use client";
import React, { useEffect, useState } from "react";

const Page = () => {
  const [leaderboard, setLeaderboard] = useState<any>(null);

  // useEffect(() => {
  //   const fetchLeaderboard = async () => {
  //     let email = localStorage.getItem("email");
  //     let accessToken = localStorage.getItem("accessToken");

  //     if (!email || !accessToken) return;

  //     try {
  //       // Remove extra quotes if values were stringified
  //       try {
  //         email = JSON.parse(email);
  //       } catch {}
  //       try {
  //         accessToken = JSON.parse(accessToken);
  //       } catch {}

  //       const res = await fetch("/api/get/leaderboard", {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({ email, accessToken }),
  //       });

  //       const data = await res.json();
  //       setLeaderboard(data);
  //     } catch (err) {
  //       alert("Error fetching leaderboard");
  //     }
  //   };

  //   fetchLeaderboard();
  // }, []);

  return (
    <div
      className="font-sans flex flex-col items-center justify-center
                 min-h-screen p-8 pb-20 sm:p-20
                 bg-[url('/Bg.png')] bg-cover bg-center"
    >
      <h1 className="text-white text-2xl font-bold mb-4">Leaderboard</h1>
      <pre className="text-white text-sm">
        {leaderboard ? JSON.stringify(leaderboard, null, 2) : "Loading..."}
      </pre>
    </div>
  );
};

export default Page;
