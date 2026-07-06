import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/auth.js";
import Athlete from "../models/Athlete.js";
import Team from "../models/Team.js";

const router = Router();

// Get athletes for a team
router.get("/team/:teamId", requireAuth(), async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const athletes = await Athlete.find({ team_id: teamId });
    res.json(athletes);
  } catch (error) {
    console.error("Error fetching athletes:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Create athlete
router.post("/", requireAuth(), async (req: Request, res: Response) => {
  try {
    const { team_id, first_name, last_name, email, position } = req.body;

    const team = await Team.findById(team_id);
    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    const athlete = new Athlete({ team_id, first_name, last_name, email, position });
    await athlete.save();

    res.status(201).json(athlete);
  } catch (error) {
    console.error("Error creating athlete:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;

