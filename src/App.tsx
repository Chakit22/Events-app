import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";
import heroImg from "./assets/hero.png";
import "./App.css";
import { CreateEventForm } from "./components/CreateEventForm";
import { EventCard } from "./components/EventCard";
import { type Event } from "./types/Event";
import { EditEventForm } from "./components/EditEventForm";
import type { User } from "./types/User";
import type { UserEvent } from "./types/UserEvent";

const defaultEvents: Event[] = [
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
const defaultUsers: User[] = [
  {
    id: crypto.randomUUID(),
    name: "Alice Johnson",
    phone: 5550101,
    email: "alice.johnson@example.com",
    role: "admin",
  },
  {
    id: crypto.randomUUID(),
    name: "Bob Smith",
    phone: 5550102,
    email: "bob.smith@example.com",
    role: "user",
  },
  {
    id: crypto.randomUUID(),
    name: "Carla Mendez",
    phone: 5550103,
    email: "carla.mendez@example.com",
    role: "user",
  },
  {
    id: crypto.randomUUID(),
    name: "David Lee",
    phone: 5550104,
    email: "david.lee@example.com",
    role: "admin",
  },
  {
    id: crypto.randomUUID(),
    name: "Emma Wilson",
    phone: 5550105,
    email: "emma.wilson@example.com",
    role: "user",
  },
];

function App() {
  const [events, setEvents] = useState(defaultEvents);
  // MISTAKE I MADE: declared this as useState<UserEvent[]>() with no initial
  // value, so it was `undefined` and `[...prev, item]` crashed (can't spread
  // undefined), forcing `prev?.` everywhere.
  // CONCEPT — initialize array state as [] so it's always iterable/spreadable.
  const [userEvents, setUserEvents] = useState<UserEvent[]>([]);
  const [currentUser, setCurrentUser] = useState<User>(defaultUsers[0]);
  const [isEditingId, setIsEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [currentRole, setCurrentRole] = useState<string>("user");
  const roles = ["admin", "user"];

  const handleDelete = (id: string) => {
    setEvents((prevEvents) =>
      prevEvents.filter((prevEvent) => prevEvent.id !== id),
    );
  };

  const handleEdit = (id: string | undefined, data: Omit<Event, "id">) => {
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

    setIsEditingId(null);
  };

  const handleCreate = (data: Omit<Event, "id">) => {
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
    setIsCreating(false);
  };

  const handleEditRSVPStatus = (
    id: string,
    status: "attending" | "not_attending",
  ) => {
    // the currentUser wants to set this event's status as attending or not attending
    // Append the current event for this user in the userEventsArray

    // Get event
    const event = events.find((event) => event.id === id);
    setUserEvents((prev) => {
      const exists = prev.find(
        (userEvent) =>
          userEvent.userId === currentUser.id &&
          userEvent.eventId === event?.id,
      );

      if (exists) {
        // MISTAKE I MADE: I called prev.map(...) but discarded its result and
        // did `return prev` (the unchanged array), so the status never updated.
        // CONCEPT — map returns a NEW array; you must return/use that result.
        // This branch enforces "one RSVP per user+event": when a row already
        // exists we UPDATE it (patch status) instead of pushing a duplicate.
        return prev.map((userEvent) =>
          userEvent.userId === currentUser.id && userEvent.eventId === event?.id
            ? { ...userEvent, status: status }
            : userEvent,
        );
      } else {
        return [
          ...prev,
          { userId: currentUser.id, eventId: id, status: status },
        ];
      }
    });
  };

  return (
    <div className="min-h-screen flex justify-center items-center">
      <div className="flex flex-col justify-center items-center gap-4">
        <div className="flex justify-center items-center gap-4">
          {roles.map((role) => (
            <button
              className={`p-2 border-solid border-4 rounded-lg cursor-pointer ${role === currentRole ? "bg-gray-500" : "bg-blue-500"}`}
              onClick={() => setCurrentRole(role)}
            >
              {role}
            </button>
          ))}
        </div>
        {currentRole === "admin" && (
          <div className="flex justify-end items-center">
            <button
              className="p-2 border-solid border-4 rounded-lg cursor-pointer bg-blue-500"
              onClick={() => setIsCreating(true)}
            >
              Create Event +
            </button>
          </div>
        )}
        {isCreating && <CreateEventForm onCreate={handleCreate} />}
        {!isEditingId && !isCreating && (
          <div className="flex flex-col justify-center items-center">
            <h1>Events</h1>
            <div className="grid gap-4 grid-cols-3 p-24">
              {events.map((event, i) => {
                const rsvpStatus = userEvents.find(
                  (ue) =>
                    ue.userId === currentUser.id && ue.eventId === event.id,
                )?.status;
                return (
                  <EventCard
                    currentRole={currentRole}
                    event={event}
                    onEdit={setIsEditingId}
                    onDelete={handleDelete}
                    onEditRSVPStatus={handleEditRSVPStatus}
                    rsvpStatus={rsvpStatus}
                  />
                );
              })}
            </div>
          </div>
        )}
        {isEditingId !== null && (
          <EditEventForm
            event={events.find((event: Event) => event.id === isEditingId)}
            onEdit={handleEdit}
          />
        )}
      </div>
    </div>
  );
}

export default App;
