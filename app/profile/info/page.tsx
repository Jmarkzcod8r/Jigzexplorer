"use client";

import React, { useEffect, useState } from "react";
import { User } from "lucide-react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/app/api/firebase/firebase-config";
import Swal from "sweetalert2";
import Logo from "@/app/component/logo";

const ProfilePage = () => {
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedPhoto = localStorage.getItem("photoURL");
    if (storedPhoto) setPhotoURL(storedPhoto.replace(/"/g, ""));
  }, []);

  const handleCancelSubscription = async () => {
    const uid = localStorage.getItem("uid");
    if (!uid) {
      Swal.fire("Error", "User not logged in.", "error");
      return;
    }

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to cancel your subscription?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, cancel it!",
      cancelButtonText: "No, keep it",
    });

    if (!result.isConfirmed) return;

    setLoading(true);
    try {
      const userRef = doc(db, "Firebase-jigzexplorer-profiles", uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        Swal.fire("Error", "User profile not found.", "error");
        return;
      }

      const subscriptionId = userSnap.data()?.premium?.subscriptionId;
      if (!subscriptionId) {
        Swal.fire("Error", "No active subscription found.", "error");
        return;
      }

      // Call backend to cancel subscription
      const response = await fetch("/api/paddle/cancel-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Paddle cancel error:", data);
        Swal.fire("Error", "Failed to cancel subscription.", "error");
        return;
      }

      // Update Firestore and localStorage
      await updateDoc(userRef, {
        "premium.status": "false",
        "premium.subscriptionId": "",
      });

      localStorage.setItem("premium", "false");

      Swal.fire("Canceled!", "Your subscription has been canceled.", "success");
    } catch (err) {
      console.error("Error cancelling subscription:", err);
      Swal.fire("Error", "Something went wrong. Try again.", "error");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div
      className="font-sans flex flex-col items-center justify-center
                 min-h-screen p-8 sm:p-20
                 bg-[url('/Bg.png')] bg-cover bg-center"
    >
        <Logo/>
      <div className="bg-white bg-opacity-80 p-6 rounded-xl shadow-md w-full max-w-md text-center flex flex-col items-center">
        <div className="mb-6">
          {photoURL ? (
            <img
              src={photoURL}
              alt="Profile"
              width={80}
              height={80}
              className="rounded-full object-cover"
            />
          ) : (
            <User className="w-16 h-16" />
          )}
        </div>

        <h1 className="text-lg font-semibold mb-4">Premium Package Status</h1>

        <button
          onClick={handleCancelSubscription}
          disabled={loading}
          className={`cursor-pointer mt-6 px-6 py-2 rounded text-white ${
            loading ? "bg-gray-400" : "bg-red-500 hover:bg-red-600"
          }`}
        >
          {loading ? "Processing..." : "Cancel Subscription"}
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
