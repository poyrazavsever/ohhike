import { Router, Request, Response } from "express";
import { requireAuth } from "@clerk/express";
import Team from "../models/Team.js";
import TeamStaff from "../models/TeamStaff.js";
import User from "../models/User.js";

const router = Router();

// Get teams for an organization
router.get("/:orgId", requireAuth(), async (req: Request, res: Response) => {
  try {
    const { orgId } = req.params;
    const teams = await Team.find({ organization_id: orgId });
    res.json(teams);
  } catch (error) {
    console.error("Error fetching teams:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Create team
router.post("/", requireAuth(), async (req: Request, res: Response) => {
  try {
    const { name, organization_id } = req.body;
    const clerkId = req.auth.userId;
    const user = await User.findOne({ clerk_id: clerkId });
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const team = new Team({ name, organization_id });
    await team.save();

    const staff = new TeamStaff({
      team_id: team._id,
      user_id: user._id,
      role: 'head_coach'
    });
    await staff.save();

    res.status(201).json(team);
  } catch (error) {
    console.error("Error creating team:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
