import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Dices, Sparkles } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <main className="w-full max-w-4xl mx-auto text-center">
        {/* Title */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-rose-800 mb-6 tracking-tight">
          Our Little Compass
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-gray-700 mb-16 font-light">
          Guiding our adventures, together.
        </p>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Find a Meal Card */}
          <Link href="/cook" className="block group">
            <Card className="h-full transition-all duration-300 cursor-pointer border-white/50 bg-white/30 backdrop-blur-md shadow-xl hover:shadow-2xl hover:scale-105 hover:bg-white/40">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-4 bg-rose-100/60 rounded-full w-fit group-hover:bg-rose-200/60 transition-colors">
                  <Dices className="w-8 h-8 text-rose-600" />
                </div>
                <CardTitle className="text-2xl text-gray-800">WhatToCook</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-lg text-gray-600">
                  Can't decide? Let us pick for you.
                </CardDescription>
              </CardContent>
            </Card>
          </Link>

          {/* WhatToDo Card */}
          <Link href="/date" className="block group">
            <Card className="h-full transition-all duration-300 cursor-pointer border-white/50 bg-white/30 backdrop-blur-md shadow-xl hover:shadow-2xl hover:scale-105 hover:bg-white/40">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-4 bg-purple-100/60 rounded-full w-fit group-hover:bg-purple-200/60 transition-colors">
                  <Heart className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle className="text-2xl text-gray-800">WhatToDo</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-lg text-gray-600">
                  Bored? Let's find a random activity.
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Romantic Touch */}
        <div className="mt-16 flex justify-center">
          <div className="flex items-center gap-2 text-gray-500">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm italic">Made with love</span>
            <Sparkles className="w-4 h-4" />
          </div>
        </div>
      </main>
    </div>
  );
}