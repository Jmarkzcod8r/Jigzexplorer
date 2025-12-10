"use client";

import React, { useEffect, useState } from "react";
import Logo from "../component/logo";
import { updateEnv } from "../lib/zustand/updateEnvironmet";
import { useUpdateUserProfile } from "../lib/zustand/updateUserProfile";

const SettingsPage = () => {
  const { env, toggleEnv, setEnv } = updateEnv();

  // Destructure the necessary state and actions from the hook
  const { user, incrementSetting, decrementSetting, updateSettings } =
    useUpdateUserProfile();

  const [usedupTokens, setUsedupTokens] = useState(false)

  const [pendingSettings, setPendingSettings] = useState(user.settings);

  useEffect(() => {
    setPendingSettings(user.settings);
  }, [user.settings]);

  const updatePendingSetting = (key: string, increment: number) => {
    setPendingSettings(prev => ({
      ...prev,
      [key]: prev[key] + increment, // TypeScript is still unhappy with prev[key] access
    }));
};


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
    const value = user.settings[key];
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


  return (
    <div className="p-4">
      <Logo />

      <h2 className="text-xl font-bold mt-4 mb-2">
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
      </div>

      <div className="p-4 space-y-4">

        <h1 className="text-2xl font-bold">Settings</h1>

        {/* Tokens and Used Tokens - MODIFIED */}
        <div className="flex items-center space-x-4 p-2 border rounded bg-gray-100">
          <span className="font-semibold">
            Available Tokens: <span className="text-blue-600">{user.settings.tokens}</span>
          </span>
          <span className="text-gray-600">|</span>
          <span className="font-semibold">
            Used Tokens: <span className="text-red-600">{usedTokens}</span>
          </span>
          <span className="font-semibold">
            UsedUp Tokens ??: <span className="text-red-600">{usedupTokens ? 'true': 'false'}</span>
          </span>
        </div>
        {/* const puzzlecompletionscore = 100 + (5 * user.user.settings.puzzlecompletionscore)  ; // base                + 5   /10
  const streakmultiplier = 10 + (user.user.settings.streakMultiplier)   ;            // Multiplier for streak  + 1   /10
  const timeMultiplier = 10 + (user.user.settings.timeMultiplier)     ;       // Multiplier for elapsed Time   + 1   /10
  const timeduration = 180 + (5 * user.user.settings.timeDuration);      // duration before penalty(3 mins.)   + 5   /10
  const turbobonus = 200 + (4 * user.user.settings.turboBonus); // +100 to puzzlecompletionscore               + 4   /10
  const turbocountdown= 30 + (2 * user.user.settings.turbocountdown);                                   //     + 2    /10 */}

      <div className="bg-blue-500 flex justify-around flex-col items-center gap-3 p-2 rounded-lg">
         {/* Puzzle Complete Score @+5 */}
         <div className="flex items-center space-x-2">
          <span>Puzzle Completion Score: {100 + (5 * user.settings.puzzlecompletionscore)}</span>
          <button
            disabled = {usedupTokens}
            className={`px-2 py-1 text-white rounded
            ${usedupTokens ? "bg-gray-300" : "bg-green-500"}`}
            onClick={() => incrementSetting("puzzlecompletionscore", 1)}
          >
            +5s
          </button>
          <button
             className={`px-2 py-1 text-white rounded
             ${user.settings.puzzlecompletionscore === 0 ? "bg-gray-300" : "bg-red-500"}`}
            onClick={() => decrementSetting("puzzlecompletionscore", 1)}
          >
            -5s
          </button>
        </div>
        {/* Streak Multiplier @ +1 */}
        <div className="flex items-center space-x-2">
          <span>Streak Multiplier: {10 + (user.settings.streakMultiplier)}</span>
          <button
            disabled = {usedupTokens}
            className={`px-2 py-1 text-white rounded
            ${usedupTokens ? "bg-gray-300" : "bg-green-500"}`}
            onClick={() => incrementSetting("streakMultiplier", 1)}
          >
            +1
          </button>
          <button
           className={`px-2 py-1 text-white rounded
           ${user.settings.streakMultiplier === 0 ? "bg-gray-300" : "bg-red-500"}`}
            onClick={() => decrementSetting("streakMultiplier", 1)}
          >
            -1
          </button>
        </div>

        {/* Time Duration @ +1*/}
        <div className="flex items-center space-x-2">
          <span>Game Time Duration: {180 + (5 * user.settings.timeDuration)}s</span>
          <button
            disabled = {usedupTokens}
            className={`px-2 py-1 text-white rounded
            ${usedupTokens ? "bg-gray-300" : "bg-green-500"}`}
            onClick={() => incrementSetting("timeDuration", 1)}
          >
            +5
          </button>
          <button
            className={`px-2 py-1 text-white rounded
            ${user.settings.timeDuration === 0 ? "bg-gray-300" : "bg-red-500"}`}
            onClick={() => decrementSetting("timeDuration", 1)}
          >
            -5
          </button>
        </div>

        {/* Turbo Bonus @ +5 */}
        <div className="flex items-center space-x-2">
          <span>Turbo Bonus: {200 + (4 * user.settings.turboBonus)}</span>
          <button
            disabled = {usedupTokens}
            className={`px-2 py-1 text-white rounded
            ${usedupTokens ? "bg-gray-300" : "bg-green-500"}`}
            onClick={() => incrementSetting("turboBonus", 1)}
          >
            +4
          </button>
          <button
            className={`px-2 py-1 text-white rounded
            ${user.settings.turboBonus === 0 ? "bg-gray-300" : "bg-red-500"}`}
            onClick={() => decrementSetting("turboBonus", 1)}
          >
            -4
          </button>
        </div>

        {/*turbocountdown= 30 + (2 * user.user.settings.turbocountdown);     @ +2 */}
        <div className="flex items-center space-x-2">
          <span>Turbo Countdown: {30 + (2 * user.settings.turbocountdown)}s</span>
          <button
            disabled = {usedupTokens}
            className={`px-2 py-1 text-white rounded
            ${usedupTokens ? "bg-gray-300" : "bg-green-500"}`}
            onClick={() => incrementSetting("turbocountdown", 1)}
          >
            +2
          </button>
          <button
            className={`px-2 py-1 text-white rounded
            ${user.settings.turbocountdown === 0 ? "bg-gray-300" : "bg-red-500"}`}
            onClick={() => decrementSetting("turbocountdown", 1)}
          >
            -2
          </button>
        </div>

        {/*  const timeMultiplier = 10 + (user.user.settings.timeMultiplier)    @ +1 */}
        <div className="flex items-center space-x-2">
          <span>Elapsed Time Multiplier: {10 + (user.settings.timeMultiplier)}</span>
          <button
            disabled = {usedupTokens}
            className={`px-2 py-1 text-white rounded
            ${usedupTokens ? "bg-gray-300" : "bg-green-500"}`}
            onClick={() => incrementSetting("timeMultiplier", 1)}
          >
            +1
          </button>
          <button
            className={`px-2 py-1 text-white rounded
            ${user.settings.timeMultiplier === 0 ? "bg-gray-300" : "bg-red-500"}`}
            onClick={() => decrementSetting("timeMultiplier", 1)}
          >
            -1
          </button>
        </div>

        <button>Save</button>
        </div>

      </div>
    </div>
  );
};

export default SettingsPage;

///////////////////////////////////////////////////////////////
