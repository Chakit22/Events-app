import { Router } from "express";
import { type Request, type Response } from "express";
import { MOCK_USER_ID, store } from "../data/store.js";
import type { UserEvent } from "../types/UserEvent.js";

const router = Router();

const isValidRSVPStatus = (status: unknown): boolean => {
  return status === "attending" || status === "not_attending";
};

const upsertRSVP = (req: Request, res: Response) => {
  const { eventId } = req.params;
  const { status } = req.body;

  if (typeof eventId !== "string") {
    return res.status(400).json({
      success: false,
      message: "Invalid event id",
    });
  }

  const event = store.events.find((event) => event.id === eventId);

  if (!event) {
    return res.status(404).json({
      success: false,
      message: "Event not found!",
    });
  }

  if (!isValidRSVPStatus(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid RSVP status",
    });
  }

  const existingRSVP = store.rsvps.find(
    (rsvp) => rsvp.userId === MOCK_USER_ID && rsvp.eventId === eventId,
  );

  if (existingRSVP) {
    store.rsvps = store.rsvps.map((rsvp) =>
      rsvp.userId === MOCK_USER_ID && rsvp.eventId === eventId
        ? { ...rsvp, status }
        : rsvp,
    );
  } else {
    store.rsvps = [...store.rsvps, { userId: MOCK_USER_ID, eventId, status }];
  }

  const rsvp = store.rsvps.find(
    (rsvp) => rsvp.userId === MOCK_USER_ID && rsvp.eventId === eventId,
  );

  return res.status(existingRSVP ? 200 : 201).json({
    success: true,
    message: existingRSVP ? "RSVP updated" : "RSVP created",
    rsvp,
    body: store.rsvps,
  });
};

// Create a new event
router.post("/", (req: Request, res: Response) => {
  const { title, description, date, time, location } = req.body;

  //   Validate the fields
  if (!title || !description || !date || !time || !location) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  //   Va;idate the pattern of date
  /**
   *             pattern: {
              value: /^\d{4}-\d{2}-\d{2}$/,
              message: "Use YYYY-MM-DD",
            },
   */
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({
      success: false,
      message: "Invalid date format. Use YYYY-MM-DD",
    });
  }

  //   Validate the pattern of time
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
    return res.status(400).json({
      success: false,
      message: "Invalid time format. Use HH:MM",
    });
  }

  const newEvent = {
    id: crypto.randomUUID(),
    title,
    description,
    date,
    time,
    location,
  };

  store.events = [...store.events, newEvent];

  return res.status(201).json({
    success: true,
    message: "Event created successfully",
    event: newEvent,
  });
});

// Get all events
router.get("/", (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: "Events retrieved successfully",
    body: store.events,
  });
});

// Update an existing event
router.patch("/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  // Find that event by id
  const event = store.events.find((event) => event.id === id);

  if (!event) {
    return res.status(404).json({
      success: false,
      message: "Event not found!",
    });
  }

  const { title, description, date, time, location } = req.body;

  //   Validate the fields
  if (!title || !description || !date || !time || !location) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  //   Va;idate the pattern of date
  /**
   *             pattern: {
              value: /^\d{4}-\d{2}-\d{2}$/,
              message: "Use YYYY-MM-DD",
            },
   */
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({
      success: false,
      message: "Invalid date format. Use YYYY-MM-DD",
    });
  }

  //   Validate the pattern of time
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
    return res.status(400).json({
      success: false,
      message: "Invalid time format. Use HH:MM",
    });
  }

  store.events = store.events.map((event) => {
    if (event.id === id) {
      return { ...event, title, description, date, time, location };
    }

    return event;
  });

  return res.status(200).json({
    success: true,
    message: "Event data updated",
    body: store.events,
  });
});

// Delete an existing event
router.delete("/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  // Find that event by id
  const event = store.events.find((event) => event.id === id);

  if (!event) {
    return res.status(404).json({
      success: false,
      message: "Event not found!",
    });
  }

  store.events = store.events.filter((event) => event.id !== id);
  store.rsvps = store.rsvps.filter((rsvp) => rsvp.eventId !== id);

  return res.status(200).json({
    success: true,
    message: "Event deleted",
    body: store.events,
  });
});

router.post("/:eventId/rsvp", upsertRSVP);
router.put("/:eventId/rsvp", upsertRSVP);

export default router;
