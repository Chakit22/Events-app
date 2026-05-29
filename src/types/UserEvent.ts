import type { User } from "./User";
import type { Event } from "./Event";

export interface UserEvent {
  userId: string;
  eventId: string;
  status: "attending" | "not_attending";
}
