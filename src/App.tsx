import { Route, Routes } from "react-router-dom";
import "./App.css";
import Events from "./components/Events";
import { NotFound } from "./components/NotFound";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Events />} />
      <Route path="/events/*" element={<Events />} />
      <Route path="/not-found" element={<NotFound />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
