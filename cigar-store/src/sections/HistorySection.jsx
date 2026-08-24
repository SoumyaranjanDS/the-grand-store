import './EditorialSections.css';

function HistorySection() {
  return (
    <section id="history" style={{ padding: 0, margin: 0, width: '100%', overflow: 'hidden', background: '#0a0a0a' }}>
      <div style={{ width: '100%', display: 'flex' }}>
        <picture style={{ width: '100vw', display: 'block' }}>
          <source media="(max-width: 768px)" srcSet="/cigar-hist-mob.webp" />
          <img 
            src="/cigar-history.webp" 
            alt="History of Cigars" 
            loading="lazy" 
            style={{ width: '100%', height: 'auto', display: 'block', margin: 0, padding: 0 }}
          />
        </picture>
      </div>
    </section>
  );
}

export default HistorySection;
