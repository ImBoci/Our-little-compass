'use client'

import { useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getRandomActivity, addActivity, Activity, ActivityInsert } from "@/app/actions";
import { Heart, Loader2, Sparkles, ArrowLeft, MapPin } from "lucide-react";
import { toast } from "sonner";
import { useEffect } from "react";

export default function DatePage() {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<ActivityInsert>({
    name: '',
    location: '',
    type: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSpin = () => {
    setIsSpinning(true);
  };

  const handleSpinComplete = useCallback(async () => {
    try {
      const activity = await getRandomActivity();
      if (activity) {
        setSelectedActivity(activity);
        toast.success(`Your activity: ${activity.name}!`);
      } else {
        toast.error("No activities available. Add some activities first!");
      }
    } catch (error) {
      toast.error("Failed to get random activity");
    } finally {
      setIsSpinning(false);
    }
  }, []);

  useEffect(() => {
    if (isSpinning) {
      // Simulate spinning animation
      const timer = setTimeout(() => {
        handleSpinComplete();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isSpinning, handleSpinComplete]);

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Activity name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      await addActivity(formData);
      toast.success("Activity added successfully!");
      setFormData({ name: '', location: '', type: '', description: '' });
      setShowAddForm(false);
    } catch (error) {
      toast.error("Failed to add activity");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
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
          {selectedActivity && (
            <Card className="mb-8 mx-auto max-w-md">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-fit">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">{selectedActivity.name}</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-3">
                {selectedActivity.type && (
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    {selectedActivity.type}
                  </Badge>
                )}
                {selectedActivity.location && (
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{selectedActivity.location}</span>
                  </div>
                )}
                {selectedActivity.description && (
                  <CardDescription className="text-base">
                    {selectedActivity.description}
                  </CardDescription>
                )}
              </CardContent>
            </Card>
          )}

          {/* Spin Button */}
          <Button
            size="lg"
            onClick={handleSpin}
            disabled={isSpinning}
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
                Find Random Activity
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
            <Card className="mx-auto max-w-md">
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
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Go for a walk"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location (Optional)</Label>
                    <Input
                      id="location"
                      value={formData.location || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="e.g., Central Park, Budapest"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Type (Optional)</Label>
                    <Input
                      id="type"
                      value={formData.type || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                      placeholder="e.g., Outdoor activity, Restaurant"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      value={formData.description || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
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
        </div>
      </main>
    </div>
  );
}