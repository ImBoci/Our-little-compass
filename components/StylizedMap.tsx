"use client";
import { useState, useEffect } from "react";
import { MapPin, Heart, ArrowLeft, Compass } from "lucide-react";
import { useRouter } from "next/navigation";

// --- 1. THE DATA ---
const KNOWN_LOCATIONS = [
  { "cim": "1117 Budapest, Móricz Zsigmond körtér 16/a", "lat": 47.4769, "lng": 19.0475 },
  { "cim": "1077 Budapest, Wesselényi utca 23.", "lat": 47.4984, "lng": 19.0645 },
  { "cim": "1074 Budapest, Dohány utca 84.", "lat": 47.5015, "lng": 19.0718 },
  { "cim": "3073 Tar, Kőrösi Csoma Sándor Emlékpark", "lat": 47.9511, "lng": 19.7547 },
  { "cim": "1053 Budapest, Múzeum krt. 7.", "lat": 47.4932, "lng": 19.0608 },
  { "cim": "1092 Budapest, Ráday u. 5.", "lat": 47.4893, "lng": 19.0622 },
  { "cim": "1083 Budapest, Illés u. 25.", "lat": 47.4852, "lng": 19.0854 },
  { "cim": "1092 Budapest, Ráday u. 3.", "lat": 47.4897, "lng": 19.0619 },
  { "cim": "1034 Budapest, Bécsi út 121.", "lat": 47.5342, "lng": 19.0354 },
  { "cim": "1062 Budapest, Andrássy út 112.", "lat": 47.5147, "lng": 19.0768 },
  { "cim": "1149 Budapest, Kövér Lajos út 1.", "lat": 47.5135, "lng": 19.1172 },
  { "cim": "1053 Budapest, Királyi Pál u. 11.", "lat": 47.4899, "lng": 19.0594 },
  { "cim": "1051 Budapest, Erzsébet tér 14.", "lat": 47.4988, "lng": 19.0528 },
  { "cim": "1222 Budapest, Nagytétényi út 37-43.", "lat": 47.4262, "lng": 19.0225 },
  { "cim": "1122 Budapest, Krisztina krt. 6.", "lat": 47.5023, "lng": 19.0252 },
  { "cim": "1051 Budapest, Október 6. u. 26.", "lat": 47.5037, "lng": 19.0515 },
  { "cim": "1117 Budapest, Móricz Zsigmond körtér 16.", "lat": 47.4769, "lng": 19.0475 },
  { "cim": "1053 Budapest, Múzeum krt 15.", "lat": 47.4916, "lng": 19.0621 },
  { "cim": "1075 Budapest, Kazinczy u. 14.", "lat": 47.4967, "lng": 19.0626 },
  { "cim": "1062 Budapest, Andrássy út 103.", "lat": 47.5134, "lng": 19.0739 },
  { "cim": "1142 Budapest, Tatai u. 95.", "lat": 47.5385, "lng": 19.0945 },
  { "cim": "1014 Budapest, Budai vár", "lat": 47.4962, "lng": 19.0396 },
  { "cim": "Margit-sziget", "lat": 47.5272, "lng": 19.0469 },
  { "cim": "1051 Budapest, József Nándor tér", "lat": 47.4981, "lng": 19.0494 },
  { "cim": "1011 Budapest, Batthyány tér 7.", "lat": 47.5065, "lng": 19.0388 },
  { "cim": "Móricz Zsigmond körtér", "lat": 47.4776, "lng": 19.0465 },
  { "cim": "1033 Budapest, Miklós tér 1.", "lat": 47.5414, "lng": 19.0435 },
  { "cim": "1075 Budapest, Kazinczy u. 52.", "lat": 47.4979, "lng": 19.0652 },
  { "cim": "1052 Budapest, Szervita tér 8.", "lat": 47.4957, "lng": 19.0525 },
  { "cim": "1013, Budapest Rudas gyógyfürdő, Döbrentei tér 9.", "lat": 47.4891, "lng": 19.0478 },
  { "cim": "1123 Budapest, Alkotás út 53.", "lat": 47.4908, "lng": 19.0232 },
  { "cim": "1062 Budapest, Westend földszint, Váci út 1-3.", "lat": 47.5126, "lng": 19.0592 },
  { "cim": "1119 Budapest, Hadak útja 1. I. emelet", "lat": 47.4645, "lng": 19.0305 },
  { "cim": "1077 Budapest, Király u. 41.", "lat": 47.4999, "lng": 19.0621 },
  { "cim": "1077 Budapest, Wesselényi utca 30.", "lat": 47.4998, "lng": 19.0664 },
  { "cim": "1065 Budapest, Nagymező u. 64.", "lat": 47.5062, "lng": 19.0573 },
  { "cim": "1052 Budapest, Semmelweis u. 19.", "lat": 47.4941, "lng": 19.0595 },
  { "cim": "1072 Budapest, Rákóczi út 32.", "lat": 47.4965, "lng": 19.0674 },
  { "cim": "1075 Budapest, Kazinczy u. 18.", "lat": 47.4968, "lng": 19.0631 },
  { "cim": "1036 Budapest, Árpád fejedelem útja 125.", "lat": 47.5441, "lng": 19.0422 },
  { "cim": "1056 Budapest, Belgrád rkp. 6.", "lat": 47.4898, "lng": 19.0526 },
  { "cim": "1084 Budapest, Német u. 16.", "lat": 47.4897, "lng": 19.0719 },
  { "cim": "1062 Budapest, Bajza u. 41.", "lat": 47.5119, "lng": 19.0706 },
  { "cim": "1076 Budapest, Dohány u. 58-62.", "lat": 47.4981, "lng": 19.0678 },
  { "cim": "1075 Budapest, Gozsdu udvar", "lat": 47.4983, "lng": 19.0607 },
  { "cim": "1088 Budapest, Szabó Ervin tér 1.", "lat": 47.4893, "lng": 19.0645 },
  { "cim": "1112 Budapest, Budaörsi út 172-178.", "lat": 47.4614, "lng": 18.9958 },
  { "cim": "1121 Budapest, Jánoshegyi út", "lat": 47.5181, "lng": 18.9592 },
  { "cim": "1052 Budapest, Váci u. 27.", "lat": 47.4938, "lng": 19.0531 },
  { "cim": "1185 Budapest, Liszt Ferenc Repülőtér", "lat": 47.4333, "lng": 19.2611 },
  { "cim": "2500 Esztergom, Szent István tér 1.", "lat": 47.7989, "lng": 18.7366 }
];

