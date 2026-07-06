import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/auth.js";
import Session from "../models/Session.js";

const router = Router();

// Get sessions for a team
router.get("/team/:teamId", requireAuth(), async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const sessions = await Session.find({ team_id: teamId }).sort({ date: -1 });
    res.json(sessions);
  } catch (error) {
    console.error("Error fetching sessions:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Create session
router.post("/", requireAuth(), async (req: Request, res: Response) => {
  try {
    const { team_id, title, date, duration_minutes, type } = req.body;
    
    const session = new Session({ team_id, title, date, duration_minutes, type });
    await session.save();

    res.status(201).json(session);
  } catch (error) {
    console.error("Error creating session:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;

