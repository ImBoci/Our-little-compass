"use client";

import { useState } from "react";
import { Heart, MapPin, ArrowLeft } from "lucide-react";

interface Activity {
  id: number;
  name: string;
  location: string | null;
  type: string | null;
  description: string | null;
}

interface StylizedMapProps {
  activities: Activity[];
}

// Simple hash function to generate deterministic positions based on activity name
const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

// Generate deterministic position percentages for Budapest view
const getDeterministicPosition = (activityName: string) => {
  const hash = hashString(activityName);
  const topPercent = 10 + (hash % 70); // 10-80% to avoid edges
  const leftPercent = 10 + ((hash >> 8) % 70); // 10-80% to avoid edges
  return { top: `${topPercent}%`, left: `${leftPercent}%` };
};

export default function StylizedMap({ activities }: StylizedMapProps) {
  const [view, setView] = useState<'country' | 'city'>('country');
  const [hoveredActivity, setHoveredActivity] = useState<Activity | null>(null);

  // Filter activities
  const budapestActivities = activities.filter(activity =>
    activity.location?.toLowerCase().includes('budapest')
  );
  const countrysideActivities = activities.filter(activity =>
    !activity.location?.toLowerCase().includes('budapest')
  );

  // Simplified Hungary outline path (stylized, not geographically accurate)
  const hungaryPath = "M 50 10 C 30 10, 20 20, 15 35 C 10 50, 15 65, 25 75 C 35 85, 45 80, 55 75 C 65 70, 75 65, 80 55 C 85 45, 80 35, 75 25 C 70 15, 60 10, 50 10 Z";

  // Danube River path for Budapest view
  const danubePath = "M 10 45 Q 25 40, 40 50 Q 55 60, 70 55 Q 85 50, 90 45";

  const handleActivityClick = (activity: Activity) => {
    if (activity.location) {
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.location)}`;
      window.open(googleMapsUrl, '_blank');
    }
  };

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-rose-50 to-purple-50 rounded-2xl overflow-hidden shadow-xl">
      {/* Tooltip */}
      {hoveredActivity && (
        <div className="absolute top-2 left-2 bg-slate-800 text-white px-3 py-2 rounded-lg text-sm z-10 shadow-lg">
          {hoveredActivity.name}
        </div>
      )}

      {/* Back Button for City View */}
      {view === 'city' && (
        <button
          onClick={() => setView('country')}
          className="absolute top-4 left-4 z-10 bg-white/80 hover:bg-white/90 text-slate-700 hover:text-slate-900 px-3 py-2 rounded-full shadow-lg transition-all duration-300 flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          <span className="text-sm font-medium">Back to Country</span>
        </button>
      )}

      <svg
        viewBox="0 0 100 90"
        className="w-full h-full"
        style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))' }}
      >
        {view === 'country' ? (
          /* Country View - Hungary */
          <>
            {/* Hungary Shape */}
            <path
              d={hungaryPath}
              fill="rgba(255, 255, 255, 0.4)"
              stroke="#fb7185"
              strokeWidth="0.8"
              className="transition-all duration-300"
            />

            {/* Countryside Markers */}
            {countrysideActivities.map((activity, index) => {
              const hash = hashString(activity.name + index);
              const x = 20 + (hash % 60); // Scatter across Hungary area
              const y = 20 + ((hash >> 8) % 50);

              return (
                <circle
                  key={activity.id}
                  cx={x}
                  cy={y}
                  r="1.5"
                  fill="#a855f7"
                  className="cursor-pointer hover:r-2 transition-all duration-300 opacity-70 hover:opacity-100"
                  onMouseEnter={() => setHoveredActivity(activity)}
                  onMouseLeave={() => setHoveredActivity(null)}
                  onClick={() => handleActivityClick(activity)}
                />
              );
            })}

            {/* Budapest Heart Button */}
            <g
              className="cursor-pointer animate-pulse hover:animate-none"
              onClick={() => setView('city')}
              onMouseEnter={() => setHoveredActivity({ id: -1, name: 'Budapest - Click to explore!', location: null, type: null, description: null })}
              onMouseLeave={() => setHoveredActivity(null)}
            >
              <Heart
                size={20}
                fill="#ec4899"
                className="text-rose-500 hover:text-rose-600 hover:scale-110 transition-all duration-300"
                style={{
                  position: 'absolute',
                  top: '35%',
                  left: '52%',
                  transform: 'translate(-50%, -50%)',
                }}
              />
            </g>
          </>
        ) : (
          /* City View - Budapest */
          <>
            {/* Budapest Rectangle */}
            <rect
              x="5"
              y="10"
              width="90"
              height="70"
              fill="rgba(255, 255, 255, 0.6)"
              stroke="#8b5cf6"
              strokeWidth="1"
              rx="8"
              className="transition-all duration-300"
            />

            {/* Danube River */}
            <path
              d={danubePath}
              stroke="#3b82f6"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              className="opacity-60"
            />

            {/* Activity Pins */}
            {budapestActivities.map((activity) => {
              const position = getDeterministicPosition(activity.name);

              return (
                <g
                  key={activity.id}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredActivity(activity)}
                  onMouseLeave={() => setHoveredActivity(null)}
                  onClick={() => handleActivityClick(activity)}
                  style={{
                    position: 'absolute',
                    top: position.top,
                    left: position.left,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <MapPin
                    size={16}
                    fill="#ec4899"
                    className="text-rose-600 hover:text-rose-700 hover:scale-110 transition-all duration-300"
                  />
                </g>
              );
            })}
          </>
        )}
      </svg>
    </div>
  );
}