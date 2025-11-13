"use client";

import React from "react";
import { FcGoogle } from "react-icons/fc";
import { useRouter } from "next/navigation";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { apptry, db } from "../api/firebase/firebase-config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import axios from "axios";
import { useUpdateUserProfile } from "../lib/zustand/updateUserProfile";
import Logo from "../component/logo";

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
          // resetUserProfile(); // Clear existing
          updateUserProfile(newUserData); // Load fresh Firestore data into Zustand
        } else {
          const data = userSnap.data();
          const premiumStatus = data?.premium?.active ?? false;

          console.log("ℹ️ Existing Firestore profile found:", data);
          localStorage.setItem("premium", JSON.stringify(premiumStatus));

          // ✅ Also update Zustand with Firestore data
          // resetUserProfile();
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
  > <div className="w-full max-w-md space-y-8">
    {/* Logo */}
    <div className="text-center">

        <Logo />

      <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome</h1>
      <p className="text-gray-600">Sign in to continue to your account</p>
    </div>

    {/* Sign in button */}
    <div
      className="group relative flex items-center justify-center w-full p-4
                 bg-white rounded-xl shadow-lg border border-gray-100
                 hover:shadow-2xl hover:scale-[1.02] hover:border-blue-200
                 transition-all duration-300 cursor-pointer"
      onClick={signIn}
    >
      {/* Hover effect background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>

      <FcGoogle fontSize={28} className="transition-transform group-hover:scale-110 duration-300" />
      <span className="ml-3 text-lg font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
        Continue with Google
      </span>
    </div>

    {/* Footer text */}
    <p className="text-center text-sm text-gray-500 mt-8">
      By continuing, you agree to our Terms of Service
    </p>
  </div>
</div>
  );
}
