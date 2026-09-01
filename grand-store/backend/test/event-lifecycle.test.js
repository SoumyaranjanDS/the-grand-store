const test = require("node:test");
const assert = require("node:assert/strict");
const Booking = require("../models/Booking");
const { getEventPhase, parseEventWindow } = require("../utils/eventLifecycle");
const { normalizeEventInput } = require("../controllers/eventControllerV2");

const futureEvent = {
  date: "2026-09-10",
  startTime: "18:00",
  endTime: "20:00",
};

test("event lifecycle derives upcoming, ongoing, and completed from the full event window", () => {
  assert.equal(getEventPhase(futureEvent, new Date("2026-09-10T12:00:00Z")), "upcoming");
  assert.equal(getEventPhase(futureEvent, new Date("2026-09-10T17:00:00Z")), "ongoing");
  assert.equal(getEventPhase(futureEvent, new Date("2026-09-10T19:00:00Z")), "completed");
});

test("event schedule rejects reversed and expired times", () => {
  assert.match(
    parseEventWindow({ ...futureEvent, startTime: "20:00", endTime: "18:00" }, new Date("2026-09-01T00:00:00Z")).error,
    /later than/i,
  );
  assert.match(
    parseEventWindow(futureEvent, new Date("2026-09-11T00:00:00Z")).error,
    /future/i,
  );
});

test("event submission validates ticket tier capacity", () => {
  const result = normalizeEventInput({
    ...futureEvent,
    title: "Test tasting",
    type: "Wine Tasting",
    format: "Physical",
    location: "Cape Town",
    description: "A test event",
    capacity: 2,
    ticketTiers: JSON.stringify([{ name: "General", price: 100, quantity: 3 }]),
  });
  assert.match(result.error, /cannot exceed/i);
});

test("pending payment and ticket states validate for a new reservation", async () => {
  const booking = new Booking({
    user: "507f1f77bcf86cd799439011",
    event: "507f1f77bcf86cd799439012",
    vendor: "507f1f77bcf86cd799439013",
    ticketType: "General",
    ticketTierId: "507f1f77bcf86cd799439014",
    unitPrice: 100,
    quantity: 1,
    subTotal: 100,
    totalPrice: 100,
    ticketId: "TEST-TICKET",
    paymentStatus: "Pending",
    ticketStatus: "Pending",
    inventoryStatus: "reserved",
  });
  await assert.doesNotReject(() => booking.validate());
});
