const ChatbotFAQ = require("../models/ChatbotFAQ");

// @desc  Match user message to best FAQ entry
// @route POST /api/chatbot/message
// @access Public
exports.getAnswer = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    const faqs = await ChatbotFAQ.find({ isActive: true }).sort({
      priority: -1,
    });

    // Normalize user input
    const normalized = message.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
    const words = normalized.split(/\s+/).filter(Boolean);

    let bestMatch = null;
    let bestScore = 0;

    for (const faq of faqs) {
      let score = 0;
      for (const keyword of faq.keywords) {
        const kw = keyword.toLowerCase().trim();

        // 1. Exact phrase found in the full normalized message — highest value
        if (normalized.includes(kw)) {
          score += kw.split(/\s+/).length * 3;
          continue;
        }

        // 2. Word-by-word stem/prefix matching:
        //    "methods" starts with "method" ✓
        //    "auctions" starts with "auction" ✓
        //    "tracking" starts with "track" ✓
        const kwWords = kw.split(/\s+/);
        let matchedWords = 0;
        for (const kwWord of kwWords) {
          for (const userWord of words) {
            if (
              userWord === kwWord ||
              userWord.startsWith(kwWord) ||
              kwWord.startsWith(userWord)
            ) {
              matchedWords++;
              break;
            }
          }
        }
        // Award points proportional to how many keyword words matched
        if (kwWords.length > 0 && matchedWords > 0) {
          const ratio = matchedWords / kwWords.length;
          if (ratio >= 0.5) {
            score += matchedWords * 2;
          }
        }
      }
      if (score > bestScore) {
        bestScore = score;
        bestMatch = faq;
      }
    }

    if (bestMatch && bestScore > 0) {
      return res.json({
        matched: true,
        question: bestMatch.question,
        answer: bestMatch.answer,
        category: bestMatch.category,
      });
    }

    // No match — WhatsApp fallback
    return res.json({
      matched: false,
      answer:
        "I'm sorry, I couldn't find an answer to that. Please chat with us directly on WhatsApp and we'll be happy to help!",
      whatsapp: "+27765809522",
    });
  } catch (error) {
    console.error("Chatbot error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc  Get all active FAQs grouped by category (for quick-reply buttons)
// @route GET /api/chatbot/faqs
// @access Public
exports.getPublicFAQs = async (req, res) => {
  try {
    const faqs = await ChatbotFAQ.find({ isActive: true })
      .select("category question")
      .sort({ category: 1, priority: -1 });
    res.json(faqs);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc  Get all FAQs (admin)
// @route GET /api/chatbot/admin/faqs
// @access Admin
exports.getAllFAQs = async (req, res) => {
  try {
    const faqs = await ChatbotFAQ.find().sort({ category: 1, priority: -1 });
    res.json(faqs);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc  Create FAQ entry
// @route POST /api/chatbot/admin/faqs
// @access Admin
exports.createFAQ = async (req, res) => {
  try {
    const { category, keywords, question, answer, isActive, priority } =
      req.body;
    const faq = await ChatbotFAQ.create({
      category,
      keywords,
      question,
      answer,
      isActive,
      priority,
    });
    res.status(201).json(faq);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc  Update FAQ entry
// @route PUT /api/chatbot/admin/faqs/:id
// @access Admin
exports.updateFAQ = async (req, res) => {
  try {
    const faq = await ChatbotFAQ.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!faq) return res.status(404).json({ message: "FAQ not found" });
    res.json(faq);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc  Delete FAQ entry
// @route DELETE /api/chatbot/admin/faqs/:id
// @access Admin
exports.deleteFAQ = async (req, res) => {
  try {
    const faq = await ChatbotFAQ.findByIdAndDelete(req.params.id);
    if (!faq) return res.status(404).json({ message: "FAQ not found" });
    res.json({ message: "FAQ deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
