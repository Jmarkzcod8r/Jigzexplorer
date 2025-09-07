// "use client";

// import React, { useEffect, useState } from "react";
// import { db } from "../api/firebase/firebase-config";
// import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";

// interface Player {
//   displayName: string;
//   email: string;
//   photoURL?: string;
//   overallscore: number;
//   tickets?: number;
// }

// const LeaderboardPage = () => {
//   const [players, setPlayers] = useState<Player[]>([]);

//   useEffect(() => {
//     const q = query(
//       collection(db, "Firebase-jigzexplorer-profiles"),
//       orderBy("overallscore", "desc"),
//       limit(20)
//     );

//     const unsubscribe = onSnapshot(q, (snapshot) => {
//       let playerList: Player[] = snapshot.docs.map((doc) => ({
//         ...(doc.data() as Player),
//       }));

//       // 🔹 Force sort again (in case snapshot order lags)
//       playerList = playerList.sort((a, b) => b.overallscore - a.overallscore);

//       setPlayers(playerList);
//     });

//     return () => unsubscribe();
//   }, []);

//   return (
//     <div className="font-sans flex flex-col items-center min-h-screen p-6 bg-[url('/Bg.png')] bg-cover bg-center">
//       <h1 className="text-3xl font-bold text-white mb-6">🏆 Leaderboard</h1>
//       <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-2xl">
//         <ul className="divide-y divide-gray-200">
//           {players.map((player, index) => (
//             <li
//               key={player.email}
//               className="flex items-center justify-between py-3"
//             >
//               <div className="flex items-center space-x-3">
//                 <span className="font-bold text-lg w-6 text-gray-700">
//                   {index + 1}
//                 </span>
//                 {player.photoURL ? (
//                   <img
//                     src={player.photoURL}
//                     alt={player.displayName}
//                     className="w-10 h-10 rounded-full object-cover"
//                   />
//                 ) : (
//                   <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
//                     {player.displayName.charAt(0)}
//                   </div>
//                 )}
//                 <div>
//                   <p className="font-semibold text-gray-800">
//                     {player.displayName}
//                   </p>
//                   <p className="text-sm text-gray-500">{player.email}</p>
//                 </div>
//               </div>
//               <div className="text-right">
//                 <p className="font-bold text-blue-600 text-lg">
//                   {player.overallscore ?? 0}
//                 </p>
//                 <p className="text-xs text-gray-500">Score</p>
//               </div>
//             </li>
//           ))}
//         </ul>
//       </div>
//     </div>
//   );
// };

// export default LeaderboardPage;

import React from 'react'

const page = () => {
  return (
    <div>
      Leaderboard
    </div>
  )
}

export default page
