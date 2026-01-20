import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UtensilsCrossed, Heart, Dices } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Title */}
          <h1 className="text-6xl md:text-7xl font-bold text-foreground mb-6">
            Our Little Compass
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-16">
            Guiding our adventures, together.
          </p>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Find a Meal Card */}
            <Link href="/cook" className="block">
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary/20 bg-white/80 backdrop-blur-sm">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-fit">
                    <Dices className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">WhatToCook</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-lg">
                    Can't decide? Let us pick for you.
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>

            {/* WhatToDo Card */}
            <Link href="/date" className="block">
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary/20 bg-white/80 backdrop-blur-sm">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-fit">
                    <Heart className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">WhatToDo</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-lg">
                    Bored? Let's find a random activity.
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}