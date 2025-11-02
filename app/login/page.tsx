"use client";

import React from "react";
import { FcGoogle } from "react-icons/fc";
import { useRouter } from "next/navigation";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { apptry, db } from "../api/firebase/firebase-config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import axios from "axios";
import { useUpdateUserProfile } from "../lib/zustand/updateUserProfile";

export default function Login() {
  const firebaseAuth = getAuth(apptry);
  const provider = new GoogleAuthProvider();
  const router = useRouter();

  // ✅ Zustand store hook
  const { updateUserProfile, resetUserProfile } = useUpdateUserProfile();

  const signIn = async () => {
    try {
      const { user } = await signInWithPopup(firebaseAuth, provider);
      if (!user) return;

      const uid = user.uid;
      localStorage.setItem("uid", uid);

      try {
        const defaultPremium = { active: false, expiryDate: "" };

        // ✅ Save to MongoDB
        await axios.post("/api/post/profile", {
          name: user.displayName,
          email: user.email,
          date: new Date().toISOString(),
          tickets: 0,
          overallscore: 0,
          premium: defaultPremium,
        });

        // ✅ Local cache
        localStorage.setItem("email", JSON.stringify(user.email));
        localStorage.setItem("photoURL", JSON.stringify(user.photoURL));
        localStorage.setItem("premium", JSON.stringify(defaultPremium.active));

        // ✅ Firestore user check
        const userRef = doc(db, "Firebase-jigzexplorer-profiles", uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          // 🔹 Create new Firestore profile
          const newUserData = {
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            emailVerified: user.emailVerified,
            tickets: 0,
            tokens: 0,
            premium: defaultPremium,
            overallscore: 0,
            countryscore: Object.fromEntries(
              [
                "denmark","estonia","finland","iceland","ireland","latvia","lithuania","norway","sweden","united kingdom",
                "austria","belgium","france","germany","liechtenstein","luxembourg","monaco","netherlands","switzerland",
                "albania","andorra","bosnia and herzegovina","croatia","greece","italy","malta","montenegro","north macedonia",
                "portugal","san marino","serbia","slovenia","spain","vatican city","belarus","bulgaria","czechia","hungary",
                "moldova","poland","romania","slovakia","ukraine"
              ].map((country) => [country, 0])
            ),
            countryATH: Object.fromEntries(
              [
                "denmark","estonia","finland","iceland","ireland","latvia","lithuania","norway","sweden","united kingdom",
                "austria","belgium","france","germany","liechtenstein","luxembourg","monaco","netherlands","switzerland",
                "albania","andorra","bosnia and herzegovina","croatia","greece","italy","malta","montenegro","north macedonia",
                "portugal","san marino","serbia","slovenia","spain","vatican city","belarus","bulgaria","czechia","hungary",
                "moldova","poland","romania","slovakia","ukraine"
              ].map((country) => [country, 0])
            ),
          };

          await setDoc(userRef, newUserData);
          console.log("✅ Firestore profile created");

          // ✅ Update Zustand store
          resetUserProfile(); // Clear existing
          updateUserProfile(newUserData); // Load fresh Firestore data into Zustand
        } else {
          const data = userSnap.data();
          const premiumStatus = data?.premium?.active ?? false;

          console.log("ℹ️ Existing Firestore profile found:", data);
          localStorage.setItem("premium", JSON.stringify(premiumStatus));

          // ✅ Also update Zustand with Firestore data
          resetUserProfile();
          updateUserProfile(data);
        }

        await axios.get("/api/post/score");
      } catch (err) {
        console.error("Error saving to MongoDB/Firestore:", err);
      }

      router.push(`/`);
    } catch (err) {
      console.log("Login error", err);
    }
  };

  return (
    <div
      className="font-sans flex flex-col items-center justify-center
                 min-h-screen p-8 pb-20 sm:p-20
                 bg-[url('/Bg.png')] bg-cover bg-center"
    >
      <div
        className="absolute z-10 flex justify-center items-center border border-gray-300 rounded-full
        w-60 m-2 p-2 bg-white bg-opacity-60 cursor-pointer hover:shadow-md hover:bg-opacity-100"
        onClick={signIn}
      >
        <FcGoogle fontSize={30} />
        <p className="text-lg font-semibold ml-4">Sign in with Google</p>
      </div>
    </div>
  );
}
