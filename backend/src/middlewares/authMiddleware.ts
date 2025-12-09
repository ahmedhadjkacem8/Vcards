import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/user";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

interface AuthRequest extends Request {
  user?: any;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  console.log("[AUTH MIDDLEWARE] Authorization header:", authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("[AUTH MIDDLEWARE] No Bearer token found");
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  console.log("[AUTH MIDDLEWARE] Token extracted:", token);

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    console.log("[AUTH MIDDLEWARE] Token decoded:", decoded);

    const user = await User.findByPk(decoded.id);
    if (!user) {
      console.log("[AUTH MIDDLEWARE] User not found for token");
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = user;
    next();
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("[AUTH MIDDLEWARE] Token verification failed:", err.message);
    } else {
      console.error("[AUTH MIDDLEWARE] Unknown error:", err);
    }
    res.status(401).json({ message: "Unauthorized" });
  }
};
