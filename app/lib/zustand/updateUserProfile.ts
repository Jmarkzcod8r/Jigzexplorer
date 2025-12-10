import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

/* ----------------- Types ----------------- */

interface UserSettings {
  tokens: number;
  streakMultiplier: number;
  timeMultiplier: number;
  timeDuration: number;
  turboBonus: number;
  turbocountdown: number;
  puzzlecompletionscore: number;
  [key: string]: any;
}

interface CountryData {
  ATH: number;
  score: number;
  unlock: boolean;
  lastplayed: number;
}

interface Countries {
  [key: string]: CountryData;
}

interface PaddleSubscription {
  subscriptionId: string;
  planId: string;
  planName: string;
  currency: string;
  amount: number;
  billingInterval: string;
  billingFrequency: number;
  status: string;
  isTrial: boolean;
  trialEndsAt?: number;
  nextBillAt?:number;
  lastPaymentAt?:number;
  cancelAt?: number;
  paymentType?:number;
  last4?: number;
  meta?: Record<string, any>;
}

interface UserProfile {
  uid: string | null;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  tickets: number;
  overallscore: number;

  settings: UserSettings;
  countries: Countries;
  subscription?: PaddleSubscription; // <-- added subscription
}

interface UserProfileState {
  user: UserProfile;

  updateUserProfile: (data: Partial<UserProfile>) => void;
  updateSettings: (data: Partial<UserSettings>) => void;
  updatezCountry: (name: string, data: Partial<CountryData>) => void;
  updateCountryScore: (name: string | number, points: number) => void;
  updateSubscription: (data: Partial<PaddleSubscription>) => void; // <-- new
  resetUserProfile: () => void;
}

/* ----------------- Defaults ----------------- */

const defaultSettings: UserSettings = {
  tokens: 3,
  streakMultiplier: 0,
  timeMultiplier: 0,
  timeDuration: 0,
  turboBonus: 0,
  turbocountdown: 0,
  puzzlecompletionscore: 0,

};

const defaultCountries: Countries = {};

/* DEFAULT SUBSCRIPTION */
const defaultSubscription: PaddleSubscription = {
  subscriptionId: "",
  planId: "",
  planName: "Freemium",
  currency: "USD",
  amount: 0,
  billingInterval: "month",
  billingFrequency: 1,
  status: "Freemium", // Active | Past_due | Canceled | Trialing | Freemium
  isTrial: false,
  trialEndsAt: undefined,
  nextBillAt: undefined,
  lastPaymentAt: undefined,
  cancelAt: undefined,
  paymentType: undefined,
  last4: undefined,
  meta: {},
};

/* DEFAULT USER */
const defaultUser: UserProfile = {
  uid: "",
  displayName: null,
  email: null,
  photoURL: null,
  emailVerified: false,
  tickets: 0,
  overallscore: 0,

  settings: { ...defaultSettings },
  countries: { ...defaultCountries },
  subscription: { ...defaultSubscription },  // <-- default empty
};

/* ----------------- Zustand Store ----------------- */

/* ----------------- Zustand Store ----------------- */

export const useUpdateUserProfile = create<UserProfileState & {
  incrementSetting: (key: keyof UserSettings, value?: number) => void;
  decrementSetting: (key: keyof UserSettings, value?: number) => void;
}>()(
  immer((set) => ({
    user: { ...defaultUser },

    updateUserProfile: (data) =>
      set((state) => {
        Object.assign(state.user, data);
      }),

    updateSettings: (data) =>
      set((state) => {
        Object.assign(state.user.settings, data);
      }),

    incrementSetting: (key, value = 1) =>
      set((state) => {
        if (state.user.settings[key] !== undefined && typeof state.user.settings[key] === "number") {
          state.user.settings[key] += value;
        }
      }),

    decrementSetting: (key, value = 1) =>
      set((state) => {
        if (state.user.settings[key] !== undefined && typeof state.user.settings[key] === "number") {
          state.user.settings[key] -= value;
          // Optional: prevent negative values
          if (state.user.settings[key] < 0) state.user.settings[key] = 0;
        }
      }),

    updatezCountry: (name, data) =>
      set((state) => {
        if (!state.user.countries[name]) return;
        Object.assign(state.user.countries[name], data);
      }),

    updateCountryScore: (name: string | number, points: number) =>
      set((state) => {
        const country = state.user.countries[name];
        if (!country) return;

        const newScore = (country.score || 0) + points;
        country.score = newScore;
        country.ATH = Math.max(country.ATH, newScore);
        country.unlock = true;

        state.user.overallscore = Object.values(state.user.countries)
          .reduce((sum, c) => sum + (c.score || 0), 0);

        state.user.tickets += 2;
      }),

    updateSubscription: (data: Partial<PaddleSubscription>) =>
      set((state) => {
        if (!state.user.subscription) state.user.subscription = {} as PaddleSubscription;
        Object.assign(state.user.subscription, data);
      }),

    resetUserProfile: () =>
      set((state) => {
        state.user = { ...defaultUser };
      }),
  }))
);



// Use this to copy paste on pages.
// const { user,updatezCountry , updateCountryScore,  updateUserProfile, resetUserProfile, updateSettings } = useUpdateUserProfile();
