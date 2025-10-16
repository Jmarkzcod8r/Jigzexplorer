// // utils/checkPremiumStatus.ts
// import { getAuth } from "firebase/auth";
// import { doc, getDoc } from "firebase/firestore";
// import { db } from "../api/firebase/firebase-config";

// export async function checkPremiumStatus(): Promise<boolean> {
//   try {
//     const auth = getAuth();
//     const user = auth.currentUser;

//     if (!user) {
//       console.warn("No user logged in");
//       localStorage.setItem("premium", "false");
//       return false;
//     }

//     const uid = user.uid;
//     const userRef = doc(db, "Firebase-jigzexplorer-profiles", uid);
//     const userSnap = await getDoc(userRef);

//     if (userSnap.exists()) {
//       const isPremium = !!userSnap.data().premium;
//       localStorage.setItem("premium", isPremium ? "true" : "false");
//       return isPremium;
//     } else {
//       localStorage.setItem("premium", "false");
//       return false;
//     }
//   } catch (err) {
//     console.error("Error checking premium status:", err);
//     localStorage.setItem("premium", "false");
//     return false;
//   }
// }


// utils/checkPremiumStatus.ts
// utils/checkPremiumStatus.ts
export function checkPremiumStatus(): boolean {
    try {
      const status = localStorage.getItem("premium");

      // If null, undefined, or not "true", treat as non-premium
      if (!status) return false;

      return status === "true";
    } catch (err) {
      console.error("Error checking premium status:", err);
      return false;
    }
  }
