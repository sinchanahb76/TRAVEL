import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroForm } from './components/HeroForm';
import { LoadingScreen } from './components/LoadingScreen';
import { ItineraryHeader } from './components/ItineraryHeader';
import { WeatherWidget } from './components/WeatherWidget';
import { BudgetBreakdownWidget } from './components/BudgetBreakdownWidget';
import { DayCard } from './components/DayCard';
import { MapWidget } from './components/MapWidget';
import { HotelsGrid } from './components/HotelsGrid';
import { FoodGrid } from './components/FoodGrid';
import { HiddenGemsGrid } from './components/HiddenGemsGrid';
import { TransportationWidget } from './components/TransportationWidget';
import { FlightSearch } from './components/FlightSearch';
import { MyTripsView } from './components/MyTripsView';
import { ActivityModal } from './components/ActivityModal';
import { Footer } from './components/Footer';
import { generateItineraryPDF } from './lib/pdfExport';
import {
  ItineraryData,
  TripSearchForm,
  CurrencyConfig,
  SUPPORTED_CURRENCIES,
  Activity,
  ActivityTimeSlot,
  FlightSearchQuery,
} from './types';
import { Compass, Sparkles, MapPin, Calendar, Layers, RotateCcw, AlertTriangle, X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'itinerary' | 'saved' | 'flights'>('home');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDark, setIsDark] = useState<boolean>(() => {
    return (
      localStorage.getItem('theme') === 'dark' ||
      window.matchMedia('(prefers-color-scheme: dark)').matches
    );
  });
  const [currency, setCurrency] = useState<CurrencyConfig>(SUPPORTED_CURRENCIES[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingDestination, setLoadingDestination] = useState('');
  const [activeItinerary, setActiveItinerary] = useState<ItineraryData | null>(null);
  const [savedTrips, setSavedTrips] = useState<ItineraryData[]>([]);

  // Flight search query state for pre-filling from itinerary
  const [flightQuery, setFlightQuery] = useState<Partial<FlightSearchQuery>>({});

  // Activity Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDayNumber, setModalDayNumber] = useState<number>(1);
  const [modalSlot, setModalSlot] = useState<ActivityTimeSlot>('morning');
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  // Sync dark theme with document HTML and BODY class
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (isDark) {
      root.classList.add('dark');
      body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  // Load saved trips from localStorage and server on mount
  useEffect(() => {
    const local = localStorage.getItem('saved_trips');
    if (local) {
      try {
        setSavedTrips(JSON.parse(local));
      } catch (e) {
        console.error('Failed to parse saved trips from localStorage', e);
      }
    }

    // Also fetch from server API
    fetch('/api/trips')
      .then((res) => {
        if (!res.ok) throw new Error(`Server returned status ${res.status}`);
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Non-JSON response received');
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.trips && Array.isArray(data.trips) && data.trips.length > 0) {
          setSavedTrips((prev) => {
            const combined = [...data.trips, ...prev];
            const uniqueMap = new Map();
            combined.forEach((item) => uniqueMap.set(item.id, item));
            return Array.from(uniqueMap.values());
          });
        }
      })
      .catch((err) => console.log('Server trips fetch silent:', err));
  }, []);

  // Save trips to localStorage whenever updated
  useEffect(() => {
    localStorage.setItem('saved_trips', JSON.stringify(savedTrips));
  }, [savedTrips]);

  // Handle Generating Trip
  const handleGenerateTrip = async (formData: TripSearchForm) => {
    setIsLoading(true);
    setErrorMessage(null);
    setLoadingDestination(formData.destination);

    try {
      const res = await fetch('/api/generate-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const contentType = res.headers.get('content-type') || '';

      if (!res.ok) {
        let errText = `Failed to generate itinerary (Server status ${res.status})`;
        if (contentType.includes('application/json')) {
          try {
            const errData = await res.json();
            if (errData && errData.error) {
              errText = errData.error;
            }
          } catch (_) {}
        } else {
          const rawText = await res.text();
          if (rawText && rawText.toLowerCase().includes('404')) {
            errText = 'API route /api/generate-itinerary not found (404). Check backend route configuration.';
          }
        }
        throw new Error(errText);
      }

      if (!contentType.includes('application/json')) {
        throw new Error('Received unexpected non-JSON response from server.');
      }

      const data: ItineraryData = await res.json();
      setActiveItinerary(data);
      setActiveTab('itinerary');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error: any) {
      console.error('Error generating trip:', error);
      setErrorMessage(
        error?.message || 'An unexpected error occurred while generating your itinerary. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Switch to Flight Search with pre-filled destination
  const handleSearchFlightsForDestination = (dest: string, startDate?: string, endDate?: string) => {
    setFlightQuery({
      destination: dest,
      origin: 'New Delhi',
      departureDate: startDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      returnDate: endDate,
      tripType: endDate ? 'round-trip' : 'one-way',
      passengers: activeItinerary?.groupSize || 1,
    });
    setActiveTab('flights');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Toggle Save Current Trip
  const handleToggleSaveCurrentTrip = () => {
    if (!activeItinerary) return;

    const isAlreadySaved = savedTrips.some((t) => t.id === activeItinerary.id);

    if (isAlreadySaved) {
      setSavedTrips((prev) => prev.filter((t) => t.id !== activeItinerary.id));
      fetch(`/api/trips/${activeItinerary.id}`, { method: 'DELETE' }).catch(() => {});
    } else {
      setSavedTrips((prev) => [activeItinerary, ...prev]);
      fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activeItinerary),
      }).catch(() => {});
    }
  };

  // Delete Saved Trip
  const handleDeleteSavedTrip = (tripId: string) => {
    setSavedTrips((prev) => prev.filter((t) => t.id !== tripId));
    fetch(`/api/trips/${tripId}`, { method: 'DELETE' }).catch(() => {});
  };

  // Export PDF Handler
  const handleExportPDF = () => {
    if (activeItinerary) {
      try {
        generateItineraryPDF(activeItinerary, currency);
      } catch (err) {
        console.error('jsPDF export error:', err);
        window.print();
      }
    } else {
      window.print();
    }
  };

  // Activity Editing Handlers
  const handleOpenAddActivity = (dayNumber: number, timeSlot: ActivityTimeSlot) => {
    setModalDayNumber(dayNumber);
    setModalSlot(timeSlot);
    setEditingActivity(null);
    setIsModalOpen(true);
  };

  const handleOpenEditActivity = (dayNumber: number, activity: Activity) => {
    setModalDayNumber(dayNumber);
    setModalSlot(activity.timeSlot || 'morning');
    setEditingActivity(activity);
    setIsModalOpen(true);
  };

  const handleDeleteActivity = (dayNumber: number, activityId: string) => {
    if (!activeItinerary) return;

    const updatedDays = activeItinerary.days.map((day) => {
      if (day.dayNumber === dayNumber) {
        const filtered = day.activities.filter((a) => a.id !== activityId);
        const newDailySpend = filtered.reduce((acc, a) => acc + (a.estimatedCostUSD || 0), 0);
        return { ...day, activities: filtered, dailyBudgetEstimateUSD: newDailySpend };
      }
      return day;
    });

    const newActivitiesTotal = updatedDays.reduce((acc, d) => acc + d.dailyBudgetEstimateUSD, 0);

    setActiveItinerary({
      ...activeItinerary,
      days: updatedDays,
      budgetBreakdown: {
        ...activeItinerary.budgetBreakdown,
        activitiesAndAttractionsUSD: newActivitiesTotal,
        totalEstimatedUSD:
          activeItinerary.budgetBreakdown.accommodationUSD +
          activeItinerary.budgetBreakdown.foodAndDiningUSD +
          newActivitiesTotal +
          activeItinerary.budgetBreakdown.localTransportUSD,
      },
    });
  };

  const handleSaveActivity = (activityToSave: Activity) => {
    if (!activeItinerary) return;

    const updatedDays = activeItinerary.days.map((day) => {
      if (day.dayNumber === modalDayNumber) {
        let exists = day.activities.some((a) => a.id === activityToSave.id);
        let newActivities = exists
          ? day.activities.map((a) => (a.id === activityToSave.id ? activityToSave : a))
          : [...day.activities, activityToSave];

        const newDailySpend = newActivities.reduce((acc, a) => acc + (a.estimatedCostUSD || 0), 0);
        return { ...day, activities: newActivities, dailyBudgetEstimateUSD: newDailySpend };
      }
      return day;
    });

    const newActivitiesTotal = updatedDays.reduce((acc, d) => acc + d.dailyBudgetEstimateUSD, 0);

    setActiveItinerary({
      ...activeItinerary,
      days: updatedDays,
      budgetBreakdown: {
        ...activeItinerary.budgetBreakdown,
        activitiesAndAttractionsUSD: newActivitiesTotal,
        totalEstimatedUSD:
          activeItinerary.budgetBreakdown.accommodationUSD +
          activeItinerary.budgetBreakdown.foodAndDiningUSD +
          newActivitiesTotal +
          activeItinerary.budgetBreakdown.localTransportUSD,
      },
    });
  };

  const isCurrentTripSaved = activeItinerary
    ? savedTrips.some((t) => t.id === activeItinerary.id)
    : false;

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-zinc-950 dark:text-zinc-50 transition-colors duration-300 flex flex-col font-sans">
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        savedCount={savedTrips.length}
        isDark={isDark}
        setIsDark={setIsDark}
        currentCurrency={currency}
        setCurrency={setCurrency}
        hasActiveTrip={!!activeItinerary}
        onPrint={handleExportPDF}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-800/80 text-rose-900 dark:text-rose-200 flex items-start justify-between gap-3 shadow-md animate-fadeIn">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold">Unable to Generate Itinerary</h4>
                <p className="text-xs text-rose-700 dark:text-rose-300 mt-1">{errorMessage}</p>
              </div>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="p-1.5 rounded-lg hover:bg-rose-200/60 dark:hover:bg-rose-800/60 transition-colors text-rose-600 dark:text-rose-300 shrink-0"
              aria-label="Dismiss error banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {isLoading ? (
          <LoadingScreen destination={loadingDestination} />
        ) : activeTab === 'home' ? (
          <HeroForm onSubmit={handleGenerateTrip} isLoading={isLoading} />
        ) : activeTab === 'flights' ? (
          <FlightSearch currency={currency} initialQuery={flightQuery} />
        ) : activeTab === 'saved' ? (
          <MyTripsView
            savedTrips={savedTrips}
            onSelectTrip={(trip) => {
              setActiveItinerary(trip);
              setActiveTab('itinerary');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onDeleteTrip={handleDeleteSavedTrip}
            onNewTrip={() => setActiveTab('home')}
            currency={currency}
          />
        ) : activeTab === 'itinerary' && activeItinerary ? (
          <div id="itinerary-content" className="space-y-8 animate-fadeIn">
            {/* Header Hero Banner */}
            <ItineraryHeader
              itinerary={activeItinerary}
              isSaved={isCurrentTripSaved}
              onToggleSave={handleToggleSaveCurrentTrip}
              onRegenerate={() => setActiveTab('home')}
              onPrint={handleExportPDF}
              currency={currency}
            />

            {/* AI Transport & Logistics Booking Widget */}
            <TransportationWidget
              itinerary={activeItinerary}
              currency={currency}
              onSearchFlights={handleSearchFlightsForDestination}
            />

            {/* Weather Forecast Widget */}
            <WeatherWidget
              forecast={activeItinerary.weatherForecast}
              destination={activeItinerary.destination}
            />

            {/* Interactive Leaflet Map */}
            <MapWidget itinerary={activeItinerary} />

            {/* Budget Breakdown */}
            <BudgetBreakdownWidget
              breakdown={activeItinerary.budgetBreakdown}
              currency={currency}
            />

            {/* Day-Wise Schedules */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-white">
                    Daily Schedule & Activities
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Morning, afternoon, and evening plans curated for your travel dates.
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab('home')}
                  className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors print:hidden"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Regenerate
                </button>
              </div>

              {activeItinerary.days?.map((day) => (
                <DayCard
                  key={day.dayNumber}
                  day={day}
                  currency={currency}
                  onEditActivity={handleOpenEditActivity}
                  onDeleteActivity={handleDeleteActivity}
                  onAddActivity={handleOpenAddActivity}
                />
              ))}
            </div>

            {/* Recommended Stays */}
            <HotelsGrid hotels={activeItinerary.hotels} currency={currency} />

            {/* Food & Dining */}
            <FoodGrid foodSuggestions={activeItinerary.foodSuggestions} />

            {/* Hidden Gems */}
            <HiddenGemsGrid hiddenGems={activeItinerary.hiddenGems} />
          </div>
        ) : (
          <HeroForm onSubmit={handleGenerateTrip} isLoading={isLoading} />
        )}
      </main>

      {/* Activity Edit / Add Modal */}
      <ActivityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveActivity}
        initialActivity={editingActivity}
        dayNumber={modalDayNumber}
        timeSlot={modalSlot}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
