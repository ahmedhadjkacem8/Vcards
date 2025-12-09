import { Request, Response } from "express";
import { QrStyle, Profile } from "../models";
import { Op } from "sequelize"; // Import Op for Sequelize operators
import { randomUUID } from "crypto";

// Basic validation for the options JSON structure (without Zod)
const validateQrOptions = (options: any): string[] => {
  const errors: string[] = [];

  if (typeof options !== "object" || options === null) {
    errors.push("Options must be a valid JSON object.");
    return errors;
  }

  // Example validation for 'color' and 'bgColor'
  if (options.color && typeof options.color !== "string") {
    errors.push("Color must be a string.");
  }
  if (options.bgColor && typeof options.bgColor !== "string") {
    errors.push("Background color must be a string.");
  }

  // Add more detailed validation for other fields like gradient, shape, etc.
  // This would typically be handled by a schema validation library like Zod.
  // For now, we'll keep it basic.
  if (options.gradient !== undefined) {
    if (options.gradient !== null && (typeof options.gradient !== 'object' || !options.gradient.from || !options.gradient.to || !options.gradient.type)) {
      errors.push("Gradient must be null or an object with 'from', 'to', and 'type' properties.");
    }
  }

  if (options.shape && typeof options.shape !== 'string') {
    errors.push("Shape must be a string.");
  }

  if (options.cornerShape && typeof options.cornerShape !== 'string') {
    errors.push("Corner shape must be a string.");
  }

  if (options.cornerDotShape && typeof options.cornerDotShape !== 'string') {
    errors.push("Corner dot shape must be a string.");
  }

  if (options.frameStyle && typeof options.frameStyle !== 'string') {
    errors.push("Frame style must be a string.");
  }

  if (options.modulePattern && typeof options.modulePattern !== 'string') {
    errors.push("Module pattern must be a string.");
  }

  if (options.logoSize !== undefined && (typeof options.logoSize !== 'number' || options.logoSize < 0 || options.logoSize > 0.5)) {
    errors.push("Logo size must be a number between 0 and 0.5.");
  }

  if (options.errorCorrection && typeof options.errorCorrection !== 'string' && !['L', 'M', 'Q', 'H'].includes(options.errorCorrection)) {
    errors.push("Error correction must be one of 'L', 'M', 'Q', 'H'.");
  }

  if (options.useProfilePhoto !== undefined && typeof options.useProfilePhoto !== 'boolean') {
    errors.push("Use profile photo must be a boolean.");
  }

  return errors;
};

export const getQrStyles = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { profileId } = req.params;

    if (!user) {
        return res.status(401).json({ message: "Authentication required." });
    }

    let profile;
    if (user.role === 'admin') {
        profile = await Profile.findOne({ where: { id: profileId } });
    } else {
        profile = await Profile.findOne({ where: { id: profileId, user_id: user.id } });
    }

    if (!profile) {
      return res.status(404).json({ message: "Profile not found or you do not have permission to access it." });
    }

    const qrStyles = await QrStyle.findAll({
      where: { profile_id: profileId },
    });

    res.json(qrStyles);
  } catch (error: unknown) {
    let message = "Server error while fetching QR styles.";
    if (error instanceof Error) {
      message = error.message;
      console.error("GET QR STYLES ERROR:", error.message);
    } else {
      console.error("GET QR STYLES ERROR:", error);
    }
    res.status(500).json({ message, error: String(error) });
  }
};

export const createQrStyle = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { profileId } = req.params;
    const { name, options } = req.body;

    if (!user) {
        return res.status(401).json({ message: "Authentication required." });
    }

    let profile;
    if (user.role === 'admin') {
        profile = await Profile.findOne({ where: { id: profileId } });
    } else {
        profile = await Profile.findOne({ where: { id: profileId, user_id: user.id } });
    }

    if (!profile) {
      return res.status(404).json({ message: "Profile not found or you do not have permission to access it." });
    }

    // Validate input
    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "QR style name is required." });
    }

    const validationErrors = validateQrOptions(options);
    if (validationErrors.length > 0) {
      return res.status(400).json({ message: "Invalid QR options.", errors: validationErrors });
    }

    const qrStyle = await QrStyle.create({
      id: randomUUID(),
      profile_id: profileId,
      name: name.trim(),
      options: options,
    });

    res.status(201).json(qrStyle);
  } catch (error: unknown) {
    let message = "Server error while creating QR style.";
    if (error instanceof Error) {
      message = error.message;
      console.error("CREATE QR STYLE ERROR:", error.message);
    } else {
      console.error("CREATE QR STYLE ERROR:", error);
    }
    res.status(500).json({ message, error: String(error) });
  }
};

export const updateQrStyle = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { profileId, styleId } = req.params;
    const { name, options } = req.body;

    if (!user) {
        return res.status(401).json({ message: "Authentication required." });
    }

    let profile;
    if (user.role === 'admin') {
        profile = await Profile.findOne({ where: { id: profileId } });
    } else {
        profile = await Profile.findOne({ where: { id: profileId, user_id: user.id } });
    }

    if (!profile) {
      return res.status(404).json({ message: "Profile not found or you do not have permission to access it." });
    }

    const qrStyle = await QrStyle.findOne({
      where: { id: styleId, profile_id: profileId },
    });

    if (!qrStyle) {
      return res.status(404).json({ message: "QR style not found or does not belong to profile." });
    }

    // Validate input
    if (name !== undefined) {
      if (name === null || name.trim() === "") {
        return res.status(400).json({ message: "QR style name cannot be empty." });
      }
      qrStyle.name = name.trim();
    }

    if (options !== undefined) {
      const validationErrors = validateQrOptions(options);
      if (validationErrors.length > 0) {
        return res.status(400).json({ message: "Invalid QR options.", errors: validationErrors });
      }
      qrStyle.options = options;
    }

    await qrStyle.save();

    res.json(qrStyle);
  } catch (error: unknown) {
    let message = "Server error while updating QR style.";
    if (error instanceof Error) {
      message = error.message;
      console.error("UPDATE QR STYLE ERROR:", error.message);
    } else {
      console.error("UPDATE QR STYLE ERROR:", error);
    }
    res.status(500).json({ message, error: String(error) });
  }
};

export const deleteQrStyle = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { profileId, styleId } = req.params;

    if (!user) {
        return res.status(401).json({ message: "Authentication required." });
    }

    let profile;
    if (user.role === 'admin') {
        profile = await Profile.findOne({ where: { id: profileId } });
    } else {
        profile = await Profile.findOne({ where: { id: profileId, user_id: user.id } });
    }

    if (!profile) {
      return res.status(404).json({ message: "Profile not found or you do not have permission to access it." });
    }

    const qrStyle = await QrStyle.findOne({
      where: { id: styleId, profile_id: profileId },
    });

    if (!qrStyle) {
      return res.status(404).json({ message: "QR style not found or does not belong to profile." });
    }

    await qrStyle.destroy();

    res.json({ message: "QR style deleted successfully." });
  } catch (error: unknown) {
    let message = "Server error while deleting QR style.";
    if (error instanceof Error) {
      message = error.message;
      console.error("DELETE QR STYLE ERROR:", error.message);
    } else {
      console.error("DELETE QR STYLE ERROR:", error);
    }
    res.status(500).json({ message, error: String(error) });
  }
};
