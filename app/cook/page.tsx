"use client";
import { useState, useEffect } from "react";
import { Shuffle, ArrowLeft, Search, CheckCircle, Star, Image, CircleAlert } from "lucide-react";
import Link from "next/link";

export default function CookPage() {
  const [activeTab, setActiveTab] = useState<'random' | 'list'>('random');
  const [foods, setFoods] = useState<any[]>([]);
  const [randomFood, setRandomFood] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [flippedId, setFlippedId] = useState<string | number | null>(null);
  
  // Filter State
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState<string | null>(null);

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

  useEffect(() => {
    fetch("/api/food").then(res => res.json()).then(data => {
      if (Array.isArray(data)) {
        setFoods(data);
        if (data.length > 0) setRandomFood(data[Math.floor(Math.random() * data.length)]);
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
    if (foods.length > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        let newFood;
        do {
          newFood = foods[Math.floor(Math.random() * foods.length)];
        } while (foods.length > 1 && newFood === randomFood);
        setRandomFood(newFood);
        setIsAnimating(false);
      }, 300);
    }
  };

  const showToastMessage = (message: string, variant: 'success' | 'warning') => {
    setToastVariant(variant);
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
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
        type: "Food",
        rating,
        note,
        date: new Date().toISOString(),
        user: resolvedName,
      })
    });
    setCompletingItem(null);
    setNote("");
    setRating(5);
    showToastMessage(`Memory Saved by ${resolvedName}!`, 'success');
  };

  const categories = Array.from(new Set(foods.flatMap(f => f.category ? f.category.split(',').map((c:string) => c.trim()) : []))).sort();

  const filteredFoods = foods.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCat ? f.category?.includes(selectedCat) : true;
    return matchesSearch && matchesCat;
  });

  if (loading) return <div className="flex min-h-screen items-center justify-center text-rose-800 animate-pulse">Loading Menu...</div>;

  return (
    <div className="flex flex-col items-center min-h-screen p-4 bg-transparent">
      <Link href="/" className="absolute top-6 left-6 z-50 flex items-center gap-2 px-5 py-2.5 bg-white/30 backdrop-blur-md border border-white/40 rounded-full text-slate-700 font-medium shadow-sm hover:bg-white/60 hover:scale-105 hover:shadow-md transition-all duration-300 group">
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back Home
      </Link>
      
      <div className="mt-12 mb-8 text-center">
          <h1 className="font-serif text-4xl text-slate-800 font-bold drop-shadow-sm">Tonight's Menu</h1>
      </div>

      <div className="flex justify-center mb-8">
          <div className="bg-white/40 p-1 rounded-full backdrop-blur-md border border-white/50 shadow-sm flex">
              <button onClick={() => setActiveTab('random')} className={`px-6 py-2 rounded-full font-bold transition-all ${activeTab === 'random' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-600 hover:bg-white/50'}`}>🎲 Pick for Me</button>
              <button onClick={() => setActiveTab('list')} className={`px-6 py-2 rounded-full font-bold transition-all ${activeTab === 'list' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-600 hover:bg-white/50'}`}>📚 Browse All</button>
          </div>
      </div>

      {/* RANDOM TAB */}
      {activeTab === 'random' && (
          <div className="flex flex-col items-center w-full">
              <div className="w-full max-w-md p-10 rounded-3xl border-2 border-white/40 text-center relative transition-all duration-500" style={{ background: "rgba(255, 255, 255, 0.25)", backdropFilter: "blur(16px)" }}>
                  {randomFood ? (
                  <div className={`space-y-6 transition-all duration-300 ease-in-out ${isAnimating ? 'opacity-0 scale-95 blur-md translate-y-4' : 'opacity-100 scale-100 blur-0 translate-y-0'}`}>
                      <h2 className="font-serif text-4xl font-bold text-slate-900 leading-tight">{randomFood.name}</h2>
                      <div className="flex flex-wrap gap-2 justify-center">
                          {randomFood.category && randomFood.category.split(',').map((tag: string, i: number) => (
                              <span key={i} className="bg-rose-100/80 text-rose-700 px-3 py-1 rounded-full text-sm font-medium border border-rose-200">{tag.trim()}</span>
                          ))}
                      </div>
                      {randomFood.description && <p className="text-xl text-slate-700 font-light italic">"{randomFood.description}"</p>}
                  </div>
                  ) : <div className="text-slate-600">No foods found!</div>}
              </div>
              <button onClick={handleShuffle} className="mt-12 group relative inline-flex items-center gap-3 bg-rose-500 text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105 hover:bg-rose-600 hover:shadow-[0_0_30px_#f43f5e]">
                  <Shuffle className="group-hover:rotate-180 transition-transform duration-500" /> Shuffle Again
              </button>
          </div>
      )}

      {/* LIST TAB */}
      {activeTab === 'list' && (
          <div className="w-full max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
              {/* Filters */}
              <div className="bg-white/40 backdrop-blur-md rounded-2xl p-4 mb-6 border border-white/50">
                  <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                      <input type="text" placeholder="Search foods..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-white/60 border border-white/60 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-300 text-slate-700 placeholder:text-slate-400" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                      <button onClick={() => setSelectedCat(null)} className={`px-3 py-1 rounded-full text-sm border transition-all ${!selectedCat ? 'bg-rose-500 text-white border-rose-500' : 'bg-white/50 text-slate-600 border-white hover:bg-white'}`}>All</button>
                      {categories.map(cat => (
                          <button key={cat} onClick={() => setSelectedCat(selectedCat === cat ? null : cat)} className={`px-3 py-1 rounded-full text-sm border transition-all ${selectedCat === cat ? 'bg-rose-500 text-white border-rose-500' : 'bg-white/50 text-slate-600 border-white hover:bg-white'}`}>{cat}</button>
                      ))}
                  </div>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredFoods.map(food => (
                      <div key={food.id} className="relative h-[220px] w-full perspective-1000">
                        <div className={`absolute inset-0 transition-all duration-700 transform-style-3d ${flippedId === food.id ? 'rotate-y-180' : ''}`}>
                          {/* Front */}
                          <div
                            className={`absolute inset-0 backface-hidden bg-white/60 backdrop-blur-sm border border-white/60 p-6 rounded-2xl hover:shadow-lg transition-all ${flippedId === food.id ? 'pointer-events-none' : 'pointer-events-auto'}`}
                            onClick={() => handleCardFlip(food)}
                            role="button"
                          >
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setCompletingItem(food);
                              }}
                              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-amber-500 hover:scale-110 transition-all z-10"
                              title="Mark as cooked"
                            >
                              <CheckCircle size={22} />
                            </button>

                            <h3 className="font-bold text-lg text-slate-800 mb-2 pr-8 flex items-center gap-2">
                              {food.name}
                              {food.image_url && <Image size={14} className="text-slate-400" />}
                            </h3>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {food.category && food.category.split(',').map((t: string, i: number) => (
                                    <span key={i} className="bg-rose-100 text-rose-700 text-xs px-2 py-0.5 rounded-full">{t.trim()}</span>
                                ))}
                            </div>
                            <p className="text-slate-600 text-sm line-clamp-2">{food.description}</p>
                          </div>

                          {/* Back */}
                          <div className={`absolute inset-0 backface-hidden rotate-y-180 bg-white/60 backdrop-blur-sm border border-white/60 rounded-2xl overflow-hidden ${flippedId === food.id ? 'pointer-events-auto' : 'pointer-events-none'}`}>
                            {food.image_url && (
                              <img
                                src={food.image_url}
                                alt={food.name}
                                className="absolute inset-0 w-full h-full object-cover"
                              />
                            )}

                            <button
                              onClick={() => setFlippedId(null)}
                              className="absolute bottom-3 right-3 px-4 py-2 rounded-full bg-rose-500 text-white hover:bg-rose-600 transition-all shadow"
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

            <textarea placeholder="Write a short memory..." className="w-full bg-white border border-slate-200 rounded-xl p-3 mb-6 focus:ring-2 focus:ring-rose-300 outline-none" rows={3} value={note} onChange={e => setNote(e.target.value)} />

            <div className="flex gap-3">
              <button onClick={() => setCompletingItem(null)} className="flex-1 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200">Cancel</button>
              <button onClick={saveMemory} className="flex-1 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-rose-400 to-amber-400 hover:opacity-90 shadow-lg">Save Memory</button>
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
              className="w-full bg-rose-500 text-white py-3 rounded-xl font-bold"
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
