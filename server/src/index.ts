import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import eventRoutes from "./routes/events.routes.js";
const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

app.use("/events", eventRoutes);

app.get("/health", (req: any, res: any) => {
  res.send("Status: OK");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
