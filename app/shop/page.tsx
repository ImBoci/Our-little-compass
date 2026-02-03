"use client";
import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Trash2, Check, Plus, ShoppingBasket, Undo2, Copy } from "lucide-react";
import Link from "next/link";

interface ShoppingItem {
  id: number;
  name: string;
  checked: boolean;
  user?: string | null;
}

export default function ShopPage() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [copyPulse, setCopyPulse] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const pendingDeletes = useRef<{ [key: number]: NodeJS.Timeout }>({});

  useEffect(() => {
    fetch("/api/shop").then(r => r.json()).then(data => {
      if(Array.isArray(data)) setItems(data);
      setLoading(false);
    });
    return () => {
      Object.values(pendingDeletes.current).forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("userName") : null;
    if (stored) {
      setUserName(stored);
    }
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const addItem = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const name = input.trim();
    if (!name) return;
    const resolvedUser = userName || "Anonymous";
    const payload = { name, user: resolvedUser };
    console.log("Shop addItem payload:", payload);

    try {
      const res = await fetch("/api/shop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        alert(`Error: ${errorData.error || "Unknown error"}`);
        return;
      }

      const savedData = await res.json();
      const savedItem = Array.isArray(savedData) ? savedData[0] : savedData;
      if (savedItem?.id) {
        setItems((prev) => [...prev, savedItem]);
        setInput("");
      } else {
        alert("Failed to save the item. Please try again.");
      }
    } catch (error) {
      console.error("Failed to save item", error);
      alert("Failed to save the item. Please try again.");
    }
  };

  const toggleItem = async (id: number, currentChecked: boolean) => {
    const newChecked = !currentChecked;
    
    // Strictly preserve the existing item properties (name), only change 'checked'
    setItems(prev => prev.map(i => i.id === id ? { ...i, checked: newChecked } : i));

    // API Update (Fire and forget)
    fetch("/api/shop", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, checked: newChecked })
    });

    // Auto-Delete Logic
    if (newChecked) {
      // Schedule delete
      if (pendingDeletes.current[id]) clearTimeout(pendingDeletes.current[id]);
      
      pendingDeletes.current[id] = setTimeout(async () => {
        setItems(prev => prev.filter(i => i.id !== id));
        await fetch(`/api/shop?id=${id}`, { method: "DELETE" });
        delete pendingDeletes.current[id];
      }, 3000); 
    } else {
      // Cancel delete (Undo)
      if (pendingDeletes.current[id]) {
        clearTimeout(pendingDeletes.current[id]);
        delete pendingDeletes.current[id];
      }
    }
  };

  const deleteNow = async (id: number) => {
    if (pendingDeletes.current[id]) clearTimeout(pendingDeletes.current[id]);
    setItems(items.filter(i => i.id !== id));
    await fetch(`/api/shop?id=${id}`, { method: "DELETE" });
  };

  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const copyForReminders = async () => {
    const text = items.map(i => `- ${i.name}`).join("\n");
    try {
      await navigator.clipboard.writeText(text);
      showToastMessage("List copied to clipboard!");
      setCopyPulse(true);
      setTimeout(() => setCopyPulse(false), 600);
    } catch (error) {
      console.error("Failed to copy list", error);
    }
  };

  const handleAlertPartner = async () => {
    const resolvedName = userName || "Anonymous";
    try {
      const response = await fetch("/api/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: resolvedName,
          message: `${resolvedName} just updated the shopping list! 🛒`,
          url: "/shop",
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        if (response.status === 429 && typeof data?.remainingSeconds === "number") {
          setCooldown(data.remainingSeconds);
          showToastMessage("Cooldown active. Please wait.");
          return;
        }
        showToastMessage(data?.error || "Couldn't alert your partner. Try again.");
        return;
      }
      showToastMessage("Alert sent to your partner! 🔔");
    } catch {
      showToastMessage("Couldn't alert your partner. Try again.");
    }
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center text-emerald-500 animate-pulse font-serif text-xl">Loading list...</div>;

  return (
    <div className="min-h-screen p-4 flex flex-col items-center bg-transparent">
      <div className="w-full max-w-lg relative flex items-center justify-center mb-8 pt-4 min-h-[50px]">
        <Link 
          href="/" 
          className="absolute left-0 flex items-center gap-2 px-5 py-2.5 bg-white/30 backdrop-blur-md border border-white/40 rounded-full text-[var(--text-color)] font-medium shadow-sm hover:bg-white/60 hover:scale-105 hover:shadow-md transition-all duration-300 group z-50"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="hidden md:inline ml-1">Back Home</span>
        </Link>
        
        <h1 className="font-serif text-3xl font-bold drop-shadow-sm flex items-center gap-2 text-[var(--text-color)]">
          <ShoppingBasket className="text-emerald-500 dark:text-emerald-400" /> Shopping
        </h1>
      </div>

      <div className="w-full max-w-lg bg-[var(--card-bg)] backdrop-blur-xl border border-white/40 p-6 rounded-[2rem] shadow-xl flex flex-col gap-6">
        <form onSubmit={addItem} className="flex gap-2">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Add item..."
            className="flex-1 bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-slate-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all placeholder:text-slate-400 text-[var(--text-color)]"
          />
          <button type="submit" className="bg-emerald-500 text-white px-4 rounded-xl hover:bg-emerald-600 transition-colors shadow-md flex items-center justify-center">
            <Plus size={24} />
          </button>
        </form>

        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
          {items.length === 0 && <div className="text-center text-slate-500 dark:text-slate-400 italic py-8">Your list is empty. Time to stock up! 🥦</div>}
          
          {items.map(item => (
            <div
              key={item.id}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-500 ${item.checked ? "bg-emerald-50/30 border-emerald-100/50 scale-[0.98] shop-item-fade-out" : "bg-white/40 dark:bg-slate-800/40 border-white/50 dark:border-slate-600 shadow-sm"}`}
            >
              <div 
                onClick={() => toggleItem(item.id, item.checked)}
                className="flex items-center gap-3 flex-1 cursor-pointer select-none"
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${item.checked ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 dark:border-slate-500'}`}>
                  {item.checked && <Check size={14} className="text-white" />}
                </div>
                <span className={`text-lg transition-all ${item.checked ? 'text-slate-400 line-through' : 'text-[var(--text-color)] font-medium'}`}>
                  {item.name}
                </span>
                {item.user && (
                  <span className="text-xs text-[var(--text-color)]/60 ml-2">
                    • {item.user}
                  </span>
                )}
                {item.checked && <span className="text-xs text-emerald-500 animate-pulse ml-2 font-medium">Deleting...</span>}
              </div>
              
              {item.checked ? (
                <button onClick={() => toggleItem(item.id, true)} className="p-2 text-emerald-500 hover:scale-110 transition-transform" title="Undo">
                  <Undo2 size={20} />
                </button>
              ) : (
                <button onClick={() => deleteNow(item.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-3 pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
          <button
            onClick={copyForReminders}
            className={`flex-1 py-3 rounded-xl font-bold text-[var(--text-color)] bg-white/30 backdrop-blur-md border border-white/40 hover:bg-white/60 text-sm flex items-center justify-center gap-2 transition-all ${copyPulse ? "animate-pulse" : ""}`}
          >
            <Copy size={16} /> 📋 Copy
          </button>
          <button
            onClick={handleAlertPartner}
            disabled={cooldown > 0}
            className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              cooldown > 0
                ? "bg-white/10 border border-white/30 text-[var(--text-color)]/60 cursor-not-allowed"
                : "bg-white/30 backdrop-blur-md border border-white/40 text-[var(--text-color)] hover:bg-white/60"
            }`}
          >
            {cooldown > 0
              ? `Wait ${Math.floor(cooldown / 60)}:${String(cooldown % 60).padStart(2, "0")}`
              : "🔔 Alert Partner"}
          </button>
        </div>
      </div>

      {showToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[110] flex items-center gap-2 bg-white/80 backdrop-blur-md px-6 py-3 rounded-full shadow-2xl border border-white/50 animate-in slide-in-from-top-4 fade-in duration-300">
          <span className="font-bold text-slate-700">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
