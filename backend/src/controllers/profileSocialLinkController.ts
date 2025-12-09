import { Request, Response } from "express";
import { Profile , ProfileSocialLink } from "../models";

export const addSocialLink = async (req: Request, res: Response) => {
  try {
    const profileId = req.params.id;

    // 1. Vérifier que le profil existe
    const profile = await Profile.findByPk(profileId);
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // 2. Compter les liens existants
    const existingCount = await ProfileSocialLink.count({
      where: { profile_id: profileId }
    });

    // 3. Limites selon le plan
    const maxLinks = profile.tier === "free" ? 3 : Infinity;

    if (existingCount >= maxLinks) {
      return res.status(403).json({
        message:
          "Free plan allows only 3 social links. Upgrade to premium to add more."
      });
    }

    // 4. Créer le lien
    const link = await ProfileSocialLink.create({
      ...req.body,
      profile_id: profileId
    });

    res.status(201).json(link);
  } catch (err) {
    console.error("Error adding social link:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getSocialLinks = async (req: Request, res: Response) => {
  try {
    const links = await ProfileSocialLink.findAll({
      where: { profile_id: req.params.id },
    });
    res.json(links);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateSocialLink = async (req: Request, res: Response) => {
  try {
    const { linkId } = req.params;
    const link = await ProfileSocialLink.findByPk(linkId);
    if (!link) {
      return res.status(404).json({ message: "Link not found" });
    }
    await link.update(req.body);
    res.json(link);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteSocialLink = async (req: Request, res: Response) => {
  try {
    const { linkId } = req.params;
    const link = await ProfileSocialLink.findByPk(linkId);
    if (!link) {
      return res.status(404).json({ message: "Link not found" });
    }
    await link.destroy();
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
