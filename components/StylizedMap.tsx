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

  // Deterministic hash for position
  const getPos = (str: string, viewType: 'country' | 'city') => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);

    // Different spread logic for country vs city
    if (viewType === 'country') {
       // Country: Spread widely across the bounding box
       const x = Math.abs(Math.sin(hash) * 10000) % 70 + 15;
       const y = Math.abs(Math.cos(hash) * 10000) % 60 + 20;
       return { x, y };
    } else {
       // City: Cluster more towards the middle-left (Buda) and middle-right (Pest)
       const x = Math.abs(Math.sin(hash) * 10000) % 80 + 10;
       const y = Math.abs(Math.cos(hash) * 10000) % 80 + 10;
       return { x, y };
    }
  };

  const budapestActs = activities.filter(a => a.location.includes("Budapest") || a.location.includes("Bp"));
  const countryActs = activities.filter(a => !a.location.includes("Budapest") && !a.location.includes("Bp"));

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

      <div className="relative w-full max-w-4xl aspect-[16/9] bg-[#f8f5f2] border-4 border-white/60 rounded-3xl shadow-2xl overflow-hidden transition-all duration-500">

        {/* Decorative Grid Background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none"
             style={{ backgroundImage: 'linear-gradient(#a855f7 1px, transparent 1px), linear-gradient(90deg, #a855f7 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
        </div>

        {/* Compass Decoration */}
        <div className="absolute bottom-6 right-6 opacity-20 pointer-events-none text-slate-900">
            <Compass size={80} strokeWidth={1} />
        </div>

        {/* --- HUNGARY VIEW --- */}
        {view === 'country' && (
          <div className="w-full h-full relative animate-in fade-in zoom-in duration-500 flex items-center justify-center p-8">
            <svg viewBox="0 0 800 500" className="w-full h-full drop-shadow-md">
              {/* ACTUAL Hungary Border Path */}
              <path
                d="M 120,200 L 150,180 L 180,190 L 220,160 L 280,160 L 320,130 L 380,140 L 450,110 L 520,120 L 600,100 L 650,140 L 700,160 L 720,200 L 700,260 L 680,300 L 600,340 L 550,380 L 450,420 L 350,410 L 250,390 L 180,380 L 120,340 L 80,300 L 60,250 Z"
                fill="white"
                stroke="#e11d48"
                strokeWidth="3"
                className="hover:fill-rose-50 transition-colors duration-500"
              />
            </svg>

            {/* Budapest Heart Trigger (Placed geographically accurately relative to the path above) */}
            <button
              onClick={() => setView('city')}
              className="absolute top-[35%] left-[50%] -translate-x-1/2 -translate-y-1/2 group z-10 hover:scale-110 transition-transform"
            >
              <div className="relative flex flex-col items-center">
                <div className="bg-rose-500 p-3 rounded-full shadow-lg border-2 border-white animate-pulse">
                  <Heart fill="white" size={24} className="text-white" />
                </div>
                <span className="mt-2 bg-white/90 px-3 py-1 rounded-full text-sm font-bold text-rose-600 shadow-sm border border-rose-100">
                  Budapest
                </span>
              </div>
            </button>

            {/* Countryside Pins */}
            {countryActs.map(a => {
              const pos = getPos(a.name, 'country');
              return (
                <a
                  key={a.id}
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(a.location)}`}
                  target="_blank"
                  className="absolute group z-20"
                  style={{ top: `${pos.y}%`, left: `${pos.x}%` }}
                >
                  <MapPin size={24} className="text-purple-600 drop-shadow-md hover:scale-125 transition-transform hover:text-purple-800" fill="#e9d5ff" />
                </a>
              )
            })}
          </div>
        )}

        {/* --- BUDAPEST VIEW --- */}
        {view === 'city' && (
          <div className="w-full h-full relative bg-[#fffdf5] animate-in fade-in zoom-in duration-500">
            <button
              onClick={() => setView('country')}
              className="absolute top-6 left-6 z-30 bg-white/90 px-4 py-2 rounded-full text-sm font-bold text-slate-700 hover:bg-white shadow-md border border-slate-200 flex items-center gap-2"
            >
              <ArrowLeft size={16} /> Back to Hungary
            </button>

            {/* Labels */}
            <div className="absolute top-[20%] left-[25%] text-7xl font-serif text-slate-900/5 rotate-[-5deg] pointer-events-none select-none">Buda</div>
            <div className="absolute top-[60%] right-[20%] text-7xl font-serif text-slate-900/5 rotate-[-5deg] pointer-events-none select-none">Pest</div>

            {/* Realistic Danube River Path */}
            <svg viewBox="0 0 800 600" className="absolute inset-0 w-full h-full pointer-events-none">
              <path
                d="M 400,0 C 400,0 420,100 380,150 C 340,200 300,250 320,300 C 340,350 400,400 420,450 C 440,500 440,600 440,600"
                fill="none"
                stroke="#bfdbfe"
                strokeWidth="30"
                strokeLinecap="round"
              />
              {/* Margaret Island */}
              <ellipse cx="360" cy="180" rx="15" ry="40" fill="#dcfce7" transform="rotate(-15 360 180)" />
            </svg>

            {/* City Pins */}
            {budapestActs.map(a => {
              const pos = getPos(a.name, 'city');
              return (
                <a
                  key={a.id}
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(a.location)}`}
                  target="_blank"
                  className="absolute group z-20"
                  style={{ top: `${pos.y}%`, left: `${pos.x}%` }}
                >
                  <div className="relative flex flex-col items-center">
                    <div className="hover:scale-125 transition-transform duration-300">
                       <MapPin size={28} className="text-rose-500 drop-shadow-md" fill="#ffe4e6" />
                    </div>
                    <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 absolute bottom-full mb-2 bg-white/95 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 whitespace-nowrap shadow-lg border border-slate-100 pointer-events-none translate-y-2 group-hover:translate-y-0">
                      {a.name}
                    </span>
                  </div>
                </a>
              )
            })}
          </div>
        )}
      </div>
      <p className="mt-6 text-slate-600 font-medium italic bg-white/40 px-4 py-2 rounded-full">
        {view === 'country' ? 'Tap the heart to zoom into the city' : 'Discover hidden gems across the city'}
      </p>
    </div>
  );
}