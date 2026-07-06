import { Router, type Request, type Response } from "express";
import { Webhook } from "svix";
import { User } from "../models/User.js";

const router = Router();

/**
 * POST /api/webhooks/clerk
 * Clerk user.created / user.updated / user.deleted webhook'larını dinler.
 * Svix ile imza doğrulaması yapar.
 */
router.post("/clerk", async (req: Request, res: Response): Promise<void> => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SIGNING_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("❌ CLERK_WEBHOOK_SIGNING_SECRET tanımlı değil");
    res.status(500).json({ error: "Webhook secret missing" });
    return;
  }

  // Svix headers
  const svixId = req.headers["svix-id"] as string;
  const svixTimestamp = req.headers["svix-timestamp"] as string;
  const svixSignature = req.headers["svix-signature"] as string;

  if (!svixId || !svixTimestamp || !svixSignature) {
    res.status(400).json({ error: "Missing svix headers" });
    return;
  }

  try {
    const wh = new Webhook(WEBHOOK_SECRET);
    const payload = wh.verify(JSON.stringify(req.body), {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as Record<string, unknown>;

    const eventType = payload.type as string;
    const data = payload.data as Record<string, unknown>;

    switch (eventType) {
      case "user.created":
      case "user.updated": {
        const emailObj = (data.email_addresses as Array<Record<string, string>>)?.[0];
        const email = emailObj?.email_address || "";

        await User.findOneAndUpdate(
          { clerkId: data.id as string },
          {
            clerkId: data.id as string,
            email,
            displayName: [data.first_name, data.last_name].filter(Boolean).join(" ") || undefined,
            avatarUrl: data.image_url as string || undefined,
            lastActiveAt: new Date(),
          },
          { upsert: true, new: true }
        );

        console.log(`✅ User ${eventType}: ${data.id}`);
        break;
      }

      case "user.deleted": {
        await User.findOneAndDelete({ clerkId: data.id as string });
        console.log(`🗑️ User deleted: ${data.id}`);
        break;
      }

      default:
        console.log(`ℹ️ Unhandled webhook event: ${eventType}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("❌ Webhook doğrulama hatası:", error);
    res.status(400).json({ error: "Invalid webhook signature" });
  }
});

export default router;
