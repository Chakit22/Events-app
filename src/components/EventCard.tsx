import type { Event } from "../types/Event";
import { Pencil } from "lucide-react";
import { Trash } from "lucide-react";

interface EventCardProps {
  event: Event;
  onDelete: (id: number) => void;
  onEdit: (id: number) => void;
}

export const EventCard = ({ event, onDelete, onEdit }: EventCardProps) => {
  return (
    <div className="flex flex-col justify-center items-start gap-4 p-8 border-solid border-4 border-black rounded-lg">
      <div className="w-full flex justify-between items-center">
        <h2>{event.title}</h2>
        <div className="flex justify-center items-center">
          <Trash onClick={() => onDelete(event.id)} />
          <Pencil onClick={() => onEdit(event.id)} />
        </div>
      </div>
      <div>{event.description}</div>
      <div className="flex justify-start items-center gap-4">
        <div>{event.date}</div>
        <div>{event.location}</div>
        <div>{event.time}</div>
      </div>
    </div>
  );
};
