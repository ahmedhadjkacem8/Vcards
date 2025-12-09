import { Request, Response } from "express";
import { Profile } from "../models";
import ProfileLocalization from "../models/profileLocalization";

export const addLocalization = async (req: Request, res: Response) => {
  try {
    const profileId = req.params.profile_id;
    const { address, latitude, longitude, google_maps_link, is_primary } = req.body;

    // Validate that either google_maps_link or both latitude and longitude are provided
    if (!google_maps_link && (!latitude || !longitude)) {
      return res.status(400).json({
        message: "You must provide either a Google Maps link or both latitude and longitude.",
      });
    }

    // 1. Check if the profile exists
    const profile = await Profile.findByPk(profileId);
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // 2. Count existing localizations
    const existingCount = await ProfileLocalization.count({
      where: { profile_id: profileId },
    });

    // 3. Block if free plan and already 1 localization
    if (profile.tier === "free" && existingCount >= 1) {
      return res.status(403).json({
        message: "Free plan allows only one localization. Upgrade to premium.",
      });
    }

    const localization = await ProfileLocalization.create({
      profile_id: profileId,
      address,
      latitude,
      longitude,
      google_maps_link,
      is_primary,
    });

    res.json(localization);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getLocalizations = async (req: Request, res: Response) => {
  try {
    const localizations = await ProfileLocalization.findAll({
      where: { profile_id: req.params.profile_id },
    });
    res.json(localizations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateLocalization = async (req: Request, res: Response) => {
  try {
    const { localization_id } = req.params;
    const { address, latitude, longitude, google_maps_link, is_primary } = req.body;

    // Validate that either google_maps_link or both latitude and longitude are provided
    if (!google_maps_link && (!latitude || !longitude)) {
      return res.status(400).json({
        message: "You must provide either a Google Maps link or both latitude and longitude.",
      });
    }

    const localization = await ProfileLocalization.findByPk(localization_id);

    if (!localization) {
      return res.status(404).json({ message: "Localization not found" });
    }

    await localization.update({
      address,
      latitude,
      longitude,
      google_maps_link,
      is_primary,
    });
    res.json(localization);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteLocalization = async (req: Request, res: Response) => {
  try {
    const { localization_id } = req.params;
    const localization = await ProfileLocalization.findByPk(localization_id);

    if (!localization) {
      return res.status(404).json({ message: "Localization not found" });
    }

    await localization.destroy();
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


export const expandUrl = async (req: Request, res: Response) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ message: "Le champ 'url' est requis." });
    }

    // Vérifie si c'est un lien raccourci
    if (!url.includes("goo.gl")) {
      return res.status(400).json({ message: "Le lien fourni n'est pas un lien raccourci Google." });
    }

    // Suivre la redirection pour obtenir l'URL finale
    const response = await fetch(url, {
      method: "HEAD",  // HEAD suffit pour suivre la redirection
      redirect: "follow",
    });

    const finalUrl = response.url;

    res.json({ finalUrl });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message || "Impossible d'étendre le lien." });
  }
};