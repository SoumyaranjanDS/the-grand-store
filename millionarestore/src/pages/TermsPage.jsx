export default function TermsPage() {
  return (
    <main className="legal-page" style={{ paddingTop: '150px', paddingBottom: '100px' }}>
      <div className="shell">
        <h1 style={{ fontSize: '3rem', fontFamily: 'var(--font-serif)', color: 'var(--color-ivory)', marginBottom: '2rem' }}>Terms & Conditions</h1>
        <div style={{ color: 'var(--color-ivory-muted)', lineHeight: '1.8', maxWidth: '800px', fontSize: '1.1rem' }}>
          <p style={{ marginBottom: '1.5rem' }}>
            Welcome to the Millionaires Collection. These terms and conditions outline the rules and regulations for the use of our website and the purchase of our premium products.
          </p>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--color-ivory)', marginTop: '3rem', marginBottom: '1rem', fontFamily: 'var(--font-serif)' }}>1. Acceptance of Terms</h2>
          <p style={{ marginBottom: '1.5rem' }}>
            By accessing this website we assume you accept these terms and conditions. Do not continue to use the website if you do not agree to take all of the terms and conditions stated on this page.
          </p>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--color-ivory)', marginTop: '3rem', marginBottom: '1rem', fontFamily: 'var(--font-serif)' }}>2. Age Restriction</h2>
          <p style={{ marginBottom: '1.5rem' }}>
            You must be of legal drinking age in your country of residence to purchase our products. By placing an order, you confirm that you meet this requirement.
          </p>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--color-ivory)', marginTop: '3rem', marginBottom: '1rem', fontFamily: 'var(--font-serif)' }}>3. Products & Pricing</h2>
          <p style={{ marginBottom: '1.5rem' }}>
            All prices are subject to change without notice. We reserve the right to modify or discontinue products without prior warning.
          </p>
        </div>
      </div>
    </main>
  )
}
