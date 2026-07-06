import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/auth.js";
import Organization from "../models/Organization.js";
import OrgMember from "../models/OrgMember.js";
import { User } from "../models/User.js";

const router = Router();

// Get user's organizations
router.get("/", requireAuth(), async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const memberships = await OrgMember.find({ user_id: user._id }).populate("organization_id");
    
    // Frontend'in beklediği format: { organization: {...}, membership: {...} }
    const workspaces = memberships.map(m => ({
      organization: m.organization_id,
      membership: {
        _id: m._id,
        role: m.role,
        organization_id: m.organization_id._id || m.organization_id,
        user_id: m.user_id
      }
    }));

    res.json(workspaces);
  } catch (error) {
    console.error("Error fetching organizations:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Create organization
router.post("/", requireAuth(), async (req: Request, res: Response) => {
  try {
    const { name, slug } = req.body;
    const userId = req.user?.id;
    const user = await User.findOne({ _id: userId });
    
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

