const Counter = require('../models/Counter');

/**
 * Atomically increments and returns the next sequence number for a given counter.
 * Using findOneAndUpdate with $inc ensures race-condition safety.
 * @param {String} sequenceName The unique name of the counter (e.g., 'shopOrder')
 * @returns {Promise<Number>} The next integer sequence
 */
const getNextSequence = async (sequenceName) => {
  const sequenceDocument = await Counter.findOneAndUpdate(
    { id: sequenceName },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return sequenceDocument.seq;
};

module.exports = { getNextSequence };
