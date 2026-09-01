const DEFAULT_EVENT_TIMEZONE_OFFSET = "+02:00";

const getEventTimezoneOffset = () => (
  process.env.EVENT_TIMEZONE_OFFSET || DEFAULT_EVENT_TIMEZONE_OFFSET
);

const getEventDateKey = (date) => {
  if (!date) return "";
  if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}/.test(date)) {
    return date.slice(0, 10);
  }

  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString().slice(0, 10);
};

const parseEventDateTime = (date, time) => {
  const dateKey = getEventDateKey(date);
  if (!dateKey || !/^([01]\d|2[0-3]):[0-5]\d$/.test(String(time || ""))) {
    return null;
  }

  const parsed = new Date(`${dateKey}T${time}:00${getEventTimezoneOffset()}`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const parseEventWindow = ({ date, startTime, endTime }, now = new Date()) => {
  const startAt = parseEventDateTime(date, startTime);
  const endAt = parseEventDateTime(date, endTime);

  if (!startAt || !endAt) {
    return { error: "A valid event date, start time, and end time are required." };
  }
  if (endAt <= startAt) {
    return { error: "Event end time must be later than its start time." };
  }
  if (endAt <= now) {
    return { error: "Event end time must be in the future." };
  }

  return { startAt, endAt };
};

const getEventPhase = (event, now = new Date()) => {
  if (event.status === "cancelled") return "cancelled";
  if (event.status === "completed") return "completed";

  const startAt = parseEventDateTime(event.date, event.startTime);
  const endAt = parseEventDateTime(event.date, event.endTime);
  if (!startAt || !endAt || endAt <= startAt || endAt <= now) return "completed";
  if (startAt <= now) return "ongoing";
  return "upcoming";
};

module.exports = {
  getEventDateKey,
  getEventPhase,
  parseEventDateTime,
  parseEventWindow,
};
