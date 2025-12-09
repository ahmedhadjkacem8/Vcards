import { Router } from "express";
import {
  getQrStyles,
  createQrStyle,
  updateQrStyle,
  deleteQrStyle,
} from "../controllers/qrStyleController";
import { authenticate } from "../middlewares/authMiddleware";

const router = Router();

router.use(authenticate);

// GET all QR styles for a profile
router.get("/:profileId/qr-styles", getQrStyles);

// POST a new QR style for a profile
router.post("/:profileId/qr-styles", createQrStyle);

// PUT (update) a QR style for a profile
router.put("/:profileId/qr-styles/:styleId", updateQrStyle);

// DELETE a QR style for a profile
router.delete("/:profileId/qr-styles/:styleId", deleteQrStyle);

export default router;