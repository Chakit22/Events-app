import { useState } from "react";
import type { User } from "../types/User";

export const useUser = () => {
  if (!localStorage.getItem("users")) {
    localStorage.setItem(
      "users",
      JSON.stringify([
        {
          id: crypto.randomUUID(),
          name: "Alice Johnson",
          phone: 5550101,
          email: "alice.johnson@example.com",
          role: "user",
        },
        {
          id: crypto.randomUUID(),
          name: "Bob Smith",
          phone: 5550102,
          email: "bob.smith@example.com",
          role: "admin",
        },
        {
          id: crypto.randomUUID(),
          name: "Carla Mendez",
          phone: 5550103,
          email: "carla.mendez@example.com",
          role: "user",
        },
        {
          id: crypto.randomUUID(),
          name: "David Lee",
          phone: 5550104,
          email: "david.lee@example.com",
          role: "admin",
        },
        {
          id: crypto.randomUUID(),
          name: "Emma Wilson",
          phone: 5550105,
          email: "emma.wilson@example.com",
          role: "user",
        },
      ]),
    );
  }

  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("users")!)[0],
  );

  return { user, setUser };
};
