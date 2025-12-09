// src/routes/favorites.ts
import { Router } from "express";
import { getFavorites, addFavorite, deleteFavorite } from "../controllers/profileFavoriteController";
import { authenticate } from "../middlewares/authMiddleware";

const router = Router();

// Toutes les routes ci-dessous nécessitent un utilisateur connecté
router.use(authenticate);

// GET /favorites - récupérer les favoris de l'utilisateur connecté
router.get("/", getFavorites);

// POST /favorites - ajouter un favori
router.post("/", addFavorite);

// DELETE /favorites/:id - supprimer un favori
router.delete("/:id", deleteFavorite);

export default router;
