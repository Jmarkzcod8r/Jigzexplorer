'use client'

import { useUpdateUserProfile } from "../lib/zustand/updateUserProfile"
import { useHydrated } from "./useHydratedStore"

export default function ZustandPage() {
  const hydrated = useHydrated()
  const { user } = useUpdateUserProfile()

  if (!hydrated) return <p>Loading...</p>

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">User Profile</h1>
      <p>Name: {user?.displayName ?? 'None'}</p>
      <p>Tokens: {user?.tokens ?? 0}</p>
    </div>
  )
}
