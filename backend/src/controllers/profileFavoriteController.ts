// src/controllers/profileFavoriteController.ts
import { Request, Response } from "express";
import { ProfileFavorite, Profile } from "../models";

// GET /favorites
export const getFavorites = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    // Inclure les infos du profil lié
    const favorites = await ProfileFavorite.findAll({
      where: { user_id: user.id },
      include: [{ model: Profile }],
    });

    // Map pour ne garder que le profil
    const profiles = favorites.map(fav => fav.Profile);

    res.json(profiles); // renvoie directement les profils
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /favorites
export const addFavorite = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { profile_id } = req.body;
    if (!profile_id) return res.status(400).json({ message: "profile_id required" });

    const fav = await ProfileFavorite.create({ user_id: user.id, profile_id });
    res.status(201).json(fav);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /favorites/:id
export const deleteFavorite = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id:profile_id } = req.params;

    if (!profile_id) {
      return res.status(400).json({ message: "profile_id requis" });
    }

    const fav = await ProfileFavorite.findOne({
      where: { user_id: user.id, profile_id },
    });

    if (!fav) return res.status(404).json({ message: "Favori non trouvé" });

    await fav.destroy();
    res.json({ message: "Favori supprimé avec succès" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
