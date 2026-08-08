import React, { useState } from 'react';
import {
  MapPin,
  Calendar,
  Bookmark,
  Share2,
  Printer,
  Sparkles,
  Users,
  DollarSign,
  Check,
  RotateCcw,
  Tag,
} from 'lucide-react';
import { ItineraryData, CurrencyConfig } from '../types';
import { getDestinationImageUrl } from '../lib/images';
import confetti from 'canvas-confetti';

interface ItineraryHeaderProps {
  itinerary: ItineraryData;
  isSaved: boolean;
  onToggleSave: () => void;
  onRegenerate: () => void;
  onPrint: () => void;
  currency: CurrencyConfig;
}

export const ItineraryHeader: React.FC<ItineraryHeaderProps> = ({
  itinerary,
  isSaved,
  onToggleSave,
  onRegenerate,
  onPrint,
  currency,
}) => {
  const [copied, setCopied] = useState(false);
  const coverUrl = itinerary.coverImageUrl || getDestinationImageUrl(itinerary.destination);

  const handleSaveWithConfetti = () => {
    if (!isSaved) {
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // ignore if confetti fails
      }
    }
    onToggleSave();
  };

  const handleShare = async () => {
    const shareData = {
      title: `${itinerary.numberOfDays}-Day ${itinerary.destination} Itinerary`,
      text: `Check out my ${itinerary.numberOfDays}-day trip to ${itinerary.destination} created with AI Travel Planner!`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        // If user cancelled or share failed, proceed to fallback
      }
    }

    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch (err) {
        alert("Link copied to clipboard!");
      }
    } else {
      alert("Link copied to clipboard!");
    }
  };

  const formattedTotalCost = Math.round(
    itinerary.budgetBreakdown.totalEstimatedUSD * currency.rateToUSD
  ).toLocaleString();

  return (
    <div className="relative rounded-3xl overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl mb-8 transition-all">
      {/* Cover Image Header */}
      <div className="relative h-64 sm:h-80 w-full overflow-hidden">
        <img
          src={coverUrl}
          alt={itinerary.destination}
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

        {/* Top Floating Badges */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/90 dark:bg-zinc-900/90 text-zinc-900 dark:text-white backdrop-blur-md shadow-md border border-white/20">
              {itinerary.numberOfDays} Days Trip
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white shadow-md">
              {itinerary.budgetTier.toUpperCase()} BUDGET
            </span>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={handleSaveWithConfetti}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md backdrop-blur-md ${
                isSaved
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white/90 dark:bg-zinc-900/90 text-zinc-900 dark:text-white hover:bg-white'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
              {isSaved ? 'Saved to Trips' : 'Save Trip'}
            </button>

            <button
              onClick={handleShare}
              className="p-2 rounded-xl bg-white/90 dark:bg-zinc-900/90 text-zinc-900 dark:text-white hover:bg-white shadow-md backdrop-blur-md transition-all text-xs font-semibold flex items-center gap-1"
              title="Share Trip"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? 'Copied!' : 'Share'}</span>
            </button>

            <button
              onClick={onPrint}
              className="hidden sm:flex items-center gap-1 p-2 rounded-xl bg-white/90 dark:bg-zinc-900/90 text-zinc-900 dark:text-white hover:bg-white shadow-md backdrop-blur-md transition-all text-xs font-semibold"
              title="Print or Export PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
          </div>
        </div>

        {/* Hero Title & Subtitle */}
        <div className="absolute bottom-6 left-6 right-6 text-white">
          <div className="flex items-center gap-2 text-emerald-300 font-semibold text-xs mb-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>{itinerary.destination}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-2 drop-shadow-md">
            {itinerary.destination}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-200 max-w-2xl font-medium line-clamp-2">
            {itinerary.destinationTagline || itinerary.overview}
          </p>
        </div>
      </div>

      {/* Info Bar */}
      <div className="p-6 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-200/80 dark:border-zinc-700/60 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <div className="text-zinc-400 dark:text-zinc-500 font-medium">Dates</div>
            <div className="font-bold text-zinc-900 dark:text-white">
              {itinerary.startDate || 'Flex Dates'} - {itinerary.endDate || ''}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-950/80 text-teal-600 dark:text-teal-300 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className="text-zinc-400 dark:text-zinc-500 font-medium">Travelers</div>
            <div className="font-bold text-zinc-900 dark:text-white capitalize">{itinerary.travelers}</div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-300 flex items-center justify-center shrink-0">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <div className="text-zinc-400 dark:text-zinc-500 font-medium">Estimated Total</div>
            <div className="font-bold text-emerald-600 dark:text-emerald-400">
              {currency.symbol}
              {formattedTotalCost} {currency.code}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300 flex items-center justify-center shrink-0">
            <Tag className="w-4 h-4" />
          </div>
          <div>
            <div className="text-zinc-400 dark:text-zinc-500 font-medium">Trip Vibe</div>
            <div className="font-bold text-zinc-900 dark:text-white truncate max-w-[120px]">
              {itinerary.vibes?.join(', ') || 'Exploration'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
