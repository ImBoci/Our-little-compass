"use client";
import { useState, useEffect, useRef } from "react";
import { Shuffle, ArrowLeft, Search, CheckCircle, Star, Image, CircleAlert, ShoppingCart, ShoppingBasket } from "lucide-react";
import Link from "next/link";
import ScratchOff from "@/components/ScratchOff";
import ScrollToTopButton from "@/components/ScrollToTopButton";

export default function CookPage() {
  const [activeTab, setActiveTab] = useState<'random' | 'list'>('random');
  const [foods, setFoods] = useState<any[]>([]);
  const [randomFood, setRandomFood] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isScratchResetting, setIsScratchResetting] = useState(false);
  const [hasShuffled, setHasShuffled] = useState(false);
  const [cooldown, setCooldown] = useState(0);
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

  useEffect(() => {
    fetch("/api/food").then(res => res.json()).then(data => {
      if (Array.isArray(data)) {
        setFoods(data);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("userName") : null;
    if (stored) {
      setUserName(stored);
    } else {
      setShowNameModal(true);
    }
  }, []);

  const handleShuffle = () => {
    if (foods.length === 0 || isSpinning) return;
    setHasShuffled(true);
    setIsSpinning(true);
    setIsAnimating(true);
    setIsRevealed(false);
    setIsScratchResetting(true);
    setTimeout(() => setIsScratchResetting(false), 0);

    const getRandomFood = () => foods[Math.floor(Math.random() * foods.length)];
    let finalFood = getRandomFood();
    if (foods.length > 1) {
      while (finalFood === randomFood) {
        finalFood = getRandomFood();
      }
    }

    const intervalId = setInterval(() => {
      setRandomFood(getRandomFood());
      playTick();
    }, 70);

    setTimeout(() => {
      clearInterval(intervalId);
      setRandomFood(finalFood);
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

  const handleSendPushInvite = async () => {
    if (!randomFood?.name) return;
    const storedName = localStorage.getItem("userName");
    const resolvedName = storedName || userName || "Anonymous";
    const message = `Dinner is decided! 🌹 ${randomFood.name}. #OurLittleCompass`;
    try {
      const response = await fetch("/api/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender: resolvedName, message }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        if (response.status === 429 && typeof data?.remainingSeconds === "number") {
          setCooldown(data.remainingSeconds);
          showToastMessage("Cooldown active. Please wait.", "warning");
          return;
        }
        showToastMessage(data?.error || "Couldn't send push. Try again.", "warning");
        return;
      }
      showToastMessage("Push sent to your partner!", "success");
    } catch {
      showToastMessage("Couldn't send push. Try again.", "warning");
    }
  };

  const handleAddIngredients = async () => {
    if (!randomFood?.description) {
      showToastMessage("No ingredients listed for this meal.", "warning");
      return;
    }
    const items = randomFood.description
      .split(",")
      .map((item: string) => item.trim())
      .filter((item: string) => item.length > 0);
    if (items.length === 0) {
      showToastMessage("No ingredients listed for this meal.", "warning");
      return;
    }
    try {
      const response = await fetch("/api/shop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ names: items }),
      });
      if (!response.ok) {
        showToastMessage("Couldn't add ingredients. Try again.", "warning");
        return;
      }
      showToastMessage("Ingredients added to list! 🛒", "success");
    } catch {
      showToastMessage("Couldn't add ingredients. Try again.", "warning");
    }
  };

  const handleAddIngredientsFromDescription = async (description?: string) => {
    if (!description) {
      showToastMessage("No ingredients listed for this meal.", "warning");
      return;
    }
    const items = description
      .split(",")
      .map((item: string) => item.trim())
      .filter((item: string) => item.length > 0);
    if (items.length === 0) {
      showToastMessage("No ingredients listed for this meal.", "warning");
      return;
    }
    try {
      const response = await fetch("/api/shop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ names: items }),
      });
      if (!response.ok) {
        showToastMessage("Couldn't add ingredients. Try again.", "warning");
        return;
      }
      showToastMessage("Ingredients added to list!", "success");
    } catch {
      showToastMessage("Couldn't add ingredients. Try again.", "warning");
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
        type: "Food",
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

  const categories = Array.from(new Set(foods.flatMap(f => f.category ? f.category.split(',').map((c:string) => c.trim()) : []))).sort();

  const filteredFoods = foods.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCat ? f.category?.includes(selectedCat) : true;
    return matchesSearch && matchesCat;
  });

  if (loading) return <div className="flex min-h-screen items-center justify-center text-rose-800 animate-pulse">Loading Menu...</div>;

  return (
    <div className="flex flex-col items-center min-h-screen p-4 bg-transparent">
      <header className="w-full max-w-5xl flex flex-col gap-4 mb-6">
        <div className="flex justify-between items-center w-full">
          <Link href="/" className="flex items-center gap-2 px-4 py-2 bg-[var(--card-bg)] backdrop-blur-md border border-white/50 rounded-full text-[var(--text-color)] text-sm sm:text-base font-medium shadow-sm hover:bg-white/60 hover:scale-105 hover:shadow-md transition-all duration-300 group">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="hidden sm:inline">Back Home</span>
          </Link>
          <div className="h-10" />
        </div>
        <div className="text-center w-full">
          <h1 className="font-serif text-2xl md:text-4xl text-[var(--text-color)] font-bold drop-shadow-sm">Tonight's Menu</h1>
        </div>
      </header>

      <div className="flex justify-center mb-8">
          <div className="bg-white/20 dark:bg-slate-800/40 p-1 rounded-full backdrop-blur-md border border-white/50 shadow-sm flex">
              <button onClick={() => setActiveTab('random')} className={`px-6 py-2 rounded-full font-bold transition-all ${activeTab === 'random' ? 'bg-rose-500 text-white shadow-md' : 'text-[var(--text-color)]/80 hover:bg-white/50'}`}>🎲 Pick for Me</button>
              <button onClick={() => setActiveTab('list')} className={`px-6 py-2 rounded-full font-bold transition-all ${activeTab === 'list' ? 'bg-rose-500 text-white shadow-md' : 'text-[var(--text-color)]/80 hover:bg-white/50'}`}>📚 Browse All</button>
          </div>
      </div>

      {/* RANDOM TAB */}
      {activeTab === 'random' && (
          <div className="flex flex-col items-center w-full">
              <div
                className="w-full max-w-sm md:max-w-md p-8 sm:p-10 rounded-3xl border-2 border-white/50 bg-[var(--card-bg)] text-center relative transition-all duration-500"
                style={{ backdropFilter: "blur(16px)" }}
              >
                  {!hasShuffled ? (
                    <div className="space-y-3">
                      <div className="text-4xl">❓</div>
                      <p className="text-[var(--text-color)] font-medium">Tap Shuffle to decide our fate.</p>
                    </div>
                  ) : randomFood ? (
                    <div className={`space-y-6 transition-all duration-150 ease-in-out ${isSpinning ? 'blur-sm translate-y-2' : 'blur-0 translate-y-0'} ${!isRevealed ? 'pointer-events-none' : 'pointer-events-auto'}`}>
                        <h2 className="font-serif text-3xl md:text-4xl font-bold text-[var(--text-color)] leading-tight hyphens-auto break-words">{randomFood.name}</h2>
                        <div className="flex flex-wrap gap-2 justify-center">
                            {randomFood.category && randomFood.category.split(',').map((tag: string, i: number) => (
                                <span key={i} className="bg-rose-100/80 text-rose-700 px-3 py-1 rounded-full text-sm font-medium border border-rose-200">{tag.trim()}</span>
                            ))}
                        </div>
                        {randomFood.description && <p className="text-lg md:text-xl text-[var(--text-color)] font-light italic">"{randomFood.description}"</p>}
                    </div>
                  ) : <div className="text-[var(--text-color)]/70">No foods found!</div>}

                  {hasShuffled && !isRevealed && !isSpinning && (
                    <div className="absolute inset-0 z-20">
                      <ScratchOff isResetting={isScratchResetting} onComplete={() => setIsRevealed(true)} />
                    </div>
                  )}
              </div>
              <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
                <button onClick={handleShuffle} className="group relative inline-flex items-center gap-3 bg-rose-500 text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105 hover:bg-rose-600 hover:shadow-[0_0_30px_#f43f5e]">
                    <Shuffle className="group-hover:rotate-180 transition-transform duration-500" /> Shuffle Again
                </button>
                {randomFood && (
                  <button
                    onClick={handleAddIngredients}
                    className="inline-flex items-center justify-center p-3 rounded-full bg-white/20 backdrop-blur-md border border-rose-200/60 text-rose-600 hover:bg-rose-100/40 transition-all shadow-sm"
                    title="Add ingredients to shopping list"
                  >
                    <ShoppingCart size={22} />
                  </button>
                )}
              </div>
              {isRevealed && randomFood && (
                <button
                  onClick={handleSendPushInvite}
                  disabled={cooldown > 0}
                  className={`mt-4 inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold shadow-sm transition-all ${
                    cooldown > 0
                      ? "bg-white/10 border border-white/30 text-[var(--text-color)]/60 cursor-not-allowed"
                      : "bg-rose-500/20 dark:bg-rose-500/40 backdrop-blur-md border-2 border-rose-300/70 text-[var(--text-color)] hover:bg-rose-500/30 hover:scale-105"
                  }`}
                >
                  {cooldown > 0
                    ? `Wait ${Math.floor(cooldown / 60)}:${String(cooldown % 60).padStart(2, "0")} ⏳`
                    : "Send Push to Partner 🚀"}
                </button>
              )}
          </div>
      )}

      {/* LIST TAB */}
      {activeTab === 'list' && (
          <div className="w-full max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
              {/* Filters */}
              <div className="bg-[var(--card-bg)] backdrop-blur-xl rounded-2xl p-4 mb-6 border border-white/50">
                  <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-color)]/50" size={20} />
                      <input type="text" placeholder="Search foods..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-[var(--input-bg)] border border-white/20 dark:border-slate-600 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-300 text-[var(--text-color)] placeholder:text-slate-400" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                      <button onClick={() => setSelectedCat(null)} className={`px-3 py-1 rounded-full text-sm border transition-all ${!selectedCat ? 'bg-rose-500 text-white border-rose-500' : 'bg-white/10 text-[var(--text-color)] border-white/20 dark:border-slate-500 hover:bg-white/20'}`}>All</button>
                      {categories.map(cat => (
                          <button key={cat} onClick={() => setSelectedCat(selectedCat === cat ? null : cat)} className={`px-3 py-1 rounded-full text-sm border transition-all ${selectedCat === cat ? 'bg-rose-500 text-white border-rose-500' : 'bg-white/10 text-[var(--text-color)] border-white/20 dark:border-slate-500 hover:bg-white/20'}`}>{cat}</button>
                      ))}
                  </div>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredFoods.map(food => (
                      <div key={food.id} className="relative h-[220px] w-full perspective-1000">
                        <div className={`absolute inset-0 transition-all duration-700 transform-style-3d ${flippedId === food.id ? 'rotate-y-180' : ''}`}>
                          {/* Front */}
                          <div
                            className={`absolute inset-0 backface-hidden bg-[var(--card-bg)] backdrop-blur-sm border border-white/60 p-6 rounded-2xl hover:shadow-lg transition-all ${flippedId === food.id ? 'pointer-events-none' : 'pointer-events-auto'}`}
                            onClick={() => handleCardFlip(food)}
                            role="button"
                          >
                            <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddIngredientsFromDescription(food.description);
                                }}
                                className="p-2 text-emerald-500 hover:text-emerald-600 hover:scale-110 transition-all"
                                title="Add ingredients to shopping list"
                              >
                                <ShoppingBasket size={20} />
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCompletingItem(food);
                                }}
                                className="p-2 text-slate-400 hover:text-amber-500 hover:scale-110 transition-all"
                                title="Mark as cooked"
                              >
                                <CheckCircle size={22} />
                              </button>
                            </div>

                            <h3 className="font-bold text-lg text-[var(--text-color)] mb-2 pr-8 flex items-center gap-2 hyphens-auto break-words">
                              {food.name}
                              {food.image_url && <Image size={14} className="text-slate-400" />}
                            </h3>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {food.category && food.category.split(',').map((t: string, i: number) => (
                                    <span key={i} className="bg-rose-100 text-rose-700 text-xs px-2 py-0.5 rounded-full">{t.trim()}</span>
                                ))}
                            </div>
                            <p className="text-[var(--text-color)] text-sm line-clamp-2">{food.description}</p>
                          </div>

                          {/* Back */}
                          <div className={`absolute inset-0 backface-hidden rotate-y-180 bg-[var(--card-bg)] backdrop-blur-sm border border-white/60 rounded-2xl overflow-hidden ${flippedId === food.id ? 'pointer-events-auto' : 'pointer-events-none'}`}>
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
              <ScrollToTopButton accent="rose" />
          </div>
      )}

      {/* RATING MODAL */}
      {completingItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[var(--card-bg)] backdrop-blur-xl rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-white/60">
            <h3 className="text-2xl font-serif font-bold text-slate-800 mb-2">How was it?</h3>
            <p className="text-[var(--text-color)] mb-6">Rate <strong>{completingItem.name}</strong></p>
            
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setRating(star)} className="transition-transform hover:scale-125">
                  <Star size={32} fill={star <= rating ? "#fbbf24" : "none"} className={star <= rating ? "text-amber-400" : "text-slate-300"} />
                </button>
              ))}
            </div>

            <textarea placeholder="Write a short memory..." className="w-full bg-[var(--input-bg)] border border-slate-200 rounded-xl p-3 mb-6 focus:ring-2 focus:ring-rose-300 outline-none text-[var(--text-color)]" rows={3} value={note} onChange={e => setNote(e.target.value)} />

            <div className="flex gap-3">
              <button onClick={() => setCompletingItem(null)} className="flex-1 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200">Cancel</button>
              <button onClick={saveMemory} className="flex-1 py-3 rounded-xl font-bold text-white bg-[var(--btn-primary)] hover:opacity-90 shadow-lg">Save Memory</button>
            </div>
          </div>
        </div>
      )}

      {showNameModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--card-bg)] rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
            <h3 className="text-2xl font-serif font-bold mb-2">Who are you?</h3>
            <p className="text-slate-500 mb-4 text-sm">Enter your name so we know who reviewed this!</p>
            <input 
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="w-full border rounded-xl p-3 mb-4 text-center bg-[var(--input-bg)] text-[var(--text-color)] placeholder:text-slate-400"
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

    </div>
  );
}
