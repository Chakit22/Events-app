import { useCallback, useEffect, useMemo, useState } from "react";
import { useUser } from "./useUser";
import type { Event } from "../types/Event";
import type { UserEvent } from "../types/UserEvent";

export const useRSVP = (events: Event[]) => {
  const [userEvents, setUserEvents] = useState<UserEvent[]>(() => {
    const savedUserEvents = localStorage.getItem("userEvents");

    if (!savedUserEvents) {
      return [];
    }

    return JSON.parse(savedUserEvents);
  });
  const { user } = useUser();

  // Mark the current user's RSVP for an event, updating an existing record when present.
  const updateRSVP = useCallback(
    (eventId: string, status: "attending" | "not_attending") => {
      setUserEvents((prev) => {
        const exists = prev.find(
          (userEvent) =>
            userEvent.userId === user.id && userEvent.eventId === eventId,
        );

        if (exists) {
          // MISTAKE I MADE: I called prev.map(...) but discarded its result and
          // did `return prev` (the unchanged array), so the status never updated.
          // CONCEPT — map returns a NEW array; you must return/use that result.
          // This branch enforces "one RSVP per user+event": when a row already
          // exists we UPDATE it (patch status) instead of pushing a duplicate.
          return prev.map((userEvent) =>
            userEvent.userId === user.id && userEvent.eventId === eventId
              ? { ...userEvent, status: status }
              : userEvent,
          );
        } else {
          return [
            ...prev,
            { userId: user.id, eventId: eventId, status: status },
          ];
        }
      });
    },
    [user.id],
  );

  // Get all RSVP records for the current user.
  const getRSVP = () => {
    return userEvents.filter((userEvent) => userEvent.userId === user.id);
  };

  const removeRSVPsForEvent = useCallback((eventId: string) => {
    // Keep RSVP state in sync when App deletes an event.
    setUserEvents((prev) =>
      prev.filter((userEvent) => userEvent.eventId !== eventId),
    );
  }, []);

  const attendance: Record<
    string,
    { attending: number; not_attending: number }
  > = useMemo(() => {
    // Build a lookup table so each EventCard can read counts by event id.
    const acc = events.reduce(
      (record, event) => {
        record[event.id] = { attending: 0, not_attending: 0 };
        return record;
      },
      {} as Record<string, { attending: number; not_attending: number }>,
    );

    userEvents.forEach((userEvent) => {
      // Ignore stale RSVP records for events that no longer exist.
      if (!acc[userEvent.eventId]) return;
      acc[userEvent.eventId].attending +=
        userEvent.status === "attending" ? 1 : 0;
      acc[userEvent.eventId].not_attending +=
        userEvent.status === "not_attending" ? 1 : 0;
    });

    return acc;
  }, [userEvents, events]);

  useEffect(() => {
    localStorage.setItem("userEvents", JSON.stringify(userEvents));
  }, [userEvents]);

  return { userEvents, updateRSVP, getRSVP, removeRSVPsForEvent, attendance };
};
