import React, { useEffect } from 'react';
import VendorHeroSection from '../sections/VendorHeroSection';
import VendorSplitSection from '../sections/VendorSplitSection';
import VendorFeaturesGrid from '../sections/VendorFeaturesGrid';
import VendorPortalFeatures from '../sections/VendorPortalFeatures';
import SiteFooter from '../sections/SiteFooter';
import './VendorPortalPage.css';

function VendorPortalPage() {
  useEffect(() => {
    // Scroll to top when page mounts
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="vendor-portal-page">
      <VendorHeroSection />
      
      <VendorSplitSection 
        title="Elevate Your Brand"
        subtitle="Join Our World-Class Liquor Marketplace!"
        paragraphs={[
          "Welcome to the world of spirits! Our online liquor store is the ultimate destination for spirits enthusiasts looking for a variety of high-quality products from around the world.",
          "We are thrilled to invite suppliers like you to join our online store and reach out to a vast market of customers. Partnering with us is an opportunity to showcase your products on a global platform and reach a wider audience than ever before."
        ]}
        buttonText="JOIN NOW"
        buttonLink="https://grandstore.co.za/vendor-registration"
        imageAlign="right"
        backgroundUrl="https://ik.imagekit.io/thegrandstore/images/media/section1leftbg_32zwds5tOo.png"
      />

      <div className="vendor-portal-page__light-section">
        <div className="vendor-portal-page__text-container">
          <p>Our online store is a hub for customers from all corners of the world, and our easy-to-use platform makes it seamless for you to manage your products, inventory, and orders with ease.</p>
          <p>We are passionate about providing our customers with a seamless shopping experience, and we are constantly seeking suppliers who share our commitment to quality and customer satisfaction. Our team is dedicated to providing you with the support and resources you need to thrive in our marketplace, including access to our customer base, marketing and promotional opportunities, and personalized assistance from our team of seasoned professionals.</p>
          <p>Joining our online liquor store as a supplier is an exciting opportunity to showcase your products to a global audience and increase your sales. Submitting an application to become a supplier is easy, and we cannot wait to partner with you to bring your products to our loyal customers. Thank you for considering our online store as a platform to showcase your products, and we cannot wait to work with you to provide our customers with an unforgettable experience.</p>
        </div>
      </div>

      <VendorFeaturesGrid />

      <div className="vendor-portal-page__light-section">
        <div className="vendor-portal-page__text-container">
          <p>By partnering with our online liquor store, you will have the opportunity to tap into a vast and loyal customer base that is always on the lookout for high-quality spirits and related accessories. Our online store attracts customers from all over the world who are looking for unique and premium products, and with our easy-to-use platform, you can easily showcase your products and reach a wider audience.</p>
          <p>We are confident that by joining our online store, you will be able to expand your customer base and increase your sales. Our team is dedicated to providing you with the necessary support and resources to succeed in our marketplace, including access to our customer base, marketing and promotional opportunities, and personalized assistance from our experienced team of professionals. As a leading retailer in the spirits industry, we are committed to providing our customers with the best products and shopping experience, and we're excited to have you on board to help us achieve this goal.</p>
          <p>Your high-quality products and dedication to customer satisfaction will add immense value to our online store and help us create an unforgettable experience for our customers.</p>
        </div>
      </div>

      <VendorSplitSection 
        title="Reach your customers"
        subtitle="at The Grand Store"
        paragraphs={[
          "The Grand Store brings together an array of liquor brands for customers to choose from. Give your brand exposure to a host of potential customers by listing and selling your products on grandstore.co.za. The Grand Store facilitates the marketing and sale of the products, takes care of all the logistics and shipping (should you require) and retains a percentage of the sale price.",
          "Joining our online liquor store is an excellent opportunity for you to showcase your products to a vast and ready client base, and we are confident that with our partnership, we can achieve great success in the world of spirits."
        ]}
        buttonText="JOIN NOW"
        buttonLink="https://grandstore.co.za/vendor-registration"
        imageAlign="left"
        backgroundUrl="https://ik.imagekit.io/thegrandstore/images/media/section1leftbg_32zwds5tOo.png"
      />

      <VendorPortalFeatures />

      {/* Eligible categories and Pricing block */}
      <div className="vendor-portal-page__info-blocks">
        <div className="vendor-portal-page__info-row">
          <div className="vendor-portal-page__info-content">
            <h4 className="vendor-portal-page__info-title">Eligible categories</h4>
            <h5 className="vendor-portal-page__info-subtitle">The Grand Store features all liquor beverages including wine, spirits and beer.</h5>
            <p>We are able to feature certain liquor related products such as promotional items. Please contact us for more details. Some of the categories of liquor have specific guidelines, which you can read more about on the Vendor Page of our website We have certain requirements with which all sellers must comply.</p>
            <p>More details can be found on our website or by contacting us directly. We are dedicated to working closely with our third-party vendors and we will endeavour to respond to all queries within 48 hours.</p>
          </div>
          <div className="vendor-portal-page__info-img">
            <img src="https://grandstore.co.za/public/front/assets/img/Eligible%20categories-1.png" alt="Eligible categories" />
          </div>
        </div>

        <div className="vendor-portal-page__info-row vendor-portal-page__info-row--reverse">
          <div className="vendor-portal-page__info-content">
            <h4 className="vendor-portal-page__info-title">Pricing and payment</h4>
            <p>The pricing of each product is carefully managed by our products team who takes into consideration the best market related pricing, and we remain competitive with all our stock.</p>
            <p>Pricing decisions are made in collaboration with third-party vendors and The Grand Store will advise vendors when adjustments are recommended based on promotional deal opportunities etc.</p>
            <p>Vendors will be paid the settlement fee within 30 days of the stock being received by the customer. The settlement fee is the price paid by the customer less any shipping costs and The Grand Store transaction fee.</p>
          </div>
          <div className="vendor-portal-page__info-img">
            <img src="https://grandstore.co.za/public/front/assets/img/Pricing%20and%20payment-1.png" alt="Pricing and payment" />
          </div>
        </div>

        <div className="vendor-portal-page__info-row">
          <div className="vendor-portal-page__info-content">
            <h4 className="vendor-portal-page__info-title">Deliveries</h4>
            <p>Since The Grand Store is committed to service excellence.</p>
            <p>We are able to handle the delivery process from start to finish. There are two options available to you when it comes to shipping your products to the customer and you may select the option that is preferrable for you when confirming each order. Please view the Trade page on our website for details.</p>
          </div>
          <div className="vendor-portal-page__info-img">
            <img src="https://grandstore.co.za/public/front/assets/img/delivery-img.jpeg" alt="Deliveries" />
          </div>
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}

export default VendorPortalPage;
