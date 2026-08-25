import { Gift, Share2, ShoppingBag, Sparkles, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import FooterPageShell from './FooterPageShell'

const steps = [
  { icon: Share2, title: 'Share Your Unique Referral Code', text: "Once you're logged into your dashboard, you'll find your unique referral code. Share this code with your friends through social media, email, or direct messages." },
  { icon: ShoppingBag, title: 'Your Friends Sign Up and Make Their First Purchase', text: 'When your friends sign up using your referral code and make their first purchase, they’ll enjoy an exclusive discount as a welcome gift!' },
  { icon: Gift, title: 'Earn Rewards Instantly', text: 'For every successful referral, you earn a generous reward credited directly to your account. Use these rewards for discounts on future orders or to explore new selections from our collection.' },
  { icon: TrendingUp, title: 'Track Your Referrals', text: 'Easily monitor your progress and rewards in the Refer and Earn section of your dashboard. See how many friends you have referred and how much you have earned!' },
]

const benefits = [
  ['Easy and Fun', 'Simply share your code, and we handle the rest.'],
  ['Exclusive Perks', 'Get rewarded for every successful referral.'],
  ['Unlimited Potential', 'There’s no cap on how many friends you can refer or rewards you can earn!'],
]

export default function ReferEarnPage() {
  return (
    <FooterPageShell eyebrow="Refer & Earn" title="Refer and Earn Program — Get Rewarded!" intro='Share the love of our online liquor store with your friends and family, and enjoy rewards when they make their first purchase.' wide>
      <section className="grid gap-12 lg:grid-cols-[.85fr_1.15fr] lg:items-center">
        <div className="relative overflow-hidden border border-[#d99d39]/25 bg-[radial-gradient(circle_at_top_right,rgba(217,157,57,.2),transparent_24rem),#11110f] p-9 sm:p-12">
          <Sparkles className="mb-7 text-[#d99d39]" size={38} strokeWidth={1.3} />
          <p className="mb-3 text-xs uppercase tracking-[0.22em] text-[#d99d39]">Unlock Rewards</p>
          <h2 className="font-serif text-4xl leading-tight text-[#f2ede4]">Start referring now</h2>
          <p className="mt-5 leading-8 text-[#bcb3a7]">Invite friends to discover premium wines and spirits. They receive a welcome benefit, and you earn a reward for each successful referral.</p>
          <Link className="mt-8 inline-flex items-center justify-center bg-[#e1bd70] px-8 py-4 text-sm font-bold uppercase tracking-widest text-black transition-all hover:bg-white hover:text-black hover:shadow-[0_0_20px_rgba(225,189,112,0.4)]" to="/customer/profile">Go to your dashboard</Link>
        </div>
        <div className="grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2">
          {steps.map(({ icon: Icon, title, text }, index) => (
            <article className="bg-[#0f0f0d] p-7" key={title}>
              <div className="mb-5 flex items-center justify-between"><Icon className="text-[#d99d39]" size={25} strokeWidth={1.4} /><span className="font-serif text-2xl text-white/15">0{index + 1}</span></div>
              <h3 className="font-serif text-xl leading-snug text-[#f2ede4]">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-[#aaa196]">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="pt-16 text-center">
        <p className="mb-3 text-xs uppercase tracking-[0.22em] text-[#d99d39]">Why Join the Program?</p>
        <h2 className="font-serif text-3xl text-[#f2ede4] sm:text-4xl">More people, more rewards</h2>
        <div className="mx-auto mt-9 grid max-w-4xl gap-5 md:grid-cols-3">
          {benefits.map(([title, text]) => <article className="border border-white/10 bg-[#10100e] p-7" key={title}><h3 className="font-serif text-xl text-[#d99d39]">{title}</h3><p className="mt-3 text-sm leading-7 text-[#aaa196]">{text}</p></article>)}
        </div>
        <p className="mx-auto mt-12 max-w-3xl font-serif text-2xl leading-10 text-[#eee6da]">Start sharing today and enjoy the benefits of spreading good times with great company. Let’s raise a glass to you, our valued customer!</p>
      </section>
    </FooterPageShell>
  )
}
