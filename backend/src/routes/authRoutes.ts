import { Router } from "express";
import { signup, login, me, session, checkAdmin } from "../controllers/authController";
import { validateBody } from "../middlewares/validateMiddleware";
import Joi from "joi";
import { authenticate } from "../middlewares/authMiddleware";

const router = Router();

// Validation schemas
const signupSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  display_name: Joi.string().optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// Routes
router.post("/signup", validateBody(signupSchema), signup);
router.post("/login", validateBody(loginSchema), login);
router.get("/me", authenticate, me);            // Retourne l'utilisateur connecté via Bearer token
router.get("/session", session);
// Vérifie si l'utilisateur courant est administrateur
router.get("/check-admin", authenticate, checkAdmin);

export default router;
