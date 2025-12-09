import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User, Profile } from "../models";
import { Company } from "../models/Company";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

// Type pour un user avec profil inclus
interface UserWithProfile {
  id: string;
  email: string;
  role: string;
  profile?: {
    id: string;
    display_name: string;
    user_id: string;
    created_at: Date;
    updated_at: Date;
  };
}

// -------- SIGNUP --------
export const signup = async (req: Request, res: Response) => {
  try {
    const { email, password, display_name } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const existing = await User.findOne({ where: { email } });
    if (existing)
      return res.status(400).json({ message: "User already exists" });

    // Let the User model hook hash the password (avoid double-hashing)
    const user = await User.create({ email, password });
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });

    // ✅ Log du token
    console.log("[SIGNUP] User created:", user.email);
    console.log("[SIGNUP] Token:", token);

    // Do not create a profile here — profile will be created later from the frontend
    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// -------- LOGIN --------
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({
      where: { email },
      include: { model: Profile, as: "profile" },
    });

    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    // Récupérer la société liée à l'utilisateur
    const company = await Company.findOne({
      where: { created_by: user.id },
    });

    // Ajouter le role + company dans le token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    console.log("[LOGIN] User logged in:", user.email);
    console.log("[LOGIN] Token:", token);

    const { password: _, ...userData } = user.get({ plain: true });

    res.json({
      token,
      user: userData,
      company // ✅ ajouté ici
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// -------- GET CURRENT USER --------
interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

export const me = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findByPk(req.user.id, {
      include: { model: Profile, as: "profile" },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    const typedUser: UserWithProfile = {
      id: user.id,
      email: user.email,
      profile: user.get("profile") as any,
      role: user.role,
    };

    res.json({ user: typedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
// -------- SESSION --------
export const session = async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    // No token provided, or invalid format. Gracefully indicate no active session.
    return res.json({ user: null, message: "No active session" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.json({ user: null, message: "No active session" });
  }

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.id, {
      include: { model: Profile, as: "profile" },
    });

    if (!user) {
      // Token was valid but user not found (e.g., user deleted).
      return res.json({ user: null, message: "User not found for token" });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        profile: user.get("profile"),
      },
    });
  } catch (err: unknown) {
    // Token verification failed (e.g., expired, malformed).
    if (err instanceof Error) {
      console.error("[SESSION] Token verification failed:", err.message);
    } else {
      console.error("[SESSION] Unknown error during token verification:", err);
    }
    return res.json({ user: null, message: "Invalid or expired session" });
  }
};



// -------- CHECK ADMIN --------
export const checkAdmin = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }
    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check admin role using 'role' field
    res.json({ isAdmin: user.role === "admin" });
  } catch (err) {
    console.error("[CHECK ADMIN]", err);
    res.status(401).json({ message: "Unauthorized" });
  }
};