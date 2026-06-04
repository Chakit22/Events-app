import { useCallback, useEffect, useState } from "react";
import { type Event } from "../types/Event";

const initialEvents: Event[] = [
  {
    id: crypto.randomUUID(),
    title: "Tech Innovation Summit",
    description: "Explore the next decade of AI advancements and robotics.",
    date: "2026-06-15",
    location: "Convention Centre, Hall A",
    time: "09:00",
  },
  {
    id: crypto.randomUUID(),
    title: "Local Farmers Market",
    description: "Shop fresh organic produce and handmade crafts.",
    date: "2026-06-20",
    location: "Central Park Square",
    time: "08:00",
  },
  {
    id: crypto.randomUUID(),
    title: "Live Jazz Night",
    description: "An evening of smooth classic jazz melodies and drinks.",
    date: "2026-06-21",
    location: "The Blue Note Lounge",
    time: "19:30",
  },
  {
    id: crypto.randomUUID(),
    title: "Modern Art Exhibition",
    description: "Abstract pieces from emerging local artists.",
    date: "2026-07-11",
    location: "Downtown Gallery 404",
    time: "11:00",
  },
  {
    id: crypto.randomUUID(),
    title: "Startup Pitch Night",
    description: "Early-stage tech startups pitch to angel investors.",
    date: "2026-07-25",
    location: "Innovation Hub HQ",
    time: "18:00",
  },
];

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>(() => {
    const savedEvents = localStorage.getItem("events");

    if (!savedEvents) {
      return initialEvents;
    }

    return JSON.parse(savedEvents);
  });

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
    localStorage.setItem("events", JSON.stringify(events));
  }, [events]);

  return {
    events,
    createEvent,
    editEvent,
    deleteEvent,
  };
};
