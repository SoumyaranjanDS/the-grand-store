import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar, MapPin, Clock, Users, ArrowLeft, Check, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function EventDetails({ onNotify }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/events/${id}`);
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

  const handleBooking = () => {
    if (!user) {
      if (onNotify) onNotify('Please login to book tickets', 'error');
      navigate('/login?redirect=/events/' + id);
      return;
    }
    // Phase 4 will handle the actual checkout flow
    // For now we will mock a simple alert and notification
    if (onNotify) onNotify(`Initiating booking for ${selectedTicket.name} ticket...`);
    alert(`Booking flow for ${selectedTicket.name} ticket (R${selectedTicket.price}) will be implemented in Phase 4.`);
  };

  if (loading) {
    return <div className="min-h-screen bg-[#0a0907] flex items-center justify-center text-gold-gradient">Loading experience details...</div>;
  }

  if (!event) {
    return <div className="min-h-screen bg-[#0a0907] pt-10 text-center text-white">Event not found.</div>;
  }

  return (
    <div className="min-h-screen bg-[#0a0907] pb-20 text-[#eee8dd]">
      {/* Hero Section */}
      <div className="relative h-[60vh] w-full">
        {event.image ? (
          <img src={`http://localhost:5000${event.image}`} alt={event.title} className="w-full h-full object-cover" />
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

      <div className="max-w-7xl mx-auto px-4 md:px-16 pt-12 grid grid-cols-1 lg:grid-cols-3 gap-16">
        
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
                {event.tastingJourney.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 border-b border-white/5 pb-4 last:border-0 last:pb-0">
                    <div className="w-8 h-8 rounded-full bg-[#c9a35b]/10 border border-[#c9a35b]/30 flex items-center justify-center text-gold-gradient font-serif shrink-0">
                      {idx + 1}
                    </div>
                    <span className="text-lg text-[#eee8dd]">{item}</span>
                  </div>
                ))}
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
                        <p className="font-serif text-xl text-white">R{tier.price}</p>
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

            <button 
              onClick={handleBooking}
              disabled={!selectedTicket || (selectedTicket.quantity - selectedTicket.sold) === 0}
              className="w-full bg-gold-gradient hover:bg-[#e1bd70] text-black font-bold uppercase tracking-wider py-4 rounded-xl transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(201,163,91,0.2)]"
            >
              {!selectedTicket ? 'Select a Ticket' : 'Book Now'}
            </button>
            <p className="text-center text-[10px] text-[#918a7f] mt-4 tracking-widest uppercase">
              Secure Checkout via Grand Store
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
