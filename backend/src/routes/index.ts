import { Router } from "express";
import authRoutes from "./authRoutes";
import profileRoutes from "./profileRoutes";
import profileEmailRoutes from "./profileEmailRoutes";
import profilePhoneRoutes from "./profilePhoneRoutes";
import profileAddressRoutes from "./profileAddressRoutes";
import profileSocialLinkRoutes from "./profileSocialLinkRoutes";
import profileGalleryRoutes from "./profileGalleryRoutes";
import profileFavoriteRoutes from "./profileFavoriteRoutes";
import profileLocalizationRoutes from "./profileLocalizationRoutes";
import qrStyleRoutes from "./qrStyleRoutes"; // Import qrStyleRoutes
import favoriteRoutes from "./favoritesRoutes"; // Import favoriteRoutes
import socialPlateformRoutes from "./socialPlateformRoutes"; // Import socialPlateformRoutes
import companyRoutes from "./companyRoutes"; // Import companyRoutes


const router = Router();

router.use("/auth", authRoutes);
router.use("/profiles", profileRoutes);
router.use("/emails", profileEmailRoutes);
router.use("/profile-phones", profilePhoneRoutes);
router.use("/profile-addresses", profileAddressRoutes);
router.use("/profile-social-links", profileSocialLinkRoutes);
router.use("/gallery", profileGalleryRoutes);
router.use("/profile-favorites", profileFavoriteRoutes);
router.use("/profile-localizations", profileLocalizationRoutes);
router.use("/profiles", qrStyleRoutes); // Register qrStyleRoutes under /profiles base path

// Add new routes
router.use("/favorites", favoriteRoutes);
router.use("/social_platforms", socialPlateformRoutes);
router.use("/companies", companyRoutes);
router.use("/social-links", profileSocialLinkRoutes); // Ensure this is explicitly mounted if it was in server.ts
router.use("/localisations", profileLocalizationRoutes); // Ensure this is explicitly mounted if it was in server.ts


export default router;
