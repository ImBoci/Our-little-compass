"use client";
import { useState, useEffect } from "react";
import { ArrowLeft, Trash2, Calendar, Star, User, Camera, RotateCcw } from "lucide-react";
import Link from "next/link";

export default function MemoriesPage() {
  const [activeTab, setActiveTab] = useState<'Food' | 'Activity'>('Food');
  const [memories, setMemories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [flippedId, setFlippedId] = useState<number | null>(null);

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

      {/* List */}
      <div className="w-full max-w-2xl grid grid-cols-1 gap-6 pb-20">
        {filtered.length === 0 ? (
          <div className="text-center text-slate-500 italic py-16 bg-white/20 backdrop-blur-sm rounded-3xl border-2 border-dashed border-white/40">
            {activeTab === 'Food' ? "No meals saved yet. Go eat something delicious! 🍔" : "No adventures yet. Go do something fun! 🎈"}
          </div>
        ) : (
          filtered.map(item => (
            <div key={item.id} className="relative w-full min-h-[220px] perspective-1000 group">
              <div 
                className={`relative w-full h-full transition-all duration-700 transform-style-3d ${flippedId === item.id ? 'rotate-y-180' : ''}`}
              >
                {/* FRONT FACE */}
                <div 
                  onClick={() => item.image_url && setFlippedId(item.id)}
                  className={`absolute inset-0 backface-hidden bg-white/60 backdrop-blur-md border border-white/60 p-6 rounded-3xl shadow-sm flex flex-col justify-between transition-all ${item.image_url ? 'cursor-pointer hover:bg-white/80' : 'cursor-default'} ${flippedId === item.id ? 'z-0' : 'z-10'}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                        <Calendar size={12} /> {new Date(item.date).toLocaleDateString()}
                        {item.image_url && <Camera size={14} className="text-rose-400 animate-pulse" />}
                      </div>
                      <h3 className="font-serif text-2xl text-slate-800 font-bold">{item.name}</h3>
                    </div>
                    <div className="flex items-center gap-1 bg-amber-100/80 text-amber-600 px-3 py-1 rounded-full text-sm font-bold border border-amber-200">
                      <Star size={14} fill="currentColor" /> {item.rating}
                    </div>
                  </div>
                  
                  <p className="text-slate-600 italic flex-1 mt-2">"{item.note || 'No notes added'}"</p>
                  
                  <div className="flex justify-between items-end mt-4">
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium bg-white/40 px-3 py-1.5 rounded-full">
                      <User size={12} /> {item.user || "Anonymous"}
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setDeletingId(item.id); }} 
                      className="p-2 text-slate-300 hover:text-red-500 transition-colors pointer-events-auto z-50"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>

                {/* BACK FACE (Image) */}
                <div className={`absolute inset-0 backface-hidden rotate-y-180 rounded-3xl border-2 border-white/40 shadow-xl overflow-hidden bg-black ${flippedId === item.id ? 'z-10' : 'z-0'}`}>
                  {item.image_url && (
                    <>
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                      <button 
                        onClick={() => setFlippedId(null)}
                        className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full backdrop-blur-md hover:bg-black/70"
                      >
                        <RotateCcw size={20} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-white/60 text-center">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Forget this memory?</h3>
            <p className="text-slate-600 mb-6 text-sm text-balance">Once it's gone, it's gone. Are you sure?</p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setDeletingId(null)} className="flex-1 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">Keep it</button>
              <button onClick={handleDelete} className="flex-1 py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg active:scale-95 transition-all">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
