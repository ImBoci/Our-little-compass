"use client";
import { useState, useEffect, useRef } from "react";
import { MapPin, Shuffle, ArrowLeft, RotateCcw, ExternalLink, Search, CheckCircle, Star, Image, CircleAlert, Map } from "lucide-react";
import Link from "next/link";
import WeatherWidget from "@/components/WeatherWidget";
import ScratchOff from "@/components/ScratchOff";

export default function DatePage() {
  const [activeTab, setActiveTab] = useState<'random' | 'list'>('random');
  const [activities, setActivities] = useState<any[]>([]);
  const [randomActivity, setRandomActivity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Random Tab State
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isRevealed, setIsRevealed] = useState(true);
  const [isScratchResetting, setIsScratchResetting] = useState(false);

  // Memory/Rating State
  const [completingItem, setCompletingItem] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [note, setNote] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("Memory Saved!");
  const [toastVariant, setToastVariant] = useState<'success' | 'warning'>('success');

  // Identity State
  const [userName, setUserName] = useState<string | null>(null);
  const [showNameModal, setShowNameModal] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const audioContextRef = useRef<AudioContext | null>(null);

  const playTick = () => {
    if (typeof window === "undefined") return;
    const AudioContextClass =
      window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextClass();
    }
    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = "square";
    oscillator.frequency.value = 800;
    gain.gain.value = 0.02;
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.03);
  };

  // Flip State
  const [flippedId, setFlippedId] = useState<string | number | null>(null);

  // Filter State
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/activities").then(res => res.json()).then(data => {
      if (Array.isArray(data)) {
        setActivities(data);
        if (data.length > 0) setRandomActivity(data[Math.floor(Math.random() * data.length)]);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("userName") : null;
    if (stored) {
      setUserName(stored);
    } else {
      setShowNameModal(true);
    }
  }, []);

  const handleShuffle = () => {
    if (activities.length === 0 || isSpinning) return;
    setIsFlipped(false);
    setIsSpinning(true);
    setIsAnimating(true);
    setIsRevealed(false);
    setIsScratchResetting(true);
    setTimeout(() => setIsScratchResetting(false), 0);

    const getRandomActivity = () => activities[Math.floor(Math.random() * activities.length)];
    let finalActivity = getRandomActivity();
    if (activities.length > 1) {
      while (finalActivity === randomActivity) {
        finalActivity = getRandomActivity();
      }
    }

    const intervalId = setInterval(() => {
      setRandomActivity(getRandomActivity());
      playTick();
    }, 70);

    setTimeout(() => {
      clearInterval(intervalId);
      setRandomActivity(finalActivity);
      setIsAnimating(false);
      setIsSpinning(false);
    }, 1500);
  };

  const showToastMessage = (message: string, variant: 'success' | 'warning') => {
    setToastVariant(variant);
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleShareInvite = async () => {
    if (!randomActivity?.name) return;
    const location = randomActivity.location ? randomActivity.location : "a surprise spot";
    const message = `You have a date! 🌹 Activity: ${randomActivity.name} at ${location}. See you there! ❤️ #OurLittleCompass`;
    try {
      if (navigator.share) {
        await navigator.share({ text: message });
        return;
      }
      await navigator.clipboard.writeText(message);
      showToastMessage("Invite copied to clipboard!", "success");
    } catch {
      showToastMessage("Couldn't share invite. Try again.", "warning");
    }
  };

  const handleCardFlip = (item: any) => {
    if (item.image_url) {
      setFlippedId(item.id);
      return;
    }
    showToastMessage("No image available for this item yet.", 'warning');
  };

  const saveMemory = async () => {
    if (!completingItem) return;
    const storedName = localStorage.getItem("userName");
    const resolvedName = storedName || userName || "Anonymous";
    await fetch("/api/memories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: completingItem.name,
        type: "Activity",
        rating,
        note,
        date: new Date().toISOString(),
        user: resolvedName,
        image_url: completingItem.image_url || null,
      })
    });
    setCompletingItem(null);
    setNote("");
    setRating(5);
    showToastMessage(`Memory Saved by ${resolvedName}!`, 'success');
  };

  const types = Array.from(new Set(activities.flatMap(a => a.type ? a.type.split(',').map((t:string) => t.trim()) : []))).sort();

  const filteredActivities = activities.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = selectedType ? a.type?.includes(selectedType) : true;
    return matchesSearch && matchesType;
  });

  if (loading) return <div className="flex min-h-screen items-center justify-center text-purple-800 animate-pulse font-serif text-xl">Finding Ideas...</div>;

  return (
    <div className="flex flex-col items-center min-h-screen p-4 bg-transparent">
      <div className="w-full max-w-4xl">
        <div className="w-full flex items-center justify-between mb-4">
          <Link 
            href="/" 
            className="flex items-center gap-2 px-4 py-2 bg-white/30 backdrop-blur-md border border-white/40 rounded-full text-slate-700 text-sm sm:text-base font-medium shadow-sm hover:bg-white/60 hover:scale-105 hover:shadow-md transition-all duration-300 group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="hidden sm:inline">Back Home</span>
          </Link>

          {activeTab === 'random' ? (
            <div className="max-w-[160px] sm:max-w-none">
              <WeatherWidget />
            </div>
          ) : (
            <div className="h-10" />
          )}
        </div>

        <div className="mb-6 text-center">
            <h1 className="font-serif text-2xl md:text-4xl text-slate-800 font-bold drop-shadow-sm">Date Idea</h1>
        </div>

        {/* TABS */}
        <div className="flex justify-center mb-8">
            <div className="bg-white/40 p-1 rounded-full backdrop-blur-md border border-white/50 shadow-sm flex">
                <button onClick={() => setActiveTab('random')} className={`px-6 py-2 rounded-full font-bold transition-all ${activeTab === 'random' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-600 hover:bg-white/50'}`}>
                    🎲 Pick for Me
                </button>
                <button onClick={() => setActiveTab('list')} className={`px-6 py-2 rounded-full font-bold transition-all ${activeTab === 'list' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-600 hover:bg-white/50'}`}>
                    📚 Browse All
                </button>
            </div>
        </div>

        {/* === RANDOM TAB (3D Flip) === */}
        {activeTab === 'random' && (
            <div className="flex flex-col items-center">
                <div
                  className="relative w-full max-w-[90vw] sm:max-w-md h-[450px] perspective-1000"
                >
                    <div className={`relative w-full h-full transition-all duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                        {/* FRONT */}
                        <div className={`absolute inset-0 backface-hidden flex flex-col items-center justify-center p-8 rounded-3xl border-2 border-white/40 shadow-[0_0_40px_rgba(168,85,247,0.15)] text-center ${!isFlipped ? 'z-10 pointer-events-auto' : 'z-0 pointer-events-none'}`} style={{ background: "rgba(255, 255, 255, 0.35)", backdropFilter: "blur(16px)" }}>
                            {randomActivity ? (
                                <div className={`space-y-6 flex flex-col items-center w-full transition-all duration-150 ease-in-out ${isSpinning ? 'blur-sm translate-y-2' : 'blur-0 translate-y-0'} ${!isRevealed && !isSpinning ? 'opacity-0' : 'opacity-100'}`}>
                                    <h2 className="font-serif text-3xl md:text-4xl font-bold text-slate-900 leading-tight hyphens-auto break-words">{randomActivity.name}</h2>
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        {randomActivity.type && randomActivity.type.split(',').map((t: string, i: number) => (
                                            <span key={i} className="bg-purple-100/80 text-purple-700 px-3 py-1 rounded-full text-sm font-medium border border-purple-200">{t.trim()}</span>
                                        ))}
                                    </div>
                                    {randomActivity.description && <p className="text-base md:text-lg text-slate-700 font-light italic mt-2">"{randomActivity.description}"</p>}
                                    {randomActivity.location && (
                                      randomActivity.location === "Több helyszín" ? (
                                        <div className="mt-4 flex items-center gap-2 font-medium px-5 py-2.5 rounded-full bg-white/40 text-slate-500 border border-slate-200 cursor-default">
                                          <Map size={18} />
                                          <span>Multiple Locations</span>
                                        </div>
                                      ) : (
                                        <button onClick={() => setIsFlipped(true)} className="mt-4 flex items-center gap-2 font-medium px-5 py-2.5 rounded-full bg-white/60 text-slate-700 hover:bg-purple-600 hover:text-white transition-all duration-300 shadow-sm border border-purple-100 hover:shadow-purple-300/50 cursor-pointer pointer-events-auto">
                                          <MapPin size={18} /> <span className="truncate max-w-[200px]">{randomActivity.location}</span>
                                        </button>
                                      )
                                    )}
                                </div>
                            ) : <div className="text-slate-600">No activities found!</div>}

                            {!isRevealed && !isSpinning && !isFlipped && (
                              <ScratchOff isResetting={isScratchResetting} onComplete={() => setIsRevealed(true)} />
                            )}
                        </div>
                        {/* BACK */}
                        <div className={`absolute inset-0 backface-hidden rotate-y-180 rounded-3xl border-2 border-white/40 shadow-xl overflow-hidden bg-white ${isFlipped ? 'z-10 pointer-events-auto' : 'z-0 pointer-events-none'}`}>
                            {randomActivity?.location && (
                                <>
                                    <iframe width="100%" height="100%" src={`https://maps.google.com/maps?q=${encodeURIComponent(randomActivity.location)}&t=&z=15&ie=UTF8&iwloc=&output=embed`} frameBorder="0" scrolling="no" className="w-full h-full block"></iframe>
                                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3 pointer-events-none">
                                        <button onClick={() => setIsFlipped(false)} className="pointer-events-auto bg-white/90 text-slate-700 px-4 py-2 rounded-full shadow-lg hover:bg-white flex items-center gap-2 text-sm font-bold backdrop-blur-sm"><RotateCcw size={16} /> Flip Back</button>
                                        <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(randomActivity.location)}`} target="_blank" rel="noopener noreferrer" className="pointer-events-auto bg-purple-600/90 text-white px-4 py-2 rounded-full shadow-lg hover:bg-purple-600 flex items-center gap-2 text-sm font-bold backdrop-blur-sm"><ExternalLink size={16} /> Open App</a>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                <button onClick={handleShuffle} className="mt-12 group relative inline-flex items-center gap-3 bg-purple-600 text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105 hover:bg-purple-700 hover:shadow-[0_0_30px_#a855f7]">
                    <Shuffle className="group-hover:rotate-180 transition-transform duration-500" /> Pick Another
                </button>
                {isRevealed && randomActivity && (
                  <button
                    onClick={handleShareInvite}
                    className="mt-4 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/40 backdrop-blur-md border border-amber-200 text-amber-700 font-semibold shadow-sm hover:bg-amber-100/70 hover:scale-105 transition-all"
                  >
                    Share Invite 🌹
                  </button>
                )}
            </div>
        )}

        {/* === LIST TAB === */}
        {activeTab === 'list' && (
            <div className="w-full max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Filters */}
                <div className="bg-white/40 backdrop-blur-md rounded-2xl p-4 mb-6 border border-white/50">
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input 
                            type="text" 
                            placeholder="Search activities..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-white/60 border border-white/60 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-300 text-slate-700 placeholder:text-slate-400"
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button onClick={() => setSelectedType(null)} className={`px-3 py-1 rounded-full text-sm border transition-all ${!selectedType ? 'bg-purple-600 text-white border-purple-600' : 'bg-white/50 text-slate-600 border-white hover:bg-white'}`}>All</button>
                        {types.map(t => (
                            <button key={t} onClick={() => setSelectedType(selectedType === t ? null : t)} className={`px-3 py-1 rounded-full text-sm border transition-all ${selectedType === t ? 'bg-purple-600 text-white border-purple-600' : 'bg-white/50 text-slate-600 border-white hover:bg-white'}`}>{t}</button>
                        ))}
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredActivities.map(act => (
                        <div key={act.id} className="relative h-[220px] w-full perspective-1000">
                          <div className={`absolute inset-0 transition-all duration-700 transform-style-3d ${flippedId === act.id ? 'rotate-y-180' : ''}`}>
                            {/* Front */}
                            <div
                              className={`absolute inset-0 backface-hidden bg-white/60 backdrop-blur-sm border border-white/60 p-6 rounded-2xl hover:shadow-lg transition-all ${flippedId === act.id ? 'pointer-events-none' : 'pointer-events-auto'}`}
                              onClick={() => handleCardFlip(act)}
                              role="button"
                            >
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCompletingItem(act);
                                }}
                                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-amber-500 hover:scale-110 transition-all z-10"
                                title="Mark as completed"
                              >
                                <CheckCircle size={22} />
                              </button>

                              <h3 className="font-bold text-lg text-slate-800 mb-1 pr-8 flex items-center gap-2 hyphens-auto break-words">
                                {act.name}
                                {act.image_url && <Image size={14} className="text-slate-400" />}
                              </h3>
                              {act.location && (
                                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(act.location)}`} target="_blank" className="inline-flex items-center gap-1 text-sm text-purple-700 hover:underline mb-2" onClick={(e) => e.stopPropagation()}>
                                      <MapPin size={14} /> {act.location}
                                  </a>
                              )}
                              <div className="flex flex-wrap gap-2 mb-2">
                                  {act.type && act.type.split(',').map((t: string, i: number) => (
                                      <span key={i} className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full">{t.trim()}</span>
                                  ))}
                              </div>
                              <p className="text-slate-600 text-sm line-clamp-2">{act.description}</p>
                            </div>

                            {/* Back */}
                            <div className={`absolute inset-0 backface-hidden rotate-y-180 bg-white/60 backdrop-blur-sm border border-white/60 rounded-2xl overflow-hidden ${flippedId === act.id ? 'pointer-events-auto' : 'pointer-events-none'}`}>
                              {act.image_url && (
                                <img
                                  src={act.image_url}
                                  alt={act.name}
                                  className="absolute inset-0 w-full h-full object-cover"
                                />
                              )}

                              <button
                                onClick={() => setFlippedId(null)}
                                className="absolute bottom-3 right-3 px-4 py-2 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-all shadow"
                              >
                                Close
                              </button>
                            </div>
                          </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>

      {/* RATING MODAL */}
      {completingItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-white/60">
            <h3 className="text-2xl font-serif font-bold text-slate-800 mb-2">How was it?</h3>
            <p className="text-slate-600 mb-6">Rate <strong>{completingItem.name}</strong></p>
            
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setRating(star)} className="transition-transform hover:scale-125">
                  <Star size={32} fill={star <= rating ? "#fbbf24" : "none"} className={star <= rating ? "text-amber-400" : "text-slate-300"} />
                </button>
              ))}
            </div>

            <textarea placeholder="Write a short memory..." className="w-full bg-white border border-slate-200 rounded-xl p-3 mb-6 focus:ring-2 focus:ring-purple-300 outline-none" rows={3} value={note} onChange={e => setNote(e.target.value)} />

            <div className="flex gap-3">
              <button onClick={() => setCompletingItem(null)} className="flex-1 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200">Cancel</button>
              <button onClick={saveMemory} className="flex-1 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-purple-400 to-amber-400 hover:opacity-90 shadow-lg">Save Memory</button>
            </div>
          </div>
        </div>
      )}

      {showNameModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white/90 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
            <h3 className="text-2xl font-serif font-bold mb-2">Who are you?</h3>
            <p className="text-slate-500 mb-4 text-sm">Enter your name so we know who reviewed this!</p>
            <input 
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="w-full border rounded-xl p-3 mb-4 text-center"
              placeholder="Your Name"
            />
            <button 
              onClick={() => {
                if(nameInput.trim()) {
                  localStorage.setItem("userName", nameInput.trim());
                  setUserName(nameInput.trim());
                  setShowNameModal(false);
                }
              }}
              className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold"
            >
              Save Name
            </button>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[110] flex items-center gap-2 bg-white/80 backdrop-blur-md px-6 py-3 rounded-full shadow-2xl border border-white/50 animate-in slide-in-from-top-4 fade-in duration-300">
          <div className={`rounded-full p-1 ${toastVariant === 'warning' ? 'bg-amber-500' : 'bg-green-500'}`}>
            {toastVariant === 'warning' ? (
              <CircleAlert size={16} className="text-white" />
            ) : (
              <CheckCircle size={16} className="text-white" />
            )}
          </div>
          <span className="font-bold text-slate-700">{toastMessage}</span>
        </div>
      )}

      <button
        onClick={() => setShowNameModal(true)}
        className="mt-6 text-xs text-slate-400 hover:text-rose-500 transition-colors"
      >
        Change Name
      </button>
    </div>
  );
}
