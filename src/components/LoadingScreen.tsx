import React, { useEffect, useState } from 'react';
import { Compass, Plane, Sparkles, MapPin, CheckCircle2 } from 'lucide-react';

interface LoadingScreenProps {
  destination: string;
}

const STEPS = [
  'Scouting iconic landmarks and local history...',
  'Curating authentic hotel and boutique stay options...',
  'Structuring morning, afternoon, and evening daily flow...',
  'Finding hidden local food spots & authentic dining...',
  'Calculating budget breakdown & weather forecasts...',
  'Finalizing interactive map coordinates...',
];

const TRAVEL_QUOTES = [
  '“Travel is the only thing you buy that makes you richer.”',
  '“To travel is to live.” – Hans Christian Andersen',
  '“The world is a book and those who do not travel read only one page.”',
  '“Take only memories, leave only footprints.” – Chief Seattle',
];

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ destination }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 1200);

    const quoteInterval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % TRAVEL_QUOTES.length);
    }, 3500);

    return () => {
      clearInterval(stepInterval);
      clearInterval(quoteInterval);
    };
  }, []);

  const progressPercent = Math.min(100, Math.round(((currentStep + 1) / STEPS.length) * 100));

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-xl text-center relative overflow-hidden">
        {/* Animated Radar Effect */}
        <div className="w-24 h-24 mx-auto mb-6 relative flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 animate-ping" />
          <div className="absolute inset-2 rounded-full border-2 border-teal-500/30 animate-pulse" />
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
            <Compass className="w-8 h-8 animate-spin text-white" style={{ animationDuration: '6s' }} />
          </div>
          <Plane className="w-5 h-5 text-emerald-500 absolute -top-1 -right-1 animate-bounce" />
        </div>

        <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">
          Crafting Your Trip to <span className="text-emerald-600 dark:text-emerald-400">{destination}</span>
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6">
          Our AI engine is processing real-time coordinates, weather, and local secrets.
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2.5 mb-6 overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Steps List */}
        <div className="space-y-2.5 text-left bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-zinc-200/60 dark:border-zinc-700/60 mb-6">
          {STEPS.map((stepText, idx) => {
            const isDone = idx < currentStep;
            const isCurrent = idx === currentStep;
            return (
              <div
                key={stepText}
                className={`flex items-center gap-2.5 text-xs font-medium transition-all ${
                  isDone
                    ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                    : isCurrent
                    ? 'text-zinc-900 dark:text-white font-bold'
                    : 'text-zinc-400 dark:text-zinc-600'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : isCurrent ? (
                  <Sparkles className="w-4 h-4 text-teal-500 animate-spin shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-zinc-300 dark:border-zinc-700 shrink-0" />
                )}
                <span className="truncate">{stepText}</span>
              </div>
            );
          })}
        </div>

        {/* Inspirational Quote */}
        <p className="text-xs italic text-zinc-500 dark:text-zinc-400 transition-opacity duration-300">
          {TRAVEL_QUOTES[quoteIndex]}
        </p>
      </div>
    </div>
  );
};
