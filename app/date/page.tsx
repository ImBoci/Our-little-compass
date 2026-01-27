"use client";
import { useState, useEffect } from "react";
import { CalendarHeart, MapPin, Shuffle, ArrowLeft, RotateCcw, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function DatePage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [randomActivity, setRandomActivity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFlipped, setIsFlipped] = useState(false);

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
      setIsFlipped(false); // Flip back to front
      setTimeout(() => {
        let newAct;
        do {
          newAct = activities[Math.floor(Math.random() * activities.length)];
        } while (activities.length > 1 && newAct === randomActivity);
        setRandomActivity(newAct);
      }, 300); // Wait for flip to start
    }
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center text-purple-800 animate-pulse font-serif text-xl">Finding Ideas...</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-transparent">
      <Link href="/" className="absolute top-8 left-8 text-slate-600 hover:text-purple-600 transition flex items-center gap-2 font-medium z-10">
        <ArrowLeft size={20} /> Back Home
      </Link>

      <div className="mb-8 text-center">
        <div className="inline-block p-4 rounded-full bg-purple-100/80 text-purple-600 mb-4 shadow-lg">
          <CalendarHeart size={48} />
        </div>
        <h1 className="font-serif text-4xl text-slate-800 font-bold drop-shadow-sm">Date Idea</h1>
      </div>

      {/* FLIP CARD CONTAINER */}
      <div className="relative w-full max-w-md h-[450px] perspective-1000">
        {/* THE FLIPPER */}
        <div className={`relative w-full h-full transition-all duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
          
          {/* === FRONT FACE (Activity Info) === */}
          <div 
            className="absolute inset-0 backface-hidden flex flex-col items-center justify-center p-8 rounded-3xl border-2 border-white/40 shadow-[0_0_40px_rgba(168,85,247,0.15)] text-center"
            style={{
              background: "rgba(255, 255, 255, 0.35)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)"
            }}
          >
            {randomActivity ? (
              <div className="space-y-6 flex flex-col items-center w-full">
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
                
                {randomActivity.description && (
                  <p className="text-lg text-slate-700 font-light italic mt-2 leading-relaxed">
                    "{randomActivity.description}"
                  </p>
                )}

                {randomActivity.location && (
                  <div className="mt-4">
                    <button 
                      onClick={() => setIsFlipped(true)}
                      className="flex items-center gap-2 font-medium px-6 py-3 rounded-full bg-white/60 text-purple-700 hover:bg-purple-600 hover:text-white transition-all duration-300 shadow-sm border border-purple-100 hover:shadow-purple-200/50"
                    >
                      <MapPin size={18} /> 
                      <span>See Location</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-slate-600">No activities found! Go add some.</div>
            )}
          </div>

          {/* === BACK FACE (Map) === */}
          <div 
            className="absolute inset-0 backface-hidden rotate-y-180 rounded-3xl border-2 border-white/40 shadow-xl overflow-hidden"
            style={{
              background: "white"
            }}
          >
            {randomActivity?.location && (
              <>
                <iframe 
                  width="100%" 
                  height="100%" 
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(randomActivity.location)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  frameBorder="0" 
                  scrolling="no" 
                  className="w-full h-full block"
                ></iframe>
                
                {/* Controls on the Map Side */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
                  <button 
                    onClick={() => setIsFlipped(false)}
                    className="bg-white/90 text-slate-700 px-4 py-2 rounded-full shadow-md hover:bg-white flex items-center gap-2 text-sm font-bold backdrop-blur-sm"
                  >
                    <RotateCcw size={16} /> Flip Back
                  </button>
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(randomActivity.location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-purple-600/90 text-white px-4 py-2 rounded-full shadow-md hover:bg-purple-600 flex items-center gap-2 text-sm font-bold backdrop-blur-sm"
                  >
                    <ExternalLink size={16} /> Open App
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
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