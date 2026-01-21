"use client";

import { useState, useEffect } from "react";
import { MapPin, Sparkles, Shuffle } from "lucide-react";

export default function DatePage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [randomActivity, setRandomActivity] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/activities")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setActivities(data);
          if (data.length > 0) {
            setRandomActivity(data[Math.floor(Math.random() * data.length)]);
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleShuffle = () => {
    if (activities.length > 0) {
      const random = activities[Math.floor(Math.random() * activities.length)];
      setRandomActivity(random);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-6">
      <h1 className="text-3xl font-bold text-center">What should we do?</h1>

      {randomActivity ? (
        <div className="bg-white/80 p-8 rounded-xl shadow-lg text-center max-w-md w-full">
          <h2 className="text-2xl font-bold mb-2">{randomActivity.name}</h2>
          {randomActivity.type && (
            <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full mb-4">
              {randomActivity.type}
            </span>
          )}
          {randomActivity.location && (
            <div className="flex items-center justify-center gap-2 text-gray-600 mb-4">
              <MapPin size={16} />
              <span>{randomActivity.location}</span>
            </div>
          )}
          <p className="text-gray-700 italic">{randomActivity.description}</p>
        </div>
      ) : (
        <p>No activities found. Go add some!</p>
      )}

      <button
        onClick={handleShuffle}
        className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-full hover:bg-purple-700 transition"
      >
        <Shuffle size={20} /> Shuffle
      </button>

      <a href="/" className="text-sm underline mt-4">Back Home</a>
    </div>
  );
}