"use client";
import { useState, useEffect } from "react";
import { CalendarHeart, MapPin, Shuffle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function DatePage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [randomActivity, setRandomActivity] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/activities").then(res => res.json()).then(data => {
      if (Array.isArray(data)) {
        setActivities(data);
        if (data.length > 0) setRandomActivity(data[Math.floor(Math.random() * data.length)]);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleShuffle = () => {
    if (activities.length > 0) {
      let newAct;
      do {
        newAct = activities[Math.floor(Math.random() * activities.length)];
      } while (activities.length > 1 && newAct === randomActivity);
      setRandomActivity(newAct);
    }
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center text-purple-800 animate-pulse">Loading Ideas...</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-transparent">
      <Link href="/" className="absolute top-8 left-8 text-slate-600 hover:text-purple-600 transition flex items-center gap-2 font-medium">
        <ArrowLeft size={20} /> Back Home
      </Link>

      <div className="mb-8 text-center">
        <div className="inline-block p-4 rounded-full bg-purple-100/80 text-purple-600 mb-4 shadow-lg">
          <CalendarHeart size={48} />
        </div>
        <h1 className="font-serif text-4xl text-slate-800 font-bold drop-shadow-sm">Date Idea</h1>
      </div>

      {/* Glass Card */}
      <div
        className="w-full max-w-md p-10 rounded-3xl border-2 border-white/40 text-center relative transition-all duration-500"
        style={{
          background: "rgba(255, 255, 255, 0.25)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          boxShadow: "0 0 40px rgba(168, 85, 247, 0.2)"
        }}
      >
        {randomActivity ? (
          <div className="space-y-6 animate-in fade-in zoom-in duration-500 flex flex-col items-center">
            <h2 className="font-serif text-4xl font-bold text-slate-900 leading-tight">
              {randomActivity.name}
            </h2>

            <div className="flex flex-wrap gap-2 justify-center">
              {randomActivity.type && (
                <span className="bg-purple-100/80 text-purple-700 px-3 py-1 rounded-full text-sm font-medium border border-purple-200">
                  {randomActivity.type}
                </span>
              )}
            </div>

            {randomActivity.location && (
              <div className="flex items-center gap-2 text-slate-600 font-medium bg-white/40 px-4 py-2 rounded-full">
                <MapPin size={18} /> {randomActivity.location}
              </div>
            )}

            {randomActivity.description && (
              <p className="text-lg text-slate-700 font-light italic mt-2">
                "{randomActivity.description}"
              </p>
            )}
          </div>
        ) : (
          <div className="text-slate-600">No activities found! Go add some.</div>
        )}
      </div>

      <button
        onClick={handleShuffle}
        className="mt-12 group relative inline-flex items-center gap-3 bg-purple-600 text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105 hover:bg-purple-700 hover:shadow-[0_0_30px_#a855f7]"
      >
        <Shuffle className="group-hover:rotate-180 transition-transform duration-500" />
        Pick Another
      </button>
    </div>
  );
}