
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'



interface CountryScores {
  [key: string]: number
}

interface Premium {
  active: boolean
  expiryDate?: string
}

interface UserProfile {
  displayName: string | null
  email: string | null
  photoURL: string | null
  emailVerified: boolean
  tickets: number
  tokens: number
  premium: Premium
  overallscore: number
  countryscore: CountryScores
  countryATH: CountryScores
}

interface UserProfileState {
  user: UserProfile | null
  updateUserProfile: (data: Partial<UserProfile>) => void
  updateCountryScore: (country: string, value: number) => void
  resetUserProfile: () => void
}



const defaultCountryScores: CountryScores = {
  denmark: 0, estonia: 0, finland: 0, iceland: 0, ireland: 0,
  latvia: 0, lithuania: 0, norway: 0, sweden: 0, 'united kingdom': 0,
  austria: 0, belgium: 0, france: 0, germany: 0, liechtenstein: 0,
  luxembourg: 0, monaco: 0, netherlands: 0, switzerland: 0,
  albania: 0, andorra: 0, 'bosnia and herzegovina': 0, croatia: 0,
  greece: 0, italy: 0, malta: 0, montenegro: 0, 'north macedonia': 0,
  portugal: 0, 'san marino': 0, serbia: 0, slovenia: 0, spain: 0,
  'vatican city': 0, belarus: 0, bulgaria: 0, czechia: 0, hungary: 0,
  moldova: 0, poland: 0, romania: 0, slovakia: 0, ukraine: 0,
}

const defaultPremium: Premium = { active: false }



export const useUpdateUserProfile = create<UserProfileState>()(
  //state
  immer((set) => ({
    user: {
      displayName: null,
      email: null,
      photoURL: null,
      emailVerified: false,
      tickets: 0,
      tokens: 0,
      premium: defaultPremium,
      overallscore: 0,
      countryscore: { ...defaultCountryScores },
      countryATH: { ...defaultCountryScores },
    },
  //function #1
    updateUserProfile: (data) =>
      set((state) => {
        if (!state.user) return // default catch
        Object.assign(state.user, data)
      }),
  //function #2
    updateCountryScore: (country, value) =>
      set((state) => {
        if (!state.user) return // default catch
        if (state.user.countryscore[country] !== undefined) {
          state.user.countryscore[country] = value
        }
      }),
  //function #3
    resetUserProfile: () =>
      set((state) => {
        state.user = {
          displayName: null,
          email: null,
          photoURL: null,
          emailVerified: false,
          tickets: 0,
          tokens: 0,
          premium: defaultPremium,
          overallscore: 0,
          countryscore: { ...defaultCountryScores },
          countryATH: { ...defaultCountryScores },
        }
      }),
  }))
)
