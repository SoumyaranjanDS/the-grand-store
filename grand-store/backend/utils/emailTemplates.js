const BRAND_COLOR_GOLD = '#c9a35b';
const BRAND_COLOR_DARK = '#050505';
const BRAND_COLOR_LIGHT = '#f5f5f5';

const formatRand = (amount) => `R ${Number(amount || 0).toFixed(2)}`;

const generateEmailTemplate = (title, content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: ${BRAND_COLOR_DARK};
      color: ${BRAND_COLOR_LIGHT};
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #0a0a0a;
      border: 1px solid #222;
    }
    .header {
      padding: 40px 20px;
      text-align: center;
      background-color: ${BRAND_COLOR_DARK};
      border-bottom: 2px solid ${BRAND_COLOR_GOLD};
    }
    .logo {
      font-family: 'Times New Roman', Times, serif;
      font-size: 28px;
      font-weight: bold;
      color: ${BRAND_COLOR_LIGHT};
      text-transform: uppercase;
      letter-spacing: 4px;
      margin: 0;
    }
    .logo-gold {
      color: ${BRAND_COLOR_GOLD};
    }
    .content {
      padding: 40px 30px;
      line-height: 1.6;
      font-size: 16px;
      color: #e0e0e0;
    }
    h1, h2, h3 {
      color: ${BRAND_COLOR_GOLD};
      font-family: 'Times New Roman', Times, serif;
      font-weight: normal;
      margin-top: 0;
    }
    h1 {
      font-size: 24px;
      letter-spacing: 1px;
      margin-bottom: 20px;
    }
    .btn {
      display: inline-block;
      padding: 12px 30px;
      background-color: ${BRAND_COLOR_GOLD};
      color: ${BRAND_COLOR_DARK};
      text-decoration: none;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-size: 14px;
      margin-top: 20px;
      border-radius: 2px;
    }
    .footer {
      padding: 30px;
      text-align: center;
      background-color: ${BRAND_COLOR_DARK};
      border-top: 1px solid #222;
      font-size: 12px;
      color: #888;
      letter-spacing: 0.5px;
    }
    .divider {
      height: 1px;
      background-color: #222;
      margin: 30px 0;
    }
    .details-box {
      background-color: #111;
      border: 1px solid #333;
      padding: 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .details-box p {
      margin: 5px 0;
    }
    a {
      color: ${BRAND_COLOR_GOLD};
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="logo">The <span class="logo-gold">Grand</span> Store</div>
    </div>
    <div class="content">
      ${content}
      <br><br>
      Best Regards,<br>
      <strong style="color: ${BRAND_COLOR_GOLD}">The Grand Store Team</strong>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} The Grand Store. All rights reserved.</p>
      <p>If you have any questions, please contact our support team.</p>
    </div>
  </div>
</body>
</html>
`;

const welcomeEmailTemplate = (name) => {
  const content = `
    <h1>Welcome to The Grand Store!</h1>
    <p>Dear ${name},</p>
    <p>We are absolutely thrilled to welcome you to The Grand Store, your ultimate destination for premium and exclusive products.</p>
    <p>Your account has been successfully created. You can now explore our curated collections, track your orders, and enjoy a seamless luxury shopping experience.</p>
    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" class="btn">Start Shopping</a>
  `;
  return generateEmailTemplate('Welcome to The Grand Store', content);
};

const newsletterWelcomeTemplate = () => {
  const content = `
    <h1>Thank You for Subscribing!</h1>
    <p>Welcome to The Grand Store Newsletter.</p>
    <p>You are now on the list to receive our latest updates, exclusive offers, and invitations to premium events. We promise to only send you the best of what we have to offer.</p>
    <p>Stay tuned for our upcoming curations!</p>
    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" class="btn">Visit Our Store</a>
  `;
  return generateEmailTemplate('Welcome to The Grand Store Newsletter', content);
};

const orderConfirmationTemplate = (order) => {
  let itemsHtml = order.orderItems.map(item => `
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #333;">${item.name} (x${item.quantity || item.qty || 1})</td>
      <td style="padding: 10px 0; border-bottom: 1px solid #333; text-align: right;">${formatRand(item.price * (item.quantity || item.qty || 1))}</td>
    </tr>
  `).join('');

  const orderReference = order.invoiceNumber || order.orderId || order._id;

  const content = `
    <h1>Order Confirmation</h1>
    <p>Dear Customer,</p>
    <p>Thank you for your purchase from The Grand Store. Your payment for order <strong>#${orderReference}</strong> was successful. Your PDF receipt is attached to this email.</p>
    
    <div class="details-box">
      <h3 style="margin-top: 0;">Order Summary</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        ${itemsHtml}
        <tr>
          <td style="padding: 15px 0 5px; font-weight: bold;">Subtotal</td>
          <td style="padding: 15px 0 5px; text-align: right;">${formatRand(order.subTotal)}</td>
        </tr>
        <tr>
          <td style="padding: 5px 0;">Shipping</td>
          <td style="padding: 5px 0; text-align: right;">${formatRand(order.shippingCost)}</td>
        </tr>
        <tr>
          <td style="padding: 5px 0; font-weight: bold; color: ${BRAND_COLOR_GOLD}; font-size: 16px;">Total</td>
          <td style="padding: 5px 0; text-align: right; font-weight: bold; color: ${BRAND_COLOR_GOLD}; font-size: 16px;">${formatRand(order.totalPrice)}</td>
        </tr>
      </table>
    </div>
    
    <div class="details-box">
      <h3 style="margin-top: 0;">Shipping Address</h3>
      <p>${order.shippingAddress.address}</p>
      <p>${order.shippingAddress.city}, ${order.shippingAddress.postalCode}</p>
      <p>${order.shippingAddress.country}</p>
    </div>
    
    <p>We will notify you once your order has been dispatched.</p>
  `;
  return generateEmailTemplate(`Payment Receipt #${orderReference}`, content);
};

