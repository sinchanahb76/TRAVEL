import React from 'react';
import { Compass, Bookmark, Sun, Moon, Sparkles, MapPin, DollarSign, Download, Plus, Plane } from 'lucide-react';
import { CurrencyConfig, SUPPORTED_CURRENCIES } from '../types';

interface NavbarProps {
  activeTab: 'home' | 'itinerary' | 'saved' | 'flights';
  setActiveTab: (tab: 'home' | 'itinerary' | 'saved' | 'flights') => void;
  savedCount: number;
  isDark: boolean;
  setIsDark: (dark: boolean | ((prev: boolean) => boolean)) => void;
  currentCurrency: CurrencyConfig;
  setCurrency: (currency: CurrencyConfig) => void;
  hasActiveTrip: boolean;
  onPrint?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  savedCount,
  isDark,
  setIsDark,
  currentCurrency,
  setCurrency,
  hasActiveTrip,
  onPrint,
}) => {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800 transition-colors duration-200 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-2.5 group text-left focus:outline-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Compass className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-lg font-bold bg-gradient-to-r from-zinc-900 via-emerald-800 to-teal-700 dark:from-white dark:via-emerald-300 dark:to-teal-300 bg-clip-text text-transparent">
              AI Travel Planner
            </span>
            <span className="block text-[10px] uppercase tracking-wider font-semibold text-emerald-600 dark:text-emerald-400">
              Smart Itineraries & Booking
            </span>
          </div>
        </button>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/60 p-1 rounded-xl border border-zinc-200/80 dark:border-zinc-700/60">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'home'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-500" />
            Plan Trip
          </button>

          <button
            onClick={() => setActiveTab('flights')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'flights'
                ? 'bg-white dark:bg-zinc-900 text-sky-600 dark:text-sky-400 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Plane className="w-4 h-4 text-sky-500" />
            Flights
          </button>

          {hasActiveTrip && (
            <button
              onClick={() => setActiveTab('itinerary')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'itinerary'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <MapPin className="w-4 h-4 text-teal-500" />
              Current Itinerary
            </button>
          )}

          <button
            onClick={() => setActiveTab('saved')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'saved'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Bookmark className="w-4 h-4 text-amber-500" />
            My Trips
            {savedCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 text-[11px] font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                {savedCount}
              </span>
            )}
          </button>
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Currency Dropdown */}
          <div className="relative group">
            <select
              value={currentCurrency.code}
              onChange={(e) => {
                const found = SUPPORTED_CURRENCIES.find((c) => c.code === e.target.value);
                if (found) setCurrency(found);
              }}
              className="appearance-none bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold px-2.5 py-1.5 pr-6 rounded-lg border border-zinc-200 dark:border-zinc-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {SUPPORTED_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.symbol} {c.code}
                </option>
              ))}
            </select>
            <DollarSign className="w-3 h-3 text-zinc-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Print PDF Button (if active trip) */}
          {activeTab === 'itinerary' && onPrint && (
            <button
              onClick={onPrint}
              title="Print or Export PDF"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export PDF
            </button>
          )}

          {/* Dark / Light Toggle */}
          <button
            onClick={() => setIsDark((prev) => !prev)}
            aria-label="Toggle theme"
            className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-700" />}
          </button>

          {/* Quick Create Button for Mobile */}
          <button
            onClick={() => setActiveTab('home')}
            className="md:hidden p-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 transition-colors shadow-sm"
            title="Create New Trip"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
