"use client";

import React from "react";
import Logo from "../component/logo";
import { updateEnv } from "../lib/zustand/updateEnvironmet";

const SettingsPage = () => {
  const { env, toggleEnv, setEnv } = updateEnv();

  return (
    <div className="p-4">
      <Logo />

      <h2 className="text-xl font-bold mt-4 mb-2">
        Current Environment: {env}
      </h2>

      <div className="flex gap-2">
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
    </div>
  );
};

export default SettingsPage;
