import { Request, Response } from "express";
import { Profile, ProfileEmail } from "../models";



export const addEmail = async (req: Request, res: Response) => {
  try {
    const profileId = req.params.id;

    // 1. Vérifier que le profil existe
    const profile = await Profile.findByPk(profileId);
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // 2. Compter les emails existants
    const existingCount = await ProfileEmail.count({
      where: { profile_id: profileId }
    });

    // 3. Limites selon le plan
    const maxEmails = profile.tier === "free" ? 1 : Infinity;

    if (existingCount >= maxEmails) {
      return res.status(403).json({
        message:
          "Free plan allows only one email. Upgrade to premium to add more."
      });
    }

    // 4. Créer l'email
    const email = await ProfileEmail.create({
      ...req.body,
      profile_id: profileId
    });

    res.json(email);
  } catch (err) {
    console.error("Error adding email:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getEmails = async (req: Request, res: Response) => {
  try {
    const emails = await ProfileEmail.findAll({ where: { profile_id: req.params.id } });
    res.json(emails);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// -------- Mettre à jour un email --------
export const updateEmail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const email = await ProfileEmail.findByPk(id);

    if (!email) {
      return res.status(404).json({ message: "Email not found" });
    }

    await email.update(req.body);
    res.json(email);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// -------- Supprimer un email --------
export const deleteEmail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const email = await ProfileEmail.findByPk(id);

    if (!email) {
      return res.status(404).json({ message: "Email not found" });
    }

    await email.destroy();
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


