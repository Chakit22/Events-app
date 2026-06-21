import { useCallback, useEffect, useState } from "react";
import { type Event } from "../types/Event";

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);

  const [isFetchingEvents, setIsFetchingEvents] = useState(true);
  const [fetchEventsError, setFetchEventsError] = useState<string | null>(null);

  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [createEventError, setCreateEventError] = useState<string | null>(null);

  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [editEventError, setEditEventError] = useState<string | null>(null);
  const [isEditingId, setIsEditingId] = useState<string | null>(null);

  const [isDeletingEvent, setIsDeletingEvent] = useState(false);
  const [deleteEventError, setDeleteEventError] = useState<string | null>(null);

  const createEvent = async (request: Omit<Event, "id">) => {
    // MISTAKE I MADE: I mutated the argument and assigned id on it:
    //   event.id = events.length + 1; setEvents((prev) => [...prev, event]);
    // Two problems:
    //   1. `data` is Omit<Event,"id"> — `id` isn't even a valid key (TS error).
    //   2. Mutating the passed-in object breaks React's rule.
    // CONCEPT — immutability: never mutate existing state/objects. Build a NEW
    // array (`[...prev, newItem]`) and a NEW object (`{ ...data, id }`).
    // CONCEPT — id source: `events.length + 1` collides after deletes, so I use
    // crypto.randomUUID() for a guaranteed-unique id. Id is created HERE (parent
    // owns the list), not inside the form.

    // Call the backend API to create the event

    try {
      console.log("inside createEvent useEvents");
      const response = await fetch("http://localhost:3000/events", {
        method: "POST",
        body: JSON.stringify({ ...request }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("HTTP error!");
      }

      const data = await response.json();
      setEvents((prev) => [...prev, { ...data, id: data.event.id }]);
      setCreateEventError(null);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown fetch error";

      console.error("Creating events failed : ", message);
      setCreateEventError(message);
    } finally {
      setIsCreatingEvent(false);
    }
  };

  const editEvent = async (
    id: string | undefined,
    request: Omit<Event, "id">,
  ) => {
    // MISTAKE I MADE: I tried to update using filter wrapped in an object:
    //   setEvents((prev) => [{ prev.filter(e => e.id === id), ...data }])
    // That removes items (filter) and reshapes the whole array wrongly.
    // CONCEPT — map vs filter:
    //   - filter -> REMOVES items, returns a shorter array (use for delete)
    //   - map    -> TRANSFORMS each item, same length (use for edit/update)
    // To edit ONE event: map over all, patch the matching id, keep the rest.
    // { ...event, ...data } makes a NEW object (immutability) with data merged in.

    try {
      console.log("inside editEvent useEvents");
      const response = await fetch(`http://localhost:3000/events/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ ...request }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("HTTP error!");
      }

      const data = await response.json();
      setEvents(() => [...data.body]);
      setEditEventError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";

      setEditEventError(message);
    } finally {
      setIsEditingEvent(false);
      setIsEditingId(null);
    }
  };

  const deleteEvent = useCallback(async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3000/events/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("HTTP error!");
      }

      const data = await response.json();
      setEvents(() => [...data.body]);
      setDeleteEventError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";

      setDeleteEventError(message);
    } finally {
      setIsDeletingEvent(false);
    }
  }, []);

  useEffect(() => {
    // Fetch events from backend server
    const fetchEvents = async () => {
      try {
        setIsFetchingEvents(true);
        const response = await fetch("http://localhost:3000/events");

        if (!response.ok) {
          throw new Error("HTTP error!");
        }

        const data = await response.json();

        setEvents(data.body as Event[]);
        setFetchEventsError(null);
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Unknown fetch error";

        console.error("Fetch operation failed : ", message);
        setFetchEventsError(message);
      } finally {
        setIsFetchingEvents(false);
      }
    };

    fetchEvents();
  }, []);

  return {
    events,
    createEvent,
    editEvent,
    deleteEvent,
    isFetchingEvents,
    setIsFetchingEvents,
    fetchEventsError,
    isCreatingEvent,
    setIsCreatingEvent,
    createEventError,
    isEditingEvent,
    setIsEditingEvent,
    editEventError,
    isDeletingEvent,
    setIsDeletingEvent,
    deleteEventError,
    isEditingId,
    setIsEditingId,
  };
};
