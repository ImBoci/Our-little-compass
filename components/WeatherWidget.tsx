"use client";
import { useEffect, useMemo, useState } from "react";
import { Cloud, CloudRain, Sun } from "lucide-react";

const WEATHER_URL =
  "https://api.open-meteo.com/v1/forecast?latitude=47.4979&longitude=19.0402&current=temperature_2m,weather_code&daily=precipitation_probability_max&timezone=auto";

type WeatherState = {
  temperature: number | null;
  weatherCode: number | null;
  rainChance: number | null;
};

export default function WeatherWidget() {
  const [state, setState] = useState<WeatherState>({
    temperature: null,
    weatherCode: null,
    rainChance: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        setError(false);
        const response = await fetch(WEATHER_URL);
        if (!response.ok) {
          throw new Error("Failed to fetch weather");
        }
        const data = await response.json();
        const temp = data?.current?.temperature_2m;
        const code = data?.current?.weather_code;
        const rain = data?.daily?.precipitation_probability_max?.[0];

        setState({
          temperature: typeof temp === "number" ? temp : null,
          weatherCode: typeof code === "number" ? code : null,
          rainChance: typeof rain === "number" ? rain : null,
        });
      } catch (err) {
        console.error("Failed to load weather:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  const Icon = useMemo(() => {
    const code = state.weatherCode;
    if (typeof code !== "number") return Cloud;
    if ((code >= 51 && code <= 99) || code === 45 || code === 48) return CloudRain;
    if (code <= 2) return Sun;
    return Cloud;
  }, [state.weatherCode]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 dark:bg-white/20 backdrop-blur-sm border border-white/40 text-[var(--text-color)] text-xs sm:text-sm animate-pulse">
        Loading weather...
      </div>
    );
  }

  if (error || state.temperature === null) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 dark:bg-white/20 backdrop-blur-sm border border-white/40 text-[var(--text-color)] text-xs sm:text-sm">
        Weather unavailable
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 dark:bg-white/20 backdrop-blur-sm border border-white/40 text-[var(--text-color)] text-xs sm:text-sm shadow-sm whitespace-nowrap">
      <Icon size={16} className="text-rose-400 dark:text-white" />
      <span className="font-semibold">{Math.round(state.temperature)}°C</span>
      <span className="opacity-70">|</span>
      <span>{state.rainChance ?? 0}%</span>
    </div>
  );
}
