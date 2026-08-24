import React, { useEffect } from "react";
import SiteFooter from "../sections/SiteFooter";

function ContactPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <div className="page-container" style={{ paddingTop: "120px", minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "var(--bg-color, #0d0c0c)" }}>
        <main className="detailed-content" style={{ flex: 1, padding: "40px 5%", maxWidth: "900px", margin: "0 auto", color: "var(--text-primary, #f2efe9)" }}>
          <h1 style={{ fontSize: "48px", marginBottom: "40px", fontFamily: "var(--serif, serif)", color: "var(--brass-light, #c6a87c)", textAlign: "center" }}>Contact Us</h1>
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
            
            <h2>Get In Touch</h2>
            <p>We are always delighted to hear from fellow aficionados. Whether you have a question about a specific blend, need a recommendation for an upcoming celebration, or require assistance with an existing order, our team of cigar experts is at your service.</p>
            
            <h2>Customer Support</h2>
            <p>Our dedicated customer support team is available to ensure your experience with the Cigar Connoisseur Club is nothing short of exceptional. We strive to respond to all inquiries within 24 hours.</p>
            <ul>
                <li style={{marginBottom: "10px"}}><strong>Email:</strong> info@cigarconnoisseurclub.com</li>
                <li style={{marginBottom: "10px"}}><strong>Phone:</strong> +27 82 496 7256</li>
                <li style={{marginBottom: "10px"}}><strong>Hours of Operation:</strong> Monday - Friday, 9:00 AM - 6:00 PM (SAST)</li>
            </ul>

            <h2>Visit Our Lounge</h2>
            <p>Experience our collection in person. Our flagship lounge offers a state-of-the-art walk-in humidor, comfortable seating, and a curated selection of fine spirits to pair with your cigar of choice.</p>
            <p><strong>Address:</strong><br/>
            Cigar Connoisseur Club<br/>
            C/O Nivarp International (Pty) Ltd<br/>
            PO Box 1022, Saxonwold, 2196<br/>
            Rosebank Mall, Johannesburg<br/>
            South Africa</p>

            <h2>Wholesale and Press Inquiries</h2>
            <p>For wholesale partnerships, corporate gifting, event hosting, and press inquiries, please direct your correspondence to our administrative office at partnerships@cigarconnoisseurclub.com. Our team will review your proposal and respond promptly to discuss potential collaborations.</p>
        
          </div>
        </main>
        <SiteFooter />
      </div>
    </>
  );
}

export default ContactPage;
