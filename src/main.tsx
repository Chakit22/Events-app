import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Box } from "./components/Box.tsx";
import { Button } from "./components/Button.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Box children={<Button />} message="Hey"></Box>
  </StrictMode>,
);
