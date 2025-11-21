// "use client";

// import React, { useEffect, useState } from "react";
// import { User } from "lucide-react";
// import { doc, getDoc, updateDoc } from "firebase/firestore";
// import { db } from "@/app/api/firebase/firebase-config";
// import Swal from "sweetalert2";
// import Logo from "@/app/component/logo";

// const ProfilePage = () => {
//   const [photoURL, setPhotoURL] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     const storedPhoto = localStorage.getItem("photoURL");
//     if (storedPhoto) setPhotoURL(storedPhoto.replace(/"/g, ""));
//   }, []);

//   const handleCancelSubscription = async () => {
//     const uid = localStorage.getItem("uid");
//     if (!uid) {
//       Swal.fire("Error", "User not logged in.", "error");
//       return;
//     }

//     const result = await Swal.fire({
//       title: "Are you sure?",
//       text: "Do you want to cancel your subscription?",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonText: "Yes, cancel it!",
//       cancelButtonText: "No, keep it",
//     });

//     if (!result.isConfirmed) return;

//     setLoading(true);
//     try {
//       const userRef = doc(db, "Firebase-jigzexplorer-profiles", uid);
//       const userSnap = await getDoc(userRef);

//       if (!userSnap.exists()) {
//         Swal.fire("Error", "User profile not found.", "error");
//         return;
//       }

//       const subscriptionId = userSnap.data()?.premium?.subscriptionId;
//       if (!subscriptionId) {
//         Swal.fire("Error", "No active subscription found.", "error");
//         return;
//       }

//       // Call backend to cancel subscription
//       const response = await fetch("/api/paddle/cancel-subscription", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ subscriptionId }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         console.error("Paddle cancel error:", data);
//         Swal.fire("Error", "Failed to cancel subscription.", "error");
//         return;
//       }

//       // Update Firestore and localStorage
//       await updateDoc(userRef, {
//         "premium.status": "false",
//         "premium.subscriptionId": "",
//       });

//       localStorage.setItem("premium", "false");

//       Swal.fire("Canceled!", "Your subscription has been canceled.", "success");
//     } catch (err) {
//       console.error("Error cancelling subscription:", err);
//       Swal.fire("Error", "Something went wrong. Try again.", "error");
//     } finally {
//       setLoading(false);
//     }
//   };


//   return (
//     <div
//       className="font-sans flex flex-col items-center justify-center
//                  min-h-screen p-8 sm:p-20
//                  bg-[url('/Bg.png')] bg-cover bg-center"
//     >

//         <Logo/>
//       <div className="bg-white bg-opacity-80 p-6 rounded-xl shadow-md w-full max-w-md text-center flex flex-col items-center">
//         <div className="mb-6">
//           {photoURL ? (
//             <img
//               src={photoURL}
//               alt="Profile"
//               width={80}
//               height={80}
//               className="rounded-full object-cover"
//             />
//           ) : (
//             <User className="w-16 h-16" />
//           )}
//         </div>

//         <h1 className="text-lg font-semibold mb-4">Premium Package Status</h1>

//         <button
//           onClick={handleCancelSubscription}
//           disabled={loading}
//           className={`cursor-pointer mt-6 px-6 py-2 rounded text-white ${
//             loading ? "bg-gray-400" : "bg-red-500 hover:bg-red-600"
//           }`}
//         >
//           {loading ? "Processing..." : "Cancel Subscription"}
//         </button>
//       </div>
//     </div>
//   );
// };

// export default ProfilePage;

"use client";

import React from "react";
import { useUpdateUserProfile } from "@/app/lib/zustand/updateUserProfile";
import Logo from "@/app/component/logo";

export default function ProfileView() {
  const { user } = useUpdateUserProfile();

  if (!user) return <p>Loading user data...</p>;

  return (
    <div className="p-8 min-h-screen bg-gray-100 font-sans">
      <Logo />
      <h1 className="text-3xl font-bold mb-6">User Profile</h1>

      {/* Basic Info */}
      <div className="mb-6 p-4 bg-white shadow rounded">
        <h2 className="text-xl font-semibold mb-2">Basic Info</h2>
        <p><strong>Name:</strong> {user.displayName ?? "N/A"}</p>
        <p><strong>Email:</strong> {user.email ?? "N/A"}</p>
        <p><strong>Email Verified:</strong> {user.emailVerified ? "Yes" : "No"}</p>
        <p><strong>UID:</strong> {user.uid ?? "N/A"}</p>
        {user.photoURL && (
          <img
            src={user.photoURL}
            alt="User Photo"
            className="w-24 h-24 rounded-full mt-2"
          />
        )}
      </div>

      {/* Premium & Scores */}
      <div className="mb-6 p-4 bg-white shadow rounded">
        <h2 className="text-xl font-semibold mb-2">Account Info</h2>
        <p>
          <strong>Premium Status:</strong>{" "}
          {user.subscription?.status ?? "Freemium"}
        </p>
        <p><strong>Tickets:</strong> {user.tickets ?? 0}</p>
        <p><strong>Overall Score:</strong> {user.overallscore ?? 0}</p>
      </div>

      {/* Settings */}
      <div className="mb-6 p-4 bg-white shadow rounded">
        <h2 className="text-xl font-semibold mb-2">Game Settings</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <p><strong>Tokens:</strong> {user.settings.tokens ?? 0}</p>
          <p><strong>Streak Multiplier:</strong> {user.settings.streakMultiplier ?? 1}x</p>
          <p><strong>Time Multiplier:</strong> {user.settings.timeMultiplier ?? 1}x</p>
          <p><strong>Time Duration:</strong> {user.settings.timeDuration ?? 60}s</p>
          <p><strong>Turbo Bonus:</strong> {user.settings.turboBonus ?? 0}</p>
          <p><strong>Turbo Countdown:</strong> {user.settings.turbocountdown ?? 30}s</p>
          <p><strong>Puzzle Completion Score:</strong> {user.settings.puzzlecompletionscore ?? 50}</p>
        </div>
      </div>

      {/* Country Scores */}
      <div className="p-4 bg-white shadow rounded">
        <h2 className="text-xl font-semibold mb-2">Country Scores</h2>
        {Object.keys(user.countries).length === 0 ? (
          <p className="text-gray-500">No country scores yet. Start playing to earn scores!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Object.entries(user.countries).map(([country, data]) => (
              <div
                key={country}
                className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                <div className="font-semibold text-blue-600 capitalize">
                  {country.replace(/_/g, " ")}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  <div>Score: <span className="font-medium">{data.score ?? 0}</span></div>
                  <div>ATH: <span className="font-medium">{data.ATH ?? 0}</span></div>
                  <div>
                    Unlocked:{" "}
                    <span className={data.unlock ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                      {data.unlock ? "Yes" : "No"}
                    </span>
                  </div>
                  <div>Last Played: {data.lastplayed ?? 0}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Debug Info (optional) */}
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h3 className="text-lg font-semibold mb-2 text-yellow-800">Debug Info</h3>
        <h2 className="text-sm text-yellow-700">
          Total Countries: {Object.keys(user.countries).length}
        </h2>
        <details className="mt-2">
          <summary className="cursor-pointer text-sm text-yellow-700">Raw User Data</summary>
          <pre className="text-xs mt-2 p-2 bg-white rounded border overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}
