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
  tokens: 0,
  streakMultiplier: 1,
  timeMultiplier: 1,
  timeDuration: 60,
  turboBonus: 0,
  turbocountdown: 30,
  puzzlecompletionscore: 50,
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
  status: "Freemium", // default status
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

export const useUpdateUserProfile = create<UserProfileState>()(
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

    updatezCountry: (name, data) =>
      set((state) => {
        if (!state.user.countries[name]) return;
        Object.assign(state.user.countries[name], data);
      }),

    updateCountryScore: (name: string | number, points: number) =>
      set((state) => {
        const country = state.user.countries[name];
        if (!country) return;

        // Increase score properly
        const newScore = (country.score || 0) + points;
        country.score = newScore;

        // ATH update
        country.ATH = Math.max(country.ATH, newScore);

        // Auto-unlock
        country.unlock = true;

        // Update overall score
        state.user.overallscore = Object.values(state.user.countries)
          .reduce((sum, c) => sum + (c.score || 0), 0);

        // Reward tickets
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
