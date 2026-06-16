import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { SourceMapDemo } from "./components/SourceMapDemo.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SourceMapDemo />
  </StrictMode>,
);
