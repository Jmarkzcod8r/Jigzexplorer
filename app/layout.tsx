'use client';

import React, { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { useUpdateUserProfile } from "./lib/zustand/updateUserProfile";
import { updateEnv } from "./lib/zustand/updateEnvironmet";
import { SyncZustandFirestore } from "./lib/SyncZustandFirestore";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

// === DEFAULTS ===============================================================

const startUser = {
  displayName: null,
  email: null,
  photoURL: null,
  emailVerified: false,
  tickets: 0,
  tokens: 0,
  premium: { status: "Freemium", active: false, expiryDate: "" },
  overallscore: 0,
  countryscore: {},
  countryATH: {},
};

// ============================================================================

export default function RootLayout({ children }: { children: ReactNode }) {
  const user = useUpdateUserProfile((state) => state.user);
  const updateUserProfile = useUpdateUserProfile((state) => state.updateUserProfile);

  const Environment = updateEnv()

  // Prevent multiple snapshot listeners
  const unsubscribeRef = useRef<null | (() => void)>(null);

  // --- 1. Load default user when empty -------------------------------------
  useEffect(() => {
    if (!user.email) {
      updateUserProfile(startUser);
    }
  }, [user.email, updateUserProfile]);

  // --- 2. Run Firestore snapshot when uid appears ---------------------------
  useEffect(() => {
    if (!user.uid) return;

    // If a previous listener exists → stop it
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }

    // Start Firestore realtime listener
    const unsubscribe = SyncZustandFirestore(user.uid);
    unsubscribeRef.current = unsubscribe;

    // Cleanup snapshot on unmount or uid change
    return () => {
      if (unsubscribeRef.current) unsubscribeRef.current();
    };
  }, [user.uid]);

  // ==========================================================================

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <header className="p-4 bg-gray-100 flex  justify-around">
          {user?.email ? (
            <p className="text-sm text-gray-700">Logged in as: {user.email}</p>
          ) : (
            <p className="text-sm text-gray-700">Not logged in</p>
          )}
          <p>Environment: {Environment.env}</p>
          <p>Score: {user.overallscore}</p>
          <p>UID: {user.uid}</p>
          <p>Photo: {user.photoURL}</p>
          <p>Tickets: {user.tickets}</p>
          <p>Tokens: {user.settings?.tokens}</p>
          <p>Premium Status: {user.subscription?.status}</p>
          <p>puzzle completion score: {user.settings.puzzlecompletionscore}</p>
          <p>pstreak multiplier: {user.settings.streakMultiplier}</p>
          <p>time Duration: {user.settings.timeDuration}</p>
          <p>time Multiplier:(elapsed time) {user.settings.timeMultiplier}</p>
        </header>

        {children}
      </body>
    </html>
  );
}
