import { Router, Request, Response } from "express";
import { requireAuth } from "@clerk/express";
import WellnessCheckin from "../models/WellnessCheckin.js";
import NutritionLog from "../models/NutritionLog.js";
import PersonalTraining from "../models/PersonalTraining.js";

const router = Router();

// GET daily data summary for an athlete
router.get("/:athleteId", requireAuth(), async (req: Request, res: Response) => {
  try {
    const { athleteId } = req.params;
    
    const wellness = await WellnessCheckin.find({ athlete_id: athleteId }).sort({ date: -1 }).limit(7);
    const nutrition = await NutritionLog.find({ athlete_id: athleteId }).sort({ date: -1 }).limit(7);
    const training = await PersonalTraining.find({ athlete_id: athleteId }).sort({ date: -1 }).limit(7);

    res.json({ wellness, nutrition, training });
  } catch (error) {
    console.error("Error fetching daily data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST wellness checkin
router.post("/wellness", requireAuth(), async (req: Request, res: Response) => {
  try {
    const checkin = new WellnessCheckin(req.body);
    await checkin.save();
    res.status(201).json(checkin);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST nutrition log
router.post("/nutrition", requireAuth(), async (req: Request, res: Response) => {
  try {
    const log = new NutritionLog(req.body);
    await log.save();
    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
