import { Router } from "express";
import {
  addLocalization,
  getLocalizations,
  updateLocalization,
  deleteLocalization,
  expandUrl,
} from "../controllers/profileLocalizationController";

const router = Router();

router.get("/profile/:profile_id", getLocalizations);
router.post("/profile/:profile_id", addLocalization);

router.patch("/:localization_id", updateLocalization);
router.delete("/:localization_id", deleteLocalization);


router.post("/expand-url", expandUrl);
export default router;
