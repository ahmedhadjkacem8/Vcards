import { Router } from "express";
import { addSocialLink, deleteSocialLink, getSocialLinks, updateSocialLink } from "../controllers/profileSocialLinkController";
import { authenticate } from "../middlewares/authMiddleware";

const router = Router();

router.get("/:profile_id", getSocialLinks);
router.post("/", addSocialLink);


// Mettre à jour un social link
router.patch("/:linkId", authenticate, updateSocialLink);
router.delete("/:linkId", authenticate, deleteSocialLink);

export default router;
