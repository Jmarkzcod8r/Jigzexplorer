// // lib/updateOverallScore.ts
// import { doc, getDoc, increment, updateDoc } from "firebase/firestore";
// import { db } from "../api/firebase/firebase-config";

// export async function updateOverallScore(userId: string, country: string, points: number) {
//   const userRef = doc(db, "Firebase-jigzexplorer-profiles", userId);

//   const snap = await getDoc(userRef);
//   if (!snap.exists()) return;

//   const data = snap.data();
//   // console.log('this is data', data)
//   const currentScore = (data.countryscore?.[country.toLowerCase()] as number) || 0;

//   // update this country's score
// //   const newCountryScore = currentScore + points;
// const newCountryScore =  points;

//   // recalc overall (force type as number[])
//   const newOverall = (Object.values({
//     ...data.countryscore,
//     [country.toLowerCase()]: newCountryScore
//   }) as number[]).reduce((sum, val) => sum + val, 0);

//   // save back
//   await updateDoc(userRef, {
//     [`countryscore.${country.toLowerCase()}`]: newCountryScore,
//     overallscore: newOverall,
//     tickets: increment(2),   // ✅ adds +2 to whatever value is stored
//   });
// }

// lib/updateOverallScore.ts
import { doc, getDoc, increment, updateDoc } from "firebase/firestore";
import { db } from "../api/firebase/firebase-config";
import { useUpdateUserProfile } from "../lib/zustand/updateUserProfile";

// ⚠️ Since this is outside React, we use the store directly
const userStore = useUpdateUserProfile.getState();

export async function updateOverallScore(userId: string, country: string, points: number) {
  const userRef = doc(db, "Firebase-jigzexplorer-profiles", userId);

  const snap = await getDoc(userRef);
  if (!snap.exists()) return;

  const data = snap.data();
  const countryKey = country.toLowerCase();

  // Current country data
  const currentCountry = data.countries?.[countryKey] || { score: 0, ATH: 0, unlock: false };

  // New score
  const newScore = points;

  // Update ATH if newScore > current ATH
  const newATH = points > currentCountry.ATH ? points : currentCountry.ATH;

  // Unlock the country
  const unlock = true;

  // Recalculate overall (sum of all country scores)
  const updatedCountries = {
    ...data.countries,
    [countryKey]: { ...currentCountry, score: newScore, ATH: newATH, unlock },
  };

  const newOverall = Object.values(updatedCountries)
    .reduce((sum: number, c: any) => sum + (c.score || 0), 0);

  // Save back to Firestore
  await updateDoc(userRef, {
    [`countries.${countryKey}.score`]: newScore,
    [`countries.${countryKey}.ATH`]: newATH,
    [`countries.${countryKey}.unlock`]: unlock,
    overallscore: newOverall,
    tickets: increment(2),
  });

  // ✅ Update Zustand store
  userStore.updatezCountry(countryKey, { score: newScore, ATH: newATH, unlock });

  userStore.updateUserProfile({ overallscore: newOverall, tickets: (userStore.user.tickets || 0) + 2 });
}
