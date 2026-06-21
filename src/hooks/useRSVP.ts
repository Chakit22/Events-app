import { useCallback, useEffect, useMemo, useState } from "react";
import { useUser } from "./useUser";
import type { Event } from "../types/Event";
import type { UserEvent } from "../types/UserEvent";

type RSVPStatus = UserEvent["status"];

export const useRSVP = (events: Event[]) => {
  const [userEvents, setUserEvents] = useState<UserEvent[]>([]);
  const [isFetchingRSVPs, setIsFetchingRSVPs] = useState(true);
  const [fetchRSVPsError, setFetchRSVPsError] = useState<string | null>(null);
  const [updateRSVPError, setUpdateRSVPError] = useState<string | null>(null);
  const { user } = useUser();

  const normalizeRSVPsForCurrentUser = useCallback(
    (rsvps: UserEvent[]) => {
      return rsvps.map((rsvp) => ({ ...rsvp, userId: user.id }));
    },
    [user.id],
  );

  // Mark the current user's RSVP for an event, updating an existing record when present.
  const updateRSVP = useCallback(
    async (eventId: string, status: RSVPStatus) => {
      console.log("inside updateRSVP");
      try {
        const response = await fetch(
          `http://localhost:3000/events/${eventId}/rsvp`,
          {
            method: "PUT",
            body: JSON.stringify({ status }),
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        if (!response.ok) {
          throw new Error("HTTP error!");
        }

        const data = await response.json();
        setUserEvents(normalizeRSVPsForCurrentUser(data.body));
        setUpdateRSVPError(null);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";

        setUpdateRSVPError(message);
      }
    },
    [normalizeRSVPsForCurrentUser],
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
    const fetchRSVPs = async () => {
      try {
        setIsFetchingRSVPs(true);
        const response = await fetch("http://localhost:3000/rsvps");

        if (!response.ok) {
          throw new Error("HTTP error!");
        }

        const data = await response.json();
        setUserEvents(normalizeRSVPsForCurrentUser(data.body));
        setFetchRSVPsError(null);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";

        setFetchRSVPsError(message);
      } finally {
        setIsFetchingRSVPs(false);
      }
    };

    fetchRSVPs();
  }, [normalizeRSVPsForCurrentUser]);

  return {
    userEvents,
    updateRSVP,
    getRSVP,
    removeRSVPsForEvent,
    attendance,
    isFetchingRSVPs,
    fetchRSVPsError,
    updateRSVPError,
  };
};
