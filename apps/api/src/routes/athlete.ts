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

// Get current logged in athlete profile
router.get("/me", requireAuth(), async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    // Auth middleware req.user._id veya id döndürebiliyor, Mongoose için ObjectId'ye gerek yok mongoose kendisi çevirir
    const athlete = await Athlete.findOne({ user_id: userId }).populate("team_id");
    
    if (!athlete) {
      return res.status(404).json({ error: "Athlete profile not found" });
    }
    
    res.json(athlete);
  } catch (error) {
    console.error("Error fetching athlete profile:", error);
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

