import type { Event } from "../types/Event.js";

export const initialEvents: Event[] = [
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
