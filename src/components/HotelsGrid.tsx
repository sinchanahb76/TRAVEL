import React from 'react';
import { Hotel, Star, MapPin, CheckCircle2, DollarSign, Lightbulb } from 'lucide-react';
import { HotelRecommendation, CurrencyConfig } from '../types';

interface HotelsGridProps {
  hotels: HotelRecommendation[];
  currency: CurrencyConfig;
}

export const HotelsGrid: React.FC<HotelsGridProps> = ({ hotels, currency }) => {
  if (!hotels || hotels.length === 0) return null;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-md mb-8">
      <div className="flex items-center gap-2 mb-6">
        <Hotel className="w-5 h-5 text-violet-500" />
        <h3 className="text-base font-bold text-zinc-900 dark:text-white">Recommended Hotel Stays</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {hotels.map((hotel) => {
          const cost = Math.round(hotel.pricePerNightUSD * currency.rateToUSD);

          return (
            <div
              key={hotel.id}
              className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 hover:border-violet-500/50 transition-all flex flex-col justify-between shadow-sm"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300">
                      {hotel.priceCategory || 'Boutique Stay'}
                    </span>
                    <h4 className="text-base font-extrabold text-zinc-900 dark:text-white mt-1">{hotel.name}</h4>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 text-amber-500 text-xs font-bold justify-end">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{hotel.rating || 4.5}</span>
                    </div>
                    <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {currency.symbol}
                      {cost} <span className="text-[10px] text-zinc-400 font-normal">/ night</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-zinc-600 dark:text-zinc-300 mb-3 leading-relaxed">{hotel.description}</p>

                <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400 font-medium mb-3">
                  <MapPin className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                  <span className="truncate">{hotel.locationName}</span>
                </div>

                {/* Amenities Pills */}
                {hotel.amenities && hotel.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {hotel.amenities.map((amenity, idx) => (
                      <span
                        key={idx}
                        className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-zinc-200/70 dark:bg-zinc-700/60 text-zinc-700 dark:text-zinc-300"
                      >
                        <CheckCircle2 className="w-2.5 h-2.5 text-violet-500" />
                        {amenity}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Booking Tip */}
              {hotel.bookingTip && (
                <div className="p-2.5 rounded-xl bg-violet-50/80 dark:bg-violet-950/40 border border-violet-200/60 dark:border-violet-800/40 text-[11px] text-violet-900 dark:text-violet-200 flex items-start gap-1.5 mt-2">
                  <Lightbulb className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold mr-1">Stay Tip:</span>
                    {hotel.bookingTip}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
