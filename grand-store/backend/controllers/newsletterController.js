const Newsletter = require('../models/Newsletter');
const { sendEmail } = require('../utils/emailService');
const { newsletterWelcomeTemplate, bulkNewsletterTemplate } = require('../utils/emailTemplates');
const geoip = require('geoip-lite');
const countryNames = new Intl.DisplayNames(['en'], { type: 'region' });

const getCountryName = (countryCode) => {
  try {
    return countryNames.of(countryCode) || countryCode;
  } catch (e) {
    return countryCode;
  }
};

// @desc    Subscribe to newsletter
// @route   POST /api/newsletter/subscribe
// @access  Public
const subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const geo = geoip.lookup(ip);
    const country = geo ? getCountryName(geo.country) : 'Unknown';

    const existingSubscriber = await Newsletter.findOne({ email });

    if (existingSubscriber) {
      if (existingSubscriber.status === 'unsubscribed') {
        existingSubscriber.status = 'subscribed';
        existingSubscriber.country = country;
        existingSubscriber.ipAddress = ip;
        await existingSubscriber.save();
        return res.status(200).json({ message: 'Successfully re-subscribed to the newsletter!' });
      }
      return res.status(400).json({ message: 'Email is already subscribed' });
    }

    const newSubscriber = new Newsletter({ email, country, ipAddress: ip });
    await newSubscriber.save();

    // Send welcome email
    try {
      await sendEmail({
        to: email,
        subject: 'Welcome to The Grand Store Newsletter',
        html: newsletterWelcomeTemplate()
      });
    } catch (err) {
      console.error('Failed to send newsletter welcome email:', err);
    }

    res.status(201).json({ message: 'Successfully subscribed to the newsletter!' });
  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all newsletter subscribers
// @route   GET /api/newsletter/subscribers
// @access  Private/Admin
const getSubscribers = async (req, res) => {
  try {
    const { country } = req.query;
    const filter = {};
    if (country && country !== 'All') {
      filter.country = country;
    }
    const subscribers = await Newsletter.find(filter).sort({ createdAt: -1 });
    res.json(subscribers);
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Send bulk newsletter
// @route   POST /api/newsletter/send
// @access  Private/Admin
const sendBulkNewsletter = async (req, res) => {
  try {
    const { subject, htmlContent, country } = req.body;
    
    if (!subject || !htmlContent) {
      return res.status(400).json({ message: 'Subject and HTML content are required' });
    }

    const filter = { status: 'subscribed' };
    if (country && country !== 'All') {
      filter.country = country;
    }

    const subscribers = await Newsletter.find(filter);

    if (subscribers.length === 0) {
      return res.status(400).json({ message: 'No active subscribers found for this filter' });
    }

    let successCount = 0;
    for (const sub of subscribers) {
      try {
        await sendEmail({
          to: sub.email,
          subject,
          html: bulkNewsletterTemplate(subject, htmlContent)
        });
        successCount++;
      } catch (err) {
        console.error(`Failed to send newsletter to ${sub.email}:`, err);
      }
    }

    res.json({ message: `Newsletter sent successfully to ${successCount} subscribers` });
  } catch (error) {
    console.error('Error sending bulk newsletter:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  subscribeNewsletter,
  getSubscribers,
  sendBulkNewsletter,
};
