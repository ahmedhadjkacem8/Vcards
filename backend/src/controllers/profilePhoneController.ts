import { Request, Response } from "express";
import {Profile, ProfilePhone } from "../models";

// -------- Ajouter un phone --------
export const addPhone = async (req: Request, res: Response) => {
  try {
    const profileId = req.params.id;

    // 1. Vérifier que le profil existe
    const profile = await Profile.findByPk(profileId);
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // 2. Compter les téléphones existants
    const existingCount = await ProfilePhone.count({
      where: { profile_id: profileId }
    });

    // 3. Limites selon le plan
    const maxPhones = profile.tier === "free" ? 1 : Infinity;

    if (existingCount >= maxPhones) {
      return res.status(403).json({
        message:
          "Free plan allows only one phone number. Upgrade to premium to add more."
      });
    }

    // 4. Créer le téléphone
    const phone = await ProfilePhone.create({
      ...req.body,
      profile_id: profileId
    });

    res.status(201).json(phone);
  } catch (err) {
    console.error("Error adding phone:", err);
    res.status(500).json({ message: "Server error" });
  }
};
// -------- Récupérer les phones d'un profil --------
export const getPhones = async (req: Request, res: Response) => {
  try {
    const phones = await ProfilePhone.findAll({ where: { profile_id: req.params.id } });
    res.json(phones);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// -------- Mettre à jour un phone --------
export const updatePhone = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const phone = await ProfilePhone.findByPk(id);

    if (!phone) {
      return res.status(404).json({ message: "Phone not found" });
    }

    await phone.update(req.body);
    res.json(phone);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// -------- Supprimer un phone --------
export const deletePhone = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const phone = await ProfilePhone.findByPk(id);

    if (!phone) {
      return res.status(404).json({ message: "Phone not found" });
    }

    await phone.destroy();
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
