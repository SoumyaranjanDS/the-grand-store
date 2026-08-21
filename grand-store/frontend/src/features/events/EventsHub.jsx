import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Calendar, MapPin, Users, Filter } from 'lucide-react';
import Price from '../../components/ui/Price';

export default function EventsHub() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('All');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/events`);
        setEvents(res.data);
      } catch (error) {
        console.error('Failed to load events', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const filteredEvents = filterType === 'All' 
    ? events 
    : events.filter(e => e.type === filterType || (filterType === 'Virtual' && e.format === 'Virtual'));

  const categories = ['All', 'Wine Tasting', 'Whisky Experience', 'Masterclass', 'Virtual'];

  return (
    <div className="min-h-screen bg-[#0a0907] pt-0 pb-20 px-4 text-[#eee8dd]">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 relative">
          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[400px] h-[300px] bg-[#c9a35b]/10 blur-[120px] rounded-full pointer-events-none"></div>
          
          {/* Header Section */}
          <div className="relative">
            <h1 className="text-4xl md:text-5xl font-serif text-[#eee8dd] mb-2">
              Grand Store <span className="text-[#c9a35b] drop-shadow-[0_0_12px_rgba(230,201,122,0.6)]">Events</span>
            </h1>
            <p className="text-[#918a7f] text-xs md:text-sm uppercase tracking-widest">
              Taste. Discover. Experience.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 md:gap-3 relative">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilterType(cat)}
                className={`px-4 md:px-6 py-2 rounded-full border text-[10px] md:text-xs font-semibold tracking-wider uppercase transition-colors ${
                  filterType === cat 
                  ? 'bg-gold-gradient border-[#c9a35b] text-black shadow-[0_0_15px_rgba(201,163,91,0.3)]' 
                  : 'bg-white/[0.02] border-white/10 text-[#918a7f] hover:bg-white/[0.05] hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Event Grid */}
        {loading ? (
          <div className="text-center py-20 text-gold-gradient">Loading experiences...</div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-20 bg-white/[0.02] border border-white/5 rounded-2xl">
            <h3 className="text-2xl font-serif mb-2">No upcoming events</h3>
            <p className="text-[#918a7f]">Check back later for new tastings and masterclasses.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map(event => (
              <div key={event._id} className="group relative bg-[#11100d] border border-white/5 rounded-2xl overflow-hidden hover:border-[#c9a35b]/30 transition-all hover:shadow-[0_0_30px_rgba(201,163,91,0.1)] flex flex-col">
                <div className="aspect-[4/3] overflow-hidden relative">
                  {event.image ? (
                    <img src={`${import.meta.env.VITE_API_URL}${event.image}`} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full bg-[#1a1814] flex items-center justify-center">
                      <span className="text-[#918a7f] font-serif">Grand Store</span>
                    </div>
                  )}
                  <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md px-3 py-1 rounded border border-white/10 text-xs font-bold uppercase tracking-wider text-gold-gradient">
                    {event.type}
                  </div>
                  {event.format === 'Virtual' && (
                    <div className="absolute top-4 right-4 bg-blue-500/80 backdrop-blur-md px-3 py-1 rounded border border-white/10 text-xs font-bold uppercase tracking-wider text-white">
                      Virtual
                    </div>
                  )}
                </div>
                
                <div className="p-6 flex flex-col flex-grow">
                  <div className="text-[10px] uppercase tracking-widest text-[#918a7f] font-bold mb-2 flex justify-between items-center">
                    <span>{new Date(event.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <span>{event.startTime}</span>
                  </div>
                  
                  <h3 className="text-xl font-serif text-white mb-4 line-clamp-2">{event.title}</h3>
                  
                  <div className="space-y-2 mb-6 text-sm text-[#918a7f]">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-gold-gradient shrink-0" />
                      <span className="truncate">{event.format === 'Virtual' ? 'Online Experience' : `${event.city || 'Local'}, ${event.location}`}</span>
                    </div>
                    {event.capacity && (
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-gold-gradient shrink-0" />
                        <span>Limited to {event.capacity} places</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-[#918a7f]">From</p>
                      <p className="text-lg font-serif text-gold-gradient">
                        <Price amount={Math.min(...event.ticketTiers.map(t => t.price))} />
                      </p>
                    </div>
                    <Link 
                      to={`/events/${event._id}`} 
                      className="px-6 py-2 bg-white/5 hover:bg-gold-gradient hover:text-black text-white rounded font-bold uppercase tracking-wider text-sm transition-colors border border-white/10 hover:border-[#c9a35b]"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
