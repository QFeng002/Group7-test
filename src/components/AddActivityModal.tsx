import React, { useState } from 'react';
import { X, Plus, Clock, MapPin, DollarSign, Tag, Umbrella } from 'lucide-react';
import { ActivityCategory, ActivityItem } from '../types/travel';

interface AddActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayNumber: number;
  onAddActivity: (dayNumber: number, activity: ActivityItem) => void;
}

export const AddActivityModal: React.FC<AddActivityModalProps> = ({
  isOpen,
  onClose,
  dayNumber,
  onAddActivity,
}) => {
  const [title, setTitle] = useState('');
  const [timeSlot, setTimeSlot] = useState('11:00 - 13:00');
  const [category, setCategory] = useState<ActivityCategory>('Cultural');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState('20');
  const [isOutdoor, setIsOutdoor] = useState(false);
  const [isAnchorEvent, setIsAnchorEvent] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newActivity: ActivityItem = {
      id: `act-custom-${Date.now()}`,
      title: title.trim(),
      timeSlot,
      category,
      location: location.trim() || 'Central District',
      description: description.trim() || 'Custom added itinerary activity',
      cost: parseFloat(cost) || 0,
      recommendedDuration: '2 hours',
      isOutdoor,
      isAnchorEvent,
      indoorAlternative: isOutdoor
        ? {
            title: `Indoor Covered Alternative for ${title}`,
            location: location || 'Nearby Gallery',
            description: 'Sheltered indoor alternative with covered walkway access.',
            cost: parseFloat(cost) || 0,
            reason: 'Wet weather rain backup',
          }
        : undefined,
    };

    onAddActivity(dayNumber, newActivity);
    onClose();
    setTitle('');
    setDescription('');
    setLocation('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col text-xs">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Plus className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-bold text-white">Add Activity to Day {dayNumber}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-md transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Activity Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Roppongi Hills Mori Art Museum"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-300 font-medium mb-1 flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                Time Slot
              </label>
              <input
                type="text"
                placeholder="09:30 - 11:30"
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-md px-2.5 py-1.5 text-white focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1 flex items-center">
                <Tag className="w-3.5 h-3.5 mr-1 text-slate-400" />
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ActivityCategory)}
                className="w-full bg-slate-800 border border-slate-700 rounded-md px-2.5 py-1.5 text-white focus:outline-none focus:border-sky-500"
              >
                <option value="Sightseeing">Sightseeing</option>
                <option value="Cultural">Cultural</option>
                <option value="Dining">Dining</option>
                <option value="Indoor">Indoor</option>
                <option value="Outdoor">Outdoor</option>
                <option value="Event">Event</option>
                <option value="Festival">Festival</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-300 font-medium mb-1 flex items-center">
                <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                Location
              </label>
              <input
                type="text"
                placeholder="e.g. Minato-ku, Tokyo"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-md px-2.5 py-1.5 text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1 flex items-center">
                <DollarSign className="w-3.5 h-3.5 mr-1 text-slate-400" />
                Est. Cost (USD)
              </label>
              <input
                type="number"
                min="0"
                step="5"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-md px-2.5 py-1.5 text-white focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Notes / Description</label>
            <textarea
              rows={2}
              placeholder="Highlight landmarks, booking instructions or reservation note..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Environmental Toggles */}
          <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 space-y-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isOutdoor}
                onChange={(e) => setIsOutdoor(e.target.checked)}
                className="accent-sky-500 rounded"
              />
              <span className="text-slate-200">
                Is Outdoor Activity (Eligible for wet-weather rain contingency swap)
              </span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isAnchorEvent}
                onChange={(e) => setIsAnchorEvent(e.target.checked)}
                className="accent-amber-500 rounded"
              />
              <span className="text-slate-200">
                Anchor Event / Festival (Cannot be automatically swapped during replanning)
              </span>
            </label>
          </div>

          <div className="pt-2 flex justify-end space-x-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-sky-500 hover:bg-sky-400 text-white rounded-md font-semibold cursor-pointer"
            >
              Add to Itinerary
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
