import { Request, Response } from "express";
import { Profile, ProfileAddress } from "../models";

export const addAddress = async (req: Request, res: Response) => {
  try {

    const profileId = req.params.id;

    // 1. Vérifier que le profil existe
    const profile = await Profile.findByPk(profileId);
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // 2. Compter les adresses existantes
    const existingCount = await ProfileAddress.count({
      where: { profile_id: profileId }
    });

    // 3. Bloquer si plan free et déjà 1 adresse
    if (profile.tier === "free" && existingCount >= 1) {
      return res.status(403).json({
        message: "Free plan allows only one address. Upgrade to premium."
      });
    }
    const address = await ProfileAddress.create({
      ...req.body,
      profile_id: req.params.id, // ✅ obligatoire
    });
    
    res.json(address);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAddresses = async (req: Request, res: Response) => {
  try {
    const addresses = await ProfileAddress.findAll({ where: { profile_id: req.params.id } });
    res.json(addresses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// -------- Mettre à jour une adresse --------
export const updateAddress = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const address = await ProfileAddress.findByPk(id);

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    await address.update(req.body);
    res.json(address);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// -------- Supprimer une adresse --------
export const deleteAddress = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const address = await ProfileAddress.findByPk(id);

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    await address.destroy();
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
