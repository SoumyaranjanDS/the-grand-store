const cron = require("node-cron");
const Event = require("../models/Event");
const { getEventPhase } = require("../utils/eventLifecycle");
const { releaseExpiredReservations } = require("../controllers/eventControllerV2");

const synchronizeEventLifecycle = async (now = new Date()) => {
  const events = await Event.find({
    approvalStatus: "approved",
    status: { $in: ["upcoming", "ongoing"] },
  }).select("date startTime endTime status");

  const updates = events
    .map((event) => ({ event, phase: getEventPhase(event, now) }))
    .filter(({ event, phase }) => phase !== event.status)
    .map(({ event, phase }) => ({
      updateOne: {
        filter: { _id: event._id, status: event.status },
        update: { $set: { status: phase } },
      },
    }));

  if (updates.length) await Event.bulkWrite(updates);
  const releasedReservations = await releaseExpiredReservations(now);
  return { updatedEvents: updates.length, releasedReservations };
};

const startEventJobs = () => {
  cron.schedule("* * * * *", async () => {
    try {
      await synchronizeEventLifecycle();
    } catch (error) {
      console.error("Error running event lifecycle job:", error.message);
    }
  });
  console.log("Event lifecycle jobs scheduled.");
};

module.exports = startEventJobs;
module.exports.synchronizeEventLifecycle = synchronizeEventLifecycle;
