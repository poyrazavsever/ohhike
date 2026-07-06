import cors from "cors";

const ALLOWED_ORIGINS = [
  "http://localhost:3000", // web (marketing)
  "http://localhost:3001", // app (dashboard)
  process.env.NEXT_PUBLIC_APP_URL,
  process.env.NEXT_PUBLIC_WEB_URL,
].filter(Boolean) as string[];

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (Postman, server-to-server, webhooks)
    if (!origin) return callback(null, true);

    if (ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS: Origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});