// --- 2. CONFIGURATION ---
const BOUNDS = {
  country: { minLat: 45.7, maxLat: 48.6, minLng: 16.1, maxLng: 22.9 },
  city: { minLat: 47.35, maxLat: 47.62, minLng: 18.90, maxLng: 19.35 }
};

export default function StylizedMap() {
  const [view, setView] = useState<'country' | 'city'>('country');
  const [activities, setActivities] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/activities").then(r => r.json()).then(data => {
      if (Array.isArray(data)) setActivities(data);
    });
  }, []);

  const getPos = (activity: any, viewType: 'country' | 'city') => {
    // 1. Try Exact Match
    const known = KNOWN_LOCATIONS.find(k => k.cim === activity.location || activity.location?.includes(k.cim) || k.cim.includes(activity.location));

    if (known) {
      const b = BOUNDS[viewType];
      // Map Projection Formula
      let x = ((known.lng - b.minLng) / (b.maxLng - b.minLng)) * 100;
      let y = ((b.maxLat - known.lat) / (b.maxLat - b.minLat)) * 100;

      // Clamp to ensure it stays on screen (0-100%)
      return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
    }

    // 2. Fallback (Smart Hash)
    const str = activity.name + (activity.location || "");
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    const rawX = Math.abs(Math.sin(hash) * 10000) % 100;
    const rawY = Math.abs(Math.cos(hash) * 10000) % 100;

    if (viewType === 'country') {
      return { x: rawX * 0.8 + 10, y: rawY * 0.7 + 15 };
    } else {
      // Fallback Logic for City (Buda vs Pest)
      let x = rawX;
      const loc = (activity.location || "").toLowerCase();
      const isBuda = loc.includes('buda') || loc.includes('111') || loc.includes('101') || loc.includes('112') || loc.includes('102') || loc.includes('103');
      if (isBuda) x = (rawX % 30) + 10;
      else x = (rawX % 35) + 55;
      return { x, y: (rawY % 80) + 10 };
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
        <div className="absolute bottom-4 right-4 opacity-30 pointer-events-none text-slate-900 z-30">
          <Compass size={60} strokeWidth={1} />
        </div>

        {/* --- HUNGARY VIEW --- */}
        {view === 'country' && (
          <div className="w-full h-full relative animate-in fade-in zoom-in duration-500">
            <img src="/maps/hungary.png" alt="Map of Hungary" className="w-full h-full object-fill opacity-90" />
            <button onClick={() => setView('city')} className="absolute top-[28%] left-[53%] -translate-x-1/2 -translate-y-1/2 group z-20">
              <div className="bg-rose-500 p-2 rounded-full shadow-lg border-2 border-white hover:scale-110 transition-transform cursor-pointer">
                <Heart fill="white" size={18} className="text-white" />
              </div>
            </button>
            {countryActs.map(a => {
              const pos = getPos(a, 'country');
              return (
                <a key={a.id} href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(a.location)}`} target="_blank"
                  className="absolute group z-20" style={{ top: `${pos.y}%`, left: `${pos.x}%` }} title={a.name}>
                  <MapPin size={24} className="text-purple-700 drop-shadow-md hover:scale-125 transition-transform" fill="#e9d5ff" />
                </a>
              );
            })}
          </div>
        )}

        {/* --- BUDAPEST VIEW --- */}
        {view === 'city' && (
          <div className="w-full h-full relative animate-in fade-in zoom-in duration-500">
            <button onClick={() => setView('country')} className="absolute top-4 left-4 z-30 bg-white/90 px-3 py-1 rounded-full text-xs font-bold text-slate-700 hover:bg-white shadow-md border border-slate-200 flex items-center gap-2">
              <ArrowLeft size={14} /> Zoom Out
            </button>
            <img src="/maps/budapest.png" alt="Map of Budapest" className="w-full h-full object-cover opacity-80" />
            {budapestActs.map(a => {
              const pos = getPos(a, 'city');
              return (
                <a key={a.id} href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(a.location)}`} target="_blank"
                  className="absolute group z-20" style={{ top: `${pos.y}%`, left: `${pos.x}%` }}>
                  <div className="relative flex flex-col items-center">
                    <MapPin size={28} className="text-rose-600 drop-shadow-lg hover:scale-125 transition-transform" fill="#ffe4e6" />
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-1 bg-white/95 px-2 py-1 rounded text-xs font-bold text-slate-800 whitespace-nowrap shadow-md pointer-events-none z-50">
                      {a.name}
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}