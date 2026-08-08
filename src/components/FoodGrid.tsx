import React from 'react';
import { Utensils, MapPin, Sparkles, Flame } from 'lucide-react';
import { FoodSuggestion } from '../types';

interface FoodGridProps {
  foodSuggestions: FoodSuggestion[];
}

export const FoodGrid: React.FC<FoodGridProps> = ({ foodSuggestions }) => {
  if (!foodSuggestions || foodSuggestions.length === 0) return null;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-md mb-8">
      <div className="flex items-center gap-2 mb-6">
        <Utensils className="w-5 h-5 text-amber-500" />
        <h3 className="text-base font-bold text-zinc-900 dark:text-white">Must-Try Food & Dining Spots</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {foodSuggestions.map((food) => (
          <div
            key={food.id}
            className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 hover:border-amber-500/50 transition-all shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300">
                    {food.cuisine || 'Local Cuisine'}
                  </span>
                  <h4 className="text-base font-extrabold text-zinc-900 dark:text-white mt-1">{food.name}</h4>
                </div>

                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200">
                  {food.priceRange || '$$'}
                </span>
              </div>

              <p className="text-xs text-zinc-600 dark:text-zinc-300 mb-3 leading-relaxed">{food.description}</p>

              <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400 font-medium mb-3">
                <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="truncate">{food.locationName}</span>
              </div>
            </div>

            {/* Must Try Dish Banner */}
            {food.mustTryDish && (
              <div className="p-2.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-1.5 mt-2">
                <Flame className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold mr-1">Must Try Dish:</span>
                  {food.mustTryDish}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
