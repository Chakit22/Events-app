import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";
import heroImg from "./assets/hero.png";
import "./App.css";
import { CreateEventForm } from "./components/CreateEventForm";
import { EventCard } from "./components/EventCard";
import { type Event } from "./types/Event";
import { EditEventForm } from "./components/EditEventForm";

const tabs = [
  { id: "create", label: "Create Event", component: <CreateEventForm /> },
  { id: "delete", label: "Delete Event" },
  { id: "edit", label: "Edit Event" },
];

const defaultEvents: Event[] = [
  {
    id: 1,
    title: "Tech Innovation Summit",
    description: "Explore the next decade of AI advancements and robotics.",
    location: "Convention Centre, Hall A",
    date: "2026-06-15",
    time: "09:00 AM",
  },
  {
    id: 2,
    title: "Local Farmers Market",
    description:
      "Shop fresh organic produce and handmade crafts from local vendors.",
    location: "Central Park Square",
    date: "2026-06-20",
    time: "08:00 AM",
  },
  {
    id: 3,
    title: "Live Jazz Night",
    description:
      "An evening of smooth classic jazz melodies and signature drinks.",
    location: "The Blue Note Lounge",
    date: "2026-06-21",
    time: "07:30 PM",
  },
  {
    id: 4,
    title: "Charity 5K Fun Run",
    description:
      "Lace up your sneakers and run to support local children's hospitals.",
    location: "Community Sports Field",
    date: "2026-07-04",
    time: "06:30 AM",
  },
  {
    id: 5,
    title: "Modern Art Exhibition",
    description:
      "Featuring spectacular abstract pieces from emerging local artists.",
    location: "Downtown Gallery 404",
    date: "2026-07-11",
    time: "11:00 AM",
  },
  {
    id: 6,
    title: "Gourmet Cooking Class",
    description:
      "Learn the secrets of mastering traditional Italian pasta shapes.",
    location: "Culinary Arts Institute",
    date: "2026-07-18",
    time: "02:00 PM",
  },
  {
    id: 7,
    title: "Startup Pitch Night",
    description:
      "Watch early-stage tech startups pitch to top angel investors.",
    location: "Innovation Hub HQ",
    date: "2026-07-25",
    time: "06:00 PM",
  },
  {
    id: 8,
    title: "Stargazing & Astronomy",
    description:
      "Observe Saturn's rings through professional-grade telescopes.",
    location: "Hilltop Observatory",
    date: "2026-08-02",
    time: "09:00 PM",
  },
  {
    id: 9,
    title: "Community Beach Clean",
    description:
      "Help protect local marine wildlife by clearing coastal litter.",
    location: "Sunset Beach North",
    date: "2026-08-08",
    time: "07:00 AM",
  },
];

function App() {
  const [events, setEvents] = useState(defaultEvents);
  const [isEditingId, setIsEditingId] = useState<number | null>(null);
  const [activeId, setActiveId] = useState("create");
  const active = tabs.find((tab) => tab.id === activeId);

  const handleDelete = (id: number) => {
    setEvents((prevEvents) =>
      prevEvents.filter((prevEvent) => prevEvent.id !== id),
    );
  };

  const handleEdit = (id: number | undefined, data: Omit<Event, "id">) => {
    setEvents((prev) =>
      prev.map((event) => (event.id === id ? { ...event, ...data } : event)),
    );

    setIsEditingId(null);
  };

  return (
    <div className="min-h-screen flex justify-center items-center">
      <div className="flex flex-col justify-center items-center gap-4">
        <div className="flex justify-center items-center gap-4">
          {tabs.map((tab, i) => (
            <button
              key={i}
              className="border-solid border-4 rounded-lg cursor-pointer bg-blue-500"
              onClick={() => setActiveId(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {active?.id == "delete" && (
          <div className="flex flex-col justify-center items-center">
            <h1>Events</h1>
            <div className="grid gap-4 grid-cols-3 p-24">
              {events.map((event, i) => (
                <EventCard event={event} onDelete={handleDelete} />
              ))}
            </div>
          </div>
        )}
        {active?.id == "create" && active.component}
        {!isEditingId && active?.id == "edit" && (
          <div className="flex flex-col justify-center items-center">
            <h1>Events</h1>
            <div className="grid gap-4 grid-cols-3 p-24">
              {events.map((event, i) => (
                <EventCard
                  event={event}
                  onDelete={handleDelete}
                  onEdit={setIsEditingId}
                />
              ))}
            </div>
          </div>
        )}
        {isEditingId !== null && active?.id == "edit" && (
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
