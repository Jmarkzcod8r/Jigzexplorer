"use client";

import React from "react";
import Logo from "../component/logo";
import { updateEnv } from "../lib/zustand/updateEnvironmet";
import { useUpdateUserProfile } from "../lib/zustand/updateUserProfile";

const SettingsPage = () => {
  const { env, toggleEnv, setEnv } = updateEnv(); // <-- call the hook correctly

  const { user, incrementSetting, decrementSetting, updateSettings } =
    useUpdateUserProfile();

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

        {/* Tokens */}
        <div className="flex items-center space-x-2">
          <span>Tokens: {user.settings.tokens}</span>
          <button
            className="px-2 py-1 bg-green-500 text-white rounded"
            onClick={() => incrementSetting("tokens", 1)}
          >
            +
          </button>
          <button
            className="px-2 py-1 bg-red-500 text-white rounded"
            onClick={() => decrementSetting("tokens", 1)}
          >
            -
          </button>
        </div>

        {/* Streak Multiplier */}
        <div className="flex items-center space-x-2">
          <span>Streak Multiplier: {user.settings.streakMultiplier}</span>
          <button
            className="px-2 py-1 bg-green-500 text-white rounded"
            onClick={() => incrementSetting("streakMultiplier", 1)}
          >
            +
          </button>
          <button
            className="px-2 py-1 bg-red-500 text-white rounded"
            onClick={() => decrementSetting("streakMultiplier", 1)}
          >
            -
          </button>
        </div>

        {/* Time Duration */}
        <div className="flex items-center space-x-2">
          <span>Time Duration: {user.settings.timeDuration}s</span>
          <button
            className="px-2 py-1 bg-green-500 text-white rounded"
            onClick={() => incrementSetting("timeDuration", 10)}
          >
            +10s
          </button>
          <button
            className="px-2 py-1 bg-red-500 text-white rounded"
            onClick={() => decrementSetting("timeDuration", 10)}
          >
            -10s
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
