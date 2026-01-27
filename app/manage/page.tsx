'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { Pencil } from 'lucide-react'

type ActiveTab = 'food' | 'activity'

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

type EditingItem =
  | { kind: 'food'; item: Food }
  | { kind: 'activity'; item: Activity }
  | null

const emptyFoodForm = { name: '', description: '', category: '' }
const emptyActivityForm = { name: '', location: '', type: '', description: '' }

export default function ManagePage() {
  const { status } = useSession()
  const [activeTab, setActiveTab] = useState<ActiveTab>('food')
  const [editingItem, setEditingItem] = useState<EditingItem>(null)
  const [foods, setFoods] = useState<Food[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [foodForm, setFoodForm] = useState(emptyFoodForm)
  const [activityForm, setActivityForm] = useState(emptyActivityForm)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'authenticated') {
      fetchData()
    }
  }, [status])

  useEffect(() => {
    if (editingItem && editingItem.kind !== activeTab) {
      setEditingItem(null)
    }
  }, [activeTab, editingItem])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [foodsRes, activitiesRes] = await Promise.all([
        fetch('/api/food'),
        fetch('/api/activities'),
      ])

      if (!foodsRes.ok) {
        throw new Error(`Failed to fetch foods: ${foodsRes.status} ${foodsRes.statusText}`)
      }

      if (!activitiesRes.ok) {
        throw new Error(`Failed to fetch activities: ${activitiesRes.status} ${activitiesRes.statusText}`)
      }

      const [foodsData, activitiesData] = await Promise.all([
        foodsRes.json(),
        activitiesRes.json(),
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

  const foodCategories = useMemo(() => {
    const unique = new Set<string>()
    foods.forEach(food => {
      if (food.category) unique.add(food.category)
    })
    return Array.from(unique).sort()
  }, [foods])

  const activityTypes = useMemo(() => {
    const unique = new Set<string>()
    activities.forEach(activity => {
      if (activity.type) unique.add(activity.type)
    })
    const list = Array.from(unique).sort()
    return list.length > 0 ? list : ['Other']
  }, [activities])

  const startEditFood = (food: Food) => {
    setEditingItem({ kind: 'food', item: food })
    setFoodForm({
      name: food.name,
      description: food.description ?? '',
      category: food.category ?? '',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const startEditActivity = (activity: Activity) => {
    setEditingItem({ kind: 'activity', item: activity })
    setActivityForm({
      name: activity.name,
      location: activity.location ?? '',
      type: activity.type ?? activityTypes[0] ?? 'Other',
      description: activity.description ?? '',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelEdit = () => {
    setEditingItem(null)
    setFoodForm(emptyFoodForm)
    setActivityForm(emptyActivityForm)
  }

  const handleFoodSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const payload = {
      id: editingItem?.kind === 'food' ? editingItem.item.id : undefined,
      name: foodForm.name,
      description: foodForm.description,
      category: foodForm.category || 'Other',
    }

    try {
      const response = await fetch('/api/food', {
        method: editingItem?.kind === 'food' ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to save food: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const savedFood = await response.json()
      setFoods(prev => {
        if (editingItem?.kind === 'food') {
          return prev.map(item => (item.id === savedFood.id ? savedFood : item))
        }
        return [savedFood, ...prev]
      })
      setFoodForm(emptyFoodForm)
      setEditingItem(null)
      setError(null)
    } catch (error) {
      console.error('Error saving food:', error)
      setError(error instanceof Error ? error.message : 'Unknown error saving food')
    }
  }

  const handleActivitySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const payload = {
      id: editingItem?.kind === 'activity' ? editingItem.item.id : undefined,
      name: activityForm.name,
      description: activityForm.description,
      location: activityForm.location,
      type: activityForm.type,
    }

    try {
      const response = await fetch('/api/activities', {
        method: editingItem?.kind === 'activity' ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to save activity: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const savedActivity = await response.json()
      setActivities(prev => {
        if (editingItem?.kind === 'activity') {
          return prev.map(item => (item.id === savedActivity.id ? savedActivity : item))
        }
        return [savedActivity, ...prev]
      })
      setActivityForm(emptyActivityForm)
      setEditingItem(null)
      setError(null)
    } catch (error) {
      console.error('Error saving activity:', error)
      setError(error instanceof Error ? error.message : 'Unknown error saving activity')
    }
  }

  const handleDeleteFood = async (id: string) => {
    try {
      const response = await fetch(`/api/food?id=${id}`, { method: 'DELETE' })
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to delete food: ${response.status} ${response.statusText} - ${errorText}`)
      }
      setFoods(prev => prev.filter(food => food.id !== id))
      setError(null)
    } catch (error) {
      console.error('Error deleting food:', error)
      setError(error instanceof Error ? error.message : 'Unknown error deleting food')
    }
  }

  const handleDeleteActivity = async (id: number) => {
    try {
      const response = await fetch(`/api/activities?id=${id}`, { method: 'DELETE' })
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to delete activity: ${response.status} ${response.statusText} - ${errorText}`)
      }
      setActivities(prev => prev.filter(activity => activity.id !== id))
      setError(null)
    } catch (error) {
      console.error('Error deleting activity:', error)
      setError(error instanceof Error ? error.message : 'Unknown error deleting activity')
    }
  }

  if (status === 'loading') {
    return <div className="p-10 text-center text-slate-700">Loading...</div>
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
    <div className="max-w-5xl mx-auto p-8 space-y-8 bg-white/40 backdrop-blur-md rounded-3xl border border-white/60 shadow-xl">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Link href="/" className="text-slate-500 hover:text-slate-800 text-sm mb-2 block">
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-slate-800">Manage Dashboard</h1>
          <p className="text-slate-600">Add, edit, and organize your foods and date ideas.</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="bg-rose-500 text-white px-4 py-2 rounded-full shadow hover:bg-rose-600 transition"
        >
          Log Out
        </button>
      </div>

      {error && (
        <div className="bg-red-100/80 border border-red-300 text-red-700 px-4 py-3 rounded-xl">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline ml-2">{error}</span>
          <button
            onClick={fetchData}
            className="ml-4 mt-2 sm:mt-0 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => setActiveTab('food')}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
            activeTab === 'food' ? 'bg-purple-600 text-white shadow' : 'bg-white/60 text-slate-600'
          }`}
        >
          Foods
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
            activeTab === 'activity' ? 'bg-purple-600 text-white shadow' : 'bg-white/60 text-slate-600'
          }`}
        >
          Activities
        </button>
      </div>

      {loading && <div className="text-center text-slate-600">Loading data...</div>}

      {activeTab === 'food' && (
        <div className="space-y-6">
          <form onSubmit={handleFoodSubmit} className="grid gap-4 bg-white/50 rounded-2xl p-6 border border-white/60 shadow">
            <div className="grid gap-3 md:grid-cols-3">
              <input
                name="name"
                placeholder="Food name"
                required
                value={foodForm.name}
                onChange={e => setFoodForm(prev => ({ ...prev, name: e.target.value }))}
                className="border border-white/70 bg-white/70 p-3 rounded-xl"
              />
              <input
                name="description"
                placeholder="Description"
                value={foodForm.description}
                onChange={e => setFoodForm(prev => ({ ...prev, description: e.target.value }))}
                className="border border-white/70 bg-white/70 p-3 rounded-xl"
              />
              <div>
                <input
                  list="food-categories"
                  name="category"
                  placeholder="Category"
                  value={foodForm.category}
                  onChange={e => setFoodForm(prev => ({ ...prev, category: e.target.value }))}
                  className="border border-white/70 bg-white/70 p-3 rounded-xl w-full"
                />
                <datalist id="food-categories">
                  {foodCategories.map(category => (
                    <option key={category} value={category} />
                  ))}
                </datalist>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="bg-purple-600 text-white px-6 py-2 rounded-full shadow hover:bg-purple-700 transition">
                {editingItem?.kind === 'food' ? 'Update Food' : 'Add Food'}
              </button>
              {editingItem?.kind === 'food' && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="bg-white/70 text-slate-700 px-6 py-2 rounded-full border border-white/80 hover:bg-white transition"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>

          <div className="grid gap-4">
            {foods.map(food => (
              <div key={food.id} className="bg-white/50 border border-white/70 rounded-2xl p-4 shadow flex flex-col gap-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">{food.name}</h3>
                    {food.description && <p className="text-slate-600">{food.description}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      {food.category}
                    </span>
                    <button
                      onClick={() => startEditFood(food)}
                      className="p-2 rounded-full bg-white/70 hover:bg-white border border-white/70"
                    >
                      <Pencil size={16} className="text-slate-600" />
                    </button>
                    <button
                      onClick={() => handleDeleteFood(food.id)}
                      className="text-rose-500 hover:text-rose-700 font-semibold"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="space-y-6">
          <form onSubmit={handleActivitySubmit} className="grid gap-4 bg-white/50 rounded-2xl p-6 border border-white/60 shadow">
            <div className="grid gap-3 md:grid-cols-2">
              <input
                name="name"
                placeholder="Activity name"
                required
                value={activityForm.name}
                onChange={e => setActivityForm(prev => ({ ...prev, name: e.target.value }))}
                className="border border-white/70 bg-white/70 p-3 rounded-xl"
              />
              <input
                name="location"
                placeholder="Location"
                value={activityForm.location}
                onChange={e => setActivityForm(prev => ({ ...prev, location: e.target.value }))}
                className="border border-white/70 bg-white/70 p-3 rounded-xl"
              />
              <select
                name="type"
                value={activityForm.type}
                onChange={e => setActivityForm(prev => ({ ...prev, type: e.target.value }))}
                className="border border-white/70 bg-white/70 p-3 rounded-xl"
              >
                {activityTypes.map(typeOption => (
                  <option key={typeOption} value={typeOption}>
                    {typeOption}
                  </option>
                ))}
              </select>
              <input
                name="description"
                placeholder="Description"
                value={activityForm.description}
                onChange={e => setActivityForm(prev => ({ ...prev, description: e.target.value }))}
                className="border border-white/70 bg-white/70 p-3 rounded-xl"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="bg-purple-600 text-white px-6 py-2 rounded-full shadow hover:bg-purple-700 transition">
                {editingItem?.kind === 'activity' ? 'Update Activity' : 'Add Activity'}
              </button>
              {editingItem?.kind === 'activity' && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="bg-white/70 text-slate-700 px-6 py-2 rounded-full border border-white/80 hover:bg-white transition"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>

          <div className="grid gap-4">
            {activities.map(activity => (
              <div key={activity.id} className="bg-white/50 border border-white/70 rounded-2xl p-4 shadow flex flex-col gap-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">{activity.name}</h3>
                    {activity.description && <p className="text-slate-600">{activity.description}</p>}
                    {activity.location && <p className="text-slate-500">📍 {activity.location}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                      {activity.type || 'Other'}
                    </span>
                    <button
                      onClick={() => startEditActivity(activity)}
                      className="p-2 rounded-full bg-white/70 hover:bg-white border border-white/70"
                    >
                      <Pencil size={16} className="text-slate-600" />
                    </button>
                    <button
                      onClick={() => handleDeleteActivity(activity.id)}
                      className="text-rose-500 hover:text-rose-700 font-semibold"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}