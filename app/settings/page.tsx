"use client";

import React, { useEffect, useState } from "react";
import Logo from "../component/logo";
import { updateEnv } from "../lib/zustand/updateEnvironmet";
import { useUpdateUserProfile } from "../lib/zustand/updateUserProfile";
import { apptry, db } from "../api/firebase/firebase-config";
import { DocumentData, DocumentReference, doc, getDoc, setDoc } from "firebase/firestore";
import { SyncZustandFirestore } from "../lib/SyncZustandFirestore";

const SettingsPage = () => {
  const { env, toggleEnv, setEnv } = updateEnv();

  // Destructure the necessary state and actions from the hook
  const { user, incrementSetting, decrementSetting, updateSettings } =
    useUpdateUserProfile();

  const uid = user.uid
  let userRef: DocumentReference<any, DocumentData>;
    if (uid) {
      userRef = doc(db, "Firebase-jigzexplorer-profiles", uid);
    }


  const [usedupTokens, setUsedupTokens] = useState(false)

  const [pendingSettings, setPendingSettings] = useState(user.settings);

  // Helper function to modify any setting
const modifyPendingSetting = (field: keyof typeof pendingSettings, amount: number) => {
  setPendingSettings(prev => ({
    ...prev,
    [field]: Math.max(0, prev[field] + amount) // prevent negative values
  }));
};

  useEffect(() => {
    setPendingSettings(user.settings);
  }, [user.settings]);

//   const updatePendingSetting = (key: string, increment: number) => {
//     setPendingSettings(prev => ({
//       ...prev,
//       [key]: prev[key] + increment, // TypeScript is still unhappy with prev[key] access
//     }));
// };


  // 🆕 CALCULATE USED TOKENS
  // Define the keys from UserSettings that should contribute to the "used" tokens.
  // We exclude 'tokens' itself..
  const usedTokenKeys = [
    "streakMultiplier",
    "timeMultiplier",
    "timeDuration",
    "turboBonus",
    "turbocountdown",
    "puzzlecompletionscore",
  ];

  // Calculate the sum of the values for the defined keys.
  const usedTokens = usedTokenKeys.reduce((sum, key) => {
    // Ensure the key exists and the value is a number before adding
    const value = pendingSettings[key];
    if (typeof value === 'number') {
      return sum + value;
    }
    return sum; // Skip non-numeric or missing keys
  }, 0);

  // const usedupTokens = pendingSettings.tokens === usedTokens;
  // const hasPendingChanges = JSON.stringify(pendingSettings) !== JSON.stringify(user.settings);


  useEffect(() => {
    if (user.settings.tokens === usedTokens) {
      setUsedupTokens(true)
    } else {
      setUsedupTokens(false)
    }
  })

  const Save = async () => {
    // Check if pendingSettings is the same as user.settings
    if (JSON.stringify(pendingSettings) === JSON.stringify(user.settings)) {
      alert("No changes to save"); // No changes made
      return; // exit early
    }

    try {
      await setDoc(
        userRef,
        {
          settings: {
            streakMultiplier: pendingSettings.streakMultiplier,
            timeMultiplier: pendingSettings.timeMultiplier,
            timeDuration: pendingSettings.timeDuration,
            turboBonus: pendingSettings.turboBonus,
            turbocountdown: pendingSettings.turbocountdown,
            puzzlecompletionscore: pendingSettings.puzzlecompletionscore,
          },
        },
        { merge: true } // merge so it doesn't overwrite other fields
      );

        // 🔥 FIX: keep Zustand + pendingSettings in sync with Firestore
        // updateSettings(pendingSettings);
        // setPendingSettings(pendingSettings);
        // if (uid) {
        //     SyncZustandFirestore(uid)
        //    }

        alert("New Settings Updated");

    } catch (error) {
      console.error("Error updating settings:", error);
      alert("Failed to update settings"); // optional error feedback
    }
  };


  const Reset = () => {
   setPendingSettings(user.settings)
  //  if (uid) {
  //   SyncZustandFirestore(uid)
  //  }
  };

  return (
    <div
      className="font-sans flex flex-col items-center
                 min-h-screen p-8  sm:p-20
                 bg-[url('/Bg.png')] bg-cover bg-center"
    >
      <div onClick={Reset}>
      <Logo />
      </div>
      <div className="p-4 bg-gray-100 rounded mt-4">
  {/* <h2 className="font-bold mb-2">Pending Settings (Preview)</h2>
  <pre className="text-sm">
    {JSON.stringify(pendingSettings, null, 2)}
  </pre> */}
</div>


      {/* <h2 className="text-xl font-bold mt-4 mb-2">
        Current Environment: {env}
      </h2>

      <div className="flex gap-2 mb-4">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => setEnv("sandbox")}
        >
          Sandbox
        </button>

        <button
          className="px-4 py-2 bg-green-500 text-white rounded"
          onClick={() => setEnv("production")}
        >
          Production
        </button>

        <button
          className="px-4 py-2 bg-yellow-500 text-black rounded"
          onClick={toggleEnv}
        >
          Toggle
        </button>
      </div> */}

      <div className="p-4 space-y-4 bg-blue-100/85">

        <h1 className="text-2xl font-bold  text-center ">Settings</h1>

        {/* Tokens and Used Tokens - MODIFIED */}
        <div className="flex items-center space-x-4 p-2 justify-center  rounded flex-col-2 w-full">
          <div>
          <span className="font-semibold">
            Available Tokens: <span className="text-blue-600">{user.settings.tokens}</span>
          </span>
          <span className="text-gray-600 px-2">|</span>
          <span className="font-semibold">
            Used Tokens: <span className="text-red-600">{usedTokens}</span>
          </span>
          {/* <span className="font-semibold">
            UsedUp Tokens ??: <span className="text-red-600">{usedupTokens ? 'true': 'false'}</span>
          </span> */}
          </div>
        </div>
        {/* const puzzlecompletionscore = 100 + (5 * user.user.settings.puzzlecompletionscore)  ; // base                + 5   /10
  const streakmultiplier = 10 + (user.user.settings.streakMultiplier)   ;            // Multiplier for streak  + 1   /10
  const timeMultiplier = 10 + (user.user.settings.timeMultiplier)     ;       // Multiplier for elapsed Time   + 1   /10
  const timeduration = 180 + (5 * user.user.settings.timeDuration);      // duration before penalty(3 mins.)   + 5   /10
  const turbobonus = 200 + (4 * user.user.settings.turboBonus); // +100 to puzzlecompletionscore               + 4   /10
  const turbocountdown= 30 + (2 * user.user.settings.turbocountdown);                                   //     + 2    /10 */}
  <div className="flex justify-center">
<div className="flex flex-col items-center gap-3 p-2 rounded-lg max-w-[400px]">
    {/* NOTE: I changed 'flex-col-2' to 'flex-col' and added 'w-full'
        to make the inner divs stretch across the full width.
    */}

    {/* Puzzle Complete Score @+5 */}
    <div className="flex items-center justify-between w-full space-x-2">
        {/* Label on the Left */}
        <span>Puzzle Completion Score: {100 + (5 * pendingSettings.puzzlecompletionscore)}</span>

        {/* Buttons on the Right */}
        <div className="flex space-x-2">
            <button
                disabled={usedupTokens}
                className={`px-2 py-1 text-white rounded ${usedupTokens ? "bg-gray-300" : "bg-green-500"}`}
                onClick={() =>modifyPendingSetting("puzzlecompletionscore", 1)}
            >
                +5s
            </button>
            <button
                // disabled={usedupTokens}
                className={`px-2 py-1 text-white rounded ${pendingSettings.puzzlecompletionscore === 0 ? "bg-gray-300" : "bg-red-500"}`}
                onClick={() => modifyPendingSetting("puzzlecompletionscore", -1)}
            >
                -5s
            </button>
        </div>
    </div>

    {/* Streak Multiplier @ +1 */}
    <div className="flex items-center justify-between w-full space-x-2">
        {/* Label on the Left */}
        <span>Streak Multiplier: {10 + (pendingSettings.streakMultiplier)}</span>

        {/* Buttons on the Right */}
        <div className="flex space-x-2">
            <button
                disabled={usedupTokens}
                className={`px-2 py-1 text-white rounded ${usedupTokens ? "bg-gray-300" : "bg-green-500"}`}
                onClick={() => modifyPendingSetting("streakMultiplier", 1)}
            >
                +1
            </button>
            <button
                className={`px-2 py-1 text-white rounded ${pendingSettings.streakMultiplier === 0 ? "bg-gray-300" : "bg-red-500"}`}
                onClick={() =>  modifyPendingSetting("streakMultiplier", -1)}
            >
                -1
            </button>
        </div>
    </div>

    {/* Time Duration @ +1*/}
    <div className="flex items-center justify-between w-full space-x-2">
        {/* Label on the Left */}
        <span>Game Time Duration: {180 + (5 * pendingSettings.timeDuration)}s</span>

        {/* Buttons on the Right */}
        <div className="flex space-x-2">
            <button
                disabled={usedupTokens}
                className={`px-2 py-1 text-white rounded ${usedupTokens ? "bg-gray-300" : "bg-green-500"}`}
                onClick={() =>  modifyPendingSetting("timeDuration", 1)}
            >
                +5
            </button>
            <button
                className={`px-2 py-1 text-white rounded ${pendingSettings.timeDuration === 0 ? "bg-gray-300" : "bg-red-500"}`}
                onClick={() =>  modifyPendingSetting("timeDuration", -1)}
            >
                -5
            </button>
        </div>
    </div>

    {/* Turbo Bonus @ +5 */}
    <div className="flex items-center justify-between w-full space-x-2">
        {/* Label on the Left */}
        <span>Turbo Bonus: {200 + (4 * pendingSettings.turboBonus)}</span>

        {/* Buttons on the Right */}
        <div className="flex space-x-2">
            <button
                disabled={usedupTokens}
                className={`px-2 py-1 text-white rounded ${usedupTokens ? "bg-gray-300" : "bg-green-500"}`}
                onClick={() => modifyPendingSetting("turboBonus", 1)}
            >
                +4
            </button>
            <button
                className={`px-2 py-1 text-white rounded ${pendingSettings.turboBonus === 0 ? "bg-gray-300" : "bg-red-500"}`}
                onClick={() => modifyPendingSetting("turboBonus", -1)}
            >
                -4
            </button>
        </div>
    </div>

    {/* Turbo Countdown @ +2 */}
    <div className="flex items-center justify-between w-full space-x-2">
        {/* Label on the Left */}
        <span>Turbo Countdown: {30 + (2 * pendingSettings.turbocountdown)}s</span>

        {/* Buttons on the Right */}
        <div className="flex space-x-2">
            <button
                disabled={usedupTokens}
                className={`px-2 py-1 text-white rounded ${usedupTokens ? "bg-gray-300" : "bg-green-500"}`}
                onClick={() =>modifyPendingSetting("turbocountdown", 1)}
            >
                +2
            </button>
            <button
                className={`px-2 py-1 text-white rounded ${pendingSettings.turbocountdown === 0 ? "bg-gray-300" : "bg-red-500"}`}
                onClick={() => modifyPendingSetting("turbocountdown", -1)}
            >
                -2
            </button>
        </div>
    </div>

    {/* Elapsed Time Multiplier @ +1 */}
    <div className="flex items-center justify-between w-full space-x-2">
        {/* Label on the Left */}
        <span>Elapsed Time Multiplier: {10 + (pendingSettings.timeMultiplier)}</span>

        {/* Buttons on the Right */}
        <div className="flex space-x-2">
            <button
                disabled={usedupTokens}
                className={`px-2 py-1 text-white rounded ${usedupTokens ? "bg-gray-300" : "bg-green-500"}`}
                onClick={() => modifyPendingSetting("timeMultiplier", 1)}
            >
                +1
            </button>
            <button
                className={`px-2 py-1 text-white rounded ${pendingSettings.timeMultiplier === 0 ? "bg-gray-300" : "bg-red-500"}`}
                onClick={() => modifyPendingSetting("timeMultiplier", -1)}
            >
                -1
            </button>
        </div>
    </div>
    <div
      className="gap-1 justify-around flex ">
    <button
      onClick={Save}
      className="bg-blue-300 py-1 px-2 rounded-md">Save</button>
    <button
      onClick={Reset}
      className="bg-blue-300 py-1 px-2 rounded-md">
      Reset
    </button>
    </div>
</div>
</div>

      </div>
    </div>
  );
};

export default SettingsPage;

///////////////////////////////////////////////////////////////
