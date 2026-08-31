import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Calendar, MapPin, Clock, Ticket, LogOut, User, Package, Heart, Building2, Gavel } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Price from '../../components/ui/Price';

export default function MyTickets() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchTickets = async () => {
      try {
        const token = user.token;
        const res = await api.get(`/events/bookings/my-tickets`);
        setTickets(res.data);
      } catch (error) {
        console.error('Failed to load tickets', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user || loading) {
    return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-gold-gradient">Loading your tickets...</div>;
  }

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-8 md:gap-12">
      <section className="mb-4 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6 mb-4">
        <div>
          <h1 className="text-[var(--color-ivory)] font-serif text-3xl md:text-5xl mb-4">My Tickets</h1>
          <p className="text-[var(--color-ivory-muted)] text-lg max-w-2xl font-light">
            Your upcoming and past event experiences.
          </p>
        </div>
        <button 
          onClick={() => navigate('/events')}
          className="whitespace-nowrap px-6 py-3 bg-[var(--color-gold)]/10 text-gold-gradient border border-[var(--color-gold)]/20 rounded-xl font-semibold uppercase tracking-widest text-xs hover:bg-[var(--color-gold)]/20 transition-all shadow-[0_0_15px_rgba(212,175,55,0.05)] hover:shadow-[0_0_20px_rgba(212,175,55,0.15)]"
        >
          Explore Events
        </button>
      </section>

          {tickets.length === 0 ? (
            <div className="text-center py-20 bg-white/[0.02] backdrop-blur-2xl rounded-3xl border border-white/[0.05] shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex flex-col items-center">
              <Ticket size={48} className="text-[var(--color-gold)]/50 mb-6" />
              <h3 className="text-2xl font-serif text-[var(--color-ivory)] mb-3">Your Event Calendar is Empty</h3>
              <p className="text-[var(--color-ivory-muted)] text-lg font-light mb-8 max-w-md mx-auto">
                Discover exclusive tastings, masterclasses, and private dinners hosted by our master sommeliers and partner estates.
              </p>
              <button 
                onClick={() => navigate('/events')}
                className="px-8 py-4 bg-gold-gradient text-black rounded-xl font-bold uppercase tracking-widest hover:brightness-110 transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)]"
              >
                Explore Upcoming Events
              </button>
            </div>
          ) : (
          <div className="grid grid-cols-1 gap-8">
            {tickets.map(ticket => (
              <motion.div 
                key={ticket._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-white/[0.03] to-transparent backdrop-blur-2xl rounded-3xl border border-white/[0.05] shadow-[0_15px_40px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col lg:flex-row relative group"
              >
                {/* Event Image */}
                <div className="lg:w-1/3 xl:w-1/4 h-48 lg:h-auto relative shrink-0">
                  {ticket.event?.image ? (
                    <img src={`${ticket.event.image}`} alt={ticket.event.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[#1a1814]"></div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  
                  {/* Status Badge Over Image */}
                  <div className="absolute top-4 left-4 z-20">
                    <span className={`text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full ${
                      ticket.ticketStatus === 'Valid' ? 'bg-green-500/80 text-white shadow-[0_0_10px_rgba(34,197,94,0.3)]' :
                      ticket.ticketStatus === 'Used' ? 'bg-black/50 text-white/70 backdrop-blur-md' :
                      'bg-red-500/80 text-white shadow-[0_0_10px_rgba(239,68,68,0.3)]'
                    }`}>
                      {ticket.ticketStatus}
                    </span>
                  </div>
                </div>

                {/* Ticket Details (Middle Stub) */}
                <div className="p-6 md:p-8 flex-1 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-dashed border-white/20">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-gold-gradient text-xs font-bold uppercase tracking-widest">
                        {ticket.ticketType} <span className="text-[var(--color-ivory-muted)] font-normal ml-2 tracking-normal">x{ticket.quantity}</span>
                      </p>
                    </div>
                    <h3 className="text-2xl font-serif text-[var(--color-ivory)] mb-6 line-clamp-2 pr-4">{ticket.event?.title || 'Event removed'}</h3>
                    
                    {ticket.event && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
                        <div className="flex items-start gap-3 bg-white/[0.02] p-3 rounded-xl border border-white/5">
                          <Calendar size={16} className="text-[#c9a35b] mt-0.5" />
                          <div>
                            <p className="text-[9px] uppercase tracking-widest text-[var(--color-ivory-muted)] mb-1">Date</p>
                            <span className="text-sm font-medium text-[var(--color-ivory)]">{new Date(ticket.event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 bg-white/[0.02] p-3 rounded-xl border border-white/5">
                          <Clock size={16} className="text-[#c9a35b] mt-0.5" />
                          <div>
                            <p className="text-[9px] uppercase tracking-widest text-[var(--color-ivory-muted)] mb-1">Time</p>
                            <span className="text-sm font-medium text-[var(--color-ivory)]">{ticket.event.startTime}</span>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 sm:col-span-2 bg-white/[0.02] p-3 rounded-xl border border-white/5">
                          <MapPin size={16} className="text-[#c9a35b] mt-0.5 shrink-0" />
                          <div>
                            <p className="text-[9px] uppercase tracking-widest text-[var(--color-ivory-muted)] mb-1">Location</p>
                            <span className="text-sm font-medium text-[var(--color-ivory)] line-clamp-1">{ticket.event.location}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* QR Code / Boarding Pass Right Stub */}
                <div className="p-6 md:p-8 lg:w-56 bg-[var(--color-gold)]/[0.02] flex flex-col items-center justify-center shrink-0 relative overflow-hidden">
                   {/* Decorative circle cutouts for the perforated edge */}
                   <div className="hidden lg:block w-8 h-8 rounded-full bg-[#050505] absolute -left-4 -top-4 border-b border-r border-white/[0.05]"></div>
                   <div className="hidden lg:block w-8 h-8 rounded-full bg-[#050505] absolute -left-4 -bottom-4 border-t border-r border-white/[0.05]"></div>
                   
                   <div className="bg-white p-3 rounded-xl mb-4 shadow-[0_0_30px_rgba(212,175,55,0.15)] relative group-hover:shadow-[0_0_40px_rgba(212,175,55,0.3)] transition-shadow">
                     <QRCodeSVG value={ticket.ticketId} size={110} />
                   </div>
                   <p className="text-[11px] font-mono text-white/50 tracking-[0.2em]">{ticket.ticketId}</p>
                   
                   <div className="mt-6 pt-4 border-t border-white/10 w-full text-center flex items-center justify-between lg:block">
                     <p className="text-[9px] text-[var(--color-ivory-muted)] uppercase tracking-widest lg:mb-1">Total Paid</p>
                     <p className="text-2xl font-serif text-gold-gradient"><Price amount={ticket.totalPrice} /></p>
                   </div>
                   
                   {ticket.event?.location && (
                     <a 
                       href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ticket.event.location)}`} 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="mt-4 px-4 py-2 bg-white/5 border border-white/10 rounded hover:bg-white/10 hover:border-white/20 transition-all text-xs font-bold uppercase tracking-widest text-[#c9a35b] flex items-center gap-2"
                     >
                       <MapPin size={12} />
                       Open Map
                     </a>
                   )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
    </div>
  );
}
