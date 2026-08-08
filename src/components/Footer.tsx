import React from 'react';
import { Compass, Heart, Globe, Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-16 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 py-10 transition-colors print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-white shadow-md">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <span className="text-base font-bold bg-gradient-to-r from-zinc-900 via-emerald-800 to-teal-700 dark:from-white dark:via-emerald-300 dark:to-teal-300 bg-clip-text text-transparent">
              AI Travel Planner
            </span>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Smart itineraries powered by Google Gemini AI & OpenStreetMap
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs text-zinc-500 dark:text-zinc-400 font-medium flex-wrap justify-center">
          <span className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-emerald-500" /> Server-side API Security
          </span>
          <span className="flex items-center gap-1">
            <Globe className="w-3.5 h-3.5 text-teal-500" /> Interactive Leaflet Maps
          </span>
        </div>

        <div className="text-xs text-zinc-400 dark:text-zinc-500 text-center md:text-right">
          © {new Date().getFullYear()} AI Travel Planner. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
