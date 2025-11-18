

// This helper function updates both Firestore and Zustand
import { doc, getDoc, increment, updateDoc } from "firebase/firestore";
import { db } from "../api/firebase/firebase-config";
import { useUpdateUserProfile } from "../lib/zustand/updateUserProfile";

const userStore = useUpdateUserProfile.getState();

// This helper function updates both Firestore and Zustand
export async function updateUnlockCountry(
  userId: string,
  countries: string[],
  calculatedCost: number
) {
  const userRef = doc(db, "Firebase-jigzexplorer-profiles", userId);

  const snap = await getDoc(userRef);
  if (!snap.exists()) return;

  const data = snap.data();
  let totalTokensIncrement = 0;

  const updatedCountries: Record<string, any> = { ...data.countries };

  for (const country of countries) {
    const countryKey = country.toLowerCase();

    const currentCountry = updatedCountries[countryKey] || { score: 0, ATH: 0, unlock: true };

    // Unlock the country
    const unlock = true;

    updatedCountries[countryKey] = { ...currentCountry, score: 0, ATH: 0, unlock };

    totalTokensIncrement += 2; // Increment 2 tokens per country

    // Update Zustand store for each country
    userStore.updatezCountry(countryKey, { score: 0, ATH: 0, unlock });
  }

  // Recalculate overall (sum of all country scores)
  const newOverall = Object.values(updatedCountries)
    .reduce((sum: number, c: any) => sum + (c.score || 0), 0);

  // Save back to Firestore
  const updatePayload: any = {
    tickets: increment(-calculatedCost), // deduct tickets
    "settings.tokens": increment(totalTokensIncrement), // increment tokens in Firestore
  };

  countries.forEach((country) => {
    const countryKey = country.toLowerCase();
    updatePayload[`countries.${countryKey}.score`] = 0;
    updatePayload[`countries.${countryKey}.ATH`] = 0;
    updatePayload[`countries.${countryKey}.unlock`] = true;
  });

  await updateDoc(userRef, updatePayload);

  // Update Zustand userProfile
//   userStore.updateUserProfile({
//     overallscore: newOverall,
//     // tickets: (userStore.user.tickets || 0) - calculatedCost,
//     tickets: (userStore.user.tickets || 0) - calculatedCost,
//     settings: {
//       ...userStore.user.settings,
//       tokens: (userStore.user.settings.tokens || 0) + totalTokensIncrement,
//     },
//   });
}

// userStore.updatezCountry(countryKey, { score: newScore, ATH: newATH, unlock });

// userStore.updateUserProfile({ overallscore: newOverall, tickets: (userStore.user.tickets || 0) + 2 });