const bankTransferInstructionsTemplate = (order, bankDetails) => {
  const content = `
    <h1>Bank Transfer Instructions</h1>
    <p>Dear Customer,</p>
    <p>Thank you for placing your order (<strong>#${order._id}</strong>). To complete your purchase, please transfer the total amount to the bank account below.</p>
    
    <div class="details-box">
      <h3 style="margin-top: 0;">Payment Details</h3>
      <p><strong style="color: ${BRAND_COLOR_GOLD}">Amount Due:</strong> $${order.totalPrice}</p>
      <p><strong style="color: ${BRAND_COLOR_GOLD}">Order Reference:</strong> ${order._id}</p>
      <div class="divider"></div>
      <h3 style="margin-top: 0;">Bank Information</h3>
      <p><strong>Bank Name:</strong> ${bankDetails.bankName || 'FNB'}</p>
      <p><strong>Account Name:</strong> ${bankDetails.accountName || 'The Grand Store'}</p>
      <p><strong>Account Number:</strong> ${bankDetails.accountNumber || '62000000000'}</p>
      <p><strong>Branch Code:</strong> ${bankDetails.branchCode || '250655'}</p>
    </div>
    
    <p>Please use your Order Reference (<strong>${order._id}</strong>) as the payment reference. Your order will be processed once the funds have cleared in our account.</p>
    <p>You can upload your proof of payment on your order details page.</p>
    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/customer/orders" class="btn">View Order</a>
  `;
  return generateEmailTemplate(`Payment Required - Order #${order._id}`, content);
};

const vendorApprovalTemplate = (name, fee = 0) => {
  const content = `
    <h1>Vendor Application Approved</h1>
    <p>Dear ${name},</p>
    <p>Congratulations! Your application to become a vendor at The Grand Store has been approved.</p>
    
    <div class="details-box">
      <h3 style="margin-top: 0;">Next Steps</h3>
      <p>To activate your storefront and unlock your vendor dashboard, a one-time onboarding fee is required.</p>
      <p><strong style="color: ${BRAND_COLOR_GOLD}">Amount Due:</strong> R${fee}</p>
    </div>
    
    <p>Please log in to complete your payment.</p>
    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/vendor/dashboard" class="btn">Log In and Pay</a>
  `;
  return generateEmailTemplate('Your Vendor Account is Approved', content);
};

const genericNotificationTemplate = (title, message) => {
  const content = `
    <h1>${title}</h1>
    <p>${message}</p>
  `;
  return generateEmailTemplate(title, content);
};

