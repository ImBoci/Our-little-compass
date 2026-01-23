"use client";

import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";
import StylizedMap from "@/components/StylizedMap";

export default function MapPage() {

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-transparent">
      <Link
        href="/date"
        className="absolute top-8 left-8 text-slate-600 hover:text-purple-600 transition flex items-center gap-2 font-medium"
      >
        <ArrowLeft size={20} /> Back to Activities
      </Link>

      <div className="mb-8 text-center">
        <div className="inline-block p-4 rounded-full bg-purple-100/80 text-purple-600 mb-4 shadow-lg">
          <MapPin size={48} />
        </div>
        <h1 className="font-serif text-4xl text-slate-800 font-bold drop-shadow-sm">
          Activity Map
        </h1>
        <p className="font-sans text-lg text-slate-600 mt-2">
          Explore all your favorite spots in Hungary
        </p>
      </div>

      {/* Glass Card */}
      <div
        className="w-full max-w-4xl p-8 rounded-3xl border-2 border-white/40 text-center relative transition-all duration-500 mb-8"
        style={{
          background: "rgba(255, 255, 255, 0.25)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          boxShadow: "0 0 40px rgba(168, 85, 247, 0.2)"
        }}
      >
        <StylizedMap />
      </div>
    </div>
  );
}