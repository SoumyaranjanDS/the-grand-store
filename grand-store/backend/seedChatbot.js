/**
 * Chatbot Seed Script
 * Seeds the MongoDB database with comprehensive Q&A knowledge base entries.
 * Run with: node seedChatbot.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const ChatbotFAQ = require('./models/ChatbotFAQ');

const faqs = [
  // ──────────── ORDERS ────────────
  {
    category: 'Orders',
    priority: 10,
    keywords: ['place', 'order', 'buy', 'purchase', 'how to order', 'ordering'],
    question: 'How do I place an order?',
    answer:
      'Placing an order is simple! Browse our shop, add items to your cart, proceed to checkout, fill in your shipping details, and complete payment via PayFast. You will receive a confirmation email once the order is placed.',
  },
  {
    category: 'Orders',
    priority: 9,
    keywords: ['track', 'tracking', 'where is my order', 'order status', 'delivery status'],
    question: 'How can I track my order?',
    answer:
      'You can track your order by logging in and visiting My Account → My Orders. Your order status will show as Pending, Processing, Shipped, or Delivered. Once shipped, a tracking number will be visible on your order page.',
  },
  {
    category: 'Orders',
    priority: 8,
    keywords: ['cancel', 'cancellation', 'cancel order'],
    question: 'Can I cancel my order?',
    answer:
      'Orders can be cancelled before they are shipped. Please contact us on WhatsApp at +27765809522 as soon as possible. Once shipped, cancellation is not possible, but you may initiate a return after delivery.',
  },
  {
    category: 'Orders',
    priority: 7,
    keywords: ['invoice', 'receipt', 'proof of purchase', 'bill'],
    question: 'How do I get my invoice?',
    answer:
      'Your invoice is automatically emailed to you after your order is confirmed. You can also download it from My Account → My Orders by clicking on the specific order.',
  },
  {
    category: 'Orders',
    priority: 6,
    keywords: ['order pending', 'still pending', 'not confirmed', 'order not updated'],
    question: 'My order shows "Pending" — what does that mean?',
    answer:
      "\"Pending\" means we have received your order and are waiting for payment confirmation from PayFast. This usually updates within a few minutes. If it stays Pending for more than 30 minutes after payment, please contact us on WhatsApp at +27765809522.",
  },
  {
    category: 'Orders',
    priority: 5,
    keywords: ['modify', 'change order', 'edit order', 'update order'],
    question: 'Can I modify my order after placing it?',
    answer:
      'Order modifications (changing items, quantity, or address) can only be made before your order is processed. Please contact us immediately on WhatsApp at +27765809522 with your order number.',
  },

  // ──────────── PAYMENTS ────────────
  {
    category: 'Payments',
    priority: 10,
    keywords: ['payfast', 'pay fast', 'payment gateway', 'how to pay'],
    question: 'What is PayFast and how does it work?',
    answer:
      'PayFast is a trusted South African payment gateway. When you checkout, you will be redirected to PayFast where you can pay using credit/debit card, Instant EFT, SnapScan, Mobicred, or other methods. It is fully secure and encrypted.',
  },
  {
    category: 'Payments',
    priority: 9,
    keywords: ['payment method', 'accepted payment', 'credit card', 'debit card', 'eft', 'snapscan'],
    question: 'What payment methods are accepted?',
    answer:
      'We accept all payment methods supported by PayFast, including: Visa/Mastercard credit & debit cards, Instant EFT, SnapScan, Mobicred, and more. All transactions are processed in South African Rand (ZAR).',
  },
  {
    category: 'Payments',
    priority: 8,
    keywords: ['payment failed', 'payment declined', 'card declined', 'payment not working'],
    question: 'My payment failed. What should I do?',
    answer:
      'If your payment failed, please check: (1) Your card has sufficient funds, (2) You entered the correct card details, (3) Your bank has not blocked the transaction. If it still fails, try a different payment method on PayFast, or contact us on WhatsApp at +27765809522.',
  },
  {
    category: 'Payments',
    priority: 7,
    keywords: ['refund', 'money back', 'get my money back', 'refund policy'],
    question: 'How do refunds work?',
    answer:
      'Refunds are processed within 5–7 business days back to your original payment method. Refunds are issued for: cancelled orders (before shipping), damaged items received, or incorrect items delivered. Contact us on WhatsApp at +27765809522 to initiate a refund.',
  },
  {
    category: 'Payments',
    priority: 6,
    keywords: ['double charged', 'charged twice', 'duplicate payment'],
    question: 'I was charged twice for the same order. What do I do?',
    answer:
      'Please contact us immediately on WhatsApp at +27765809522 with your order number and a screenshot of the duplicate charges. We will investigate and process a refund for the duplicate charge within 3–5 business days.',
  },

  // ──────────── SHIPPING ────────────
  {
    category: 'Shipping',
    priority: 10,
    keywords: ['shipping', 'delivery', 'deliver', 'how long', 'how fast', 'arrive'],
    question: 'How long does delivery take?',
    answer:
      'Standard delivery takes 3–5 business days within South Africa. Express delivery (1–2 business days) is available at checkout for select areas. Remote areas may take up to 7 business days.',
  },
  {
    category: 'Shipping',
    priority: 9,
    keywords: ['shipping cost', 'delivery fee', 'delivery charge', 'how much delivery'],
    question: 'How much does shipping cost?',
    answer:
      'Shipping fees are calculated at checkout based on your location and order weight. We offer FREE shipping on orders above a certain amount — check our homepage for current promotions. Postnet-to-Postnet delivery is also available at reduced rates.',
  },
  {
    category: 'Shipping',
    priority: 8,
    keywords: ['deliver to', 'delivery area', 'where do you deliver', 'deliver nationwide'],
    question: 'Where do you deliver?',
    answer:
      'We deliver nationwide across South Africa. We partner with reliable couriers and Postnet to ensure your order reaches you safely. Some remote areas may have longer delivery times.',
  },
  {
    category: 'Shipping',
    priority: 7,
    keywords: ['postnet', 'collect', 'pudo', 'pickup'],
    question: 'Can I collect my order at a Postnet branch?',
    answer:
      'Yes! We offer Postnet-to-Postnet delivery. Select "Postnet" as your delivery method at checkout, choose your preferred Postnet branch, and collect once you receive the collection SMS/email.',
  },
  {
    category: 'Shipping',
    priority: 6,
    keywords: ['free shipping', 'free delivery', 'no shipping fee'],
    question: 'Do you offer free shipping?',
    answer:
      'Yes! We offer free shipping on qualifying orders. Check the banner on our homepage for the current free shipping threshold. Promotions may change periodically.',
  },

  // ──────────── RETURNS ────────────
  {
    category: 'Returns & Refunds',
    priority: 10,
    keywords: ['return', 'return policy', 'how to return', 'send back', 'exchange'],
    question: 'What is your return policy?',
    answer:
      'We accept returns within 7 days of delivery for items that are: damaged/broken on arrival, incorrect items (wrong product sent), or defective products. Items must be unused and in original packaging. Alcohol products cannot be returned unless damaged.',
  },
  {
    category: 'Returns & Refunds',
    priority: 9,
    keywords: ['broken', 'damaged', 'damaged product', 'broken bottle', 'leaking'],
    question: 'I received a damaged item. What do I do?',
    answer:
      'We are sorry about that! Please take photos of the damaged item and packaging, then contact us on WhatsApp at +27765809522 within 24 hours of receiving your order. We will arrange a replacement or full refund immediately.',
  },
  {
    category: 'Returns & Refunds',
    priority: 8,
    keywords: ['wrong item', 'wrong product', 'incorrect order', 'wrong order'],
    question: 'I received the wrong item. What should I do?',
    answer:
      'We apologize for this error. Please photograph the incorrect item and contact us on WhatsApp at +27765809522 with your order number. We will arrange collection of the wrong item and delivery of the correct one at no extra cost.',
  },

  // ──────────── PRODUCTS ────────────
  {
    category: 'Products',
    priority: 10,
    keywords: ['out of stock', 'unavailable', 'not available', 'sold out', 'when back in stock'],
    question: 'A product I want is out of stock. When will it be available?',
    answer:
      'Stock levels depend on our vendors. If a product is out of stock, you can contact us on WhatsApp at +27765809522 to inquire about restocking timelines. You can also browse similar products in the same category on our shop.',
  },
  {
    category: 'Products',
    priority: 9,
    keywords: ['alcohol', 'liquor', 'spirits', 'wine', 'beer', 'champagne'],
    question: 'Do you sell alcohol?',
    answer:
      'Yes, The Grand Store is a licensed retailer of premium alcoholic beverages including wine, champagne, spirits, whisky, cognac, beer, and more. All purchasers must be 18 years or older in accordance with South African law.',
  },
  {
    category: 'Products',
    priority: 8,
    keywords: ['genuine', 'authentic', 'real', 'counterfeit', 'original'],
    question: 'Are your products genuine and authentic?',
    answer:
      'Absolutely. All products on The Grand Store are sourced from verified vendors and authorized distributors. We do not sell counterfeit goods. All vendors go through a vetting process before listing on our platform.',
  },
  {
    category: 'Products',
    priority: 7,
    keywords: ['product review', 'review', 'rating', 'feedback', 'write review'],
    question: 'Can I leave a review for a product?',
    answer:
      'Yes! After receiving your order, you can leave a review on the product page. Your feedback helps other shoppers and our vendors improve their service. Login to your account to access the review option.',
  },
  {
    category: 'Products',
    priority: 6,
    keywords: ['compare', 'product comparison', 'compare products'],
    question: 'Can I compare products?',
    answer:
      'Yes! Use the Compare feature on any product card to add up to 3 products for side-by-side comparison. Access your comparison list from the header icon or visit /customer/compare.',
  },
  {
    category: 'Products',
    priority: 5,
    keywords: ['wishlist', 'save', 'favourite', 'saved products'],
    question: 'How do I add items to my wishlist?',
    answer:
      'Click the heart icon on any product card to add it to your wishlist. You can view your wishlist under My Account → My Wishlist. You must be logged in to use the wishlist feature.',
  },

  // ──────────── ACCOUNT ────────────
  {
    category: 'Account',
    priority: 10,
    keywords: ['register', 'sign up', 'create account', 'new account'],
    question: 'How do I create an account?',
    answer:
      "Click 'Register' in the top menu or visit /register. Fill in your name, email, and password. You can also sign up with Google for faster access. Once registered, you'll have full access to your dashboard, orders, wishlist, and more.",
  },
  {
    category: 'Account',
    priority: 9,
    keywords: ['forgot password', 'reset password', 'change password', 'lost password', 'cant login'],
    question: 'I forgot my password. How do I reset it?',
    answer:
      "On the login page, click 'Forgot Password'. Enter your registered email address and we'll send you a password reset link. Check your spam folder if you don't see the email within a few minutes.",
  },
  {
    category: 'Account',
    priority: 8,
    keywords: ['update profile', 'change email', 'change name', 'edit profile', 'profile'],
    question: 'How do I update my profile information?',
    answer:
      'Login to your account and go to My Account → Profile. You can update your name, phone number, and address. To change your email address, contact us on WhatsApp at +27765809522.',
  },
  {
    category: 'Account',
    priority: 7,
    keywords: ['delete account', 'close account', 'remove account', 'deactivate'],
    question: 'How do I delete my account?',
    answer:
      'To request account deletion, please contact us on WhatsApp at +27765809522 or email support. Note that deleting your account will remove all your order history and personal data permanently.',
  },
  {
    category: 'Account',
    priority: 6,
    keywords: ['login problem', 'cannot login', 'login error', 'access denied', 'account locked'],
    question: 'I cannot log in to my account. What should I do?',
    answer:
      "Try these steps: (1) Check your email and password are correct, (2) Click 'Forgot Password' to reset your password, (3) Try a different browser or clear cookies/cache. If the problem persists, contact us on WhatsApp at +27765809522.",
  },

  // ──────────── VENDORS ────────────
  {
    category: 'Vendors',
    priority: 10,
    keywords: ['become vendor', 'sell', 'vendor registration', 'sell on grandstore', 'list products', 'supplier'],
    question: 'How do I become a vendor on The Grand Store?',
    answer:
      "Visit the Vendor Portal at /vendor-portal or click 'Become a Vendor' in the footer. Fill in your business details and pay the vendor registration fee via PayFast. After approval, you'll get access to your vendor dashboard to list products.",
  },
  {
    category: 'Vendors',
    priority: 9,
    keywords: ['vendor fee', 'registration fee', 'cost to sell', 'vendor cost'],
    question: 'How much does it cost to register as a vendor?',
    answer:
      "There is a once-off vendor registration fee charged via PayFast at the time of registration. The exact fee is displayed during the vendor onboarding process. After payment and admin approval, your vendor account is activated.",
  },
  {
    category: 'Vendors',
    priority: 8,
    keywords: ['vendor dashboard', 'vendor portal', 'manage products', 'vendor login'],
    question: 'How do I access my vendor dashboard?',
    answer:
      'Login with your vendor account and navigate to /vendor/dashboard. From there you can manage your products, view orders, track earnings, update your store, and access your wallet.',
  },
  {
    category: 'Vendors',
    priority: 7,
    keywords: ['vendor payment', 'vendor payout', 'withdraw', 'vendor wallet', 'earnings'],
    question: 'How does vendor payout work?',
    answer:
      'Your earnings from sales are tracked in your Vendor Wallet. Payouts are processed periodically by the admin. You can view your balance and payout history in your vendor dashboard under Wallet.',
  },

  // ──────────── AUCTIONS ────────────
  {
    category: 'Auctions',
    priority: 10,
    keywords: ['auction', 'bid', 'bidding', 'how auction works', 'live auction'],
    question: 'How do auctions work on The Grand Store?',
    answer:
      'Our auction platform allows you to bid on premium and rare products. Each auction lot has a starting price, minimum bid increment, and end time. The highest bidder at the end time wins. Visit /auction to browse all active lots.',
  },
  {
    category: 'Auctions',
    priority: 9,
    keywords: ['won auction', 'auction winner', 'winning bid', 'i won'],
    question: 'I won an auction. How do I pay?',
    answer:
      'Congratulations! You will receive an email notification when you win. Login to your account, go to My Account → My Auctions, and click "Pay Now" to complete payment via PayFast within 24 hours of winning.',
  },
  {
    category: 'Auctions',
    priority: 8,
    keywords: ['outbid', 'lost auction', 'bid beaten', 'someone bid higher'],
    question: 'I was outbid. Will I be notified?',
    answer:
      'Yes! If someone places a higher bid than yours, you will receive a notification email. You can then place a new higher bid before the auction ends. Keep an eye on your auction dashboard to stay updated.',
  },
  {
    category: 'Auctions',
    priority: 7,
    keywords: ['auction payment', 'auction refund', 'auction cancel'],
    question: 'Can I cancel after winning an auction?',
    answer:
      'Auction wins are binding. Once you win, payment must be completed within 24 hours. Failure to pay may result in account suspension. If you have extenuating circumstances, contact us on WhatsApp at +27765809522.',
  },

  // ──────────── EVENTS ────────────
  {
    category: 'Events',
    priority: 10,
    keywords: ['event', 'ticket', 'book ticket', 'event booking', 'event ticket'],
    question: 'How do I book an event ticket?',
    answer:
      'Visit /events to browse all upcoming events. Click on an event to view details, then click "Book Ticket" and complete payment via PayFast. Your ticket will be emailed to you immediately after payment.',
  },
  {
    category: 'Events',
    priority: 9,
    keywords: ['event cancel', 'cancel ticket', 'event refund', 'ticket refund'],
    question: 'Can I cancel my event ticket?',
    answer:
      'Event ticket cancellations must be requested at least 48 hours before the event. Contact us on WhatsApp at +27765809522 with your booking reference. Cancellations within 48 hours of the event are non-refundable.',
  },
  {
    category: 'Events',
    priority: 8,
    keywords: ['tasting', 'wine tasting', 'book tasting', 'tasting event'],
    question: 'How do I book a wine tasting?',
    answer:
      'Visit /bookatasting to browse and book wine tasting experiences offered by our estate partners. Select a date, number of guests, and complete payment to confirm your reservation.',
  },

  // ──────────── AGE VERIFICATION ────────────
  {
    category: 'Age Policy',
    priority: 10,
    keywords: ['age', '18', 'age verification', 'age restriction', 'minor', 'underage'],
    question: 'Why do I need to verify my age?',
    answer:
      'South African law requires all alcohol purchases to be made by individuals 18 years or older. We verify your age to comply with the Liquor Act. Age verification is a one-time prompt per device session.',
  },

  // ──────────── CONTACT ────────────
  {
    category: 'Contact',
    priority: 10,
    keywords: ['contact', 'speak to', 'talk to', 'reach you', 'get in touch', 'support', 'help'],
    question: 'How can I contact The Grand Store?',
    answer:
      'You can reach us on WhatsApp at +27765809522 — simply click the WhatsApp button and send us a message. You can also visit our Contact page at /contact-us. We typically respond within a few hours during business hours.',
  },
  {
    category: 'Contact',
    priority: 9,
    keywords: ['whatsapp', 'whats app', 'phone number', 'call'],
    question: 'What is your WhatsApp number?',
    answer:
      'Our WhatsApp number is +27765809522. You can message us directly on WhatsApp for order queries, support, or general inquiries. We are available Monday–Friday, 8am–5pm SAST.',
  },
  {
    category: 'Contact',
    priority: 8,
    keywords: ['email', 'email address', 'email us'],
    question: 'Do you have an email address I can contact?',
    answer:
      'Yes, you can also reach us via our Contact Us page at /contact-us where you can fill out a message form. Alternatively, message us on WhatsApp at +27765809522 for a faster response.',
  },
  {
    category: 'Contact',
    priority: 7,
    keywords: ['business hours', 'opening hours', 'when are you open', 'operating hours'],
    question: 'What are your business hours?',
    answer:
      'Our customer support team is available Monday to Friday, 8:00 AM – 5:00 PM SAST (South Africa Standard Time). WhatsApp messages outside these hours will be responded to on the next business day.',
  },

  // ──────────── WEBSITE / GENERAL ────────────
  {
    category: 'General',
    priority: 5,
    keywords: ['currency', 'rand', 'zar', 'price currency', 'which currency'],
    question: 'What currency are prices shown in?',
    answer:
      'All prices on The Grand Store are shown in South African Rand (ZAR). You can use the currency selector in the header to view approximate prices in other currencies for reference, but checkout is always processed in ZAR.',
  },
  {
    category: 'General',
    priority: 4,
    keywords: ['gift', 'gift wrap', 'gift message', 'send as gift', 'gift packaging'],
    question: 'Can I send an order as a gift?',
    answer:
      'Yes! During checkout, you can add a gift message to your order. Our team will include a personalized message card with the delivery. For special gift wrapping or premium presentation, contact us on WhatsApp at +27765809522.',
  },
  {
    category: 'General',
    priority: 3,
    keywords: ['newsletter', 'subscribe', 'email updates', 'promotions', 'deals', 'unsubscribe'],
    question: 'How do I subscribe to or unsubscribe from your newsletter?',
    answer:
      "To subscribe, enter your email in the newsletter section in the footer of our website. To unsubscribe, click the 'Unsubscribe' link at the bottom of any newsletter email we send you.",
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    // Clear existing entries to avoid duplicates on re-seed
    await ChatbotFAQ.deleteMany({});
    console.log('🗑️  Cleared existing chatbot FAQs');

    await ChatbotFAQ.insertMany(faqs);
    console.log(`✅ Seeded ${faqs.length} FAQ entries successfully`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
};

seed();
