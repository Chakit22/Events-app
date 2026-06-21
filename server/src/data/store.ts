import { initialEvents } from "./events.js";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";

import type { Event } from "../types/Event.js";
import type { UserEvent } from "../types/UserEvent.js";

export const MOCK_USER_ID = "mock-user";

const dbDirectory = join(process.cwd(), "data");
const dbPath = join(dbDirectory, "events.sqlite");

mkdirSync(dbDirectory, { recursive: true });

const db = new DatabaseSync(dbPath);

db.exec(`
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    date TEXT NOT NULL,
    location TEXT NOT NULL,
    time TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS rsvps (
    userId TEXT NOT NULL,
    eventId TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('attending', 'not_attending')),
    PRIMARY KEY (userId, eventId),
    FOREIGN KEY (eventId) REFERENCES events(id) ON DELETE CASCADE
  );
`);

const withTransaction = (callback: () => void) => {
  db.exec("BEGIN");

  try {
    callback();
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
};

const getEventCount = db.prepare("SELECT COUNT(*) as count FROM events");
const insertEvent = db.prepare(`
  INSERT INTO events (id, title, description, date, location, time)
  VALUES (?, ?, ?, ?, ?, ?)
`);
const upsertEvent = db.prepare(`
  INSERT INTO events (id, title, description, date, location, time)
  VALUES (?, ?, ?, ?, ?, ?)
  ON CONFLICT(id) DO UPDATE SET
    title = excluded.title,
    description = excluded.description,
    date = excluded.date,
    location = excluded.location,
    time = excluded.time
`);
const deleteEvent = db.prepare("DELETE FROM events WHERE id = ?");
const getEvents = db.prepare(`
  SELECT id, title, description, date, location, time
  FROM events
  ORDER BY rowid
`);
const getEventIds = db.prepare("SELECT id FROM events");

const getRSVPs = db.prepare(`
  SELECT userId, eventId, status
  FROM rsvps
  ORDER BY rowid
`);
const deleteRSVPs = db.prepare("DELETE FROM rsvps");
const insertRSVP = db.prepare(`
  INSERT INTO rsvps (userId, eventId, status)
  VALUES (?, ?, ?)
`);

const seedEvents = () => {
  const row = getEventCount.get() as { count: number };

  if (row.count > 0) {
    return;
  }

  withTransaction(() => {
    initialEvents.forEach((event) => {
      insertEvent.run(
        event.id,
        event.title,
        event.description,
        event.date,
        event.location,
        event.time,
      );
    });
  });
};

seedEvents();

export const store = {
  get events() {
    return getEvents.all() as unknown as Event[];
  },

  set events(events: Event[]) {
    withTransaction(() => {
      const nextEventIds = new Set(events.map((event) => event.id));
      const currentEventIds = getEventIds.all() as Array<{ id: string }>;

      currentEventIds.forEach((event) => {
        if (!nextEventIds.has(event.id)) {
          deleteEvent.run(event.id);
        }
      });

      events.forEach((event) => {
        upsertEvent.run(
          event.id,
          event.title,
          event.description,
          event.date,
          event.location,
          event.time,
        );
      });
    });
  },

  get rsvps() {
    return getRSVPs.all() as unknown as UserEvent[];
  },

  set rsvps(rsvps: UserEvent[]) {
    withTransaction(() => {
      deleteRSVPs.run();
      rsvps.forEach((rsvp) => {
        insertRSVP.run(rsvp.userId, rsvp.eventId, rsvp.status);
      });
    });
  },
};
