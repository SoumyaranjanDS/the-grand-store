export default function PrivacyPage() {
  return (
    <main className="legal-page" style={{ paddingTop: '150px', paddingBottom: '100px' }}>
      <div className="shell">
        <h1 style={{ fontSize: '3rem', fontFamily: 'var(--font-serif)', color: 'var(--color-ivory)', marginBottom: '2rem' }}>Privacy Policy</h1>
        <div style={{ color: 'var(--color-ivory-muted)', lineHeight: '1.8', maxWidth: '800px', fontSize: '1.1rem' }}>
          <p style={{ marginBottom: '1.5rem' }}>
            At the Millionaires Collection, we take your privacy seriously. This privacy policy describes how your personal information is collected, used, and shared when you visit or make a purchase from our store.
          </p>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--color-ivory)', marginTop: '3rem', marginBottom: '1rem', fontFamily: 'var(--font-serif)' }}>Personal Information We Collect</h2>
          <p style={{ marginBottom: '1.5rem' }}>
            When you visit the site, we automatically collect certain information about your device, including information about your web browser, IP address, time zone, and some of the cookies that are installed on your device.
          </p>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--color-ivory)', marginTop: '3rem', marginBottom: '1rem', fontFamily: 'var(--font-serif)' }}>How Do We Use Your Information?</h2>
          <p style={{ marginBottom: '1.5rem' }}>
            We use the order information that we collect generally to fulfill any orders placed through the site (including processing your payment information, arranging for shipping, and providing you with invoices).
          </p>
        </div>
      </div>
    </main>
  )
}
