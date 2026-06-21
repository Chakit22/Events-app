import express from "express";
import cors from "cors";
import eventRoutes from "./routes/events.routes.js";
import type { Request, Response } from "express";
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.use("/events", eventRoutes);

app.get("/health", (req: Request, res: Response) => {
  res.send("Status: OK");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
