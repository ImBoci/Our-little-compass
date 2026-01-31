"use client";
import { useState, useEffect } from "react";
import { ArrowLeft, Trash2, Calendar, Star, User, Image as ImageIcon } from "lucide-react";
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

  if (loading) return <div className="flex min-h-screen items-center justify-center text-[var(--text-color)] animate-pulse font-serif text-xl">Loading your memories...</div>;

  return (
    <div className="min-h-screen p-4 flex flex-col items-center bg-transparent">
      <div className="w-full max-w-2xl flex items-center justify-between mb-8 gap-4 relative z-50 pt-4">
        <Link 
          href="/" 
          className="flex items-center justify-center p-3 bg-white/30 backdrop-blur-md border border-white/40 rounded-full text-[var(--text-color)] opacity-80 hover:opacity-100 transition-all shadow-sm group"
        >
          <ArrowLeft size={20} className="transition-transform group-hover:-translate-x-1" />
          <span className="hidden md:inline ml-2 pr-1 font-medium">Home</span>
        </Link>
        <h1 className="font-serif text-4xl text-[var(--text-color)] font-bold drop-shadow-sm text-center flex-1 md:pr-24">Our Memories</h1>
        <div className="w-[52px] md:w-[88px]" />
      </div>

      {/* Tabs */}
      <div className="flex bg-[var(--card-bg)] p-1 rounded-full mb-8 backdrop-blur-md border border-white/50 shadow-sm relative z-40">
        <button onClick={() => setActiveTab('Food')} className={`px-8 py-2 rounded-full transition-all font-bold ${activeTab === 'Food' ? 'bg-rose-500 text-white shadow-md' : 'text-[var(--text-color)]/80 hover:bg-white/20'}`}>Foods</button>
        <button onClick={() => setActiveTab('Activity')} className={`px-8 py-2 rounded-full transition-all font-bold ${activeTab === 'Activity' ? 'bg-purple-600 text-white shadow-md' : 'text-[var(--text-color)]/80 hover:bg-white/20'}`}>Activities</button>
      </div>

      {/* List */}
      <div className="w-full max-w-2xl space-y-4 pb-20">
        {filtered.length === 0 ? (
          <div className="text-center text-[var(--text-color)]/70 italic py-12 bg-[var(--card-bg)] backdrop-blur-sm rounded-3xl border border-white/40">
            {activeTab === 'Food' ? "No meals saved yet. 🍔" : "No adventures yet. 🎈"}
          </div>
        ) : (
          filtered.map(item => (
            <div key={item.id} className="bg-[var(--card-bg)] backdrop-blur-sm border border-white/60 rounded-3xl shadow-sm overflow-hidden flex flex-row group hover:bg-white/20 transition-all duration-300">
              {/* Thumbnail Image */}
              {item.image_url ? (
                <div className="w-24 h-24 sm:w-32 sm:h-32 shrink-0 p-2">
                  <img 
                    src={item.image_url} 
                    alt={item.name} 
                    className="w-full h-full object-cover rounded-2xl shadow-inner"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 sm:w-32 sm:h-32 shrink-0 p-2 flex items-center justify-center bg-white/10">
                  <ImageIcon className="text-[var(--text-color)]/40" size={24} />
                </div>
              )}

              {/* Content */}
              <div className="p-4 flex-1 flex flex-col justify-between min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--text-color)]/60 uppercase tracking-widest mb-0.5">
                      <Calendar size={10} /> {new Date(item.date).toLocaleDateString()}
                    </div>
                    <h3 className="font-serif text-xl text-[var(--text-color)] font-bold truncate leading-tight">{item.name}</h3>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-100/20 text-amber-500 px-2 py-0.5 rounded-full text-xs font-bold border border-amber-200/30 shrink-0">
                    <Star size={12} fill="currentColor" /> {item.rating}
                  </div>
                </div>
                
                <p className="text-[var(--text-color)]/70 text-sm italic line-clamp-1 mb-1">
                  {item.note ? `"${item.note}"` : "No notes"}
                </p>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-color)]/70 font-medium bg-white/20 px-2 py-1 rounded-full">
                    <User size={10} /> {item.user || "Me"}
                  </div>
                  <button 
                    onClick={() => setDeletingId(item.id)} 
                    className="p-1.5 text-[var(--text-color)]/40 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          )
        ))}
      </div>

      {/* Delete Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[var(--card-bg)] backdrop-blur-xl rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-white/60 text-center">
            <h3 className="text-xl font-bold text-[var(--text-color)] mb-6">Remove this memory?</h3>
            <div className="flex gap-3">
              <button onClick={() => setDeletingId(null)} className="flex-1 py-3 rounded-xl font-bold text-[var(--text-color)]/70 bg-white/20 hover:bg-white/30">Cancel</button>
              <button onClick={handleDelete} className="flex-1 py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
