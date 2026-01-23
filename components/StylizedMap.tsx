"use client";
import { useState, useEffect } from "react";
import { MapPin, Heart, ArrowLeft, Compass } from "lucide-react";
import { useRouter } from "next/navigation";

export default function StylizedMap() {
  const [view, setView] = useState<'country' | 'city'>('country');
  const [activities, setActivities] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/activities").then(r => r.json()).then(data => {
      if(Array.isArray(data)) setActivities(data);
    });
  }, []);

  // Smart Positioning Logic
  const getPos = (activity: any, viewType: 'country' | 'city') => {
    const str = activity.name + activity.location;
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);

    // Normalize hash to 0-100
    const rawX = Math.abs(Math.sin(hash) * 10000) % 100;
    const rawY = Math.abs(Math.cos(hash) * 10000) % 100;

    if (viewType === 'country') {
       // Hungary: Avoid the edges
       return { x: rawX * 0.8 + 10, y: rawY * 0.7 + 15 };
    } else {
       // BUDAPEST SMART LOGIC
       let x = rawX;
       const loc = (activity.location || "").toLowerCase();

       // Detect Buda side (Districts 1, 2, 3, 11, 12, 22) or explicit "Buda"
       const isBuda = loc.includes('buda') || loc.includes('mammut') || loc.includes('allee') || loc.includes('mom') || loc.includes('citadella');

       if (isBuda) {
          // Force Left Side (10% - 40%)
          x = (rawX % 30) + 10;
       } else {
          // Assume Pest (Right Side) (55% - 90%)
          x = (rawX % 35) + 55;
       }

       // Y position (Keep away from extreme top/bottom)
       const y = (rawY % 80) + 10;
       return { x, y };
    }
  };

  const budapestActs = activities.filter(a => a.location && (a.location.includes("Budapest") || a.location.includes("Bp")));
  const countryActs = activities.filter(a => !a.location || (!a.location.includes("Budapest") && !a.location.includes("Bp")));

  return (
    <div className="flex flex-col h-full w-full items-center p-4">
      <div className="flex w-full justify-between items-center mb-6 max-w-3xl">
         <button onClick={() => router.push('/date')} className="flex items-center gap-2 text-slate-600 hover:text-purple-600 font-medium transition">
            <ArrowLeft size={20} /> Back to List
         </button>
         <h2 className="font-serif text-3xl text-slate-800 font-bold drop-shadow-sm">
            {view === 'country' ? 'Hungary' : 'Budapest'}
         </h2>
         <div className="w-24" />
      </div>

      <div className="relative w-full max-w-4xl aspect-[16/9] bg-[#fdfbf7] border-4 border-white/60 rounded-3xl shadow-2xl overflow-hidden transition-all duration-500">

        {/* Compass Decoration */}
        <div className="absolute bottom-4 right-4 opacity-30 pointer-events-none text-slate-900 z-30">
            <Compass size={60} strokeWidth={1} />
        </div>

        {/* --- HUNGARY VIEW --- */}
        {view === 'country' && (
          <div className="w-full h-full relative animate-in fade-in zoom-in duration-500">
            <img
              src="/maps/hungary.png"
              alt="Map of Hungary"
              className="w-full h-full object-fill opacity-90"
            />

            {/* Budapest Trigger - Positioned over Budapest on the image */}
            <button
              onClick={() => setView('city')}
              className="absolute top-[28%] left-[53%] -translate-x-1/2 -translate-y-1/2 group z-20"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-rose-400 rounded-full animate-ping opacity-75"></div>
                <div className="bg-rose-500 p-2 rounded-full shadow-lg border-2 border-white hover:scale-110 transition-transform cursor-pointer">
                  <Heart fill="white" size={18} className="text-white" />
                </div>
              </div>
            </button>

            {/* Countryside Pins */}
            {countryActs.map(a => {
              const pos = getPos(a, 'country');
              return (
                <a
                  key={a.id}
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(a.location)}`}
                  target="_blank"
                  className="absolute group z-20"
                  style={{ top: `${pos.y}%`, left: `${pos.x}%` }}
                  title={a.name}
                >
                  <MapPin size={24} className="text-purple-700 drop-shadow-md hover:scale-125 transition-transform" fill="#e9d5ff" />
                </a>
              )
            })}
          </div>
        )}

        {/* --- BUDAPEST VIEW --- */}
        {view === 'city' && (
          <div className="w-full h-full relative animate-in fade-in zoom-in duration-500">
            <button
              onClick={() => setView('country')}
              className="absolute top-4 left-4 z-30 bg-white/90 px-3 py-1 rounded-full text-xs font-bold text-slate-700 hover:bg-white shadow-md border border-slate-200 flex items-center gap-2"
            >
              <ArrowLeft size={14} /> Zoom Out
            </button>

            <img
              src="/maps/budapest.png"
              alt="Map of Budapest"
              className="w-full h-full object-cover opacity-80"
            />

            {/* City Pins */}
            {budapestActs.map(a => {
              const pos = getPos(a, 'city');
              return (
                <a
                  key={a.id}
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(a.location)}`}
                  target="_blank"
                  className="absolute group z-20"
                  style={{ top: `${pos.y}%`, left: `${pos.x}%` }}
                >
                  <div className="relative flex flex-col items-center">
                    <MapPin size={28} className="text-rose-600 drop-shadow-lg hover:scale-125 transition-transform" fill="#ffe4e6" />
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-1 bg-white/95 px-2 py-1 rounded text-xs font-bold text-slate-800 whitespace-nowrap shadow-md pointer-events-none z-50">
                      {a.name}
                    </span>
                  </div>
                </a>
              )
            })}
          </div>
        )}
      </div>
    </div>
  );
}