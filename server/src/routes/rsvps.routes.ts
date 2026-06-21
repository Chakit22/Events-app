import { Router, type Request, type Response } from "express";
import { store } from "../data/store.js";

const router = Router();

router.get("/", (_req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: "RSVPs retrieved successfully",
    body: store.rsvps,
  });
});

export default router;
