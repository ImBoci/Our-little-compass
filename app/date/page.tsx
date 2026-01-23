"use client";
import { useState, useEffect } from "react";
import { CalendarHeart, MapPin, Shuffle, ArrowLeft, Map } from "lucide-react";
import Link from "next/link";

export default function DatePage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [randomActivity, setRandomActivity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showMap, setShowMap] = useState(false);

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
      setIsAnimating(true);
      setShowMap(false); // Reset map on shuffle
      setTimeout(() => {
        let newAct;
        do {
          newAct = activities[Math.floor(Math.random() * activities.length)];
        } while (activities.length > 1 && newAct === randomActivity);
        setRandomActivity(newAct);
        setIsAnimating(false);
      }, 300);
    }
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center text-purple-800 animate-pulse font-serif text-xl">Finding Ideas...</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-transparent transition-all">
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
          boxShadow: "0 0 40px rgba(168, 85, 247, 0.15)"
        }}
      >
        {randomActivity ? (
          <div className={`space-y-6 flex flex-col items-center transition-all duration-300 ease-in-out ${isAnimating ? 'opacity-0 scale-95 blur-md translate-y-2' : 'opacity-100 scale-100 blur-0 translate-y-0'}`}>
            
            <h2 className="font-serif text-4xl font-bold text-slate-900 leading-tight">
              {randomActivity.name}
            </h2>
            
            <div className="flex flex-wrap gap-2 justify-center">
              {randomActivity.type && (
                <span className="bg-purple-100/80 text-purple-700 px-3 py-1 rounded-full text-sm font-medium border border-purple-200 shadow-sm">
                  {randomActivity.type}
                </span>
              )}
            </div>

            {randomActivity.location && (
              <button 
                onClick={() => setShowMap(!showMap)}
                className={`flex items-center gap-2 font-medium px-5 py-2.5 rounded-full transition-all duration-300 hover:scale-105 shadow-sm border ${showMap ? 'bg-purple-600 text-white border-purple-600 shadow-purple-200' : 'bg-white/60 text-slate-600 border-white/50 hover:bg-white/90 hover:text-purple-700'}`}
                title="Toggle Map"
              >
                <MapPin size={18} /> 
                <span>{randomActivity.location}</span>
                <span className="text-xs opacity-70 ml-1">{showMap ? '×' : '↓'}</span>
              </button>
            )}
            
            {randomActivity.description && (
              <p className="text-lg text-slate-700 font-light italic mt-2 leading-relaxed">
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
        className="mt-8 mb-4 group relative inline-flex items-center gap-3 bg-purple-600 text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105 hover:bg-purple-700 hover:shadow-[0_0_30px_#a855f7]"
      >
        <Shuffle className="group-hover:rotate-180 transition-transform duration-500" />
        Pick Another
      </button>

      {/* Embedded Map Section */}
      {showMap && randomActivity?.location && (
        <div className="w-full max-w-md animate-in slide-in-from-top-4 fade-in duration-500 mt-4">
          <div className="rounded-2xl overflow-hidden border-2 border-white/60 shadow-xl">
            <iframe 
              width="100%" 
              height="300" 
              src={`https://maps.google.com/maps?q=${encodeURIComponent(randomActivity.location)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
              frameBorder="0" 
              scrolling="no" 
              marginHeight={0} 
              marginWidth={0}
              title="Location Map"
              className="w-full h-full block bg-slate-100"
            ></iframe>
          </div>
          <div className="text-center mt-2">
            <a 
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(randomActivity.location)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-slate-500 hover:text-purple-600 hover:underline"
            >
              Open in Google Maps App ↗
            </a>
          </div>
        </div>
      )}
    </div>
  );
}