import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../api/firebase/firebase-config";
import { useUpdateUserProfile } from "../lib/zustand/updateUserProfile";

export function SyncZustandFirestore(uid: string) {
  const userStore = useUpdateUserProfile.getState();

  const docRef = doc(db, "Firebase-jigzexplorer-profiles", uid);

  // onSnapshot returns an unsubscribe function
  const unsubscribe = onSnapshot(docRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data();
      userStore.updateUserProfile({
        ...data,
        tickets: data.tickets ?? 0,
        overallscore: data.overallscore ?? 0,
      });
      if (data.countries) {
        Object.entries(data.countries).forEach(([name, country]: any) => {
          userStore.updatezCountry(name, country);
        });
      }
      localStorage.clear()
    } else {
      alert ('error syncing')
    }
  });

  return unsubscribe; // now this can be called to stop listening
}
