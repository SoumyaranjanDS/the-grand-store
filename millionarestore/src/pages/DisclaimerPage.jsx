export default function DisclaimerPage() {
  return (
    <main className="legal-page" style={{ paddingTop: '150px', paddingBottom: '100px' }}>
      <div className="shell">
        <h1 style={{ fontSize: '3rem', fontFamily: 'var(--font-serif)', color: 'var(--color-ivory)', marginBottom: '2rem' }}>Disclaimer</h1>
        <div style={{ color: 'var(--color-ivory-muted)', lineHeight: '1.8', maxWidth: '800px', fontSize: '1.1rem' }}>
          <p style={{ marginBottom: '1.5rem' }}>
            The information contained on this website is for general information purposes only. The information is provided by the Millionaires Collection and while we endeavour to keep the information up to date and correct, we make no representations or warranties of any kind.
          </p>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--color-ivory)', marginTop: '3rem', marginBottom: '1rem', fontFamily: 'var(--font-serif)' }}>Alcohol Consumption</h2>
          <p style={{ marginBottom: '1.5rem' }}>
            Our products contain alcohol. Please enjoy responsibly and in moderation. Do not drink and drive. Consumption of alcoholic beverages impairs your ability to drive a car or operate machinery, and may cause health problems.
          </p>
        </div>
      </div>
    </main>
  )
}
