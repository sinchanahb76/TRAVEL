import React, { useState, useEffect } from 'react';
import { X, Sparkles, Plus, Check } from 'lucide-react';
import { Activity, ActivityCategory, ActivityTimeSlot } from '../types';

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (activity: Activity) => void;
  initialActivity?: Activity | null;
  dayNumber: number;
  timeSlot?: ActivityTimeSlot;
}

export const ActivityModal: React.FC<ActivityModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialActivity,
  dayNumber,
  timeSlot = 'morning',
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('');
  const [duration, setDuration] = useState('2 hours');
  const [estimatedCostUSD, setEstimatedCostUSD] = useState<number>(20);
  const [category, setCategory] = useState<ActivityCategory>('sightseeing');
  const [insiderTip, setInsiderTip] = useState('');
  const [slot, setSlot] = useState<ActivityTimeSlot>(timeSlot);

  useEffect(() => {
    if (initialActivity) {
      setTitle(initialActivity.title || '');
      setDescription(initialActivity.description || '');
      setLocationName(initialActivity.locationName || '');
      setDuration(initialActivity.duration || '2 hours');
      setEstimatedCostUSD(initialActivity.estimatedCostUSD || 0);
      setCategory(initialActivity.category || 'sightseeing');
      setInsiderTip(initialActivity.insiderTip || '');
      setSlot(initialActivity.timeSlot || timeSlot);
    } else {
      setTitle('');
      setDescription('');
      setLocationName('');
      setDuration('2 hours');
      setEstimatedCostUSD(20);
      setCategory('sightseeing');
      setInsiderTip('');
      setSlot(timeSlot);
    }
  }, [initialActivity, timeSlot, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const activityToSave: Activity = {
      id: initialActivity?.id || `act-user-${Date.now()}`,
      timeSlot: slot,
      title: title.trim(),
      description: description.trim(),
      locationName: locationName.trim() || 'Local Attraction',
      coordinates: initialActivity?.coordinates || { lat: 35.6762, lng: 139.6503 },
      duration: duration.trim() || '2 hours',
      estimatedCostUSD: Number(estimatedCostUSD) || 0,
      category,
      insiderTip: insiderTip.trim() || undefined,
    };

    onSave(activityToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-zinc-200 dark:border-zinc-800 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-500" />
            <h3 className="text-lg font-extrabold text-zinc-900 dark:text-white">
              {initialActivity ? 'Edit Activity' : `Add Activity (Day ${dayNumber})`}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Time Slot
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['morning', 'afternoon', 'evening'] as ActivityTimeSlot[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSlot(s)}
                  className={`py-2 rounded-xl text-xs font-bold capitalize border transition-all ${
                    slot === s
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Activity Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Guided Bamboo Grove Walk"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white text-xs border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Location Name
            </label>
            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="e.g. Arashiyama District"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white text-xs border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Duration
              </label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 1.5 hours"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white text-xs border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Est. Cost ($ USD)
              </label>
              <input
                type="number"
                min="0"
                value={estimatedCostUSD}
                onChange={(e) => setEstimatedCostUSD(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white text-xs border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ActivityCategory)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white text-xs border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="sightseeing">Sightseeing</option>
              <option value="food">Food & Dining</option>
              <option value="culture">Culture & Sights</option>
              <option value="adventure">Adventure</option>
              <option value="relaxation">Relaxation</option>
              <option value="shopping">Shopping</option>
              <option value="nature">Nature & Outdoors</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a brief overview of what to do..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white text-xs border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Insider Tip (Optional)
            </label>
            <input
              type="text"
              value={insiderTip}
              onChange={(e) => setInsiderTip(e.target.value)}
              placeholder="e.g. Best photo spots near the north gate..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white text-xs border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all"
            >
              <Check className="w-4 h-4" />
              Save Activity
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
