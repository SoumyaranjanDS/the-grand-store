import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import { Calendar, MapPin, Clock, Users, Tag, Check, ArrowLeft, ShoppingBag, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import PaymentForm from '../checkout/PaymentForm';
import Price from '../../components/ui/Price';

export default function EventDetails({ onNotify, onAdd }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await api.get(`/events/${id}`);
        setEvent(res.data);
        if (res.data.ticketTiers && res.data.ticketTiers.length > 0) {
          setSelectedTicket(res.data.ticketTiers[0]);
        }
      } catch (error) {
        console.error('Failed to load event details', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const [quantity, setQuantity] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [waitlistLoading, setWaitlistLoading] = useState(false);
  
  const [paymentData, setPaymentData] = useState(null);
  const [payfastUrl, setPayfastUrl] = useState(null);

  const handleWaitlist = async () => {
    if (!user) {
      if (onNotify) onNotify('Please login to join the waitlist', 'error');
      navigate('/login?redirect=/events/' + id);
      return;
    }
    
    setWaitlistLoading(true);
    try {
      const token = user.token;
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/events/${id}/waitlist`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (onNotify) onNotify(res.data.message || 'Successfully joined the waitlist!');
    } catch (error) {
      console.error('Waitlist join failed:', error);
      if (onNotify) onNotify(error.response?.data?.message || 'Failed to join waitlist. Please try again.', 'error');
    } finally {
      setWaitlistLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!user) {
      if (onNotify) onNotify('Please login to book tickets', 'error');
      navigate('/login?redirect=/events/' + id);
      return;
    }
    
    setBookingLoading(true);
    try {
      const token = user.token;
      // 1. Create Pending Booking
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/events/${id}/book`, {
        ticketType: selectedTicket.name,
        quantity,
        totalPrice: selectedTicket.price * quantity
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // 2. Request PayFast Signature
      const pfRes = await axios.post(`${import.meta.env.VITE_API_URL}/api/payfast/generate-event`, {
        bookingId: res.data._id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPayfastUrl(pfRes.data.url);
      setPaymentData(pfRes.data.data);
    } catch (error) {
      console.error('Booking failed:', error);
      if (onNotify) onNotify(error.response?.data?.message || 'Booking failed. Please try again.', 'error');
      setBookingLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#0a0907] flex items-center justify-center text-gold-gradient">Loading experience details...</div>;
  }

  if (!event) {
    return <div className="min-h-screen bg-[#0a0907] pt-0 text-center text-white">Event not found.</div>;
  }

  return (
    <div className="min-h-screen bg-[#0a0907] pb-20 text-[#eee8dd]">
      {/* Hero Section */}
      <div className="relative h-[60vh] w-full">
        {event.image ? (
          <img src={`${import.meta.env.VITE_API_URL}${event.image}`} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-[#11100d]"></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0907] via-[#0a0907]/80 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0907] to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 max-w-7xl mx-auto">
          <button onClick={() => navigate('/events')} className="flex items-center gap-2 text-[#918a7f] hover:text-white transition-colors uppercase tracking-widest text-[10px] font-bold mb-6">
            <ArrowLeft size={14} /> Back to Events
          </button>
          
          <div className="inline-block px-3 py-1 bg-[#c9a35b]/20 border border-[#c9a35b]/40 text-gold-gradient rounded text-xs font-bold uppercase tracking-wider mb-4">
            {event.type}
          </div>
          <h1 className="text-4xl md:text-6xl font-serif text-white mb-6 leading-tight max-w-4xl">{event.title}</h1>
          
          <div className="flex flex-wrap items-center gap-6 text-[#918a7f] text-sm md:text-base font-medium">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-gold-gradient" />
              {new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-gold-gradient" />
              {event.startTime} - {event.endTime}
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-gold-gradient" />
              {event.format === 'Virtual' ? 'Virtual Global Experience' : `${event.location}, ${event.city}`}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-16 pt-0 grid grid-cols-1 lg:grid-cols-3 gap-16">
        
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-16">
          <section>
            <h2 className="text-2xl font-serif text-white mb-6">About the Experience</h2>
            <div className="text-[#918a7f] leading-relaxed space-y-4 whitespace-pre-wrap">
              {event.description}
            </div>
          </section>

          {/* Tasting Journey */}
          {event.tastingJourney && event.tastingJourney.length > 0 && (
            <section className="bg-[#11100d] border border-white/5 p-8 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#c9a35b]/5 rounded-full blur-[100px] pointer-events-none"></div>
              <h2 className="text-2xl font-serif text-white mb-6 relative">Your Tasting Journey</h2>
              <div className="space-y-4 relative">
                {event.tastingJourney.map((item, idx) => {
                  const product = event.tastingProducts && event.tastingProducts[idx];
                  
                  return (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-[#c9a35b]/10 border border-[#c9a35b]/30 flex items-center justify-center text-gold-gradient font-serif shrink-0">
                          {idx + 1}
                        </div>
                        <div>
                          <span className="text-lg text-[#eee8dd]">{item}</span>
                          {product && (
                            <p className="text-xs text-[#918a7f] mt-1 line-clamp-1">{product.category} &bull; <Price amount={product.price} /></p>
                          )}
                        </div>
                      </div>
                      
                      {product && onAdd && (
                        <button 
                          onClick={() => onAdd(product)}
                          className="shrink-0 self-start sm:self-auto flex items-center gap-2 px-4 py-2 rounded-lg bg-transparent border border-[#c9a35b]/40 text-gold-gradient hover:bg-[#c9a35b]/10 transition-colors text-xs uppercase tracking-widest font-bold"
                        >
                          <ShoppingBag size={14} /> Add to Cart
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Host Info */}
          {(event.hostName || event.vendorId) && (
            <section>
              <h2 className="text-2xl font-serif text-white mb-6">Meet Your Host</h2>
              <div className="flex items-center gap-6 bg-white/[0.02] border border-white/5 p-6 rounded-2xl">
                <div className="w-20 h-20 bg-[#1a1814] rounded-full flex items-center justify-center border border-white/10 shrink-0">
                  <Users size={32} className="text-[#918a7f]" />
                </div>
                <div>
                  <h3 className="text-xl font-serif text-[#eee8dd] mb-1">{event.hostName || event.vendorId.name}</h3>
                  <p className="text-gold-gradient text-sm uppercase tracking-widest mb-3">
                    {event.hostTitle || 'Distillery Partner'}
                  </p>
                  <button className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1 hover:text-gold-gradient transition-colors">
                    View Vendor Profile <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Sidebar / Booking */}
        <div className="lg:col-span-1">
          <div className="sticky top-32 bg-[#11100d] border border-white/10 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-xl font-serif text-white mb-6 text-center border-b border-white/10 pb-4">Select Tickets</h3>
            
            <div className="space-y-4 mb-8">
              {event.ticketTiers.map(tier => {
                const available = tier.quantity - tier.sold;
                const isSelected = selectedTicket?._id === tier._id;
                
                return (
                  <div 
                    key={tier._id}
                    onClick={() => available > 0 && setSelectedTicket(tier)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      available === 0 
                      ? 'border-white/5 opacity-50 cursor-not-allowed bg-black/50' 
                      : isSelected
                      ? 'border-[#c9a35b] bg-[#c9a35b]/5'
                      : 'border-white/10 hover:border-white/30 bg-black/20'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className={`font-bold ${isSelected ? 'text-gold-gradient' : 'text-white'}`}>{tier.name}</h4>
                          {available === 0 && <span className="text-[10px] uppercase font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded">Sold Out</span>}
                        </div>
                        <p className="text-xs text-[#918a7f] mt-1">{available} remaining</p>
                      </div>
                      <div className="text-right">
                        <p className="font-serif text-xl text-white"><Price amount={tier.price} /></p>
                      </div>
                    </div>
                    
                    {tier.benefits && tier.benefits.length > 0 && (
                      <ul className="mt-4 space-y-1">
                        {tier.benefits.map((benefit, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-[#918a7f]">
                            <Check size={14} className="text-gold-gradient mt-0.5 shrink-0" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>

            {selectedTicket && (
              <div className="mb-6">
                <label className="block text-sm font-bold uppercase tracking-widest text-[#eee8dd] mb-2">Quantity</label>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-lg border border-white/20 flex items-center justify-center text-white hover:border-[#c9a35b]"
                  >-</button>
                  <span className="text-xl font-serif text-white w-8 text-center">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(Math.min(selectedTicket.quantity - selectedTicket.sold, quantity + 1))}
                    className="w-10 h-10 rounded-lg border border-white/20 flex items-center justify-center text-white hover:border-[#c9a35b]"
                  >+</button>
                </div>
                <div className="mt-4 flex flex-col pt-4 border-t border-white/10">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-bold uppercase tracking-widest text-[#918a7f]">Total</span>
                    <span className="text-2xl font-serif text-gold-gradient"><Price amount={selectedTicket.price * quantity} /></span>
                  </div>
                  <p className="text-[10px] text-[#918a7f] text-right italic">Service fee & VAT included</p>
                </div>
              </div>
            )}

            {(() => {
              const totalAvailable = event.ticketTiers.reduce((acc, tier) => acc + (tier.quantity - tier.sold), 0);
              
              if (totalAvailable === 0) {
                return (
                  <button 
                    onClick={handleWaitlist}
                    disabled={waitlistLoading}
                    className="w-full bg-transparent border border-[#c9a35b]/50 text-gold-gradient hover:bg-[#c9a35b]/10 font-bold uppercase tracking-wider py-4 rounded-xl transition-all disabled:opacity-50"
                  >
                    {waitlistLoading ? 'Joining Waitlist...' : 'Join Waitlist'}
                  </button>
                );
              }

              return (
                <button 
                  onClick={handleBooking}
                  disabled={!selectedTicket || (selectedTicket.quantity - selectedTicket.sold) === 0 || bookingLoading}
                  className="w-full bg-gold-gradient hover:bg-[#e1bd70] text-black font-bold uppercase tracking-wider py-4 rounded-xl transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(201,163,91,0.2)]"
                >
                  {bookingLoading ? 'Booking...' : !selectedTicket ? 'Select a Ticket' : 'Book Now'}
                </button>
              );
            })()}

            <p className="text-center text-[10px] text-[#918a7f] mt-4 tracking-widest uppercase">
              Secure Checkout via Grand Store
            </p>
            <PaymentForm paymentData={paymentData} payfastUrl={payfastUrl} />
          </div>
        </div>

      </div>
    </div>
  );
}
