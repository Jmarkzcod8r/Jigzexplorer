// lib/updateOverallScore.ts
import { doc, getDoc, increment, updateDoc } from "firebase/firestore";
import { db } from "../api/firebase/firebase-config";

export async function updateOverallScore(userId: string, country: string, points: number) {
  const userRef = doc(db, "Firebase-jigzexplorer-profiles", userId);

  const snap = await getDoc(userRef);
  if (!snap.exists()) return;

  const data = snap.data();
  const currentScore = (data.countryscore?.[country.toLowerCase()] as number) || 0;

  // update this country's score
//   const newCountryScore = currentScore + points;
const newCountryScore =  points;

  // recalc overall (force type as number[])
  const newOverall = (Object.values({
    ...data.countryscore,
    [country.toLowerCase()]: newCountryScore
  }) as number[]).reduce((sum, val) => sum + val, 0);

  // save back
  await updateDoc(userRef, {
    [`countryscore.${country.toLowerCase()}`]: newCountryScore,
    overallscore: newOverall,
    tickets: increment(2),   // ✅ adds +2 to whatever value is stored
  });
}
