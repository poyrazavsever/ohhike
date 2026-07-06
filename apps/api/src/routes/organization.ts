import { Router, Request, Response } from "express";
import { requireAuth } from "@clerk/express";
import Organization from "../models/Organization.js";
import OrgMember from "../models/OrgMember.js";
import { User } from "../models/User.js";

const router = Router();

// Get user's organizations
router.get("/", requireAuth(), async (req: Request & { auth?: any }, res: Response) => {
  try {
    const clerkId = req.auth.userId;
    const user = await User.findOne({ clerkId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const memberships = await OrgMember.find({ user_id: user._id }).populate("organization_id");
    const organizations = memberships.map(m => m.organization_id);

    res.json(organizations);
  } catch (error) {
    console.error("Error fetching organizations:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Create organization
router.post("/", requireAuth(), async (req: Request & { auth?: any }, res: Response) => {
  try {
    const { name, slug } = req.body;
    const clerkId = req.auth.userId;
    const user = await User.findOne({ clerkId });
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const org = new Organization({ name, slug });
    await org.save();

    const member = new OrgMember({
      organization_id: org._id,
      user_id: user._id,
      role: 'owner'
    });
    await member.save();

    res.status(201).json(org);
  } catch (error) {
    console.error("Error creating organization:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
