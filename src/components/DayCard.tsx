import React from 'react';
import {
  Sun,
  Sunset,
  Moon,
  Clock,
  DollarSign,
  MapPin,
  Lightbulb,
  Edit2,
  Trash2,
  Plus,
  Compass,
  Utensils,
  Camera,
  Trees,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { DayItinerary, Activity, CurrencyConfig } from '../types';

interface DayCardProps {
  day: DayItinerary;
  currency: CurrencyConfig;
  onEditActivity: (dayNumber: number, activity: Activity) => void;
  onDeleteActivity: (dayNumber: number, activityId: string) => void;
  onAddActivity: (dayNumber: number, timeSlot: 'morning' | 'afternoon' | 'evening') => void;
}

export const DayCard: React.FC<DayCardProps> = ({
  day,
  currency,
  onEditActivity,
  onDeleteActivity,
  onAddActivity,
}) => {
  const rate = currency.rateToUSD;
  const dayBudgetConverted = Math.round(day.dailyBudgetEstimateUSD * rate);

  const getTimeSlotIcon = (timeSlot: string) => {
    switch (timeSlot) {
      case 'morning':
        return <Sun className="w-4 h-4 text-amber-500" />;
      case 'afternoon':
        return <Sunset className="w-4 h-4 text-orange-500" />;
      case 'evening':
        return <Moon className="w-4 h-4 text-indigo-400" />;
      default:
        return <Sun className="w-4 h-4 text-amber-500" />;
    }
  };

  const getCategoryBadge = (category: string) => {
    const cat = category?.toLowerCase() || 'sightseeing';
    switch (cat) {
      case 'food':
        return { label: 'Food & Dining', color: 'bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300' };
      case 'culture':
        return { label: 'Culture & Sights', color: 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300' };
      case 'adventure':
        return { label: 'Adventure', color: 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300' };
      case 'relaxation':
        return { label: 'Relaxation & Spa', color: 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300' };
      case 'shopping':
        return { label: 'Shopping', color: 'bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300' };
      case 'nature':
        return { label: 'Nature & Outdoor', color: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300' };
      default:
        return { label: 'Sightseeing', color: 'bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300' };
    }
  };

  // Group activities by timeSlot
  const timeSlots: Array<'morning' | 'afternoon' | 'evening'> = ['morning', 'afternoon', 'evening'];

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-md p-6 mb-8 transition-all">
      {/* Day Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-6 border-b border-zinc-100 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-sm">
              Day {day.dayNumber}
            </span>
            {day.dateStr && <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">{day.dateStr}</span>}
          </div>
          <h3 className="text-xl font-extrabold text-zinc-900 dark:text-white">{day.title}</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl">{day.summary}</p>
        </div>

        <div className="shrink-0 self-start sm:self-center text-right">
          <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Est. Day Spend</div>
          <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
            {currency.symbol}
            {dayBudgetConverted} {currency.code}
          </div>
        </div>
      </div>

      {/* Time Slots List */}
      <div className="space-y-6">
        {timeSlots.map((slot) => {
          const slotActivities = day.activities?.filter((a) => a.timeSlot === slot) || [];

          return (
            <div key={slot} className="relative pl-4 border-l-2 border-emerald-500/30 dark:border-emerald-500/20">
              {/* Slot Title */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-zinc-100 dark:bg-zinc-800">{getTimeSlotIcon(slot)}</div>
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    {slot} Schedule
                  </span>
                </div>

                <button
                  onClick={() => onAddActivity(day.dayNumber, slot)}
                  className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors print:hidden"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Activity</span>
                </button>
              </div>

              {/* Activities for this slot */}
              {slotActivities.length === 0 ? (
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 text-xs text-zinc-400 italic">
                  No activity set for {slot}. Click "Add Activity" to customize!
                </div>
              ) : (
                <div className="space-y-3">
                  {slotActivities.map((act) => {
                    const badge = getCategoryBadge(act.category);
                    const actCost = Math.round((act.estimatedCostUSD || 0) * rate);

                    return (
                      <div
                        key={act.id}
                        className="group p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all shadow-sm relative"
                      >
                        <div className="flex items-start justify-between gap-3 mb-1.5">
                          <div>
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${badge.color}`}>
                                {badge.label}
                              </span>
                              {act.duration && (
                                <span className="flex items-center gap-1 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                                  <Clock className="w-3 h-3" /> {act.duration}
                                </span>
                              )}
                            </div>
                            <h4 className="text-sm font-bold text-zinc-900 dark:text-white">{act.title}</h4>
                          </div>

                          <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity print:hidden">
                            <button
                              onClick={() => onEditActivity(day.dayNumber, act)}
                              className="p-1 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-emerald-500 hover:text-white transition-colors"
                              title="Edit Activity"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => onDeleteActivity(day.dayNumber, act.id)}
                              className="p-1 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-rose-500 hover:text-white transition-colors"
                              title="Delete Activity"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-zinc-600 dark:text-zinc-300 mb-3 leading-relaxed">
                          {act.description}
                        </p>

                        <div className="flex items-center justify-between gap-2 text-xs pt-2 border-t border-zinc-200/60 dark:border-zinc-700/60">
                          <div className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400 font-medium truncate">
                            <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span className="truncate">{act.locationName}</span>
                          </div>

                          <div className="font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                            {actCost === 0 ? 'Free' : `${currency.symbol}${actCost}`}
                          </div>
                        </div>

                        {/* Insider Tip */}
                        {act.insiderTip && (
                          <div className="mt-2.5 p-2.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 text-[11px] text-emerald-900 dark:text-emerald-200 flex items-start gap-1.5">
                            <Lightbulb className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold mr-1">Pro Tip:</span>
                              {act.insiderTip}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
