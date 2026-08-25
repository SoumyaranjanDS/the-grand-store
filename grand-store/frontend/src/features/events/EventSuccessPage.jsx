import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, Ticket, MapPin, Calendar, Clock, AlertTriangle, User } from 'lucide-react';
import api from '../../api';
import Price from '../../components/ui/Price';

export default function EventSuccessPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const paymentStatus = searchParams.get('payment');
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Event Ticket Status ?" The Grand Store';
    
    // Quick polling to wait for webhook if needed
    const fetchBooking = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const headers = userInfo?.token ? { Authorization: `Bearer ${userInfo.token}` } : {};
        
        let attempts = 0;
        const maxAttempts = paymentStatus === 'success' ? 5 : 1;
        
        while (attempts < maxAttempts) {
          // We can use the existing 'my-tickets' route to find this booking
          const res = await api.get(`/events/bookings/my-tickets`, { headers });
          const found = res.data.find(b => b._id === id);
          
          if (found && (found.paymentStatus === 'Paid' || paymentStatus !== 'success')) {
            setBooking(found);
            setLoading(false);
            return;
          }
          
          attempts++;
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
        
        // If after 5 attempts it's still pending but we hit success
        const res = await api.get(`/events/bookings/my-tickets`, { headers });
        const finalFound = res.data.find(b => b._id === id);
        setBooking(finalFound);
        setLoading(false);
        
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    
    fetchBooking();
  }, [id, paymentStatus]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0907] flex flex-col items-center justify-center pt-20">
        <div className="w-12 h-12 border-4 border-[#c9a35b]/30 border-t-[#c9a35b] rounded-full animate-spin mb-4"></div>
        <p className="text-gold-gradient tracking-widest uppercase text-xs font-bold">Verifying Ticket...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-[70vh] bg-[#0a0907] flex flex-col items-center justify-center">
        <AlertTriangle size={48} className="text-[#888] mb-4" />
        <h2 className="text-2xl font-serif text-white mb-2">Ticket Not Found</h2>
        <p className="text-[#888] mb-6">We could not locate your ticket booking.</p>
        <button onClick={() => navigate('/events')} className="button button-gold">Back to Events</button>
      </div>
    );
  }

  const isSuccess = booking.paymentStatus === 'Paid';

  return (
    <div className="min-h-screen bg-[#0a0907] pb-24">
      {/* Dynamic Header */}
      <div className={`py-12 ${isSuccess ? 'bg-[#c9a35b]/10' : 'bg-red-900/20'}`}>
        <div className="shell flex flex-col items-center text-center">
          {isSuccess ? (
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 size={40} className="text-green-500" />
            </div>
          ) : (
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
              <AlertTriangle size={40} className="text-red-500" />
            </div>
          )}
          
          <h1 className="text-4xl md:text-5xl font-serif text-white mb-4">
            {isSuccess ? "Ticket Confirmed" : "Payment Incomplete"}
          </h1>
          <p className="text-lg text-[#ccc] max-w-2xl mx-auto">
            {isSuccess 
              ? `You are going to ${booking.event?.title || 'the event'}! Your ticket has been issued.`
              : "We could not complete your ticket purchase. Your payment may have failed or been cancelled."}
          </p>
        </div>
      </div>

      <div className="shell max-w-4xl mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Order Details */}
          <div className="bg-[#11100d] border border-white/10 rounded-xl p-8">
            <h3 className="text-xl font-serif text-white mb-6 border-b border-white/10 pb-4 flex items-center gap-2">
              <Ticket className="text-[#c9a35b]" /> Ticket Details
            </h3>
            
            <div className="space-y-4 text-sm text-[#ccc]">
              <div className="flex justify-between">
                <span className="text-[#888]">Booking Reference</span>
                <span className="text-white font-mono">{booking.gsReference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#888]">Event</span>
                <span className="text-white font-bold">{booking.event?.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#888]">Ticket Type</span>
                <span className="text-white">{booking.ticketType} x {booking.quantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#888]">Total Paid</span>
                <span className="text-[#c9a35b] font-bold"><Price amount={booking.totalPrice?.toFixed(2)} /></span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-4 mt-2">
                <span className="text-[#888]">Status</span>
                <span className={`font-bold ${isSuccess ? 'text-green-500' : 'text-yellow-500'}`}>
                  {booking.paymentStatus}
                </span>
              </div>
            </div>
          </div>
          
          {/* Next Steps / Actions */}
          <div className="flex flex-col gap-4">
            <div className="bg-[#11100d] border border-white/10 rounded-xl p-8 text-center flex-1 flex flex-col justify-center">
              <h3 className="text-lg font-bold text-white uppercase tracking-widest mb-4">What happens next?</h3>
              {isSuccess ? (
                <>
                  <p className="text-[#888] text-sm mb-6">
                    You can view your ticket and QR code anytime in your customer dashboard under "My Tickets". Present the QR code at the door.
                  </p>
                  <Link to="/customer/tickets" className="button button-gold w-full text-center mb-3">View My Tickets</Link>
                  <Link to="/events" className="button button-dark w-full text-center">Discover More Events</Link>
                </>
              ) : (
                <>
                  <p className="text-[#888] text-sm mb-6">
                    No funds were deducted. You can try booking again or explore other upcoming events.
                  </p>
                  <Link to={`/events/${booking.event?._id}`} className="button button-gold w-full text-center mb-3">Try Booking Again</Link>
                  <Link to="/events" className="button button-dark w-full text-center">Back to Events</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
