import React from 'react';
import { DollarSign, Hotel, Utensils, Compass, Bus, Lightbulb, PieChart } from 'lucide-react';
import { BudgetBreakdown, CurrencyConfig } from '../types';

interface BudgetBreakdownWidgetProps {
  breakdown: BudgetBreakdown;
  currency: CurrencyConfig;
}

export const BudgetBreakdownWidget: React.FC<BudgetBreakdownWidgetProps> = ({ breakdown, currency }) => {
  const rate = currency.rateToUSD;

  const totalUSD = breakdown.totalEstimatedUSD || 1;
  const accommodation = Math.round(breakdown.accommodationUSD * rate);
  const food = Math.round(breakdown.foodAndDiningUSD * rate);
  const activities = Math.round(breakdown.activitiesAndAttractionsUSD * rate);
  const transport = Math.round(breakdown.localTransportUSD * rate);
  const total = Math.round(totalUSD * rate);

  const accommodationPct = Math.round((breakdown.accommodationUSD / totalUSD) * 100);
  const foodPct = Math.round((breakdown.foodAndDiningUSD / totalUSD) * 100);
  const activitiesPct = Math.round((breakdown.activitiesAndAttractionsUSD / totalUSD) * 100);
  const transportPct = Math.round((breakdown.localTransportUSD / totalUSD) * 100);

  const categories = [
    {
      label: 'Accommodation',
      amount: accommodation,
      pct: accommodationPct,
      icon: Hotel,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Food & Dining',
      amount: food,
      pct: foodPct,
      icon: Utensils,
      color: 'bg-amber-500',
      textColor: 'text-amber-600 dark:text-amber-400',
    },
    {
      label: 'Activities & Sights',
      amount: activities,
      pct: activitiesPct,
      icon: Compass,
      color: 'bg-teal-500',
      textColor: 'text-teal-600 dark:text-teal-400',
    },
    {
      label: 'Local Transport',
      amount: transport,
      pct: transportPct,
      icon: Bus,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-600 dark:text-indigo-400',
    },
  ];

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-md mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <PieChart className="w-5 h-5 text-emerald-500" />
          <h3 className="text-base font-bold text-zinc-900 dark:text-white">Budget & Cost Breakdown</h3>
        </div>
        <div className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
          Est. Total: {currency.symbol}
          {total.toLocaleString()} {currency.code}
        </div>
      </div>

      {/* Stacked Progress Bar */}
      <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-4 rounded-full overflow-hidden flex mb-6 p-0.5">
        <div style={{ width: `${accommodationPct}%` }} className="bg-emerald-500 h-full rounded-l-full" />
        <div style={{ width: `${foodPct}%` }} className="bg-amber-500 h-full" />
        <div style={{ width: `${activitiesPct}%` }} className="bg-teal-500 h-full" />
        <div style={{ width: `${transportPct}%` }} className="bg-indigo-500 h-full rounded-r-full" />
      </div>

      {/* Category Breakdown Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <div
              key={cat.label}
              className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/60"
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`p-1.5 rounded-lg bg-zinc-200/60 dark:bg-zinc-700/60 ${cat.textColor}`}>
                  <Icon className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">{cat.pct}%</span>
              </div>
              <div className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">{cat.label}</div>
              <div className="text-sm font-extrabold text-zinc-900 dark:text-white mt-0.5">
                {currency.symbol}
                {cat.amount.toLocaleString()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Budget Tips */}
      {breakdown.budgetTips && breakdown.budgetTips.length > 0 && (
        <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60">
          <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-bold text-xs mb-2">
            <Lightbulb className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Money-Saving Tips for this Destination:</span>
          </div>
          <ul className="space-y-1.5 text-xs text-zinc-700 dark:text-zinc-300 list-disc list-inside">
            {breakdown.budgetTips.map((tip, idx) => (
              <li key={idx}>{tip}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
