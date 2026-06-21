import { useCallback, useMemo, useState } from "react";
import "./App.css";
import { CreateEventForm } from "./components/CreateEventForm";
import { EventCard } from "./components/EventCard";
import { type Event } from "./types/Event";
import { EditEventForm } from "./components/EditEventForm";
import { useEvents } from "./hooks/useEvents";
import { useRSVP } from "./hooks/useRSVP";
import { useUser } from "./hooks/useUser";

function App() {
  const { user } = useUser();
  const {
    events,
    createEvent,
    editEvent,
    deleteEvent,
    isFetchingEvents,
    isCreatingEvent,
    isEditingEvent,
    isDeletingEvent,
    setIsFetchingEvents,
    setIsCreatingEvent,
    setIsEditingEvent,
    setIsDeletingEvent,
    fetchEventsError,
    createEventError,
    editEventError,
    deleteEventError,
    isEditingId,
    setIsEditingId,
  } = useEvents();
  const { userEvents, updateRSVP, removeRSVPsForEvent, attendance } =
    useRSVP(events);
  const [currentRole, setCurrentRole] = useState<string>("user");
  const roles = ["admin", "user"];
  const [filter, setFilter] = useState("all");

  const filteredEvents = useMemo(() => {
    if (filter === "all") return events;
    return events.filter((event) =>
      userEvents.find(
        (userEvent) =>
          userEvent.eventId === event.id && userEvent.status === filter,
      ),
    );
  }, [filter, events, userEvents]);

  const handleCreateEvent = async (data: Omit<Event, "id">) => {
    console.log("inside handleCreateEvent app.tsx");
    await createEvent(data);
  };

  const handleEditEvent = async (
    id: string | undefined,
    data: Omit<Event, "id">,
  ) => {
    console.log("inside handleEditEvent app.tsx");
    await editEvent(id, data);
  };

  const handleDeleteEvent = useCallback(
    async (id: string) => {
      // App coordinates cross-hook cleanup: each hook updates only its own state.
      await deleteEvent(id);
      removeRSVPsForEvent(id);
    },
    [deleteEvent, removeRSVPsForEvent],
  );

  return (
    <div className="min-h-screen flex justify-center items-center">
      <div className="flex flex-col justify-center items-center gap-4">
        <div className="flex justify-center items-center gap-4">
          {roles.map((role, i) => (
            <button
              key={i}
              className={`p-2 border-solid border-4 rounded-lg cursor-pointer ${role === currentRole ? "bg-gray-500" : "bg-blue-500"}`}
              onClick={() => setCurrentRole(role)}
            >
              {role}
            </button>
          ))}
        </div>
        {currentRole === "user" && (
          <div className="flex justify-center items-center gap-4">
            {[
              { label: "All", id: "all" },
              { label: "Attending", id: "attending" },
              { label: "Not Attending", id: "not_attending" },
            ].map((btn, i) => (
              <button
                key={i}
                className="p-2 border-solid border-4 rounded-lg cursor-pointer bg-blue-500"
                onClick={() => setFilter(btn.id)}
              >
                {btn.label}
              </button>
            ))}
          </div>
        )}
        {currentRole === "admin" && (
          <div className="flex justify-end items-center">
            <button
              className="p-2 border-solid border-4 rounded-lg cursor-pointer bg-blue-500"
              onClick={() => setIsCreatingEvent(true)}
            >
              Create Event +
            </button>
          </div>
        )}
        {isCreatingEvent && <CreateEventForm onCreate={handleCreateEvent} />}
        {!isFetchingEvents && !isEditingId && !isCreatingEvent && (
          <div className="flex flex-col justify-center items-center">
            <h1>Events</h1>
            <div className="grid gap-4 grid-cols-3 p-24">
              {currentRole === "user" &&
                filteredEvents.map((event) => {
                  const rsvpStatus = userEvents.find(
                    (ue) => ue.userId === user.id && ue.eventId === event.id,
                  )?.status;
                  return (
                    <EventCard
                      key={event.id}
                      currentRole={currentRole}
                      event={event}
                      onEdit={setIsEditingId}
                      onEditRSVPStatus={updateRSVP}
                      onDelete={handleDeleteEvent}
                      rsvpStatus={rsvpStatus}
                      cntAttending={attendance[event.id]?.attending}
                      cntNotAttending={attendance[event.id]?.not_attending}
                    />
                  );
                })}
              {currentRole === "admin" &&
                events.map((event) => {
                  const rsvpStatus = userEvents.find(
                    (ue) => ue.userId === user.id && ue.eventId === event.id,
                  )?.status;
                  return (
                    <EventCard
                      key={event.id}
                      currentRole={currentRole}
                      event={event}
                      onEdit={setIsEditingId}
                      onEditRSVPStatus={updateRSVP}
                      onDelete={handleDeleteEvent}
                      rsvpStatus={rsvpStatus}
                      cntAttending={attendance[event.id]?.attending}
                      cntNotAttending={attendance[event.id]?.not_attending}
                    />
                  );
                })}
            </div>
          </div>
        )}
        {isFetchingEvents && <div>Fetching events</div>}
        {fetchEventsError && <div>Error fetching events</div>}
        {isEditingId !== null && (
          <EditEventForm
            event={events.find((event: Event) => event.id === isEditingId)}
            onEdit={handleEditEvent}
          />
        )}
      </div>
    </div>
  );
}

export default App;
