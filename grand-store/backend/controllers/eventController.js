const Event = require('../models/Event');

// @desc    Create a new event (Vendor only)
// @route   POST /api/events
// @access  Private (Vendor)
const createEvent = async (req, res) => {
  try {
    if (req.user.role !== 'vendor_active') {
      return res.status(403).json({ message: 'Only approved vendors can create events' });
    }

    const { 
      title, type, format, date, startTime, endTime, 
      location, city, description, hostName, hostTitle, 
      capacity, ticketTiers, tastingJourney 
    } = req.body;

    let image = null;
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    }

    // Parse JSON strings back into objects/arrays if they come from FormData
    const parsedTicketTiers = ticketTiers ? JSON.parse(ticketTiers) : [];
    const parsedTastingJourney = tastingJourney ? JSON.parse(tastingJourney) : [];

    const newEvent = new Event({
      title,
      type,
      format,
      date,
      startTime,
      endTime,
      location,
      city,
      description,
      hostName,
      hostTitle,
      image,
      capacity: Number(capacity) || 0,
      ticketTiers: parsedTicketTiers,
      tastingJourney: parsedTastingJourney,
      vendorId: req.user._id,
      approvalStatus: 'approved'
    });

    const savedEvent = await newEvent.save();
    res.status(201).json(savedEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Server error creating event' });
  }
};

// @desc    Get all approved events
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res) => {
  try {
    // Only return events that are approved
    const events = await Event.find({ approvalStatus: 'approved' }).sort({ date: 1 }).populate('vendorId', 'name vendorProfile');
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Server error fetching events' });
  }
};

// @desc    Get single event by ID
// @route   GET /api/events/:id
// @access  Public
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('vendorId', 'name vendorProfile');
    if (event) {
      res.json(event);
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    console.error('Error fetching event by ID:', error);
    res.status(500).json({ message: 'Server error fetching event' });
  }
};

// @desc    Get all events for a specific vendor
// @route   GET /api/events/vendor
// @access  Private (Vendor)
const getVendorEvents = async (req, res) => {
  try {
    const events = await Event.find({ vendorId: req.user._id }).sort({ date: -1 });
    res.json(events);
  } catch (error) {
    console.error('Error fetching vendor events:', error);
    res.status(500).json({ message: 'Server error fetching vendor events' });
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  getVendorEvents
};
