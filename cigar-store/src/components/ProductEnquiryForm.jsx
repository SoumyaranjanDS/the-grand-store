import { ArrowUpRight } from 'lucide-react';

function ProductEnquiryForm({ product }) {
  return (
    <section className="product-enquiry" id="product-enquiry">
      <div className="product-enquiry__heading">
        <p>Private assistance</p>
        <h2>Product <em>Enquiry</em></h2>
        <span>Tell us what you need and the club will assist with availability.</span>
      </div>

      <form className="product-enquiry__form" onSubmit={(event) => event.preventDefault()}>
        <input type="hidden" name="product" value={product.name} />
        <label><span>Your name</span><input name="name" type="text" required /></label>
        <label><span>Email</span><input name="email" type="email" required /></label>
        <label><span>Phone</span><input name="phone" type="tel" required /></label>
        <label><span>Quantity</span><input name="quantity" type="number" min="1" defaultValue="1" required /></label>
        <button type="submit">Submit enquiry <ArrowUpRight size={17} strokeWidth={1.4} /></button>
      </form>
    </section>
  );
}

export default ProductEnquiryForm;
