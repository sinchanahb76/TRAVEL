import React, { useState, useEffect } from 'react';
import {
  Plane,
  Calendar,
  Users,
  ArrowRightLeft,
  Search,
  Sparkles,
  Luggage,
  Clock,
  CheckCircle2,
  ExternalLink,
  SlidersHorizontal,
  ArrowUpRight,
  AlertCircle,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import {
  CabinClass,
  FlightOffer,
  FlightSearchQuery,
  TripType,
  CurrencyConfig,
} from '../types';

interface FlightSearchProps {
  currency: CurrencyConfig;
  initialQuery?: Partial<FlightSearchQuery>;
}

const POPULAR_FLIGHT_ROUTES = [
  { from: 'Delhi (DEL)', to: 'Mumbai (BOM)', label: 'DEL ⇄ BOM' },
  { from: 'Bangalore (BLR)', to: 'Goa (GOI)', label: 'BLR ⇄ GOI' },
  { from: 'New York (JFK)', to: 'London (LHR)', label: 'JFK ⇄ LHR' },
  { from: 'Paris (CDG)', to: 'Rome (FCO)', label: 'CDG ⇄ FCO' },
  { from: 'Mumbai (BOM)', to: 'Dubai (DXB)', label: 'BOM ⇄ DXB' },
  { from: 'Tokyo (HND)', to: 'Kyoto/Osaka (KIX)', label: 'HND ⇄ KIX' },
];

export const FlightSearch: React.FC<FlightSearchProps> = ({ currency, initialQuery }) => {
  const defaultDeparture = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
  const defaultReturn = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];

  const [origin, setOrigin] = useState(initialQuery?.origin || 'New Delhi');
  const [destination, setDestination] = useState(initialQuery?.destination || 'Bangalore');
  const [departureDate, setDepartureDate] = useState(initialQuery?.departureDate || defaultDeparture);
  const [returnDate, setReturnDate] = useState(initialQuery?.returnDate || defaultReturn);
  const [tripType, setTripType] = useState<TripType>(initialQuery?.tripType || 'one-way');
  const [passengers, setPassengers] = useState<number>(initialQuery?.passengers || 1);
  const [cabinClass, setCabinClass] = useState<CabinClass>(initialQuery?.cabinClass || 'ECONOMY');
  const [directOnly, setDirectOnly] = useState(false);

  const [aiPrompt, setAiPrompt] = useState('');
  const [isParsingAi, setIsParsingAi] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<FlightOffer[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [providerInfo, setProviderInfo] = useState<string>('');
  const [isLiveAvailable, setIsLiveAvailable] = useState<boolean>(true);
  const [serverMessage, setServerMessage] = useState<string>('');
  const [sortBy, setSortBy] = useState<'price' | 'duration' | 'departure'>('price');
  const [bookingModalFlight, setBookingModalFlight] = useState<FlightOffer | null>(null);

  // Update query when initialQuery changes
  useEffect(() => {
    if (initialQuery?.destination) {
      setDestination(initialQuery.destination);
    }
    if (initialQuery?.origin) {
      setOrigin(initialQuery.origin);
    }
    if (initialQuery?.departureDate) {
      setDepartureDate(initialQuery.departureDate);
    }
    if (initialQuery?.returnDate) {
      setReturnDate(initialQuery.returnDate);
      setTripType('round-trip');
    }
  }, [initialQuery]);

  const handleSwap = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!origin.trim() || !destination.trim() || !departureDate) return;

    setIsLoading(true);
    setErrorMessage(null);
    setHasSearched(true);
    setServerMessage('');

    try {
      const res = await fetch('/api/flights/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: origin.trim(),
          destination: destination.trim(),
          departureDate,
          returnDate: tripType === 'round-trip' ? returnDate : undefined,
          tripType,
          passengers,
          cabinClass,
          directOnly,
        }),
      });

      if (!res.ok) {
        throw new Error(`Flight search returned status ${res.status}`);
      }

      const data = await res.json();
      if (data) {
        setResults(data.results || []);
        setProviderInfo(data.provider || 'Flight Search Provider');
        setIsLiveAvailable(data.liveAvailable !== false);
        setServerMessage(data.message || '');
      } else {
        setResults([]);
        setIsLiveAvailable(false);
      }
    } catch (err: any) {
      console.error('Flight search error:', err);
      setErrorMessage(err?.message || 'Failed to retrieve flight offers. Please try again.');
      setIsLiveAvailable(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger search automatically if pre-filled from itinerary
  useEffect(() => {
    if (initialQuery?.destination && !hasSearched) {
      handleSearch();
    }
  }, []);

  // Handle Natural Language Gemini AI Parse
  const handleAiParse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setIsParsingAi(true);
    try {
      const res = await fetch('/api/transport/ai-parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.origin) setOrigin(data.origin);
        if (data.destination) setDestination(data.destination);
        if (data.departureDate) setDepartureDate(data.departureDate);
        if (data.returnDate) {
          setReturnDate(data.returnDate);
          setTripType('round-trip');
        } else if (data.tripType) {
          setTripType(data.tripType);
        }
        if (data.passengers) setPassengers(data.passengers);
        if (data.cabinClass) setCabinClass(data.cabinClass);

        // Auto execute search with parsed data
        setTimeout(() => {
          handleSearch();
        }, 100);
      }
    } catch (err) {
      console.warn('AI Parse error:', err);
    } finally {
      setIsParsingAi(false);
    }
  };

  // Format price into active currency
  const formatPrice = (priceUSD: number) => {
    const converted = Math.round(priceUSD * currency.rateToUSD);
    return `${currency.symbol}${converted.toLocaleString()}`;
  };

  // Sorted results
  const sortedResults = [...results].sort((a, b) => {
    if (sortBy === 'price') return a.price - b.price;
    if (sortBy === 'duration') return a.duration.localeCompare(b.duration);
    if (sortBy === 'departure') return a.departureTime.localeCompare(b.departureTime);
    return 0;
  });

  return (
    <div className="py-6 sm:py-10 max-w-6xl mx-auto px-4 sm:px-6">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 text-xs font-bold mb-3 border border-sky-200 dark:border-sky-800/70 shadow-sm">
          <Plane className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
          <span>Real-time Global Flight Search & Live Booking</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
          Find & Book{' '}
          <span className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Cheapest Flights
          </span>
        </h1>
        <p className="mt-2 text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
          Compare real-time airline fares, non-stop routes, baggage limits, and book directly with verified airline
          partners.
        </p>
      </div>

      {/* AI Prompt Assistant Bar */}
      <div className="mb-6 bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-teal-500/10 dark:from-sky-900/30 dark:via-indigo-900/20 dark:to-teal-900/20 p-3 sm:p-4 rounded-2xl border border-sky-200/80 dark:border-sky-800/60 shadow-sm">
        <form onSubmit={handleAiParse} className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 text-sky-700 dark:text-sky-300 text-xs font-bold shrink-0">
            <Sparkles className="w-4 h-4 text-sky-500 animate-spin" style={{ animationDuration: '6s' }} />
            <span>AI Smart Search:</span>
          </div>
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="e.g. 'Cheap direct flights from Delhi to Dubai next Friday in Business class for 2 people'..."
            className="flex-1 w-full bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          <button
            type="submit"
            disabled={isParsingAi || !aiPrompt.trim()}
            className="w-full sm:w-auto px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl transition-colors shrink-0 disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            {isParsingAi ? (
              <>
                <Zap className="w-3.5 h-3.5 animate-pulse" />
                Parsing...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                Ask AI
              </>
            )}
          </button>
        </form>
      </div>

      {/* Main Search Form Card */}
      <form
        onSubmit={handleSearch}
        className="bg-white dark:bg-zinc-900 rounded-3xl p-5 sm:p-7 border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/40 dark:shadow-none mb-8 transition-all"
      >
        {/* Top Controls: Trip Type & Cabin Class & Passengers */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-5 mb-5 border-b border-zinc-100 dark:border-zinc-800 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTripType('one-way')}
              className={`px-3 py-1.5 rounded-xl border transition-all ${
                tripType === 'one-way'
                  ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
              }`}
            >
              One Way
            </button>
            <button
              type="button"
              onClick={() => setTripType('round-trip')}
              className={`px-3 py-1.5 rounded-xl border transition-all ${
                tripType === 'round-trip'
                  ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
              }`}
            >
              Round Trip
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Passengers Select */}
            <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700">
              <Users className="w-3.5 h-3.5 text-zinc-500" />
              <select
                value={passengers}
                onChange={(e) => setPassengers(Number(e.target.value))}
                className="bg-transparent text-zinc-800 dark:text-zinc-200 text-xs font-semibold focus:outline-none cursor-pointer"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                  <option key={n} value={n} className="dark:bg-zinc-800">
                    {n} {n === 1 ? 'Passenger' : 'Passengers'}
                  </option>
                ))}
              </select>
            </div>

            {/* Cabin Class Select */}
            <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700">
              <select
                value={cabinClass}
                onChange={(e) => setCabinClass(e.target.value as CabinClass)}
                className="bg-transparent text-zinc-800 dark:text-zinc-200 text-xs font-semibold focus:outline-none cursor-pointer"
              >
                <option value="ECONOMY" className="dark:bg-zinc-800">
                  Economy
                </option>
                <option value="PREMIUM_ECONOMY" className="dark:bg-zinc-800">
                  Premium Economy
                </option>
                <option value="BUSINESS" className="dark:bg-zinc-800">
                  Business Class
                </option>
                <option value="FIRST" className="dark:bg-zinc-800">
                  First Class
                </option>
              </select>
            </div>

            {/* Direct Flights Checkbox */}
            <label className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={directOnly}
                onChange={(e) => setDirectOnly(e.target.checked)}
                className="rounded text-sky-600 focus:ring-sky-500 dark:bg-zinc-800 dark:border-zinc-700"
              />
              <span>Non-stop only</span>
            </label>
          </div>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-5">
          {/* Origin Input */}
          <div className="md:col-span-3">
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
              From / Origin
            </label>
            <div className="relative">
              <Plane className="w-4 h-4 text-sky-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="City or Airport (e.g. DEL, JFK)"
                className="w-full pl-10 pr-3 py-3 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-900 dark:text-white text-sm font-semibold rounded-2xl border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Swap Button */}
          <div className="md:col-span-1 flex items-end justify-center pb-1">
            <button
              type="button"
              onClick={handleSwap}
              title="Swap Origin & Destination"
              className="p-2.5 rounded-2xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors border border-zinc-200 dark:border-zinc-700"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Destination Input */}
          <div className="md:col-span-3">
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
              To / Destination
            </label>
            <div className="relative">
              <Plane className="w-4 h-4 text-indigo-500 absolute left-3.5 top-1/2 -translate-y-1/2 rotate-90" />
              <input
                type="text"
                required
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="City or Airport (e.g. BLR, LHR)"
                className="w-full pl-10 pr-3 py-3 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-900 dark:text-white text-sm font-semibold rounded-2xl border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Departure Date */}
          <div className={tripType === 'round-trip' ? 'md:col-span-2' : 'md:col-span-3'}>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Departure Date
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="date"
                required
                value={departureDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="w-full pl-10 pr-3 py-3 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-900 dark:text-white text-xs sm:text-sm font-semibold rounded-2xl border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Return Date (if round trip) */}
          {tripType === 'round-trip' && (
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Return Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  required
                  value={returnDate}
                  min={departureDate || new Date().toISOString().split('T')[0]}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-900 dark:text-white text-xs sm:text-sm font-semibold rounded-2xl border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
          )}

          {/* Submit Search Button */}
          <div className={tripType === 'round-trip' ? 'md:col-span-1' : 'md:col-span-2'}>
            <label className="block text-xs font-bold text-transparent mb-1.5 select-none hidden md:block">
              Search
            </label>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-sm rounded-2xl shadow-lg shadow-sky-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span className="hidden sm:inline">Search</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Popular Route Quick Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs text-zinc-500 scrollbar-none">
          <span className="font-bold shrink-0 text-zinc-400">Popular Routes:</span>
          {POPULAR_FLIGHT_ROUTES.map((r) => (
            <button
              key={r.label}
              type="button"
              onClick={() => {
                setOrigin(r.from);
                setDestination(r.to);
              }}
              className="shrink-0 px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-sky-50 dark:hover:bg-sky-950/60 hover:text-sky-600 dark:hover:text-sky-300 border border-zinc-200 dark:border-zinc-700 transition-colors font-medium"
            >
              {r.label}
            </button>
          ))}
        </div>
      </form>

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <p className="text-xs font-semibold">{errorMessage}</p>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-4 py-8">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 dark:bg-sky-900/60 text-sky-600 dark:text-sky-300 mx-auto flex items-center justify-center animate-bounce mb-3">
              <Plane className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">
              Scanning Airlines & Live GDS Availability...
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              Checking routes from {origin} to {destination}
            </p>
          </div>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 rounded-3xl bg-zinc-100 dark:bg-zinc-800/60 animate-pulse border border-zinc-200 dark:border-zinc-700"
            />
          ))}
        </div>
      )}

      {/* Search Results */}
      {!isLoading && hasSearched && (
        <div>
          {/* Results Summary Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <span>Available Flights</span>
                <span className="px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/60 text-sky-800 dark:text-sky-300 text-xs font-bold">
                  {results.length} offers found
                </span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Powered by {providerInfo}</span>
              </p>
            </div>

            {/* Sorting Controls */}
            {results.length > 0 && (
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-xs text-zinc-500 font-semibold">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 focus:outline-none"
                >
                  <option value="price">Lowest Price</option>
                  <option value="duration">Shortest Duration</option>
                  <option value="departure">Earliest Departure</option>
                </select>
              </div>
            )}
          </div>

          {/* Empty / Live Unavailable State */}
          {results.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center mb-4 border border-amber-200 dark:border-amber-800">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                Live booking/search is currently unavailable
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-md mx-auto mt-2 leading-relaxed">
                {serverMessage || 'Live flight search requires a valid FLIGHT_API_KEY configured in server environment variables. All other travel planner features remain fully operational.'}
              </p>
              <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-mono">
                <span>Config Key: FLIGHT_API_KEY</span>
              </div>
            </div>
          )}

          {/* Flight Offer Cards List */}
          <div className="space-y-4">
            {sortedResults.map((flight) => {
              const depDateObj = new Date(flight.departureTime);
              const depTimeString = depDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const arrDateObj = new Date(flight.arrivalTime);
              const arrTimeString = arrDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              return (
                <div
                  key={flight.id}
                  className="bg-white dark:bg-zinc-900 rounded-3xl p-5 sm:p-6 border border-zinc-200/90 dark:border-zinc-800 shadow-md hover:shadow-xl transition-all duration-200 group"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    {/* Airline & Flight Main Details */}
                    <div className="flex-1">
                      {/* Top Badges */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white font-black text-xs flex items-center justify-center shadow-sm">
                          {flight.airlineCode}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                            {flight.airline}
                            <span className="text-xs font-normal text-zinc-500">
                              ({flight.flightNumber})
                            </span>
                          </h4>
                          <span className="text-[11px] text-zinc-400">
                            {flight.aircraft || 'Commercial Jet'} • {flight.cabinClass}
                          </span>
                        </div>

                        {flight.stops === 0 ? (
                          <span className="ml-auto lg:ml-2 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold border border-emerald-200 dark:border-emerald-800">
                            Non-stop
                          </span>
                        ) : (
                          <span className="ml-auto lg:ml-2 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[11px] font-bold border border-amber-200 dark:border-amber-800">
                            {flight.stops} Stop
                          </span>
                        )}
                      </div>

                      {/* Flight Path Graphic */}
                      <div className="grid grid-cols-3 items-center text-center my-3 bg-zinc-50 dark:bg-zinc-800/40 p-3.5 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                        {/* Origin */}
                        <div className="text-left">
                          <span className="block text-lg font-black text-zinc-900 dark:text-white">
                            {depTimeString}
                          </span>
                          <span className="block text-xs font-extrabold text-sky-600 dark:text-sky-400">
                            {flight.originAirport}
                          </span>
                          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate block">
                            {flight.originCity}
                          </span>
                        </div>

                        {/* Duration & Flight Line */}
                        <div className="px-2">
                          <span className="text-[11px] font-semibold text-zinc-500 block mb-1">
                            {flight.duration}
                          </span>
                          <div className="relative flex items-center justify-center">
                            <div className="w-full h-0.5 bg-zinc-300 dark:bg-zinc-700" />
                            <Plane className="w-3.5 h-3.5 text-sky-500 absolute bg-zinc-50 dark:bg-zinc-800 px-0.5" />
                          </div>
                          <span className="text-[10px] text-zinc-400 block mt-1">
                            {flight.stops === 0 ? 'Direct Flight' : flight.stopDetails?.[0] || 'Connecting'}
                          </span>
                        </div>

                        {/* Destination */}
                        <div className="text-right">
                          <span className="block text-lg font-black text-zinc-900 dark:text-white">
                            {arrTimeString}
                          </span>
                          <span className="block text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                            {flight.destinationAirport}
                          </span>
                          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate block">
                            {flight.destinationCity}
                          </span>
                        </div>
                      </div>

                      {/* Baggage & Policy Chips */}
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 mt-2">
                        <span className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-lg">
                          <Luggage className="w-3 h-3 text-zinc-400" />
                          <span>Cabin: {flight.baggage?.carryOn || '7 kg'}</span>
                        </span>
                        <span className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-lg">
                          <Luggage className="w-3 h-3 text-zinc-400" />
                          <span>Checked: {flight.baggage?.checked || '15 kg'}</span>
                        </span>
                        {flight.seatsRemaining && flight.seatsRemaining <= 5 && (
                          <span className="text-amber-600 dark:text-amber-400 font-bold px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/40">
                            Only {flight.seatsRemaining} seats left at this price
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right Side: Pricing & Booking Action */}
                    <div className="lg:border-l lg:border-zinc-200 dark:lg:border-zinc-800 lg:pl-6 flex lg:flex-col items-center lg:items-end justify-between gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-zinc-100 dark:border-zinc-800">
                      <div>
                        <span className="block text-[11px] text-zinc-400 font-medium lg:text-right">
                          Total for {passengers} {passengers === 1 ? 'traveler' : 'travelers'}
                        </span>
                        <div className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white lg:text-right">
                          {formatPrice(flight.price)}
                        </div>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block lg:text-right">
                          Taxes & fees included
                        </span>
                      </div>

                      {/* Direct Booking Button */}
                      <button
                        type="button"
                        onClick={() => setBookingModalFlight(flight)}
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm shadow-md shadow-sky-600/20 hover:scale-[1.02] active:scale-95 transition-all text-center cursor-pointer"
                      >
                        <span>Book</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Booking Provider Readiness Modal */}
      {bookingModalFlight && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-sky-100 dark:bg-sky-900/60 text-sky-600 dark:text-sky-300 flex items-center justify-center">
                <Plane className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                  Ready to Book: {bookingModalFlight.airline} {bookingModalFlight.flightNumber}
                </h3>
                <p className="text-xs text-zinc-500">
                  {bookingModalFlight.originAirport} → {bookingModalFlight.destinationAirport} • {bookingModalFlight.cabinClass}
                </p>
              </div>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-800/60 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-700/60 my-4 space-y-2 text-xs text-zinc-600 dark:text-zinc-300">
              <div className="flex justify-between">
                <span className="font-semibold">Route:</span>
                <span>{bookingModalFlight.originCity} ({bookingModalFlight.originAirport}) to {bookingModalFlight.destinationCity} ({bookingModalFlight.destinationAirport})</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Departure:</span>
                <span>{new Date(bookingModalFlight.departureTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Estimated Total:</span>
                <span className="font-bold text-zinc-900 dark:text-white">{formatPrice(bookingModalFlight.price)}</span>
              </div>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6">
              Search is active. When live ticketing providers or GDS credentials are connected, direct automated checkout and PNR ticketing will process here.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setBookingModalFlight(null)}
                className="px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              >
                Close
              </button>
              <a
                href={bookingModalFlight.bookingUrl}
                target="_blank"
                rel="noreferrer noopener"
                onClick={() => setBookingModalFlight(null)}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-600/20 transition-all"
              >
                <span>Continue to Provider</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
