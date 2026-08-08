import React, { useState } from 'react';
import {
  MapPin,
  Calendar,
  Sparkles,
  Users,
  DollarSign,
  Heart,
  Globe2,
  Check,
  Compass,
  Zap,
  Coffee,
  Camera,
  Trees,
  ShoppingBag,
  Sparkle,
} from 'lucide-react';
import { BudgetTier, TripSearchForm } from '../types';

interface HeroFormProps {
  onSubmit: (formData: TripSearchForm) => void;
  isLoading: boolean;
}

const POPULAR_DESTINATIONS = [
  { name: 'Kyoto, Japan', label: 'Kyoto', vibe: 'Temples & Culture' },
  { name: 'Paris, France', label: 'Paris', vibe: 'Art & Romance' },
  { name: 'Rome, Italy', label: 'Rome', vibe: 'History & Pasta' },
  { name: 'Tokyo, Japan', label: 'Tokyo', vibe: 'Neon & Food' },
  { name: 'Bali, Indonesia', label: 'Bali', vibe: 'Beaches & Retreats' },
  { name: 'New York, USA', label: 'New York', vibe: 'Skyline & Broadway' },
  { name: 'Barcelona, Spain', label: 'Barcelona', vibe: 'Architecture & Tapas' },
  { name: 'Santorini, Greece', label: 'Santorini', vibe: 'Sunsets & Sea' },
];

