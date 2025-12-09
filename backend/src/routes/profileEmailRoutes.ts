import { Router } from "express";
import { addEmail, getEmails, updateEmail, deleteEmail } from "../controllers/profileEmailController";

const router = Router();


router.get("/:profile_id", getEmails);
router.post("/", addEmail);

// RESTful PATCH/DELETE for emails by id
router.patch("/:id", updateEmail);
router.delete("/:id", deleteEmail);

export default router;
