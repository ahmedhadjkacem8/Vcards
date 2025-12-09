import { Router } from "express";
import { addFavorite, deleteFavorite, getFavorites } from "../controllers/profileFavoriteController";

const router = Router();

router.get("/", getFavorites);
router.post("/", addFavorite);
router.delete("/:profile_id", deleteFavorite);
export default router;
