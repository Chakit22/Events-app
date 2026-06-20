import { useCallback, useEffect, useState } from "react";
import { type Event } from "../types/Event";

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const createEvent = (data: Omit<Event, "id">) => {
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
    setEvents((prev) => [...prev, { ...data, id: crypto.randomUUID() }]);
  };

  const editEvent = (id: string | undefined, data: Omit<Event, "id">) => {
    // MISTAKE I MADE: I tried to update using filter wrapped in an object:
    //   setEvents((prev) => [{ prev.filter(e => e.id === id), ...data }])
    // That removes items (filter) and reshapes the whole array wrongly.
    // CONCEPT — map vs filter:
    //   - filter -> REMOVES items, returns a shorter array (use for delete)
    //   - map    -> TRANSFORMS each item, same length (use for edit/update)
    // To edit ONE event: map over all, patch the matching id, keep the rest.
    // { ...event, ...data } makes a NEW object (immutability) with data merged in.
    setEvents((prev) =>
      prev.map((event) => (event.id === id ? { ...event, ...data } : event)),
    );
  };

  const deleteEvent = useCallback((id: string) => {
    setEvents((prevEvents) =>
      prevEvents.filter((prevEvent) => prevEvent.id !== id),
    );
  }, []);

  useEffect(() => {
    // Fetch events from backend server
    const fetchEvents = async () => {
      try {
        const response = await fetch("http://localhost:3000/events");

        if (!response.ok) {
          throw new Error("HTTP error!");
        }

        const data = await response.json();

        setEvents(data.body as Event[]);
        setError(null);
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Unknown fetch error";

        console.error("Fetch operation failed : ", message);
        setError(message);
      }
      setIsLoading(false);
    };

    fetchEvents();
  }, []);

  return {
    events,
    createEvent,
    editEvent,
    deleteEvent,
    isLoading,
    error,
  };
};