const hostApplicationApprovalTemplate = (name, username, password, type) => {
  const portalPath = type === 'auction' ? '/host/auction' : '/host/event';
  const featureLabel = type === 'auction' ? 'Auction Host' : 'Event Host';
  
  let credentialsHtml = '';
  if (password) {
    credentialsHtml = `
      <div class="details-box">
        <h3 style="margin-top: 0;">Your Temporary Credentials</h3>
        <p><strong>Username:</strong> ${username}</p>
        <p><strong>Temporary Password:</strong> ${password}</p>
        <p style="font-size: 13px; color: #aaa; margin-top: 10px;">Please change your password after your first login.</p>
      </div>
    `;
  } else {
    credentialsHtml = `
      <div class="details-box">
        <h3 style="margin-top: 0;">Access Granted</h3>
        <p>Your existing account has been upgraded with ${featureLabel} privileges. You can log in using your current credentials.</p>
      </div>
    `;
  }

  const content = `
    <h1>${featureLabel} Application Approved</h1>
    <p>Dear ${name},</p>
    <p>Congratulations! Your application to become a ${featureLabel} at The Grand Store has been approved.</p>
    ${credentialsHtml}
    <p>You can now log in to your portal to manage your listings.</p>
    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" class="btn">Login to Portal</a>
  `;
  return generateEmailTemplate(`Your ${featureLabel} Application is Approved`, content);
};

const hostApplicationRejectionTemplate = (name, type, reason) => {
  const featureLabel = type === 'auction' ? 'Auction Host' : 'Event Host';
  const content = `
    <h1>Update on your ${featureLabel} Application</h1>
    <p>Dear ${name},</p>
    <p>Thank you for your interest in becoming a ${featureLabel} at The Grand Store. After careful consideration, we are unable to approve your application at this time.</p>
    <div class="details-box">
      <p><strong>Reason:</strong> ${reason || 'Not specified'}</p>
    </div>
    <p>If you have any questions, please reach out to our support team.</p>
  `;
  return generateEmailTemplate(`Update on your ${featureLabel} Application`, content);
};

const eventReminderTemplate = (name, eventTitle, eventDate, eventTime, location) => {
  const content = `
    <h1>Upcoming Event Reminder</h1>
    <p>Dear ${name},</p>
    <p>This is a quick reminder that you have tickets for the upcoming event <strong>${eventTitle}</strong>!</p>
    
    <div class="details-box">
      <h3 style="margin-top: 0;">Event Details</h3>
      <p><strong>Date:</strong> ${new Date(eventDate).toLocaleDateString()}</p>
      <p><strong>Time:</strong> ${eventTime}</p>
      <p><strong>Location:</strong> ${location}</p>
    </div>
    
    <p>Please remember to bring your ticket with you.</p>
    <p>We look forward to seeing you there!</p>
  `;
  return generateEmailTemplate(`Reminder: ${eventTitle} is coming up!`, content);
};

const auctionReminderTemplate = (name, auctionTitle, startDate, lotNumber) => {
  const content = `
    <h1>Auction Starting Soon</h1>
    <p>Dear ${name},</p>
    <p>This is a reminder that an auction you are watching or registered for (<strong>${auctionTitle}</strong>) will be starting soon!</p>
    
    <div class="details-box">
      <h3 style="margin-top: 0;">Auction Details</h3>
      <p><strong>Lot Number:</strong> ${lotNumber}</p>
      <p><strong>Start Date:</strong> ${new Date(startDate).toLocaleString()}</p>
    </div>
    
    <p>Make sure to log in early to place your bids and secure this exclusive item.</p>
    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/auction" class="btn">View Live Auctions</a>
  `;
  return generateEmailTemplate(`Reminder: Auction for ${auctionTitle} is starting soon`, content);
};

module.exports = {
  welcomeEmailTemplate,
  newsletterWelcomeTemplate,
  orderConfirmationTemplate,
  bankTransferInstructionsTemplate,
  vendorApprovalTemplate,
  hostApplicationApprovalTemplate,
  hostApplicationRejectionTemplate,
  eventReminderTemplate,
  auctionReminderTemplate,
  genericNotificationTemplate
};
