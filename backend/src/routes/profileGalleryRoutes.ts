import { Router } from "express";
import {
  getGallery,
  addGalleryImage,
  deleteGalleryImage,
  updateImageOrder
} from "../controllers/profileGalleryController";

import { uploadGallery } from "../middlewares/uploadGallery";
import { authenticate } from "../middlewares/authMiddleware";

const router = Router();

// GET all images for a profile
router.get("/:profileId", getGallery);

// ADD image
router.post(
  "/:profileId",
  authenticate,
  uploadGallery.single("image"),
  addGalleryImage
);

// DELETE image
router.delete("/image/:imageId", authenticate, deleteGalleryImage);

// UPDATE order
router.patch("/image/:imageId/order", authenticate, updateImageOrder);

export default router;
