import { initialEvents } from "./events.js";

import type { UserEvent } from "../types/UserEvent.js";

export const MOCK_USER_ID = "mock-user";

export const store = {
  events: [...initialEvents],
  rsvps: [] as UserEvent[],
};
