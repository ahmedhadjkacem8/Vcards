import { Router } from "express";
import {
  addLocalization,
  getLocalizations,
  updateLocalization,
  deleteLocalization,
} from "../controllers/profileLocalizationController";
import { resolveMaps } from "../controllers/mapsResolverController";

const router = Router();

router.get("/profile/:profile_id", getLocalizations);
router.post("/profile/:profile_id", addLocalization);
router.post("/resolve", resolveMaps);

router.patch("/:localization_id", updateLocalization);
router.delete("/:localization_id", deleteLocalization);

export default router;
