"use client";

import React, { useState } from "react";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../api/firebase/firebase-config";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useUpdateUserProfile } from "../lib/zustand/updateUserProfile";



export default function ResetPage() {
    // if (!window.confirm("Are you sure you want to delete all your data?")) return;

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const user = useUpdateUserProfile()

  const handleReset = async () => {
    try {
      setLoading(true);
      setStatus("Processing...");

      const uid = user.user.uid
      const email = user.user.email

      if (!uid || !email) {
        setStatus("⚠️ No user found in local storage.");
        setLoading(false);
        return;
      }

      // 🧹 1️⃣ Delete Firestore data
      const userRef = doc(db, "Firebase-jigzexplorer-profiles", uid);
      await deleteDoc(userRef);
      console.log("✅ Firestore profile deleted.");

        user.resetUserProfile()



      // 🧹 2️⃣ Delete MongoDB data
      await axios.delete(`/api/post/profile?email=${email}`);
      console.log("✅ MongoDB profile & score deleted.");

      // 🧹 3️⃣ Clear Local Storage
      localStorage.clear();

      setStatus("✅ All user data has been successfully cleared.");
      setTimeout(() => router.push("/"), 2000);
    } catch (error) {
      console.error("❌ Error during reset:", error);
      setStatus("❌ Failed to reset data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[url('/Bg.png')] bg-cover bg-center p-6">
      <div className="bg-white bg-opacity-80 rounded-2xl shadow-lg p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Reset Account Data</h1>
        <p className="mb-6 text-gray-700">
          This will permanently delete your data from both Firestore and MongoDB.
        </p>

        <button
          onClick={handleReset}
          disabled={loading}
          className={`px-6 py-3 rounded-full font-semibold text-white ${
            loading ? "bg-gray-400" : "bg-red-600 hover:bg-red-700"
          } transition`}
        >
          {loading ? "Deleting..." : "Reset My Account"}
        </button>

        {status && <p className="mt-4 text-sm text-gray-800">{status}</p>}
      </div>
    </div>
  );
}
