import React, { useEffect } from "react";
import SiteFooter from "../sections/SiteFooter";

function AboutPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <div
        className="page-container"
        style={{
          paddingTop: "120px",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "var(--bg-color, #0d0c0c)",
        }}
      >
        <main
          className="detailed-content"
          style={{
            flex: 1,
            padding: "40px 5%",
            maxWidth: "900px",
            margin: "0 auto",
            color: "var(--text-primary, #f2efe9)",
          }}
        >
          <h1
            style={{
              fontSize: "48px",
              marginBottom: "40px",
              fontFamily: "var(--serif, serif)",
              color: "var(--brass-light, #c6a87c)",
              textAlign: "center",
            }}
          >
            About Us
          </h1>
          <div
            style={{
              fontSize: "16px",
              lineHeight: "1.9",
              color: "var(--text-secondary, #a39c94)",
            }}
          >
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
            <p>
              Welcome to our online cigar store! We are proud to offer a wide
              range of premium cigars from around the world, including
              hand-rolled cigars, machine-made cigars, and cigar accessories.
              Our mission is to provide our customers with the highest quality
              products and excellent customer service. We understand that cigar
              smoking is more than just a hobby - it's a passion. That's why we
              are committed to providing a diverse selection of cigars to cater
              to different preferences, from mild to full-bodied and everything
              in between. In addition to cigars, we also offer cigar accessories
              such as cutters, lighters, humidors, and cigar cases to enhance
              your smoking experience. Our team of experts is dedicated to
              providing the best advice and recommendations on choosing the
              right products to meet your needs. At our online cigar store, we
              strive to create an enjoyable and hassle-free shopping experience
              for our customers. We offer competitive prices, fast shipping, and
              a 100% satisfaction guarantee. Whether you're a seasoned cigar
              aficionado or a beginner looking to explore the world of cigars,
              we have something for everyone. Thank you for choosing our online
              cigar store, and we look forward to serving you!
            </p>

            <h2>A Cut Above The Rest</h2>
            <p>
              Our innovative approach illustrates our ability to offer our
              customers the utmost value for money. Through unprecedented
              involvement in every step of the process, we have raised the
              clubs. Our elite range of products is in line with international
              trends. We have focused on intricate details from top sommeliers
              and connoisseurs that offer high quality products and topped with
              scheduled, timeous deliveries. We make sure that our products are
              thoroughly checked right from the start to the final stage of
              production/supply under the presence of qualified quality
              inspectors.
            </p>
            <p>
              The Cigar Connoisseur Club is committed to excellence in every
              sphere. Our online, innovative approach will ensure that you have
              a great online shopping experience accompanied with superior
              customer service.
            </p>

            <h2>Our Strength</h2>
            <p>
              We work relentlessly with our team to bring professionalism and
              zeal to outperform our competitors.
            </p>
            <p>
              Our team of highly experienced professionals is empowered with
              sophisticated infrastructure. We are fully immersed and dedicated
              and our extensive industry knowledge backed by a network of
              resourceful contacts, gives us a better understanding of market
              requirements. Our experience in the liquor and wine industry has
              granted us increasing accolades across the industry.
            </p>

            <h2>Our Patrons</h2>
            <p>
              Optimum pricing together with on-schedule delivery has made us
              immensely popular among our wide clientele across the country. We
              boast a committed client who enable our quest for excellence by
              consistently ordering from Cigar Connoisseur Club.
            </p>
            <p>Wine is a lifestyle!</p>
            <p>Best cigar are the ones we to take with friends.</p>


            <h2>Our Motto</h2>
            <p>The Ultimate Destination for Cigar Enthusiasts</p>

            <h2>Mission Statement</h2>
            <p>
              Our mission is to create an online cigar shopping experience that
              is easy, convenient, and enjoyable for everyone. We believe that
              every customer deserves the best, which is why we offer a wide
              selection of high-quality cigars, competitive prices, and
              exceptional customer service. We are committed to building
              long-lasting relationships with our customers, and to making the
              world of cigars accessible to everyone.
            </p>
          </div>
        </main>
        <SiteFooter />
      </div>
    </>
  );
}

export default AboutPage;
