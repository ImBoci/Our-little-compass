"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { LatLngTuple } from "leaflet";

// Fix default marker icon issue with webpack
import L from "leaflet";
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface Activity {
  id: number;
  name: string;
  location: string | null;
  type: string | null;
  description: string | null;
}

interface MapComponentProps {
  activities: Activity[];
}

interface GeocodedActivity extends Activity {
  lat?: number;
  lng?: number;
}

export default function MapComponent({ activities }: MapComponentProps) {
  const [geocodedActivities, setGeocodedActivities] = useState<GeocodedActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const geocodeActivities = async () => {
      const geocoded: GeocodedActivity[] = [];

      for (const activity of activities) {
        if (activity.location) {
          try {
            // Add delay to avoid API rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));

            const response = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(activity.location)}&limit=1`
            );

            if (response.ok) {
              const data = await response.json();
              if (data && data.length > 0) {
                geocoded.push({
                  ...activity,
                  lat: parseFloat(data[0].lat),
                  lng: parseFloat(data[0].lon),
                });
              } else {
                // Keep activity without coordinates if geocoding fails
                geocoded.push(activity);
              }
            } else {
              geocoded.push(activity);
            }
          } catch (error) {
            console.error(`Failed to geocode ${activity.location}:`, error);
            geocoded.push(activity);
          }
        } else {
          geocoded.push(activity);
        }
      }

      setGeocodedActivities(geocoded);
      setLoading(false);
    };

    if (activities.length > 0) {
      geocodeActivities();
    } else {
      setLoading(false);
    }
  }, [activities]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-slate-600 animate-pulse">Loading map...</div>
      </div>
    );
  }

  // Center on Hungary
  const hungaryCenter: LatLngTuple = [47.1625, 19.5033];

  return (
    <div className="h-96 w-full rounded-2xl overflow-hidden shadow-xl">
      <MapContainer
        center={hungaryCenter}
        zoom={7}
        style={{ height: "100%", width: "100%" }}
        className="z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {geocodedActivities.map((activity) => {
          if (activity.lat && activity.lng) {
            return (
              <Marker
                key={activity.id}
                position={[activity.lat, activity.lng]}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-bold text-slate-800">{activity.name}</h3>
                    {activity.type && (
                      <p className="text-sm text-purple-600">{activity.type}</p>
                    )}
                    {activity.location && (
                      <p className="text-sm text-slate-600">{activity.location}</p>
                    )}
                    {activity.description && (
                      <p className="text-sm text-slate-500 italic mt-1">
                        {activity.description}
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          }
          return null;
        })}
      </MapContainer>
    </div>
  );
}