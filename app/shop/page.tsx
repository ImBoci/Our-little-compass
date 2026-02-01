"use client";
import { useState, useEffect } from "react";
import { ArrowLeft, Trash2, Check, Share, Plus, ShoppingBasket } from "lucide-react";
import Link from "next/link";

interface ShoppingItem {
  id: number;
  name: string;
  checked: boolean;
}

export default function ShopPage() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/shop").then(r => r.json()).then(data => {
      if(Array.isArray(data)) setItems(data);
      setLoading(false);
    });
  }, []);

  const addItem = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    const res = await fetch("/api/shop", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: input.trim() })
    });
    
    if (res.ok) {
      const newItem = await res.json();
      setItems(prev => Array.isArray(newItem) ? [...prev, ...newItem] : [...prev, newItem]);
      setInput("");
    }
  };

  const toggleItem = async (id: number, current: boolean) => {
    setItems(items.map(i => i.id === id ? { ...i, checked: !current } : i));
    await fetch("/api/shop", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, checked: !current })
    });
  };

  const deleteItem = async (id: number) => {
    setItems(items.filter(i => i.id !== id));
    await fetch(`/api/shop?id=${id}`, { method: "DELETE" });
  };

  const clearCompleted = async () => {
    if(!confirm("Clear all checked items?")) return;
    setItems(items.filter(i => !i.checked));
    await fetch(`/api/shop?action=clear_completed`, { method: "DELETE" });
  };

  const exportToApple = () => {
    const text = items.map(i => `- [${i.checked ? 'x' : ' '}] ${i.name}`).join("\n");
    if (navigator.share) {
      navigator.share({ title: "Grocery List", text: text }).catch(console.error);
    } else {
      navigator.clipboard.writeText(text);
      alert("List copied to clipboard!");
    }
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center text-emerald-500 animate-pulse font-serif text-xl">Loading list...</div>;

  return (
    <div className="min-h-screen p-4 flex flex-col items-center bg-transparent">
      
      {/* HEADER: Relative container for perfect centering */}
      <div className="w-full max-w-lg relative flex items-center justify-center mb-8 pt-4 min-h-[50px]">
        <Link 
          href="/" 
          className="absolute left-0 flex items-center justify-center p-3 bg-white/30 backdrop-blur-md border border-white/40 rounded-full text-[var(--text-color)] hover:bg-white/50 transition-all shadow-sm group z-10"
        >
          <ArrowLeft size={20} className="transition-transform group-hover:-translate-x-1" />
          <span className="hidden md:inline ml-2 pr-1 font-medium">Home</span>
        </Link>
        
        <h1 className="font-serif text-3xl font-bold drop-shadow-sm flex items-center gap-2 text-[var(--text-color)]">
          <ShoppingBasket className="text-emerald-500 dark:text-emerald-400" /> Shopping
        </h1>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-lg bg-[var(--card-bg)] backdrop-blur-xl border border-white/40 p-6 rounded-[2rem] shadow-xl flex flex-col gap-6">
        
        {/* Input */}
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

        {/* List */}
        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
          {items.length === 0 && <div className="text-center text-slate-500 dark:text-slate-400 italic py-8">Your list is empty. Time to stock up! 🥦</div>}
          
          {items.map(item => (
            <div 
              key={item.id} 
              className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-300 ${item.checked ? 'bg-emerald-50/50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800 opacity-60' : 'bg-white/40 dark:bg-slate-800/40 border-white/50 dark:border-slate-600 shadow-sm'}`}
            >
              <div 
                onClick={() => toggleItem(item.id, item.checked)}
                className="flex items-center gap-3 flex-1 cursor-pointer"
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${item.checked ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 dark:border-slate-500'}`}>
                  {item.checked && <Check size={14} className="text-white" />}
                </div>
                <span className={`text-lg ${item.checked ? 'text-slate-400 line-through' : 'text-[var(--text-color)] font-medium'}`}>
                  {item.name}
                </span>
              </div>
              <button onClick={() => deleteItem(item.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="flex gap-3 pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
          <button 
            onClick={clearCompleted}
            className="flex-1 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-white/50 dark:bg-slate-700/50 hover:bg-white dark:hover:bg-slate-600 border border-white/50 dark:border-slate-600 text-sm transition-all"
          >
            Clear Done
          </button>
          <button 
            onClick={exportToApple}
            className="flex-1 py-3 rounded-xl font-bold text-white bg-emerald-500 hover:bg-emerald-600 shadow-lg text-sm flex items-center justify-center gap-2 transition-all"
          >
            <Share size={16} /> Export
          </button>
        </div>
      </div>
    </div>
  );
}
