import "dotenv/config";
import express from "express";
import { connectDB } from "./lib/database.js";
import { corsMiddleware } from "./middleware/cors.js";
import webhookRoutes from "./routes/webhooks.js";

const app = express();
const PORT = process.env.PORT || 3002;

// --- Middleware ---
app.use(corsMiddleware);
app.use(express.json());

// --- Routes ---
import orgRoutes from "./routes/organization.js";
import teamRoutes from "./routes/team.js";
import athleteRoutes from "./routes/athlete.js";
import sessionRoutes from "./routes/session.js";

app.use("/api/webhooks", webhookRoutes);
app.use("/api/v1/organizations", orgRoutes);
app.use("/api/v1/teams", teamRoutes);
app.use("/api/v1/athletes", athleteRoutes);
app.use("/api/v1/sessions", sessionRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "ohhike-api",
    timestamp: new Date().toISOString(),
  });
});

// --- Start ---
async function start() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 OhHike API çalışıyor: http://localhost:${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/api/health`);
  });
}

start().catch((err) => {
  console.error("❌ Server başlatılamadı:", err);
  process.exit(1);
});
