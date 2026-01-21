'use client'

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Loader2, Sparkles, ArrowLeft, MapPin } from "lucide-react";
import { toast } from "sonner";

interface Activity {
  id: number
  name: string
  location: string | null
  type: string | null
  description: string | null
}

export default function DatePage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [randomActivity, setRandomActivity] = useState<Activity | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load activities on component mount
  useEffect(() => {
    const loadActivities = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/activities');
        if (response.ok) {
          const activitiesData = await response.json();
          setActivities(activitiesData);
          // Pick initial random activity
          if (activitiesData.length > 0) {
            const randomIndex = Math.floor(Math.random() * activitiesData.length);
            setRandomActivity(activitiesData[randomIndex]);
          }
        } else {
          toast.error("Failed to load activities");
        }
      } catch (error) {
        console.error('Failed to load activities:', error);
        toast.error("Failed to load activities");
      } finally {
        setIsLoading(false);
      }
    };
    loadActivities();
  }, []);

  const pickRandomActivity = () => {
    if (activities.length === 0) {
      toast.error("No activities available. Add some activities first!");
      return;
    }

    setIsSpinning(true);

    // Simulate spinning animation
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * activities.length);
      const selectedActivity = activities[randomIndex];
      setRandomActivity(selectedActivity);
      setIsSpinning(false);
      toast.success(`Your activity: ${selectedActivity.name}!`);
    }, 1500);
  };

  const handleAddActivity = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      location: formData.get('location') as string,
      type: formData.get('type') as string,
      description: formData.get('description') as string
    };

    if (!data.name.trim()) {
      toast.error("Activity name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const newActivity = await response.json();
        setActivities(prev => [newActivity, ...prev]);
        setShowAddForm(false);
        toast.success("Activity added successfully!");
        e.currentTarget.reset();
      } else {
        toast.error("Failed to add activity");
      }
    } catch (error) {
      console.error('Error adding activity:', error);
      toast.error("Failed to add activity");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-white/90 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold text-foreground">WhatToDo</h1>
            </div>
          </div>
          <Link href="/manage">
            <Button variant="outline" size="sm" className="gap-2">
              <Sparkles className="w-4 h-4" />
              Manage Activities
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            What should we do?
          </h2>
          <p className="text-lg text-muted-foreground mb-12">
            Can't decide on an activity? Let fate decide for you!
          </p>

          {/* Activity Display */}
          {randomActivity && (
            <Card className="mb-8 mx-auto max-w-md bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-fit">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">{randomActivity.name}</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-3">
                {randomActivity.type && (
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    {randomActivity.type}
                  </Badge>
                )}
                {randomActivity.location && (
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{randomActivity.location}</span>
                  </div>
                )}
                {randomActivity.description && (
                  <CardDescription className="text-base">
                    {randomActivity.description}
                  </CardDescription>
                )}
              </CardContent>
            </Card>
          )}

          {/* Spin Button */}
          <Button
            size="lg"
            onClick={pickRandomActivity}
            disabled={isSpinning || activities.length === 0}
            className="gap-2 text-lg px-8 py-6 mb-8"
          >
            {isSpinning ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Finding activity...
              </>
            ) : (
              <>
                <Heart className="w-5 h-5" />
                Pick Random Activity
              </>
            )}
          </Button>

          {/* Add Activity Toggle */}
          <div className="mb-8">
            <Button
              variant="outline"
              onClick={() => setShowAddForm(!showAddForm)}
              className="gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {showAddForm ? 'Hide Add Form' : 'Add New Activity'}
            </Button>
          </div>

          {/* Add Activity Form */}
          {showAddForm && (
            <Card className="mx-auto max-w-md bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Add New Activity</CardTitle>
                <CardDescription>
                  Add activities to expand your random selection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddActivity} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Activity Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="e.g., Go for a walk"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location (Optional)</Label>
                    <Input
                      id="location"
                      name="location"
                      placeholder="e.g., Central Park, Budapest"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Type (Optional)</Label>
                    <Input
                      id="type"
                      name="type"
                      placeholder="e.g., Outdoor activity, Restaurant"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Add more details about this activity..."
                      rows={3}
                    />
                  </div>
                  <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Adding...
                      </>
                    ) : (
                      'Add Activity'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          <p className="mt-8 text-sm text-muted-foreground">
            {activities.length} activit{activities.length !== 1 ? "ies" : "y"} in the database
          </p>
        </div>
      </main>
    </div>
  );
}