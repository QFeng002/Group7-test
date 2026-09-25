import React, { useState } from 'react';
import {
  Ticket,
  Building,
  Train,
  CheckCircle,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Star,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { BookingItem, TripPreferences, DestinationProposal } from '../types/travel';
import { formatPrice } from '../services/localStorageDb';
import { BookingModal } from './BookingModal';

interface TabBookingsLogisticsProps {
  destination: DestinationProposal | null;
  preferences: TripPreferences;
  bookings: BookingItem[];
  onConfirmBooking: (itemId: string, bookingRef: string) => void;
  onProceedToSummary: () => void;
}

export const TabBookingsLogistics: React.FC<TabBookingsLogisticsProps> = ({
  destination,
  preferences,
  bookings,
  onConfirmBooking,
  onProceedToSummary,
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'hotel' | 'transit' | 'attraction'>('all');
  const [selectedItemForModal, setSelectedItemForModal] = useState<BookingItem | null>(null);

  const filteredBookings = bookings.filter((item) => {
    if (activeCategory === 'all') return true;
    return item.type === activeCategory;
  });

  const confirmedCount = bookings.filter((b) => b.status === 'confirmed').length;

  return (
    <div className="h-full flex flex-col min-h-0 overflow-hidden bg-slate-950">
      {/* Top Header & Filter Bar */}
      <div className="border-b border-slate-800/80 bg-slate-900/40 px-4 py-3 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <Ticket className="w-4 h-4 text-sky-400" />
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide">
              Bookings & Logistics ({destination?.city ?? 'Target City'})
            </h1>
            <p className="text-[11px] text-slate-400">
              Curated stays, contactless public transit passes, and reserved attraction ticketing
            </p>
          </div>
        </div>

        {/* Category Pills & Confirmation Counter */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                activeCategory === 'all'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Items ({bookings.length})
            </button>
            <button
              onClick={() => setActiveCategory('hotel')}
              className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer flex items-center space-x-1 ${
                activeCategory === 'hotel'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Building className="w-3 h-3 mr-1" />
              <span>Stays</span>
            </button>
            <button
              onClick={() => setActiveCategory('transit')}
              className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer flex items-center space-x-1 ${
                activeCategory === 'transit'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Train className="w-3 h-3 mr-1" />
              <span>Transit Passes</span>
            </button>
            <button
              onClick={() => setActiveCategory('attraction')}
              className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer flex items-center space-x-1 ${
                activeCategory === 'attraction'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3 h-3 mr-1" />
              <span>Attractions</span>
            </button>
          </div>

          <button
            onClick={onProceedToSummary}
            className="px-3.5 py-1.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white rounded-md text-xs font-semibold shadow-md shadow-sky-500/20 flex items-center space-x-1.5 transition cursor-pointer shrink-0"
          >
            <span>Trip Summary</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Confirmation Status Banner */}
      <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800/80 shrink-0 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-300">
            Confirmed Reservations: <strong className="text-emerald-400">{confirmedCount}</strong> of {bookings.length}
          </span>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">
          Powered by Stay Hotel & Singapore/Tokyo Transit MCPs
        </span>
      </div>

      {/* Scrollable Bookings List (Isolated vertical scroll) */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredBookings.map((item) => {
            const isConfirmed = item.status === 'confirmed';

            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition flex flex-col justify-between space-y-3 bg-slate-900/60 ${
                  isConfirmed
                    ? 'border-emerald-500/40 bg-emerald-950/10 ring-1 ring-emerald-500/20'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Top pill badges */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-sky-400 border border-slate-700/60 flex items-center">
                      {item.type === 'hotel' ? <Building className="w-3 h-3 mr-1" /> : item.type === 'transit' ? <Train className="w-3 h-3 mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />}
                      {item.badge}
                    </span>

                    {item.rating && (
                      <span className="flex items-center text-amber-300 text-xs font-semibold">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400 mr-1" />
                        {item.rating}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-white text-sm mb-1 line-clamp-1">
                    {item.title}
                  </h3>

                  <span className="text-[10px] text-slate-400 block mb-2 font-mono">
                    Provider: {item.provider}
                  </span>

                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                    {item.details}
                  </p>

                  {item.datesOrTimeSlot && (
                    <div className="mt-2 text-[11px] text-slate-400 flex items-center">
                      <Clock className="w-3 h-3 mr-1 text-slate-500" />
                      <span>{item.datesOrTimeSlot}</span>
                    </div>
                  )}
                </div>

                {/* Bottom Section: Price & Action */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block">
                      {item.type === 'hotel' ? 'Per Night' : 'Per Person Pass'}
                    </span>
                    <span className="text-base font-bold text-emerald-400 font-mono">
                      {formatPrice(item.price, preferences.currency)}
                    </span>
                  </div>

                  {isConfirmed ? (
                    <div className="text-right">
                      <span className="px-2.5 py-1 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-md text-xs font-bold flex items-center">
                        <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                        Confirmed
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                        Ref: {item.bookingRef}
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedItemForModal(item)}
                      className="px-3.5 py-1.5 bg-sky-500 hover:bg-sky-400 text-white rounded-md text-xs font-semibold transition cursor-pointer shadow-sm shadow-sky-500/20"
                    >
                      {item.type === 'hotel' ? 'Book Stay' : item.type === 'transit' ? 'Get Pass' : 'Reserve Tickets'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Booking confirmation modal */}
      <BookingModal
        isOpen={Boolean(selectedItemForModal)}
        onClose={() => setSelectedItemForModal(null)}
        item={selectedItemForModal}
        currency={preferences.currency}
        partySize={preferences.partySize}
        onConfirmBooking={onConfirmBooking}
      />
    </div>
  );
};
