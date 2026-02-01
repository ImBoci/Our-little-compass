"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShoppingBasket, Trash2, Check } from "lucide-react";

type ShoppingItem = {
  id: number;
  name: string;
  checked: boolean;
  createdAt: string;
};

export default function ShopPage() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [input, setInput] = useState(\"\");
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const uncheckedCount = useMemo(() => items.filter((item) => !item.checked).length, [items]);

  useEffect(() => {
    const loadItems = async () => {
      try {
        const response = await fetch("/api/shop");
        const data = await response.json();
        setItems(Array.isArray(data) ? data : []);
      } catch {
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadItems();
  }, []);

  const handleAddItem = async () => {
    const value = input.trim();
    if (!value) return;
    setInput(\"\");
    setMessage(null);
    try {
      const response = await fetch("/api/shop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: value }),
      });
      if (!response.ok) {
        setMessage(\"Could not add item.\");
        return;
      }
      const refreshed = await fetch("/api/shop");
      const data = await refreshed.json();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setMessage(\"Could not add item.\");
    }
  };

  const handleToggle = async (item: ShoppingItem) => {
    setItems((prev) =>
      prev.map((entry) => (entry.id === item.id ? { ...entry, checked: !entry.checked } : entry))
    );
    try {
      await fetch("/api/shop", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, checked: !item.checked }),
      });
    } catch {
      setItems((prev) =>
        prev.map((entry) => (entry.id === item.id ? { ...entry, checked: item.checked } : entry))
      );
    }
  };

  const handleDelete = async (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    try {
      await fetch(`/api/shop?id=${id}`, { method: "DELETE" });
    } catch {
      setMessage(\"Could not delete item.\");
    }
  };

  const handleClearCompleted = async () => {
    try {
      await fetch("/api/shop?action=clear_completed", { method: "DELETE" });
      setItems((prev) => prev.filter((item) => !item.checked));
    } catch {
      setMessage(\"Could not clear completed items.\");
    }
  };

  const handleExport = async () => {
    const lines = items.map((item) => `- [${item.checked ? \"x\" : \" \"}] ${item.name}`);
    const text = lines.join(\"\\n\");
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ text });
        return;
      }
      await navigator.clipboard.writeText(text);
      setMessage(\"List copied to clipboard.\");
    } catch {
      setMessage(\"Could not export list.\");
    }
  };

  return (
    <div className="min-h-screen p-4 flex flex-col items-center bg-transparent">
      <div className="w-full max-w-3xl">
        <header className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="flex items-center justify-center p-3 bg-white/30 backdrop-blur-md border border-white/40 rounded-full text-[var(--text-color)] opacity-80 hover:opacity-100 transition-all shadow-sm group"
          >
            <ArrowLeft size={20} className="transition-transform group-hover:-translate-x-1" />
            <span className="hidden md:inline ml-2 pr-1 font-medium">Home</span>
          </Link>
          <h1 className="font-serif text-3xl md:text-4xl text-[var(--text-color)] font-bold text-center flex-1">
            Shopping List
          </h1>
          <div className="w-[52px] md:w-[88px]" />
        </header>

        <div className="bg-emerald-50/70 dark:bg-emerald-900/30 backdrop-blur-xl border border-emerald-200/60 dark:border-emerald-400/30 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-emerald-100/80 text-emerald-600 flex items-center justify-center">
              <ShoppingBasket size={20} />
            </div>
            <div>
              <h2 className="font-serif text-xl text-[var(--text-color)] font-bold">Fresh Picks</h2>
              <p className="text-sm text-[var(--text-color)]/70">
                {uncheckedCount} items left to grab.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Add an ingredient..."
              className="flex-1 bg-white/70 dark:bg-slate-900/40 border border-emerald-200/60 dark:border-emerald-400/30 rounded-2xl px-4 py-3 text-[var(--text-color)] placeholder:text-emerald-400/70 focus:outline-none focus:ring-2 focus:ring-emerald-300"
            />
            <button
              onClick={handleAddItem}
              className="px-6 py-3 rounded-2xl bg-emerald-500 text-white font-semibold shadow-md hover:bg-emerald-600 transition-all"
            >
              Add
            </button>
          </div>

          {message && <p className="text-sm text-[var(--text-color)]/70 mb-4">{message}</p>}

          <div className="space-y-3">
            {isLoading ? (
              <p className="text-sm text-[var(--text-color)]/70">Loading list...</p>
            ) : items.length === 0 ? (
              <p className="text-sm text-[var(--text-color)]/70">No items yet. Add your first ingredient!</p>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 bg-white/60 dark:bg-slate-900/30 border border-white/50 rounded-2xl px-4 py-3"
                >
                  <button
                    onClick={() => handleToggle(item)}
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                      item.checked
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "border-emerald-300 text-emerald-400"
                    }`}
                    aria-label=\"Toggle item\"
                  >
                    {item.checked && <Check size={16} />}
                  </button>
                  <span
                    className={`flex-1 text-[var(--text-color)] ${
                      item.checked ? "line-through text-[var(--text-color)]/60" : ""
                    }`}
                  >
                    {item.name}
                  </span>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 rounded-full text-emerald-500 hover:text-emerald-600 hover:bg-emerald-100/60 transition-all"
                    aria-label=\"Delete item\"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-between">
            <button
              onClick={handleClearCompleted}
              className="px-4 py-2 rounded-full border border-emerald-300/60 text-emerald-600 font-semibold hover:bg-emerald-100/60 transition-all"
            >
              Clear Completed
            </button>
            <button
              onClick={handleExport}
              className="px-5 py-2 rounded-full bg-emerald-500 text-white font-semibold shadow-md hover:bg-emerald-600 transition-all"
            >
              Export to Apple Reminders
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
