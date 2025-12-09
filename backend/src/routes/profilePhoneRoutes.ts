import { Router } from "express";
import { addPhone, getPhones, updatePhone, deletePhone } from "../controllers/profilePhoneController";

const router = Router();


router.get("/:profile_id", getPhones);
router.post("/", addPhone);

// RESTful PATCH/DELETE for phones by id
router.patch("/:id", updatePhone);
router.delete("/:id", deletePhone);

export default router;
