'use client'

import React from 'react'

export function RomanticBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-purple-50 to-blue-50 animate-gradient-shift" />

      {/* Floating Elements */}
      <div className="absolute inset-0">
        {/* Floating Hearts/Shapes */}
        <div className="absolute top-1/4 left-1/4 animate-float-slow">
          <div className="w-8 h-8 bg-rose-200 rounded-full opacity-20 blur-sm" />
        </div>
        <div className="absolute top-1/3 right-1/4 animate-float-medium">
          <div className="w-6 h-6 bg-pink-200 rounded-full opacity-15 blur-sm" />
        </div>
        <div className="absolute bottom-1/4 left-1/3 animate-float-fast">
          <div className="w-4 h-4 bg-purple-200 rounded-full opacity-25 blur-sm" />
        </div>
        <div className="absolute top-2/3 right-1/3 animate-float-slow">
          <div className="w-5 h-5 bg-blue-200 rounded-full opacity-20 blur-sm" />
        </div>
        <div className="absolute bottom-1/3 right-1/6 animate-float-medium">
          <div className="w-7 h-7 bg-indigo-200 rounded-full opacity-15 blur-sm" />
        </div>
        <div className="absolute top-1/6 left-3/4 animate-float-slow">
          <div className="w-6 h-6 bg-rose-300 rounded-full opacity-18 blur-sm" />
        </div>
        <div className="absolute bottom-2/3 left-1/5 animate-float-fast">
          <div className="w-5 h-5 bg-pink-300 rounded-full opacity-22 blur-sm" />
        </div>
        <div className="absolute top-3/5 right-2/3 animate-float-medium">
          <div className="w-4 h-4 bg-purple-300 rounded-full opacity-20 blur-sm" />
        </div>
        <div className="absolute bottom-1/6 right-1/4 animate-float-slow">
          <div className="w-7 h-7 bg-blue-300 rounded-full opacity-16 blur-sm" />
        </div>
        <div className="absolute top-4/5 left-1/2 animate-float-fast">
          <div className="w-3 h-3 bg-indigo-300 rounded-full opacity-25 blur-sm" />
        </div>

        {/* Floating Sparkles */}
        <div className="absolute top-1/6 left-1/2 animate-pulse-slow">
          <div className="w-3 h-3 bg-yellow-200 rounded-full opacity-30" />
        </div>
        <div className="absolute top-3/4 right-1/2 animate-pulse-medium">
          <div className="w-2 h-2 bg-orange-200 rounded-full opacity-25" />
        </div>
        <div className="absolute bottom-1/6 left-2/3 animate-pulse-fast">
          <div className="w-4 h-4 bg-cyan-200 rounded-full opacity-20" />
        </div>
        <div className="absolute top-2/5 right-1/6 animate-pulse-slow">
          <div className="w-2 h-2 bg-pink-300 rounded-full opacity-35" />
        </div>
        <div className="absolute bottom-3/5 left-3/5 animate-pulse-medium">
          <div className="w-3 h-3 bg-purple-300 rounded-full opacity-28" />
        </div>

        {/* Soft Blurred Orbs */}
        <div className="absolute top-1/2 left-1/6 animate-fade-in-out">
          <div className="w-12 h-12 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full opacity-10 blur-lg" />
        </div>
        <div className="absolute top-1/5 right-1/5 animate-fade-in-out-reverse">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full opacity-12 blur-lg" />
        </div>
        <div className="absolute bottom-1/5 left-1/5 animate-fade-in-out">
          <div className="w-8 h-8 bg-gradient-to-r from-rose-100 to-pink-100 rounded-full opacity-15 blur-lg" />
        </div>
        <div className="absolute top-3/4 right-3/4 animate-fade-in-out-reverse">
          <div className="w-14 h-14 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full opacity-8 blur-lg" />
        </div>
        <div className="absolute bottom-2/5 right-2/5 animate-fade-in-out">
          <div className="w-9 h-9 bg-gradient-to-r from-pink-100 to-rose-100 rounded-full opacity-12 blur-lg" />
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes float-medium {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(180deg); }
        }
        @keyframes float-fast {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-25px) rotate(180deg); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.1); }
        }
        @keyframes pulse-medium {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.05); }
        }
        @keyframes pulse-fast {
          0%, 100% { opacity: 0.25; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.2); }
        }
        @keyframes fade-in-out {
          0%, 100% { opacity: 0.05; }
          50% { opacity: 0.15; }
        }
        @keyframes fade-in-out-reverse {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.05; }
        }

        .animate-gradient-shift {
          background-size: 400% 400%;
          animation: gradient-shift 15s ease infinite;
        }
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
        .animate-float-medium {
          animation: float-medium 6s ease-in-out infinite;
        }
        .animate-float-fast {
          animation: float-fast 4s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 5s ease-in-out infinite;
        }
        .animate-pulse-medium {
          animation: pulse-medium 4s ease-in-out infinite;
        }
        .animate-pulse-fast {
          animation: pulse-fast 3s ease-in-out infinite;
        }
        .animate-fade-in-out {
          animation: fade-in-out 7s ease-in-out infinite;
        }
        .animate-fade-in-out-reverse {
          animation: fade-in-out-reverse 9s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}