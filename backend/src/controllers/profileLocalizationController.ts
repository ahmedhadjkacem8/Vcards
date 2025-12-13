import { Request, Response } from "express";
import { Profile } from "../models";
import ProfileLocalization from "../models/profileLocalization";
import resolveMapsLink from "../utils/mapsResolver";

export const addLocalization = async (req: Request, res: Response) => {
  try {
    const profileId = req.params.profile_id;

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

    const { maps_link, latitude, longitude, address, is_primary } = req.body as {
      maps_link?: string;
      latitude?: number | string;
      longitude?: number | string;
      address: string;
      is_primary: boolean;
    };

    const payload: any = {
      profile_id: profileId,
      address,
      is_primary,
    };

    // Case 1: maps_link is provided
    if (maps_link && typeof maps_link === 'string' && maps_link.trim().length > 0) {
      payload.maps_link = maps_link.trim();
      
      if (!payload.address) {
          payload.address = payload.maps_link;
      }

      const resolved = await resolveMapsLink(payload.maps_link);
      if (resolved) {
        payload.latitude = resolved.lat;
        payload.longitude = resolved.lon;
      }
    } 
    // Case 2: latitude and longitude are provided
    else if (latitude !== undefined && longitude !== undefined) {
      const lat = parseFloat(String(latitude));
      const lon = parseFloat(String(longitude));

      if (Number.isNaN(lat) || Number.isNaN(lon)) {
        return res.status(400).json({ message: 'When providing coordinates, `latitude` and `longitude` must be valid numbers.' });
      }
      
      if (!address) {
           return res.status(400).json({ message: '`address` is required when providing coordinates.' });
      }

      payload.latitude = lat;
      payload.longitude = lon;
    } 
    // Case 3: Invalid payload
    else {
      return res.status(400).json({ message: 'Provide either a valid `maps_link` or both `latitude` and `longitude`.' });
    }

    const localization = await ProfileLocalization.create(payload);

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
    const localization = await ProfileLocalization.findByPk(localization_id);

    if (!localization) {
      return res.status(404).json({ message: "Localization not found" });
    }

    await localization.update(req.body);
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
