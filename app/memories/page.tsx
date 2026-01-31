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

  return (
    <div className="min-h-screen p-4 flex flex-col items-center bg-transparent">
      <div className="w-full max-w-2xl relative mb-8">
        <Link href="/" className="absolute top-1 left-0 flex items-center gap-2 px-5 py-2.5 bg-white/30 backdrop-blur-md border border-white/40 rounded-full text-slate-700 font-medium shadow-sm hover:bg-white/60 transition-all">
          <ArrowLeft size={18} /> Home
        </Link>
        <h1 className="text-center font-serif text-4xl text-slate-800 font-bold drop-shadow-sm mt-16 md:mt-0">Our Memories</h1>
      </div>

      {/* Tabs */}
      <div className="flex bg-white/40 p-1 rounded-full mb-8 backdrop-blur-md border border-white/50 shadow-sm">
        <button onClick={() => setActiveTab('Food')} className={`px-8 py-2 rounded-full transition-all font-bold ${activeTab === 'Food' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-600 hover:bg-white/50'}`}>Foods</button>
        <button onClick={() => setActiveTab('Activity')} className={`px-8 py-2 rounded-full transition-all font-bold ${activeTab === 'Activity' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-600 hover:bg-white/50'}`}>Activities</button>
      </div>

      {/* List */}
      <div className="w-full max-w-2xl space-y-4 pb-20">
        {filtered.length === 0 && !loading && <div className="text-center text-slate-500 italic py-10 bg-white/30 rounded-3xl">No memories yet. Go do something fun!</div>}
        
        {filtered.map(item => (
          <div key={item.id} className="bg-white/60 backdrop-blur-md border border-white/60 p-6 rounded-3xl shadow-sm relative group hover:scale-[1.01] transition-transform">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Calendar size={12} /> {new Date(item.date).toLocaleDateString()}
                </span>
                <h3 className="font-serif text-2xl text-slate-800 font-bold">{item.name}</h3>
              </div>
              <div className="flex items-center gap-2 bg-amber-100/80 text-amber-600 px-3 py-1 rounded-full text-sm font-bold border border-amber-200">
                <Star size={14} fill="currentColor" /> {item.rating}
                {item.user && <span className="text-slate-600 font-medium">- {item.user}</span>}
              </div>
            </div>
            
            {item.note && <p className="text-slate-600 italic mb-3">"{item.note}"</p>}
            
            {item.user && (
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <div className="bg-slate-200 p-1 rounded-full"><User size={12} /></div>
                Reviewed by {item.user}
              </div>
            )}

            <button onClick={() => setDeletingId(item.id)} className="absolute bottom-6 right-6 p-2 text-slate-300 hover:text-red-500 transition-colors">
              <Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>

      {/* Custom Delete Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-white/60 text-center">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Forget this memory?</h3>
            <p className="text-slate-600 mb-6 text-sm">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeletingId(null)} className="flex-1 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200">Keep it</button>
              <button onClick={handleDelete} className="flex-1 py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
