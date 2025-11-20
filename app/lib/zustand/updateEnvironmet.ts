// /lib/store/useEnvironment.ts
import { create } from "zustand";

interface EnvironmentState {
  env: "sandbox" | "production";
  toggleEnv: () => void;
  setEnv: (newEnv: "sandbox" | "production") => void;
}

export const updateEnv = create<EnvironmentState>((set) => ({
  // Default to "production" if env variable is missing
  env: (process.env.NEXT_PUBLIC_ENVIRONMENT as "sandbox" | "production") || "production",

  // Toggle between sandbox and production
  toggleEnv: () =>
    set((state) => ({
      env: state.env === "sandbox" ? "production" : "sandbox",
    })),

  // Directly set environment
  setEnv: (newEnv) => set({ env: newEnv }),
}));
