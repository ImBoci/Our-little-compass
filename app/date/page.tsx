"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MapPin, Shuffle, Sparkles, Loader2 } from "lucide-react";

interface Activity {
  id: number;
  name: string;
  location: string | null;
  type: string | null;
  description: string | null;
}

export default function DatePage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [randomActivity, setRandomActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSpinning, setIsSpinning] = useState(false);

  useEffect(() => {
    const loadActivities = async () => {
      try {
        const response = await fetch("/api/activities");
        if (response.ok) {
          const activitiesData = await response.json();
          setActivities(activitiesData);
          if (activitiesData.length > 0) {
            const randomIndex = Math.floor(Math.random() * activitiesData.length);
            setRandomActivity(activitiesData[randomIndex]);
          }
        }
      } catch (error) {
        console.error("Failed to load activities:", error);
      } finally {
        setLoading(false);
      }
    };
    loadActivities();
  }, []);

  const handleShuffle = () => {
    if (activities.length === 0) return;

    setIsSpinning(true);
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * activities.length);
      setRandomActivity(activities[randomIndex]);
      setIsSpinning(false);
    }, 1500);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="font-serif text-4xl md:text-5xl text-slate-800 mb-2 tracking-tight">
        What should we do?
      </h1>
      <p className="font-sans text-lg text-slate-600 mb-8 italic">
        Let fate decide our next adventure
      </p>

      {randomActivity && (
        <div className="bg-white/60 backdrop-blur-md border-2 border-white/50 rounded-3xl p-8 shadow-xl max-w-md w-full text-center">
          <div className="mb-6">
            <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h2 className="font-serif text-3xl font-bold text-slate-800 mb-4">
              {randomActivity.name}
            </h2>

            <div className="flex flex-wrap gap-2 justify-center mb-4">
              {randomActivity.type && (
                <span className="bg-purple-100 text-purple-700 text-sm px-3 py-1 rounded-full">
                  {randomActivity.type}
                </span>
              )}
              {randomActivity.location && (
                <div className="bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded-full flex items-center gap-1">
                  <MapPin size={14} />
                  {randomActivity.location}
                </div>
              )}
            </div>

            {randomActivity.description && (
              <p className="text-slate-600 italic text-lg">
                {randomActivity.description}
              </p>
            )}
          </div>
        </div>
      )}

      <button
        onClick={handleShuffle}
        disabled={isSpinning || activities.length === 0}
        className="bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 text-white px-8 py-4 rounded-full text-lg font-medium transition-all duration-300 flex items-center gap-3 mx-auto mt-8 disabled:cursor-not-allowed"
      >
        {isSpinning ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Finding your adventure...
          </>
        ) : (
          <>
            <Shuffle className="w-5 h-5" />
            Shuffle Activity
          </>
        )}
      </button>

      {activities.length === 0 && (
        <p className="mt-6 text-slate-600">
          No activities available.{" "}
          <Link href="/manage" className="text-purple-600 hover:underline">
            Add some activities
          </Link>{" "}
          first.
        </p>
      )}

      <Link href="/" className="mt-12 text-slate-500 hover:text-slate-700 text-sm">
        ← Back to Home
      </Link>
    </div>
  );
}