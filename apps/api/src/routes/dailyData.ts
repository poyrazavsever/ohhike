import { Router, Request, Response } from "express";
import mongoose from "mongoose";
import { requireAuth } from "../middleware/auth.js";
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

// GET team wellness checkins
router.get("/team/:teamId/wellness", requireAuth(), async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    // Mongoose Aggregate kullanarak ilgili takıma ait sporcuların wellness verilerini getirir
    const wellness = await WellnessCheckin.aggregate([
      {
        $lookup: {
          from: 'athletes',
          localField: 'athlete_id',
          foreignField: '_id',
          as: 'athlete'
        }
      },
      { $unwind: "$athlete" },
      { $match: { "athlete.team_id": new mongoose.Types.ObjectId(teamId as string) } },
      { $sort: { date: -1 } },
      { $limit: 100 }
    ]);
    res.json(wellness);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET team nutrition logs
router.get("/team/:teamId/nutrition", requireAuth(), async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const nutrition = await NutritionLog.aggregate([
      {
        $lookup: {
          from: 'athletes',
          localField: 'athlete_id',
          foreignField: '_id',
          as: 'athlete'
        }
      },
      { $unwind: "$athlete" },
      { $match: { "athlete.team_id": new mongoose.Types.ObjectId(teamId as string) } },
      { $sort: { date: -1 } },
      { $limit: 100 }
    ]);
    res.json(nutrition);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET team personal trainings
router.get("/team/:teamId/training", requireAuth(), async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const training = await PersonalTraining.aggregate([
      {
        $lookup: {
          from: 'athletes',
          localField: 'athlete_id',
          foreignField: '_id',
          as: 'athlete'
        }
      },
      { $unwind: "$athlete" },
      { $match: { "athlete.team_id": new mongoose.Types.ObjectId(teamId as string) } },
      { $sort: { date: -1 } },
      { $limit: 100 }
    ]);
    res.json(training);
  } catch (error) {
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

