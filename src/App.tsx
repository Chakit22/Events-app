import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";
import heroImg from "./assets/hero.png";
import "./App.css";
import { CreateEventForm } from "./components/CreateEventForm";
import { EventCard } from "./components/EventCard";
import { type Event } from "./types/Event";
import { EditEventForm } from "./components/EditEventForm";

const defaultEvents: Event[] = [];

function App() {
  const [events, setEvents] = useState(defaultEvents);
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
    setEvents((prev) =>
      prev.map((event) => (event.id === id ? { ...event, ...data } : event)),
    );

    setIsEditingId(null);
  };

  const handleCreate = (data: Omit<Event, "id">) => {
    setEvents((prev) => [...prev, { ...data, id: crypto.randomUUID() }]);
    setIsCreating(false);
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
              {events.map((event, i) => (
                <EventCard
                  currentRole={currentRole}
                  event={event}
                  onEdit={setIsEditingId}
                  onDelete={handleDelete}
                />
              ))}
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
