"use client";

import React from "react";
import { FcGoogle } from "react-icons/fc";
import { useRouter } from "next/navigation";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { apptry, db } from "../api/firebase/firebase-config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import axios from "axios";

export default function Login() {
  const firebaseAuth = getAuth(apptry);
  const provider = new GoogleAuthProvider();
  const router = useRouter();

  const signIn = async () => {
    try {
      const { user } = await signInWithPopup(firebaseAuth, provider);
      if (!user) return;

      const uid = user.uid;
      localStorage.setItem("uid", uid);

      try {
        // ✅ Prepare default premium object
        const defaultPremium = { status: "false", subscriptionId: "" };

        // ✅ Save to MongoDB (upsert)
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
        localStorage.setItem("premium", defaultPremium.status);

        // ✅ Check Firestore
        const userRef = doc(db, "Firebase-jigzexplorer-profiles", uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          // 🔹 If new user, create profile
          await setDoc(userRef, {
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            emailVerified: user.emailVerified,
            tickets: 0,
            tokens: 0,
            premium: defaultPremium, // Use object instead of boolean
            overallscore: 0,
            countryscore: {
              denmark: 0,
              estonia: 0,
              finland: 0,
              iceland: 0,
              ireland: 0,
              latvia: 0,
              lithuania: 0,
              norway: 0,
              sweden: 0,
              "united kingdom": 0,
              austria: 0,
              belgium: 0,
              france: 0,
              germany: 0,
              liechtenstein: 0,
              luxembourg: 0,
              monaco: 0,
              netherlands: 0,
              switzerland: 0,
              albania: 0,
              andorra: 0,
              "bosnia and herzegovina": 0,
              croatia: 0,
              greece: 0,
              italy: 0,
              malta: 0,
              montenegro: 0,
              "north macedonia": 0,
              portugal: 0,
              "san marino": 0,
              serbia: 0,
              slovenia: 0,
              spain: 0,
              "vatican city": 0,
              belarus: 0,
              bulgaria: 0,
              czechia: 0,
              hungary: 0,
              moldova: 0,
              poland: 0,
              romania: 0,
              slovakia: 0,
              ukraine: 0,
            },
          });

          console.log("✅ Firestore profile created");
        } else {
          // 🔹 If user already exists, read data
          const data = userSnap.data();
          const premiumStatus = data?.premium?.status ?? "false";

          console.log("ℹ️ Existing Firestore profile found:", data);
          localStorage.setItem("premium", premiumStatus);
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
