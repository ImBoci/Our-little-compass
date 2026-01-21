'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'

interface Food {
  id: string
  name: string
  description: string | null
  category: string
  created_at: string
  updated_at: string
}

interface Activity {
  id: number
  name: string
  location: string | null
  type: string | null
  description: string | null
}

export default function ManagePage() {
  const { data: session, status } = useSession()
  const [foods, setFoods] = useState<Food[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch data on component mount
  useEffect(() => {
    if (status === 'authenticated') {
      fetchData()
    }
  }, [status])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [foodsRes, activitiesRes] = await Promise.all([
        fetch('/api/food'),
        fetch('/api/activities')
      ])

      if (!foodsRes.ok) {
        throw new Error(`Failed to fetch foods: ${foodsRes.status} ${foodsRes.statusText}`)
      }

      if (!activitiesRes.ok) {
        throw new Error(`Failed to fetch activities: ${activitiesRes.status} ${activitiesRes.statusText}`)
      }

      const [foodsData, activitiesData] = await Promise.all([
        foodsRes.json(),
        activitiesRes.json()
      ])

      setFoods(foodsData)
      setActivities(activitiesData)
    } catch (error) {
      console.error('Failed to fetch data:', error)
      setError(error instanceof Error ? error.message : 'An unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleAddFood = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      category: formData.get('category') as string || 'Other'
    }

    try {
      const response = await fetch('/api/food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        const newFood = await response.json()
        setFoods(prev => [newFood, ...prev])
        e.currentTarget.reset()
        setError(null) // Clear any previous errors
      } else {
        const errorText = await response.text()
        setError(`Failed to add food: ${response.status} ${response.statusText} - ${errorText}`)
      }
    } catch (error) {
      console.error('Error adding food:', error)
      setError(error instanceof Error ? `Error adding food: ${error.message}` : 'Unknown error adding food')
    }
  }

  const handleDeleteFood = async (id: string) => {
    try {
      const response = await fetch(`/api/food?id=${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setFoods(prev => prev.filter(f => f.id !== id))
        setError(null) // Clear any previous errors
      } else {
        const errorText = await response.text()
        setError(`Failed to delete food: ${response.status} ${response.statusText} - ${errorText}`)
      }
    } catch (error) {
      console.error('Error deleting food:', error)
      setError(error instanceof Error ? `Error deleting food: ${error.message}` : 'Unknown error deleting food')
    }
  }

  const handleAddActivity = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name') as string,
      location: formData.get('location') as string,
      type: formData.get('type') as string,
      description: formData.get('description') as string
    }

    try {
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        const newActivity = await response.json()
        setActivities(prev => [newActivity, ...prev])
        e.currentTarget.reset()
        setError(null) // Clear any previous errors
      } else {
        const errorText = await response.text()
        setError(`Failed to add activity: ${response.status} ${response.statusText} - ${errorText}`)
      }
    } catch (error) {
      console.error('Error adding activity:', error)
      setError(error instanceof Error ? `Error adding activity: ${error.message}` : 'Unknown error adding activity')
    }
  }

  const handleDeleteActivity = async (id: number) => {
    try {
      const response = await fetch(`/api/activities?id=${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setActivities(prev => prev.filter(a => a.id !== id))
        setError(null) // Clear any previous errors
      } else {
        const errorText = await response.text()
        setError(`Failed to delete activity: ${response.status} ${response.statusText} - ${errorText}`)
      }
    } catch (error) {
      console.error('Error deleting activity:', error)
      setError(error instanceof Error ? `Error deleting activity: ${error.message}` : 'Unknown error deleting activity')
    }
  }

  if (status === 'loading') {
    return <div className="p-10 text-center">Loading...</div>
  }

  if (status === 'unauthenticated') {
    return (
      <div className="p-10 text-center text-red-500">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p>Please log in to manage the database.</p>
        <Link href="/" className="underline mt-4 block">Go Home</Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manage Database</h1>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Log Out
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline ml-2">{error}</span>
          <button
            onClick={fetchData}
            className="ml-4 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {loading && <div className="text-center">Loading data...</div>}

      {/* Foods Section */}
      <div className="border p-4 rounded bg-white/50">
        <h2 className="text-xl font-bold mb-4">Foods ({foods.length})</h2>

        <form onSubmit={handleAddFood} className="flex gap-2 mb-4">
          <input
            name="name"
            placeholder="Name"
            required
            className="border p-2 rounded flex-1"
          />
          <input
            name="description"
            placeholder="Description"
            className="border p-2 rounded flex-1"
          />
          <input
            name="category"
            placeholder="Category"
            defaultValue="Other"
            className="border p-2 rounded w-24"
          />
          <button className="bg-green-600 text-white px-4 rounded hover:bg-green-700">
            Add
          </button>
        </form>

        <ul className="space-y-2">
          {foods.map(food => (
            <li key={food.id} className="flex justify-between border-b p-2">
              <div>
                <strong>{food.name}</strong>
                {food.description && <span className="text-gray-600 ml-2">({food.description})</span>}
                <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                  {food.category}
                </span>
              </div>
              <button
                onClick={() => handleDeleteFood(food.id)}
                className="text-red-500 hover:text-red-700 font-bold"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Activities Section */}
      <div className="border p-4 rounded bg-white/50">
        <h2 className="text-xl font-bold mb-4">Activities ({activities.length})</h2>

        <form onSubmit={handleAddActivity} className="flex gap-2 mb-4">
          <input
            name="name"
            placeholder="Name"
            required
            className="border p-2 rounded flex-1"
          />
          <input
            name="location"
            placeholder="Location"
            className="border p-2 rounded flex-1"
          />
          <input
            name="type"
            placeholder="Type"
            className="border p-2 rounded w-24"
          />
          <button className="bg-purple-600 text-white px-4 rounded hover:bg-purple-700">
            Add
          </button>
        </form>

        <ul className="space-y-2">
          {activities.map(activity => (
            <li key={activity.id} className="flex justify-between border-b p-2">
              <div>
                <strong>{activity.name}</strong>
                {activity.type && (
                  <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                    {activity.type}
                  </span>
                )}
                {activity.location && (
                  <span className="ml-2 text-gray-600">📍 {activity.location}</span>
                )}
              </div>
              <button
                onClick={() => handleDeleteActivity(activity.id)}
                className="text-red-500 hover:text-red-700 font-bold"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}