import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// req.user tipini Express.Request içerisine dahil ediyoruz
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

export const requireAuth = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized: No token provided" });
      }

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_super_secret") as { id: string; email: string };
      
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }
  };
};
