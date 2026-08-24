import React, { useEffect } from "react";
import SiteFooter from "../sections/SiteFooter";

function CookiesPolicyPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <div className="page-container" style={{ paddingTop: "120px", minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "var(--bg-color, #0d0c0c)" }}>
        <main className="detailed-content" style={{ flex: 1, padding: "40px 5%", maxWidth: "900px", margin: "0 auto", color: "var(--text-primary, #f2efe9)" }}>
          <h1 style={{ fontSize: "48px", marginBottom: "40px", fontFamily: "var(--serif, serif)", color: "var(--brass-light, #c6a87c)", textAlign: "center" }}>Cookies Policy</h1>
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
            
            <h2>1. What Are Cookies?</h2>
            <p>Cookies are small text files that are placed on your computer or mobile device by websites that you visit. They are widely used in order to make websites work, or work more efficiently, as well as to provide reporting information to the site owners. Cookies enable our systems to recognize your browser and capture and remember certain information.</p>

            <h2>2. How We Use Cookies</h2>
            <p>The Cigar Connoisseur Club uses cookies to understand and save your preferences for future visits and compile aggregate data about site traffic and site interaction so that we can offer better site experiences and tools in the future. We use the following types of cookies:</p>
            
            <h3>Strictly Necessary Cookies</h3>
            <p>These cookies are essential for you to browse the website and use its features, such as accessing secure areas of the site (e.g., your shopping cart, checkout process, and age verification status). Without these cookies, services you have asked for cannot be provided.</p>

            <h3>Performance and Analytics Cookies</h3>
            <p>These cookies collect information about how visitors use a website, for instance, which pages visitors go to most often, and if they get error messages from web pages. These cookies don't collect information that identifies a visitor. All information these cookies collect is aggregated and therefore anonymous. It is only used to improve how a website works.</p>

            <h3>Functionality Cookies</h3>
            <p>These cookies allow the website to remember choices you make (such as your user name, language, or the region you are in) and provide enhanced, more personal features. These cookies can also be used to remember changes you have made to text size, fonts, and other parts of web pages that you can customize.</p>

            <h3>Targeting or Advertising Cookies</h3>
            <p>These cookies are used to deliver advertisements more relevant to you and your interests. They are also used to limit the number of times you see an advertisement as well as help measure the effectiveness of the advertising campaign. They are usually placed by advertising networks with the website operator's permission.</p>

            <h2>3. Managing Cookies</h2>
            <p>You can choose to have your computer warn you each time a cookie is being sent, or you can choose to turn off all cookies. You do this through your browser settings. Since each browser is a little different, look at your browser's Help Menu to learn the correct way to modify your cookies. Please note that if you turn cookies off, some features will be disabled that make your site experience more efficient, and some of our services may not function properly (such as retaining items in your shopping cart).</p>

            <h2>4. Changes to This Policy</h2>
            <p>We may update this Cookies Policy from time to time in order to reflect, for example, changes to the cookies we use or for other operational, legal, or regulatory reasons. Please revisit this Cookie Policy regularly to stay informed about our use of cookies and related technologies.</p>
        
          </div>
        </main>
        <SiteFooter />
      </div>
    </>
  );
}

export default CookiesPolicyPage;
