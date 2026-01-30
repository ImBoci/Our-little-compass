"use client";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import WeatherWidget from "@/components/WeatherWidget";

type Memory = {
  id: number;
  name: string;
  type: string;
  rating: number;
  note: string | null;
  date: string;
};

export default function MemoriesPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMemories = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/memories");
      if (!res.ok) {
        throw new Error("Failed to fetch memories");
      }
      const data = await res.json();
      setMemories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load memories:", err);
      setError("Failed to load memories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemories();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this memory?")) return;
    const res = await fetch(`/api/memories?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setMemories(prev => prev.filter(memory => memory.id !== id));
      return;
    }
    setError("Failed to delete memory");
  };

  const cards = useMemo(() => {
    return memories.map(memory => ({
      ...memory,
      displayDate: new Date(memory.date).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      stars: "⭐".repeat(Math.max(0, Math.min(5, memory.rating))),
    }));
  }, [memories]);

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center bg-transparent">
      <div className="w-full max-w-5xl flex flex-col gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/30 backdrop-blur-md border border-white/40 rounded-full text-slate-700 font-medium shadow-sm hover:bg-white/60 hover:scale-105 hover:shadow-md transition-all duration-300 group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span>Back Home</span>
          </Link>
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-serif font-bold text-slate-800">Our Memories</h1>
            <p className="text-slate-600">A timeline of our sweetest adventures.</p>
          </div>
          <div className="flex justify-center md:justify-end">
            <WeatherWidget />
          </div>
        </div>

        {loading && (
          <div className="text-center text-slate-600 animate-pulse">Loading memories...</div>
        )}

        {error && (
          <div className="text-center text-rose-600 font-medium">{error}</div>
        )}

        {!loading && memories.length === 0 && (
          <div className="text-center text-slate-500 py-16 bg-white/20 border border-white/40 rounded-3xl backdrop-blur-md">
            No memories yet. Go have an adventure!
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cards.map(memory => (
            <div
              key={memory.id}
              className="bg-white/30 backdrop-blur-xl border border-white/50 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all hover:scale-[1.01]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500">{memory.displayDate}</p>
                  <h3 className="text-2xl font-serif font-bold text-slate-800">{memory.name}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs px-3 py-1 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                      {memory.type}
                    </span>
                    <span className="text-sm">{memory.stars}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(memory.id)}
                  className="p-2 rounded-full bg-white/60 border border-white/60 text-rose-500 hover:text-rose-700 hover:bg-white transition-all"
                  aria-label="Delete memory"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              {memory.note && (
                <p className="mt-4 text-slate-700 italic">"{memory.note}"</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
