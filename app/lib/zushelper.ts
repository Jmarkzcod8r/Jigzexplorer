// helper.ts
import { useUpdateUserProfile } from "./zustand/updateUserProfile"

export const isUserLoggedIn = (): boolean => {
  const user = useUpdateUserProfile.getState().user
  if (!user) return false
  return !!user.displayName && !!user.email
}
