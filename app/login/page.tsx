"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LockKeyhole, ArrowLeft, Heart } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    const result = await signIn("credentials", {
      password,
      redirect: false,
    });

    if (result?.error) {
      setError(true);
      setLoading(false);
    } else {
      router.push("/manage");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-transparent">
      {/* Back Button */}
      <Link 
        href="/" 
        className="absolute top-8 left-8 flex items-center gap-2 px-5 py-2.5 bg-white/30 backdrop-blur-md border border-white/40 rounded-full text-slate-700 font-medium shadow-sm hover:bg-white/60 hover:scale-105 hover:shadow-md transition-all duration-300 group"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        <span>Back Home</span>
      </Link>

      {/* Glass Card */}
      <div className="w-full max-w-md bg-white/30 backdrop-blur-xl border-2 border-white/50 p-8 rounded-3xl shadow-2xl animate-in fade-in zoom-in duration-500">
        
        {/* Header Icon */}
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-full bg-gradient-to-br from-rose-100 to-purple-100 shadow-inner border border-white/50">
            <LockKeyhole size={32} className="text-rose-500" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl font-bold text-slate-800 mb-2">Admin Access</h1>
          <p className="text-slate-600 text-sm">Enter the secret password to manage our adventures.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full bg-white/50 border-2 rounded-full px-6 py-4 outline-none focus:ring-2 focus:ring-rose-300 transition-all text-slate-800 placeholder:text-slate-400 ${error ? 'border-red-400 focus:border-red-400' : 'border-white/60 focus:border-rose-300'}`}
                  placeholder="Secret Password"
                  required
                />
                {/* Decorative Heart inside input */}
                <Heart className="absolute right-5 top-1/2 -translate-y-1/2 text-rose-300/50 pointer-events-none" size={20} fill="currentColor" />
            </div>
            {error && (
              <p className="text-red-500 text-sm text-center font-medium animate-pulse">
                Incorrect password. Try again!
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-rose-400 to-purple-500 text-white font-bold py-4 rounded-full shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Unlocking..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
