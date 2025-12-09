import { Request, Response } from "express";
import { ProfileGallery } from "../models";

// -----------------------------------------------
// GET GALLERY
// -----------------------------------------------
export const getGallery = async (req: Request, res: Response) => {
  try {
    const profileId = req.params.profileId;
    if (!profileId) return res.status(400).json({ message: "profileId requis" });

    const images = await ProfileGallery.findAll({
      where: { profile_id: profileId },
      order: [["display_order", "ASC"]],
    });

    res.json(images || []);
  } catch (err) {
    console.error("Erreur getGallery:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// -----------------------------------------------
// ADD IMAGE WITH LIMIT 5
// -----------------------------------------------
export const addGalleryImage = async (req: Request, res: Response) => {
  try {
    const profileId = req.params.profileId;

    if (!req.file)
      return res.status(400).json({ message: "Aucune image envoyée" });

    // Vérifier combien d’images sont déjà présentes
    const count = await ProfileGallery.count({
      where: { profile_id: profileId },
    });

    if (count >= 5) {
      return res
        .status(400)
        .json({ message: "Limite atteinte : maximum 5 images par profil" });
    }

    const imageUrl = `/uploads/gallery/${req.file.filename}`;

    const last = await ProfileGallery.findOne({
      where: { profile_id: profileId },
      order: [["display_order", "DESC"]],
    });

    const nextOrder = last ? last.display_order + 1 : 0;

    const newImage = await ProfileGallery.create({
      profile_id: profileId,
      image_url: imageUrl,
      display_order: nextOrder,
    });

    res.json(newImage);
  } catch (err: any) {
    console.error(err);

    // Erreurs multer
    if (err.message.includes("File too large")) {
      return res.status(400).json({ message: "Image trop volumineuse (max 5MB)" });
    }

    if (err.message.includes("Format invalide")) {
      return res.status(400).json({ message: "Format non autorisé (images uniquement)" });
    }

    res.status(500).json({ message: "Erreur serveur" });
  }
};

// -----------------------------------------------
// DELETE IMAGE
// -----------------------------------------------
export const deleteGalleryImage = async (req: Request, res: Response) => {
  try {
    const imageId = req.params.imageId;

    const image = await ProfileGallery.findByPk(imageId);
    if (!image) return res.status(404).json({ message: "Image non trouvée" });

    await image.destroy();

    res.json({ message: "Image supprimée" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// -----------------------------------------------
// UPDATE ORDER
// -----------------------------------------------
export const updateImageOrder = async (req: Request, res: Response) => {
  try {
    const imageId = req.params.imageId;
    const { display_order } = req.body;

    const image = await ProfileGallery.findByPk(imageId);
    if (!image) return res.status(404).json({ message: "Image non trouvée" });

    image.display_order = display_order;
    await image.save();

    res.json({ message: "Ordre mis à jour" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
