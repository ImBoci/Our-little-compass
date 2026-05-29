"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LockKeyhole, ArrowLeft, Heart, Eye, EyeOff, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError(true);
      setLoading(false);
    } else {
      router.push("/onboarding");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-transparent">
      {/* Back Button */}
      <Link 
        href="/" 
        className="absolute top-8 left-8 flex items-center gap-2 px-5 py-2.5 bg-white/30 dark:bg-slate-800/40 backdrop-blur-md border border-white/40 dark:border-slate-600 rounded-full text-slate-700 dark:text-slate-200 font-medium shadow-sm hover:bg-white/60 dark:hover:bg-slate-700/60 hover:scale-105 hover:shadow-md transition-all duration-300 group z-50"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        <span>Back Home</span>
      </Link>

      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="absolute top-8 right-8 flex items-center justify-center p-3 bg-white/30 dark:bg-slate-800/40 backdrop-blur-md border border-white/40 dark:border-slate-600 rounded-full text-slate-700 dark:text-slate-200 shadow-sm hover:bg-white/60 dark:hover:bg-slate-700/60 hover:scale-110 transition-all duration-300 z-50"
      >
        {theme === "day" ? <Moon size={20} className="text-slate-700" /> : <Sun size={20} className="text-amber-300" />}
      </button>

      {/* Glass Card */}
      <div className="w-full max-w-md bg-white/30 dark:bg-slate-900/40 backdrop-blur-xl border-2 border-white/50 dark:border-slate-700/50 p-8 rounded-3xl shadow-2xl animate-in fade-in zoom-in duration-500">
        
        {/* Header Icon */}
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-full bg-gradient-to-br from-rose-100 to-purple-100 shadow-inner border border-white/50">
            <LockKeyhole size={32} className="text-rose-500" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">Welcome Back</h1>
          <p className="text-slate-600 dark:text-slate-300 text-sm">Sign in to manage your adventures.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/50 dark:bg-slate-800/50 border-2 rounded-full px-6 py-4 outline-none focus:ring-2 focus:ring-rose-300 transition-all text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border-white/60 dark:border-slate-600 focus:border-rose-300 dark:focus:border-rose-400"
                placeholder="Email Address"
                required
              />
          </div>

          <div className="space-y-2">
            <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full bg-white/50 dark:bg-slate-800/50 border-2 rounded-full px-6 py-4 outline-none focus:ring-2 focus:ring-rose-300 transition-all text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 pr-12 ${error ? 'border-red-400 focus:border-red-400' : 'border-white/60 dark:border-slate-600 focus:border-rose-300 dark:focus:border-rose-400'}`}
                  placeholder="Password"
                  required
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-rose-400 hover:text-rose-600 focus:outline-none transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </div>
            {error && (
              <p className="text-red-500 text-sm text-center font-medium animate-pulse">
                Incorrect email or password.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-gradient-to-r from-rose-400 to-purple-500 text-white font-bold py-4 rounded-full shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600 dark:text-rose-100/90 transition-colors">
          Don't have an account?{" "}
          <Link href="/register" className="font-bold text-rose-600 dark:text-rose-300 hover:text-rose-700 dark:hover:text-white underline transition-colors">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
