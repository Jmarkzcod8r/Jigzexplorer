"use client"

import React from 'react'
import { FcGoogle } from 'react-icons/fc'
import { useRouter } from 'next/navigation'

import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from 'firebase/auth'
import { apptry, db } from "../api/firebase/firebase-config"
import { doc, setDoc } from "firebase/firestore"
import axios from "axios"

export default function Login() {
  const firebaseAuth = getAuth(apptry)
  const provider = new GoogleAuthProvider()
  const router = useRouter()

  const signIn = async () => {
    try {
      const { user } = await signInWithPopup(firebaseAuth, provider)
      const { refreshToken, providerData, email } = user

      async function Go() {
        if (user) {
          const uid = user.uid
          console.log("user okay", uid)

          // Save to Firestore
          await setDoc(doc(db, "Firebase-test userz", uid), {
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            emailVerified: user.emailVerified,
          })

          // ✅ Send to MongoDB via API
          try {
            await axios.post("/api/post/profile", {
              // uid,
              name: user.displayName,
              email: user.email,
              date: new Date().toISOString()
            })
            console.log("User saved to MongoDB")
          } catch (err) {
            console.error("Error saving to MongoDB:", err)
          }

          router.push(`/`)
        }
      }
      Go()

      localStorage.setItem("email", JSON.stringify(email))
      localStorage.setItem("user", JSON.stringify(providerData))
      localStorage.setItem("accessToken", JSON.stringify(refreshToken))

      Dbadd()
    } catch (err) {
      console.log("Login error", err)
    }
  }

  async function Dbadd() {
    const auth = getAuth()
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const uid = user.uid
        await setDoc(doc(db, "Firebase-test users", uid), {
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified,
        })
      } else {
        console.log("error")
      }
    })
    console.log("sendingss")
  }

  return (
    <div className="h-auto w-auto flex bg-blue-300">
      <div
        className="absolute z-10 flex justify-center items-center border border-gray-300 rounded-full
        w-60 m-2 p-2 bg-white bg-opacity-60 cursor-pointer hover:shadow-md hover:bg-opacity-100"
        onClick={signIn}
      >
        <FcGoogle fontSize={30} />
        <p className="text-lg font-semibold ml-4">Sign in with Google</p>
      </div>
    </div>
  )
}
