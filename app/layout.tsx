'use client'

import React, { useEffect } from "react";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { useUpdateUserProfile } from "./lib/zustand/updateUserProfile";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

// ✅ Default country scores
const defaultCountryScores = {
  denmark: 0, estonia: 0, finland: 0, iceland: 0, ireland: 0,
  latvia: 0, lithuania: 0, norway: 0, sweden: 0, 'united kingdom': 0,
  austria: 0, belgium: 0, france: 0, germany: 0, liechtenstein: 0,
  luxembourg: 0, monaco: 0, netherlands: 0, switzerland: 0,
  albania: 0, andorra: 0, 'bosnia and herzegovina': 0, croatia: 0,
  greece: 0, italy: 0, malta: 0, montenegro: 0, 'north macedonia': 0,
  portugal: 0, 'san marino': 0, serbia: 0, slovenia: 0, spain: 0,
  'vatican city': 0, belarus: 0, bulgaria: 0, czechia: 0, hungary: 0,
  moldova: 0, poland: 0, romania: 0, slovakia: 0, ukraine: 0,
};

// ✅ Default premium structure
const defaultPremium = { active: false, expiryDate: "" };

// ✅ List of countries for countryATH
const countriesList = [
  "denmark","estonia","finland","iceland","ireland","latvia","lithuania","norway","sweden","united kingdom",
  "austria","belgium","france","germany","liechtenstein","luxembourg","monaco","netherlands","switzerland",
  "albania","andorra","bosnia and herzegovina","croatia","greece","italy","malta","montenegro","north macedonia",
  "portugal","san marino","serbia","slovenia","spain","vatican city","belarus","bulgaria","czechia","hungary",
  "moldova","poland","romania","slovakia","ukraine"
];

// 🔹 Default fallback user
const startUser = {
  displayName: null,
  email: null,
  photoURL: null,
  emailVerified: false,
  tickets: 0,
  tokens: 0,
  premium: defaultPremium,
  overallscore: 0,
  countryscore: { ...defaultCountryScores },
  countryATH: Object.fromEntries(countriesList.map((c) => [c, 0])),
};

export default function RootLayout({ children }: { children: ReactNode }) {
  // ✅ Get user and update function from Zustand
  const user = useUpdateUserProfile((state) => state.user);
  const updateUserProfile = useUpdateUserProfile((state) => state.updateUserProfile);

  // ✅ Repopulate Zustand if user data reset
  useEffect(() => {
    if (!user?.email) {
      updateUserProfile(startUser);
    }
  }, [user, updateUserProfile]);

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* <header className="p-4 bg-gray-100">
          {user?.email ? (
            <p className="text-sm text-gray-700">Logged in as: {user.email}</p>
          ) : (
            <p className="text-sm text-gray-700">Not logged in</p>
          )}
        </header> */}
        {children}
      </body>
    </html>
  );
}
