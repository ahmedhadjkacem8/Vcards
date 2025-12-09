import { Request, Response } from "express";
import { Profile, ProfileAddress, ProfileEmail, ProfilePhone, ProfileSocialLink, SocialPlatform, User } from "../models";
import path from "path";


interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
  };
}


// -------------------
// Lister tous les profils
// GET /profiles?visibility=public
// -------------------
export const getProfiles = async (req: Request, res: Response) => {
  try {
    const { visibility } = req.query;

    const where: any = {};
    if (visibility) where.visibility = visibility;

    const profiles = await Profile.findAll({
      where,
      include: [
        { model: User, as: "user", attributes: ["id", "email"] }
      ],
    });

    res.json(profiles);
  } catch (err) {
    console.error("Erreur getProfiles:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// -------------------
// Récupérer un profil par ID
// GET /profiles/:id
// -------------------
export const getProfileByUserId = async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const profile = await Profile.findOne({
      where: { user_id: userId },
      include: [
        { model: User, as: "user", attributes: ["id", "email"] },
        { model: ProfileSocialLink, include: [SocialPlatform] },
        { model: ProfileEmail },
        { model: ProfilePhone },
        { model: ProfileAddress },
      ],
    });

    if (!profile)
      return res.status(404).json({ message: "Profile not found" });

    res.json(profile);
  } catch (err) {
    console.error("Erreur getProfileByUserId:", err);
    res.status(500).json({ message: "Server error" });
  }
};



export const getProfileById = async (req: Request, res: Response) => {
  const { id } = req.params; // l'id du profil
  try {
    const profile = await Profile.findOne({
      where: { id },
      include: [{ model: User, as: "user", attributes: ["id", "email"] }],
    });

    if (!profile) return res.status(404).json({ message: "Profil non trouvé" });

    res.json(profile);
  } catch (err) {
    console.error("Erreur getProfileById:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// -------------------
// Mettre à jour un profil
// PUT /profiles/:id
// -------------------
export const updateProfile = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { display_name, bio, avatar_url, cover_url, primary_color, secondary_color, tier, visibility } = req.body;

  try {
    const profile = await Profile.findByPk(id);
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    await profile.update({ display_name, bio, avatar_url, cover_url, primary_color, secondary_color, tier, visibility });

    res.json(profile);
  } catch (err) {
    console.error("Erreur updateProfile:", err);
    res.status(500).json({ message: "Server error" });
  }
};



/* ============================================================
   POST /profiles
   Créer un profil (user authentifié seulement)
============================================================ */
export const createProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: "Unauthorized" });

    const userId = req.user.id;
    const { display_name, bio, avatar_url, cover_url, primary_color, secondary_color } = req.body;

    // Vérifier si user a déjà un profil
    const existing = await Profile.findOne({ where: { user_id: userId } });
    if (existing) {
      return res.status(400).json({ message: "Profile already exists" });
    }

    const profile = await Profile.create({
      user_id: userId,
      display_name: display_name || "New User",
      bio: bio || "",
      avatar_url: avatar_url || null,
      cover_url: cover_url || null,
      primary_color: primary_color || "#4F46E5",
      secondary_color: secondary_color || "#EC4899",
      tier: "free",
      visibility: "public",
    });

    res.json({ message: "Profile created", profile });
  } catch (err: any) {
    console.error("[PROFILE CREATE ERROR]", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};




// -------------------
// Récupérer le profil de l'utilisateur connecté
// GET /profiles/me
// -------------------
export const getMyProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const profile = await Profile.findOne({
      where: { user_id: userId },
      include: [
        { model: User, as: "user", attributes: ["id", "email"] },
        { model: ProfileSocialLink, include: [SocialPlatform] },
        { model: ProfileEmail },
        { model: ProfilePhone },
        { model: ProfileAddress },
      ],
    });

    if (!profile) return res.status(404).json({ message: "Profile not found" });

    res.json(profile);
  } catch (err) {
    console.error("Erreur getMyProfile:", err);
    res.status(500).json({ message: "Server error" });
  }
};






export const uploadProfileImage = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { type } = req.body; // avatar | cover
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: "Fichier manquant" });
  }

  try {
    const profile = await Profile.findByPk(id);
    if (!profile) return res.status(404).json({ message: "Profil non trouvé" });

    // URL publique ou chemin relatif
    const fileUrl = `/uploads/${file.filename}`;

    if (type === "avatar") {
      profile.avatar_url = fileUrl;
    } else if (type === "cover") {
      profile.cover_url = fileUrl;
    } else {
      return res.status(400).json({ message: "Type invalide" });
    }

    await profile.save();

    res.json({ message: "Image uploadée avec succès", fileUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};