import { Link } from 'react-router-dom'
import { ArrowRight, Calendar, Clock } from 'lucide-react'

const blogPosts = [
  {
    slug: 'top-10-must-try-premium-liquors-available-at-the-grand-store',
    title: 'Top 10 Must-Try Premium Liquors Available at The Grand Store',
    date: '14 Apr 2025',
    readTime: '5 min read',
    category: 'The Grand Edit',
    image: '/assets/blogs/premium-liquors.jpg',
    excerpt: 'A considered shortlist of celebrated Scotch, polished vodka, fine Cognac and distinctly South African bottles curated for the modern cabinet.',
  },
  {
    slug: 'top-south-african-brandy-brands-you-can-order-online',
    title: 'Top South African Brandy Brands You Can Order Online',
    date: '26 Mar 2025',
    readTime: '4 min read',
    category: 'Brandy Journal',
    image: '/assets/blogs/south-african-brandy-brands.jpeg',
    excerpt: 'From Stellenbosch oak maturation to Robertson heritage, meet the local master distillers giving Cape potstill its world-class acclaim.',
  },
  {
    slug: 'top-10-whiskey-brands-you-can-buy-online-in-south-africa',
    title: 'Top 10 Whiskey Brands You Can Buy Online in South Africa',
    date: '19 Mar 2025',
    readTime: '6 min read',
    category: 'Whisky Journal',
    image: '/assets/blogs/whiskey-brands.jpg',
    excerpt: 'Homegrown favourites and international icons for collectors discovering their next elegant everyday dram or investment bottle.',
  },
]

export default function LatestBlogs() {
  return (
    <section 
      className="py-[48px] md:py-[60px] border-t border-white/10 bg-[#0a0a0a] relative overflow-hidden" 
      id="journal" 
      aria-labelledby="latest-blogs-title"
    >
      {/* Ambient background glow */}
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[300px] bg-[var(--color-gold)]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-[1240px] mx-auto px-6 sm:px-0 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 md:mb-10 gap-4 md:gap-8">
          <div className="text-left">
            <div className="text-[10px] md:text-xs uppercase tracking-widest font-semibold text-[#918a7f] mb-1.5 flex items-center gap-2">
              <span className="w-5 h-px bg-[#b58b38] inline-block" />
              Cellar Dispatches & Stories
            </div>
            <h2 
              id="latest-blogs-title" 
              className="m-0 font-serif text-[clamp(40px,3.8vw,62px)] font-medium tracking-[-0.02em] leading-[1.05] text-[#eee8dd]"
            >
              The{' '}
              <span 
                className="gold-gradient-text inline-block pr-2 text-[1.12em]"
                
              >
                Journal
              </span>
            </h2>
            <p className="max-w-[600px] mt-3 text-[rgba(244,238,224,0.76)] text-[15px] md:text-[16px] leading-[1.65]">
              <span className="font-serif text-[#f0cf76] italic text-[1.06em]">Stories of provenance.</span>{' '}
              Shortlists, distillery visits and the bottles worth knowing.
            </p>
          </div>
          <Link 
            className="inline-flex items-center gap-2.5 pb-[6px] border-b border-[#bd9054] text-[#e1bd70] text-[13px] font-semibold tracking-[0.13em] uppercase transition-colors hover:text-white shrink-0" 
            to="/blogs"
          >
            Read all stories <ArrowRight size={15} />
          </Link>
        </div>
        
        {/* Blog Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7 items-stretch">
          {blogPosts.map((post, index) => (
            <article 
              key={post.slug}
              className="group rounded-2xl border border-white/10 bg-[#11100d] hover:border-[#c9a35b]/50 hover:bg-[#15120e] hover:shadow-[0_16px_40px_rgba(0,0,0,0.6)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xl text-left"
            >
              {/* 16:9 Uncropped Image Container */}
              <Link 
                className="relative block overflow-hidden aspect-video w-full bg-[#14120e]" 
                to={`/blog/${post.slug}`}
              >
                <img 
                  className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.02]" 
                  src={post.image} 
                  alt={post.title} 
                  loading="lazy" 
                />
              </Link>

              {/* Card Body */}
              <div className="p-5 md:p-6 flex flex-col flex-1 justify-between">
                <div>
                  {/* Meta Information with Category Pill */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] md:text-[11px] uppercase tracking-widest font-bold text-gold-gradient bg-[#c9a35b]/10 px-2.5 py-0.5 rounded-full border border-[#c9a35b]/20">
                      {post.category}
                    </span>
                    <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#918a7f]">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} className="text-[#c9a35b]" /> {post.date}
                      </span>
                      <span>•</span>
                      <span>{post.readTime}</span>
                    </div>
                  </div>

                  {/* Blog Title */}
                  <h3 className="m-0 font-serif text-lg md:text-[21px] font-medium leading-[1.3] text-[#eee8dd] group-hover:text-[#f0cf76] transition-colors">
                    <Link to={`/blog/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h3>

                  {/* Blog Excerpt */}
                  <p className="mt-2.5 mb-4 text-[#a8a195] text-[13px] md:text-[14px] leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>

                {/* Read Link Action */}
                <Link 
                  className="pt-3.5 border-t border-white/10 flex items-center justify-between text-gold-gradient text-xs md:text-sm font-semibold tracking-wider uppercase group-hover:text-white transition-colors" 
                  to={`/blog/${post.slug}`}
                >
                  <span>Read Dispatch</span>
                  <ArrowRight size={15} className="transform group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  )
}
