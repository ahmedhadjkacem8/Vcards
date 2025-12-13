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

    // Validate payload: either maps_link provided OR both latitude and longitude
    const { maps_link, latitude, longitude } = req.body as {
      maps_link?: string;
      latitude?: number | string;
      longitude?: number | string;
    };

    const payload: any = { ...req.body, profile_id: profileId };

    if (maps_link) {
      // try to resolve maps link server-side to extract coords
      const resolved = await resolveMapsLink(maps_link);
      if (resolved) {
        payload.latitude = resolved.lat;
        payload.longitude = resolved.lon;
      } else {
        // keep maps_link only; latitude/longitude remain null
        // do not fail creation — frontend will show external link fallback
      }
    } else {
      const lat = latitude !== undefined ? parseFloat(String(latitude)) : NaN;
      const lon = longitude !== undefined ? parseFloat(String(longitude)) : NaN;
      if (Number.isNaN(lat) || Number.isNaN(lon)) {
        return res.status(400).json({ message: 'Provide either a valid `maps_link` or both `latitude` and `longitude`.' });
      }
      payload.latitude = lat;
      payload.longitude = lon;
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
