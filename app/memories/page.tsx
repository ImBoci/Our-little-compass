"use client";
import { useState, useEffect } from "react";
import { ArrowLeft, Trash2, Calendar, Star, User } from "lucide-react";
import Link from "next/link";

export default function MemoriesPage() {
  const [activeTab, setActiveTab] = useState<'Food' | 'Activity'>('Food');
  const [memories, setMemories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/memories").then(r => r.json()).then(data => {
      if(Array.isArray(data)) setMemories(data);
      setLoading(false);
    });
  }, []);

  const handleDelete = async () => {
    if (!deletingId) return;
    await fetch(`/api/memories?id=${deletingId}`, { method: 'DELETE' });
    setMemories(memories.filter(m => m.id !== deletingId));
    setDeletingId(null);
  };

  const filtered = memories.filter(m => m.type === activeTab);

  if (loading) return <div className="flex min-h-screen items-center justify-center text-rose-800 animate-pulse font-serif text-xl">Opening the photo album...</div>;

  return (
    <div className="min-h-screen p-4 flex flex-col items-center bg-transparent">
      <div className="w-full max-w-2xl flex flex-col md:flex-row items-center justify-between mb-8 gap-4 relative z-50 pt-4">
        <Link href="/" className="flex items-center gap-2 px-5 py-2.5 bg-white/30 backdrop-blur-md border border-white/40 rounded-full text-slate-700 font-medium shadow-sm hover:bg-white/60 transition-all z-50">
          <ArrowLeft size={18} /> Home
        </Link>
        <h1 className="font-serif text-4xl text-slate-800 font-bold drop-shadow-sm text-center flex-1 md:pr-24">Our Memories</h1>
      </div>

      {/* Tabs */}
      <div className="flex bg-white/40 p-1 rounded-full mb-8 backdrop-blur-md border border-white/50 shadow-sm relative z-40">
        <button onClick={() => setActiveTab('Food')} className={`px-8 py-2 rounded-full transition-all font-bold ${activeTab === 'Food' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-600 hover:bg-white/50'}`}>Foods</button>
        <button onClick={() => setActiveTab('Activity')} className={`px-8 py-2 rounded-full transition-all font-bold ${activeTab === 'Activity' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-600 hover:bg-white/50'}`}>Activities</button>
      </div>

      {/* List - Grid Layout */}
      <div className="w-full max-w-2xl grid grid-cols-1 gap-8 pb-20">
        {filtered.length === 0 ? (
          <div className="text-center text-slate-500 italic py-16 bg-white/20 backdrop-blur-sm rounded-3xl border-2 border-dashed border-white/40">
            {activeTab === 'Food' ? "No meals saved yet. Go eat something delicious! 🍔" : "No adventures yet. Go do something fun! 🎈"}
          </div>
        ) : (
          filtered.map(item => (
            <div key={item.id} className="bg-white/60 backdrop-blur-md border border-white/60 rounded-[2rem] shadow-lg overflow-hidden flex flex-col group hover:scale-[1.02] transition-transform duration-300">
              {/* Image Section (Top) */}
              {item.image_url && (
                <div className="w-full h-56 md:h-64 overflow-hidden relative">
                  <img 
                    src={item.image_url} 
                    alt={item.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
              )}

              {/* Content Section (Bottom) */}
              <div className="p-6 md:p-8 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                      <Calendar size={12} /> {new Date(item.date).toLocaleDateString()}
                    </div>
                    <h3 className="font-serif text-3xl text-slate-800 font-bold leading-tight">{item.name}</h3>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-100/90 text-amber-600 px-4 py-1.5 rounded-full text-lg font-bold border border-amber-200 shadow-sm">
                    <Star size={18} fill="currentColor" /> {item.rating}
                  </div>
                </div>
                
                {item.note && (
                  <p className="text-slate-600 italic text-lg leading-relaxed bg-white/30 p-4 rounded-2xl border border-white/40">
                    "{item.note}"
                  </p>
                )}
                
                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center gap-2 text-sm text-slate-500 font-medium bg-white/40 px-4 py-2 rounded-full border border-white/50">
                    <User size={14} /> {item.user || "Anonymous"}
                  </div>
                  <button 
                    onClick={() => setDeletingId(item.id)} 
                    className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all rounded-full"
                    title="Delete memory"
                  >
                    <Trash2 size={22} />
                  </button>
                </div>
              </div>
            </div>
          )
        ))}
      </div>

      {/* Delete Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl border border-white/60 text-center">
            <h3 className="text-2xl font-bold text-slate-800 mb-2 font-serif">Forget this?</h3>
            <p className="text-slate-600 mb-8 leading-relaxed">This memory will be removed from your scrapbook forever.</p>
            <div className="flex gap-4">
              <button onClick={() => setDeletingId(null)} className="flex-1 py-4 rounded-2xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">Keep it</button>
              <button onClick={handleDelete} className="flex-1 py-4 rounded-2xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg active:scale-95 transition-all">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
