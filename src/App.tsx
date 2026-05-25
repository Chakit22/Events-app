import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";
import heroImg from "./assets/hero.png";
import "./App.css";
import { Eventlist } from "./components/EventList";
import { EventForm } from "./components/EventForm";

const tabs = [
  { id: "create", label: "Create Event", component: <EventForm /> },
  { id: "edit", label: "Edit Event", component: <Eventlist /> },
  { id: "delete", label: "Delete Event", component: <Eventlist /> },
];

function App() {
  const [activeId, setActiveId] = useState("create");
  const active = tabs.find((tab) => tab.id === activeId);
  return (
    <div className="min-h-screen flex justify-center items-center">
      <div className="flex flex-col justify-center items-center gap-4">
        <div className="flex justify-center items-center gap-4">
          {tabs.map((tab) => (
            <button
              className="border-solid border-4 rounded-lg cursor-pointer bg-blue-500"
              onClick={() => setActiveId(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {active?.component}
      </div>
    </div>
  );
}

export default App;
