import React, { useEffect, useState } from 'react';
import { Plane, Sparkles, ArrowRight, Clock, DollarSign, ExternalLink, ShieldCheck } from 'lucide-react';
import { CurrencyConfig, ItineraryData } from '../types';

interface TransportationWidgetProps {
  itinerary: ItineraryData;
  currency: CurrencyConfig;
  onSearchFlights: (destination: string, startDate?: string, endDate?: string) => void;
}

export const TransportationWidget: React.FC<TransportationWidgetProps> = ({
  itinerary,
  currency,
  onSearchFlights,
}) => {
  const [recommendation, setRecommendation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!itinerary.destination) return;

    setIsLoading(true);
    fetch(`/api/transport/recommend?destination=${encodeURIComponent(itinerary.destination)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.success) {
          setRecommendation(data);
        }
      })
      .catch((err) => console.log('Transport recommendation fetch error:', err))
      .finally(() => setIsLoading(false));
  }, [itinerary.destination]);

  return (
    <div className="bg-gradient-to-br from-sky-500/5 via-teal-500/5 to-emerald-500/5 dark:from-sky-950/20 dark:via-zinc-900 dark:to-emerald-950/20 rounded-3xl p-6 sm:p-8 border border-zinc-200/80 dark:border-zinc-800 shadow-md">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-900/60 text-sky-800 dark:text-sky-300 text-xs font-bold mb-2 border border-sky-200 dark:border-sky-800">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Flight & Transit Finder</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white">
            Travel to {itinerary.destination}
          </h3>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1 max-w-xl">
            {recommendation?.reasoning ||
              `Compare real-time airline flight offers and schedule flights for your travel dates.`}
          </p>
        </div>

        {/* 1-Click Action Button */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() =>
              onSearchFlights(itinerary.destination, itinerary.startDate, itinerary.endDate)
            }
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-600/20 transition-all hover:scale-105 active:scale-95"
          >
            <Plane className="w-4 h-4" />
            <span>Search Flights</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Flight Insights Card */}
      <div
        onClick={() =>
          onSearchFlights(itinerary.destination, itinerary.startDate, itinerary.endDate)
        }
        className="cursor-pointer group bg-white dark:bg-zinc-900/80 p-4 sm:p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-sky-400 dark:hover:border-sky-500 transition-all shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-300 flex items-center justify-center shrink-0">
            <Plane className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <span>Airlines & Real-Time Flights</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800/60">
                Live Search
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Estimated transit: ~{recommendation?.estimatedFlightDuration || '2h 30m'} • Non-stop and 1-stop routes with top carriers.
            </p>
          </div>
        </div>

        <span className="text-xs font-bold text-sky-600 dark:text-sky-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1 shrink-0">
          Find flights <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
};

