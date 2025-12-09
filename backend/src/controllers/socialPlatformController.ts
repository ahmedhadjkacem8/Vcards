import { Request, Response } from "express";
import { SocialPlatform } from "../models";

export const getSocialPlatforms = async (req: Request, res: Response) => {
  try {
    const platforms = await SocialPlatform.findAll({
      order: [["display_order", "ASC"]],
    });

    return res.json(platforms);
  } catch (error) {
    console.error("Erreur getSocialPlatforms:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};
