import React, { useEffect } from "react";
import SiteFooter from "../sections/SiteFooter";

function PrivacyPolicyPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <div className="page-container" style={{ paddingTop: "120px", minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "var(--bg-color, #0d0c0c)" }}>
        <main className="detailed-content" style={{ flex: 1, padding: "40px 5%", maxWidth: "900px", margin: "0 auto", color: "var(--text-primary, #f2efe9)" }}>
          <h1 style={{ fontSize: "48px", marginBottom: "40px", fontFamily: "var(--serif, serif)", color: "var(--brass-light, #c6a87c)", textAlign: "center" }}>Privacy Policy</h1>
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
            
            <h2>1. Introduction</h2>
            <p>The Cigar Connoisseur Club is deeply committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your data when you visit our website or make a purchase. Please read this policy carefully to understand our practices.</p>

            <h2>2. Information We Collect</h2>
            <p>We may collect personal identification information from you in a variety of ways, including, but not limited to, when you visit our site, register on the site, place an order, subscribe to the newsletter, and in connection with other activities, services, features, or resources we make available.</p>
            <ul>
                <li style={{marginBottom: "5px"}}><strong>Personal Data:</strong> Name, email address, shipping address, billing address, phone number, and date of birth (for mandatory age verification).</li>
                <li style={{marginBottom: "5px"}}><strong>Financial Data:</strong> We do not store full credit card numbers on our servers. Payment processing is handled by secure, PCI-compliant third-party gateways.</li>
                <li style={{marginBottom: "5px"}}><strong>Usage Data:</strong> Information about how you navigate and interact with our website, including IP address, browser type, device information, and pages visited.</li>
            </ul>

            <h2>3. How We Use Your Information</h2>
            <p>We use the information we collect primarily to provide, maintain, and improve our services. Specifically, we use your data to:</p>
            <ul>
                <li style={{marginBottom: "5px"}}>Process and fulfill your orders, including sending transactional emails.</li>
                <li style={{marginBottom: "5px"}}>Verify that you are of legal smoking age.</li>
                <li style={{marginBottom: "5px"}}>Improve our customer service and respond efficiently to your support needs.</li>
                <li style={{marginBottom: "5px"}}>Personalize user experience and understand how our users as a group use the services and resources provided on our site.</li>
                <li style={{marginBottom: "5px"}}>Send periodic emails containing news, updates, and promotions (only if you have opted in).</li>
            </ul>

            <h2>4. Information Sharing and Disclosure</h2>
            <p>We do not sell, trade, or rent your personal identification information to others. We may share generic aggregated demographic information not linked to any personal identification information regarding visitors and users with our business partners, trusted affiliates, and advertisers.</p>
            <p>We may use third-party service providers to help us operate our business and the site or administer activities on our behalf, such as age verification services, payment processing, shipping, and sending out newsletters. We may share your information with these third parties for those limited purposes provided that you have given us your permission.</p>

            <h2>5. Data Security</h2>
            <p>We adopt appropriate data collection, storage, and processing practices and security measures to protect against unauthorized access, alteration, disclosure, or destruction of your personal information, username, password, transaction information, and data stored on our site. Sensitive and private data exchange between the site and its users happens over an SSL secured communication channel and is encrypted and protected with digital signatures.</p>

            <h2>6. Your Rights</h2>
            <p>Depending on your location, you may have the right to request access to the personal information we hold about you, to request that we correct inaccuracies, to request deletion of your personal data, or to restrict the processing of your information. To exercise these rights, please contact our Data Protection Officer at privacy@cigarconnoisseurclub.com.</p>
        
          </div>
        </main>
        <SiteFooter />
      </div>
    </>
  );
}

export default PrivacyPolicyPage;
