export interface UserEvent {
  userId: string;
  eventId: string;
  status: "attending" | "not_attending";
}
