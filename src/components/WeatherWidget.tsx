import React, { useState } from 'react';
import { Sun, CloudSun, Cloud, CloudRain, CloudLightning, Snowflake, Wind, Droplets, Shirt } from 'lucide-react';
import { WeatherDay } from '../types';

interface WeatherWidgetProps {
  forecast?: WeatherDay[];
  destination: string;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ forecast, destination }) => {
  const [unit, setUnit] = useState<'C' | 'F'>('C');

  if (!forecast || forecast.length === 0) return null;

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'sun':
        return <Sun className="w-6 h-6 text-amber-500 animate-spin-slow" />;
      case 'cloud-sun':
        return <CloudSun className="w-6 h-6 text-amber-400" />;
      case 'cloud':
        return <Cloud className="w-6 h-6 text-slate-400" />;
      case 'rain':
        return <CloudRain className="w-6 h-6 text-blue-400" />;
      case 'thunder':
        return <CloudLightning className="w-6 h-6 text-purple-400" />;
      case 'snow':
        return <Snowflake className="w-6 h-6 text-cyan-300" />;
      default:
        return <Sun className="w-6 h-6 text-amber-500" />;
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-md mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sun className="w-5 h-5 text-amber-500" />
          <h3 className="text-base font-bold text-zinc-900 dark:text-white">
            Weather Forecast for {destination}
          </h3>
        </div>

        {/* C/F Unit Toggle */}
        <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setUnit('C')}
            className={`px-2 py-1 rounded-md transition-all ${
              unit === 'C'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            °C
          </button>
          <button
            onClick={() => setUnit('F')}
            className={`px-2 py-1 rounded-md transition-all ${
              unit === 'F'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            °F
          </button>
        </div>
      </div>

      {/* Weather Forecast Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-4">
        {forecast.map((day, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 flex flex-col items-center text-center transition-all hover:border-amber-400 dark:hover:border-amber-500"
          >
            <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1">{day.dayName}</span>
            <span className="text-[10px] text-zinc-400 mb-2">{day.date}</span>
            <div className="my-1">{renderIcon(day.icon)}</div>
            <span className="text-base font-extrabold text-zinc-900 dark:text-white mt-1">
              {unit === 'C' ? `${day.tempC}°C` : `${day.tempF}°F`}
            </span>
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mt-0.5 truncate w-full">
              {day.condition}
            </span>

            <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-400 mt-2 pt-2 border-t border-zinc-200 dark:border-zinc-700 w-full">
              <span className="flex items-center gap-0.5">
                <Droplets className="w-2.5 h-2.5 text-blue-400" /> {day.humidity}%
              </span>
              <span className="flex items-center gap-0.5">
                <Wind className="w-2.5 h-2.5 text-teal-400" /> {day.windSpeedKmh}km/h
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Packing Advice Banner */}
      {forecast[0]?.packingAdvice && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs font-medium">
          <Shirt className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold mr-1">Packing Tip:</span>
            {forecast[0].packingAdvice}
          </div>
        </div>
      )}
    </div>
  );
};
