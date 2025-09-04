

// import { cache } from "react"
// import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth"
// import { apptry } from "../api/firebase/firebase-config"
// // import { cache } from "next/cache"

// const firebaseAuth = getAuth(apptry)
// const provider = new GoogleAuthProvider()

// export const getUser = cache(async () => {
//   const { user } = await signInWithPopup(firebaseAuth, provider)

//   return {
//     uid: user.uid,
//     displayName: user.displayName,
//     email: user.email,
//     photoURL: user.photoURL,
//     emailVerified: user.emailVerified,
//     accessToken: await user.getIdToken(),
//   }
// })

// Simple in-memory cache for profiles
// Shared cache across backend routes
let profileCache: Record<string, any> = {};

export function getProfileFromCache(email?: string) {
  if (!email) return profileCache;
  return profileCache[email] || null;
}

export function setProfileInCache(email: string, profile: any) {
  profileCache[email] = profile;
}

export function deleteProfileFromCache(email: string) {
  delete profileCache[email];
}

export function clearProfileCache() {
  profileCache = {};
}
