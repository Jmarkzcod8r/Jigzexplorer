'use client'

import React, { useState } from 'react'
import { useUpdateUserProfile } from '../../lib/zustand/updateUserProfile'
import Link from 'next/link'

export default function EditZustandPage() {
  const { user, updateUserProfile, updateCountryScore, resetUserProfile } = useUpdateUserProfile()

  const [form, setForm] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    tickets: user?.tickets || 0,
    tokens: user?.tokens || 0,
    overallscore: user?.overallscore || 0,
  })

  const [country, setCountry] = useState('')
  const [countryValue, setCountryValue] = useState(0)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: name === 'tickets' || name === 'tokens' || name === 'overallscore' ? Number(value) : value,
    }))
  }

  const handleUpdate = () => {
    updateUserProfile(form)
  }

  const handleCountryUpdate = () => {
    if (country.trim()) {
      updateCountryScore(country.toLowerCase(), Number(countryValue))
      setCountry('')
      setCountryValue(0)
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">✏️ Edit Zustand Profile</h1>

      <div className="bg-white shadow rounded-xl p-4 mb-6">
        <h2 className="text-lg font-semibold mb-3">Edit Profile Info</h2>
        <div className="grid gap-3">
          <input className="border rounded p-2" type="text" name="displayName" placeholder="Display Name" value={form.displayName} onChange={handleChange} />
          <input className="border rounded p-2" type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} />
          <input className="border rounded p-2" type="number" name="tickets" placeholder="Tickets" value={form.tickets} onChange={handleChange} />
          <input className="border rounded p-2" type="number" name="tokens" placeholder="Tokens" value={form.tokens} onChange={handleChange} />
          <input className="border rounded p-2" type="number" name="overallscore" placeholder="Overall Score" value={form.overallscore} onChange={handleChange} />

          <button onClick={handleUpdate} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Save Changes
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-xl p-4 mb-6">
        <h2 className="text-lg font-semibold mb-3">Add / Update Country Score</h2>
        <div className="flex gap-2">
          <input className="border rounded p-2 flex-1" type="text" placeholder="Country (e.g. Denmark)" value={country} onChange={(e) => setCountry(e.target.value)} />
          <input className="border rounded p-2 w-24" type="number" placeholder="Score" value={countryValue} onChange={(e) => setCountryValue(Number(e.target.value))} />
          <button onClick={handleCountryUpdate} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
            Update
          </button>
        </div>
      </div>

      <button onClick={resetUserProfile} className="cursor-pointer bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 w-full mb-3">
        Reset Profile
      </button>

      <Link href="/zustand" className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 block text-center">
        Back to Profile View
      </Link>
    </div>
  )
}
