"use client";
import React, { useState } from "react";

const Page = () => {
  const [isSandbox, setIsSandbox] = useState(true);
  const [isLocalhost, setIsLocalhost] = useState(true);

  const toggleSandbox = () => setIsSandbox(!isSandbox);
  const toggleHost = () => setIsLocalhost(!isLocalhost);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 font-sans p-6">
      <h1 className="text-2xl font-bold mb-6">Environment Configuration</h1>

      {/* Sandbox vs Live */}
      <div className="flex items-center gap-4 mb-4">
        <span className="text-gray-700">Mode:</span>
        <button
          onClick={toggleSandbox}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            isSandbox
              ? "bg-blue-500 text-white"
              : "bg-green-500 text-white"
          }`}
        >
          {isSandbox ? "Sandbox" : "Live"}
        </button>
      </div>

      {/* Localhost vs Live Web */}
      <div className="flex items-center gap-4 mb-4">
        <span className="text-gray-700">Environment:</span>
        <button
          onClick={toggleHost}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            isLocalhost
              ? "bg-gray-500 text-white"
              : "bg-purple-600 text-white"
          }`}
        >
          {isLocalhost ? "Localhost" : "Live Web"}
        </button>
      </div>

      {/* Display current settings */}
      <div className="mt-6 text-center">
        <p className="text-gray-700">
          <strong>Current Mode:</strong> {isSandbox ? "Sandbox" : "Live"}
        </p>
        <p className="text-gray-700">
          <strong>Current Environment:</strong> {isLocalhost ? "Localhost" : "Live Web"}
        </p>
      </div>
    </div>
  );
};

export default Page;
