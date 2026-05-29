"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, ArrowLeft, Heart } from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to register");
      }

      // Automatically sign in
      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        setError("Account created, but failed to log in automatically.");
      } else {
        router.push("/onboarding");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
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
          <div className="p-4 rounded-full bg-gradient-to-br from-purple-100 to-rose-100 shadow-inner border border-white/50">
            <UserPlus size={32} className="text-purple-500" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl font-bold text-slate-800 mb-2">Create Account</h1>
          <p className="text-slate-600 text-sm">Join Our Little Compass to start sharing adventures.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/50 border-2 rounded-full px-6 py-4 outline-none focus:ring-2 focus:ring-purple-300 transition-all text-slate-800 placeholder:text-slate-400 border-white/60 focus:border-purple-300"
              placeholder="Your Name (Optional)"
            />
          </div>
          <div className="space-y-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/50 border-2 rounded-full px-6 py-4 outline-none focus:ring-2 focus:ring-purple-300 transition-all text-slate-800 placeholder:text-slate-400 border-white/60 focus:border-purple-300"
              placeholder="Email Address"
              required
            />
          </div>
          <div className="space-y-2">
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full bg-white/50 border-2 rounded-full px-6 py-4 outline-none focus:ring-2 focus:ring-purple-300 transition-all text-slate-800 placeholder:text-slate-400 ${error ? 'border-red-400 focus:border-red-400' : 'border-white/60 focus:border-purple-300'}`}
                placeholder="Password"
                required
              />
              <Heart className="absolute right-5 top-1/2 -translate-y-1/2 text-purple-300/50 pointer-events-none" size={20} fill="currentColor" />
            </div>
          </div>
          
          {error && (
            <p className="text-red-500 text-sm text-center font-medium animate-pulse">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-gradient-to-r from-purple-400 to-rose-500 text-white font-bold py-4 rounded-full shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Sign Up"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-purple-600 hover:text-purple-700 underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
