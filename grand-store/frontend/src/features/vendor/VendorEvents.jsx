import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Calendar, PlusCircle, CalendarDays, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function VendorEvents() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/events/vendor', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setEvents(res.data);
      } catch (error) {
        console.error('Failed to load vendor events', error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchEvents();
  }, [user]);

  const scriptFont = { fontFamily: "'Dancing Script', cursive" };

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto pb-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-[var(--color-ivory)] font-serif text-4xl mb-2 flex items-center gap-4">
            <div className="p-3 bg-[var(--color-gold)]/10 text-[var(--color-gold)] rounded-xl border border-[var(--color-gold)]/20 shadow-[0_0_15px_rgba(212,175,55,0.1)]">
              <CalendarDays size={28} />
            </div>
            My <span className="text-gold-gradient ml-2" style={scriptFont}>Events</span>
          </h1>
          <p className="text-[var(--color-ivory-muted)] text-sm max-w-2xl font-light">
            Manage your tastings, masterclasses, and virtual experiences. 
          </p>
        </div>
        
        <button 
          onClick={() => navigate('/vendor/event-add')}
          className="bg-gold-gradient text-black font-bold uppercase tracking-widest text-xs px-6 py-3 rounded-full flex items-center gap-2 hover:scale-105 transition-transform"
        >
          <PlusCircle size={16} /> Create New Event
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20 text-[var(--color-gold)]">Loading...</div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 bg-white/[0.02] border border-white/5 rounded-2xl">
          <CalendarDays size={48} className="mx-auto text-white/20 mb-4" />
          <h3 className="text-xl font-serif text-white mb-2">No events scheduled</h3>
          <p className="text-[var(--color-ivory-muted)] mb-6">Host your first tasting or masterclass today.</p>
          <button 
            onClick={() => navigate('/vendor/event-add')}
            className="border border-[var(--color-gold)] text-[var(--color-gold)] px-6 py-2 rounded-full uppercase tracking-widest text-xs font-bold hover:bg-[var(--color-gold)] hover:text-black transition-colors"
          >
            Create Event
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(event => (
            <div key={event._id} className="bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden hover:border-[var(--color-gold)]/40 transition-colors">
              <div className="aspect-video w-full relative">
                {event.image ? (
                  <img src={`http://localhost:5000${event.image}`} alt={event.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-white/5 flex items-center justify-center">
                    <Calendar size={32} className="text-white/20" />
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold text-white border border-white/10">
                  {event.type}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-serif text-white mb-2">{event.title}</h3>
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-[var(--color-ivory-muted)]">
                    <Calendar size={14} className="text-[var(--color-gold)]" />
                    <span>{new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {event.startTime}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[var(--color-ivory-muted)]">
                    <MapPin size={14} className="text-[var(--color-gold)]" />
                    <span>{event.format === 'Virtual' ? 'Virtual Event' : event.location}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="text-xs uppercase tracking-widest text-[var(--color-gold)] font-bold">
                    {event.approvalStatus}
                  </div>
                  <button 
                    onClick={() => navigate(`/events/${event._id}`)}
                    className="text-xs uppercase tracking-widest text-white hover:text-[var(--color-gold)] transition-colors underline underline-offset-4"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
