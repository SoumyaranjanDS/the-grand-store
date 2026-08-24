import React, { useEffect } from "react";
import SiteFooter from "../sections/SiteFooter";

function TermsServicePage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <div className="page-container" style={{ paddingTop: "120px", minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "var(--bg-color, #0d0c0c)" }}>
        <main className="detailed-content" style={{ flex: 1, padding: "40px 5%", maxWidth: "900px", margin: "0 auto", color: "var(--text-primary, #f2efe9)" }}>
          <h1 style={{ fontSize: "48px", marginBottom: "40px", fontFamily: "var(--serif, serif)", color: "var(--brass-light, #c6a87c)", textAlign: "center" }}>Terms of Service</h1>
          <div style={{ fontSize: "16px", lineHeight: "1.9", color: "var(--text-secondary, #a39c94)" }}>
            <style>
              {`
                .detailed-content h2 { color: var(--brass-light, #c6a87c); font-family: var(--serif, serif); font-size: 28px; margin-top: 40px; margin-bottom: 20px; font-weight: 500; }
                .detailed-content h3 { color: var(--text-primary, #f2efe9); font-family: var(--sans, sans-serif); font-size: 20px; margin-top: 30px; margin-bottom: 15px; font-weight: 600; }
                .detailed-content p { margin-bottom: 25px; }
                .detailed-content ul { margin-bottom: 25px; padding-left: 20px; }
                .detailed-content li { margin-bottom: 10px; }
                .detailed-content strong { color: var(--text-primary, #f2efe9); font-weight: 600; }
              `}
            </style>
            
            <h2>1. Acceptance of Terms</h2>
            <p>By registering an account, purchasing products, or otherwise utilizing the services provided by the Cigar Connoisseur Club (the "Service"), you agree to abide by these Terms of Service. These terms constitute a legally binding agreement between you and the Cigar Connoisseur Club.</p>

            <h2>2. User Accounts and Security</h2>
            <p>To access certain features of the Service, you may be required to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account or any other breach of security. We will not be liable for any loss or damage arising from your failure to protect your login information.</p>

            <h2>3. User Conduct</h2>
            <p>You agree not to use the Service for any unlawful purpose or in any way that interrupts, damages, or impairs the service. Prohibited behaviors include, but are not limited to:</p>
            <ul>
                <li style={{marginBottom: "5px"}}>Attempting to bypass our age verification systems.</li>
                <li style={{marginBottom: "5px"}}>Using automated scripts, bots, or scrapers to access the site.</li>
                <li style={{marginBottom: "5px"}}>Engaging in fraudulent transactions or using stolen financial information.</li>
                <li style={{marginBottom: "5px"}}>Posting defamatory, offensive, or inappropriate content in our review sections or forums.</li>
            </ul>

            <h2>4. Termination of Service</h2>
            <p>We reserve the right to suspend or terminate your account and refuse any and all current or future use of the Service at our sole discretion, without notice or liability, for any reason whatsoever, including without limitation if you breach these Terms of Service.</p>

            <h2>5. Limitation of Liability</h2>
            <p>In no event shall the Cigar Connoisseur Club, its directors, employees, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Service; (ii) any conduct or content of any third party on the Service; (iii) any products obtained from the Service; and (iv) unauthorized access, use, or alteration of your transmissions or content.</p>

            <h2>6. Governing Law</h2>
            <p>These Terms shall be governed and construed in accordance with the laws of South Africa, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.</p>
        
          </div>
        </main>
        <SiteFooter />
      </div>
    </>
  );
}

export default TermsServicePage;
