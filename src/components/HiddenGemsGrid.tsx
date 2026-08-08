import React from 'react';
import { Sparkles, MapPin, Compass, Clock } from 'lucide-react';
import { HiddenGem } from '../types';

interface HiddenGemsGridProps {
  hiddenGems: HiddenGem[];
}

export const HiddenGemsGrid: React.FC<HiddenGemsGridProps> = ({ hiddenGems }) => {
  if (!hiddenGems || hiddenGems.length === 0) return null;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-md mb-8">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-rose-500" />
        <h3 className="text-base font-bold text-zinc-900 dark:text-white">Local Hidden Gems & Secret Spots</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {hiddenGems.map((gem) => (
          <div
            key={gem.id}
            className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 hover:border-rose-500/50 transition-all shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300">
                  Off the Beaten Path
                </span>
              </div>

              <h4 className="text-base font-extrabold text-zinc-900 dark:text-white mb-1">{gem.name}</h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-300 mb-3 leading-relaxed">{gem.description}</p>

              <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400 font-medium mb-3">
                <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span className="truncate">{gem.locationName}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-800/40 text-[11px] text-rose-900 dark:text-rose-200 space-y-1">
              <div>
                <span className="font-bold mr-1">Why Special:</span>
                {gem.whySpecial}
              </div>
              {gem.bestTimeToVisit && (
                <div className="flex items-center gap-1 text-rose-700 dark:text-rose-300 font-medium text-[10px] pt-1">
                  <Clock className="w-3 h-3" />
                  <span>Best Visit Time: {gem.bestTimeToVisit}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
