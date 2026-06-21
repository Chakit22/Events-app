import type { Event } from "../types/Event";
import { ArrowLeftFromLine, Pencil } from "lucide-react";
import { Trash } from "lucide-react";
import { memo } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import type { UserEvent } from "../types/UserEvent";
import { useUser } from "../hooks/useUser";

interface EventDetailProps {
  events: Event[];
  userEvents: UserEvent[];
  currentRole: string;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onEditRSVPStatus: (
    eventId: string,
    status: "attending" | "not_attending",
  ) => void;
  attendance: Record<
    string,
    {
      attending: number;
      not_attending: number;
    }
  >;
  isFetchingEvents: boolean;
}

export const EventDetail = memo(
  ({
    events,
    userEvents,
    currentRole,
    onDelete,
    onEdit,
    onEditRSVPStatus,
    attendance,
    isFetchingEvents,
  }: EventDetailProps) => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user } = useUser();
    const event = events.find((event: Event) => event.id === id);

    if (isFetchingEvents) {
      return <div>Fetching event...</div>;
    }

    if (!event) {
      return <Navigate to="/not-found" replace />;
    }

    const rsvpStatus = userEvents.find(
      (ue) => ue.userId === user.id && ue.eventId === event.id,
    )?.status;

    // return (
    //   <div className="min-h-screen flex justify-center items-center p-8">
    //     <div className="w-full flex justify-between items-center">
    //       <h2>{event.title}</h2>
    //       <div className="flex justify-center items-center">
    //         {currentRole === "admin" && (
    //           <Trash onClick={() => onDelete(event.id)} />
    //         )}
    //         {currentRole === "admin" && (
    //           <Pencil onClick={() => onEdit(event.id)} />
    //         )}
    //       </div>
    //     </div>
    //     <div>{event.description}</div>
    //     <div className="flex justify-start items-center gap-4">
    // <div>{event.date}</div>
    // <div>{event.location}</div>
    // <div>{event.time}</div>
    // </div>
    // {currentRole === "user" && (
    //   <div className="w-full flex flex-col items-end gap-2">
    //     {rsvpStatus && <div>You are {rsvpStatus} this event</div>}
    //     <div className="flex justify-end items-center gap-4">
    //       <button
    //         className={`p-2 border-solid border-4 rounded-lg cursor-pointer ${
    //           rsvpStatus === "attending" ? "bg-green-500" : "bg-blue-500"
    //         }`}
    //         onClick={() => onEditRSVPStatus(event.id, "attending")}
    //       >
    //         Attending
    //       </button>
    //       <button
    //         className={`p-2 border-solid border-4 rounded-lg cursor-pointer ${
    //           rsvpStatus === "not_attending" ? "bg-red-500" : "bg-blue-500"
    //         }`}
    //         onClick={() => onEditRSVPStatus(event.id, "not_attending")}
    //       >
    //         Not Attending
    //       </button>
    //     </div>
    //   </div>
    // )}
    // {currentRole === "admin" && (
    //   <div className="flex flex-col justify-center items-start">
    //     <div>
    //       Attending :{" "}
    //       {attendance[event.id].attending
    //         ? attendance[event.id].attending
    //         : 0}
    //     </div>
    //     <div>
    //       Not Attending :{" "}
    //       {attendance[event.id].not_attending
    //         ? attendance[event.id].not_attending
    //         : 0}
    //     </div>
    //   </div>
    // )}
    //   </div>
    // );

    return (
      <div className="min-h-screen flex justify-center items-center p-8">
        <div className="flex flex-col gap-8">
          {/* back to events  */}
          <div className="flex items-center gap-4">
            <ArrowLeftFromLine onClick={() => navigate("/events")} />
            {"Back to Events"}
          </div>
          {/* Event Name */} {/* Edit / Delete */}
          <div className="flex flex justify-between items-center gap-4">
            <div>{event.title}</div>
            <div className="flex justify-center items-center">
              {currentRole === "admin" && (
                <Trash onClick={() => onDelete(event.id)} />
              )}
              {currentRole === "admin" && (
                <Pencil onClick={() => onEdit(event.id)} />
              )}
            </div>
          </div>
          {/* Description */}
          <div>{event.description}</div>
          <div>{event.date}</div>
          <div>{event.location}</div>
          <div>{event.time}</div>
          {currentRole === "user" && (
            <div className="w-full flex flex-col items-end gap-2">
              {rsvpStatus && <div>You are {rsvpStatus} this event</div>}
              <div className="flex justify-end items-center gap-4">
                <button
                  className={`p-2 border-solid border-4 rounded-lg cursor-pointer ${
                    rsvpStatus === "attending" ? "bg-green-500" : "bg-blue-500"
                  }`}
                  onClick={() => onEditRSVPStatus(event.id, "attending")}
                >
                  Attending
                </button>
                <button
                  className={`p-2 border-solid border-4 rounded-lg cursor-pointer ${
                    rsvpStatus === "not_attending"
                      ? "bg-red-500"
                      : "bg-blue-500"
                  }`}
                  onClick={() => onEditRSVPStatus(event.id, "not_attending")}
                >
                  Not Attending
                </button>
              </div>
            </div>
          )}
          {currentRole === "admin" && (
            <div className="flex flex-col justify-center items-start">
              <div>
                Attending :{" "}
                {attendance[event.id].attending
                  ? attendance[event.id].attending
                  : 0}
              </div>
              <div>
                Not Attending :{" "}
                {attendance[event.id].not_attending
                  ? attendance[event.id].not_attending
                  : 0}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  },
);
