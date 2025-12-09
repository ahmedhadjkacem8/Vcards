import { Router } from "express";
import { getSocialPlatforms } from "../controllers/socialPlatformController";

const router = Router();

router.get("/", getSocialPlatforms);

export default router;
