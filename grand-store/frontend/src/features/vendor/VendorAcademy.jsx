import React from 'react';
import { PlayCircle, MessageCircle, HelpCircle, PhoneCall, BookOpen } from 'lucide-react';

export default function VendorAcademy() {
  const goldTextClass = "text-[#c9a35b] drop-shadow-[0_0_12px_rgba(230,201,122,0.6)]";
  const videos = [
    { title: "How to sell more on Grand Store", duration: "4:12" },
    { title: "How to photograph wine bottles", duration: "6:45" },
    { title: "How to write great product descriptions", duration: "3:30" },
    { title: "Understanding your dashboard payouts", duration: "5:00" },
    { title: "How to prepare and pack orders safely", duration: "8:20" },
    { title: "Selling to trade customers", duration: "7:15" },
  ];

  return (
    <div className="flex flex-col gap-10 w-full max-w-7xl mx-auto pb-10">
      
      {/* Header */}
      <section>
        <h1 className="text-[var(--color-ivory)] font-serif text-5xl mb-4 leading-tight">
          Vendor <span className={goldTextClass} >Academy</span>
        </h1>
        <p className="text-[var(--color-ivory-muted)] text-lg max-w-2xl font-light leading-relaxed">
          Master the marketplace. Learn how to optimize your store, photograph your products, and grow your sales.
        </p>
      </section>

      {/* Video Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((vid, idx) => (
          <div key={idx} className="group cursor-pointer">
            <div className="relative w-full aspect-video bg-[#0a0a0a] rounded-2xl border border-white/5 overflow-hidden mb-4 group-hover:border-[var(--color-gold)]/40 transition-colors">
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-colors z-10">
                <PlayCircle size={48} className="text-white/50 group-hover:text-gold-gradient transition-colors group-hover:scale-110 duration-300" />
              </div>
              <div className="absolute bottom-3 right-3 bg-black/80 px-2 py-1 rounded text-[10px] text-white font-mono z-20">
                {vid.duration}
              </div>
            </div>
            <h4 className="text-[var(--color-ivory)] font-serif text-lg group-hover:text-gold-gradient transition-colors">{vid.title}</h4>
          </div>
        ))}
      </section>

      {/* Support Section */}
      <section className="mt-8 border-t border-white/[0.05] pt-12">
        <h3 className="text-2xl font-serif text-[var(--color-ivory)] mb-6 text-center">Need direct assistance?</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { title: "WhatsApp Support", icon: MessageCircle, action: "Chat Now", color: "text-green-500", bg: "bg-green-500/10" },
            { title: "Create Ticket", icon: HelpCircle, action: "Submit Issue", color: "text-gold-gradient", bg: "bg-[var(--color-gold)]/10" },
            { title: "Help Centre", icon: BookOpen, action: "Read Docs", color: "text-blue-500", bg: "bg-blue-500/10" },
            { title: "Request a Call", icon: PhoneCall, action: "Book Time", color: "text-purple-500", bg: "bg-purple-500/10" },
          ].map((support, idx) => (
            <div key={idx} className="p-6 border-b border-white/10 flex flex-col items-center text-center hover:border-white/20 transition-colors cursor-pointer">
              <div className={`p-4 rounded-full ${support.bg} ${support.color} mb-4`}>
                <support.icon size={24} />
              </div>
              <h5 className="text-[var(--color-ivory)] font-medium mb-1">{support.title}</h5>
              <span className={`text-[10px] uppercase tracking-widest font-bold ${support.color}`}>{support.action} &rarr;</span>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
