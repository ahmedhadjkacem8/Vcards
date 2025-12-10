import { Router } from "express";
import {
  getProfileByUserId,
  getProfiles,
  updateProfile,
  createProfile,
  uploadProfileImage,
  getProfileById,
  getMyProfile,
} from "../controllers/profileController";

import { authenticate } from "../middlewares/authMiddleware";
import { addEmail, getEmails, updateEmail, deleteEmail } from "../controllers/profileEmailController";
import { addPhone, deletePhone, getPhones, updatePhone } from "../controllers/profilePhoneController";
import { addAddress, getAddresses, updateAddress, deleteAddress } from "../controllers/profileAddressController";
import {
  addSocialLink,
  deleteSocialLink,
  getSocialLinks,
  updateSocialLink,
} from "../controllers/profileSocialLinkController";
import { getGallery } from "../controllers/profileGalleryController";
import { upload } from "../middlewares/upload";


const router = Router();

// ---- ROUTES NON DYNAMIQUES EN PREMIER ----
router.get("/me", authenticate, getMyProfile);

router.get("/", getProfiles);   
router.post("/", authenticate, createProfile);
router.get("/:id", getProfileById); 

// ---- ROUTES AVEC /:id MAIS SPÉCIFIQUES AVANT LE CATCH-ALL ----
router.get("/:id/emails", getEmails);
router.get("/:id/phones", getPhones);
router.get("/:id/addresses", getAddresses);
router.get("/:id/social-links", getSocialLinks);
router.get("/:id/gallery", getGallery);

// ---- ROUTE CATCH-ALL EN DERNIER ----
router.put("/:id", authenticate, updateProfile);


router.post("/:id/emails", authenticate, addEmail);
router.post("/:id/phones", authenticate , addPhone);
router.post("/:id/addresses", authenticate, addAddress);
router.post("/:id/social-links",authenticate ,addSocialLink);




// Mettre à jour un phone
router.patch("/phones/:id", updatePhone);
router.delete("/phones/:id", deletePhone);

// Mettre à jour un email (partial update) + protéger
router.patch("/emails/:id", authenticate, updateEmail);
router.delete("/emails/:id", authenticate, deleteEmail);


//mettre a jour une adresse
router.patch("/addresses/:id", updateAddress);
router.delete("/addresses/:id", deleteAddress);

router.post("/:id/upload",   upload.single("file"), // Le champ 'file' envoyé par le frontend
  uploadProfileImage);

export default router;
