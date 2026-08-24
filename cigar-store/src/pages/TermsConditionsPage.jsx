import React, { useEffect } from "react";
import SiteFooter from "../sections/SiteFooter";

function TermsConditionsPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <div className="page-container" style={{ paddingTop: "120px", minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "var(--bg-color, #0d0c0c)" }}>
        <main className="detailed-content" style={{ flex: 1, padding: "40px 5%", maxWidth: "900px", margin: "0 auto", color: "var(--text-primary, #f2efe9)" }}>
          <h1 style={{ fontSize: "48px", marginBottom: "40px", fontFamily: "var(--serif, serif)", color: "var(--brass-light, #c6a87c)", textAlign: "center" }}>Terms & Conditions</h1>
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
            <p>Welcome to the Cigar Connoisseur Club. These Terms and Conditions govern your use of our website and the purchase of our products. By accessing this site, you agree to be bound by these terms in full. If you disagree with any part of these terms, you must not use our website.</p>

            <h2>2. Age Verification and Legal Compliance</h2>
            <p><strong>STRICT AGE POLICY:</strong> The sale of tobacco products to minors is strictly prohibited by law. By using this site, you certify that you are of legal smoking age in your jurisdiction (e.g., 18 years or older in South Africa, 21 years or older in the United States). We employ advanced third-party age verification systems. We reserve the right to cancel any order if we suspect the purchaser is underage or purchasing on behalf of a minor. Falsifying your age to purchase tobacco is a violation of the law.</p>

            <h2>3. Product Information and Pricing</h2>
            <p>We make every effort to display our products accurately. However, because premium cigars are handmade, natural variations in wrapper color, size, and band design may occur. Prices are subject to change without prior notice. In the event of a pricing error on our website, we reserve the right to cancel any orders placed for the incorrectly priced item and issue a full refund.</p>

            <h2>4. Shipping, Delivery, and Risk of Loss</h2>
            <p>All items purchased from the Cigar Connoisseur Club are made pursuant to a shipment contract. This means that the risk of loss and title for such items pass to you upon our delivery to the carrier. We ensure that all cigars are shipped with proper humidification (e.g., Boveda packs) to maintain optimal condition during transit. However, it is your responsibility to ensure that your shipping destination legally permits the importation of tobacco products.</p>

            <h2>5. Returns and Exchanges</h2>
            <p>Due to the perishable nature of our products, returns are generally not accepted unless the product is defective or damaged upon arrival. If you receive a damaged product, you must contact our customer support within 48 hours of delivery with photographic evidence. Approved returns will be issued store credit or a replacement. We do not accept returns based on personal taste preferences.</p>

            <h2>6. Intellectual Property</h2>
            <p>All content on this website, including but not limited to text, graphics, logos, images, and software, is the property of the Cigar Connoisseur Club or its content suppliers and is protected by international copyright laws. Unauthorized reproduction, modification, or distribution of this content is strictly prohibited.</p>
            
            <h2>7. Amendments</h2>
            <p>We reserve the right to amend these Terms and Conditions at any time. Any changes will be posted on this page, and your continued use of the site following the posting of changes constitutes your acceptance of such changes.</p>
        
          </div>
        </main>
        <SiteFooter />
      </div>
    </>
  );
}

export default TermsConditionsPage;