const VIBE_OPTIONS = [
  { id: 'Culture & Heritage', icon: Camera, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40' },
  { id: 'Food & Dining', icon: Coffee, color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/40' },
  { id: 'Adventure & Sports', icon: Zap, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40' },
  { id: 'Relaxation & Spa', icon: Heart, color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/40' },
  { id: 'Nature & Parks', icon: Trees, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40' },
  { id: 'Shopping & Markets', icon: ShoppingBag, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/40' },
  { id: 'Nightlife & Bars', icon: Sparkles, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40' },
];

export const HeroForm: React.FC<HeroFormProps> = ({ onSubmit, isLoading }) => {
  // Default dates: starting 7 days from now, ending 11 days from now (4-day trip)
  const defaultStart = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
  const defaultEnd = new Date(Date.now() + 11 * 86400000).toISOString().split('T')[0];

  const [destination, setDestination] = useState('Kyoto, Japan');
  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [budgetTier, setBudgetTier] = useState<BudgetTier>('moderate');
  const [travelers, setTravelers] = useState<'solo' | 'couple' | 'family' | 'friends'>('couple');
  const [vibes, setVibes] = useState<string[]>(['Culture & Heritage', 'Food & Dining']);
  const [customPreferences, setCustomPreferences] = useState('');

  const toggleVibe = (vibeId: string) => {
    setVibes((prev) => (prev.includes(vibeId) ? prev.filter((v) => v !== vibeId) : [...prev, vibeId]));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) return;
    onSubmit({
      destination: destination.trim(),
      startDate,
      endDate,
      budgetTier,
      travelers,
      vibes,
      customPreferences: customPreferences.trim(),
    });
  };

  return (
    <div className="relative overflow-hidden py-10 lg:py-16">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-emerald-400/20 via-teal-400/20 to-cyan-400/20 blur-3xl rounded-full pointer-events-none -z-10 dark:from-emerald-900/30 dark:via-teal-900/20 dark:to-cyan-900/20" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-4 border border-emerald-200 dark:border-emerald-800/60 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Powered by Gemini AI & Real-time Location Maps</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-tight">
            Plan Your Next Adventure in{' '}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 bg-clip-text text-transparent">
              Seconds
            </span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Get personalized day-by-day itineraries, recommended stay options, local food spots, weather forecasts, and
            budget breakdowns tailored to your style.
          </p>
        </div>

        {/* Dynamic Form Container */}
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-zinc-900/90 rounded-3xl p-6 sm:p-8 border border-zinc-200/80 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none backdrop-blur-xl transition-all"
        >
          {/* 1. Destination Input & Quick Pills */}
          <div className="mb-8">
            <label className="block text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-2">
              Where do you want to go?
            </label>
            <div className="relative">
              <MapPin className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" />
              <input
                type="text"
                required
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Kyoto, Paris, Tokyo, Amalfi Coast..."
                className="w-full pl-12 pr-4 py-3.5 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-900 dark:text-white text-base font-medium rounded-2xl border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-zinc-400"
              />
            </div>

            {/* Popular Destination Pills */}
            <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
              <span className="text-zinc-400 dark:text-zinc-500 font-semibold shrink-0">Popular:</span>
              {POPULAR_DESTINATIONS.map((dest) => (
                <button
                  key={dest.name}
                  type="button"
                  onClick={() => setDestination(dest.name)}
                  className={`shrink-0 px-3 py-1 rounded-full border transition-all ${
                    destination.toLowerCase() === dest.name.toLowerCase()
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-emerald-400 dark:hover:border-emerald-500'
                  }`}
                >
                  {dest.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Dates & Travelers Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-500" /> Start Date
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-900 dark:text-white text-sm font-medium rounded-xl border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-500" /> End Date
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-900 dark:text-white text-sm font-medium rounded-xl border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-500" /> Who is Traveling?
              </label>
              <select
                value={travelers}
                onChange={(e) => setTravelers(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-900 dark:text-white text-sm font-medium rounded-xl border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="solo">Solo Traveler (1)</option>
                <option value="couple">Couple (2)</option>
                <option value="family">Family (3+)</option>
                <option value="friends">Friends Group (3+)</option>
              </select>
            </div>
          </div>

          {/* 3. Budget Tier Selector */}
          <div className="mb-8">
            <label className="block text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-3 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-500" /> Budget Style
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'budget' as BudgetTier,
                  title: 'Budget Friendly',
                  desc: 'Hostels, local street food & public transit',
                  price: '$',
                  icon: '🎒',
                },
                {
                  id: 'moderate' as BudgetTier,
                  title: 'Balanced Moderate',
                  desc: '3-4★ Boutique hotels & cozy dining',
                  price: '$$',
                  icon: '🏨',
                },
                {
                  id: 'luxury' as BudgetTier,
                  title: 'Luxury Comfort',
                  desc: '5★ Luxury stays, fine dining & private tours',
                  price: '$$$',
                  icon: '✨',
                },
              ].map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setBudgetTier(b.id)}
                  className={`p-4 rounded-2xl text-left border transition-all flex flex-col justify-between ${
                    budgetTier === b.id
                      ? 'bg-emerald-500/10 border-emerald-500 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/50'
                      : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-600'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xl">{b.icon}</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200">
                        {b.price}
                      </span>
                    </div>
                    <div className="font-bold text-sm text-zinc-900 dark:text-white">{b.title}</div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-snug">{b.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 4. Interests / Vibe Badges */}
          <div className="mb-8">
            <label className="block text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-3">
              What vibes are you looking for?
            </label>
            <div className="flex flex-wrap gap-2.5">
              {VIBE_OPTIONS.map((vibe) => {
                const Icon = vibe.icon;
                const isSelected = vibes.includes(vibe.id);
                return (
                  <button
                    key={vibe.id}
                    type="button"
                    onClick={() => toggleVibe(vibe.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : vibe.color}`} />
                    <span>{vibe.id}</span>
                    {isSelected && <Check className="w-3 h-3 ml-1 stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Custom Notes */}
          <div className="mb-8">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Any special requests or dietary preferences? (Optional)
            </label>
            <input
              type="text"
              value={customPreferences}
              onChange={(e) => setCustomPreferences(e.target.value)}
              placeholder="e.g. Vegetarian food options, wheelchair accessible, love photography..."
              className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-900 dark:text-white text-xs font-medium rounded-xl border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-zinc-400"
            />
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:via-teal-500 hover:to-cyan-500 text-white font-bold text-base shadow-lg shadow-emerald-600/30 dark:shadow-none flex items-center justify-center gap-2.5 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Compass className="w-5 h-5 animate-spin" /> Generating Your AI Itinerary...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" /> Generate Personalized Itinerary
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
