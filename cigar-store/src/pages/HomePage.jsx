import ScrollVideoHero from '../sections/ScrollVideoHero';
import MissionSection from '../sections/MissionSection';
import HistorySection from '../sections/HistorySection';
import ProductShowcase from '../sections/ProductShowcase';
import MosiSection from '../sections/MosiSection';
import TestimonialsSection from '../sections/TestimonialsSection';
import NewsletterSection from '../sections/NewsletterSection';
import SiteFooter from '../sections/SiteFooter';
import { mosiProducts, featuredMosiProducts } from '../data/homeContent';

function HomePage() {
  return (
    <div className="site-shell" id="top">
      <main>
        <ScrollVideoHero />
        <MissionSection />
        <HistorySection />
        <ProductShowcase
          id="new-arrivals"
          eyebrow="Just landed"
          title="New arrival products"
          intro="Fresh additions to the humidor, selected from respected houses around the world."
          products={mosiProducts}
        />
        <MosiSection />
        <ProductShowcase
          id="featured-products"
          eyebrow="From the humidor"
          title="Featured products"
          intro="Recently added to our store and chosen for character, construction, and provenance."
          products={featuredMosiProducts}
          tone="light"
        />
        <TestimonialsSection />
        <NewsletterSection />
      </main>
      <SiteFooter />
    </div>
  );
}

export default HomePage;
