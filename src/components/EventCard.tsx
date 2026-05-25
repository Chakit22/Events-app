import type { EventCardProps } from "../types/EventCardProps";
import { Pencil } from "lucide-react";
import { Trash } from "lucide-react";

export const EventCard = ({
  title,
  description,
  date,
  location,
  time,
}: EventCardProps) => {
  return (
    <div className="flex flex-col justify-center items-start gap-4 p-8 border-solid border-4 border-black rounded-lg">
      <div className="w-full flex justify-between items-center">
        <h2>{title}</h2>
        <div className="flex justify-center items-center">
          <Pencil />
          <Trash />
        </div>
      </div>
      <div>{description}</div>
      <div className="flex justify-start items-center gap-4">
        <div>{date}</div>
        <div>{location}</div>
        <div>{time}</div>
      </div>
    </div>
  );
};
