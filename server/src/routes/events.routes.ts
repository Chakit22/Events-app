import { Router } from "express";
import { type Request, type Response } from "express";
import { initialEvents } from "../data/events.js";

const router = Router();
let events = [...initialEvents];

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

  events = [...events, newEvent];

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
    body: events,
  });
});

// Update an existing event
router.patch("/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  // Find that event by id
  const event = events.find((event) => event.id === id);

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

  events = events.map((event) => {
    if (event.id === id) {
      return { ...event, title, description, date, time, location };
    }

    return event;
  });

  return res.status(200).json({
    success: true,
    message: "Event data updated",
    body: events,
  });
});

// Delete an existing event
router.delete("/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  // Find that event by id
  const event = events.find((event) => event.id === id);

  if (!event) {
    return res.status(404).json({
      success: false,
      message: "Event not found!",
    });
  }

  events = events.filter((event) => event.id !== id);

  return res.status(200).json({
    success: true,
    message: "Event deleted",
    body: events,
  });
});

export default router;
