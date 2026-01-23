"use client";
import { useState, useEffect } from "react";
import { MapPin, Heart, ArrowLeft, Navigation } from "lucide-react";
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

  // Deterministic hash for position (0% to 100%)
  const getPos = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    const x = Math.abs(Math.sin(hash) * 10000) % 80 + 10; // Keep within 10-90%
    const y = Math.abs(Math.cos(hash) * 10000) % 80 + 10;
    return { x, y };
  };

  const budapestActs = activities.filter(a => a.location.includes("Budapest") || a.location.includes("Bp"));
  const countryActs = activities.filter(a => !a.location.includes("Budapest") && !a.location.includes("Bp"));

  return (
    <div className="flex flex-col h-full w-full items-center">
      <div className="flex w-full justify-between items-center mb-4 px-4">
         <button onClick={() => router.push('/date')} className="flex items-center gap-2 text-slate-600 hover:text-purple-600 font-medium transition">
            <ArrowLeft size={20} /> List
         </button>
         <h2 className="font-serif text-2xl text-slate-800 font-bold">
            {view === 'country' ? 'Hungary' : 'Budapest'}
         </h2>
         <div className="w-20" /> {/* Spacer */}
      </div>

      <div className="relative w-full max-w-2xl aspect-[4/3] bg-white/40 backdrop-blur-md border-2 border-white/50 rounded-3xl shadow-xl overflow-hidden p-4 transition-all duration-500">

        {/* --- HUNGARY VIEW --- */}
        {view === 'country' && (
          <div className="w-full h-full relative animate-in fade-in zoom-in duration-500">
            <svg viewBox="0 0 300 200" className="w-full h-full drop-shadow-lg">
              {/* Simplified Hungary Shape */}
              <path
                d="M 20,80 Q 40,40 90,30 L 160,20 Q 240,10 270,50 Q 290,90 260,130 L 220,160 Q 180,180 120,170 Q 50,160 30,120 Z"
                fill="rgba(255,255,255,0.8)"
                stroke="#fb7185"
                strokeWidth="2"
                className="hover:fill-rose-50 transition-colors duration-500"
              />
            </svg>

            {/* Budapest Heart Trigger */}
            <button
              onClick={() => setView('city')}
              className="absolute top-[35%] left-[55%] -translate-x-1/2 -translate-y-1/2 group z-10"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-rose-400 rounded-full animate-ping opacity-75"></div>
                <div className="bg-gradient-to-br from-rose-400 to-rose-600 p-3 rounded-full shadow-lg hover:scale-110 transition-transform cursor-pointer border-2 border-white">
                  <Heart fill="white" size={24} className="text-white" />
                </div>
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-white/90 px-2 py-0.5 rounded text-xs font-bold text-rose-600 whitespace-nowrap shadow-sm">
                  Click to Zoom
                </span>
              </div>
            </button>

            {/* Countryside Pins */}
            {countryActs.map(a => {
              const pos = getPos(a.name);
              return (
                <a
                  key={a.id}
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(a.location)}`}
                  target="_blank"
                  className="absolute group"
                  style={{ top: `${pos.y}%`, left: `${pos.x}%` }}
                >
                  <MapPin size={20} className="text-purple-600 drop-shadow-md hover:scale-125 transition-transform" />
                </a>
              )
            })}
          </div>
        )}

        {/* --- BUDAPEST VIEW --- */}
        {view === 'city' && (
          <div className="w-full h-full relative bg-[#fdf6e3]/50 rounded-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
            <button
              onClick={() => setView('country')}
              className="absolute top-4 left-4 z-20 bg-white/80 px-3 py-1 rounded-full text-sm font-bold text-slate-600 hover:bg-white shadow-sm flex items-center gap-1"
            >
              <ArrowLeft size={14} /> Zoom Out
            </button>

            {/* River Danube */}
            <svg viewBox="0 0 300 200" className="absolute inset-0 w-full h-full opacity-50 pointer-events-none">
              <path
                d="M 140,0 C 140,50 180,80 160,120 C 140,160 150,180 150,200"
                fill="none"
                stroke="#60a5fa"
                strokeWidth="15"
                strokeLinecap="round"
              />
            </svg>

            {/* Labels */}
            <div className="absolute top-1/2 left-[20%] text-6xl font-serif text-slate-900/5 -rotate-12 pointer-events-none">Buda</div>
            <div className="absolute top-1/2 right-[20%] text-6xl font-serif text-slate-900/5 -rotate-12 pointer-events-none">Pest</div>

            {/* City Pins */}
            {budapestActs.map(a => {
              const pos = getPos(a.name);
              return (
                <a
                  key={a.id}
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(a.location)}`}
                  target="_blank"
                  className="absolute group z-10"
                  style={{ top: `${pos.y}%`, left: `${pos.x}%` }}
                >
                  <div className="relative flex flex-col items-center">
                    <MapPin size={24} fill="#a855f7" className="text-purple-700 drop-shadow-md hover:scale-125 transition-transform" />
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-1 bg-white/90 px-2 py-1 rounded text-xs font-bold text-slate-700 whitespace-nowrap shadow-sm pointer-events-none">
                      {a.name}
                    </span>
                  </div>
                </a>
              )
            })}
          </div>
        )}
      </div>
      <p className="mt-4 text-slate-500 text-sm italic">
        {view === 'country' ? 'Tap the heart to explore Budapest' : 'Locations are approximate artistic representations'}
      </p>
    </div>
  );
}