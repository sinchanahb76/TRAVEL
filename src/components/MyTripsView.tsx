import React from 'react';
import { Bookmark, MapPin, Calendar, Trash2, Eye, Printer, Plus, Sparkles } from 'lucide-react';
import { ItineraryData, CurrencyConfig } from '../types';
import { getDestinationImageUrl } from '../lib/images';

interface MyTripsViewProps {
  savedTrips: ItineraryData[];
  onSelectTrip: (trip: ItineraryData) => void;
  onDeleteTrip: (tripId: string) => void;
  onNewTrip: () => void;
  currency: CurrencyConfig;
}

export const MyTripsView: React.FC<MyTripsViewProps> = ({
  savedTrips,
  onSelectTrip,
  onDeleteTrip,
  onNewTrip,
  currency,
}) => {
  if (savedTrips.length === 0) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4 py-12">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 shadow-md">
          <Bookmark className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-extrabold text-zinc-900 dark:text-white mb-2">No Saved Trips Yet</h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mb-6 leading-relaxed">
          Create a personalized trip itinerary and click "Save Trip" to access your plans here anytime!
        </p>
        <button
          onClick={onNewTrip}
          className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          Plan a New Trip
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-white">Your Saved Trips</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Access and manage your saved travel itineraries.
          </p>
        </div>

        <button
          onClick={onNewTrip}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Trip</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {savedTrips.map((trip) => {
          const coverUrl = trip.coverImageUrl || getDestinationImageUrl(trip.destination);
          const totalCost = Math.round(
            (trip.budgetBreakdown?.totalEstimatedUSD || 0) * currency.rateToUSD
          ).toLocaleString();

          return (
            <div
              key={trip.id}
              className="group rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-md hover:shadow-xl transition-all overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src={coverUrl}
                    alt={trip.destination}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />

                  <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow">
                    {trip.numberOfDays} Days
                  </span>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <div className="flex items-center gap-1 text-[11px] text-emerald-300 font-semibold mb-0.5">
                      <MapPin className="w-3 h-3" />
                      <span>{trip.destination}</span>
                    </div>
                    <h3 className="text-lg font-extrabold text-white truncate">{trip.destination}</h3>
                  </div>
                </div>

                <div className="p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-300">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                      {trip.startDate || 'Upcoming'}
                    </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {currency.symbol}
                      {totalCost}
                    </span>
                  </div>

                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                    {trip.destinationTagline || trip.overview}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 pt-0 flex items-center justify-between gap-2 border-t border-zinc-100 dark:border-zinc-800/80 mt-2">
                <button
                  onClick={() => onSelectTrip(trip)}
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View Trip
                </button>

                <button
                  onClick={() => onDeleteTrip(trip.id)}
                  className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title="Delete Trip"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
