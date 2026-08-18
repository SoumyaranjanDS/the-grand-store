import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

const blogPosts = [
  {
    slug: 'top-10-must-try-premium-liquors-available-at-the-grand-store',
    title: 'Top 10 Must-Try Premium Liquors Available at The Grand Store',
    date: '14 Apr 2025',
    category: 'The Grand Edit',
    image: '/assets/blogs/premium-liquors.jpg',
    excerpt: 'A considered shortlist of celebrated Scotch, polished vodka, fine Cognac and distinctly South African bottles for the modern cabinet.',
  },
  {
    slug: 'top-south-african-brandy-brands-you-can-order-online',
    title: 'Top South African Brandy Brands You Can Order Online',
    date: '26 Mar 2025',
    category: 'Brandy Journal',
    image: '/assets/blogs/south-african-brandy-brands.jpeg',
    excerpt: 'From Stellenbosch oak to Robertson heritage, meet the local distillers giving Cape brandy its world-class reputation.',
  },
  {
    slug: 'top-10-whiskey-brands-you-can-buy-online-in-south-africa',
    title: 'Top 10 Whiskey Brands You Can Buy Online in South Africa',
    date: '19 Mar 2025',
    category: 'Whisky Journal',
    image: '/assets/blogs/whiskey-brands.jpg',
    excerpt: 'Homegrown favourites and international icons for collectors discovering their next elegant everyday dram.',
  },
]

export default function LatestBlogs() {
  return (
    <section 
      className="py-[62px] pb-[70px] border-t border-white/10 bg-[#0b0a08] bg-[radial-gradient(circle_at_84%_18%,rgba(139,88,27,0.12),transparent_28rem)]" 
      id="journal" 
      aria-labelledby="latest-blogs-title"
    >
      <div className="max-w-[1240px] mx-auto px-6 sm:px-0">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-[30px] gap-3 md:gap-[35px]">
          <div>
            <p className="flex items-center gap-3 m-0 text-[#e1bd70] text-xs font-semibold tracking-[0.2em] uppercase">
              From the journal
            </p>
            <h2 
              id="latest-blogs-title" 
              className="m-[5px_0_0] font-serif text-[clamp(34px,3.4vw,48px)] font-medium tracking-[-0.035em] leading-[1.1] text-[#eee8dd]"
            >
              Latest Blogs
            </h2>
          </div>
          <p className="max-w-[390px] m-0 text-[#817a70] font-serif text-[14px] leading-[1.5]">
            Stories of provenance, craft and the bottles worth knowing.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[14px]">
          {blogPosts.map((post, index) => (
            <article 
              className="group overflow-hidden border border-[#e1bd70]/15 bg-[#141310]" 
              key={post.slug}
            >
              <Link 
                className="relative block overflow-hidden aspect-[1.78] after:absolute after:inset-0 after:content-[''] after:bg-[linear-gradient(180deg,transparent_55%,rgba(5,4,3,0.5))]" 
                to={`/blog/${post.slug}`}
              >
                <img 
                  className="w-full h-full object-cover transition-transform duration-[550ms] ease group-hover:scale-[1.035]" 
                  src={post.image} 
                  alt="" 
                  loading="lazy" 
                />
                <span className="absolute right-[14px] bottom-[11px] z-10 text-[#f2e6cf]/75 font-serif text-[16px]">
                  0{index + 1}
                </span>
              </Link>
              <div className="p-[22px_23px_24px]">
                <p className="m-[0_0_10px] text-[#e1bd70] text-[8px] tracking-[0.13em] uppercase">
                  {post.category} <span className="mx-1">·</span> {post.date}
                </p>
                <h3 className="min-h-[48px] m-0 font-serif text-[22px] font-medium leading-[1.12] text-[#eee8dd]">
                  <Link className="hover:text-[#e1bd70] transition-colors" to={`/blog/${post.slug}`}>
                    {post.title}
                  </Link>
                </h3>
                <p className="line-clamp-3 min-h-[54px] m-[14px_0_18px] text-[#817a70] text-[11px] leading-[1.58]">
                  {post.excerpt}
                </p>
                <Link 
                  className="inline-flex items-center pb-[5px] border-b border-[#e1bd70]/40 gap-2 text-[#d9d0c1] text-[9px] font-[650] tracking-[0.11em] uppercase hover:text-[#e1bd70] hover:border-[#e1bd70] transition-colors" 
                  to={`/blog/${post.slug}`}
                >
                  Read the story <ArrowRight size={15} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
