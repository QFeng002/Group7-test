import React, { useState } from 'react';
import { X, CheckCircle, CreditCard, ShieldCheck, Ticket, Calendar, DollarSign, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { BookingItem, CurrencyCode } from '../types/travel';
import { formatPrice } from '../services/localStorageDb';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: BookingItem | null;
  currency: CurrencyCode;
  partySize: number;
  onConfirmBooking: (itemId: string, bookingRef: string) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  item,
  currency,
  partySize,
  onConfirmBooking,
}) => {
  const [guestName, setGuestName] = useState('Alex Morgan');
  const [email, setEmail] = useState('alex.morgan@wanderpulse.travel');
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedRef, setConfirmedRef] = useState<string | null>(null);

  if (!isOpen || !item) return null;

  const totalCost = item.type === 'hotel' ? item.price * 5 : item.price * partySize;

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      const generatedRef = `WP-${item.type.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
      setConfirmedRef(generatedRef);
      setIsProcessing(false);
      onConfirmBooking(item.id, generatedRef);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (err) {
        // ignore in non-browser env
      }
    }, 900);
  };

  const handleClose = () => {
    setConfirmedRef(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col text-xs">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Ticket className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-bold text-white">
              {confirmedRef ? 'Booking Confirmed!' : `Confirm ${item.type.toUpperCase()} Booking`}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1 text-slate-400 hover:text-white rounded-md transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {confirmedRef ? (
          /* Confirmation Success Screen */
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-base font-bold text-white mb-1">
                Reservation Locked & Confirmed!
              </h4>
              <p className="text-xs text-slate-400">
                Direct provider voucher generated via Smithery AI MCP Orchestrator.
              </p>
            </div>

            <div className="p-4 bg-slate-800/80 border border-slate-700/80 rounded-xl text-left space-y-2">
              <div className="flex justify-between items-center pb-2 border-b border-slate-700/80">
                <span className="text-slate-400">Confirmation Reference:</span>
                <span className="font-mono font-bold text-sky-400 text-sm">{confirmedRef}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">Item:</span>
                <span className="font-medium truncate max-w-[240px]">{item.title}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">Provider:</span>
                <span className="font-medium">{item.provider}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">Guest:</span>
                <span className="font-medium">{guestName} ({email})</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-700/80 text-white font-bold">
                <span>Total Amount Charged:</span>
                <span className="font-mono text-emerald-400 text-sm">
                  {formatPrice(totalCost, currency)}
                </span>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="w-full py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white rounded-lg font-bold text-xs shadow-md transition cursor-pointer"
            >
              Done & Return to Logistics
            </button>
          </div>
        ) : (
          /* Checkout Form */
          <form onSubmit={handleCheckout} className="p-4 space-y-4">
            {/* Selected item recap */}
            <div className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-lg flex items-start space-x-3">
              <div className="w-10 h-10 rounded-md bg-slate-700/80 flex items-center justify-center shrink-0">
                <Ticket className="w-5 h-5 text-sky-400" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] text-sky-400 font-semibold uppercase block">
                  {item.provider}
                </span>
                <h4 className="font-bold text-white text-xs truncate">{item.title}</h4>
                <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{item.details}</p>
                <div className="flex justify-between items-center mt-2 text-xs pt-1 border-t border-slate-700/60">
                  <span className="text-slate-400">Subtotal:</span>
                  <span className="font-bold text-emerald-400 font-mono">
                    {formatPrice(totalCost, currency)}
                  </span>
                </div>
              </div>
            </div>

            {/* Guest Details */}
            <div className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Lead Guest Name</label>
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Email for Voucher</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Payment Details */}
              <div className="p-3 rounded-lg bg-slate-850 border border-slate-700/70 space-y-2">
                <span className="text-[11px] font-semibold text-slate-200 flex items-center">
                  <CreditCard className="w-3.5 h-3.5 mr-1.5 text-sky-400" />
                  Instant Direct Payment Guarantee
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <input
                      type="text"
                      disabled
                      value="•••• •••• •••• 4242 (Apple Pay / Token)"
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-md px-2.5 py-1 text-slate-300 font-mono text-[11px]"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      disabled
                      value="10/28"
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-md px-2 py-1 text-slate-300 font-mono text-[11px] text-center"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center text-[10px] text-slate-400 space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Encrypted transit pass & voucher tokenization via Transit MCP gateway</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end space-x-2 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-md cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-sky-600 hover:from-emerald-400 hover:to-sky-500 disabled:opacity-50 text-white rounded-md font-bold shadow-md cursor-pointer flex items-center space-x-1.5"
              >
                <span>{isProcessing ? 'Authorizing Booking...' : `Authorize ${formatPrice(totalCost, currency)}`}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
