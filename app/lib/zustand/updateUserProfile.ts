
// Original Code
// {
// import { create } from 'zustand'
// import { immer } from 'zustand/middleware/immer'



// interface CountryScores {
//   [key: string]: number
// }

// interface Premium {
//   active: boolean
//   expiryDate?: string
// }

// interface UserProfile {
//   uid: string | null
//   displayName: string | null
//   email: string | null
//   photoURL: string | null
//   emailVerified: boolean
//   tickets: number
//   tokens: number
//   premium: Premium
//   overallscore: number
//   countryscore: CountryScores
//   countryATH: CountryScores
// }

// interface UserProfileState {
//   user: UserProfile | null  // States
//   updateUserProfile: (data: Partial<UserProfile>) => void // funcion #1
//   updateCountryScore: (country: string, value: number) => void // funcion #2
//   resetUserProfile: () => void // funcion #3
// }



// const defaultCountryScores: CountryScores = {
//   denmark: 0, estonia: 0, finland: 0, iceland: 0, ireland: 0,
//   latvia: 0, lithuania: 0, norway: 0, sweden: 0, 'united kingdom': 0,
//   austria: 0, belgium: 0, france: 0, germany: 0, liechtenstein: 0,
//   luxembourg: 0, monaco: 0, netherlands: 0, switzerland: 0,
//   albania: 0, andorra: 0, 'bosnia and herzegovina': 0, croatia: 0,
//   greece: 0, italy: 0, malta: 0, montenegro: 0, 'north macedonia': 0,
//   portugal: 0, 'san marino': 0, serbia: 0, slovenia: 0, spain: 0,
//   'vatican city': 0, belarus: 0, bulgaria: 0, czechia: 0, hungary: 0,
//   moldova: 0, poland: 0, romania: 0, slovakia: 0, ukraine: 0,
// }

// const defaultPremium: Premium = { active: false }



// export const useUpdateUserProfile = create<UserProfileState>()(
//   //state
//   immer((set) => ({
//     user: {
//       uid: null,
//       displayName: null,
//       email: null,
//       photoURL: null,
//       emailVerified: false,
//       tickets: 0,
//       tokens: 0,
//       premium: defaultPremium,
//       overallscore: 0,
//       countryscore: { ...defaultCountryScores },
//       countryATH: { ...defaultCountryScores },
//     },
//   //function #1
//     updateUserProfile: (data) =>
//       set((state) => {
//         if (!state.user) return // default catch
//         Object.assign(state.user, data)
//       }),
//   //function #2
//     updateCountryScore: (country, value) =>
//       set((state) => {
//         if (!state.user) return // default catch
//         if (state.user.countryscore[country] !== undefined) {
//           state.user.countryscore[country] = value
//         }
//       }),
//   //function #3
//     resetUserProfile: () =>
//       set((state) => {
//         state.user = {
//           uid: null,
//           displayName: null,
//           email: null,
//           photoURL: null,
//           emailVerified: false,
//           tickets: 0,
//           tokens: 0,
//           premium: defaultPremium,
//           overallscore: 0,
//           countryscore: { ...defaultCountryScores },
//           countryATH: { ...defaultCountryScores },
//         }
//       }),
//   }))
// )

// }


import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

/* ----------------- Types ----------------- */

interface Premium {
  active: boolean;
  status: string;
  expiryDate?: string;
}

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
  lastplayed: number
}

interface Countries {
  [key: string]: CountryData;
}

interface UserProfile {
  uid: string | null;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  tickets: number;
  overallscore: number;
  premium: Premium;
  settings: UserSettings;
  countries: Countries;
}

interface UserProfileState {
  user: UserProfile;

  updateUserProfile: (data: Partial<UserProfile>) => void;
  updateSettings: (data: Partial<UserSettings>) => void;
  updatezCountry: (name: string, data: Partial<CountryData>) => void;

  updateCountryScore: (name: string | number, points: number) => void; // <-- add this

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

const defaultPremium: Premium = { active: false , status: 'Freemium', expiryDate: '' };

const defaultCountries: Countries = {};

/* default user (MUST NOT BE NULL) */
const defaultUser: UserProfile = {
  uid: '',
  displayName: null,
  email: null,
  photoURL: null,
  emailVerified: false,
  tickets: 0,
  overallscore: 0,
  premium: defaultPremium,
  settings: { ...defaultSettings },
  countries: { ...defaultCountries },
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

    // Update score
    const newScore = (country.score || 0) + points;
    country.score = points;

    // Update ATH if needed
    country.ATH = points > (country.ATH || 0) ? points : country.ATH;

    // Unlock country automatically
    country.unlock = true;

    // Recalculate overall score
    state.user.overallscore = Object.values(state.user.countries)
      .reduce((sum, c) => sum + (c.score || 0), 0);

    // Increment tickets by 2
    state.user.tickets += 2;
  }),


    resetUserProfile: () =>
      set((state) => {
        state.user = { ...defaultUser };
      }),
  }))
);

// Use this to copy paste on pages.
// const { user,updatezCountry , updateCountryScore,  updateUserProfile, resetUserProfile, updateSettings } = useUpdateUserProfile();
