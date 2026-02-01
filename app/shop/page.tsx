"use client";
import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Trash2, Check, Share, Plus, ShoppingBasket, Undo2 } from "lucide-react";
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

  const addItem = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const name = input.trim();
    if (!name) return;

    // Optimistic Add with Temporary ID
    const tempId = Date.now(); 
    const newItem = { id: tempId, name: name, checked: false };
    
    setItems(prev => [...prev, newItem]);
    setInput("");

    try {
      const res = await fetch("/api/shop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }) 
      });
      
      if (res.ok) {
        const savedData = await res.json();
        const savedItem = Array.isArray(savedData) ? savedData[0] : savedData;
        // Swap temp ID with real DB ID, KEEPING the name secure
        setItems(prev => prev.map(i => i.id === tempId ? { ...i, id: savedItem.id } : i));
      }
    } catch (error) {
      console.error("Failed to save item", error);
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

  const clearCompleted = async () => {
    if(!confirm("Clear all checked items immediately?")) return;
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
      <div className="w-full max-w-lg relative flex items-center justify-center mb-8 pt-4 min-h-[50px]">
        <Link 
          href="/" 
          className="absolute left-0 flex items-center justify-center p-3 bg-white/30 backdrop-blur-md border border-white/40 rounded-full text-[var(--text-color)] hover:bg-white/60 hover:scale-105 hover:shadow-md transition-all shadow-sm group z-50"
        >
          <ArrowLeft size={20} className="transition-transform group-hover:-translate-x-1" />
          <span className="hidden md:inline ml-2 pr-1 font-medium">Home</span>
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
              className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-500 ${item.checked ? 'bg-emerald-50/30 border-emerald-100/50 opacity-60 scale-[0.98]' : 'bg-white/40 dark:bg-slate-800/40 border-white/50 dark:border-slate-600 shadow-sm'}`}
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
          <button onClick={clearCompleted} className="flex-1 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-white/50 dark:bg-slate-700/50 hover:bg-white dark:hover:bg-slate-600 border border-white/50 dark:border-slate-600 text-sm transition-all">Clear Done</button>
          <button onClick={exportToApple} className="flex-1 py-3 rounded-xl font-bold text-white bg-emerald-500 hover:bg-emerald-600 shadow-lg text-sm flex items-center justify-center gap-2 transition-all"><Share size={16} /> Export</button>
        </div>
      </div>
    </div>
  );
}
