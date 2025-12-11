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
  const {  updateUserProfile, resetUserProfile } = useUpdateUserProfile();

  const Countries = ["Denmark", "Iceland", "Ireland", "Latvia", "Lithuania", "Norway", "Sweden", "United Kingdom", "Austria", "Belgium", "Liechtenstein", "Luxembourg", "Monaco", "Netherlands", "Albania", "Andorra", "Bosnia and Herzegovina", "Croatia", "Greece", "Italy", "Malta", "Montenegro", "North Macedonia", "Portugal", "San Marino", "Serbia", "Slovenia", "Spain", "Vatican City", "Belarus", "Bulgaria", "Czechia", "Hungary", "Moldova", "Poland", "Romania", "Slovakia", "Ukraine" ].map(c => c.toLowerCase());



  const signIn = async () => {
    try {
      const { user } = await signInWithPopup(firebaseAuth, provider);
      if (!user) return;

      const uid = user.uid;
      // localStorage.setItem("uid", uid);

      try {
        const defaultPremium = { active: false, expiryDate: "" };

        // ✅ Save to MongoDB
        // await axios.post("/api/post/profile", {
        //   name: user.displayName,
        //   email: user.email,
        //   date: new Date().toISOString(),
        //   tickets: 0,
        //   overallscore: 0,
        //   premium: defaultPremium,
        // });

        // ✅ Local cache
        // localStorage.setItem("email", JSON.stringify(user.email));
        // localStorage.setItem("photoURL", JSON.stringify(user.photoURL));
        // localStorage.setItem("premium", JSON.stringify(defaultPremium.active));

        // ✅ Firestore user check
        const userRef = doc(db, "Firebase-jigzexplorer-profiles", uid);
        const userSnap = await getDoc(userRef);

          // This is negligible if user is already saved to firestore
        if (!userSnap.exists()) {
          // 🔹 Create new Firestore profile
          const unlockedCountries = ["estonia", "finland", "france", "germany", "switzerland"];

          // Assuming you have `user` from Zustand and `unlockedCountries` as an array of strings
// const newUserData = {
//   uid: user.uid,
//   displayName: user.displayName,
//   email: user.email,
//   photoURL: user.photoURL,
//   emailVerified: user.emailVerified,

//   tickets: 0,
//   overallscore: 0,

//   // 🔹 Subscription structure
//   subscription: {
//     subscriptionId:  "", // Paddle subscription ID
//     productId:  "",           // Paddle Product / Plan
//     status:  "Freemium",         // active | past_due | canceled | trialing | Freemium
//     active:  false,

//     expiryDate:  "",
//     cancelAtPeriodEnd: false,

//     lastPayment: {
//       date:  0,
//       amount:  0,
//       currency: "",
//       status:  "",
//       transactionId:"",
//     },

//     gracePeriod: {
//       daysTotal:  0,
//       daysRemaining:  30,
//       resetIntervalMonths:  6,
//       lastResetDate:0,
//       isInGracePeriod:  false,
//     },
//   },

//   // 🔹 Settings preserved
//   settings: {
//     tokens: 0,
//     streakMultiplier: 1,
//     timeMultiplier: 1,
//     timeDuration: 60,
//     turboBonus: 0,
//     turbocountdown: 30,
//     puzzlecompletionscore: 50,
//   },

//   // 🔹 Countries with unlock logic
//   countries: Object.fromEntries(
//     Object.entries(Countries).map(([countryName, data]) => [
//       countryName.toLowerCase(),
//       {
//         ATH:  0,
//         score:  0,
//         unlock:false,
//         lastplayed:  0,
//       },
//     ])
//   ),
// };
const newUserData = {
  uid: user.uid,
  displayName: user.displayName,
  email: user.email,
  photoURL: user.photoURL,
  emailVerified: user.emailVerified,
  tickets: 0,
  overallscore: 0,

  subscription: {
    subscriptionId: "",
    planId: "freemium",
    planName: "Freemium",
    currency: "USD",
    amount: 0,
    billingInterval: "month",
    billingFrequency: 1,
    status: "Freemium",
    isTrial: false,
    trialEndsAt: 0,
    nextBillAt: 0,
    lastPaymentAt: 0,
    cancelAt: 0,
    paymentType: 0,
    last4: 0,
    meta: {},
  },

  settings: {
    tokens: 0,
    streakMultiplier: 1,
    timeMultiplier: 1,
    timeDuration: 60,
    turboBonus: 0,
    turbocountdown: 30,
    puzzlecompletionscore: 50,
  },

  countries: Object.fromEntries(
    Countries.map((country) => [
      country.toLowerCase(),
      { ATH: 0, score: 0, unlock: false, lastplayed: 0 },
    ])
  ),
};




          await setDoc(userRef, newUserData);
          console.log("✅ Firestore profile created");

          // ✅ Update Zustand store
          updateUserProfile(newUserData);

          // ✅ Save to localStorage
          // localStorage.setItem('user', JSON.stringify(newUserData));
          // console.log("✅ User data saved to localStorage");
        } else {
          const data = userSnap.data();
          const premiumStatus = data?.premium?.active ?? false;

          // console.log("ℹ️ Existing Firestore profile found:", data);
          // localStorage.setItem("premium", JSON.stringify(premiumStatus));

          // ✅ Also update Zustand with Firestore data
          // resetUserProfile();
          updateUserProfile(data);
        }

        // await axios.get("/api/post/score");
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
      <div className="absolute inset-0  from-blue-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>

      <FcGoogle fontSize={28} className="transition-transform group-hover:scale-110 duration-300" />
      <span className="ml-3 text-lg font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
        Continue with Google
      </span>
    </div>

    {/* Footer text */}
    {/* <p className="text-center text-sm text-gray-500 mt-8">
      By continuing, you agree to our Terms of Service
    </p> */}
  </div>
</div>
  );
}
